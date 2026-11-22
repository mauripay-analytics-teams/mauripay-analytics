# Article SoftwareX — S15

Ce dossier est séparé de la documentation technique et des expériences :

```text
docs/       documentation technique
backend/notebooks/  expériences reproductibles
paper/      article scientifique
```

- `manuscript.md` contient le texte de l'article ;
- `metadata.md` contient les informations éditoriales et les déclarations ;
- `experimental_environment.md` documente le protocole et distingue les versions
  vérifiées actuellement des déclarations historiques ;
- `results_provenance.md` inventorie les artefacts, les empreintes SHA-256 des
  datasets locaux et les limites de traçabilité ;
- `generate_figures.py` peut générer cinq figures, dont une figure historique
  de temps exclue du manuscrit ;
- `review_checklist.md` guide la relecture scientifique et éditoriale ;
- `references.bib` contient les références BibTeX vérifiées ;
- `figures/` contient les quatre illustrations incluses dans le manuscrit et
  `benchmark_time.png`, conservé uniquement comme artefact historique ;
- `tables/` contient les résultats numériques et les métadonnées du logiciel.

Le tableau principal conserve les métriques de détection vérifiées, dont
l'accuracy, et le nombre d'alertes. Les temps historiques sont exclus faute
de provenance d'exécution suffisamment documentée. Les CSV/JSON originaux
restent inchangés ; une nouvelle exécution éventuelle doit être identifiée
séparément, sans remplacement silencieux des résultats historiques.
