# Article SoftwareX — S15

Ce dossier est séparé de la documentation technique et des expériences :

```text
docs/       documentation technique
notebooks/  expériences reproductibles
paper/      article scientifique
```

- `manuscript.md` contient le texte de l'article ;
- `metadata.md` contient les informations éditoriales et les déclarations ;
- `experimental_environment.md` fige le protocole, le matériel et les versions ;
- `generate_figures.py` régénère les cinq figures de publication ;
- `review_checklist.md` guide la relecture scientifique et éditoriale ;
- `references.bib` contient les références BibTeX vérifiées ;
- `figures/` contient les illustrations finales issues des notebooks ;
- `tables/` contient les résultats numériques et les métadonnées du logiciel.

Les valeurs expérimentales doivent toujours être synchronisées avec les
notebooks exécutés avec **Kernel → Restart & Run All**.
