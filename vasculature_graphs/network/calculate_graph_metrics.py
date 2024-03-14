from typing import Tuple, Optional, Any

import igraph as ig
import numpy as np

from network.data_classes import GraphMetrics

CENTER = (238 / 2, 158 / 2)


def igraph_graph_metrics(
    edges: list[Tuple[Any, Any]], weights: Optional[list[float]] = None
) -> GraphMetrics:
    """
    Calculate graph metrics from a set of edges

    Parameters
    ----------
    edges :
        List of edges defined by end nodes (i.e. [[1,2], [2,4]...]) of the graph to be analyzed
    weights :
        (Optional) List of weights in the same order as the list of edges

    Returns
    -------
    metrics
        GraphMetrics object that holds graph metrics
    """

    if len(edges) == 0:
        raise ValueError("Passed edges do not create valid graph.")
    if not weights:
        weights = [1.0] * len(edges)

    igraph = _make_igraph(edges, weights)
    node_inverse_distances_from_center = [
        _inverse_distance_from_center(node["name"]) for node in igraph.vs
    ]

    connected: bool = igraph.is_connected("weak")

    m_dict = {}

    m_dict["nodes"] = igraph.vcount()
    m_dict["edges"] = igraph.ecount()

    degree_metrics_dict = _calc_degree_metrics(
        igraph, node_inverse_distances_from_center
    )
    m_dict.update(degree_metrics_dict)

    distance_metrics_dict = _calc_distance_metrics(
        igraph, connected, node_inverse_distances_from_center
    )
    m_dict.update(distance_metrics_dict)

    betweeness_metrics_dict = _calc_betweenness_metric(
        igraph, connected, node_inverse_distances_from_center
    )
    m_dict.update(betweeness_metrics_dict)

    coreness_metrics_dict = _calc_coreness_metric(
        igraph, connected, node_inverse_distances_from_center
    )
    m_dict.update(coreness_metrics_dict)

    m_dict["avg_clustering"] = _calc_clustering_metric(igraph)
    m_dict["components"] = _calc_n_components(igraph, connected)

    metrics = GraphMetrics(**m_dict)
    return metrics


def _calc_distance_metrics(
    graph: ig.Graph, connected: bool, avg_weight: Optional[list[float]] = None
) -> dict[str, float]:
    """Helper function to calculatedistance based metrics from igraph"""
    dist_m_dict = {}
    if not connected:
        return {
            "radius": float("inf"),
            "diameter": float("inf"),
            "avg_eccentricity": float("inf"),
            "avg_closeness": float("inf"),
            "avg_shortest_path": float("inf"),
            "avg_eccentricity_weighted": float("inf"),
            "avg_closeness_weighted": float("inf"),
        }

    n_nodes = graph.vcount()
    path_norm_factor = n_nodes * (n_nodes - 1)

    eccs: list[float] = []
    closeness: list[float] = []
    total_distance: int = 0
    try:
        for node in graph.vs:
            distance_vector = graph.distances(
                source=node, mode="all", weights="weight"
            )[0]
            distance_vector = np.array(list(distance_vector))
            reachable = np.count_nonzero(~np.isinf(distance_vector))
            distances = np.nan_to_num(distance_vector, posinf=0.0)
            if reachable <= 1:
                continue
            distance = np.sum(distances)
            eccs.append(max(distances))
            closeness.append(
                (reachable - 1) * (reachable - 1) / np.sum(distance) / (n_nodes)
            )
            total_distance += distance
    except ig._igraph.InternalError:
        return {
            "radius": float("inf"),
            "diameter": float("inf"),
            "avg_eccentricity": float("inf"),
            "avg_closeness": float("inf"),
            "avg_shortest_path": float("inf"),
            "avg_eccentricity_weighted": float("inf"),
            "avg_closeness_weighted": float("inf"),
        }

    dist_m_dict["radius"] = min(eccs)
    dist_m_dict["diameter"] = max(eccs)
    dist_m_dict["avg_eccentricity"] = float(np.mean(eccs))
    dist_m_dict["avg_closeness"] = float(np.mean(np.nan_to_num(closeness, posinf=0.0)))
    dist_m_dict["avg_shortest_path"] = float(total_distance / path_norm_factor)
    if avg_weight:
        dist_m_dict["avg_eccentricity_weighted"] = _weighted_average(eccs, avg_weight)
        closeness_list = np.nan_to_num(closeness, posinf=0.0).tolist()
        dist_m_dict["avg_closeness_weighted"] = _weighted_average(
            closeness_list, avg_weight
        )
    else:
        dist_m_dict["avg_eccentricity_weighted"] = float("inf")
        dist_m_dict["avg_closeness_weighted"] = float("inf")

    return dist_m_dict


def _calc_betweenness_metric(
    graph: ig.Graph, connected: bool, avg_weight: Optional[list[float]] = None
) -> dict[str, float]:
    """Helper function to calcuate normalized betweenness from igraph"""
    between_m_dict = {}
    if not connected:
        return {
            "avg_betweenness": float("inf"),
            "avg_betweenness_weighted": float("inf"),
        }

    n_nodes = graph.vcount()
    betweenness_norm_factor = (n_nodes - 1) * (n_nodes - 2)
    try:
        betweenness = (
            np.array(graph.betweenness(weights="weight")) / betweenness_norm_factor
        )
        between_m_dict["avg_betweenness"] = np.mean(betweenness)
        if avg_weight:
            between_m_dict["avg_betweenness_weighted"] = _weighted_average(
                betweenness, avg_weight
            )
        else:
            between_m_dict["avg_betweenness_weighted"] = float("inf")

        return between_m_dict
    except ig._igraph.InternalError:
        return {
            "avg_betweenness": float("inf"),
            "avg_betweenness_weighted": float("inf"),
        }


def _calc_degree_metrics(
    graph: ig.Graph, avg_weight: Optional[list[float]] = None
) -> dict[str, float]:
    """
    Helper function to calculate the average degree (number of edges per node) from igraph

    Parameters
    ----------
    graph :
        igraph Graph

    Returns
    -------
    return_tuple
        tuple containing (average_indegree, average_outdegree, average_degree)
    """
    degree_m_dict = {}
    modes = ("in", "out", "all")
    (
        degree_m_dict["avg_in_degrees"],
        degree_m_dict["avg_out_degrees"],
        degree_m_dict["avg_degree"],
    ) = tuple(np.mean(graph.degree(mode=mode)) for mode in modes)
    if avg_weight:
        (
            degree_m_dict["avg_in_degrees_weighted"],
            degree_m_dict["avg_out_degrees_weighted"],
            degree_m_dict["avg_degree_weighted"],
        ) = tuple(
            _weighted_average(graph.degree(mode=mode), avg_weight) for mode in modes
        )
    else:
        (
            degree_m_dict["avg_in_degrees_weighted"],
            degree_m_dict["avg_out_degrees_weighted"],
            degree_m_dict["avg_degree_weighted"],
        ) = tuple(float("inf") for _ in modes)
    return degree_m_dict


def _calc_clustering_metric(graph: ig.Graph) -> float:
    """
    Helper function to calculate the global transitivity,
    i.e. the Clustering coefficient from igraph
    """
    return graph.transitivity_avglocal_undirected()


def _calc_coreness_metric(
    graph: ig.Graph, connected: bool, avg_weight: Optional[list[float]] = None
) -> dict[str, float]:
    """Helper function to get the assortivity from igraph."""
    coreness_m_dict = {}
    if not connected:
        return {"avg_coreness": float("inf"), "avg_coreness_weighted": float("inf")}

    coreness = graph.coreness(mode="all")
    coreness_m_dict["avg_coreness"] = float(np.average(coreness))
    if avg_weight:
        coreness_m_dict["avg_coreness_weighted"] = _weighted_average(
            coreness, avg_weight
        )
    else:
        coreness_m_dict["avg_coreness_weighted"] = float("inf")
    return coreness_m_dict


def _calc_n_components(graph: ig.Graph, connected: bool) -> int:
    """Helper function to get the number of components (subgraphs) from igraph."""
    if connected:
        return 1

    return len(graph.decompose(mode="weak"))


def _make_igraph(edges: list[Tuple[Any, Any]], weights: list[float]) -> ig.Graph:
    """
    Creates an igraph graph from provided edges for certain graph metric calculations and returns
    a directed version of the graph

    Parameters
    ----------
    edges :
        List of edges defined by end nodes (i.e. [[1,2], [2,4]...]) of the graph to be analyzed
    weights :
        (Optional) List of weights in the same order as the list of edges

    Returns
    -------
    dir_graph
        Directed igraph
    """
    dir_graph = ig.Graph.TupleList(edges=edges, directed=True)
    dir_graph.es["weight"] = weights
    return dir_graph


def _inverse_distance_from_center(
    node: Tuple[Any, Any], center: Tuple[float, float] = CENTER
) -> float:
    """Helper function to calculate the distance from the center of the graph"""

    return 1 / np.sqrt(
        (int(node[0]) - center[0]) ** 2 + (int(node[1]) - center[1]) ** 2
    )


def _weighted_average(values: list[float], weights: list[float]) -> float:
    print(weights)
    total_weight = sum(weights)
    weighted_sum = sum(v * w for v, w in zip(values, weights))
    return float(weighted_sum / total_weight)
