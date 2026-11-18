"""
AI Animal Image Classifier - FastAPI backend.

Loads the existing Keras model (backend/model/animal_classifier.keras) and the
class list (backend/model/class_names.json), then exposes:

    GET  /          -> basic info
    GET  /health    -> is the model loaded?
    GET  /classes   -> class names in model order
    POST /predict   -> upload an image, get probabilities for every class
"""
import io
import json
import os
from contextlib import asynccontextmanager
from pathlib import Path

import numpy as np
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image, ImageOps, UnidentifiedImageError

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = Path(os.getenv("MODEL_PATH", BASE_DIR / "model" / "animal_classifier.keras"))
CLASSES_PATH = Path(os.getenv("CLASSES_PATH", BASE_DIR / "model" / "class_names.json"))

IMG_SIZE = (224, 224)
MAX_UPLOAD_BYTES = 10 * 1024 * 1024  # 10 MB

# How pixels are scaled before reaching the model.
# YOUR model already contains mobilenet_v2.preprocess_input inside it (notebook cell 9),
# so the correct setting is "none": send raw 0..255 pixels. Verified on the real model.
#   none         -> raw 0..255 pixels (DEFAULT, correct for this model)
#   mobilenet_v2 -> x / 127.5 - 1     (only if preprocessing were NOT inside the model)
#   rescale      -> x / 255
PREPROCESS_MODE = os.getenv("PREPROCESS_MODE", "none").lower()


def preprocess_array(arr: np.ndarray, mode: str) -> np.ndarray:
    """arr: float32 array of pixel values 0..255, shape (224, 224, 3)."""
    if mode == "mobilenet_v2":
        return arr / 127.5 - 1.0
    if mode == "rescale":
        return arr / 255.0
    if mode == "none":
        return arr
    raise ValueError(f"Unknown PREPROCESS_MODE '{mode}'. Use mobilenet_v2, rescale or none.")


def load_class_names(path: Path) -> list[str]:
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    if isinstance(data, dict):  # e.g. {"0": "Cat", "1": "bird", "2": "dog"}
        return [str(data[k]) for k in sorted(data, key=lambda k: int(k))]
    return [str(x) for x in data]


def image_bytes_to_batch(raw: bytes, mode: str = PREPROCESS_MODE) -> np.ndarray:
    """Decode -> fix rotation -> RGB -> 224x224 (bilinear) -> preprocess -> batch of 1."""
    img = Image.open(io.BytesIO(raw))
    img = ImageOps.exif_transpose(img)
    img = img.convert("RGB")
    img = img.resize(IMG_SIZE, Image.BILINEAR)
    arr = np.asarray(img, dtype=np.float32)
    arr = preprocess_array(arr, mode)
    return np.expand_dims(arr, axis=0)  # (1, 224, 224, 3)


state: dict = {"model": None, "class_names": [], "error": None}


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        if not MODEL_PATH.exists():
            raise FileNotFoundError(f"Model file not found: {MODEL_PATH}")
        if not CLASSES_PATH.exists():
            raise FileNotFoundError(f"Class names file not found: {CLASSES_PATH}")
        preprocess_array(np.zeros((1, 1, 3), dtype=np.float32), PREPROCESS_MODE)  # validate mode

        import tensorflow as tf  # imported here so startup errors are reported clearly

        state["class_names"] = load_class_names(CLASSES_PATH)
        state["model"] = tf.keras.models.load_model(MODEL_PATH, compile=False)
        out_units = state["model"].output_shape[-1]
        if out_units != len(state["class_names"]):
            raise ValueError(
                f"Model has {out_units} outputs but class_names.json has "
                f"{len(state['class_names'])} classes."
            )
        print(f"Loaded model {MODEL_PATH.name}; classes = {state['class_names']}; "
              f"preprocess = {PREPROCESS_MODE}")
    except Exception as exc:  # keep server alive so /health can explain the problem
        state["model"] = None
        state["error"] = f"{type(exc).__name__}: {exc}"
        print("MODEL LOAD FAILED:", state["error"])
    yield


app = FastAPI(title="AI Animal Image Classifier API", version="1.0.0", lifespan=lifespan)

origins = [o.strip() for o in os.getenv("ALLOWED_ORIGINS", "*").split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"name": "AI Animal Image Classifier API", "docs": "/docs", "health": "/health"}


@app.get("/health")
def health():
    return {
        "status": "ok" if state["model"] is not None else "error",
        "model_loaded": state["model"] is not None,
        "classes": state["class_names"],
        "preprocess_mode": PREPROCESS_MODE,
        "error": state["error"],
    }


@app.get("/classes")
def classes():
    return {"classes": state["class_names"]}


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    if state["model"] is None:
        raise HTTPException(503, f"Model is not loaded. {state['error'] or ''}".strip())

    raw = await file.read()
    if not raw:
        raise HTTPException(400, "The uploaded file is empty.")
    if len(raw) > MAX_UPLOAD_BYTES:
        raise HTTPException(413, "Image is too large (max 10 MB).")

    try:
        batch = image_bytes_to_batch(raw)
    except (UnidentifiedImageError, OSError):
        raise HTTPException(400, "Could not read that file as an image. Use JPG, PNG or WEBP.")

    probs = np.asarray(state["model"].predict(batch, verbose=0))[0].astype("float64")
    if not np.isclose(probs.sum(), 1.0, atol=1e-3):  # model returned logits
        e = np.exp(probs - probs.max())
        probs = e / e.sum()

    names = state["class_names"]
    items = [{"label": n, "probability": round(float(p) * 100, 2)} for n, p in zip(names, probs)]
    top = int(np.argmax(probs))
    return {
        "predicted_class": names[top],
        "confidence": round(float(probs[top]) * 100, 2),
        "probabilities": items,  # same order as class_names.json
    }
