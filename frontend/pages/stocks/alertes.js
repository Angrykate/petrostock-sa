import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Search } from "lucide-react";
import { api } from "../../lib/api";
import { formatJours, formatNombre } from "../../lib/format";
import { labelDepot, labelProduit, niveauAlerte } from "../../lib/mockData";
import PageHeader from "../../components/ui/PageHeader";
import SubNav from "../../components/ui/SubNav";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import EmptyState from "../../components/ui/EmptyState";
import DataTable from "../../components/ui/DataTable";
import ErrorBanner from "../../components/ui/ErrorBanner";
import { SkeletonBlock } from "../../components/ui/Skeleton";

export default function AlertesPage() {
  const [alertes, setAlertes] = useState([]);
  const [metas, setMetas] = useState({ depots: [], produits: [] });
  const [depot, setDepot] = useState("tous");
  const [niveau, setNiveau] = useState("tous");
  const [recherche, setRecherche] = useState("");
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);

  useEffect(() => {
    (async () => {
      setChargement(true);
      try {
        const [a, m] = await Promise.all([api.get("/stocks/alertes/"), api.get("/metas/")]);
        setAlertes(a);
        setMetas(m);
      } catch (e) {
        setErreur(e.message);
      } finally {
        setChargement(false);
      }
    })();
  }, []);

  const filtre = useMemo(() => {
    return alertes.filter((a) => {
      if (depot !== "tous" && a.depot_id !== depot) return false;
      if (niveau !== "tous" && niveauAlerte(a.niveau) !== niveau) return false;
      if (recherche) {
        const q = recherche.toLowerCase();
        const txt = `${labelDepot(a.depot_id)} ${labelProduit(a.produit_id)} ${a.depot_id} ${a.produit_id}`.toLowerCase();
        if (!txt.includes(q)) return false;
      }
      return true;
    });
  }, [alertes, depot, niveau, recherche]);

  const columns = [
    { key: "date", label: "Date", sortable: true },
    { key: "depot", label: "Dépôt", sortable: true, sortValue: (r) => labelDepot(r.depot_id), render: (r) => labelDepot(r.depot_id) },
    { key: "produit", label: "Produit", sortable: true, sortValue: (r) => labelProduit(r.produit_id), render: (r) => labelProduit(r.produit_id) },
    { key: "stock_fin_jour", label: "Stock", sortable: true, render: (r) => <span className="mono-nums">{formatNombre(r.stock_fin_jour)}</span> },
    { key: "seuil_alerte", label: "Seuil", sortable: true, render: (r) => <span className="mono-nums">{formatNombre(r.seuil_alerte)}</span> },
    { key: "jours_couverture", label: "Couverture", sortable: true, render: (r) => formatJours(r.jours_couverture) },
    {
      key: "niveau",
      label: "Niveau",
      sortable: true,
      render: (r) => (
        <Badge label={niveauAlerte(r.niveau) === "critique" ? "Critique" : "Bas"} niveau={niveauAlerte(r.niveau)} />
      ),
    },
    {
      key: "action",
      label: "",
      render: (r) => (
        <Link href={`/previsions/ruptures?depot=${r.depot_id}&produit=${r.produit_id}`} className="text-xs font-medium text-navy-700 hover:underline">
          Estimer rupture
        </Link>
      ),
    },
  ];

  return (
    <div className="animate-fade-up space-y-5">
      <SubNav parentHref="/stocks" parentLabel="Stocks" current="Alertes" />
      <PageHeader
        title="Alertes de stock"
        description="Tous les seuils bas et critiques, triés pour prioriser les actions."
      />

      {erreur && <ErrorBanner title="Impossible de charger les alertes" description={erreur} />}

      <Card>
        <div className="grid gap-3 md:grid-cols-4">
          <div>
            <label className="field-label">Dépôt</label>
            <select className="field-input" value={depot} onChange={(e) => setDepot(e.target.value)}>
              <option value="tous">Tous</option>
              {(metas.depots || []).map((d) => (
                <option key={d.id} value={d.id}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="field-label">Niveau</label>
            <select className="field-input" value={niveau} onChange={(e) => setNiveau(e.target.value)}>
              <option value="tous">Tous</option>
              <option value="critique">Critique</option>
              <option value="attention">Bas</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="field-label">Recherche</label>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
              <input
                className="field-input pl-9"
                value={recherche}
                onChange={(e) => setRecherche(e.target.value)}
                placeholder="Dépôt, produit…"
              />
            </div>
          </div>
        </div>
      </Card>

      <Card title={`${filtre.length} alerte(s)`}>
        {chargement ? (
          <SkeletonBlock rows={6} />
        ) : (
          <DataTable
            columns={columns}
            rows={filtre}
            rowKey={(r) => `${r.depot_id}-${r.produit_id}-${r.date}`}
            empty={
              <EmptyState
                icon={CheckCircle2}
                title="Aucune alerte active"
                description="Tous les dépôts sont au-dessus du seuil critique."
              />
            }
          />
        )}
      </Card>
    </div>
  );
}
