import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_squared_error

from sklearn.linear_model import ElasticNet
from sklearn.neural_network import MLPRegressor
from sklearn.ensemble import RandomForestRegressor
from sklearn.svm import SVR
from sklearn.svm import LinearSVR

from sklearn.model_selection import GridSearchCV

import warnings
from sklearn.exceptions import ConvergenceWarning

warnings.filterwarnings("ignore", category=ConvergenceWarning)


random_seed = 42
np.random.seed(random_seed)


TARGETS = ["ACTIVITY", "GROWTH", "SYMMETRY"]
CONTEXTS = ["C", "CH"]
FEATURE_SET = "spatial"
REPLICATES = 1

METRIC_TP = 15.0

DATE = "072323"

context_list = ["C", "CH"]
response_list = ["ACTIVITY", "GROWTH", "SYMMETRY"]
model_list = ["MLR", "RF", "SVR", "MLP"]
model_map = {
    "ElasticNet": "MLR",
    "RandomForestRegressor": "RF",
    "SVR": "SVR",
    "MLPRegressor": "MLP",
}


def main():
    naive_features = [
        "RADIUS",
        "LENGTH",
        "WALL",
        "SHEAR",
        "CIRCUM",
        "FLOW",
        "NODES",
        "EDGES",
        "GRADIUS",
        "GDIAMETER",
        "AVG_ECCENTRICITY",
        "AVG_SHORTEST_PATH",
        "AVG_IN_DEGREES",
        "AVG_OUT_DEGREES",
        "AVG_DEGREE",
        "AVG_CLUSTERING",
        "AVG_CLOSENESS",
        "AVG_BETWEENNESS",
        "AVG_CORENESS",
    ]
    topo_features = naive_features + [
        "GRADIUS:FLOW",
        "GDIAMETER:FLOW",
        "AVG_ECCENTRICITY:FLOW",
        "AVG_SHORTEST_PATH:FLOW",
        "AVG_CLOSENESS:FLOW",
        "AVG_BETWEENNESS:FLOW",
        "GRADIUS:WALL",
        "GDIAMETER:WALL",
        "AVG_ECCENTRICITY:WALL",
        "AVG_SHORTEST_PATH:WALL",
        "AVG_CLOSENESS:WALL",
        "AVG_BETWEENNESS:WALL",
        "GRADIUS:SHEAR",
        "GDIAMETER:SHEAR",
        "AVG_ECCENTRICITY:SHEAR",
        "AVG_SHORTEST_PATH:SHEAR",
        "AVG_CLOSENESS:SHEAR",
        "AVG_BETWEENNESS:SHEAR",
        "GRADIUS:RADIUS",
        "GDIAMETER:RADIUS",
        "AVG_ECCENTRICITY:RADIUS",
        "AVG_SHORTEST_PATH:RADIUS",
        "AVG_CLOSENESS:RADIUS",
        "AVG_BETWEENNESS:RADIUS",
        "GRADIUS:PRESSURE_AVG",
        "GDIAMETER:PRESSURE_AVG",
        "AVG_ECCENTRICITY:PRESSURE_AVG",
        "AVG_SHORTEST_PATH:PRESSURE_AVG",
        "AVG_CLOSENESS:PRESSURE_AVG",
        "AVG_BETWEENNESS:PRESSURE_AVG",
        "GRADIUS:PRESSURE_DELTA",
        "GDIAMETER:PRESSURE_DELTA",
        "AVG_ECCENTRICITY:PRESSURE_DELTA",
        "AVG_SHORTEST_PATH:PRESSURE_DELTA",
        "AVG_CLOSENESS:PRESSURE_DELTA",
        "AVG_BETWEENNESS:PRESSURE_DELTA",
        "GRADIUS:OXYGEN_AVG",
        "GDIAMETER:OXYGEN_AVG",
        "AVG_ECCENTRICITY:OXYGEN_AVG",
        "AVG_SHORTEST_PATH:OXYGEN_AVG",
        "AVG_CLOSENESS:OXYGEN_AVG",
        "AVG_BETWEENNESS:OXYGEN_AVG",
        "GRADIUS:OXYGEN_DELTA",
        "GDIAMETER:OXYGEN_DELTA",
        "AVG_ECCENTRICITY:OXYGEN_DELTA",
        "AVG_SHORTEST_PATH:OXYGEN_DELTA",
        "AVG_CLOSENESS:OXYGEN_DELTA",
        "AVG_BETWEENNESS:OXYGEN_DELTA",
    ]
    spatial_features = topo_features + [
        "GRADIUS:INVERSE_DISTANCE",
        "GDIAMETER:INVERSE_DISTANCE",
        "AVG_ECCENTRICITY:INVERSE_DISTANCE",
        "AVG_SHORTEST_PATH:INVERSE_DISTANCE",
        "AVG_CLOSENESS:INVERSE_DISTANCE",
        "AVG_BETWEENNESS:INVERSE_DISTANCE",
        "AVG_ECCENTRICITY_WEIGHTED",
        "AVG_CLOSENESS_WEIGHTED",
        "AVG_CORENESS_WEIGHTED",
        "AVG_BETWEENNESS_WEIGHTED",
        "AVG_OUT_DEGREES_WEIGHTED",
        "AVG_IN_DEGREES_WEIGHTED",
        "AVG_DEGREE_WEIGHTED",
    ]

    results = pd.DataFrame()

    for context in context_list:
        TRAIN_DATA_PATH = f"{FEATURE_SET}/TRAIN_{context}-synthetic_data-{DATE}.csv"
        TEST_DATA_PATH = f"{FEATURE_SET}/TEST_{context}-synthetic_data-{DATE}.csv"
        train_data = pd.read_csv(TRAIN_DATA_PATH)
        test_data = pd.read_csv(TEST_DATA_PATH)

        if FEATURE_SET == "naive":
            features = naive_features
        if FEATURE_SET == "topo":
            features = topo_features
        if FEATURE_SET == "spatial":
            features = spatial_features

        if context == "C":
            remove_list = [
                "AVG_BETWEENNESS:SHEAR",
                "AVG_BETWEENNESS:PRESSURE_DELTA",
                "AVG_BETWEENNESS:OXYGEN_DELTA",
                "LAYOUT",
            ]
        if context == "CH":
            remove_list = [
                "GRADIUS:FLOW",
                "GDIAMETER:FLOW",
                "AVG_ECCENTRICITY:FLOW",
                "AVG_SHORTEST_PATH:FLOW",
                "AVG_CLOSENESS:FLOW",
                "AVG_BETWEENNESS:FLOW",
                "AVG_BETWEENNESS:SHEAR",
                "AVG_BETWEENNESS:PRESSURE_DELTA",
                "AVG_BETWEENNESS:OXYGEN_DELTA",
                "LAYOUT",
            ]

        features = [f for f in features if f not in remove_list]

        # Get only the features we want in the training and test data
        X_train = train_data[features]
        X_test = test_data[features]

        for response in response_list:
            print(f"Context: {context}, Response: {response}")
            y_train = train_data[response]
            y_test = test_data[response]
            models = []

            c_mlr_hypers = {
                "model__alpha": [0.001, 0.01, 0.1, 1.0],
                "model__l1_ratio": [0.1, 0.2, 0.5, 0.8, 1.0],
                "model__max_iter": [20000],
            }
            mlr_regressor = Pipeline([("scaler", StandardScaler()), ("model", ElasticNet())])
            best_mlr = grid_search(mlr_regressor, c_mlr_hypers, X_train, y_train)
            models.append(best_mlr)

            c_rf_hypers = {
                "model__n_estimators": [1, 13, 25, 50, 100],
                "model__max_features": [0.01, 0.1, 0.5, 1.0],
                "model__max_depth": [None, 10, 20, 50, 100],
                "model__min_samples_split": [0.01, 0.1, 0.5, 1.0],
                "model__min_samples_leaf": [0.01, 0.1, 0.5, 0.9],
                "model__bootstrap": [True, False],
            }
            rf_regressor = Pipeline(
                [("scaler", StandardScaler()), ("model", RandomForestRegressor())]
            )
            best_rf = grid_search(rf_regressor, c_rf_hypers, X_train, y_train)
            models.append(best_rf)

            c_svr_hypers = (
                {
                    "model__C": [0.1, 1.0, 10.0, 25.0, 50.0, 100.0],
                    "model__epsilon": [0.001, 0.01, 0.1, 0.5, 1.0],
                    "model__kernel": ["rbf", "linear", "poly", "sigmoid"],
                },
            )
            svr_regressor = Pipeline([("scaler", StandardScaler()), ("model", SVR())])
            best_svr = grid_search(svr_regressor, c_svr_hypers, X_train, y_train)
            models.append(best_svr)

            c_mlp_hypers = {
                "model__alpha": [0.0001, 0.001, 0.01, 0.1, 1.0],
                "model__activation": ["identity", "logistic", "tanh", "relu"],
                "model__hidden_layer_sizes": [
                    (5,),
                    (5, 5),
                    (5, 10),
                    (25,),
                    (25, 25),
                    (25, 50),
                    (50,),
                    (50, 25),
                    (50, 50),
                ],
                "model__solver": ["lbfgs"],
                "model__max_iter": [2000],
            }
            mlp_regressor = Pipeline([("scaler", StandardScaler()), ("model", MLPRegressor())])
            best_mlp = grid_search(mlp_regressor, c_mlp_hypers, X_train, y_train)
            models.append(best_mlp)

            for pipeline in models:
                pipeline.fit(X_train, y_train)
                model = pipeline.named_steps["model"]
                print(f"Model: {model.__class__.__name__}")
                # print model hyperparameters
                print(f"Hyperparameters: {model.get_params()}")
                print(
                    f"Train R2: {pipeline.score(X_train, y_train)}, Train RMSE: {np.sqrt(mean_squared_error(y_train, pipeline.predict(X_train)))}"
                )
                print(
                    f"Test R2: {pipeline.score(X_test, y_test)}, Test RMSE: {np.sqrt(mean_squared_error(y_test, pipeline.predict(X_test)))}"
                )

                # Save results to csv
                results = results.append(
                    {
                        "context": context,
                        "response": response,
                        "model": model_map[model.__class__.__name__],
                        "train_r2": pipeline.score(X_train, y_train),
                        "train_rmse": np.sqrt(
                            mean_squared_error(y_train, pipeline.predict(X_train))
                        ),
                        "test_r2": pipeline.score(X_test, y_test),
                        "test_rmse": np.sqrt(mean_squared_error(y_test, pipeline.predict(X_test))),
                        "hyperparameters": model.get_params(),
                    },
                    ignore_index=True,
                )
    results.to_csv(f"results-{FEATURE_SET}-{DATE}.csv")


def grid_search(model, param_grid, X_train, y_train):
    with warnings.catch_warnings():
        warnings.simplefilter("ignore")
        grid_search = GridSearchCV(model, param_grid, cv=5, n_jobs=-1)
        grid_search.fit(X_train, y_train)
        return grid_search.best_estimator_


if __name__ == "__main__":
    main()
