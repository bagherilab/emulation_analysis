from typing import Any, Optional
from dataclasses import dataclass

""" Tumorcode """


@dataclass
class VesselParams:
    """
    Dataclass for storing simulation results
    """

    bRadiusSmoothing: bool
    bRelativeShearforceCollaps: bool
    bShearStressControlledDilatationAndRadiusDependentCollapse: bool
    bSproutModelSimple: bool

    name: Optional[str] = None


@dataclass
class Results:
    """
    Dataclass for storing simulation results
    """

    root_node_geometry: int
    oxygen_type: str
    vessel_params: VesselParams

    name: Optional[str] = None

    def __getitem__(self, item: str) -> Any:
        return getattr(self, item)


""" ARCADE """


@dataclass
class Hemodynamics:
    """
    Dataclass for storing graph metrics
    """

    fromx: float
    fromy: float
    fromz: float
    frompressure: float
    fromoxygen: float
    tox: float
    toy: float
    toz: float
    topressure: float
    tooxygen: float
    CODE: float
    RADIUS: float
    LENGTH: float
    WALL: float
    SHEAR: float
    CIRCUM: float
    FLOW: float
    seed: Optional[str] = None
    context: Optional[str] = None
    layout: Optional[str] = None
    key: Optional[str] = None
    timepoint: Optional[str] = None

    def __getitem__(self, item: str) -> Any:
        return getattr(self, item)
