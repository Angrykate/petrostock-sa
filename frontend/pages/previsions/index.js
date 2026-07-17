import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { Info, LineChart as LineChartIcon, AlertTriangle } from "lucide-react";
import { api } from "../../lib/api";
import { formatJours, formatNombre, formatScore } from "../../lib/format";
import { useToast } from "../../context/ToastContext";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import EmptyState from "../../components/ui/EmptyState";
import ErrorBanner from "../../components/ui/ErrorBanner";
import TankGauge from "../../components/ui/TankGauge";
import { SkeletonBlock } from "../../components/ui/Skeleton";
import { ForecastChart } from "../../components/charts";

export default function PrevisionsPage() {
  const router = useRouter();
  const { push } = useToast();
  const [metas, setMetas] = useState({ depots: [], produits: [], fournisseurs: [] });
  const [depotId, setDepotId] = useState("");
  const [produitId, setProduitId] = useState("");
  const [horizon, setHorizon] = useState(30);
  const [data, setData] = useState(null);
  const [rupture, setRupture] = useState(null);
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState(null);
  const [modal, setModal] = useState(false);
  const [suggestion, setSuggestion] = useState(null);
  const [soumission, setSoumission] = useState(false);

  useEffect(() => {
    let cancel = false;
    api.get("/metas/").then((m) => {
      if (cancel) return;
      setMetas(m);
      setDepotId((prev) => prev || m.depots[0]?.id || "");
      setProduitId((prev) => prev || m.produits[2]?.id || m.produits[0]?.id || "");
    });
    return () => {
      cancel = true;
    };
  }, []);

  useEffect(() => {
    if (!router.isReady) return;
    if (router.query.depot) setDepotId(String(router.query.depot));
    if (router.query.produit) setProduitId(String(router.query.produit));
  }, [router.isReady, router.query.depot, router.query.produit]);

  useEffect(() => {
    if (!depotId || !produitId) return;
    let cancel = false;
    (async () => {
      setChargement(true);
      setErreur(null);
      try {
        const [p, r] = await Promise.all([
          api.get(`/previsions/${produitId}?depot_id=${depotId}&horizon_jours=${horizon}`),
          api.get(`/ruptures/${depotId}?produit_id=${produitId}`),
        ]);
        if (!cancel) {
          setData(p);
          setRupture(r);
        }
      } catch (e) {
        if (!cancel) setErreur(e.message);
      } finally {
        if (!cancel) setChargement(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [depotId, produitId, horizon]);

  const chartData = useMemo(() => {
    if (!data) return [];
    const hist = (data.historique || []).slice(-60).map((h) => ({
      date: h.date,
      sorties: h.sorties,
      prevision: null,
      basse: null,
      haute: null,
    }));
    const prev = (data.prevision || []).slice(0, horizon).map((p) => ({
      date: p.date,
      sorties: null,
      prevision: p.prevision,
      basse: p.basse,
      haute: p.haute,
    }));
    return [...hist, ...prev];
  }, [data, horizon]);

  const jours = rupture?.jours_avant_rupture ?? data?.jours_avant_rupture ?? null;
  const niveau = jours == null ? "normal" : jours < 5 ? "critique" : jours < 10 ? "attention" : "normal";

  const ouvrirSuggestion = () => {
    const conso = data?.consommation_moyenne_jour || 18000;
    const delai = data?.delai_fournisseur_jours || 5;
    const securite = data?.stock_securite || 40000;
    const actuel = data?.stock_actuel || 0;
    const qte = Math.max(0, Math.round(conso * delai + securite - actuel));
    setSuggestion({
      conso,
      delai,
      securite,
      actuel,
      quantite: qte,
      fournisseur_id: metas.fournisseurs[0]?.id || "FRN001",
      date_commande: new Date().toISOString().slice(0, 10),
    });
    setModal(true);
  };

  const creerCommande = async () => {
    setSoumission(true);
    try {
      await api.post("/commandes/", {
        date_commande: suggestion.date_commande,
        fournisseur_id: suggestion.fournisseur_id,
        depot_destination_id: depotId,
        produit_id: produitId,
        quantite_commandee: suggestion.quantite,
      });
      setModal(false);
      push("Commande créée avec succès");
      router.push("/commandes");
    } catch (e) {
      push(e.message, "error");
    } finally {
      setSoumission(false);
    }
  };

  return (
    <div className="animate-fade-up space-y-5">
      <PageHeader
        title="Prévisions de demande"
        description="Anticipez la consommation et générez une suggestion de réapprovisionnement."
        actions={
          <Button href="/previsions/ruptures" variant="secondary">
            <AlertTriangle size={14} /> Risque de rupture
          </Button>
        }
      />

      <Card>
        <div className="grid gap-3 md:grid-cols-3">
          <div>
            <label className="field-label">Dépôt</label>
            <select className="field-input" value={depotId} onChange={(e) => setDepotId(e.target.value)}>
              {(metas.depots || []).map((d) => (
                <option key={d.id} value={d.id}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="field-label">Produit</label>
            <select className="field-input" value={produitId} onChange={(e) => setProduitId(e.target.value)}>
              {(metas.produits || []).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="field-label">Horizon</label>
            <div className="flex gap-1">
              {[7, 15, 30].map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => setHorizon(h)}
                  className={`flex-1 rounded px-2 py-2 text-sm font-medium ${
                    horizon === h ? "bg-navy-700 text-white" : "border border-line text-ink-muted"
                  }`}
                >
                  {h} j
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {erreur && <ErrorBanner title="Erreur de prévision" description={erreur} />}

      {!depotId || !produitId ? (
        <Card>
          <EmptyState
            icon={LineChartIcon}
            title="Choisis un dépôt et un produit"
            description="La prévision et l'estimation de rupture s'afficheront ici."
          />
        </Card>
      ) : (
        <>
          <div
            className={`panel overflow-hidden border-l-4 ${
              niveau === "critique" ? "border-l-danger bg-danger-soft/40" : niveau === "attention" ? "border-l-warning bg-warning-soft/40" : "border-l-success bg-success-soft/30"
            }`}
          >
            <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <TankGauge
                  taux={niveau === "critique" ? 28 : niveau === "attention" ? 48 : 78}
                  height={100}
                />
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">Estimation avant rupture</p>
                  <p className="mt-1 text-3xl font-semibold text-ink mono-nums">{formatJours(jours)}</p>
                  <div className="mt-2">
                    <Badge
                      label={niveau === "critique" ? "Critique" : niveau === "attention" ? "Bas" : "Normal"}
                      niveau={niveau}
                    />
                  </div>
                </div>
              </div>
              {(niveau === "critique" || niveau === "attention") && (
                <Button onClick={ouvrirSuggestion}>Générer une suggestion de commande</Button>
              )}
            </div>
          </div>

          <Card title="Courbe de prévision">
            {chargement ? <SkeletonBlock rows={8} /> : <ForecastChart data={chartData} />}
          </Card>

          <Card title="Fiabilité du modèle">
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ["MAE", data?.metriques?.mae, "Erreur absolue moyenne"],
                ["RMSE", data?.metriques?.rmse, "Racine de l'erreur quadratique moyenne"],
                ["MAPE", data?.metriques?.mape, "Erreur pourcentage moyenne"],
              ].map(([label, value, tip]) => (
                <div key={label} className="rounded border border-line p-3">
                  <div className="flex items-center gap-1 text-xs text-ink-muted">
                    {label}
                    <span title={tip} className="cursor-help">
                      <Info size={12} />
                    </span>
                  </div>
                  <p className="mt-1 text-xl font-semibold mono-nums">
                    {label === "MAPE" ? `${formatScore(value)} %` : formatNombre(value)}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}

      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title="Suggestion de réapprovisionnement"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModal(false)}>
              Annuler
            </Button>
            <Button loading={soumission} onClick={creerCommande}>
              Créer la commande
            </Button>
          </>
        }
      >
        {suggestion && (
          <div className="space-y-4 text-sm">
            <p className="rounded bg-canvas p-3 text-ink-soft leading-relaxed">
              Consommation moyenne ({formatNombre(suggestion.conso)}/jour) × Délai fournisseur ({suggestion.delai} jours) +
              Stock de sécurité ({formatNombre(suggestion.securite)}) − Stock actuel ({formatNombre(suggestion.actuel)}) ={" "}
              <strong>Quantité suggérée : {formatNombre(suggestion.quantite)}</strong>
            </p>
            <div>
              <label className="field-label">Fournisseur recommandé</label>
              <select
                className="field-input"
                value={suggestion.fournisseur_id}
                onChange={(e) => setSuggestion((s) => ({ ...s, fournisseur_id: e.target.value }))}
              >
                {(metas.fournisseurs || []).map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.nom} — score {formatScore(f.score)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="field-label">Quantité</label>
              <input
                type="number"
                className="field-input"
                value={suggestion.quantite}
                onChange={(e) => setSuggestion((s) => ({ ...s, quantite: Number(e.target.value) }))}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
