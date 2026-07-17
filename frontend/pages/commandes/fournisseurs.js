import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { formatScore } from "../../lib/format";
import PageHeader from "../../components/ui/PageHeader";
import SubNav from "../../components/ui/SubNav";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import ErrorBanner from "../../components/ui/ErrorBanner";
import { SkeletonBlock } from "../../components/ui/Skeleton";

function ScoreBar({ label, value, poids }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-[11px] text-ink-muted">
        <span>
          {label} <span className="opacity-70">({poids})</span>
        </span>
        <span className="mono-nums">{formatScore(value)}</span>
      </div>
      <div className="h-1.5 rounded bg-canvas-tint">
        <div className="h-1.5 rounded bg-navy-600" style={{ width: `${Math.round(value * 100)}%` }} />
      </div>
    </div>
  );
}

export default function FournisseursPage() {
  const [rows, setRows] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.get("/fournisseurs/");
        setRows([...data].sort((a, b) => b.score - a.score));
      } catch (e) {
        setErreur(e.message);
      } finally {
        setChargement(false);
      }
    })();
  }, []);

  return (
    <div className="animate-fade-up space-y-5">
      <SubNav parentHref="/commandes" parentLabel="Commandes" current="Fournisseurs" />
      <PageHeader
        title="Classement des fournisseurs"
        description="Score composite : fiabilité 50 %, délai 30 %, prix 20 %."
      />

      {erreur && <ErrorBanner title="Erreur" description={erreur} />}

      {chargement ? (
        <SkeletonBlock rows={6} />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {rows.map((f, i) => (
            <Card key={f.id} className="!p-0">
              <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
                <div>
                  <p className="text-sm font-semibold text-ink">
                    {i + 1}. {f.nom}
                  </p>
                  <p className="text-xs text-ink-muted">{f.pays}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-semibold text-navy-800 mono-nums">{formatScore(f.score)}</p>
                  {i === 0 && <Badge label="Recommandé" niveau="info" className="mt-1" />}
                </div>
              </div>
              <div className="space-y-3 px-5 py-4">
                <ScoreBar label="Fiabilité" value={f.fiabilite} poids="50 %" />
                <ScoreBar label="Délai" value={f.delai} poids="30 %" />
                <ScoreBar label="Prix" value={f.prix} poids="20 %" />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
