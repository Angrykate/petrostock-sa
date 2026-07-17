import { useEffect, useMemo, useState } from "react";
import { ShieldCheck, FlaskConical } from "lucide-react";
import { api } from "../../lib/api";
import { formatDate, formatNombre, formatScore } from "../../lib/format";
import { labelDepot, labelProduit } from "../../lib/mockData";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import DataTable from "../../components/ui/DataTable";
import EmptyState from "../../components/ui/EmptyState";
import ErrorBanner from "../../components/ui/ErrorBanner";
import { SkeletonBlock } from "../../components/ui/Skeleton";
import { StockAreaChart } from "../../components/charts";

export default function AnomaliesPage() {
  const [rows, setRows] = useState([]);
  const [metas, setMetas] = useState({ depots: [], produits: [] });
  const [depot, setDepot] = useState("tous");
  const [severite, setSeverite] = useState("tous");
  const [detail, setDetail] = useState(null);
  const [serie, setSerie] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);

  useEffect(() => {
    (async () => {
      setChargement(true);
      try {
        const [a, m] = await Promise.all([api.get("/anomalies/"), api.get("/metas/")]);
        setRows(a);
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
      if (severite === "eleve" && r.score_suspicion < 0.8) return false;
      return true;
    });
  }, [rows, depot, severite]);

  const ouvrir = async (row) => {
    setDetail(row);
    try {
      const s = await api.get(`/stocks/${row.depot_id}`);
      setSerie(s.slice(-14));
    } catch {
      setSerie([]);
    }
  };

  const columns = [
    { key: "date", label: "Date", sortable: true, render: (r) => formatDate(r.date) },
    { key: "depot_id", label: "Dépôt", sortable: true, render: (r) => labelDepot(r.depot_id) },
    { key: "produit_id", label: "Produit", sortable: true, render: (r) => labelProduit(r.produit_id) },
    { key: "stock_fin_jour", label: "Stock fin", sortable: true, render: (r) => <span className="mono-nums">{formatNombre(r.stock_fin_jour)}</span> },
    {
      key: "score_suspicion",
      label: "Score",
      sortable: true,
      render: (r) => (
        <div className="flex items-center gap-2 min-w-[120px]">
          <div className="h-1.5 flex-1 rounded bg-canvas-tint">
            <div
              className="h-1.5 rounded"
              style={{
                width: `${Math.round(r.score_suspicion * 100)}%`,
                background: r.score_suspicion > 0.8 ? "#C63B3B" : r.score_suspicion > 0.5 ? "#C9841A" : "#1E8E5A",
              }}
            />
          </div>
          <span className="mono-nums text-xs">{formatScore(r.score_suspicion)}</span>
        </div>
      ),
    },
    { key: "badge", label: "Statut", render: () => <Badge label="Anomalie" niveau="critique" /> },
  ];

  return (
    <div className="animate-fade-up space-y-5">
      <PageHeader
        title="Anomalies détectées"
        description="Observations hors norme signalées par les modèles de détection."
        actions={
          <Button href="/anomalies/analyser" variant="secondary">
            <FlaskConical size={14} /> Analyse manuelle
          </Button>
        }
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
            <label className="field-label">Sévérité</label>
            <select className="field-input" value={severite} onChange={(e) => setSeverite(e.target.value)}>
              <option value="tous">Toutes</option>
              <option value="eleve">Élevé uniquement (≥ 0,80)</option>
            </select>
          </div>
        </div>
      </Card>

      <Card title="Liste des anomalies">
        {chargement ? (
          <SkeletonBlock rows={6} />
        ) : (
          <DataTable
            columns={columns}
            rows={filtre}
            rowKey={(r) => `${r.date}-${r.depot_id}-${r.produit_id}`}
            onRowClick={ouvrir}
            empty={
              <EmptyState
                icon={ShieldCheck}
                title="Aucune anomalie détectée"
                description="Rien d'inhabituel sur la période sélectionnée."
              />
            }
          />
        )}
      </Card>

      <Modal open={!!detail} onClose={() => setDetail(null)} title="Détail de l'anomalie" wide>
        {detail && (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 text-sm">
              <p>
                <span className="text-ink-muted">Dépôt :</span> {labelDepot(detail.depot_id)}
              </p>
              <p>
                <span className="text-ink-muted">Produit :</span> {labelProduit(detail.produit_id)}
              </p>
              <p>
                <span className="text-ink-muted">Date :</span> {formatDate(detail.date, "long")}
              </p>
              <p>
                <span className="text-ink-muted">Score :</span> {formatScore(detail.score_suspicion)}
              </p>
            </div>
            <p className="rounded bg-canvas p-3 text-sm text-ink-soft">{detail.explication}</p>
            <StockAreaChart data={serie} />
          </div>
        )}
      </Modal>
    </div>
  );
}
