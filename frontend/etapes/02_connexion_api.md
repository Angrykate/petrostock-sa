# Étape 2 — Connexion à l'API backend

**Objectif de cette étape :** créer un utilitaire réutilisable pour appeler l'API FastAPI de SEGNEDJI depuis n'importe quelle page, et vérifier que la connexion fonctionne.

**Prérequis :** l'API backend doit être lancée (`uvicorn main:app --reload`, voir guides backend) et accessible sur `http://localhost:8000`.

---

## 1. Configurer l'adresse de l'API — `.env.local`

À la racine de `frontend/`, créer un fichier `.env.local` :
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Pourquoi le préfixe `NEXT_PUBLIC_` est obligatoire ici :** dans Next.js, une variable d'environnement n'est visible côté navigateur (donc utilisable dans une page) que si son nom commence par `NEXT_PUBLIC_`. Sans ce préfixe, elle ne serait accessible que côté serveur — inutile pour un simple appel `fetch` déclenché depuis le navigateur.

Ajouter aussi `.env.local` au `.gitignore` du dépôt (même si ici il n'y a pas de secret, c'est une bonne habitude à garder cohérente avec le backend).

## 2. Créer l'utilitaire d'appel API — `lib/api.js`

Créer un dossier `lib/` à la racine de `frontend/` :

```js
const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function appelApi(endpoint, options = {}) {
  const reponse = await fetch(`${API_URL}${endpoint}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!reponse.ok) {
    throw new Error(`Erreur API ${reponse.status} sur ${endpoint}`);
  }

  return reponse.json();
}

export const api = {
  get: (endpoint) => appelApi(endpoint),
  post: (endpoint, donnees) =>
    appelApi(endpoint, { method: "POST", body: JSON.stringify(donnees) }),
};
```

**Pourquoi centraliser les appels dans une seule fonction plutôt que d'écrire `fetch(...)` dans chaque page ?**
Si un jour l'adresse de l'API change, ou qu'on doit ajouter un header d'authentification partout, on modifie un seul fichier au lieu de chercher dans les 7 pages.

## 3. Tester la connexion sur la page d'accueil

Modifier temporairement `pages/index.js` :

```jsx
import { useEffect, useState } from "react";
import { api } from "../lib/api";

export default function Home() {
  const [kpi, setKpi] = useState(null);
  const [erreur, setErreur] = useState(null);

  useEffect(() => {
    api.get("/kpi/")
      .then(setKpi)
      .catch((err) => setErreur(err.message));
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-blue-900">Test connexion API</h1>
      {erreur && <p className="text-red-600 mt-4">Erreur : {erreur}</p>}
      {kpi && <pre className="mt-4 bg-slate-100 p-4 rounded">{JSON.stringify(kpi, null, 2)}</pre>}
    </div>
  );
}
```

**Explication du pattern `useEffect` + `useState` :** c'est le mécanisme standard en React pour charger des données au moment où une page s'affiche. `useState` crée une variable qui, quand elle change, redéclenche l'affichage. `useEffect` exécute le code qu'il contient une fois que la page est montée à l'écran — ici, ça déclenche l'appel à l'API dès l'arrivée sur la page.

## 4. Vérifier

Aller sur `http://localhost:3000`. Le JSON renvoyé par `/kpi/` doit s'afficher. Si une erreur CORS apparaît dans la console du navigateur, voir la section suivante.

## 5. En cas d'erreur — pistes de diagnostic courantes

| Erreur rencontrée | Cause probable |
|---|---|
| `Failed to fetch` / erreur CORS dans la console | Le middleware CORS n'est pas configuré côté API (voir guide backend Étape 9), ou l'API n'est pas lancée |
| `kpi` reste toujours `null` | Vérifier que `NEXT_PUBLIC_API_URL` est bien défini, et redémarrer `npm run dev` après avoir créé/modifié `.env.local` (Next.js ne recharge pas les variables d'environnement à chaud) |
| `undefined` dans l'URL appelée | `process.env.NEXT_PUBLIC_API_URL` n'est pas lu correctement — vérifier l'orthographe exacte du préfixe |

## 6. Vérification finale de cette étape

- [ ] `.env.local` créé avec `NEXT_PUBLIC_API_URL`
- [ ] `lib/api.js` créé et fonctionnel
- [ ] La page d'accueil affiche bien les données JSON renvoyées par `/kpi/`
- [ ] Le layout de test dans `index.js` sera remplacé par le vrai tableau de bord à l'Étape 3

Si tout est coché, tu es prêt pour l'Étape 3 (construire la première vraie page complète : le tableau de bord).

---

*Guide préparé pour le frontend — Projet PetroStock SA — EPL 2025-2026*
