import logging
import math
import pickle
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Any, List, Sequence

import pandas as pd
from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel, ConfigDict, Field


logger = logging.getLogger(__name__)

PROJECT_ROOT = Path(__file__).resolve().parent.parent
MODEL_PATH = PROJECT_ROOT / "model.pkl"

CATEGORICAL_DEFAULTS = {
    "city_tier": "Tier 2",
    "age_group": "25-34",
    "acquisition_channel": "Organic",
    "loyalty_tier": "Silver",
    "preferred_category": "Skin Care",
    "marketing_consent": "Yes",
}

NUMERIC_FEATURES = [
    "recency_days",
    "frequency_180d",
    "monetary_180d",
    "return_rate_180d",
    "avg_discount_pct_180d",
    "avg_rating_180d",
    "category_diversity_180d",
    "ticket_count_90d",
    "negative_ticket_rate_90d",
    "avg_resolution_hours_90d",
    "days_since_signup",
    "sessions_30d",
    "product_views_30d",
    "cart_adds_30d",
    "wishlist_adds_30d",
    "abandoned_carts_30d",
    "email_opens_30d",
    "campaign_clicks_30d",
    "last_visit_days_ago",
]

FEATURE_COLUMNS = [*CATEGORICAL_DEFAULTS.keys(), *NUMERIC_FEATURES]

model: Any | None = None


class CustomerFeatures(BaseModel):
    model_config = ConfigDict(extra="forbid")

    city_tier: str = Field(CATEGORICAL_DEFAULTS["city_tier"], min_length=1)
    age_group: str = Field(CATEGORICAL_DEFAULTS["age_group"], min_length=1)
    acquisition_channel: str = Field(
        CATEGORICAL_DEFAULTS["acquisition_channel"],
        min_length=1,
    )
    loyalty_tier: str = Field(CATEGORICAL_DEFAULTS["loyalty_tier"], min_length=1)
    preferred_category: str = Field(
        CATEGORICAL_DEFAULTS["preferred_category"],
        min_length=1,
    )
    marketing_consent: str = Field(
        CATEGORICAL_DEFAULTS["marketing_consent"],
        min_length=1,
    )

    recency_days: int = Field(..., ge=0)
    frequency_180d: int = Field(..., ge=0)
    monetary_180d: float = Field(..., ge=0)
    return_rate_180d: float = Field(..., ge=0, le=1)
    avg_discount_pct_180d: float = Field(..., ge=0, le=1)
    avg_rating_180d: float = Field(..., ge=1, le=5)
    category_diversity_180d: int = Field(..., ge=0)
    ticket_count_90d: int = Field(..., ge=0)
    negative_ticket_rate_90d: float = Field(..., ge=0, le=1)
    avg_resolution_hours_90d: float = Field(..., ge=0)
    days_since_signup: int = Field(..., ge=0)
    sessions_30d: int = Field(..., ge=0)
    product_views_30d: int = Field(..., ge=0)
    cart_adds_30d: int = Field(..., ge=0)
    wishlist_adds_30d: int = Field(..., ge=0)
    abandoned_carts_30d: int = Field(..., ge=0)
    email_opens_30d: int = Field(..., ge=0)
    campaign_clicks_30d: int = Field(..., ge=0)
    last_visit_days_ago: int = Field(..., ge=0)


class BatchCustomerRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    customers: List[CustomerFeatures] = Field(..., min_length=1)


def validate_model_features(loaded_model: Any) -> None:
    feature_names = getattr(loaded_model, "feature_names_in_", None)

    if feature_names is None:
        return

    model_features = list(feature_names)
    missing_from_api = [column for column in model_features if column not in FEATURE_COLUMNS]
    unused_api_fields = [column for column in FEATURE_COLUMNS if column not in model_features]

    if missing_from_api or unused_api_fields:
        raise RuntimeError(
            "Model/API feature mismatch. "
            f"Missing from API: {missing_from_api or 'none'}. "
            f"Unused API fields: {unused_api_fields or 'none'}."
        )


def load_model_artifact(path: Path = MODEL_PATH) -> Any:
    if not path.is_file():
        raise RuntimeError(
            f"Model artifact was not found at {path}. "
            "Run train_model.py or copy model.pkl into the project root."
        )

    try:
        with path.open("rb") as file:
            loaded_model = pickle.load(file)
    except Exception as exc:
        logger.exception("Failed to load model artifact from %s", path)
        raise RuntimeError(f"Unable to load model artifact from {path}") from exc

    if not hasattr(loaded_model, "predict_proba"):
        raise RuntimeError("Loaded model does not expose predict_proba.")

    validate_model_features(loaded_model)
    return loaded_model


@asynccontextmanager
async def lifespan(_: FastAPI):
    global model

    model = load_model_artifact()
    logger.info("Loaded churn model from %s", MODEL_PATH)

    yield

    model = None


app = FastAPI(
    title="D2C Customer Churn Prediction API",
    description="Production API for customer churn risk scoring",
    version="1.0.0",
    lifespan=lifespan,
)


def get_model() -> Any:
    if model is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Model is not loaded. Try again after the service finishes startup.",
        )

    return model


def expected_feature_columns() -> list[str]:
    if model is not None:
        feature_names = getattr(model, "feature_names_in_", None)
        if feature_names is not None:
            return list(feature_names)

    return FEATURE_COLUMNS


def prepare_dataframe(customers: Sequence[CustomerFeatures]) -> pd.DataFrame:
    records = []

    for customer in customers:
        record = {**CATEGORICAL_DEFAULTS, **customer.model_dump()}
        records.append(record)

    dataframe = pd.DataFrame.from_records(records)
    feature_columns = expected_feature_columns()
    missing_columns = [column for column in feature_columns if column not in dataframe.columns]

    if missing_columns:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Missing required model features: {missing_columns}",
        )

    return dataframe.loc[:, feature_columns]


def generate_risk_response(probability: float) -> dict:
    if probability >= 0.70:
        risk = "High"
        explanation = (
            "Very high churn likelihood detected. "
            "Immediate personalized retention outreach is recommended."
        )
    elif probability >= 0.40:
        risk = "Medium"
        explanation = (
            "Moderate churn risk detected. "
            "Monitor engagement and consider targeted retention campaigns."
        )
    else:
        risk = "Low"
        explanation = (
            "Customer currently shows healthy engagement patterns "
            "and limited churn indicators."
        )

    return {
        "churn_probability": round(probability, 4),
        "predicted_class": int(probability >= 0.5),
        "risk_level": risk,
        "risk_explanation": explanation,
    }


def extract_churn_probabilities(probabilities: Any, expected_count: int) -> list[float]:
    try:
        churn_probabilities = [float(row[1]) for row in probabilities]
    except (TypeError, ValueError, IndexError) as exc:
        logger.exception("Model returned an invalid probability payload")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Prediction failed because the model returned an invalid probability format.",
        ) from exc

    if len(churn_probabilities) != expected_count:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Prediction failed because the model returned an unexpected number of rows.",
        )

    invalid_probabilities = [
        probability
        for probability in churn_probabilities
        if not math.isfinite(probability) or probability < 0 or probability > 1
    ]

    if invalid_probabilities:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Prediction failed because the model returned probabilities outside [0, 1].",
        )

    return churn_probabilities


def score_customers(customers: Sequence[CustomerFeatures]) -> list[dict]:
    loaded_model = get_model()
    dataframe = prepare_dataframe(customers)

    try:
        probabilities = loaded_model.predict_proba(dataframe)
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Model inference failed")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Prediction failed during model inference.",
        ) from exc

    churn_probabilities = extract_churn_probabilities(probabilities, len(customers))
    return [generate_risk_response(probability) for probability in churn_probabilities]


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "model_loaded": model is not None,
    }


@app.post("/predict")
def predict(customer: CustomerFeatures):
    return score_customers([customer])[0]


@app.post("/batch_predict")
def batch_predict(request: BatchCustomerRequest):
    predictions = score_customers(request.customers)

    return {
        "total_customers": len(predictions),
        "predictions": predictions,
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )
