# Frontend PetroStock SA

Interface Next.js (Pages Router) + Tailwind — design clair type back-office industriel.

## Lancer

```bash
cd frontend
npm install --legacy-peer-deps
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000).

## Structure de navigation

| Section | Pages |
|---|---|
| Pilotage | `/` Tableau de bord |
| Stocks | `/stocks`, `/stocks/alertes`, `/stocks/historique` |
| Prévisions IA | `/previsions`, `/previsions/ruptures` |
| Anomalies | `/anomalies`, `/anomalies/analyser` |
| Approvisionnement | `/commandes`, `/commandes/fournisseurs`, `/commandes/nouvelle` |
| Opérations | `/incidents`, `/incidents/declarer` |
| Finances | `/finances`, `/finances/factures`, `/finances/clients` |

Le menu latéral s'adapte au **profil** (dépôt / achats / direction).

## Mock vs API réelle

Par défaut le mode mock est actif. Pour brancher le backend :

1. Créer `frontend/.env.local` :
   ```
   NEXT_PUBLIC_USE_MOCK=false
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```
2. Démarrer l'API FastAPI avec CORS autorisant `http://localhost:3000`.
