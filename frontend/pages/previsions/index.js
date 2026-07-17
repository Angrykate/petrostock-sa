import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Info, LineChart as LineChartIcon, Sparkles, TrendingDown } from "lucide-react";
import { api } from "../../lib/api";
import { formatFcfa, formatJours, formatNombre, formatPct, formatScore } from "../../lib/format";
import { labelDepot, labelFournisseur, labelProduit } from "../../lib/mockData";
import { useToast } from "../../context/ToastContext";
import { useProfile } from "../../context/ProfileContext";
import PageHeader from "../../components/ui/PageHeader";
import StatStrip from "../../components/ui/StatStrip";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import EmptyState from "../../components/ui/EmptyState";
import ErrorBanner from "../../components/ui/ErrorBanner";
import TankGauge from "../../components/ui/TankGauge";
import { SkeletonBlock } from "../../components/ui/Skeleton";
import { ForecastChart } from "../../components/charts";

export default function PrevisionsHubPage() {
  const router = useRouter();
  const { push } = useToast();
  const { isAchats } = useProfile();
  const [resume, setResume] = useState([]);
  const [detail, setDetail] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [filtre, setFiltre] = useState("tous");
  const [tri, setTri] = useState("urgence");
  const [vue, setVue] = useState("matrice");
  const [depotId, setDepotId] = useState("");
  const [produitId, setProduitId] = useState("");
  const [horizon, setHorizon] = useState(30);
  const [metas, setMetas] = useState({ depots: [], produits: [], fournisseurs: [] });
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);
  const [modalCmd, setModalCmd] = useState(null);
  const [soumission, setSoumission] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [r, m] = await Promise.all([api.get("/previsions/resume/"), api.get("/metas/")]);
        setResume(r);
        setMetas(m);
        setDepotId(m.depots[0]?.id || "");
        setProduitId(m.produits[2]?.id || m.produits[0]?.id || "");
      } catch (e) {
        setErreur(e.message);
      } finally {
        setChargement(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!router.isReady) return;
    if (router.query.depot) setDepotId(String(router.query.depot));
    if (router.query.produit) setProduitId(String(router.query.produit));
    if (router.query.depot || router.query.produit) setVue("detail");
  }, [router.isReady, router.query.depot, router.query.produit]);

  useEffect(() => {
    if (vue !== "detail" || !depotId || !produitId) return;
    let cancel = false;
    (async () => {
      try {
        const [p, r] = await Promise.all([
          api.get(`/previsions/${produitId}?depot_id=${depotId}&horizon_jours=${horizon}`),
          api.get(`/ruptures/${depotId}?produit_id=${produitId}`),
        ]);
        if (cancel) return;
        setDetail({ ...p, ...r });
        const hist = (p.historique || []).slice(-45).map((h) => ({
          date: h.date,
          sorties: h.sorties,
          prevision: null,
          basse: null,
          haute: null,
        }));
        const prev = (p.prevision || []).slice(0, horizon).map((x) => ({
          date: x.date,
          sorties: null,
          prevision: x.prevision,
          basse: x.basse,
          haute: x.haute,
        }));
        setChartData([...hist, ...prev]);
      } catch (e) {
        if (!cancel) setErreur(e.message);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [vue, depotId, produitId, horizon]);

  const liste = useMemo(() => {
    let rows = [...resume];
    if (filtre === "critique") rows = rows.filter((r) => r.niveau === "critique");
    if (filtre === "attention") rows = rows.filter((r) => r.niveau === "attention");
    if (filtre === "opportunite") rows = rows.filter((r) => r.opportunite_achat);
    if (tri === "urgence") rows.sort((a, b) => a.jours_avant_rupture - b.jours_avant_rupture);
    if (tri === "volume") rows.sort((a, b) => b.quantite_suggeree - a.quantite_suggeree);
    if (tri === "cout") rows.sort((a, b) => b.cout_estime_fcfa - a.cout_estime_fcfa);
    if (tri === "confiance") rows.sort((a, b) => b.confiance_modele_pct - a.confiance_modele_pct);
    return rows;
  }, [resume, filtre, tri]);

  const strip = [
    { label: "Couples suivis", value: formatNombre(resume.length) },
    { label: "Critiques (<5 j)", value: formatNombre(resume.filter((r) => r.niveau === "critique").length), tone: "danger" },
    { label: "Attention (5–10 j)", value: formatNombre(resume.filter((r) => r.niveau === "attention").length), tone: "warning" },
    { label: "Volume à commander", value: formatNombre(resume.filter((r) => r.niveau !== "normal").reduce((s, r) => s + r.quantite_suggeree, 0)) },
    { label: "Budget estimé", value: formatFcfa(resume.filter((r) => r.niveau !== "normal").reduce((s, r) => s + r.cout_estime_fcfa, 0)) },
    { label: "MAPE moyen", value: formatPct(resume.reduce((s, r) => s + r.mape, 0) / Math.max(resume.length, 1)), hint: "fiabilité modèle" },
  ];

  const ouvrirSuggestion = (row) => {
    setModalCmd({
      ...row,
      quantite: row.quantite_suggeree,
      fournisseur_id: row.fournisseur_recommande,
      date_commande: new Date().toISOString().slice(0, 10),
    });
  };

  const creerCommande = async () => {
    setSoumission(true);
    try {
      await api.post("/commandes/", {
        date_commande: modalCmd.date_commande,
        fournisseur_id: modalCmd.fournisseur_id,
        depot_destination_id: modalCmd.depot_id,
        produit_id: modalCmd.produit_id,
        quantite_commandee: modalCmd.quantite,
      });
      push("Commande créée depuis la prévision");
      setModalCmd(null);
      router.push("/commandes");
    } catch (e) {
      push(e.message, "error");
    } finally {
      setSoumission(false);
    }
  };

  const jours = detail?.jours_avant_rupture;
  const niveauDetail = jours == null ? "normal" : jours < 5 ? "critique" : jours < 10 ? "attention" : "normal";

  return (
    <div className="animate-fade-up space-y-4">
      <PageHeader
        title="Centre de prévisions IA"
        description="Matrice dépôt × produit, urgences, suggestions chiffrées, courbe de demande et fiabilité du modèle."
        actions={
          <Link href="/previsions/ruptures" className="text-xs font-medium text-navy-700 hover:underline">
            Vue risques de rupture →
          </Link>
        }
      />

      {erreur && <ErrorBanner title="Erreur" description={erreur} />}

      <StatStrip items={strip} />

      <div className="flex flex-wrap gap-1 border-b border-line pb-0">
        {[
          ["matrice", "Matrice & recommandations"],
          ["detail", "Courbe détaillée"],
        ].map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setVue(id)}
            className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition ${
              vue === id ? "border-navy-700 text-navy-800" : "border-transparent text-ink-muted hover:text-ink"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {vue === "matrice" && (
        <>
          <Card>
            <div className="flex flex-wrap items-end gap-3">
              <div>
                <label className="field-label">Filtrer</label>
                <div className="flex gap-1">
                  {[
                    ["tous", "Tous"],
                    ["critique", "Critiques"],
                    ["attention", "Attention"],
                    ["opportunite", "Opportunités"],
                  ].map(([v, l]) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setFiltre(v)}
                      className={`rounded px-2.5 py-1.5 text-xs font-medium ${
                        filtre === v ? "bg-navy-700 text-white" : "border border-line text-ink-muted"
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="field-label">Trier par</label>
                <select className="field-input" value={tri} onChange={(e) => setTri(e.target.value)}>
                  <option value="urgence">Urgence (jours)</option>
                  <option value="volume">Volume suggéré</option>
                  <option value="cout">Coût estimé</option>
                  <option value="confiance">Confiance modèle</option>
                </select>
              </div>
            </div>
          </Card>

          <Card title={`${liste.length} combinaison(s) dépôt × produit`} bodyClassName="!p-0">
            {chargement ? (
              <div className="p-5">
                <SkeletonBlock rows={8} />
              </div>
            ) : liste.length === 0 ? (
              <EmptyState icon={LineChartIcon} title="Aucune prévision pour ce filtre" description="" />
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className="bg-navy-800 text-[11px] uppercase tracking-wide text-white">
                      <th className="px-3 py-2.5">Dépôt / Produit</th>
                      <th className="px-3 py-2.5">Stock</th>
                      <th className="px-3 py-2.5">Conso/j</th>
                      <th className="px-3 py-2.5">Rupture</th>
                      <th className="px-3 py-2.5">Tendance</th>
                      <th className="px-3 py-2.5">Confiance</th>
                      <th className="px-3 py-2.5">Suggestion</th>
                      <th className="px-3 py-2.5">Coût</th>
                      <th className="px-3 py-2.5" />
                    </tr>
                  </thead>
                  <tbody>
                    {liste.map((r) => (
                      <tr key={r.id} className="border-b border-line odd:bg-white even:bg-canvas hover:bg-navy-50">
                        <td className="px-3 py-3">
                          <p className="font-medium text-ink">{labelDepot(r.depot_id)}</p>
                          <p className="text-xs text-ink-muted">{labelProduit(r.produit_id)}</p>
                        </td>
                        <td className="px-3 py-3 mono-nums text-xs">{formatNombre(r.stock_actuel)}</td>
                        <td className="px-3 py-3 mono-nums text-xs">{formatNombre(r.conso_jour)}</td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-semibold mono-nums ${
                                r.niveau === "critique" ? "text-danger" : r.niveau === "attention" ? "text-warning" : "text-success"
                              }`}
                            >
                              {formatJours(r.jours_avant_rupture)}
                            </span>
                            <Badge
                              label={r.niveau === "critique" ? "Critique" : r.niveau === "attention" ? "Attention" : "OK"}
                              niveau={r.niveau === "normal" ? "normal" : r.niveau}
                            />
                          </div>
                        </td>
                        <td className="px-3 py-3 text-xs">
                          <span className="inline-flex items-center gap-1 text-ink-muted">
                            {r.tendance.includes("baisse") && <TrendingDown size={12} className="text-danger" />}
                            {r.tendance.replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-xs">
                          <p className="mono-nums font-medium">{formatPct(r.confiance_modele_pct)}</p>
                          <p className="text-ink-faint">MAPE {formatScore(r.mape)} %</p>
                        </td>
                        <td className="px-3 py-3 text-xs">
                          <p className="mono-nums font-semibold">{formatNombre(r.quantite_suggeree)}</p>
                          <p className="text-ink-muted">
                            {labelFournisseur(r.fournisseur_recommande)} · {formatScore(r.fournisseur_score)}
                          </p>
                        </td>
                        <td className="px-3 py-3 mono-nums text-xs">{formatFcfa(r.cout_estime_fcfa)}</td>
                        <td className="px-3 py-3 text-right space-x-2 whitespace-nowrap">
                          <button
                            type="button"
                            className="text-xs font-medium text-navy-700 hover:underline"
                            onClick={() => {
                              setDepotId(r.depot_id);
                              setProduitId(r.produit_id);
                              setVue("detail");
                            }}
                          >
                            Courbe
                          </button>
                          {isAchats && r.niveau !== "normal" && (
                            <button type="button" className="text-xs font-medium text-accent hover:underline" onClick={() => ouvrirSuggestion(r)}>
                              Commander
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      )}

      {vue === "detail" && (
        <>
          <Card>
            <div className="grid gap-3 md:grid-cols-4">
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
              <div className="flex items-end">
                <Button variant="secondary" className="w-full" onClick={() => setVue("matrice")}>
                  ← Retour matrice
                </Button>
              </div>
            </div>
          </Card>

          <div
            className={`panel overflow-hidden border-l-4 ${
              niveauDetail === "critique"
                ? "border-l-danger bg-danger-soft/30"
                : niveauDetail === "attention"
                  ? "border-l-warning bg-warning-soft/30"
                  : "border-l-success bg-success-soft/20"
            }`}
          >
            <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <TankGauge taux={niveauDetail === "critique" ? 28 : niveauDetail === "attention" ? 48 : 78} height={100} />
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">Estimation avant rupture</p>
                  <p className="mt-1 text-3xl font-semibold text-ink mono-nums">{formatJours(jours)}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge
                      label={niveauDetail === "critique" ? "Critique" : niveauDetail === "attention" ? "Bas" : "Normal"}
                      niveau={niveauDetail}
                    />
                    <span className="text-xs text-ink-muted">
                      {labelDepot(depotId)} · {labelProduit(produitId)}
                    </span>
                  </div>
                </div>
              </div>
              {(niveauDetail === "critique" || niveauDetail === "attention") && isAchats && (
                <Button
                  onClick={() => {
                    const row = resume.find((r) => r.depot_id === depotId && r.produit_id === produitId);
                    if (row) ouvrirSuggestion(row);
                  }}
                >
                  <Sparkles size={14} /> Générer suggestion de commande
                </Button>
              )}
            </div>
          </div>

          <Card title="Courbe historique + prévision (Prophet)">
            {chartData.length ? <ForecastChart data={chartData} /> : <SkeletonBlock rows={8} />}
          </Card>

          <Card title="Fiabilité du modèle retenu">
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ["MAE", detail?.metriques?.mae ?? detail?.mae, "Erreur absolue moyenne"],
                ["RMSE", detail?.metriques?.rmse, "Racine de l'erreur quadratique"],
                ["MAPE", detail?.metriques?.mape ?? detail?.mape, "Erreur pourcentage moyenne"],
              ].map(([label, value, tip]) => (
                <div key={label} className="rounded border border-line p-3">
                  <div className="flex items-center gap-1 text-xs text-ink-muted">
                    {label}
                    <span title={tip}>
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
        open={!!modalCmd}
        onClose={() => setModalCmd(null)}
        title="Suggestion de réapprovisionnement"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalCmd(null)}>
              Annuler
            </Button>
            <Button loading={soumission} onClick={creerCommande}>
              Créer la commande
            </Button>
          </>
        }
      >
        {modalCmd && (
          <div className="space-y-4 text-sm">
            <p className="rounded bg-canvas p-3 leading-relaxed text-ink-soft">
              {labelDepot(modalCmd.depot_id)} / {labelProduit(modalCmd.produit_id)} — rupture estimée dans{" "}
              <strong>{formatJours(modalCmd.jours_avant_rupture)}</strong>. Quantité calculée à partir de la conso journalière, du délai
              fournisseur et du stock de sécurité.
            </p>
            <div>
              <label className="field-label">Fournisseur (classé par score)</label>
              <select
                className="field-input"
                value={modalCmd.fournisseur_id}
                onChange={(e) => setModalCmd((s) => ({ ...s, fournisseur_id: e.target.value }))}
              >
                {(metas.fournisseurs || []).map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.nom} — {formatScore(f.score)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="field-label">Quantité (modifiable)</label>
              <input
                type="number"
                className="field-input"
                value={modalCmd.quantite}
                onChange={(e) => setModalCmd((s) => ({ ...s, quantite: Number(e.target.value) }))}
              />
            </div>
            <p className="text-xs text-ink-muted">Coût estimé : {formatFcfa(modalCmd.quantite * 360)}</p>
          </div>
        )}
      </Modal>
    </div>
  );
}
