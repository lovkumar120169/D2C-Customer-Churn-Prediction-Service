# D2C Customer Churn Prediction Service

A full-stack machine learning application that predicts customer churn risk for D2C e-commerce businesses.

The project combines a **scikit-learn churn prediction model**, a **FastAPI backend**, and a **React + Vite + Tailwind frontend** to provide real-time and batch customer churn predictions through an interactive risk dashboard.

The system allows users to enter individual customer behavioral data, select built-in test customers, or upload a CSV file containing multiple customers for batch prediction.

---

## 🚀 Project Highlights

**D2C Customer Churn Prediction Service | Python | scikit-learn | FastAPI | Docker**

* Framed customer churn as a **binary classification task** to flag high-risk D2C e-commerce customers for retention teams.
* Built a **production-ready FastAPI scoring API** returning churn probability, risk category, and human-readable retention explanations.
* Achieved approximately **0.86 ROC-AUC** and served real-time inference in **under 150 ms per request**, with batch scoring for **10k+ customers**.
* Added **Pydantic validation, automated API tests, and Docker-based reproducible deployment** with production monitoring guidelines.

---

# 📌 Project Overview

Customer churn is a major challenge for D2C e-commerce businesses. Identifying customers who are likely to stop purchasing allows retention teams to prioritize personalized interventions before the customer becomes inactive.

This project addresses the problem by using customer behavioral and engagement signals to predict the likelihood of churn.

The solution provides:

* Individual customer churn prediction
* Churn probability score
* Predicted churn class
* Low / Medium / High risk classification
* Human-readable retention recommendations
* Built-in test customers for quick demonstrations
* CSV-based batch prediction
* Pydantic request validation
* Automated API testing
* Docker-based backend deployment
* Production monitoring guidelines
* Interactive React dashboard

---

# 🏗️ System Architecture

```text
                         D2C Customer Churn
                          Prediction Service
                                  │
                 ┌────────────────┴────────────────┐
                 │                                 │
                 ▼                                 ▼
        ┌──────────────────┐              ┌──────────────────┐
        │   d2c-churn-ui   │              │ d2c-churn-backend│
        │                  │              │                  │
        │ React + Vite     │   HTTP API   │ FastAPI          │
        │ Tailwind CSS     │ ───────────► │ Pydantic         │
        │                  │              │ scikit-learn     │
        └────────┬─────────┘              └────────┬─────────┘
                 │                                 │
                 │                                 ▼
                 │                        ┌──────────────────┐
                 │                        │   model.pkl      │
                 │                        │ ML Churn Model   │
                 │                        └──────────────────┘
                 │
                 ▼
        ┌──────────────────┐
        │ Prediction Result│
        │                  │
        │ Probability      │
        │ Risk Level       │
        │ Explanation      │
        └──────────────────┘
```

---

# 📁 Repository Structure

```text
D2C-Customer-Churn-Prediction-Service/
│
├── d2c-churn-backend/
│   ├── app/
│   │   └── main.py
│   │
│   ├── tests/
│   │   └── test_api.py
│   │
│   ├── model.pkl
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── monitoring_plan.md
│   └── README.md
│
├── d2c-churn-ui/
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   ├── api.js
│   │   ├── schema.js
│   │   ├── index.css
│   │   │
│   │   ├── components/
│   │   │   ├── ChurnForm.jsx
│   │   │   ├── Fields.jsx
│   │   │   ├── RiskGauge.jsx
│   │   │   └── ResultPanel.jsx
│   │   │
│   │   └── data/
│   │       └── testCustomers.js
│   │
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js
│   ├── .env.example
│   └── README.md
│
└── README.md
```

---

# 🧠 Machine Learning Problem

The project frames customer churn as a **binary classification problem**.

The model predicts whether a customer is likely to churn based on behavioral, transactional, customer-service, and engagement signals.

The prediction produces:

```text
Churn Probability
        ↓
Predicted Class
        ↓
Risk Category
        ↓
Retention Explanation
```

Example:

```json
{
  "churn_probability": 0.82,
  "predicted_class": 1,
  "risk_level": "High",
  "risk_explanation": "Very high churn likelihood detected. Immediate personalized retention outreach is recommended."
}
```

---

# 📊 Customer Features

The model uses customer behavioral and engagement signals such as:

### Purchase Behavior

* Purchase recency
* Purchase frequency
* Monetary value
* Return rate
* Average discount percentage
* Average customer rating
* Category diversity

### Customer Support

* Support ticket count
* Negative ticket rate
* Average resolution time

### Customer Lifecycle

* Days since signup
* Sessions
* Last visit

### Website Engagement

* Product views
* Cart additions
* Wishlist additions
* Abandoned carts

### Marketing Engagement

* Email opens
* Campaign clicks

These features are validated using the backend's Pydantic schema.

---

# 🖥️ Frontend

The frontend is built using:

* React
* Vite
* Tailwind CSS
* JavaScript
* REST API integration

The dashboard provides an interactive interface for running churn predictions.

## Individual Prediction

Users can manually enter customer information and click:

**Run churn score**

The dashboard displays:

* Churn probability
* Risk category
* Animated risk gauge
* Risk explanation

---

# 👤 Built-in Test Customers

Entering all customer attributes manually can be time-consuming when demonstrating the project.

To make the application easier to test, the frontend includes a collapsible **Test Customers** section.

Users can:

```text
Open Test Customers
        ↓
Select a built-in customer
        ↓
Customer information is loaded automatically
        ↓
Run churn score
        ↓
View prediction
```

The predefined customer profiles are stored in:

```text
d2c-churn-ui/src/data/testCustomers.js
```

This allows anyone reviewing the project to test the application without manually filling in every field.

---

# 📁 Batch Prediction

The application also supports **batch churn prediction**.

Users can upload a CSV file containing multiple customer records instead of entering customers individually.

### Workflow

```text
CSV File
   ↓
Upload
   ↓
Frontend processes customer data
   ↓
POST /batch_predict
   ↓
FastAPI Backend
   ↓
ML Model
   ↓
Predictions
```

This functionality is designed for larger customer datasets and supports batch scoring for **10k+ customers**.

---

# ⚙️ Backend

The backend is built using:

* Python
* FastAPI
* Pydantic
* scikit-learn
* Uvicorn
* Pytest
* Docker

The backend exposes REST API endpoints for:

```text
GET  /health
POST /predict
POST /batch_predict
```

FastAPI also provides interactive API documentation:

```text
/docs
```

The detailed backend documentation is available in:

```text
d2c-churn-backend/README.md
```

---

# 🔌 API Flow

### Single Customer

```text
React Frontend
      │
      │ POST /predict
      ▼
FastAPI
      │
      ▼
Pydantic Validation
      │
      ▼
scikit-learn Model
      │
      ▼
Prediction
      │
      ▼
React Risk Dashboard
```

### Multiple Customers

```text
CSV Upload
     │
     ▼
React Frontend
     │
     │ POST /batch_predict
     ▼
FastAPI
     │
     ▼
Validation
     │
     ▼
ML Model
     │
     ▼
Batch Predictions
```

---

# 🚀 Local Development

## Prerequisites

Make sure you have installed:

* Python 3.x
* Node.js
* npm
* Git
* Docker *(optional for local container testing)*

---

# 1. Clone the Repository

```bash
git clone https://github.com/<your-username>/D2C-Customer-Churn-Prediction-Service.git

cd D2C-Customer-Churn-Prediction-Service
```

---

# 2. Start the Backend

Navigate to the backend:

```bash
cd d2c-churn-backend
```

Create a virtual environment.

### Windows

```bash
python -m venv venv
venv\Scripts\activate
```

### Linux / macOS

```bash
python3 -m venv venv
source venv/bin/activate
```

Install dependencies:

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

Start FastAPI:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Backend:

```text
http://localhost:8000
```

Swagger documentation:

```text
http://localhost:8000/docs
```

Health check:

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

# 3. Start the Frontend

Open another terminal and navigate to:

```bash
cd d2c-churn-ui
```

Install dependencies:

```bash
npm install
```

Create the environment file:

```bash
cp .env.example .env
```

For Windows, you can create `.env` manually if `cp` is unavailable.

Set:

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

---

# 🔐 CORS Configuration

The FastAPI backend must allow requests from the frontend.

The backend should include CORS configuration similar to:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://your-project.netlify.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

Replace the Netlify URL with the actual deployed frontend URL.

---

# 🐳 Docker

The backend includes a Dockerfile for reproducible deployment.

Build the backend image:

```bash
cd d2c-churn-backend

docker build -t churn-api .
```

Run the container:

```bash
docker run -p 8000:8000 churn-api
```

The API will be available at:

```text
http://localhost:8000
```

---

# ☁️ Production Deployment

The project uses separate deployment platforms for the backend and frontend.

```text
Frontend
   │
   ▼
Netlify
   │
   │ HTTPS API Requests
   ▼
Render
   │
   ▼
FastAPI + ML Model
```

## Backend — Render

The FastAPI backend can be deployed on **Render** using the existing Dockerfile.

The Dockerfile starts the application using:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

After deployment, the backend will have a URL similar to:

```text
https://d2c-churn-api.onrender.com
```

Verify:

```text
https://d2c-churn-api.onrender.com/health
```

and:

```text
https://d2c-churn-api.onrender.com/docs
```

---

# 🌐 Frontend — Netlify

The React frontend is deployed on **Netlify**.

Build configuration:

```text
Build command: npm run build
Publish directory: dist
```

Production environment variable:

```env
VITE_API_URL=https://your-render-backend.onrender.com
```

After deployment, Netlify provides a URL similar to:

```text
https://your-project.netlify.app
```

The Netlify URL must also be added to the FastAPI CORS configuration.

---

# 🧪 Automated Testing

The backend includes an automated Pytest test suite.

Run:

```bash
cd d2c-churn-backend

pytest -v
```

Tests cover:

* Health endpoint
* Single customer prediction
* Pydantic input validation
* Batch prediction functionality

---

# 📈 Model Performance

The churn prediction model achieved approximately:

| Metric              |          Result |
| ------------------- | --------------: |
| ROC-AUC             |           ~0.86 |
| Real-time inference | <150 ms/request |
| Batch scoring       |  10k+ customers |

These metrics describe the current project implementation and may vary depending on the deployment environment, hardware, dataset, and request workload.

---

# 🛡️ Responsible Use

Churn predictions are probability estimates and should not be treated as guaranteed customer outcomes.

The predictions should be used as **decision-support signals** alongside:

* Customer history
* Business context
* CRM information
* Retention team judgment

The model should not be used as the sole factor for customer treatment decisions, exclusion policies, or automated financial incentives.

---

# 🔮 Future Improvements

Potential future enhancements include:

* MLflow-based model versioning
* Automated model retraining
* Data drift monitoring
* Feature drift detection
* Kubernetes deployment
* Authentication and API rate limiting
* Real-time monitoring dashboards
* CRM integration
* Automated retention workflows
* Customer-level prediction history
* Advanced batch prediction analytics

---

# 🧰 Technology Stack

### Machine Learning

* Python
* scikit-learn
* Pandas
* NumPy

### Backend

* FastAPI
* Pydantic
* Uvicorn
* Pytest

### Frontend

* React
* Vite
* Tailwind CSS
* JavaScript

### Deployment

* Docker
* Render
* Netlify

### Development

* Git
* GitHub
* REST API
* Swagger / OpenAPI

---

# 📂 Component Responsibilities

| Component               | Responsibility                            |
| ----------------------- | ----------------------------------------- |
| `d2c-churn-backend`     | ML model serving and prediction API       |
| `app/main.py`           | FastAPI application and API endpoints     |
| `model.pkl`             | Serialized churn prediction model         |
| `tests/test_api.py`     | Backend API tests                         |
| `d2c-churn-ui`          | Interactive React dashboard               |
| `App.jsx`               | Frontend application state and layout     |
| `api.js`                | Backend API communication                 |
| `schema.js`             | Customer field definitions and validation |
| `components/`           | Reusable UI components                    |
| `data/testCustomers.js` | Built-in customer test profiles           |

---

# 🎯 Project Objective

The objective of this project is to demonstrate an end-to-end machine learning deployment workflow:

```text
Customer Data
      ↓
Feature Validation
      ↓
Machine Learning Model
      ↓
Churn Probability
      ↓
Risk Classification
      ↓
Retention Explanation
      ↓
Interactive Dashboard
```

The project combines **machine learning, backend API development, frontend engineering, automated testing, containerization, and cloud deployment** into a single production-oriented application.

---

# 👨‍💻 Project Summary

**D2C Customer Churn Prediction Service** is a full-stack ML application designed to help D2C e-commerce retention teams identify customers at elevated risk of churn.

It combines a scikit-learn classification model with a FastAPI scoring service and a React-based dashboard. The platform supports both individual and batch predictions, while built-in test customers make the application easy to demonstrate.

The project demonstrates the complete path from **machine learning model → API → frontend → Docker → cloud deployment**.

---

# 📌 Repository

```text
D2C-Customer-Churn-Prediction-Service/
```

### Backend

```text
d2c-churn-backend/
```

### Frontend

```text
d2c-churn-ui/
```

---

# ⭐ Key Takeaways

* End-to-end ML deployment
* Binary customer churn classification
* ~0.86 ROC-AUC
* <150 ms real-time inference
* Batch scoring for 10k+ customers
* FastAPI REST API
* React + Vite dashboard
* Built-in test customer profiles
* CSV batch prediction
* Pydantic validation
* Automated API tests
* Dockerized backend
* Render deployment
* Netlify deployment
* Production monitoring guidelines
* Responsible AI considerations
