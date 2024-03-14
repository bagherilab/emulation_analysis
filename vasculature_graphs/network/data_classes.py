from typing import Any, Optional
from dataclasses import dataclass


@dataclass
class GraphMetrics:
    """
    Dataclass for storing graph metrics
    """

    nodes: int
    edges: int
    radius: float
    diameter: float
    avg_eccentricity: float
    avg_shortest_path: float
    avg_in_degrees: float
    avg_out_degrees: float
    avg_degree: float
    avg_clustering: float
    avg_closeness: float
    avg_betweenness: float
    avg_coreness: int
    components: int
    avg_eccentricity_weighted: Optional[float] = None
    avg_closeness_weighted: Optional[float] = None
    avg_coreness_weighted: Optional[int] = None
    avg_betweenness_weighted: Optional[float] = None
    avg_out_degrees_weighted: Optional[float] = None
    avg_in_degrees_weighted: Optional[float] = None
    avg_degree_weighted: Optional[float] = None
    seed: Optional[str] = None
    context: Optional[str] = None
    layout: Optional[str] = None
    key: Optional[str] = None
    name: Optional[str] = None
    timepoint: Optional[str] = None

    def __getitem__(self, item: str) -> Any:
        return getattr(self, item)
