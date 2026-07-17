import { useEffect, useState } from "react";
import { Coins, DollarSign, Receipt } from "lucide-react";
import { api } from "../../lib/api";
import { formatFcfa, formatPct } from "../../lib/format";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import KpiCard from "../../components/ui/KpiCard";
import ErrorBanner from "../../components/ui/ErrorBanner";
import { SkeletonBlock, SkeletonKpi } from "../../components/ui/Skeleton";
import { RevenueBarChart } from "../../components/charts";

export default function FinancesOverviewPage() {
  const [kpi, setKpi] = useState(null);
  const [ca, setCa] = useState([]);
  const [stacked, setStacked] = useState(false);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [k, c] = await Promise.all([api.get("/kpi/"), api.get("/finances/ca-mensuel/")]);
        setKpi(k);
        setCa(c);
      } catch (e) {
        setErreur(e.message);
      } finally {
        setChargement(false);
      }
    })();
  }, []);

  return (
    <div className="animate-fade-up space-y-5">
      <PageHeader
        title="Finances"
        description="Chiffre d'affaires, recouvrement et synthèse commerciale."
        actions={
          <>
            <Button href="/finances/factures" variant="secondary">
              <Receipt size={14} /> Factures
            </Button>
            <Button href="/finances/clients" variant="secondary">
              Clients
            </Button>
          </>
        }
      />

      {erreur && <ErrorBanner title="Erreur" description={erreur} />}

      {chargement ? (
        <div className="grid gap-3 sm:grid-cols-3">
          <SkeletonKpi />
          <SkeletonKpi />
          <SkeletonKpi />
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-3">
          <KpiCard title="Chiffre d'affaires" value={formatFcfa(kpi?.ca_periode_fcfa)} icon={Coins} />
          <KpiCard title="Taux de recouvrement" value={formatPct(kpi?.taux_recouvrement_pct)} icon={DollarSign} tone="success" />
          <KpiCard title="En attente de paiement" value={formatFcfa(kpi?.montant_en_attente_fcfa)} icon={Receipt} tone="warning" />
        </div>
      )}

      <Card
        title="Chiffre d'affaires mensuel"
        action={
          <div className="flex gap-1">
            {[false, true].map((v) => (
              <button
                key={String(v)}
                type="button"
                onClick={() => setStacked(v)}
                className={`rounded px-2.5 py-1 text-xs font-medium ${
                  stacked === v ? "bg-navy-700 text-white" : "border border-line text-ink-muted"
                }`}
              >
                {v ? "Par type de client" : "Vue globale"}
              </button>
            ))}
          </div>
        }
      >
        {chargement ? <SkeletonBlock rows={8} /> : <RevenueBarChart data={ca} stacked={stacked} />}
      </Card>
    </div>
  );
}
