import pickle
from pathlib import Path

import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler


PROJECT_ROOT = Path(__file__).resolve().parent
DATA_PATH = PROJECT_ROOT / "rfm_modeling_snapshot.csv"
MODEL_PATH = PROJECT_ROOT / "model.pkl"

TARGET_COLUMN = "churn_next_60d"
COLUMNS_TO_REMOVE = [
    "customer_id",
    "snapshot_date",
    TARGET_COLUMN,
    "split",
]


def build_model() -> Pipeline:
    data = pd.read_csv(DATA_PATH)

    X = data.drop(columns=COLUMNS_TO_REMOVE)
    y = data[TARGET_COLUMN]

    categorical_features = X.select_dtypes(include=["object"]).columns.tolist()
    numerical_features = X.select_dtypes(exclude=["object"]).columns.tolist()

    categorical_pipeline = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="most_frequent")),
            ("encoder", OneHotEncoder(handle_unknown="ignore")),
        ]
    )

    numerical_pipeline = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="median")),
            ("scaler", StandardScaler()),
        ]
    )

    preprocessor = ColumnTransformer(
        transformers=[
            ("categorical", categorical_pipeline, categorical_features),
            ("numerical", numerical_pipeline, numerical_features),
        ]
    )

    model_pipeline = Pipeline(
        steps=[
            ("preprocessing", preprocessor),
            (
                "classifier",
                RandomForestClassifier(
                    n_estimators=300,
                    max_depth=12,
                    min_samples_split=10,
                    random_state=42,
                    class_weight="balanced",
                    n_jobs=-1,
                ),
            ),
        ]
    )

    model_pipeline.fit(X, y)
    return model_pipeline


def main() -> None:
    model_pipeline = build_model()

    with MODEL_PATH.open("wb") as file:
        pickle.dump(model_pipeline, file)

    print("Model training completed successfully.")
    print(f"Saved artifact: {MODEL_PATH}")


if __name__ == "__main__":
    main()
