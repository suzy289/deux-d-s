# 🎲 Jeu des Deux Dés (Pig Dice)

Jeu des deux dés en React + TypeScript + Tailwind CSS. 2 à 4 joueurs (humains ou IA), objectif : atteindre 100 points en premier.

## Lancer le projet

```bash
npm install
npm run dev
```

Ouvrir [http://localhost:5173](http://localhost:5173).

## Règles

- **Lancer les dés** : ajoute les points au score du tour (temporaire).
- **Garder** : enregistre le score du tour dans le total et passe au joueur suivant.
- **Double 1** : perte de tout le score total, tour terminé.
- **Un 1** : perte du score du tour uniquement, tour terminé.
- **Double identique** (ex. 2-2) : points doublés, relance obligatoire.
- **Double 6** : 12 + 25 points bonus, puis choix de garder ou relancer.

## Build

```bash
npm run build
npm run preview
```
