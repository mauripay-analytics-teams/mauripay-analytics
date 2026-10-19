"""Generate the five publication figures from the frozen S14 results."""

from __future__ import annotations

from pathlib import Path

import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch
import pandas as pd


ROOT = Path(__file__).resolve().parents[1]
PAPER = ROOT / "paper"
FIGURES = PAPER / "figures"
DATASET = ROOT / "data" / "generated" / "mauripay_m_notebook_100k.parquet"
RESULTS = PAPER / "tables" / "model_results.csv"

FIGURES.mkdir(parents=True, exist_ok=True)
plt.style.use("seaborn-v0_8-whitegrid")
plt.rcParams.update(
    {
        "font.size": 10,
        "axes.titlesize": 12,
        "axes.labelsize": 10,
        "legend.fontsize": 9,
        "figure.dpi": 120,
        "savefig.dpi": 300,
    }
)


def save(fig: plt.Figure, name: str) -> None:
    fig.savefig(FIGURES / name, bbox_inches="tight", facecolor="white")
    plt.close(fig)


def architecture() -> None:
    layers = [
        ("5. Interfaces", "React dashboard · CLI · Swagger", "#dbeafe"),
        ("4. API", "FastAPI · Pydantic contracts", "#e0e7ff"),
        ("3. Detection", "Isolation Forest · LOF · Autoencoder · rules", "#fce7f3"),
        ("2. Ingestion and features", "Validation · encoding · scaling", "#fef3c7"),
        ("1. Data", "CSV · JSON · JSONL · Parquet", "#dcfce7"),
    ]
    fig, ax = plt.subplots(figsize=(8.2, 7.0))
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 11)
    ax.axis("off")
    for index, (title, subtitle, colour) in enumerate(layers):
        y = 9.2 - index * 2.0
        box = FancyBboxPatch(
            (1.1, y), 7.8, 1.25,
            boxstyle="round,pad=0.06,rounding_size=0.10",
            linewidth=1.2, edgecolor="#334155", facecolor=colour,
        )
        ax.add_patch(box)
        ax.text(1.45, y + 0.78, title, weight="bold", va="center")
        ax.text(1.45, y + 0.35, subtitle, color="#334155", va="center")
        if index < len(layers) - 1:
            ax.annotate(
                "", xy=(5, y - 0.55), xytext=(5, y - 0.05),
                arrowprops={"arrowstyle": "->", "lw": 1.5, "color": "#475569"},
            )
    ax.set_title("MauriPay-Analytics five-layer architecture", pad=12, weight="bold")
    save(fig, "architecture.png")


def benchmark_figures() -> None:
    results = pd.read_csv(RESULTS).set_index("model")
    labels = ["Precision", "Recall", "F1-score", "ROC-AUC"]
    metrics = results[["precision", "recall", "f1_score", "roc_auc"]].copy()
    metrics.columns = labels
    fig, ax = plt.subplots(figsize=(9.0, 5.2))
    metrics.plot.bar(ax=ax, color=["#0f766e", "#2563eb", "#d97706", "#7c3aed"])
    ax.set(title="Detection quality", xlabel="", ylabel="Score", ylim=(0, 1.05))
    ax.tick_params(axis="x", rotation=0)
    ax.legend(ncol=2, frameon=True)
    fig.tight_layout()
    save(fig, "benchmark_models.png")

    times = results[["training_time_s", "prediction_time_s"]].copy()
    times.columns = ["Training", "Inference"]
    fig, ax = plt.subplots(figsize=(8.2, 5.0))
    times.plot.bar(ax=ax, color=["#2563eb", "#f59e0b"])
    ax.set(title="Model execution time", xlabel="", ylabel="Time (seconds)")
    ax.tick_params(axis="x", rotation=0)
    ax.legend(frameon=True)
    fig.tight_layout()
    save(fig, "benchmark_time.png")


def data_figures() -> None:
    if not DATASET.exists():
        raise FileNotFoundError(
            f"Missing {DATASET}. Run notebook 01 with Restart & Run All first."
        )
    data = pd.read_parquet(DATASET)
    anomaly = data["is_anomaly"].astype(str).str.lower().isin(["true", "1", "yes"])

    counts = data.loc[anomaly, "anomaly_type"].value_counts().sort_values()
    fig, ax = plt.subplots(figsize=(8.6, 5.2))
    counts.plot.barh(ax=ax, color="#dc2626")
    ax.set(title="Injected anomalies", xlabel="Transactions", ylabel="Anomaly type")
    ax.bar_label(ax.containers[0], padding=3, fontsize=9)
    fig.tight_layout()
    save(fig, "anomaly_distribution.png")

    values = ["amount"]
    sender = data[["sender_wilaya", *values]].rename(columns={"sender_wilaya": "wilaya"})
    receiver = data[["receiver_wilaya", *values]].rename(columns={"receiver_wilaya": "wilaya"})
    sender["is_anomaly"] = anomaly.to_numpy()
    receiver["is_anomaly"] = anomaly.to_numpy()
    events = pd.concat([sender, receiver], ignore_index=True).dropna(subset=["wilaya"])
    geo = events.groupby("wilaya").agg(
        transactions=("wilaya", "size"),
        anomalies=("is_anomaly", "sum"),
    )
    geo["anomaly_rate"] = 100 * geo["anomalies"] / geo["transactions"]

    fig, axes = plt.subplots(1, 2, figsize=(13.5, 6.0))
    geo.sort_values("transactions")["transactions"].plot.barh(
        ax=axes[0], color="#0f766e"
    )
    geo.sort_values("anomaly_rate")["anomaly_rate"].plot.barh(
        ax=axes[1], color="#d97706"
    )
    axes[0].set(title="Activity volume", xlabel="Sender and receiver roles", ylabel="Wilaya")
    axes[1].set(title="Anomaly rate", xlabel="Anomalous roles (%)", ylabel="")
    fig.tight_layout()
    save(fig, "geographic_analysis.png")


if __name__ == "__main__":
    architecture()
    benchmark_figures()
    data_figures()
    print(f"Five figures generated in {FIGURES}")
