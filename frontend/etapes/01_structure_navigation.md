# Étape 1 — Structure de base et navigation entre pages

**Objectif de cette étape :** avoir les 7 pages prévues qui existent (même vides) et un moyen de naviguer entre elles, avant de remplir le contenu de chacune.

---

## 1. Comprendre le routage automatique de Next.js

Avec le Pages Router, **chaque fichier dans `pages/` devient automatiquement une URL** — pas besoin de configurer un routeur à la main comme avec React seul.

| Fichier | URL correspondante |
|---|---|
| `pages/index.js` | `/` (page d'accueil) |
| `pages/stocks.js` | `/stocks` |
| `pages/previsions.js` | `/previsions` |
| `pages/anomalies.js` | `/anomalies` |
| `pages/commandes.js` | `/commandes` |
| `pages/incidents.js` | `/incidents` |
| `pages/finances.js` | `/finances` |

## 2. Créer les 6 pages manquantes (squelette minimal)

Pour chaque fichier (`pages/stocks.js`, `pages/previsions.js`, etc.), un contenu minimal identique au départ :

```jsx
export default function Stocks() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-blue-900">Gestion des stocks</h1>
      <p className="text-slate-500 mt-2">Page en construction</p>
    </div>
  );
}
```
(adapter le nom de la fonction et le titre pour chaque page : `Previsions`, `Anomalies`, `Commandes`, `Incidents`, `Finances`)

## 3. Créer un composant de navigation — `components/Navbar.js`

Créer le dossier `components/` (déjà prévu dans l'arborescence) :

```jsx
import Link from "next/link";
import { useRouter } from "next/router";

const LIENS = [
  { href: "/", label: "Tableau de bord" },
  { href: "/stocks", label: "Stocks" },
  { href: "/previsions", label: "Prévisions" },
  { href: "/anomalies", label: "Anomalies" },
  { href: "/commandes", label: "Commandes" },
  { href: "/incidents", label: "Incidents" },
  { href: "/finances", label: "Finances" },
];

export default function Navbar() {
  const router = useRouter();

  return (
    <nav className="bg-blue-950 text-white px-6 py-4 flex gap-6 flex-wrap">
      <span className="font-bold text-lg mr-4">PetroStock SA</span>
      {LIENS.map((lien) => (
        <Link
          key={lien.href}
          href={lien.href}
          className={`hover:text-blue-300 transition ${
            router.pathname === lien.href ? "text-blue-300 font-semibold" : "text-white"
          }`}
        >
          {lien.label}
        </Link>
      ))}
    </nav>
  );
}
```

**Explication des éléments Next.js utilisés :**
- `next/link` (`<Link>`) : équivalent d'un `<a>`, mais qui navigue **sans recharger toute la page** — plus rapide, garde l'application réactive.
- `next/router` (`useRouter`) : permet de savoir sur quelle page on se trouve actuellement (`router.pathname`), utilisé ici pour surligner le lien actif.

## 4. Créer un layout partagé — `components/Layout.js`

Plutôt que de coller `<Navbar />` dans chacune des 7 pages, on crée un composant qui enveloppe le contenu :

```jsx
import Navbar from "./Navbar";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main>{children}</main>
    </div>
  );
}
```

## 5. Appliquer ce layout à toutes les pages via `pages/_app.js`

C'est un fichier spécial de Next.js : tout ce qu'il contient enveloppe **automatiquement** toutes les pages, sans avoir à le répéter dans chacune.

```jsx
import Layout from "../components/Layout";
import "../styles/globals.css";

export default function App({ Component, pageProps }) {
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}
```

## 6. Vérifier

Relancer `npm run dev`, aller sur `/`. La barre de navigation doit apparaître en haut, avec les 7 liens, et cliquer sur chacun doit afficher la page correspondante (encore vide) sans rechargement complet du navigateur (regarde l'URL changer sans "flash" blanc).

## 7. En cas d'erreur — pistes de diagnostic courantes

| Erreur rencontrée | Cause probable |
|---|---|
| `Navbar` ne s'affiche sur aucune page | `_app.js` n'utilise pas `Layout`, ou mauvais chemin d'import |
| Erreur "Cannot find module" | Chemin d'import incorrect entre `pages/` et `components/` (vérifier les `../`) |
| Le lien actif ne se surligne pas | `router.pathname` ne correspond pas exactement au `href` (vérifier les majuscules/slashes) |

## 8. Vérification finale de cette étape

- [ ] Les 7 pages existent et sont accessibles par leur URL
- [ ] La Navbar est visible sur toutes les pages, avec le lien actif surligné
- [ ] La navigation entre pages ne recharge pas complètement le navigateur

Si tout est coché, tu es prêt pour l'Étape 2 (connexion à l'API backend).

---

*Guide préparé pour le frontend — Projet PetroStock SA — EPL 2025-2026*
