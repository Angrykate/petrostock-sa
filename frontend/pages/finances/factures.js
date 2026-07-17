import { useEffect, useMemo, useState } from "react";
import { Receipt } from "lucide-react";
import { api } from "../../lib/api";
import { formatDate, formatFcfa } from "../../lib/format";
import { labelClient, labelDepot, labelProduit } from "../../lib/mockData";
import PageHeader from "../../components/ui/PageHeader";
import SubNav from "../../components/ui/SubNav";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import DataTable from "../../components/ui/DataTable";
import EmptyState from "../../components/ui/EmptyState";
import ErrorBanner from "../../components/ui/ErrorBanner";
import { SkeletonBlock } from "../../components/ui/Skeleton";

function paiementNiveau(s) {
  if (s === "Payée") return "normal";
  if (s === "Partielle") return "attention";
  return "critique";
}

export default function FacturesPage() {
  const [rows, setRows] = useState([]);
  const [metas, setMetas] = useState({ clients: [] });
  const [typeClient, setTypeClient] = useState("tous");
  const [region, setRegion] = useState("tous");
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [f, m] = await Promise.all([api.get("/factures/"), api.get("/metas/")]);
        setRows(f);
        setMetas(m);
      } catch (e) {
        setErreur(e.message);
      } finally {
        setChargement(false);
      }
    })();
  }, []);

  const types = [...new Set((metas.clients || []).map((c) => c.type))];
  const regions = [...new Set((metas.clients || []).map((c) => c.region))];

  const filtre = useMemo(() => {
    return rows.filter((r) => {
      const client = (metas.clients || []).find((c) => c.id === r.client_id);
      if (typeClient !== "tous" && client?.type !== typeClient) return false;
      if (region !== "tous" && client?.region !== region) return false;
      return true;
    });
  }, [rows, metas, typeClient, region]);

  const columns = [
    { key: "facture_id", label: "ID", sortable: true },
    { key: "client_id", label: "Client", sortable: true, render: (r) => labelClient(r.client_id) },
    { key: "date_facture", label: "Date", sortable: true, render: (r) => formatDate(r.date_facture) },
    { key: "produit_id", label: "Produit", className: "hidden md:table-cell", render: (r) => labelProduit(r.produit_id) },
    { key: "depot_id", label: "Dépôt", className: "hidden lg:table-cell", render: (r) => labelDepot(r.depot_id) },
    { key: "montant_ttc", label: "Montant TTC", sortable: true, render: (r) => <span className="mono-nums">{formatFcfa(r.montant_ttc)}</span> },
    {
      key: "statut_paiement",
      label: "Paiement",
      sortable: true,
      render: (r) => <Badge label={r.statut_paiement} niveau={paiementNiveau(r.statut_paiement)} />,
    },
  ];

  return (
    <div className="animate-fade-up space-y-5">
      <SubNav parentHref="/finances" parentLabel="Finances" current="Factures" />
      <PageHeader title="Factures" description="État des factures et suivi des paiements." />

      {erreur && <ErrorBanner title="Erreur" description={erreur} />}

      <Card>
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="field-label">Type de client</label>
            <select className="field-input" value={typeClient} onChange={(e) => setTypeClient(e.target.value)}>
              <option value="tous">Tous</option>
              {types.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="field-label">Région</label>
            <select className="field-input" value={region} onChange={(e) => setRegion(e.target.value)}>
              <option value="tous">Toutes</option>
              {regions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      <Card title="État des factures">
        {chargement ? (
          <SkeletonBlock rows={6} />
        ) : (
          <DataTable
            columns={columns}
            rows={filtre}
            rowKey={(r) => r.facture_id}
            empty={
              <EmptyState icon={Receipt} title="Aucune facture pour cette période" description="" />
            }
          />
        )}
      </Card>
    </div>
  );
}
