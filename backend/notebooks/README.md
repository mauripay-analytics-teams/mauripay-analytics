# Notebooks pédagogiques MauriPay-Analytics

Les trois notebooks S14 sont conçus pour être exécutés depuis la racine du
projet ou depuis le dossier `backend/notebooks/` avec **Kernel → Restart & Run All**.

## Installation

Exécutez les commandes suivantes depuis la racine du dépôt.

```bash
python -m pip install -e backend
python -m pip install -r backend/notebooks/requirements.txt
```

## Notebooks

1. `01_generation_et_exploration.ipynb` : génération du scénario MauriPay-M 100K et analyse exploratoire ;
2. `02_benchmark_detection.ipynb` : comparaison Isolation Forest, LOF et autoencoder ;
3. `03_analyse_geographique.ipynb` : agrégats et visualisations par wilaya.

Les fichiers de données produits sont placés dans `data/generated/`, déjà
exclu du suivi Git. Les graines pseudo-aléatoires sont fixées à `42`.

## Terminologie et chemins

**MauriPay-Analytics** est le logiciel. **Synthetic transaction generator**
désigne le composant `mauripay.synthetic`. **MauriPay-M 100K** désigne le
scénario de 100 000 lignes (`SCENARIOS` dans
`benchmarks/full_10k_benchmark.py`), pas un second logiciel ou module.

Tous les chemins suivants sont relatifs à la racine du dépôt. Les notebooks
trouvent cette racine en remontant depuis le répertoire courant.

| Notebook | Entrée dans `data/generated/` | Sorties dans `backend/notebooks/outputs/` |
|---|---|---|
| 01 | `mauripay_m_notebook_100k.parquet` ; génération si absent | `01_generation/` : cinq figures PNG |
| 02 | `mauripay_s_notebook_10k.parquet` ; génération si absent | `02_benchmark/` : `comparaison_modeles.csv`, deux figures PNG |
| 03 | Premier fichier présent : `mauripay_m_notebook_100k.parquet`, puis `mauripay_m_100k.csv` ; sinon génération du premier | `03_geographie/` : `agregats_par_wilaya.csv`, trois figures PNG |

Les chemins de sortie ont été alignés sur les artefacts suivis. Les sorties
historiques intégrées aux notebooks sont conservées et peuvent encore afficher
l'ancien chemin `notebooks/outputs/` ; elles n'ont pas été réexécutées.
Le notebook 03 compte les rôles expéditeur et destinataire : le total des
volumes géographiques vaut deux fois le nombre de transactions. Son appel
optionnel à `http://127.0.0.1:8000/geo` ne remplace pas l'analyse locale.
Exécuter 01 avant 03 évite de sélectionner involontairement le CSV historique.

## Commandes de génération documentées — non exécutées lors de l'audit

Depuis la racine, avec le backend déjà installé, les commandes suivantes
expriment les paramètres utilisés par les notebooks 01 et 02. Elles écrivent
les fichiers indiqués : ne pas les lancer sur un fichier de référence à conserver.

```bash
python -m mauripay.synthetic.generator --rows 100000 --accounts 5000 --start-date 2026-01-01 --end-date 2026-03-31 --seed 42 --anomaly-rate 0.02 --tontine-rate 0.001 --structuring-rate 0.003 --high-frequency-rate 0.002 --output data/generated/mauripay_m_notebook_100k.parquet
python -m mauripay.synthetic.generator --rows 10000 --accounts 5000 --start-date 2026-01-01 --end-date 2026-03-31 --seed 42 --anomaly-rate 0.02 --tontine-rate 0.001 --structuring-rate 0.003 --high-frequency-rate 0.002 --output data/generated/mauripay_s_notebook_10k.parquet
```

Le générateur CLI appelle `generate_transactions` puis `export_transactions`.
Les notebooks font les mêmes appels, mais **rechargent un fichier existant**.
La graine affichée ne prouve donc pas la provenance d'un fichier préexistant.
Le notebook 02 utilise les valeurs par défaut de génération explicitées ici.
Le notebook 03 utilise aussi ces valeurs s'il doit générer le jeu 100K.

Pour ouvrir les notebooks, sans exécution automatique :

```bash
jupyter notebook backend/notebooks/
```

Une reproduction future nécessite l'exécution complète des cellules de 01,
02 et 03, dans cet ordre. **02 entraîne des modèles** ; aucun notebook n'a été
exécuté pendant cette phase documentaire. Une exécution écrase ses sorties,
mais ne met pas automatiquement à jour `paper/tables/model_results.csv`.

## Protocole chronologique 10K du manuscrit

- Trier les 10 000 lignes par `timestamp`, sans mélange aléatoire ; utiliser
  les premières 8 000 pour l'entraînement et les dernières 2 000 pour l'évaluation.
  La sortie sauvegardée atteste 139 anomalies dans les 2 000 lignes finales.
- Ajuster `TransactionFeatureEngineer` sur l'entraînement seulement pour IF/LOF.
  Ajuster un préprocesseur distinct et l'autoencoder sur les seules lignes
  normales de l'entraînement ; transformer ensuite le jeu d'évaluation.
- IF : 100 arbres, contamination 0.02, `random_state=42`.
  LOF : 20 voisins, contamination 0.02, distance Minkowski, mode novelty.
- AE : couches cachées `(32,16)`, espace latent 8, 10 époques, batch 128,
  percentile 98, CPU, `random_state=42`. La dimension d'entrée est déterminée
  par le prétraitement, pas fixée arbitrairement à 161.
- `evaluate_detection` produit précision, rappel, F1, accuracy, ROC-AUC et
  matrice de confusion. `perf_counter` mesure `fit` puis `results` ; les temps
  de prétraitement sont mesurés séparément. Aucun modèle fourni dans
  `backend/models/` n'est chargé par ce notebook.

`benchmarks/run_benchmark.py --benchmark full_10k` est un protocole différent :
IF/LOF sont ajustés et évalués sur le dataset entier ; l'AE est ajusté sur ses
lignes normales puis évalué sur toutes les lignes (50 époques par défaut).
Ce runner ne reproduit pas le protocole chronologique du manuscrit.

## Provenance des artefacts enregistrés

| Source | Contenu observable | Limite |
|---|---|---|
| Notebook 01, sorties intégrées | 100 000 lignes ; 7 691 anomalies : 4 040 HIGH_FREQUENCY, 1 780 STRUCTURING, 960 HIGH_AMOUNT, 534 OPERATOR_OUTAGE, 377 UNUSUAL_LOCATION | Dataset de référence non suivi dans Git ; empreinte et commit de génération absents |
| `benchmarks/results/full_100k_benchmark.json` | 100 000 lignes, 6 548 anomalies ; CSV `mauripay_m_100k.csv` ; trois modèles | Ancien artefact distinct ; cause exacte de l'écart d'effectifs **NON VÉRIFIÉE** |
| Notebook 02 et `outputs/02_benchmark/comparaison_modeles.csv` | Métriques et temps concordants entre ces deux artefacts | Pas de manifeste d'exécution complet |
| `paper/tables/model_results.csv` | Mêmes métriques à l'arrondi et mêmes alertes que le notebook 02 | Temps différents ; provenance de ces temps **NON VÉRIFIÉE** |
| `benchmarks/results/full_10k_benchmark.json` | 10 000 lignes, 680 anomalies, résultat AE uniquement | Le rapport `benchmarks/results_full.md` contient trois modèles ; JSON incomplet pour cette comparaison |
| `paper/generate_figures.py` | Lit le Parquet 100K du notebook et le CSV de l'article | Ne mesure pas de nouveaux temps ; les figures de benchmark héritent du CSV de l'article |

Les paramètres par défaut actuels ne suffisent pas à expliquer les deux jeux
100K historiques : aucun résultat ne doit être remplacé par celui de l'autre
protocole. Le paramètre 0.02 concerne les anomalies simples ; les événements
de structuration et de haute fréquence produisent plusieurs lignes. Il ne
fixe donc pas le taux final d'anomalies à 2 %.

**Contrôle des fichiers locaux actuels :** le Parquet 100K contient bien
7 691 anomalies, mais le CSV `mauripay_m_100k.csv` présent contient lui aussi
7 691 anomalies, contrairement aux 6 548 du JSON historique. Le Parquet 10K
contient 765 anomalies (139 sur les 2 000 dernières lignes chronologiques) ;
le CSV `mauripay_s_10k.csv` présent en contient 543, contre 680 dans l'ancien
JSON. Les chemins enregistrés ne prouvent pas l'identité des entrées. Voir
[`paper/results_provenance.md`](../../paper/results_provenance.md) pour leurs
SHA-256 actuels et la distinction entre commits de stockage et d'exécution.

## Graines, environnement et limites

`generate_transactions` initialise `random.seed(42)` ; les notebooks fixent
également `numpy.random.seed(42)`. IF utilise `random_state=42` ; l'AE initialise
NumPy et PyTorch avec sa graine. La séparation chronologique ne tire pas de
permutation aléatoire. Les identifiants utilisent `uuid.uuid4()` dans
`backend/src/mauripay/ingestion/schema.py` et ne sont pas déterminés par la
graine : les fichiers et leurs empreintes peuvent différer malgré le même seed.

Les trois notebooks enregistrent Python 3.12.3 dans leurs métadonnées.
`paper/experimental_environment.md` déclare le matériel et les bibliothèques
historiques, mais ne prouve pas l'environnement exact de chaque mesure.
Les fichiers de dépendances Python utilisent des versions minimales, sans
verrouillage complet. Aucune réinstallation n'a été faite pour cet audit.

Avant publication, il reste à identifier le commit et le dataset exacts de
chaque expérience, archiver les données de référence avec leurs empreintes,
fournir un relevé complet de l'environnement associé aux exécutions, et
résoudre la provenance des temps de l'article. Une nouvelle mesure éventuelle
devra être conservée comme une nouvelle exécution, sans remplacer silencieusement
les résultats historiques.

Les montants sont synthétiques et les devises configurées sont MRU, XOF et USD.
Les notebooks additionnent directement `amount` sans conversion monétaire :
les libellés MRU des agrégats historiques ne démontrent pas une conversion.
Cette limite d'unité doit être résolue avant d'interpréter ces agrégats comme
des totaux MRU. Aucune valeur enregistrée n'a été changée.
