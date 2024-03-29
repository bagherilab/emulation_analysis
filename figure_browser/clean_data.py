import os
import re
import pandas as pd

# Set the folder path to the directory containing the CSV files
true_data_path = "data/true"


def remove_cols():
    # Loop through all CSV files in the folder
    for filename in os.listdir(true_data_path):
        if filename.endswith(".csv"):
            # Read in the CSV file
            filepath = os.path.join(true_data_path, filename)
            df = pd.read_csv(filepath)

            # Drop all columns except for ACTIVITY and GROWTH
            df = df[["ACTIVITY", "GROWTH", "SYMMETRY", "CYCLES"]]

            # Write the updated dataframe back to the original file
            df.to_csv(filepath, index=False)


pred_data_path = "data/predicted/stored_results"


def combine_model_csvs():
    for feature_dir in os.listdir(os.path.join(pred_data_path)):
        if feature_dir == ".DS_Store":
            continue
        for response_dir in os.listdir(os.path.join(pred_data_path, feature_dir)):
            if response_dir == ".DS_Store":
                continue

            # Create an empty DataFrame to hold the combined data
            combined_df = pd.DataFrame()

            full_path = os.path.join(pred_data_path, feature_dir, response_dir)
            print(full_path)
            for model_dir in os.listdir(full_path):
                if os.path.isdir(os.path.join(full_path, model_dir)):
                    # Loop through each file in the folder
                    for file in os.listdir(os.path.join(full_path, model_dir)):
                        # Check if the item in the folder is a CSV file
                        if file.endswith(".PREDICTIONS.csv"):
                            # Load the CSV file into a DataFrame
                            df = pd.read_csv(os.path.join(full_path, model_dir, file))

                            if "set" in combined_df.columns and "set" in df.columns:
                                df.drop("set", axis=1, inplace=True)

                            # Rename the y_pred column to the name of the folder
                            df = df.rename(columns={"y_pred": model_dir})

                            # Append the DataFrame to the combined DataFrame
                            combined_df = pd.concat([combined_df, df], axis=1)

            # Drop any duplicate index columns
            combined_df = combined_df.loc[:, ~combined_df.columns.duplicated()]
            # Save the combined DataFrame to a CSV file in the MAIN folder
            combined_df.to_csv(
                os.path.join(full_path, "combined.csv"),
                index=False,
            )


temporal_data_path = "data/predicted/temporal"
responses = ["ACTIVITY", "GROWTH", "SYMMETRY"]
models = ["MLR", "RF", "SVR", "MLP"]


def combine_temporal_r_squares():
    combined_df = pd.DataFrame()
    for response in responses:
        # Create an empty DataFrame to hold the combined data

        for experiment_folder in os.listdir(temporal_data_path):
            if experiment_folder == ".DS_Store" or experiment_folder == "temporal_r2.csv":
                continue

            if "CH" in experiment_folder:
                context = "CH"
            else:
                context = "C"

            for response_folder in os.listdir(os.path.join(temporal_data_path, experiment_folder)):
                if response_folder == ".DS_Store":
                    continue

                if response not in response_folder:
                    continue

                match = re.search(r"\d+", response_folder)
                timepoint = match.group()

                for model in models:
                    test_path = os.path.join(
                        temporal_data_path, experiment_folder, response_folder, model, "TEST"
                    )
                    train_path = os.path.join(
                        temporal_data_path, experiment_folder, response_folder, model, "TRAIN"
                    )

                    for file in os.listdir(test_path):
                        # Check if the item in the folder is a CSV file
                        if file.endswith(".csv"):
                            test_df = pd.read_csv(os.path.join(test_path, file))
                            test_df["set"] = "TEST"
                            test_df["timepoint"] = timepoint
                            test_df["model"] = model
                            test_df["context"] = context
                            test_df["response"] = response

                    for file in os.listdir(train_path):
                        # Check if the item in the folder is a CSV file
                        if file.endswith(".csv"):
                            train_df = pd.read_csv(os.path.join(train_path, file))
                            train_df["set"] = "TRAIN"
                            train_df["timepoint"] = timepoint
                            train_df["model"] = model
                            train_df["context"] = context
                            train_df["response"] = response

                    combined_df = pd.concat([combined_df, test_df, train_df])

                combined_df.to_csv(
                    os.path.join(temporal_data_path, "temporal_r2.csv"),
                    index=False,
                )


pred_data_path = "data/predicted/stored_results"


def combine_bar_plots_r_sqaures():
    combined_df = pd.DataFrame()
    experiment_folders = os.listdir(pred_data_path)
    for experiment_folder in experiment_folders:
        if (
            experiment_folder == "temporal"
            or experiment_folder == "quantity_experiments"
            or experiment_folder == ".DS_Store"
            or experiment_folder == "topo_spatial_r2.csv"
        ):
            continue

        if not re.match(r".*?0.*?15.*", experiment_folder):
            continue

        print(experiment_folder)
        feature = experiment_folder.split("_")[0]

        for response in responses:
            if "CH" in experiment_folder:
                context = "CH"
            else:
                context = "C"

            for response_folder in os.listdir(os.path.join(pred_data_path, experiment_folder)):
                if response_folder == ".DS_Store":
                    continue

                if response not in response_folder:
                    continue

                for model in models:
                    test_path = os.path.join(
                        pred_data_path, experiment_folder, response_folder, model, "TEST"
                    )
                    train_path = os.path.join(
                        pred_data_path, experiment_folder, response_folder, model, "TRAIN"
                    )

                    for file in os.listdir(test_path):
                        # Check if the item in the folder is a CSV file
                        if file.endswith(".csv"):
                            test_df = pd.read_csv(os.path.join(test_path, file))
                            test_df["set"] = "TEST"
                            test_df["model"] = model
                            test_df["context"] = context
                            test_df["response"] = response
                            test_df["feature"] = feature

                    for file in os.listdir(train_path):
                        # Check if the item in the folder is a CSV file
                        if file.endswith(".csv"):
                            train_df = pd.read_csv(os.path.join(train_path, file))
                            train_df["set"] = "TRAIN"
                            train_df["model"] = model
                            train_df["context"] = context
                            train_df["response"] = response
                            train_df["feature"] = feature

                    combined_df = pd.concat([combined_df, test_df, train_df])

    combined_df.to_csv(
        os.path.join(pred_data_path, "bar_r2.csv"),
        index=False,
    )


quantity_data_path = "data/predicted/quantity_experiments"


def combine_quantity_r_squares():
    combined_df = pd.DataFrame()
    for response in responses:
        # Create an empty DataFrame to hold the combined data

        for experiment_folder in os.listdir(quantity_data_path):
            if experiment_folder == ".DS_Store" or experiment_folder == "quantity_r2.csv":
                continue

            if "CH" in experiment_folder:
                context = "CH"
            else:
                context = "C"

            feature = experiment_folder.split("_")[0]
            timepoint = experiment_folder.split("_")[1]

            for response_folder in os.listdir(os.path.join(quantity_data_path, experiment_folder)):
                if response_folder == ".DS_Store":
                    continue

                if response not in response_folder:
                    continue

                for model in models:
                    test_path = os.path.join(
                        quantity_data_path, experiment_folder, response_folder, model, "TEST"
                    )
                    train_path = os.path.join(
                        quantity_data_path, experiment_folder, response_folder, model, "TRAIN"
                    )

                    for file in os.listdir(test_path):
                        # Check if the item in the folder is a CSV file
                        if file.endswith(".csv"):
                            test_df = pd.read_csv(os.path.join(test_path, file))
                            test_df["num_observations"] = round(test_df["num_observations"] / 0.3)
                            test_df["set"] = "TEST"
                            test_df["timepoint"] = timepoint
                            test_df["model"] = model
                            test_df["context"] = context
                            test_df["response"] = response
                            test_df["feature"] = feature

                    for file in os.listdir(train_path):
                        # Check if the item in the folder is a CSV file
                        if file.endswith(".csv"):
                            train_df = pd.read_csv(os.path.join(train_path, file))
                            train_df["num_observations"] = round(train_df["num_observations"] / 0.7)
                            train_df["set"] = "TRAIN"
                            train_df["timepoint"] = timepoint
                            train_df["model"] = model
                            train_df["context"] = context
                            train_df["response"] = response
                            train_df["feature"] = feature

                    combined_df = pd.concat([combined_df, test_df, train_df])

                combined_df.to_csv(
                    os.path.join(quantity_data_path, "quantity_r2.csv"),
                    index=False,
                )


ci_path = "data/predicted/quant_8.csv"
formatted_path = "data/predicted/quant_8_formatted.csv"


def explode_ci():
    data = pd.read_csv(ci_path)
    train_data = data.copy()
    train_data["set"] = "TRAIN"
    test_data = data.copy()
    test_data["set"] = "TEST"

    train_data["r2_mean"] = train_data["train_r2_mean"]
    train_data["r2_se_lower"] = train_data["train_r2_mean"] - train_data["train_r2_se"]
    train_data["r2_se_upper"] = train_data["train_r2_mean"] + train_data["train_r2_se"]
    test_data["r2_mean"] = test_data["test_r2_mean"]
    test_data["r2_se_lower"] = test_data["test_r2_mean"] - test_data["test_r2_se"]
    test_data["r2_se_upper"] = test_data["test_r2_mean"] + test_data["test_r2_se"]

    train_data["rmse_mean"] = train_data["train_rmse_mean"]
    train_data["rmse_se_lower"] = train_data["train_rmse_mean"] - train_data["train_rmse_se"]
    train_data["rmse_se_upper"] = train_data["train_rmse_mean"] + train_data["train_rmse_se"]
    test_data["rmse_mean"] = test_data["test_rmse_mean"]
    test_data["rmse_se_lower"] = test_data["test_rmse_mean"] - test_data["test_rmse_se"]
    test_data["rmse_se_upper"] = test_data["test_rmse_mean"] + test_data["test_rmse_se"]

    # Concatenate train and test dataframes
    new_data = pd.concat([train_data, test_data], ignore_index=True)

    new_data.drop(
        columns=["train_r2_mean", "test_r2_mean", "train_rmse_mean", "test_rmse_mean"], inplace=True
    )
    new_data.drop(
        columns=["train_r2_se", "test_r2_se", "train_rmse_se", "test_rmse_se"], inplace=True
    )

    # Save the transformed data to a new CSV file
    new_data.to_csv(formatted_path, index=False)


features = ["topo"]
responses = ["ACTIVITY", "GROWTH", "SYMMETRY"]
timepoints = [8]
contexts = ["C", "CH"]
synthetic_path = "data/predicted/stored_results/"


def parity_plot_data():
    combined_data = pd.DataFrame()
    for feature in features:
        for response in responses:
            for time in timepoints:
                # pred_data_path_C = (
                #     synthetic_path
                #     + feature
                #     + "_"
                #     + str(time)
                #     + "_metric_15_C/COUPLED-C-"
                #     + response
                #     + "/combined.csv"
                # )
                pred_data_path_C = (
                    synthetic_path
                    + feature
                    + "_0_metric_"
                    + str(time)
                    + "_C/COUPLED-C-"
                    + response
                    + "/combined.csv"
                )

                true_data_path_C = (
                    synthetic_path
                    + feature
                    + "_0_metric_"
                    + str(time)
                    + "_C/COUPLED-C-"
                    + response
                    + "/test.csv"
                )

                C_data = pd.read_csv(true_data_path_C)

                pred_data_C = pd.read_csv(pred_data_path_C)
                pred_data_C["feature"] = feature
                pred_data_C["response"] = response
                pred_data_C["timepoint"] = time
                pred_data_C["context"] = "C"
                pred_data_C["y_true"] = C_data[response]
                pred_data_C.drop("Unnamed: 0", axis=1, inplace=True)

                pred_data_path_CH = (
                    synthetic_path
                    + feature
                    + "_0_metric_"
                    + str(time)
                    + "_CH/COUPLED-CHX-"
                    + response
                    + "/combined.csv"
                )

                true_data_path_CH = (
                    synthetic_path
                    + feature
                    + "_0_metric_"
                    + str(time)
                    + "_CH/COUPLED-CHX-"
                    + response
                    + "/test.csv"
                )

                CH_data = pd.read_csv(true_data_path_CH)

                pred_data_CH = pd.read_csv(pred_data_path_CH)
                pred_data_CH["feature"] = feature
                pred_data_CH["response"] = response
                pred_data_CH["timepoint"] = time
                pred_data_CH["context"] = "CH"
                pred_data_CH["y_true"] = CH_data[response]
                pred_data_CH.drop("Unnamed: 0", axis=1, inplace=True)

                true_and_pred_combined = pd.concat([pred_data_C, pred_data_CH])
                combined_data = pd.concat([combined_data, true_and_pred_combined])

    combined_data.to_csv("data/predicted/tp8_parity.csv", index=False)


def format_parity():
    df = pd.read_csv("data/predicted/tp8_parity.csv")
    id_vars = [
        "context",
        "set",
        "feature",
        "response",
        "timepoint",
        "y_true",
    ]
    value_vars = ["SVR", "MLR", "RF", "MLP"]

    # Reshape the dataframe
    melted_df = pd.melt(df, id_vars=id_vars, value_vars=value_vars, var_name="model")

    melted_df = melted_df.dropna()

    # Reset the index
    melted_df = melted_df.reset_index(drop=True)
    melted_df.rename(columns={"value": "y_pred"}, inplace=True)

    melted_df.to_csv("data/predicted/tp8_parity_formatted.csv", index=False)


rnn_parity_file = "data/predicted/rnn_parity_formatted.csv"
ml_parity_file = "data/predicted/parity_formatted_r2.csv"


def combine_parity():
    rnn_df = pd.read_csv(rnn_parity_file)
    ml_df = pd.read_csv(ml_parity_file)

    c_activity_rows = ml_df[
        (ml_df["response"] == "ACTIVITY")
        & (ml_df["feature"] == "topo")
        & (ml_df["context"] == "C")
        & (ml_df["model"] == "SVR")
        & (ml_df["timepoint"] == 0)
    ]
    c_activity_rows.insert(loc=6, column="emulator", value="ml")
    c_growth_rows = ml_df[
        (ml_df["response"] == "GROWTH")
        & (ml_df["feature"] == "topo")
        & (ml_df["context"] == "C")
        & (ml_df["model"] == "RF")
        & (ml_df["timepoint"] == 0)
    ]
    c_growth_rows.insert(loc=6, column="emulator", value="ml")
    c_symmetry_rows = ml_df[
        (ml_df["response"] == "SYMMETRY")
        & (ml_df["feature"] == "topo")
        & (ml_df["context"] == "C")
        & (ml_df["model"] == "MLR")
        & (ml_df["timepoint"] == 0)
    ]
    c_symmetry_rows.insert(loc=6, column="emulator", value="ml")
    ch_activity_rows = ml_df[
        (ml_df["response"] == "ACTIVITY")
        & (ml_df["feature"] == "topo")
        & (ml_df["context"] == "CH")
        & (ml_df["model"] == "RF")
        & (ml_df["timepoint"] == 0)
    ]
    ch_activity_rows.insert(loc=6, column="emulator", value="ml")
    ch_growth_rows = ml_df[
        (ml_df["response"] == "GROWTH")
        & (ml_df["feature"] == "topo")
        & (ml_df["context"] == "CH")
        & (ml_df["model"] == "SVR")
        & (ml_df["timepoint"] == 0)
    ]
    ch_growth_rows.insert(loc=6, column="emulator", value="ml")
    ch_symmetry_rows = ml_df[
        (ml_df["response"] == "SYMMETRY")
        & (ml_df["feature"] == "topo")
        & (ml_df["context"] == "CH")
        & (ml_df["model"] == "RF")
        & (ml_df["timepoint"] == 0)
    ]
    ch_symmetry_rows.insert(loc=6, column="emulator", value="ml")

    rnn_df = rnn_df.append(
        [
            c_activity_rows,
            c_growth_rows,
            c_symmetry_rows,
            ch_activity_rows,
            ch_growth_rows,
            ch_symmetry_rows,
        ]
    )
    rnn_df.to_csv("data/predicted/rnn_parity_full.csv", index=False)


if __name__ == "__main__":
    # combine_model_csvs()
    # combine_bar_plots_r_sqaures()
    explode_ci()
    # format_floats()
    # parity_plot_data()
    # format_parity()
    # combine_parity()
