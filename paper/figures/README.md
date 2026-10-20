# Figures de l'article

Ce dossier contient les figures finales dérivées des résultats S14 :

| Fichier attendu | Contenu | Source |
|---|---|---|
| `architecture.png` | Architecture en cinq couches et pipeline | Architecture du projet |
| `benchmark_models.png` | Precision, recall, F1-score et ROC-AUC | Notebook 2 |
| `benchmark_time.png` | Temps d'entraînement et de prédiction | Notebook 2 |
| `anomaly_distribution.png` | Répartition des anomalies injectées | Notebook 1 |
| `geographic_analysis.png` | Transactions et anomalies par wilaya | Notebook 3 |

Les images sont régénérées sans capture d'écran par :

```powershell
python paper/generate_figures.py
```

Le script lit le dataset reproductible de S14 et le tableau figé du benchmark,
puis exporte cinq fichiers PNG à 300 dpi. Toute modification des résultats doit
être suivie d'une nouvelle exécution du script et d'une vérification visuelle.
