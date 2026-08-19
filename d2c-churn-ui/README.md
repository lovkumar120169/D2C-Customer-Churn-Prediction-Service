# Churn Signal — Churn Risk Console (React frontend)

A React + Vite + Tailwind dashboard for the `D2C-Customer-Churn-Prediction-Service` FastAPI backend.

Fill in a customer's profile and behavioral signals, hit **Run churn score**, and see the churn probability on an animated risk dial with color-coded **Low / Medium / High** risk levels.

The form fields map 1:1 to `CustomerFeatures` in `app/main.py` — using the same field names and validation ranges (`ge=0`, `avg_rating_180d` 1–5, rate fields 0–1, etc.).

The application also includes **built-in test customers** for quick testing and a **Batch Prediction** feature that allows multiple customers to be scored directly from a CSV file.

---

## Features

### 🎯 Individual Churn Prediction

Enter a customer's profile and behavioral signals manually and click **Run churn score** to calculate their churn probability.

The result includes:

* Churn probability
* Risk level: **Low / Medium / High**
* Animated risk gauge
* Risk explanation
* Backend-powered prediction using the trained churn model

---

### 👤 Test Customers

The dashboard includes a collapsible **Test Customers** section containing multiple built-in customer profiles.

Instead of manually entering all the required customer fields, users can:

1. Open the **Test Customers** section.
2. Choose one of the available built-in customers.
3. Automatically load that customer's complete profile.
4. Run the churn prediction immediately.

This makes the project easier to demonstrate and test without requiring users to manually understand or enter every model feature.

The built-in customers contain different behavioral patterns so that users can quickly explore different churn-risk scenarios.

---

### 📊 Batch Prediction

The application also supports **Batch Prediction** for multiple customers.

Users can upload a CSV file containing customer data, and the application sends the records to the backend's `/batch_predict` endpoint.

The workflow is:

1. Open **Batch Prediction**.
2. Upload a CSV file containing customer records.
3. The application processes the uploaded data.
4. The backend generates churn predictions for the customers.
5. Results can be reviewed for the uploaded customer dataset.

This is useful when you want to predict churn risk for many customers instead of entering customers individually.

---

## 1. Run the backend locally

In the `D2C-Customer-Churn-Prediction-Service` repo:

```bash
python -m venv venv
source venv/bin/activate      # venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Confirm it's up:

```text
http://localhost:8000/health
```

Expected response:

```json
{
  "status": "ok",
  "model_loaded": true
}
```

---

## ⚠️ Required: Enable CORS

`app/main.py` needs to allow requests from the React frontend.

Add this immediately after `app = FastAPI(...)`:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",          # local Vite development server
        "https://your-frontend.netlify.app", # deployed Netlify frontend
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

Replace `https://your-frontend.netlify.app` with your actual Netlify deployment URL.

Commit and push this change to GitHub. CORS is required for both local development and the deployed frontend.

---

## 2. Run this frontend locally

Install the dependencies:

```bash
npm install
```

Create the environment file:

```bash
cp .env.example .env
```

The default API URL points to the local backend:

```env
VITE_API_URL=http://localhost:8000
```

Start the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:5173
```

The header status indicator turns green once `/health` responds successfully with:

```json
{
  "status": "ok",
  "model_loaded": true
}
```

---

## 3. Deploy the backend on Render

The backend can be deployed on **Render** using the existing Dockerfile.

### Steps

1. Push the backend repository to GitHub.
2. Go to Render.
3. Select **New → Web Service**.
4. Connect the `D2C-Customer-Churn-Prediction-Service` GitHub repository.
5. Render should automatically detect the `Dockerfile`.
6. Leave the build and start commands blank if the Dockerfile already contains the required startup command.
7. Select the **Free** instance for testing.
8. Deploy the service.

The Dockerfile starts FastAPI using:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

After deployment, Render will provide a URL similar to:

```text
https://d2c-churn-api.onrender.com
```

Test the deployment using:

```text
https://d2c-churn-api.onrender.com/health
```

and:

```text
https://d2c-churn-api.onrender.com/docs
```

> **Note:** Render's free service may sleep after inactivity. The first request after the service has been idle can therefore take some time while the service wakes up.

---

## 4. Point the frontend to the deployed backend

Update the frontend `.env` file:

```env
VITE_API_URL=https://d2c-churn-api.onrender.com
```

Replace the URL with your actual Render backend URL.

### Important

Vite embeds `VITE_*` environment variables during the build process. Therefore, after changing `VITE_API_URL`, you must rebuild and redeploy the frontend.

---

## 5. Deploy the frontend on Netlify

The frontend is deployed using **Netlify**.

### Steps

1. Push the frontend project to its own GitHub repository.
2. Go to Netlify.
3. Select **Add new project / Import an existing project**.
4. Connect your GitHub repository.
5. Select the React + Vite project.
6. Configure the build settings:

```text
Build command: npm run build
Publish directory: dist
```

7. Add the environment variable:

```text
VITE_API_URL=https://d2c-churn-api.onrender.com
```

8. Deploy the site.

Netlify will provide a URL similar to:

```text
https://your-project.netlify.app
```

Use your actual Netlify URL in the backend CORS configuration.

---

## 6. Update backend CORS with the Netlify URL

After the frontend is deployed, update the backend's `allow_origins`:

```python
allow_origins=[
    "http://localhost:5173",
    "https://your-project.netlify.app",
]
```

Replace `https://your-project.netlify.app` with your actual Netlify URL.

Then commit, push, and redeploy the backend.

This allows the deployed Netlify frontend to communicate with the Render backend.

---

## Project structure

```text
d2c-churn-ui/
├── index.html
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── api.js
│   ├── schema.js
│   ├── index.css
│   ├── components/
│   │   ├── ChurnForm.jsx
│   │   ├── Fields.jsx
│   │   ├── RiskGauge.jsx
│   │   └── ResultPanel.jsx
│   └── data/
│       └── testCustomers.js
├── tailwind.config.js
├── vite.config.js
└── .env.example
```

---

## Test Customers

The `testCustomers.js` file contains predefined customer profiles that can be loaded directly from the UI.

These profiles make it possible to demonstrate the application without manually entering every field required by the churn model.

A user can simply:

```text
Open Test Customers
        ↓
Select a customer
        ↓
Customer data is loaded
        ↓
Run churn score
        ↓
View churn probability and risk
```

This is especially useful for:

* Project demonstrations
* Portfolio reviews
* Testing different customer scenarios
* Quickly verifying the prediction workflow

---

## Batch Prediction

The application supports batch churn prediction through CSV upload.

The frontend uses the backend's:

```text
/batch_predict
```

endpoint to process multiple customer records.

The existing API wrapper exposes:

```javascript
batchPredictChurn
```

which can be used to send the uploaded CSV data to the backend.

This allows the application to support both:

* **Single Customer Prediction** — manually enter or load a test customer.
* **Batch Customer Prediction** — upload a CSV containing multiple customers.

---

## Validation

Client-side validation mirrors the backend's Pydantic constraints.

Examples include:

* Non-negative numeric fields
* `avg_rating_180d` between **1 and 5**
* Rate fields between **0 and 1**
* Required fields matching the backend schema

Client-side validation helps prevent invalid requests before they reach the API, while the backend remains the final source of truth.

---

## Backend API

The frontend communicates with the FastAPI backend through the following endpoints:

### Health Check

```text
GET /health
```

Used to verify that the backend is running and that the churn model has been loaded successfully.

### Single Prediction

```text
POST /predict
```

Used for individual customer churn prediction.

### Batch Prediction

```text
POST /batch_predict
```

Used to predict churn for multiple customer records.

### API Documentation

FastAPI automatically provides interactive API documentation at:

```text
/docs
```

---

## Environment Variables

Create a `.env` file in the frontend project:

```env
VITE_API_URL=http://localhost:8000
```

For production:

```env
VITE_API_URL=https://your-render-backend.onrender.com
```

Do not commit your `.env` file if it contains environment-specific or sensitive values.

---

## Deployment Architecture

```text
                    ┌─────────────────────────┐
                    │       Netlify            │
                    │    React + Vite UI       │
                    └────────────┬────────────┘
                                 │
                                 │ API Requests
                                 ▼
                    ┌─────────────────────────┐
                    │        Render            │
                    │     FastAPI Backend      │
                    │                          │
                    │  /health                 │
                    │  /predict               │
                    │  /batch_predict         │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │     Churn ML Model      │
                    └─────────────────────────┘
```

---

## Current Capabilities

| Feature                                 | Available |
| --------------------------------------- | --------- |
| Individual churn prediction             | ✅         |
| Animated churn risk gauge               | ✅         |
| Low / Medium / High risk classification | ✅         |
| Client-side validation                  | ✅         |
| Backend health monitoring               | ✅         |
| Built-in test customers                 | ✅         |
| Collapsible test customer section       | ✅         |
| CSV batch prediction                    | ✅         |
| FastAPI backend                         | ✅         |
| Docker deployment                       | ✅         |
| Render backend deployment               | ✅         |
| Netlify frontend deployment             | ✅         |

---

## Notes

* The form fields map directly to the backend's `CustomerFeatures` schema.
* Client-side validation mirrors the backend's Pydantic constraints.
* The backend remains the source of truth for validation.
* Built-in test customers make the project easier to demonstrate and test.
* Batch prediction allows multiple customer records to be processed from a CSV file.
* The frontend is deployed on **Netlify**.
* The backend is deployed on **Render**.
* `/batch_predict` is now integrated into the UI through the CSV upload workflow.
