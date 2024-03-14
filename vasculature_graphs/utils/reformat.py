import pandas as pd

PROJECT_DIR = "src/vasculature_collection/"


def create_feature_df(
    simulation_df: pd.DataFrame,
    hemo_df: pd.DataFrame,
    metrics_csv: str = f"{PROJECT_DIR}utils/metric_files/metric_15.csv",
) -> pd.DataFrame:
    print("Creating feature dataframe")
    metric_df = pd.read_csv(metrics_csv)
    temp_df = pd.merge(
        metric_df,
        simulation_df,
        how="right",
        on=["key", "seed", "layout", "context"],
    )

    feature_df = pd.merge(
        temp_df,
        hemo_df,
        how="left",
        on=["seed", "layout", "context", "key", "timepoint"],
    )

    feature_df.columns = map(str.upper, feature_df.columns)
    return feature_df


def add_edge_frac(filename: str = "edgefrac_.csv") -> None:
    df = pd.read_csv(filename, index_col=0)
    df["key"] = df["name"].str.extract("VF_(.*).GRAPH*")
    df[["context", "layout"]] = df.key.str.split("_", expand=True)
    df["edge_fraction"] = 1 - 1 / df["edge_fraction"]
    df[["context", "layout", "seed", "edge_fraction"]].to_csv(
        "C_EDGE_FRACTIONS.csv", index=False
    )


def format_df(
    simulation_df: pd.DataFrame, aggregate_hemo_df: pd.DataFrame, metric_tp: float = 15
) -> pd.DataFrame:
    """Formats simulation dataframe for analysis."""
    metric_csv = f"{PROJECT_DIR}utils/metric_files/metric_{metric_tp}.csv"
    feature_df = create_feature_df(simulation_df, aggregate_hemo_df, metric_csv)
    return feature_df


1
