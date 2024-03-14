from typing import Optional, Any
import dataclasses

import h5py
import pandas as pd
import numpy as np

from network.calculate_graph_metrics import igraph_graph_metrics

CENTER = (238 / 2, 158 / 2)


def parse_network_arcade(sim_file: str, weight: str = "") -> pd.DataFrame:
    """
    Pull graph metrics from a csv file from an ARCADE simulation

    Parameters
    ----------
    sim_file :
        An h5 file with data from one tumorcode simulation
    weight :
        The variable on which to weight the network edges

    Returns
    ---------
        : pd.DataFrame
    """
    simulations = pd.read_csv(sim_file)
    seeds = simulations.seed.unique()

    weights: Optional[list[float]]

    file_df = pd.DataFrame()

    for seed in seeds:
        simulation_df = simulations.loc[simulations["seed"] == seed]
        node_ax_indeces = list(simulation_df.loc[:, "fromx"])
        node_ay_indeces = list(simulation_df.loc[:, "fromy"])
        node_a_indeces = list(zip(node_ax_indeces, node_ay_indeces))

        node_bx_indeces = list(simulation_df.loc[:, "tox"])
        node_by_indeces = list(simulation_df.loc[:, "toy"])
        node_b_indeces = list(zip(node_bx_indeces, node_by_indeces))

        weights = _get_weights(simulation_df, weight, node_a_indeces, node_b_indeces)

        edges = list(zip(node_a_indeces, node_b_indeces))
        metrics = igraph_graph_metrics(edges, weights)
        metrics.seed = seed
        metrics.name = sim_file
        metrics.timepoint = _get_timepoint(sim_file)
        metrics.key = _get_key(sim_file)
        metrics.context = _get_context(sim_file)
        metrics.layout = _get_layout(sim_file)

        network_metrics_dict = dataclasses.asdict(metrics)
        network_metrics_df = pd.DataFrame.from_dict([network_metrics_dict])

        file_df = pd.concat([file_df, network_metrics_df], ignore_index=True)

    if weight not in ("", "none"):
        exclude_cols = [
            "name",
            "seed",
            "timepoint",
            "key",
            "context",
            "layout",
            "edge_weight",
        ]
        edge_weight_columns = []
        for col in file_df.columns:
            if col not in exclude_cols:
                edge_weight_columns.append(col + ":" + weight)
            else:
                edge_weight_columns.append(col)
        file_df.columns = edge_weight_columns

    return file_df


def _get_timepoint(sim_file: str) -> str:
    timepoint = sim_file.split(".")[-2]
    timepoint_float = float(timepoint)
    timepoint_formatted = str(timepoint_float / 10.0)
    return timepoint_formatted


def _get_key(sim_file: str) -> str:
    start = sim_file.index("_") + 1
    end = sim_file.index(".", start)
    return sim_file[start:end]


def _get_layout(sim_file: str) -> str:
    name_chunks = sim_file.split("_")
    suffix_chunks = name_chunks[2].split(".")
    layout = suffix_chunks[0]
    return layout


def _get_context(sim_file: str) -> str:
    name_chunks = sim_file.split("_")
    context = name_chunks[1]
    return context


def _remove_nan_rows(df: pd.DataFrame, edge_weight: str) -> pd.DataFrame:
    df = df.loc[~df[edge_weight].isna()]
    return df


def _get_weights(
    simulation_df: pd.DataFrame, weight: str, node_as: list[Any], node_bs: list[Any]
) -> Optional[list[float]]:
    if "avg" in weight:
        variable = weight.replace("_avg", "")
        from_col_name = f"from{variable}"
        to_col_name = f"to{variable}"

        simulation_df = _remove_nan_rows(simulation_df, from_col_name)
        simulation_df = _remove_nan_rows(simulation_df, to_col_name)

        from_var = list(simulation_df.loc[:, from_col_name])
        to_var = list(simulation_df.loc[:, to_col_name])
        weights = [(f + t) / 2 for f, t in zip(from_var, to_var)]

    elif "delta" in weight:
        variable = weight.replace("_delta", "")
        from_col_name = f"from{variable}"
        to_col_name = f"to{variable}"

        simulation_df = _remove_nan_rows(simulation_df, from_col_name)
        simulation_df = _remove_nan_rows(simulation_df, to_col_name)

        from_var = list(simulation_df.loc[:, from_col_name])
        to_var = list(simulation_df.loc[:, to_col_name])
        weights = [abs(t - f) for f, t in zip(from_var, to_var)]

    elif "inverse" in weight:
        weights = _get_edge_inverse_distance_from_center(node_as, node_bs)

    elif weight in ("", "none"):
        weights = None
    else:
        weight_col_name = weight.upper()
        simulation_df = _remove_nan_rows(simulation_df, weight_col_name)
        weights = list(simulation_df.loc[:, weight_col_name])

    return weights


def _get_edge_inverse_distance_from_center(
    node_a_indeces: list[tuple[int, int]], node_b_indeces: list[tuple[int, int]]
) -> list[float]:
    center = (0, 0)
    weights = []
    for node_a, node_b in zip(node_a_indeces, node_b_indeces):
        avg_node = ((node_a[0] + node_b[0]) / 2, (node_a[1] + node_b[1]) / 2)
        distance = np.sqrt(
            (avg_node[0] - center[0]) ** 2 + (avg_node[1] - center[1]) ** 2
        )
        weights.append(1 / distance)
    return weights


if __name__ == "__main__":
    # For testing purposes
    parse_network_arcade("../VF_C_LAV.GRAPH.000.csv", "pressure_delta")
