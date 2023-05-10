import os
import pandas as pd

# Set the folder path to the directory containing the CSV files
folder_path = "data/true/diff"

# Loop through all CSV files in the folder
for filename in os.listdir(folder_path):
    if filename.endswith(".csv"):
        # Read in the CSV file
        filepath = os.path.join(folder_path, filename)
        df = pd.read_csv(filepath)

        # Drop all columns except for ACTIVITY and GROWTH
        df = df[["ACTIVITY", "GROWTH", "SYMMETRY", "CYCLES"]]

        # Write the updated dataframe back to the original file
        df.to_csv(filepath, index=False)
