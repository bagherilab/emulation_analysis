import os
import glob
import random
import pandas as pd
import numpy as np

os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"

from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score as r2_score_sklearn

from itertools import product
from utils import r2_score

import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import (
    GRU,
    Dropout,
    Dense,
    SimpleRNN,
    LSTM,
    Reshape,
    Masking,
    TimeDistributed,
    BatchNormalization,
    Activation,
)
from tensorflow.keras.callbacks import EarlyStopping


random_seed = 42
np.random.seed(random_seed)
tf.random.set_seed(random_seed)


TARGETS = ["ACTIVITY", "GROWTH", "SYMMETRY"]
CONTEXTS = ["C", "CH"]
FEATURE_SET = "topo"
REPLICATES = 1

# Point to folder with all dataset (0-15)
DATA_PATH = "data/ARCADE"
PLOT_DIR = f"plots/{FEATURE_SET}/"

TIMEPOINTS = list(range(16))
METRIC_TP = 15.0

EPOCHS = 50
VERBOSE = 0

DATE = "072323"


def main(targets: list[str]):
    for context in CONTEXTS:
        X, ys, layouts, seeds, features = get_data(
            DATA_PATH,
            context,
            TIMEPOINTS,
        )
        X_train, X_test, y_train, y_test = train_test_split(
            X, ys, test_size=0.2, random_state=random_seed
        )

        train_seed = X_train[:, :, -1]
        test_seed = X_test[:, :, -1]

        train_layout = X_train[:, :, -2]
        test_layout = X_test[:, :, -2]

        # Remove layout from data after splitting
        X_train = X_train[:, :, :-2].astype(np.float32)
        X_test = X_test[:, :, :-2].astype(np.float32)

        # Standardize data
        X_train_mean = X_train.mean(axis=0)
        X_train_std = X_train.std(axis=0)
        X_train_norm = (X_train - X_train_mean) / X_train_std
        X_test_norm = (X_test - X_train_mean) / X_train_std

        n_samples, n_timesteps, n_features = X_train_norm.shape

        # Save X_train and X_test to csvs
        for i in range(n_timesteps):
            # convert to dataframes
            X_train_df = pd.DataFrame(X_train_norm[:, i, :], columns=features)
            X_test_df = pd.DataFrame(X_test_norm[:, i, :], columns=features)
            # Add layout back in
            X_train_df["LAYOUT"] = train_layout[:, i]
            X_test_df["LAYOUT"] = test_layout[:, i]
            # Add seed back in
            X_train_df["SEED"] = train_seed[:, i]
            X_test_df["SEED"] = test_seed[:, i]

            X_train_df.to_csv(
                f"{context}-X_train_{i}.csv",
                index=False,
            )
            X_test_df.to_csv(
                f"{context}-X_test_{i}.csv",
                index=False,
            )

        X_test_reshaped = X_test_norm[:, 0, :].reshape(-1, 1, n_features)
        X_train_reshaped = X_train_norm[:, 0, :].reshape(-1, 1, n_features)

        # Network for sequence prediction
        best_r2 = float("-inf")

        lstm_sizes = [64, 128, 256, 512, 1024]
        activation_functions = ["relu", "tanh"]
        hidden_layer1_sizes = [64, 128, 256, 512, 1024]
        hidden_layer2_sizes = [64, 128, 256, 512, 1024]
        num_layers = [0, 1, 2, 3, 4]
        sequence_lengths = [[15, 10, 5, 3, 1], [15, 5, 3, 1], [15, 10, 5, 1]]

        for (
            lstm_size,
            hidden_layer1_size,
            hidden_layer2_size,
            num_layer,
            activation_function,
        ) in product(
            lstm_sizes,
            hidden_layer1_sizes,
            hidden_layer2_sizes,
            num_layers,
            activation_functions,
        ):
            lstm_size, h1, h2, nl, af = (
                lstm_size,
                hidden_layer1_size,
                hidden_layer2_size,
                num_layer,
                activation_function,
            )

            for sequence_length in sequence_lengths:
                model = Sequential()
                model.add(
                    Masking(
                        mask_value=0.0,
                        input_shape=(
                            None,
                            n_features,
                        ),
                    )
                )
                model.add(LSTM(lstm_size, return_sequences=False))
                model.add(Dense(h1))
                model.add(Activation(af))
                model.add(Dropout(0.2))
                for _ in range(nl):
                    model.add(Dense(h2))
                    model.add(Dropout(0.2))
                model.add(Dense(n_features, activation="linear"))
                model.compile(loss="mse", optimizer="adam", metrics=[r2_score])
                # Fit the model on provgressively shorter sequences
                for sl in sequence_length:
                    # Generate random indices with replacement
                    indices = np.random.choice(np.arange(n_samples), size=n_samples, replace=True)
                    X_train_sequence = X_train_norm[indices]
                    model.fit(
                        X_train_sequence[:, :sl, :],
                        X_train_sequence[:, 15, :],
                        validation_split=0.2,
                        callbacks=[EarlyStopping(monitor="val_loss", patience=7)],
                        verbose=VERBOSE,
                    )

                avg_train_r2 = 0.0
                avg_test_r2 = 0.0
                for i in range(REPLICATES):
                    synthetic_15_train = model.predict(X_train_reshaped, verbose=0)
                    synthetic_15_test = model.predict(X_test_reshaped, verbose=0)

                    train_r2 = r2_score_sklearn(synthetic_15_train, X_train_norm[:, 15, :])
                    test_r2 = r2_score_sklearn(synthetic_15_test, X_test_norm[:, 15, :])

                    avg_train_r2 += train_r2
                    avg_test_r2 += test_r2

                avg_train_r2 /= REPLICATES
                avg_test_r2 /= REPLICATES

                if avg_train_r2 > best_r2:
                    print(f"-{context}-")
                    best_r2 = avg_train_r2
                    print(f"Train R2 score for timepoint {15}: {round(avg_train_r2, 5)}")
                    print(f"Test R2 score for timepoint {15}: {round(avg_test_r2, 5)}")
                    print(
                        f"Best {context} model: {lstm_size}, {h1}, {h2}, {nl}, {sequence_length}, {af}"
                    )

                    # Combine train and validation data into a dataframe
                    train_synthetic_df = pd.DataFrame(synthetic_15_train, columns=features)
                    test_synthetic_df = pd.DataFrame(synthetic_15_test, columns=features)

                    # Add layout column
                    train_synthetic_df["LAYOUT"] = train_layout[:, 0]
                    test_synthetic_df["LAYOUT"] = test_layout[:, 0]

                    train_synthetic_df["SEED"] = train_seed[:, 0]
                    test_synthetic_df["SEED"] = test_seed[:, 0]

                    # Add y columns
                    for target in targets:
                        train_synthetic_df[target] = y_train[target].tolist()
                        test_synthetic_df[target] = y_test[target].tolist()

                    train_synthetic_df.to_csv(
                        f"{FEATURE_SET}/TRAIN_{context}-synthetic_data-{DATE}.csv", index=False
                    )
                    test_synthetic_df.to_csv(
                        f"{FEATURE_SET}/TEST_{context}-synthetic_data-{DATE}.csv", index=False
                    )


def get_data(data_path, context, timepoints):
    files = glob.glob(os.path.join(data_path, "*.csv"))
    if context == "C":
        files = [f for f in files if "CH" not in f]
    elif context == "CH":
        files = [f for f in files if "CH" in f]

    files = [
        f for f in files if get_timepoint(f)[0] in timepoints and get_timepoint(f)[1] == METRIC_TP
    ]

    sorted_files = sorted(files, key=lambda x: get_timepoint(x)[0])
    dfs = [pd.read_csv(f) for f in sorted_files]

    ys = dfs[0].loc[:, TARGETS]
    layout_column = dfs[0].loc[:, "LAYOUT"]
    seed_column = dfs[0].loc[:, "SEED"]

    # Get the feature set
    features = ["COMPONENTS"]
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
        "AVG_CLOSENESS",
        "AVG_BETWEENNESS",
        "AVG_IN_DEGREES",
        "AVG_OUT_DEGREES",
        "AVG_DEGREE",
        "AVG_CLUSTERING",
        "AVG_CORENESS",
    ]
    topo_features = [
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
    spatial_features = [
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

    if FEATURE_SET == "naive":
        features += naive_features
    elif FEATURE_SET == "topo":
        features += naive_features
        features += topo_features
    elif FEATURE_SET == "spatial":
        features += naive_features
        features += topo_features
        features += spatial_features

    for i in range(len(dfs)):
        dfs[i] = dfs[i].loc[:, features]

    # Remove rows with inf values
    inf_rows, inf_cols = clean_dfs(dfs, ys)

    layout_column.drop(list(inf_rows), inplace=True)
    ys.drop(list(inf_rows), inplace=True)

    for i, df in enumerate(dfs):
        df.drop(list(inf_cols), axis=1, inplace=True)
        df.drop("COMPONENTS", axis=1, inplace=True)
        df.drop(list(inf_rows), inplace=True)
        df["LAYOUT"] = layout_column
        df["SEED"] = seed_column

    data_stack = np.stack([df for df in dfs], axis=2)
    transposed_data = np.transpose(data_stack, (0, 2, 1))

    features.remove("COMPONENTS")
    features = [feat for feat in features if feat not in inf_cols]

    return transposed_data, ys, layout_column, seed_column, features


def clean_dfs(df_list, ys):
    row_indices = []
    columns = []
    for df in df_list:
        df = pd.concat([df, ys], axis=1)
        # Remove rows with multiple components
        df_copy = df.copy()
        df = df[df["COMPONENTS"] == 1]
        multiple_component_rows = df_copy[~df_copy.index.isin(df.index)]
        df.reset_index(drop=True, inplace=True)
        row_indices.append(set(multiple_component_rows.index))

        # Remove features that have inf values
        df_copy = df.copy()
        df = df.loc[:, ~(np.isnan(df).any(axis=0) | np.isinf(df)).any(axis=0)]
        removed_feature_columns = df_copy.columns[~df_copy.columns.isin(df.columns)]
        removed_feature_columns = removed_feature_columns.values.tolist()
        df.reset_index(drop=True, inplace=True)
        columns.append(set(removed_feature_columns))

        # Remove response rows with bad values
        df_copy = df.copy()
        df = df[~df.isin([np.nan, np.inf, -np.inf]).any(axis=1)]
        removed_response_rows = df_copy[~df_copy.index.isin(df.index)]
        df.reset_index(drop=True, inplace=True)
        row_indices.append(set(removed_response_rows.index))

    common_row_indices = set.union(*row_indices)
    common_column_indices = set.union(*columns)
    return common_row_indices, common_column_indices


def get_timepoint(file_path: str):
    file_name = file_path.split("/")[-1]
    feature_tp = file_name.split("_")[1]
    metric_tp = file_name.split("_")[3].split(".")[0].split("-")[0]
    return float(feature_tp), int(metric_tp)


if __name__ == "__main__":
    main(TARGETS)
