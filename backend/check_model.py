"""
Compare preprocessing modes on ONE image, to confirm which one matches training.

Usage (inside backend/, with the virtual environment active):
    python check_model.py path/to/test_image.jpg

Run the SAME image in your Colab notebook. The mode whose numbers match Colab is
the one to use as PREPROCESS_MODE.
"""
import sys

import tensorflow as tf

from main import CLASSES_PATH, MODEL_PATH, image_bytes_to_batch, load_class_names

if len(sys.argv) != 2:
    sys.exit("Usage: python check_model.py path/to/image.jpg")

model = tf.keras.models.load_model(MODEL_PATH, compile=False)
names = load_class_names(CLASSES_PATH)
with open(sys.argv[1], "rb") as f:
    raw = f.read()

print("Model input shape :", model.input_shape)
print("Model output shape:", model.output_shape)
print("Class order       :", names, "\n")
for mode in ("none", "mobilenet_v2", "rescale"):
    p = model.predict(image_bytes_to_batch(raw, mode), verbose=0)[0]
    line = "  ".join(f"{n}: {v * 100:6.2f}%" for n, v in zip(names, p))
    print(f"{mode:13s} -> {line}")
