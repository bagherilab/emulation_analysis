import os
import time
import uuid
import yaml

import pandas as pd

from network.parse_network import parse_network_arcade
from output.parse_output import parse_output_arcade
from utils.reformat import format_df

DATE = "04022023"
METRIC_TPS = [8, 15]
EXCLUDE = [
    "005",
    "010",
    "015",
    "020",
    "025",
    "030",
    "035",
    "040",
    "045",
    "050",
    "055",
    "060",
    "065",
    "070",
    "075",
    "080",
    "085",
    "090",
    "095",
    "100",
    "105",
    "110",
    "115",
    "120",
    "125",
    "130",
    "135",
    "140",
    "145",
    "150",
]


def parse() -> None:
    """
    Entry point for the graph parsing process. This function will read the arcade_config.yaml
    and parse through the network .csv files in the data/ directory. It will then save the
    computed metrics to a .csv file in the data/ directory.
    """
    with open("arcade_config.yaml", "r", encoding="utf-8") as f:
        configs = yaml.safe_load(f)
        parsing_network_flag = configs["parsing"]["network"]

    uid = str(uuid.uuid4())
    if parsing_network_flag:
        parse_networks(uid)


def parse_networks(uid: str = "") -> None:
    """
    Goes through ARCADE dataset on s3 and computes graph metrics. Each edge in edge_weights
    will cause a seperate computation of metrics for each file considering that edge type.

    Each experiment will have it's data saved to a seperate csv on s3.

    """
    with open("arcade_config.yaml", "r", encoding="utf-8") as f:
        configs = yaml.safe_load(f)
        experiments = configs["experiments"]
        network_parsing = configs["network_parsing"]

    for experiment in experiments.keys():
        print(f"Starting network parsing on {experiment} files...")
        experiment_df = pd.DataFrame()
        aggregate_hemodynamics_df = pd.DataFrame()
        data_dir = f"data"

        data_files_list = os.listdir("data")
        for file_name in data_files_list:
            start = time.time()
            file_path = f"{data_dir}/{file_name}"

            file_df = pd.DataFrame()
            for edge_weight in network_parsing["edge_weights"]:
                print(f"Edge weight: {edge_weight}")
                edge_weight = edge_weight.lower()
                network_metrics_df = parse_network_arcade(file_path, edge_weight)
                # Combine join all the weighted network metrics into one dataframe
                if file_df.empty:
                    file_df = network_metrics_df
                else:
                    file_df = pd.merge(
                        file_df,
                        network_metrics_df,
                        how="outer",
                        on=["seed", "name", "timepoint", "key", "context", "layout"],
                    )

            # Concat all the network metrics from different files into one dataframe
            experiment_df = pd.concat([experiment_df, file_df], ignore_index=True)

            hemodynamics_df = parse_output_arcade(file_name)
            aggregate_hemodynamics_df = pd.concat(
                [aggregate_hemodynamics_df, hemodynamics_df], ignore_index=True
            )

            print(f"File parsing time: {time.time() - start}")

        context = experiment_df["context"].iloc[0]

        for metric_tp in METRIC_TPS:
            for timepoint, tp_df in experiment_df.groupby("timepoint"):
                experiment_df_formatted = format_df(
                    tp_df, aggregate_hemodynamics_df, metric_tp=metric_tp
                )
                experiment_df_formatted.to_csv(
                    f"{data_dir}/{context}-feature_{timepoint}_metric_{metric_tp}-{DATE}.csv",
                    index=False,
                )


if __name__ == "__main__":
    parse()
