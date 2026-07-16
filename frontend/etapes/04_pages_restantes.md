# Étape 4 — Les 6 pages restantes

**Objectif de cette étape :** répéter le pattern de l'Étape 3 (chargement/erreur, cartes, graphique, liste) pour chacune des pages restantes. Pas de nouveau concept ici — c'est la même méthode appliquée à d'autres endpoints.

---

## 1. `pages/stocks.js`

```jsx
import { useEffect, useState } from "react";
import { api } from "../lib/api";
import GraphiqueStock from "../components/GraphiqueStock";

export default function Stocks() {
  const [depotId, setDepotId] = useState("D001");
  const [donnees, setDonnees] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);

  useEffect(() => {
    setChargement(true);
    api.get(`/stocks/${depotId}`)
      .then(setDonnees)
      .catch((err) => setErreur(err.message))
      .finally(() => setChargement(false));
  }, [depotId]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-blue-900 mb-6">Gestion des stocks</h1>

      <select
        value={depotId}
        onChange={(e) => setDepotId(e.target.value)}
        className="border rounded px-3 py-2 mb-6"
      >
        <option value="D001">Dépôt Central Lomé</option>
        <option value="D002">Terminal Portuaire Lomé</option>
        {/* compléter avec les 8 dépôts, cf. documentation des données */}
      </select>

      {chargement && <p className="text-slate-500">Chargement...</p>}
      {erreur && <p className="text-red-600">Erreur : {erreur}</p>}
      {!chargement && !erreur && (
        <div className="bg-white rounded-lg shadow p-6">
          <GraphiqueStock donnees={donnees} />
        </div>
      )}
    </div>
  );
}
```

**Point nouveau par rapport à l'Étape 3 :** le tableau `[depotId]` à la fin de `useEffect` — ça dit à React de **relancer l'appel API** à chaque fois que `depotId` change (donc à chaque sélection dans la liste déroulante). Sans ce tableau de dépendances, le graphique resterait figé sur le premier dépôt chargé.

## 2. `pages/previsions.js`

```jsx
import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function Previsions() {
  const [produitId, setProduitId] = useState("PRD003");
  const [depotId, setDepotId] = useState("D001");
  const [prevision, setPrevision] = useState(null);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    setChargement(true);
    api.get(`/previsions/${produitId}?depot_id=${depotId}`)
      .then(setPrevision)
      .finally(() => setChargement(false));
  }, [produitId, depotId]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-blue-900 mb-6">Prévisions IA — 30 jours</h1>
      {chargement && <p className="text-slate-500">Calcul de la prévision...</p>}
      {!chargement && prevision && (
        <div className="bg-white rounded-lg shadow p-6">
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={prevision.prevision.map((val, i) => ({ jour: i + 1, valeur: val }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="jour" label={{ value: "Jours", position: "insideBottom", offset: -5 }} />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="valeur" stroke="#14325A" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
```

**Note :** la transformation `prevision.prevision.map(...)` dépend de la forme exacte renvoyée par l'endpoint `/previsions/{produit_id}` côté API (cf. guide backend Étape 7) — à ajuster une fois cette forme confirmée par SIDIBE/SEGNEDJI. L'intervalle de confiance (mentionné dans le cahier des tâches) nécessiterait deux lignes supplémentaires sur le graphique (borne haute/basse) si le modèle Prophet les renvoie.

## 3. `pages/anomalies.js`

```jsx
import { useEffect, useState } from "react";
import { api } from "../lib/api";

export default function Anomalies() {
  const [anomalies, setAnomalies] = useState([]);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    api.get("/anomalies/")
      .then(setAnomalies)
      .finally(() => setChargement(false));
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-blue-900 mb-6">Anomalies détectées</h1>
      {chargement && <p className="text-slate-500">Chargement...</p>}
      {!chargement && (
        <table className="w-full bg-white rounded-lg shadow overflow-hidden">
          <thead className="bg-blue-950 text-white">
            <tr>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Dépôt</th>
              <th className="p-3 text-left">Produit</th>
              <th className="p-3 text-left">Sorties</th>
            </tr>
          </thead>
          <tbody>
            {anomalies.map((a, i) => (
              <tr key={i} className="border-t">
                <td className="p-3">{a.date}</td>
                <td className="p-3">{a.depot_id}</td>
                <td className="p-3">{a.produit_id}</td>
                <td className="p-3">{a.sorties}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
```

**Point à ajouter une fois le format confirmé :** le cahier des tâches demande un "score de suspicion" par anomalie — si l'endpoint `/anomalies/` le renvoie, ajouter une colonne supplémentaire au tableau.

## 4. `pages/commandes.js` (avec formulaire de création)

```jsx
import { useEffect, useState } from "react";
import { api } from "../lib/api";

export default function Commandes() {
  const [commandes, setCommandes] = useState([]);
  const [formulaire, setFormulaire] = useState({
    date_commande: "", fournisseur_id: "", depot_destination_id: "",
    produit_id: "", quantite_commandee: "",
  });

  const chargerCommandes = () => api.get("/commandes/").then(setCommandes);

  useEffect(() => { chargerCommandes(); }, []);

  const soumettre = async (e) => {
    e.preventDefault();
    await api.post("/commandes/", formulaire);
    setFormulaire({ date_commande: "", fournisseur_id: "", depot_destination_id: "", produit_id: "", quantite_commandee: "" });
    chargerCommandes(); // recharge la liste après création
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-blue-900 mb-6">Commandes fournisseurs</h1>

      <form onSubmit={soumettre} className="bg-white rounded-lg shadow p-6 mb-8 grid grid-cols-2 gap-4">
        <input type="date" value={formulaire.date_commande}
          onChange={(e) => setFormulaire({ ...formulaire, date_commande: e.target.value })}
          className="border rounded px-3 py-2" required />
        <input placeholder="ID Fournisseur" value={formulaire.fournisseur_id}
          onChange={(e) => setFormulaire({ ...formulaire, fournisseur_id: e.target.value })}
          className="border rounded px-3 py-2" required />
        <input placeholder="ID Dépôt destination" value={formulaire.depot_destination_id}
          onChange={(e) => setFormulaire({ ...formulaire, depot_destination_id: e.target.value })}
          className="border rounded px-3 py-2" required />
        <input placeholder="ID Produit" value={formulaire.produit_id}
          onChange={(e) => setFormulaire({ ...formulaire, produit_id: e.target.value })}
          className="border rounded px-3 py-2" required />
        <input type="number" placeholder="Quantité" value={formulaire.quantite_commandee}
          onChange={(e) => setFormulaire({ ...formulaire, quantite_commandee: e.target.value })}
          className="border rounded px-3 py-2" required />
        <button type="submit" className="bg-blue-900 text-white rounded px-4 py-2 hover:bg-blue-800">
          Créer la commande
        </button>
      </form>

      <table className="w-full bg-white rounded-lg shadow overflow-hidden">
        <thead className="bg-blue-950 text-white">
          <tr><th className="p-3 text-left">ID</th><th className="p-3 text-left">Statut</th><th className="p-3 text-left">Montant</th></tr>
        </thead>
        <tbody>
          {commandes.map((c) => (
            <tr key={c.bon_commande_id} className="border-t">
              <td className="p-3">{c.bon_commande_id}</td>
              <td className="p-3">{c.statut}</td>
              <td className="p-3">{c.montant_total ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

**Point nouveau : formulaire contrôlé.** Chaque `<input>` a sa valeur reliée à `formulaire.xxx`, et `onChange` met à jour cet état à chaque frappe — c'est le pattern standard React pour les formulaires ("controlled components"). `soumettre` empêche le rechargement de page par défaut du navigateur (`e.preventDefault()`), envoie les données à l'API, réinitialise le formulaire, puis recharge la liste.

## 5. `pages/incidents.js`

Même structure que `commandes.js` (liste + formulaire), adaptée aux champs d'incident (`date_incident`, `depot_id`, `type_incident`, `description`). Après création, afficher la `gravite` renvoyée par l'API (remplie automatiquement par le modèle IA, cf. guide backend Étape 7) :

```jsx
const soumettre = async (e) => {
  e.preventDefault();
  const nouvelIncident = await api.post("/incidents/", formulaire);
  alert(`Incident enregistré — gravité estimée : ${nouvelIncident.gravite}`);
  chargerIncidents();
};
```

## 6. `pages/finances.js`

```jsx
import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import CarteKpi from "../components/CarteKpi";

export default function Finances() {
  const [factures, setFactures] = useState([]);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    api.get("/factures/").then(setFactures).finally(() => setChargement(false));
  }, []);

  const totalFacture = factures.reduce((somme, f) => somme + f.montant_ttc, 0);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-blue-900 mb-6">Ventes et finances</h1>
      {!chargement && (
        <>
          <div className="grid grid-cols-2 gap-4 mb-8">
            <CarteKpi titre="Chiffre d'affaires total (page courante)" valeur={`${totalFacture.toLocaleString()} FCFA`} />
            <CarteKpi titre="Nombre de factures" valeur={factures.length} />
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={factures.slice(0, 20)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="facture_id" hide />
                <YAxis />
                <Tooltip />
                <Bar dataKey="montant_ttc" fill="#14325A" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}
```

## 7. Vérification finale de cette étape

- [ ] Les 6 pages sont créées et affichent de vraies données de l'API
- [ ] `stocks.js` change bien de données quand on change de dépôt dans le menu déroulant
- [ ] `commandes.js` et `incidents.js` créent bien une nouvelle ligne visible après soumission du formulaire
- [ ] Chaque page gère proprement le chargement (pas d'erreur affichée avant que les données arrivent)

Si tout est coché, les 7 pages sont fonctionnelles. Prêt pour l'Étape 5 (finalisation : responsive, cohérence visuelle, tests).

---

*Guide préparé pour le frontend — Projet PetroStock SA — EPL 2025-2026*
