# Étape 0 — Mise en place de l'environnement (Next.js + TailwindCSS)

**Objectif de cette étape :** avoir un projet Next.js qui démarre, avec TailwindCSS configuré, avant d'écrire la moindre page.

---

## 1. Créer ta branche de travail

Comme pour le backend, travaille sur ta propre branche :
```bash
git checkout -b <ton-nom>-frontend
```

## 2. Ce dont tu as besoin

- **Node.js** (version 18 ou plus récente) — vérifier avec `node --version`
- **npm** (installé avec Node.js)

## 3. Rappel de l'arborescence cible

Voici la structure de dossiers que le projet doit atteindre au fil des guides (00 à 05) — utile pour savoir où va chaque fichier créé dans les étapes suivantes :

```
frontend/
├── .env.local              ← créé à l'Étape 2 (non commité sur Git)
├── package.json
├── tailwind.config.js
├── lib/
│   └── api.js               ← créé à l'Étape 2 (utilitaire d'appel API)
├── components/
│   ├── Layout.js             ← créé à l'Étape 1
│   ├── Navbar.js              ← créé à l'Étape 1
│   ├── CarteKpi.js             ← créé à l'Étape 3
│   ├── GraphiqueStock.js        ← créé à l'Étape 3
│   └── EtatChargement.js         ← créé à l'Étape 5
├── pages/
│   ├── _app.js                 ← créé à l'Étape 1 (applique le Layout partout)
│   ├── index.js                  ← tableau de bord principal (Étape 3)
│   ├── stocks.js                  ← Étape 4
│   ├── previsions.js               ← Étape 4
│   ├── anomalies.js                 ← Étape 4
│   ├── commandes.js                  ← Étape 4
│   ├── incidents.js                   ← Étape 4
│   └── finances.js                     ← Étape 4
└── styles/
    └── globals.css              ← généré par create-next-app, contient les directives Tailwind
```

Cette arborescence correspond exactement à celle définie pour l'ensemble du dépôt GitHub — rien à inventer, juste à remplir au fur et à mesure des étapes.

## 4. Créer le projet Next.js

Depuis la racine du dépôt :
```bash
npx create-next-app@latest frontend
```

L'installateur pose plusieurs questions — voici les réponses recommandées pour ce projet :
```
Would you like to use TypeScript?        → No (reste simple en JS pour ce projet)
Would you like to use ESLint?             → Yes
Would you like to use Tailwind CSS?       → Yes
Would you like to use `src/` directory?   → No
Would you like to use App Router?         → No  (on utilise le Pages Router, cohérent avec l'arborescence pages/ déjà prévue)
Would you like to customize import alias? → No
```

**Pourquoi Pages Router et pas App Router ?** L'arborescence du dépôt prévoit un dossier `pages/` avec un fichier par page (`stocks.js`, `previsions.js`, etc.) — c'est exactement le fonctionnement du Pages Router (l'ancien système, mais toujours officiellement supporté et plus simple à appréhender pour découvrir Next.js). L'App Router (plus récent, dossier `app/`) fonctionne différemment et demanderait de revoir la structure prévue.

## 5. Lancer le serveur de développement

```bash
cd frontend
npm run dev
```

Ouvrir `http://localhost:3000` — la page d'accueil par défaut de Next.js doit s'afficher.

## 6. Vérifier que TailwindCSS fonctionne

Ouvrir `pages/index.js`, remplacer tout le contenu par :
```jsx
export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <h1 className="text-3xl font-bold text-blue-900">
        PetroStock SA — Frontend opérationnel
      </h1>
    </div>
  );
}
```

Sauvegarder et regarder le navigateur (Next.js recharge automatiquement). **Si le texte apparaît en bleu foncé, centré, sur fond gris clair**, Tailwind fonctionne correctement — les classes comme `bg-slate-100` ou `text-blue-900` sont des classes Tailwind, pas du CSS classique.

## 7. Nettoyer les fichiers de démonstration inutiles

Next.js génère des fichiers d'exemple (`pages/api/hello.js`, du CSS de démo dans `styles/`). Tu peux les laisser pour l'instant, on les remplacera au fur et à mesure — pas besoin de les supprimer manuellement dès cette étape.

## 8. En cas d'erreur — pistes de diagnostic courantes

| Erreur rencontrée | Cause probable |
|---|---|
| `command not found: npx` | Node.js n'est pas installé ou pas dans le PATH |
| Les classes Tailwind n'ont aucun effet visuel | Vérifier que `tailwind.config.js` existe et que `globals.css` contient bien les directives `@tailwind base; @tailwind components; @tailwind utilities;` |
| Port 3000 déjà utilisé | Un autre processus (peut-être un ancien `npm run dev`) tourne déjà — le terminer, ou lancer avec `npm run dev -- -p 3001` |

## 9. Vérification finale de cette étape

- [ ] `npm run dev` démarre sans erreur
- [ ] La page de test avec les classes Tailwind s'affiche correctement stylée
- [ ] Le projet est dans `frontend/` à la racine du dépôt, cohérent avec l'arborescence prévue

Si tout est coché, tu es prêt pour l'Étape 1 (première vraie page + structure).

---

*Guide préparé pour le frontend — Projet PetroStock SA — EPL 2025-2026*
