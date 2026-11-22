# Environnement expérimental

Cette fiche déclare l'environnement de référence du manuscrit SoftwareX.
Elle ne constitue pas un journal d'exécution ni un verrouillage des dépendances.
La version Python 3.12.3 est également enregistrée dans les métadonnées des
trois notebooks ; les versions de bibliothèques ci-dessous ne sont pas
indépendamment attestées par un relevé complet associé à chaque exécution.

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

### Statut des versions

La table précédente est une **déclaration historique**. Une inspection en
lecture seule de l'environnement courant a retrouvé les mêmes versions pour
ces huit composants (`sys.version` et `importlib.metadata.version`, sans
importer ni exécuter les modèles). Cela vérifie leur présence actuelle,
pas leur utilisation lors des anciennes expériences.

| Information | Statut |
|---|---|
| Python 3.12.3 dans les métadonnées des trois notebooks et les deux JSON historiques | Enregistré dans les artefacts ; pas un relevé complet d'exécution |
| Python 3.12.3, NumPy 1.26.4, Pandas 2.2.2, scikit-learn 1.8.0, PyTorch 2.12.0, Pydantic 2.13.3, Matplotlib 3.11.1, PyArrow 24.0.0 | Versions installées vérifiées lors de cette inspection documentaire |
| Polars 1.40.1, joblib 1.5.3, FastAPI 0.115.6, pytest 9.1.1 | Versions installées vérifiées ; attribution historique NON VÉRIFIÉE |
| CPU, RAM et Windows de la table matérielle | Déclarés dans ce document ; aucune attribution indépendante à chaque temps mesuré |
| Versions complètes des dépendances de chaque exécution historique, pilotes et bibliothèques transitives | NON VÉRIFIÉ |

La lecture des versions ne constitue ni une réinstallation ni une reproduction
des expériences. La documentation de l'environnement actuel ne remplace pas
un fichier d'environnement historique associé à un dataset et à un commit.

## Paramètres des détecteurs

| Modèle | Paramètres principaux |
|---|---|
| Isolation Forest | `n_estimators=100`, `contamination=0.02`, `random_state=42` |
| LOF | `n_neighbors=20`, `contamination=0.02`, `metric=minkowski` |
| Autoencoder | `hidden_dims=(32,16)`, `encoding_dim=8`, `epochs=10`, `batch_size=128`, `threshold_percentile=98`, `device=cpu`, `random_state=42` |

## Provenance et limites

Les métriques de [`tables/model_results.csv`](tables/model_results.csv)
concordent, à leur précision d'arrondi, avec les sorties sauvegardées du
notebook 02 et `backend/notebooks/outputs/02_benchmark/comparaison_modeles.csv`.
Les temps du CSV historique de l'article diffèrent toutefois des deux sources
du notebook. Ils sont exclus du tableau principal du manuscrit par décision
éditoriale, sans modification du CSV :

| Modèle | Article : entraînement / inférence (s) | Notebook : entraînement / inférence (s) |
|---|---|---|
| Isolation Forest | 0.559693 / 0.038668 | 0.641137 / 0.034514 |
| LOF | 6.225830 / 0.407714 | 5.478418 / 0.376920 |
| Autoencoder | 13.046145 / 0.014021 | 10.736425 / 0.009075 |

La provenance des temps du CSV de l'article est **NON VÉRIFIÉE** : aucun journal
inspecté ne les relie à une exécution identifiée. Les chiffres historiques sont
conservés, mais ne fondent aucune comparaison de temps dans le manuscrit.
Le script `paper/generate_figures.py` lit le tableau de l'article pour les
figures de métriques et de temps ; ce n'est pas une mesure indépendante.
La figure historique `benchmark_time.png` reste disponible, mais n'est plus
incluse dans le manuscrit. Le tableau 1 conserve précision, rappel, F1,
accuracy, ROC-AUC et nombre d'alertes.

Les dépendances Python utilisent des bornes minimales dans
`backend/pyproject.toml`, `requirements.txt` et
`backend/notebooks/requirements.txt`. Aucun environnement Python figé ne permet
actuellement de reconstruire exactement l'exécution historique. Le minimum
déclaré est Python 3.11 ; la version enregistrée pour les notebooks est 3.12.3.
`frontend/package-lock.json` verrouille les dépendances frontend, pas celles
des expériences Python.

Les commandes et limites de reproduction figurent dans
[`backend/notebooks/README.md`](../backend/notebooks/README.md).
