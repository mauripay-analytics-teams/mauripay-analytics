# Notebooks pédagogiques MauriPay-Analytics

Les trois notebooks S14 sont conçus pour être exécutés depuis la racine du
projet ou depuis le dossier `notebooks/` avec **Kernel → Restart & Run All**.

## Installation

```bash
python -m pip install -e backend
python -m pip install -r notebooks/requirements.txt
```

## Notebooks

1. `01_generation_et_exploration.ipynb` : génération de MauriPay-M et analyse exploratoire ;
2. `02_benchmark_detection.ipynb` : comparaison Isolation Forest, LOF et autoencoder ;
3. `03_analyse_geographique.ipynb` : agrégats et visualisations par wilaya.

Les fichiers de données produits sont placés dans `data/generated/`, déjà
exclu du suivi Git. Les graines pseudo-aléatoires sont fixées à `42`.
