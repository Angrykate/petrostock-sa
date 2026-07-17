export const ROLES = {
  depot: "depot",
  achats: "achats",
  direction: "direction",
};

export const ROLE_OPTIONS = [
  { value: ROLES.depot, label: "Responsable de dépôt" },
  { value: ROLES.achats, label: "Responsable des achats" },
  { value: ROLES.direction, label: "Direction" },
];

/** Navigation principale — alertes & prévisions en postes dédiés */
export const NAV_ITEMS = [
  { id: "dashboard", href: "/", label: "Pilotage", exact: true, roles: [ROLES.depot, ROLES.achats, ROLES.direction] },
  { id: "alertes", href: "/stocks/alertes", label: "Alertes", roles: [ROLES.depot, ROLES.achats, ROLES.direction] },
  { id: "stocks", href: "/stocks", label: "Stocks", roles: [ROLES.depot, ROLES.achats, ROLES.direction] },
  { id: "previsions", href: "/previsions", label: "Prévisions IA", roles: [ROLES.depot, ROLES.achats] },
  { id: "anomalies", href: "/anomalies", label: "Anomalies", roles: [ROLES.depot, ROLES.achats] },
  { id: "commandes", href: "/commandes", label: "Commandes", roles: [ROLES.achats, ROLES.direction] },
  { id: "incidents", href: "/incidents", label: "Incidents", roles: [ROLES.depot, ROLES.achats, ROLES.direction] },
  { id: "finances", href: "/finances", label: "Finances", roles: [ROLES.direction] },
];

export const TYPES_INCIDENT = [
  "Panne pompe",
  "Fuite détectée",
  "Retard livraison",
  "Variation anormale",
  "Erreur inventaire",
  "Coupure électrique",
  "Contamination",
  "Sécurité",
];

export const STATUTS_COMMANDE = ["Toutes", "En attente", "Validée", "Livrée", "En retard"];
