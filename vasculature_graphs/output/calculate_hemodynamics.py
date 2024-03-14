from typing import Tuple, Optional, Any

import pandas as pd

from output.data_classes import Hemodynamics


def calculate_hemodynamics(df: pd.DataFrame) -> Hemodynamics:
    """
    Calculate hemodynamics from an ARCADE graph dataframe

    Parameters
    ----------
    df

    Returns
    -------
    hemodynamics
        Hemodynamics object that holds graph metrics
    """

    averages = df.mean(axis=0)
    h_dict = averages.to_dict()

    hemodynamics = Hemodynamics(**h_dict)
    return hemodynamics
