import pytest
from fastapi.testclient import TestClient

from app import main as app_main


client = TestClient(app_main.app)


class MockChurnModel:
    def __init__(self):
        self.frames = []

    def predict_proba(self, dataframe):
        self.frames.append(dataframe.copy())
        return [[0.25, 0.75] for _ in range(len(dataframe))]


@pytest.fixture(autouse=True)
def mock_model():
    mocked_model = MockChurnModel()
    app_main.model = mocked_model

    yield mocked_model

    app_main.model = None


valid_customer = {
    "recency_days": 45,
    "frequency_180d": 5,
    "monetary_180d": 3500.50,
    "return_rate_180d": 0.10,
    "avg_discount_pct_180d": 0.25,
    "avg_rating_180d": 4.3,
    "category_diversity_180d": 3,
    "ticket_count_90d": 2,
    "negative_ticket_rate_90d": 0.50,
    "avg_resolution_hours_90d": 12.5,
    "days_since_signup": 400,
    "sessions_30d": 15,
    "product_views_30d": 40,
    "cart_adds_30d": 6,
    "wishlist_adds_30d": 3,
    "abandoned_carts_30d": 1,
    "email_opens_30d": 8,
    "campaign_clicks_30d": 4,
    "last_visit_days_ago": 2,
}


def test_health_endpoint():
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {
        "status": "ok",
        "model_loaded": True,
    }


def test_single_prediction_success(mock_model):
    response = client.post("/predict", json=valid_customer)

    assert response.status_code == 200

    data = response.json()
    assert data["churn_probability"] == 0.75
    assert data["predicted_class"] == 1
    assert data["risk_level"] == "High"
    assert "risk_explanation" in data

    dataframe = mock_model.frames[0]
    assert dataframe.columns.tolist() == app_main.FEATURE_COLUMNS
    assert dataframe.loc[0, "city_tier"] == "Tier 2"
    assert dataframe.loc[0, "preferred_category"] == "Skin Care"


def test_invalid_customer_payload():
    invalid_customer = valid_customer.copy()
    invalid_customer["avg_rating_180d"] = 8.5

    response = client.post("/predict", json=invalid_customer)

    assert response.status_code == 422


def test_batch_prediction():
    payload = {
        "customers": [
            valid_customer,
            valid_customer,
        ]
    }

    response = client.post("/batch_predict", json=payload)

    assert response.status_code == 200

    data = response.json()
    assert data["total_customers"] == 2
    assert len(data["predictions"]) == 2
    assert data["predictions"][0]["risk_level"] == "High"
