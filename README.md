# D2C Customer Churn Prediction FastAPI Service

## 1. Project Overview

This project provides a production-ready FastAPI application that exposes a machine learning churn prediction model as an internal scoring API for CRM systems.

The objective is to identify customers with a high probability of churn so retention teams can prioritize outreach, improve customer experience, and optimize retention spending.

The API accepts customer behavioral features, performs real-time model inference, and returns:

- Churn probability score.
- Predicted churn class.
- Customer risk category.
- Human-readable retention explanation.

The application includes:

- FastAPI-based REST endpoints.
- Pydantic input validation.
- Scikit-learn model loading.
- Batch prediction capability.
- Automated API tests.
- Docker-based reproducible deployment.
- Production monitoring guidelines.

---

# 2. Repository Structure

```
d2c-churn-fastapi-service/
│
├── app/
│   └── main.py                 # FastAPI application and prediction endpoints
│
├── tests/
│   └── test_api.py             # Automated API test suite
│
├── model.pkl                   # Trained churn prediction model artifact
│
├── Dockerfile                  # Container deployment configuration
│
├── requirements.txt            # Python dependencies
│
├── monitoring_plan.md          # Production monitoring strategy
│
└── README.md                   # Project documentation
```

---

# 3. Model and Dataset Information

The model was trained using the D2C customer churn dataset provided in the capstone project.

The final model uses customer behavioral and engagement features, including:

- Purchase recency and frequency.
- Customer spending behavior.
- Return patterns.
- Discount sensitivity.
- Support interaction history.
- Website and campaign engagement signals.

The serialized model artifact (`model.pkl`) is loaded dynamically when the FastAPI service starts.

---

# 4. Local Installation and Setup

## Step 1: Clone the Repository

```bash
git clone https://github.com/<your-username>/d2c-churn-fastapi-service.git

cd d2c-churn-fastapi-service
```

---

## Step 2: Create a Virtual Environment

### Windows

```bash
python -m venv venv

venv\Scripts\activate
```

### Linux or macOS

```bash
python3 -m venv venv

source venv/bin/activate
```

---

## Step 3: Install Required Dependencies

```bash
pip install --upgrade pip

pip install -r requirements.txt
```

---

# 5. Running the FastAPI Application

Start the application using Uvicorn:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

After successful startup, the API will be available at:

```
http://localhost:8000
```

Interactive API documentation is available at:

```
http://localhost:8000/docs
```

---

# 6. API Endpoint Documentation

## GET /health

Checks whether the API service is running successfully.

### Example Request

```http
GET http://localhost:8000/health
```

### Example Response

```json
{
    "status": "ok",
    "model_loaded": true
}
```

---

## POST /predict

Generates a churn prediction for a single customer.

### Example Request

```json
{
    "recency_days": 60,
    "frequency_180d": 2,
    "monetary_180d": 1500.75,
    "return_rate_180d": 0.25,
    "avg_discount_pct_180d": 0.30,
    "avg_rating_180d": 3.8,
    "category_diversity_180d": 2,
    "ticket_count_90d": 3,
    "negative_ticket_rate_90d": 0.60,
    "avg_resolution_hours_90d": 24.5,
    "days_since_signup": 365,
    "sessions_30d": 5,
    "product_views_30d": 12,
    "cart_adds_30d": 1,
    "wishlist_adds_30d": 0,
    "abandoned_carts_30d": 4,
    "email_opens_30d": 1,
    "campaign_clicks_30d": 0,
    "last_visit_days_ago": 25
}
```

### Example Response

```json
{
    "churn_probability": 0.82,
    "predicted_class": 1,
    "risk_level": "High",
    "risk_explanation": "Very high churn likelihood detected. Immediate personalized retention outreach is recommended."
}
```

---

## POST /batch_predict

Returns churn predictions for multiple customers in one request.

### Example Request

```json
{
    "customers": [
        {
            "recency_days": 45,
            "frequency_180d": 5,
            "monetary_180d": 4500.0,
            "return_rate_180d": 0.10,
            "avg_discount_pct_180d": 0.15,
            "avg_rating_180d": 4.5,
            "category_diversity_180d": 4,
            "ticket_count_90d": 1,
            "negative_ticket_rate_90d": 0.20,
            "avg_resolution_hours_90d": 8,
            "days_since_signup": 500,
            "sessions_30d": 18,
            "product_views_30d": 65,
            "cart_adds_30d": 7,
            "wishlist_adds_30d": 5,
            "abandoned_carts_30d": 1,
            "email_opens_30d": 10,
            "campaign_clicks_30d": 5,
            "last_visit_days_ago": 3
        }
    ]
}
```

### Example Response

```json
{
    "total_customers": 1,
    "predictions": [
        {
            "churn_probability": 0.15,
            "predicted_class": 0,
            "risk_level": "Low",
            "risk_explanation": "Customer currently shows healthy engagement patterns and limited churn indicators."
        }
    ]
}
```

---

# 7. Running Automated Tests

Execute all API test cases using Pytest:

```bash
pytest -v
```

The test suite validates:

- API health endpoint functionality.
- Successful single customer predictions.
- Pydantic validation for invalid inputs.
- Batch prediction processing.

---

# 8. Running the Application Using Docker

## Step 1: Build Docker Image

```bash
docker build -t churn-api .
```

---

## Step 2: Run Docker Container

```bash
docker run -p 8000:8000 churn-api
```

The application will be accessible at:

```
http://localhost:8000
```

---

# 9. Reproducibility Notes

The project is fully reproducible because it includes:

- Version-pinned Python dependencies.
- A serialized machine learning model artifact.
- Automated test cases.
- Containerized Docker deployment.
- Clear installation and execution instructions.

Any developer can clone the repository, install dependencies, and start the API without modifying source code.

---

# 10. Responsible Use Statement

Churn predictions represent probability estimates rather than guaranteed customer outcomes.

Retention teams should use the API output as a decision-support tool alongside customer history, business context, and human judgment.

The model should not be used as the only factor for customer treatment decisions, exclusion, or automated financial incentives.

---

# 11. Future Improvements

Potential production enhancements include:

- Model versioning with MLflow.
- Continuous data drift monitoring.
- Automated retraining pipelines.
- Cloud deployment using Kubernetes.
- Authentication and rate limiting.
- Real-time monitoring dashboards.

---

# Conclusion

This FastAPI churn scoring service demonstrates a complete production-oriented machine learning deployment workflow.

The system combines machine learning inference, API engineering, automated testing, Docker reproducibility, monitoring practices, and responsible AI guidelines suitable for an enterprise CRM environment.