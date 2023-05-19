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


pred_data_path = "data/predicted/"


def combine_model_csvs():
    for folder in os.listdir(pred_data_path):
        if folder == "temporal" or folder == "quantity_experiments" or folder == ".DS_Store":
            continue

        feature_dir = folder
        for folder in os.listdir(os.path.join(pred_data_path, feature_dir)):
            if folder == ".DS_Store":
                continue

            response_dir = folder
            # Create an empty DataFrame to hold the combined data
            combined_df = pd.DataFrame()

            full_path = os.path.join(pred_data_path, feature_dir, response_dir)
            for folder in os.listdir(full_path):
                if os.path.isdir(os.path.join(full_path, folder)):
                    # Loop through each file in the folder
                    for file in os.listdir(os.path.join(full_path, folder)):
                        # Check if the item in the folder is a CSV file
                        if file.endswith(".PREDICTIONS.csv"):
                            # Load the CSV file into a DataFrame
                            df = pd.read_csv(os.path.join(full_path, folder, file))

                            if "set" in combined_df.columns and "set" in df.columns:
                                df.drop("set", axis=1, inplace=True)

                            # Rename the y_pred column to the name of the folder
                            df = df.rename(columns={"y_pred": folder})

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

        if "naive" in experiment_folder:
            continue

        if not re.match(r".*?0.*?15.*", experiment_folder):
            continue

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
                    os.path.join(pred_data_path, "topo_spatial_r2.csv"),
                    index=False,
                )


if __name__ == "__main__":
    combine_bar_plots_r_sqaures()
