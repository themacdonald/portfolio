"""Platform-agnostic system architecture DAG.

The graph grounds the four open-source engines inside the wider engineering
surface: analytics upstream, data quality and the data science core in the
middle, alignment and telemetry downstream. Weights are relative operational
criticality on a 0.0 to 1.0 scale and are stable across builds.
"""

from __future__ import annotations

from typing import Any

# id, domain, subSystem, weight
NODE_SPEC: tuple[tuple[str, str, str, float], ...] = (
    ("ingest.datasets", "analytics", "dataset_landing", 0.62),
    ("ingest.cleaning", "analytics", "data_cleaning_workflows", 0.78),
    ("analytics.pandas", "analytics", "programmatic_semantic_models", 0.88),
    ("analytics.sql", "analytics", "advanced_analytical_sql", 0.84),
    ("analytics.powerbi", "analytics", "power_bi_governance_layouts", 0.71),
    ("quality.rubrics", "quality", "multi_token_evaluation_rubrics", 0.93),
    ("quality.annotation", "quality", "annotation_review_protocols", 0.8),
    ("alignment.rlhf", "alignment", "reinforcement_learning_from_human_feedback", 0.9),
    ("alignment.dpo", "alignment", "direct_preference_optimization", 0.95),
    ("alignment.safety", "alignment", "instruction_adherence_checks", 0.86),
    ("memory.vector", "memory", "secure_vector_embedded_memory", 0.74),
    ("coaching.sentiment", "coaching", "contextual_sentiment_appraisal", 0.68),
    ("network.wrr", "network", "cross_layer_weighted_round_robin", 0.81),
    ("telemetry.dpo", "telemetry", "preference_signal_telemetry", 0.89),
    ("telemetry.reward", "telemetry", "reward_model_monitoring", 0.83),
    ("telemetry.scheduler", "telemetry", "scheduler_telemetry", 0.66),
    ("telemetry.bias", "telemetry", "bias_audit_reporting", 0.79),
    ("biasguard.audit", "quality", "token_level_semantic_fairness_audit", 0.96),
    ("feedbackloop.collect", "alignment", "preference_pair_collection", 0.87),
    ("feedbackloop.align", "alignment", "preference_optimization_loop", 0.92),
    ("confidencecoach.memory", "memory", "coach_memory_write_path", 0.7),
    ("agrimanet.wrr", "network", "scheduler_policy_decision", 0.77),
)

# source, target, dependencyType
EDGE_SPEC: tuple[tuple[str, str, str], ...] = (
    ("ingest.datasets", "ingest.cleaning", "data_contract"),
    ("ingest.cleaning", "analytics.pandas", "data_contract"),
    ("ingest.cleaning", "analytics.sql", "data_contract"),
    ("analytics.pandas", "analytics.powerbi", "metric"),
    ("analytics.sql", "analytics.powerbi", "metric"),
    ("analytics.pandas", "quality.rubrics", "data_contract"),
    ("analytics.sql", "quality.annotation", "data_contract"),
    ("quality.rubrics", "quality.annotation", "metric"),
    ("quality.rubrics", "alignment.rlhf", "data_contract"),
    ("quality.annotation", "alignment.rlhf", "metric"),
    ("alignment.rlhf", "alignment.dpo", "control"),
    ("alignment.dpo", "alignment.safety", "metric"),
    ("alignment.safety", "telemetry.dpo", "metric"),
    ("alignment.rlhf", "feedbackloop.collect", "data_contract"),
    ("feedbackloop.collect", "feedbackloop.align", "data_contract"),
    ("feedbackloop.align", "telemetry.reward", "metric"),
    ("feedbackloop.align", "alignment.dpo", "control"),
    ("memory.vector", "coaching.sentiment", "data_contract"),
    ("memory.vector", "confidencecoach.memory", "data_contract"),
    ("confidencecoach.memory", "coaching.sentiment", "control"),
    ("coaching.sentiment", "telemetry.reward", "metric"),
    ("network.wrr", "agrimanet.wrr", "control"),
    ("agrimanet.wrr", "telemetry.scheduler", "metric"),
    ("biasguard.audit", "quality.rubrics", "metric"),
    ("biasguard.audit", "telemetry.bias", "metric"),
    ("quality.annotation", "biasguard.audit", "data_contract"),
    ("alignment.safety", "telemetry.bias", "metric"),
    ("analytics.powerbi", "telemetry.scheduler", "metric"),
)


def build_dag() -> dict[str, list[dict[str, Any]]]:
    """Emit the DAG block and assert every edge endpoint resolves to a node."""
    nodes = [
        {"id": node_id, "domain": domain, "subSystem": sub_system, "weight": weight}
        for node_id, domain, sub_system, weight in NODE_SPEC
    ]
    known = {node["id"] for node in nodes}

    edges: list[dict[str, Any]] = []
    for source, target, dependency_type in EDGE_SPEC:
        if source not in known:
            raise ValueError(f"DAG edge source does not resolve: {source}")
        if target not in known:
            raise ValueError(f"DAG edge target does not resolve: {target}")
        edges.append(
            {"source": source, "target": target, "dependencyType": dependency_type}
        )

    duplicates = len(nodes) - len({node["id"] for node in nodes})
    if duplicates:
        raise ValueError(f"DAG contains {duplicates} duplicate node ids")

    return {"nodes": nodes, "edges": edges}


def domain_weights(dag: dict[str, list[dict[str, Any]]]) -> dict[str, float]:
    """Aggregate node weight per domain for the telemetry report."""
    totals: dict[str, float] = {}
    for node in dag["nodes"]:
        totals[node["domain"]] = round(totals.get(node["domain"], 0.0) + node["weight"], 4)
    return dict(sorted(totals.items(), key=lambda item: (-item[1], item[0])))
