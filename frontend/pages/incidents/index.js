import { useEffect, useMemo, useState } from "react";
import { FileCheck, Plus } from "lucide-react";
import { api } from "../../lib/api";
import { formatDate, formatNombre, formatUsd } from "../../lib/format";
import { labelDepot, labelProduit } from "../../lib/mockData";
import { useProfile } from "../../context/ProfileContext";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import DataTable from "../../components/ui/DataTable";
import EmptyState from "../../components/ui/EmptyState";
import ErrorBanner from "../../components/ui/ErrorBanner";
import { SkeletonBlock } from "../../components/ui/Skeleton";

function graviteNiveau(g) {
  if (g === "Critique" || g === "Élevé") return "critique";
  if (g === "Modéré") return "attention";
  return "neutre";
}

export default function IncidentsPage() {
  const { isDepot } = useProfile();
  const [rows, setRows] = useState([]);
  const [metas, setMetas] = useState({ depots: [] });
  const [filtres, setFiltres] = useState({ depot: "tous", gravite: "tous", statut: "tous", type: "tous" });
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);

  useEffect(() => {
    (async () => {
      setChargement(true);
      try {
        const [i, m] = await Promise.all([api.get("/incidents/"), api.get("/metas/")]);
        setRows(i);
        setMetas(m);
      } catch (e) {
        setErreur(e.message);
      } finally {
        setChargement(false);
      }
    })();
  }, []);

  const types = useMemo(() => [...new Set(rows.map((r) => r.type_incident))], [rows]);

  const filtre = useMemo(() => {
    return rows.filter((r) => {
      if (filtres.depot !== "tous" && r.depot_id !== filtres.depot) return false;
      if (filtres.gravite !== "tous" && r.gravite !== filtres.gravite) return false;
      if (filtres.statut !== "tous" && r.statut !== filtres.statut) return false;
      if (filtres.type !== "tous" && r.type_incident !== filtres.type) return false;
      return true;
    });
  }, [rows, filtres]);

  const columns = [
    { key: "incident_id", label: "ID", sortable: true },
    { key: "date_incident", label: "Date", sortable: true, render: (r) => formatDate(r.date_incident) },
    { key: "depot_id", label: "Dépôt", sortable: true, render: (r) => labelDepot(r.depot_id) },
    { key: "type_incident", label: "Type", sortable: true },
    { key: "gravite", label: "Gravité", sortable: true, render: (r) => <Badge label={r.gravite} niveau={graviteNiveau(r.gravite)} /> },
    { key: "cout_usd", label: "Coût", sortable: true, className: "hidden md:table-cell", render: (r) => formatUsd(r.cout_usd) },
    { key: "duree_arret_h", label: "Arrêt (h)", sortable: true, className: "hidden lg:table-cell", render: (r) => formatNombre(r.duree_arret_h) },
    {
      key: "statut",
      label: "Statut",
      sortable: true,
      render: (r) => <Badge label={r.statut} niveau={r.statut === "Ouvert" ? "attention" : "normal"} />,
    },
    {
      key: "produit",
      label: "Produit",
      className: "hidden xl:table-cell",
      render: (r) => (r.produit_id ? labelProduit(r.produit_id) : "—"),
    },
  ];

  return (
    <div className="animate-fade-up space-y-5">
      <PageHeader
        title="Registre des incidents"
        description="Suivi opérationnel des pannes et événements."
        actions={
          isDepot ? (
            <Button href="/incidents/declarer">
              <Plus size={14} /> Déclarer un incident
            </Button>
          ) : null
        }
      />

      {erreur && <ErrorBanner title="Erreur" description={erreur} />}

      <Card>
        <div className="grid gap-3 md:grid-cols-4">
          <div>
            <label className="field-label">Dépôt</label>
            <select
              className="field-input"
              value={filtres.depot}
              onChange={(e) => setFiltres((f) => ({ ...f, depot: e.target.value }))}
            >
              <option value="tous">Tous</option>
              {(metas.depots || []).map((d) => (
                <option key={d.id} value={d.id}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="field-label">Type</label>
            <select
              className="field-input"
              value={filtres.type}
              onChange={(e) => setFiltres((f) => ({ ...f, type: e.target.value }))}
            >
              <option value="tous">Tous</option>
              {types.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="field-label">Gravité</label>
            <select
              className="field-input"
              value={filtres.gravite}
              onChange={(e) => setFiltres((f) => ({ ...f, gravite: e.target.value }))}
            >
              <option value="tous">Toutes</option>
              {["Faible", "Modéré", "Élevé", "Critique"].map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="field-label">Statut</label>
            <select
              className="field-input"
              value={filtres.statut}
              onChange={(e) => setFiltres((f) => ({ ...f, statut: e.target.value }))}
            >
              <option value="tous">Tous</option>
              <option value="Ouvert">Ouvert</option>
              <option value="Clos">Clos</option>
            </select>
          </div>
        </div>
      </Card>

      <Card title={`${filtre.length} incident(s)`}>
        {chargement ? (
          <SkeletonBlock rows={6} />
        ) : (
          <DataTable
            columns={columns}
            rows={filtre}
            rowKey={(r) => r.incident_id}
            empty={
              <EmptyState
                icon={FileCheck}
                title="Aucun incident enregistré"
                description="Le registre est vide pour ces filtres."
              />
            }
          />
        )}
      </Card>
    </div>
  );
}
