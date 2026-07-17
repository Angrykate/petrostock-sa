# Frontend PetroStock SA

Interface Next.js (Pages Router) + Tailwind.

## Prérequis

- Node.js 18+ (idéalement 20+)
- npm

## Installation (une seule fois)

```bash
cd frontend
npm install
```

Si npm se plaint de conflits de peers :

```bash
npm install --legacy-peer-deps
```

## Démarrer le serveur

Dans un terminal PowerShell :

```bash
cd c:\Users\USER\Documents\Projet\ProjetDeStage\frontend
npm run dev
```

Puis ouvre : [http://localhost:3000](http://localhost:3000)

Le terminal affiche `✓ Ready` quand c’est bon. **Laisse ce terminal ouvert** tant que tu utilises l’app.

## Arrêter le serveur

Dans le **même terminal** où tourne `npm run dev` :

- `Ctrl + C`
- Confirme avec `O` / `Y` si Windows le demande

Le serveur est coupé : plus rien sur le port 3000.

### Si le port reste bloqué

```powershell
Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue |
  ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
```

## Autres commandes utiles

| Commande | Rôle |
|---|---|
| `npm run dev` | Développement (rechargement auto) |
| `npm run build` | Build de production |
| `npm run start` | Servir le build (après `build`) |
| `npm run lint` | Vérifier le code |

## Mode mock / API réelle

Par défaut le frontend utilise des données mock (`.env.local`) :

```
NEXT_PUBLIC_USE_MOCK=true
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Pour brancher le vrai backend FastAPI : mets `NEXT_PUBLIC_USE_MOCK=false`, lance l’API, puis redémarre `npm run dev`.

## Menu principal

Pilotage · Alertes · Stocks · Prévisions IA · Anomalies · Commandes · Incidents · Finances

Le menu s’adapte au **profil** (dépôt / achats / direction) en bas de la barre latérale.
