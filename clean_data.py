import os
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


if __name__ == "__main__":
    combine_model_csvs()
