# Figures de l'article

Ce dossier conserve les figures dérivées des artefacts S14. Quatre sont
incluses dans le manuscrit ; la figure de temps reste un artefact historique.

| Fichier | Contenu | Source lue par le script | Usage dans le manuscrit |
|---|---|---|---|
| `architecture.png` | Architecture en cinq couches et pipeline | Description de l'architecture dans le script | Figure 1 |
| `anomaly_distribution.png` | Répartition des anomalies injectées | CSV disponible `data/generated/mauripay_m_100k.csv` | Figure 2 |
| `benchmark_models.png` | Precision, recall, F1-score et ROC-AUC | `paper/tables/model_results.csv` | Figure 3 |
| `geographic_analysis.png` | Barres de volume et taux d'anomalies par wilaya | CSV 100K ; agrégation des rôles expéditeur et destinataire | Figure 4 |
| `benchmark_time.png` | Temps historiques d'entraînement et de prédiction | `paper/tables/model_results.csv` | Exclu ; fichier conservé |

Commande historique de génération, non exécutée lors de cette correction :

```powershell
python paper/generate_figures.py
```

Le script lit le dataset et le CSV de l'article, puis exporte cinq fichiers
PNG. Il produit encore `benchmark_time.png` ; cela ne réintègre pas cette
figure dans le manuscrit et n'authentifie pas ses mesures. Le script et toutes
les images sont conservés sans modification pendant cette phase éditoriale.
Les temps sont exclus de la comparaison principale faute de provenance
d'exécution suffisamment documentée ; voir `../results_provenance.md`.

Le Parquet 100K historique est absent. Le script lit désormais le CSV 100K
existant, sans génération automatique. Les agrégats ont été vérifiés, sans
affirmer l'identité transaction par transaction avec le Parquet disparu.
Les images existantes ne sont pas régénérées lors de ce changement d'entrée.
