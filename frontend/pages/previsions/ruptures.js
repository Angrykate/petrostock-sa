import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { api } from "../../lib/api";
import { formatJours, formatNombre } from "../../lib/format";
import { labelDepot, labelProduit } from "../../lib/mockData";
import PageHeader from "../../components/ui/PageHeader";
import SubNav from "../../components/ui/SubNav";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import DataTable from "../../components/ui/DataTable";
import ErrorBanner from "../../components/ui/ErrorBanner";
import { SkeletonBlock } from "../../components/ui/Skeleton";

export default function RupturesPage() {
  const router = useRouter();
  const [rows, setRows] = useState([]);
  const [metas, setMetas] = useState({ depots: [], produits: [] });
  const [depot, setDepot] = useState("tous");
  const [niveau, setNiveau] = useState("tous");
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);

  useEffect(() => {
    if (router.query.depot) setDepot(String(router.query.depot));
  }, [router.query.depot]);

  useEffect(() => {
    (async () => {
      setChargement(true);
      try {
        const [r, m] = await Promise.all([api.get("/ruptures/"), api.get("/metas/")]);
        setRows(r);
        setMetas(m);
      } catch (e) {
        setErreur(e.message);
      } finally {
        setChargement(false);
      }
    })();
  }, []);

  const filtre = useMemo(() => {
    return rows.filter((r) => {
      if (depot !== "tous" && r.depot_id !== depot) return false;
      if (niveau !== "tous" && r.niveau !== niveau) return false;
      return true;
    });
  }, [rows, depot, niveau]);

  const columns = [
    { key: "depot_id", label: "Dépôt", sortable: true, render: (r) => labelDepot(r.depot_id) },
    { key: "produit_id", label: "Produit", sortable: true, render: (r) => labelProduit(r.produit_id) },
    { key: "stock_actuel", label: "Stock actuel", sortable: true, render: (r) => <span className="mono-nums">{formatNombre(r.stock_actuel)}</span> },
    { key: "conso_jour", label: "Conso. / jour", sortable: true, render: (r) => <span className="mono-nums">{formatNombre(r.conso_jour)}</span> },
    { key: "jours_avant_rupture", label: "Avant rupture", sortable: true, render: (r) => formatJours(r.jours_avant_rupture) },
    {
      key: "niveau",
      label: "Niveau",
      sortable: true,
      render: (r) => (
        <Badge
          label={r.niveau === "critique" ? "Critique" : r.niveau === "attention" ? "Attention" : "Normal"}
          niveau={r.niveau === "critique" ? "critique" : r.niveau === "attention" ? "attention" : "normal"}
        />
      ),
    },
    {
      key: "action",
      label: "",
      render: (r) => (
        <Link
          href={`/previsions?depot=${r.depot_id}&produit=${r.produit_id}`}
          className="text-xs font-medium text-navy-700 hover:underline"
        >
          Voir prévision
        </Link>
      ),
    },
  ];

  return (
    <div className="animate-fade-up space-y-5">
      <SubNav parentHref="/previsions" parentLabel="Prévisions" current="Risque de rupture" />
      <PageHeader
        title="Risque de rupture"
        description="Classement des couples dépôt / produit selon les jours restants estimés."
      />

      {erreur && <ErrorBanner title="Erreur" description={erreur} />}

      <Card>
        <div className="grid gap-3 md:grid-cols-2">
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
              <option value="critique">Critique (&lt; 5 j)</option>
              <option value="attention">Attention (5–10 j)</option>
              <option value="normal">Normal (≥ 10 j)</option>
            </select>
          </div>
        </div>
      </Card>

      <Card title="Estimation par dépôt / produit">
        {chargement ? (
          <SkeletonBlock rows={6} />
        ) : (
          <DataTable columns={columns} rows={filtre} rowKey={(r) => `${r.depot_id}-${r.produit_id}`} />
        )}
      </Card>
    </div>
  );
}
