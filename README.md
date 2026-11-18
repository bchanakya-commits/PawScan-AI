# Creature Classifier

## Live website (open this, upload a photo, press Predict)
https://paw-scan-ai.vercel.app

Note: the first prediction can take about 1 minute because the free server is sleeping. Please wait, then try again.

Backend status: https://pawscan-ai-bltr.onrender.com/health
# PawScan AI

Upload a photo and a MobileNetV2 model (TensorFlow/Keras) predicts **Cat**, **Dog** or **Bird**
and shows the confidence for all three classes.
*AI-Based Image Classification using Deep Learning (Cats, Dogs and Birds), Samsung internship project.*

```
animal-classifier/
├── backend/                   <- Python FastAPI server (goes to Render)
│   ├── main.py                <- the API
│   ├── check_model.py         <- optional: compares preprocessing modes on one image
│   ├── requirements.txt
│   └── model/
│       ├── animal_classifier.keras   <- YOUR model (already included, unchanged)
│       └── class_names.json          <- ["Cat", "bird", "dog"] (already included, unchanged)
├── frontend/                  <- React + Vite website (goes to Vercel)
│   └── src/config.js          <- change the website title here
├── render.yaml
└── README.md
```

## What was verified (so you know what is solid)

Your notebook was read and the real model file was tested:

- TensorFlow **2.21.0** in Colab, so `requirements.txt` pins **2.21.0**.
- `mobilenet_v2.preprocess_input` is **inside your saved model** (notebook cell 9). The backend therefore sends
  raw 0-255 pixels (`PREPROCESS_MODE=none`, the default). On a real cat photo this gave Cat 99.86%;
  the other two modes gave about 75%, which would silently hurt your results. **Do not change this setting.**
- Images are resized to 224 x 224 with bilinear interpolation, the same as `image_dataset_from_directory`
  in training. The backend output matched that training-style pipeline to within 0.03 percentage points.
- The model, class order and `class_names.json` were not modified.

## IMPORTANT: security

Your notebook contains your **Roboflow API key** in plain text (cell 1). Do not upload the notebook
to GitHub or share it. Go to Roboflow > Settings > API Keys and regenerate the key. This project does not contain it.

---

## PART 1 - Install the tools (macOS)

Open **Terminal** (Cmd+Space, type "Terminal").

1. Install Homebrew from https://brew.sh (skip if `brew --version` works).
2. ```bash
   brew install python@3.12 node git
   ```
   Use Python **3.12** (TensorFlow 2.21 works with it; very new Python versions may not).
3. Install **VS Code** from https://code.visualstudio.com, then open it and install the "Python" extension.

## PART 2 - Open the project

1. Unzip `animal-classifier.zip` (double-click it in Finder).
2. In VS Code: File > Open Folder > choose `animal-classifier`.
3. Check that `backend/model/` contains `animal_classifier.keras` and `class_names.json`.
   They are already there. If you ever replace them, put the new files in that folder.

## PART 3 - Run the backend on your Mac

In VS Code: Terminal > New Terminal. Then:

```bash
cd backend
python3.12 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

The install takes a few minutes (TensorFlow is large). When it works you will see:
`Loaded model animal_classifier.keras; classes = ['Cat', 'bird', 'dog']; preprocess = none`

Open http://localhost:8000/health in your browser. You need `"model_loaded": true`.
Leave this terminal running.

## PART 4 - Run the website on your Mac

Open a **second** terminal (the + button) and run:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Open http://localhost:5173, upload a photo, press **Predict**.
The pill under the title should say "Model online".

## PART 5 - Change the website title

Open `frontend/src/config.js` and edit `name`, `tagline` and so on. Also change the text inside
`<title>` in `frontend/index.html` (this is the browser tab name).

## PART 6 - Put the code on GitHub

1. Create an account at https://github.com, then **New repository** named `animal-classifier`
   (Public, leave "Add README" unticked).
2. In a terminal, from the main `animal-classifier` folder (not inside backend/frontend):
   ```bash
   git init
   git add .
   git commit -m "PawScan AI image classifier"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/animal-classifier.git
   git push -u origin main
   ```
   If asked for a password, use a Personal Access Token (GitHub > Settings > Developer settings >
   Personal access tokens), or use the **GitHub Desktop** app instead.
3. On github.com check that `backend/model/animal_classifier.keras` (about 21 MB) is there. Render needs it.

## PART 7 - Deploy the backend on Render

1. Sign up at https://render.com with your GitHub account.
2. **New + > Web Service**, choose your `animal-classifier` repository.
3. Settings:
   - **Root Directory:** `backend`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Environment variables:** `PYTHON_VERSION` = `3.12.8` and `PREPROCESS_MODE` = `none`
4. Create it and wait for **Live** (the first build takes 5-10 minutes).
5. Open `https://YOUR-SERVICE.onrender.com/health`. You need `"model_loaded": true`.
   Copy that base address (no slash at the end).

Be aware:
- **Free plan memory is 512 MB.** TensorFlow may not fit. If the logs show "Out of memory" or the service
  keeps restarting, switch to the **Starter** plan, or host the `backend` folder elsewhere (e.g. Hugging Face Spaces, Docker).
- Free services **sleep after ~15 minutes**; the first request then takes about a minute. Open the site a few minutes before a demo.

## PART 8 - Deploy the frontend on Vercel

1. Sign up at https://vercel.com with GitHub.
2. **Add New > Project**, import `animal-classifier`.
3. Settings:
   - **Root Directory:** `frontend`
   - **Environment Variable:** `VITE_API_URL` = your Render address, e.g. `https://animal-classifier-api.onrender.com`
4. Click **Deploy**. Your public website address is shown when it finishes.

If you change `VITE_API_URL` later, press **Redeploy**.
Optional: in Render, set `ALLOWED_ORIGINS` to your Vercel address so only your site can use the API.

## Troubleshooting

- **"Server not reachable":** wait a minute and refresh (Render waking up); check `VITE_API_URL`.
- **Works locally, fails on Render:** Render > Logs, look for the line `MODEL LOAD FAILED`.
- **A non-cat/dog/bird photo gets a confident answer:** expected. The model only has three classes.

## API

`POST /predict` with a form field named `file` returns this shape (values are an illustration):
```json
{ "predicted_class": "Cat", "confidence": 99.86,
  "probabilities": [ {"label": "Cat", "probability": 99.86},
                     {"label": "bird", "probability": 0.05},
                     {"label": "dog", "probability": 0.09} ] }
```
Other endpoints: `GET /health`, `GET /classes`, interactive docs at `/docs`.
