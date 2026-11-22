# Traçabilité des résultats scientifiques

Cette inspection est réalisée en lecture seule pour les données et résultats,
sur la branche `eby`. Aucun dataset n'a été régénéré, aucun modèle entraîné et
aucune expérience réexécutée. Les empreintes ci-dessous identifient les fichiers
locaux présents, pas automatiquement les entrées historiques. Un nom de fichier,
un effectif ou des métriques proches ne suffisent pas à prouver cette identité.

## Datasets disponibles et référence historique absente

Les empreintes sont calculées sur tous les octets des fichiers, sans modifier
leur contenu. Les effectifs sont lus dans les fichiers 10K/100K ; seuls les
octets du fichier 1M sont lus pour son empreinte, sans recalcul d'expérience.

| Fichier dans `data/generated/` | Octets | Lignes / anomalies constatées | SHA-256 |
|---|---:|---|---|
| `mauripay_m_notebook_100k.parquet` **ABSENT — référence historique** | 6618247 (historique) | 100000 / 7691 (historique) | `110969ca9474da854f73c1491b363eafe2d173e6599664bada441278568d8f92` |
| `mauripay_m_100k.csv` | 17830053 | 100000 / 7691 | `32019dc6c92f1f7c3ebb8bfb689de00b766a35b2cbc350ec5e8aa4abd7aa3aa3` |
| `mauripay_s_notebook_10k.parquet` | 739111 | 10000 / 765 ; 139 anomalies sur les 2000 dernières lignes chronologiques | `4b5fcfbe486305a4ccdcfacbe48c308af5713a645c01d7c7bc67cfc7518da838` |
| `mauripay_s_10k.csv` | 1786523 | 10000 / 543 | `596529f1bf2b5eb44c9ea12436d385b076437c293191852c2917a4b15435103f` |
| `mauripay_l_1m.parquet` | 63156556 | Effectifs non recomptés pendant cette inspection | `46bd9d6283763359b849b3b5b23e5ca9a3501067e345998377906e0e9a2d0083` |

Le Parquet 100K a été supprimé localement ; sa taille, ses effectifs et son
SHA-256 ci-dessus proviennent du relevé antérieur, pas d'une vérification
actuelle de ce fichier absent. Le CSV 100K disponible présente 92222 lignes
MRU, 4878 XOF et 2900 USD ; il contient 4040 HIGH_FREQUENCY, 1780 STRUCTURING,
960 HIGH_AMOUNT, 534 OPERATOR_OUTAGE et 377 UNUSUAL_LOCATION.
Il est désormais la source disponible du notebook 01 et du script de figures.
Les agrégats descriptifs du manuscrit et les cinq colonnes du tableau
géographique sauvegardé ont été vérifiés à partir de ce CSV. Cette concordance
ne démontre pas l'identité de toutes les transactions avec le Parquet disparu.

Le JSON `benchmarks/results/full_100k_benchmark.json` enregistre en revanche
100000 lignes, **6548 anomalies** et 93452 normales, sous le chemin du CSV 100K.
Son entrée historique n'est donc pas authentifiée par le fichier actuel à ce
chemin. L'empreinte du fichier historique à 6548 anomalies est **NON VÉRIFIÉE**.
Même constat pour le JSON 10K : 680 anomalies enregistrées, contre 543 dans le
CSV actuel. Aucune cause de remplacement ou de modification passée des données
n'est déduite de cette différence.

Les trois datasets 10K/100K encore disponibles dans cette table ne sont pas
suivis dans Git ; leur présence locale ne prouve pas leur disponibilité
publique. Aucun nouvel archivage n'est réalisé.
Pour vérifier un fichier disponible, sous PowerShell :

```powershell
Get-FileHash -Algorithm SHA256 -LiteralPath data/generated/mauripay_m_100k.csv
Get-FileHash -Algorithm SHA256 -LiteralPath data/generated/mauripay_s_notebook_10k.parquet
```

## Artefacts historiques et commits de stockage

`git log --diff-filter=A --format=%H -- <fichier>` identifie l'introduction
dans l'historique disponible. Cela **n'identifie pas le commit exécuté**.

| Artefact | Premier commit de stockage retrouvé | Commit d'exécution |
|---|---|---|
| Trois notebooks et CSV `backend/notebooks/outputs/02_benchmark/comparaison_modeles.csv` | `0049f92abee5b6da201cdb042c26728e86a25755` | NON VÉRIFIÉ |
| `paper/tables/model_results.csv` | `0049f92abee5b6da201cdb042c26728e86a25755` | NON VÉRIFIÉ |
| JSON `full_10k_benchmark.json` et `full_100k_benchmark.json` | `6418d93add400c31236d4f4bbf97f5fd3625b861` | NON VÉRIFIÉ |

Le commit courant de travail n'est attribué à aucune expérience historique.
Les timestamps `generated_at` enregistrés par les JSON sont respectivement
`2026-06-01T12:34:41.028389+00:00` (10K) et
`2026-05-31T12:02:45.149652+00:00` (100K). Ce sont des déclarations de
l'artefact, pas une preuve indépendante de l'environnement ou du commit.

## Protocoles et paramètres observables

| Expérience | Entrée référencée | Paramètres observables et graine |
|---|---|---|
| Exploration du notebook 01 | Historiquement Parquet 100K (absent) ; lecture actuelle du CSV 100K sans génération automatique | Génération historique décrite : 100000 lignes, 5000 comptes par défaut, 2026-01-01 à 2026-03-31 par défaut, seed 42, anomalies simples 0.02, tontines 0.001, structuring 0.003, haute fréquence 0.002 ; cela n'authentifie pas l'exécution ayant créé le CSV |
| Benchmark du notebook 02 | Parquet 10K ; tri temporel 8000/2000 | IF 100 arbres, contamination 0.02, random_state 42 ; LOF 20 voisins, contamination 0.02, Minkowski ; AE hidden_dims (32,16), latent 8, 10 époques, batch 128, percentile 98, CPU, random_state 42 |
| Géographie du notebook 03 | Premier fichier présent : Parquet 100K, puis CSV 100K | Agrégation des rôles expéditeur et destinataire ; génération si aucun fichier disponible avec seed 42 et paramètres par défaut ; pas d'entraînement |
| Ancien JSON full 10K | Chemin du CSV 10K ; contenu actuel différent | AE seul enregistré : 50 époques, batch 128, latent 8, hidden_dims (32,16), percentile 98, random_state 42, input_dim 139, seuil 0.3902172499895058 |
| Ancien JSON full 100K | Chemin du CSV 100K ; contenu actuel différent | IF 100 arbres, contamination 0.02, random_state 42 ; LOF 20 voisins, contamination 0.02, Minkowski, novelty true ; AE 50 époques, batch 128, latent 8, hidden_dims (32,16), percentile 98, random_state 42, input_dim 139, seuil 0.24523644298315048 |

Les détails complets restent dans les sources et JSON. Le code actuel du runner
full ajuste IF/LOF sur toutes les lignes et l'AE sur les lignes normales, puis
évalue le dataset entier. Il ne démontre pas à lui seul quelle révision exacte
a produit les anciens JSON. La graine du générateur historique et l'ensemble
de ses paramètres ne sont pas enregistrés dans ces JSON : **NON VÉRIFIÉ**.
`device=null` dans leurs paramètres AE n'atteste pas un calcul sur CPU.

Les fichiers `backend/models/metadata.json` et `metadata_autoencoder.json`
décrivent encore une autre expérience : chemin `mauripay_l_1m.parquet`, un
million de lignes déclarées, dates enregistrées du 11 juin 2026. Le premier
indique `test_size=0`, évaluation sur l'entraînement et LOF plafonné à 20000
lignes. Les paramètres AE enregistrent 50 époques, percentile 94.5 et une
dimension d'entrée 166. Le second déclare 927469 lignes normales pour
l'entraînement AE. Ces métadonnées ne prouvent pas que ces modèles ont produit
le benchmark chronologique 10K. Aucun fichier joblib n'a été désérialisé lors
de cette inspection, et aucun résultat 1M n'est attribué à l'article.

## Résultats et temps conservés

Les métriques précision, rappel, F1, accuracy et ROC-AUC du CSV de l'article
concordent à l'arrondi avec le CSV exporté du notebook 02 ; les alertes sont
25, 41 et 133. Les sorties intégrées au notebook confirment les valeurs du
CSV du notebook. Les fichiers sont inchangés.

Par décision éditoriale validée par les auteurs, le tableau principal du
manuscrit conserve précision, rappel, F1, accuracy, ROC-AUC et alertes, mais
exclut les colonnes de temps. Les tableaux de temps ci-dessous documentent
les artefacts historiques et ne sont pas des mesures reproductibles utilisées
pour la comparaison principale. Le fichier `benchmark_time.png` est conservé
sans être inclus dans le manuscrit ; la figure géographique devient la figure 4.

| Modèle | Article : entraînement / prédiction (s) | Notebook : entraînement / prédiction (s) |
|---|---|---|
| Isolation Forest | 0.559693 / 0.038668 | 0.641137 / 0.034514 |
| LOF | 6.225830 / 0.407714 | 5.478418 / 0.376920 |
| Autoencoder | 13.046145 / 0.014021 | 10.736425 / 0.009075 |

Les temps non arrondis sont dans les CSV respectifs. La provenance des temps
du CSV de l'article est **NON VÉRIFIÉE**. Une variabilité normale entre exécutions
ne suffit pas à attribuer ces chiffres à une exécution particulière.

Les temps des JSON full sont distincts : AE 10K 45.393243 / 0.153979 s ;
IF 100K 1.909468 / 2.620013 s ; LOF 100K 117.391673 / 180.365671 s ;
AE 100K 174.338076 / 0.377557 s. Ils restent associés aux anciens rapports,
sans substitution aux temps du notebook ou de l'article.

## Environnement et limites scientifiques

Voir [experimental_environment.md](experimental_environment.md) pour les
versions déclarées, les versions installées actuellement vérifiées et les
informations historiques inconnues. La concordance des versions actuelles avec
la fiche ne prouve pas l'environnement historique. Il manque un manifeste par
exécution associant commit, empreinte d'entrée, paramètres et dépendances.

Le générateur initialise `random.seed` ; les notebooks initialisent NumPy et
les modèles concernés utilisent une graine 42. Les UUID4 ne sont pas déterminés
par ces graines. Aucun hash actuel ne doit être présenté comme un hash d'entrée
historique sans preuve supplémentaire.

Les agrégats `amount` des notebooks 01 et 03 mélangent MRU, XOF et USD sans
conversion ; les anciens libellés MRU dans leurs sorties sont conservés comme
artefacts historiques, pas validés comme unités correctes. Le manuscrit retire
l'attribution MRU des sommes, moyennes, médianes et maxima concernés. Aucune
monnaie commune, aucun taux de change ni résultat recalculé n'est introduit.

La décision éditoriale exclut les temps non traçables de la comparaison
principale et retire les conclusions comparatives correspondantes. Elle
n'authentifie pas les anciennes mesures. Les journaux d'exécution restent
nécessaires pour toute réutilisation future de ces temps comme mesures
reproductibles. Aucun chiffre enregistré ni aucune empreinte de dataset n'a
été modifié ; aucune nouvelle expérience n'a été exécutée.
