# Environnement expérimental

Cette fiche enregistre l'environnement de l'exécution de référence utilisée
pour les résultats du manuscrit SoftwareX.

## Protocole

| Élément | Valeur |
|---|---|
| Version de MauriPay-Analytics | 0.2.0 |
| Graine pseudo-aléatoire | 42 |
| Dataset d'exploration | 100 000 transactions |
| Dataset du benchmark | 10 000 transactions |
| Séparation du benchmark | Chronologique, 80 % entraînement / 20 % évaluation |
| Taille d'entraînement | 8 000 transactions |
| Taille d'évaluation | 2 000 transactions, dont 139 anomalies |
| Calcul de l'Autoencoder | CPU |

## Matériel et système

| Élément | Valeur |
|---|---|
| Système d'exploitation | Microsoft Windows 10 Professionnel 64 bits |
| Version du système | 10.0.19045 |
| Processeur | Intel Core i3-6100U à 2,30 GHz |
| Cœurs physiques / processeurs logiques | 2 / 4 |
| Mémoire vive | 7,88 Go |
| Circuit graphique | Intel HD Graphics 520 |

## Environnement logiciel

| Logiciel ou bibliothèque | Version |
|---|---:|
| Python | 3.12.3 |
| NumPy | 1.26.4 |
| Pandas | 2.2.2 |
| scikit-learn | 1.8.0 |
| PyTorch | 2.12.0 |
| Pydantic | 2.13.3 |
| Matplotlib | 3.11.1 |
| PyArrow | 24.0.0 |

## Paramètres des détecteurs

| Modèle | Paramètres principaux |
|---|---|
| Isolation Forest | `n_estimators=100`, `contamination=0.02`, `random_state=42` |
| LOF | `n_neighbors=20`, `contamination=0.02`, `metric=minkowski` |
| Autoencoder | `hidden_dims=(32,16)`, `encoding_dim=8`, `epochs=10`, `batch_size=128`, `threshold_percentile=98`, `device=cpu`, `random_state=42` |

Les temps d'exécution sont spécifiques à cette machine. Les métriques et les
temps définitifs sont enregistrés dans
[`tables/model_results.csv`](tables/model_results.csv).
