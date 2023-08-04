import pandas as pd
import numpy as np
from tensorflow.keras import backend as K
import tensorflow as tf


def load_labels(file_path: str, target: str, cutoff: int):
    data = pd.read_csv(file_path)
    train_data = data[data["SEED"] <= cutoff]
    test_data = data[data["SEED"] > cutoff]
    y_train = train_data[["KEY", "SEED", target]]
    y_test = test_data[["KEY", "SEED", target]]

    # Normalization
    max = y_train[target].abs().max()
    y_train[target] = y_train[target] / max
    y_test[target] = y_test[target] / max

    for i, row in y_train.iterrows():
        truncated_key = row["KEY"][2:]
        seed = row["SEED"]
        y_train.at[i, "KEY"] = f"{truncated_key}_{seed}.png"

    for i, row in y_test.iterrows():
        truncated_key = row["KEY"][2:]
        seed = row["SEED"]
        y_test.at[i, "KEY"] = f"{truncated_key}_{seed}.png"

    return y_train, y_test


def r2_score(y_test: list[float], y_pred: list[float]):
    SS_res = K.sum(K.square(y_test - y_pred))
    SS_tot = K.sum(K.square(y_test - K.mean(y_test)))
    return 1 - SS_res / (SS_tot)
