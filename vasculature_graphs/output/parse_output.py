from typing import Any, Optional
import dataclasses

import h5py
import yaml
import pandas as pd
import numpy as np

from output.calculate_hemodynamics import calculate_hemodynamics


def parse_output_arcade(sim_file: str) -> pd.DataFrame:
    """
    Calculate aggragate hemodynamics from a csv file from an ARCADE simulation
    Parameters
    ----------
    sim_file :
        An .csv file with data from one ARCADE simulation vasculature


    Returns
    ---------
        : pd.DataFrame
    """
    simulations = pd.read_csv(sim_file)
    seeds = simulations.seed.unique()

    file_df = pd.DataFrame()
    for seed in seeds:
        simulation_df = simulations.loc[simulations["seed"] == seed]

        hemo = calculate_hemodynamics(simulation_df)
        hemo.seed = seed
        hemo.timepoint = _get_timepoint(sim_file)
        hemo.key = _get_key(sim_file)
        hemo.context = _get_context(sim_file)
        hemo.layout = _get_layout(sim_file)

        hemodynamics_dict = dataclasses.asdict(hemo)
        hemodynamics_df = pd.DataFrame.from_dict([hemodynamics_dict])
        file_df = pd.concat([file_df, hemodynamics_df], ignore_index=True)

    return file_df


def _get_timepoint(sim_file: str) -> str:
    timepoint = sim_file.split(".")[-2]
    timepoint_float = float(timepoint)
    timepoint = str(timepoint_float / 10.0)
    return timepoint


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


if __name__ == "__main__":
    parse_output_arcade("VF_C_Lav.GRAPH.010.csv")
