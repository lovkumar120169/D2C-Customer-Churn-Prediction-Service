# Churn Signal — Churn Risk Console (React frontend)

A React + Vite + Tailwind dashboard for the `D2C-Customer-Churn-Prediction-Service`
FastAPI backend. Fill in a customer's profile and behavioral signals, hit
**Run churn score**, and see the churn probability on an animated risk dial,
color-coded Low / Medium / High.

The form fields map 1:1 to `CustomerFeatures` in `app/main.py` — same names,
same validation ranges (`ge=0`, `avg_rating_180d` 1–5, rate fields 0–1, etc.).

---

## 1. Run the backend locally

In the `D2C-Customer-Churn-Prediction-Service` repo:

```bash
python -m venv venv
source venv/bin/activate      # venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Confirm it's up: `http://localhost:8000/health` → `{"status":"ok","model_loaded":true}`

### ⚠️ Required: enable CORS

`app/main.py` doesn't currently allow cross-origin requests, so the browser
will block calls from this React app. Add this to `app/main.py`, right after
`app = FastAPI(...)`:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",          # local Vite dev server
        "https://your-frontend.vercel.app", # your deployed frontend, once you have it
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

Commit and push that change — it's needed both for local dev and for the
deployed version.

---

## 2. Run this frontend locally

```bash
npm install
cp .env.example .env       # defaults to http://localhost:8000
npm run dev
```

Open `http://localhost:5173`. The header dot turns green once `/health`
responds with `model_loaded: true`.

---

## 3. Deploy the backend (Render, free tier — uses your existing Dockerfile)

1. Push the CORS change to GitHub.
2. Go to [render.com](https://render.com) → **New** → **Web Service** →
   connect the `D2C-Customer-Churn-Prediction-Service` repo.
3. Render auto-detects the `Dockerfile`. Leave build/start commands blank —
   the Dockerfile already runs `uvicorn app.main:app --host 0.0.0.0 --port 8000`.
4. Instance type: Free is fine for testing (it sleeps after inactivity, so the
   first request after idle takes ~30s to wake up).
5. Deploy. You'll get a URL like `https://d2c-churn-api.onrender.com`.
6. Test it: `https://d2c-churn-api.onrender.com/health` and
   `https://d2c-churn-api.onrender.com/docs`.

**Alternatives:** Railway and Fly.io both also build directly from a
Dockerfile with a similar "connect repo → deploy" flow, if you'd rather use
one of those.

---

## 4. Point the frontend at the deployed backend

In `.env` (or directly as an environment variable on your hosting provider):

```
VITE_API_URL=https://d2c-churn-api.onrender.com
```

Rebuild/redeploy the frontend after changing this — Vite bakes `VITE_*` vars
in at build time, not runtime.

---

## 5. Deploy the frontend (Vercel)

1. Push this frontend to its own GitHub repo (or a `frontend/` folder in the
   same repo).
2. [vercel.com](https://vercel.com) → **Add New Project** → import the repo.
3. Framework preset: Vite (auto-detected). Build command `npm run build`,
   output directory `dist` (Vercel fills these in automatically).
4. Add an environment variable: `VITE_API_URL` = your Render backend URL.
5. Deploy. You'll get e.g. `https://signal-churn.vercel.app`.
6. Go back to the backend's CORS `allow_origins` list and add this exact URL,
   then redeploy the backend.

Netlify works the same way if you prefer it over Vercel.

---

## Project structure

```
d2c-churn-ui/
├── index.html
├── src/
│   ├── main.jsx           # React entry point
│   ├── App.jsx             # Layout, state, submit handling
│   ├── api.js               # fetch wrapper for /health and /predict
│   ├── schema.js            # field definitions, mirrors CustomerFeatures
│   ├── index.css            # Tailwind + design tokens
│   └── components/
│       ├── ChurnForm.jsx    # Tabbed input form
│       ├── Fields.jsx        # NumberField / SelectField
│       ├── RiskGauge.jsx     # Animated SVG risk dial
│       └── ResultPanel.jsx   # Score readout, risk badge, explanation
├── tailwind.config.js
├── vite.config.js
└── .env.example
```

## Notes

- Client-side validation mirrors the backend's Pydantic constraints (e.g.
  rates must be 0–1, ratings 1–5) so bad input is caught before the network
  call, but the backend remains the source of truth.
- "Load at-risk sample" fills the form with the exact payload you tested
  originally (all zeros / maxed-out negative signals), which the model
  reads as Medium/High risk.
- `/batch_predict` isn't wired into the UI yet — `src/api.js` already
  exports `batchPredictChurn` if you want to add a CSV-upload flow later.
