# Étape 3 — Tableau de bord principal (page modèle)

**Objectif de cette étape :** construire une page complète, du début à la fin — KPI, alertes, graphique — qui servira ensuite de modèle à recopier pour les 6 autres pages (Étape 4).

**Prérequis :** installer une bibliothèque de graphiques.

```bash
npm install recharts
```

**Pourquoi Recharts ?** C'est la bibliothèque la plus simple à intégrer avec React (composants directs, pas de configuration complexe comme Chart.js), bien documentée, et suffisante pour tous les types de graphiques prévus dans ce projet (courbes, barres). C'est un choix par défaut raisonnable — si l'équipe a une préférence différente (Plotly, Chart.js), le principe des étapes suivantes reste identique, seule la syntaxe des composants graphiques change.

---

## 1. Remettre `pages/index.js` dans son état définitif

```jsx
import { useEffect, useState } from "react";
import { api } from "../lib/api";
import CarteKpi from "../components/CarteKpi";
import GraphiqueStock from "../components/GraphiqueStock";

export default function Dashboard() {
  const [kpi, setKpi] = useState(null);
  const [alertes, setAlertes] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);

  useEffect(() => {
    Promise.all([api.get("/kpi/"), api.get("/stocks/alertes/")])
      .then(([donneesKpi, donneesAlertes]) => {
        setKpi(donneesKpi);
        setAlertes(donneesAlertes);
      })
      .catch((err) => setErreur(err.message))
      .finally(() => setChargement(false));
  }, []);

  if (chargement) return <div className="p-8 text-slate-500">Chargement...</div>;
  if (erreur) return <div className="p-8 text-red-600">Erreur : {erreur}</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-blue-900 mb-6">Tableau de bord</h1>

      {/* Cartes KPI */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <CarteKpi titre="Valeur totale du stock" valeur={`${kpi.valeur_totale_stock_usd.toLocaleString()} USD`} />
        <CarteKpi titre="Alertes actives" valeur={kpi.nombre_alertes_actives} accent="rouge" />
        <CarteKpi titre="Taux de remplissage moyen" valeur={`${kpi.taux_remplissage_moyen_pct}%`} />
        <CarteKpi titre="Incidents ouverts" valeur={kpi.incidents_ouverts} accent="orange" />
      </div>

      {/* Liste des alertes */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-semibold text-blue-900 mb-4">Alertes de stock bas</h2>
        {alertes.length === 0 ? (
          <p className="text-slate-500">Aucune alerte active</p>
        ) : (
          <ul className="divide-y">
            {alertes.slice(0, 10).map((alerte, i) => (
              <li key={i} className="py-2 flex justify-between">
                <span>{alerte.depot_id} — {alerte.produit_id}</span>
                <span className="text-red-600 font-medium">Stock bas</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
```

## 2. Créer le composant réutilisable `components/CarteKpi.js`

```jsx
export default function CarteKpi({ titre, valeur, accent = "bleu" }) {
  const couleurs = {
    bleu: "border-blue-900 text-blue-900",
    rouge: "border-red-600 text-red-600",
    orange: "border-orange-500 text-orange-500",
  };

  return (
    <div className={`bg-white rounded-lg shadow p-5 border-l-4 ${couleurs[accent]}`}>
      <p className="text-sm text-slate-500">{titre}</p>
      <p className="text-2xl font-bold mt-1">{valeur}</p>
    </div>
  );
}
```

**Pourquoi un composant séparé pour une simple carte ?** Parce qu'il est réutilisé 4 fois sur cette page (et sera probablement réutilisé sur d'autres pages aussi) — modifier son style se fait à un seul endroit plutôt que 4 fois.

## 3. Créer le composant graphique `components/GraphiqueStock.js`

```jsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function GraphiqueStock({ donnees }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={donnees}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="stock_fin_jour" stroke="#14325A" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
```

**Explication des éléments Recharts :**
- `ResponsiveContainer` : fait en sorte que le graphique s'adapte à la largeur de son conteneur parent (important pour que ce soit responsive sur mobile/tablette).
- `dataKey="date"` / `dataKey="stock_fin_jour"` : ces noms doivent correspondre **exactement** aux clés du JSON renvoyé par l'API (`StockOut` côté backend, cf. guide backend Étape 4).

**Ce composant n'est pas encore branché dans le dashboard ci-dessus** — il sera utilisé à l'Étape 4 sur la page Stocks, où l'historique d'un dépôt précis a plus de sens qu'une vue globale. Le créer maintenant permet de le réutiliser tel quel.

## 4. Gérer les états de chargement et d'erreur — un principe à généraliser

Remarque le pattern utilisé dans `index.js` : `chargement`, `erreur`, et l'affichage conditionnel avant le contenu réel. **Ce pattern doit être répété sur les 6 autres pages** — sans lui, une page qui n'a pas encore reçu sa réponse API afficherait des erreurs (`Cannot read property of undefined`) le temps que les données arrivent.

## 5. Vérifier

Aller sur `/`. Les cartes KPI doivent afficher de vraies valeurs, la liste d'alertes doit se remplir (ou afficher "Aucune alerte active" si la base n'en contient pas).

## 6. En cas d'erreur — pistes de diagnostic courantes

| Erreur rencontrée | Cause probable |
|---|---|
| `Cannot read properties of null` | Le rendu essaie d'accéder à `kpi.xxx` avant que les données soient arrivées — vérifier que la condition `if (chargement)` est bien placée avant le retour du JSX principal |
| Graphique vide | `donnees` n'est pas passé au composant, ou le format ne correspond pas aux `dataKey` utilisés |
| Les cartes KPI affichent `undefined` | Le nom de propriété dans `kpi.xxx` ne correspond pas exactement à celui renvoyé par `/kpi/` côté API |

## 7. Vérification finale de cette étape

- [ ] `components/CarteKpi.js` et `components/GraphiqueStock.js` créés
- [ ] La page d'accueil affiche KPI + alertes avec de vraies données
- [ ] Le pattern chargement/erreur est bien compris (il sera recopié sur les 6 pages restantes)

Si tout est coché, tu es prêt pour l'Étape 4 — recopier ce pattern pour les pages restantes.

---

*Guide préparé pour le frontend — Projet PetroStock SA — EPL 2025-2026*
