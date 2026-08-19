# D2C Customer Churn Prediction FastAPI Service

## 1. Project Overview

This project delivers a production-ready FastAPI application that serves a machine learning churn prediction model through an internal scoring API designed for CRM and retention platforms.

The primary goal is to identify customers with an elevated likelihood of churn, enabling retention teams to prioritize interventions, enhance customer experiences, and allocate retention budgets more effectively.

The API accepts customer behavioral attributes, performs real-time model scoring, and returns:

* Churn probability score.
* Predicted churn class.
* Customer risk category.
* Human-readable retention explanation.

The application includes:

* FastAPI-based REST endpoints.
* Pydantic input validation.
* Scikit-learn model loading.
* Batch prediction capability.
* Automated API tests.
* Docker-based reproducible deployment.
* Production monitoring guidelines.

---

# 2. Repository Structure

```text
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
├── .gitignore                  # Git ignore rules for virtual environments, cache files, and local artifacts
│
├── monitoring_plan.md          # Production monitoring strategy
│
└── README.md                   # Project documentation
```

---

# 3. Model and Dataset Information

The model was developed using the D2C customer churn dataset supplied as part of the capstone project.

The final model leverages customer engagement and behavioral attributes, including:

* Purchase recency and frequency.
* Customer spending behavior.
* Return patterns.
* Discount sensitivity.
* Support interaction history.
* Website and campaign engagement signals.

The serialized model artifact (`model.pkl`) is automatically loaded when the FastAPI application starts.

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

Launch the application using Uvicorn:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Once the service starts successfully, it will be available at:

```text
http://localhost:8000
```

Interactive API documentation can be accessed at:

```text
http://localhost:8000/docs
```

---

# 6. API Endpoint Documentation

## GET /health

Verifies that the API service is operational and the model has been loaded successfully.

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

Generates a churn prediction for an individual customer.

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

Returns churn predictions for multiple customers within a single request.

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

The test suite verifies:

* Health endpoint availability.
* Successful single-customer predictions.
* Input validation through Pydantic schemas.
* Batch prediction functionality.

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

```text
http://localhost:8000
```

---

# 9. Reproducibility Notes

This project is designed to be fully reproducible and includes:

* Version-controlled Python dependencies.
* Serialized machine learning model artifacts.
* Automated test coverage.
* Containerized deployment using Docker.
* Clear installation and execution documentation.

Any developer can clone the repository, install the dependencies, and launch the API without requiring modifications to the source code.

---

# 10. Responsible Use Statement

Churn predictions should be interpreted as probability estimates rather than guaranteed customer outcomes.

Retention and CRM teams should use these predictions as decision-support inputs alongside customer history, business knowledge, and human judgment.

The model should not be used as the sole factor for customer treatment decisions, exclusion policies, or automated financial incentives.

---

# 11. Future Improvements

Potential enhancements for production environments include:

* Model version management using MLflow.
* Continuous monitoring for data drift.
* Automated retraining workflows.
* Kubernetes-based cloud deployment.
* Authentication and API rate limiting.
* Real-time operational monitoring dashboards.

---

# Conclusion

This FastAPI churn prediction service showcases a complete production-focused machine learning deployment workflow.

The solution combines predictive modeling, API development, automated testing, Docker-based reproducibility, monitoring best practices, and responsible AI principles suitable for enterprise-grade CRM and retention environments.
