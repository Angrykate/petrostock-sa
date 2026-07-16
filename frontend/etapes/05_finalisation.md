# Étape 5 — Finalisation

**Objectif de cette étape :** vérifier la cohérence globale de l'interface, gérer les cas limites, et préparer les éléments à documenter dans le rapport — comme pour le backend, le code fonctionnel seul ne suffit pas, le cahier des tâches demande des choix justifiés.

---

## 1. Vérifier le comportement responsive

Le cahier des tâches ne l'exige pas explicitement, mais une interface qui casse sur petit écran fait mauvaise impression pour un rapport avec captures d'écran variées. Dans le navigateur, ouvrir les outils de développement (F12) → activer le mode responsive → tester chaque page à une largeur de tablette (~768px) et mobile (~375px).

**Point d'attention particulier :** la `Navbar` de l'Étape 1 utilise `flex-wrap`, donc les liens passent à la ligne sur petit écran plutôt que de déborder — vérifier que c'est bien le cas. Les grilles (`grid-cols-4` sur le dashboard) doivent aussi avoir leur variante mobile — vérifier que `md:grid-cols-4` (et non `grid-cols-4` seul) est bien utilisé partout, pour que ça repasse à une colonne sur petit écran.

## 2. Uniformiser les états de chargement et d'erreur

Si chaque page a écrit son propre `{chargement && <p>Chargement...</p>}`, c'est le moment de factoriser en un composant partagé, pour une cohérence visuelle et pour éviter de dupliquer le même code 7 fois :

```jsx
// components/EtatChargement.js
export default function EtatChargement({ chargement, erreur, children }) {
  if (chargement) return <div className="p-8 text-slate-500">Chargement...</div>;
  if (erreur) return <div className="p-8 text-red-600">Erreur : {erreur}</div>;
  return children;
}
```

Utilisation dans une page :
```jsx
<EtatChargement chargement={chargement} erreur={erreur}>
  {/* contenu réel de la page */}
</EtatChargement>
```

## 3. Gérer les erreurs réseau proprement (pas juste les erreurs HTTP)

L'utilitaire `lib/api.js` de l'Étape 2 gère déjà les erreurs HTTP (404, 500...), mais si l'API backend n'est simplement pas lancée, `fetch` lève une erreur différente ("Failed to fetch"). Vérifier que le message affiché à l'utilisateur reste compréhensible dans ce cas (le pattern `erreur.message` de l'Étape 2 couvre déjà ce cas, à vérifier avec l'API arrêtée volontairement).

## 4. Rafraîchissement automatique des données (point de décision du cahier des tâches)

Le cahier des tâches demande de déterminer quelles pages nécessitent une actualisation automatique. Recommandation pour ce projet, à valider en équipe : le **tableau de bord** (KPI + alertes) et **anomalies** sont les pages où des données périmées ont le plus d'impact — un rafraîchissement simple toutes les 60 secondes suffit, pas besoin de WebSocket pour ce délai de projet :

```jsx
useEffect(() => {
  const charger = () => api.get("/kpi/").then(setKpi);
  charger();
  const intervalle = setInterval(charger, 60000); // 60 secondes
  return () => clearInterval(intervalle); // nettoyage à la sortie de la page
}, []);
```

## 5. Documenter les choix pour le rapport

Comme pour le backend (guide 10_finalisation.md), ces points doivent être rédigés en quelques phrases pour le rapport final :

**a) Choix de la bibliothèque de graphiques**
Ex. : *"Recharts a été retenu pour sa simplicité d'intégration avec React (composants déclaratifs) et sa suffisance pour les besoins du projet (courbes, barres), sans configuration complexe comme Chart.js ou la lourdeur de Plotly."*

**b) Choix Pages Router vs App Router**
Ex. : *"Le Pages Router a été retenu car plus simple à appréhender pour une première utilisation de Next.js, et cohérent avec la structure de dossiers `pages/` définie en amont du projet."*

**c) Pages avec rafraîchissement automatique et fréquence**
Documenter la décision de la section 4 ci-dessus.

**d) Absence d'authentification côté frontend**
Cohérent avec la décision déjà prise côté backend (guide backend Étape 9) — à rappeler brièvement ici aussi.

## 6. Captures d'écran pour le rapport

Comme il n'y a pas de soutenance orale, le rapport doit contenir des captures de chacune des 7 pages avec de vraies données affichées (pas des pages vides). Prendre ces captures une fois que la base contient suffisamment de données représentatives (après les imports CSV et l'entraînement des modèles), pas avant.

## 7. Checklist finale de bout en bout

- [ ] Les 7 pages sont responsives (testées en largeur tablette et mobile)
- [ ] Les états de chargement/erreur sont cohérents sur toutes les pages
- [ ] Le comportement avec l'API backend arrêtée a été testé (message d'erreur clair, pas de page blanche)
- [ ] La décision de rafraîchissement automatique est prise et documentée
- [ ] Les 4 justifications (a, b, c, d) sont rédigées pour le rapport
- [ ] Un jeu de captures d'écran complet existe pour les 7 pages

Si tout est coché, le frontend est complet au sens du cahier des tâches — fonctionnel, cohérent, et documenté.

---

*Guide préparé pour le frontend — Projet PetroStock SA — EPL 2025-2026*
