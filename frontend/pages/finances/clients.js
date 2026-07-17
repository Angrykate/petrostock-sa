import { useEffect, useMemo, useState } from "react";
import { api } from "../../lib/api";
import { formatFcfa } from "../../lib/format";
import { labelClient } from "../../lib/mockData";
import PageHeader from "../../components/ui/PageHeader";
import SubNav from "../../components/ui/SubNav";
import Card from "../../components/ui/Card";
import ErrorBanner from "../../components/ui/ErrorBanner";
import { SkeletonBlock } from "../../components/ui/Skeleton";
import { HorizontalClientsChart } from "../../components/charts";

export default function ClientsPage() {
  const [factures, setFactures] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        setFactures(await api.get("/factures/"));
      } catch (e) {
        setErreur(e.message);
      } finally {
        setChargement(false);
      }
    })();
  }, []);

  const top = useMemo(() => {
    const map = {};
    factures.forEach((f) => {
      map[f.client_id] = (map[f.client_id] || 0) + f.montant_ttc;
    });
    return Object.entries(map)
      .map(([id, ca]) => ({ id, nom: labelClient(id), ca }))
      .sort((a, b) => b.ca - a.ca)
      .slice(0, 20);
  }, [factures]);

  return (
    <div className="animate-fade-up space-y-5">
      <SubNav parentHref="/finances" parentLabel="Finances" current="Clients" />
      <PageHeader title="Clients" description="Classement par chiffre d'affaires facturé." />

      {erreur && <ErrorBanner title="Erreur" description={erreur} />}

      <Card title="Top clients">
        {chargement ? <SkeletonBlock rows={8} /> : <HorizontalClientsChart data={top} />}
      </Card>

      <Card title="Détail">
        <ul className="divide-y divide-line">
          {top.map((c, i) => (
            <li key={c.id} className="flex items-center justify-between py-2.5 text-sm">
              <span>
                <span className="mr-2 text-ink-faint">{i + 1}.</span>
                {c.nom}
              </span>
              <span className="mono-nums font-medium">{formatFcfa(c.ca)}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
