import { useEffect, useMemo, useState } from "react";
import { Download, Package, Plus, Truck } from "lucide-react";
import { api } from "../../lib/api";
import { exporterCsv, formatDate, formatFcfa, formatNombre } from "../../lib/format";
import { labelDepot, labelFournisseur, labelProduit } from "../../lib/mockData";
import { useProfile } from "../../context/ProfileContext";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import DataTable from "../../components/ui/DataTable";
import EmptyState from "../../components/ui/EmptyState";
import ErrorBanner from "../../components/ui/ErrorBanner";
import KpiCard from "../../components/ui/KpiCard";
import { SkeletonBlock, SkeletonKpi } from "../../components/ui/Skeleton";

function statutNiveau(statut) {
  if (statut === "Livrée") return "normal";
  if (statut === "En retard") return "critique";
  if (statut === "En attente") return "attention";
  return "info";
}

export default function CommandesPage() {
  const { isAchats } = useProfile();
  const [rows, setRows] = useState([]);
  const [onglet, setOnglet] = useState("Toutes");
  const [detail, setDetail] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);

  const load = async () => {
    setChargement(true);
    setErreur(null);
    try {
      setRows(await api.get("/commandes/"));
    } catch (e) {
      setErreur(e.message);
    } finally {
      setChargement(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const counts = useMemo(() => {
    const c = { Toutes: rows.length, "En attente": 0, Validée: 0, Livrée: 0, "En retard": 0 };
    rows.forEach((r) => {
      if (c[r.statut] != null) c[r.statut] += 1;
    });
    return c;
  }, [rows]);

  const filtre = useMemo(() => {
    if (onglet === "Toutes") return rows;
    return rows.filter((r) => r.statut === onglet);
  }, [rows, onglet]);

  const total = filtre.reduce((s, c) => s + (c.montant_total || 0), 0);

  const exportData = () => {
    exporterCsv("commandes.csv", [
      ["ID", "Date", "Fournisseur", "Dépôt", "Produit", "Qté", "Statut", "Montant"],
      ...filtre.map((c) => [
        c.bon_commande_id,
        c.date_commande,
        labelFournisseur(c.fournisseur_id),
        labelDepot(c.depot_destination_id),
        labelProduit(c.produit_id),
        c.quantite_commandee,
        c.statut,
        c.montant_total,
      ]),
    ]);
  };

  const columns = [
    { key: "bon_commande_id", label: "ID", sortable: true },
    { key: "date_commande", label: "Date", sortable: true, render: (r) => formatDate(r.date_commande) },
    { key: "fournisseur_id", label: "Fournisseur", sortable: true, render: (r) => labelFournisseur(r.fournisseur_id) },
    { key: "depot_destination_id", label: "Dépôt", sortable: true, className: "hidden md:table-cell", render: (r) => labelDepot(r.depot_destination_id) },
    { key: "produit_id", label: "Produit", sortable: true, className: "hidden lg:table-cell", render: (r) => labelProduit(r.produit_id) },
    { key: "quantite_commandee", label: "Qté", sortable: true, render: (r) => <span className="mono-nums">{formatNombre(r.quantite_commandee)}</span> },
    { key: "statut", label: "Statut", sortable: true, render: (r) => <Badge label={r.statut} niveau={statutNiveau(r.statut)} /> },
    {
      key: "retard_jours",
      label: "Retard",
      sortable: true,
      render: (r) =>
        r.retard_jours > 0 ? <span className="font-semibold text-danger">{r.retard_jours} j</span> : "—",
    },
  ];

  return (
    <div className="animate-fade-up space-y-5">
      <PageHeader
        title="Commandes fournisseurs"
        description="Suivi des bons de commande et des livraisons."
        actions={
          <>
            <Button href="/commandes/fournisseurs" variant="secondary">
              <Truck size={14} /> Fournisseurs
            </Button>
            <Button variant="secondary" onClick={exportData}>
              <Download size={14} /> Export
            </Button>
            {isAchats && (
              <Button href="/commandes/nouvelle">
                <Plus size={14} /> Nouvelle commande
              </Button>
            )}
          </>
        }
      />

      {erreur && <ErrorBanner title="Erreur" description={erreur} onRetry={load} />}

      {chargement ? (
        <div className="grid gap-3 sm:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonKpi key={i} />
          ))}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-4">
          <KpiCard title="Commandes" value={formatNombre(filtre.length)} />
          <KpiCard title="Montant" value={formatFcfa(total)} />
          <KpiCard title="En attente" value={formatNombre(counts["En attente"])} tone="warning" />
          <KpiCard title="En retard" value={formatNombre(counts["En retard"])} tone="danger" />
        </div>
      )}

      <div className="flex flex-wrap gap-1">
        {["Toutes", "En attente", "Validée", "Livrée", "En retard"].map((o) => (
          <button
            key={o}
            type="button"
            onClick={() => setOnglet(o)}
            className={`rounded px-3 py-1.5 text-xs font-medium ${
              onglet === o ? "bg-navy-700 text-white" : "border border-line text-ink-muted hover:bg-canvas"
            }`}
          >
            {o} <span className="opacity-70">({counts[o] || 0})</span>
          </button>
        ))}
      </div>

      <Card title="Historique des commandes">
        {chargement ? (
          <SkeletonBlock rows={6} />
        ) : (
          <DataTable
            columns={columns}
            rows={filtre}
            rowKey={(r) => r.bon_commande_id}
            onRowClick={setDetail}
            empty={
              <EmptyState
                icon={Package}
                title={`Aucune commande ${onglet === "Toutes" ? "" : onglet.toLowerCase()}`}
                description="Aucun résultat pour cet onglet."
              />
            }
          />
        )}
      </Card>

      <Modal open={!!detail} onClose={() => setDetail(null)} title="Détail de la commande">
        {detail && (
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            {[
              ["ID", detail.bon_commande_id],
              ["Date", formatDate(detail.date_commande, "long")],
              ["Fournisseur", labelFournisseur(detail.fournisseur_id)],
              ["Dépôt", labelDepot(detail.depot_destination_id)],
              ["Produit", labelProduit(detail.produit_id)],
              ["Qté commandée", formatNombre(detail.quantite_commandee)],
              ["Qté livrée", formatNombre(detail.quantite_livree)],
              ["Montant", formatFcfa(detail.montant_total)],
              ["Statut", detail.statut],
              ["Retard", detail.retard_jours > 0 ? `${detail.retard_jours} jours` : "Aucun"],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="text-xs text-ink-muted">{k}</dt>
                <dd className="mt-0.5 font-medium text-ink">{v}</dd>
              </div>
            ))}
          </dl>
        )}
      </Modal>
    </div>
  );
}
