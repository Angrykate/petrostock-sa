import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import {
  CheckCircle2,
  ChevronRight,
  Package,
  Search,
  Sparkles,
  Zap,
} from "lucide-react";
import { api } from "../../lib/api";
import { formatJours, formatNombre, formatScore, formatUsd } from "../../lib/format";
import { labelDepot, labelProduit } from "../../lib/mockData";
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
import ActionBar, { ActionBarBtn } from "../../components/ui/ActionBar";
import { SkeletonBlock } from "../../components/ui/Skeleton";

export default function AlertesCentrePage() {
  const router = useRouter();
  const { push } = useToast();
  const { isAchats } = useProfile();
  const [alertes, setAlertes] = useState([]);
  const [selected, setSelected] = useState({});
  const [detail, setDetail] = useState(null);
  const [filtreNiveau, setFiltreNiveau] = useState("tous");
  const [filtreStatut, setFiltreStatut] = useState("ouverte");
  const [filtreDepot, setFiltreDepot] = useState("tous");
  const [recherche, setRecherche] = useState("");
  const [metas, setMetas] = useState({ depots: [] });
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);
  const [busy, setBusy] = useState(false);
  const [autoPreview, setAutoPreview] = useState(null);

  const load = async () => {
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
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (router.query.niveau) setFiltreNiveau(String(router.query.niveau));
  }, [router.query.niveau]);

  const filtre = useMemo(() => {
    return alertes.filter((a) => {
      if (filtreNiveau !== "tous" && a.niveau !== filtreNiveau) return false;
      if (filtreStatut !== "tous" && a.statut !== filtreStatut) return false;
      if (filtreDepot !== "tous" && a.depot_id !== filtreDepot) return false;
      if (recherche) {
        const q = recherche.toLowerCase();
        const blob = `${a.titre} ${a.message} ${labelDepot(a.depot_id)} ${labelProduit(a.produit_id)} ${a.id}`.toLowerCase();
        if (!blob.includes(q)) return false;
      }
      return true;
    });
  }, [alertes, filtreNiveau, filtreStatut, filtreDepot, recherche]);

  const idsSelectionnes = Object.keys(selected).filter((k) => selected[k]);
  const toutesCochees = filtre.length > 0 && filtre.every((a) => selected[a.id]);

  const toggleAll = () => {
    if (toutesCochees) {
      setSelected({});
      return;
    }
    const next = {};
    filtre.forEach((a) => {
      next[a.id] = true;
    });
    setSelected(next);
  };

  const executer = async (action) => {
    if (!idsSelectionnes.length) return;
    setBusy(true);
    try {
      const res = await api.post("/stocks/alertes/actions", { ids: idsSelectionnes, action });
      if (action === "generer_commande") {
        push(`${res.traites} commande(s) générée(s) automatiquement`);
        router.push("/commandes");
      } else {
        push(`Action « ${action} » appliquée à ${res.traites} alerte(s)`);
        await load();
        setSelected({});
      }
    } catch (e) {
      push(e.message, "error");
    } finally {
      setBusy(false);
    }
  };

  const preparerSemiAuto = () => {
    const cibles = filtre.filter((a) => selected[a.id] && a.niveau === "critique" && a.statut === "ouverte");
    if (!cibles.length) {
      push("Sélectionne au moins une alerte critique ouverte", "error");
      return;
    }
    const totalQte = cibles.reduce((s, a) => s + a.suggestion.quantite_suggeree, 0);
    const totalUsd = cibles.reduce((s, a) => s + a.suggestion.impact_estime_usd, 0);
    setAutoPreview({ cibles, totalQte, totalUsd });
  };

  const confirmerSemiAuto = async () => {
    if (!autoPreview) return;
    setBusy(true);
    try {
      await api.post("/stocks/alertes/actions", {
        ids: autoPreview.cibles.map((c) => c.id),
        action: "generer_commande",
      });
      push(`${autoPreview.cibles.length} commandes semi-automatiques créées`);
      setAutoPreview(null);
      router.push("/commandes");
    } catch (e) {
      push(e.message, "error");
    } finally {
      setBusy(false);
    }
  };

  const strip = [
    { label: "Total filtrées", value: formatNombre(filtre.length) },
    { label: "Critiques", value: formatNombre(filtre.filter((a) => a.niveau === "critique").length), tone: "danger" },
    { label: "Ouvertes", value: formatNombre(filtre.filter((a) => a.statut === "ouverte").length), tone: "warning" },
    { label: "En traitement", value: formatNombre(filtre.filter((a) => a.statut === "en_traitement").length) },
    { label: "Sélection", value: formatNombre(idsSelectionnes.length), tone: "info" },
    {
      label: "Volume suggéré",
      value: formatNombre(filtre.filter((a) => selected[a.id]).reduce((s, a) => s + (a.suggestion?.quantite_suggeree || 0), 0)),
      hint: "si commandées",
    },
  ];

  return (
    <div className="animate-fade-up space-y-4">
      <PageHeader
        title="Centre d'alertes"
        description="Sélection · workflow · suggestions IA chiffrées · génération semi-automatique de commandes."
        actions={
          isAchats ? (
            <Button onClick={preparerSemiAuto} disabled={!idsSelectionnes.length}>
              <Zap size={14} /> Semi-auto critiques
            </Button>
          ) : null
        }
      />

      {erreur && <ErrorBanner title="Erreur" description={erreur} onRetry={load} />}

      <StatStrip items={strip} />

      <Card>
        <div className="grid gap-3 md:grid-cols-4">
          <div>
            <label className="field-label">Niveau</label>
            <select className="field-input" value={filtreNiveau} onChange={(e) => setFiltreNiveau(e.target.value)}>
              <option value="tous">Tous</option>
              <option value="critique">Critique</option>
              <option value="attention">Attention</option>
            </select>
          </div>
          <div>
            <label className="field-label">Statut workflow</label>
            <select className="field-input" value={filtreStatut} onChange={(e) => setFiltreStatut(e.target.value)}>
              <option value="tous">Tous</option>
              <option value="ouverte">Ouverte</option>
              <option value="en_traitement">En traitement</option>
              <option value="traitee">Traitée</option>
              <option value="ignoree">Ignorée</option>
            </select>
          </div>
          <div>
            <label className="field-label">Dépôt</label>
            <select className="field-input" value={filtreDepot} onChange={(e) => setFiltreDepot(e.target.value)}>
              <option value="tous">Tous</option>
              {(metas.depots || []).map((d) => (
                <option key={d.id} value={d.id}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="field-label">Recherche</label>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
              <input className="field-input pl-9" value={recherche} onChange={(e) => setRecherche(e.target.value)} placeholder="ID, dépôt, produit…" />
            </div>
          </div>
        </div>
      </Card>

      <ActionBar count={idsSelectionnes.length} onClear={() => setSelected({})}>
        {isAchats && (
          <ActionBarBtn variant="primary" onClick={() => executer("generer_commande")} disabled={busy}>
            <Package size={12} /> Générer commandes
          </ActionBarBtn>
        )}
        <ActionBarBtn onClick={() => executer("escalader")} disabled={busy}>
          Escalader achats
        </ActionBarBtn>
        <ActionBarBtn onClick={() => executer("marquer_traitee")} disabled={busy}>
          Marquer traitée
        </ActionBarBtn>
        <ActionBarBtn variant="danger" onClick={() => executer("ignorer")} disabled={busy}>
          Ignorer
        </ActionBarBtn>
      </ActionBar>

      <Card title={`${filtre.length} alerte(s)`} bodyClassName="!p-0">
        {chargement ? (
          <div className="p-5">
            <SkeletonBlock rows={8} />
          </div>
        ) : filtre.length === 0 ? (
          <EmptyState icon={CheckCircle2} title="Aucune alerte pour ces filtres" description="Élargis les filtres ou change de statut." />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="bg-navy-800 text-[11px] uppercase tracking-wide text-white">
                  <th className="px-3 py-2.5">
                    <input type="checkbox" checked={toutesCochees} onChange={toggleAll} aria-label="Tout sélectionner" />
                  </th>
                  <th className="px-3 py-2.5 font-semibold">ID</th>
                  <th className="px-3 py-2.5 font-semibold">Alerte</th>
                  <th className="px-3 py-2.5 font-semibold">Couverture</th>
                  <th className="px-3 py-2.5 font-semibold">Suggestion IA</th>
                  <th className="px-3 py-2.5 font-semibold">Statut</th>
                  <th className="px-3 py-2.5 font-semibold" />
                </tr>
              </thead>
              <tbody>
                {filtre.map((a) => (
                  <tr
                    key={a.id}
                    className={`border-b border-line ${selected[a.id] ? "bg-navy-50" : "odd:bg-white even:bg-canvas"} hover:bg-navy-50`}
                  >
                    <td className="px-3 py-3">
                      <input
                        type="checkbox"
                        checked={!!selected[a.id]}
                        onChange={() => setSelected((s) => ({ ...s, [a.id]: !s[a.id] }))}
                        aria-label={`Sélectionner ${a.id}`}
                      />
                    </td>
                    <td className="px-3 py-3 font-mono text-xs text-ink-muted">{a.id}</td>
                    <td className="px-3 py-3">
                      <div className="flex items-start gap-2">
                        <Badge label={a.niveau === "critique" ? "Critique" : "Bas"} niveau={a.niveau} />
                        <div>
                          <p className="font-medium text-ink">{a.titre}</p>
                          <p className="mt-0.5 text-xs text-ink-muted">
                            {labelDepot(a.depot_id)} · stock {formatNombre(a.stock_fin_jour)} / seuil {formatNombre(a.seuil_alerte)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`font-semibold mono-nums ${a.jours_couverture <= 3 ? "text-danger" : "text-warning"}`}>
                        {formatJours(a.jours_couverture)}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-xs">
                      <p className="font-medium text-ink mono-nums">{formatNombre(a.suggestion.quantite_suggeree)}</p>
                      <p className="text-ink-muted">
                        {a.suggestion.fournisseur_nom} · score {formatScore(a.suggestion.fournisseur_score)}
                      </p>
                      <p className="text-ink-faint">Δ {formatUsd(a.suggestion.impact_estime_usd)} · délai {a.suggestion.delai_jours} j</p>
                    </td>
                    <td className="px-3 py-3">
                      <Badge
                        label={a.statut.replace("_", " ")}
                        niveau={a.statut === "ouverte" ? "attention" : a.statut === "traitee" ? "normal" : "info"}
                      />
                    </td>
                    <td className="px-3 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setDetail(a)}
                        className="inline-flex items-center gap-0.5 text-xs font-medium text-navy-700 hover:underline"
                      >
                        Détail <ChevronRight size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modal détail */}
      <Modal
        open={!!detail}
        onClose={() => setDetail(null)}
        title={detail?.titre || "Détail alerte"}
        wide
        footer={
          detail && isAchats ? (
            <>
              <Button variant="secondary" onClick={() => setDetail(null)}>
                Fermer
              </Button>
              <Button
                href={`/commandes/nouvelle?depot=${detail.depot_id}&produit=${detail.produit_id}&qte=${detail.suggestion.quantite_suggeree}`}
              >
                Créer la commande suggérée
              </Button>
            </>
          ) : (
            <Button variant="secondary" onClick={() => setDetail(null)}>
              Fermer
            </Button>
          )
        }
      >
        {detail && (
          <div className="space-y-4 text-sm">
            <p className="text-ink-soft">{detail.message}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ["ID", detail.id],
                ["Dépôt", labelDepot(detail.depot_id)],
                ["Produit", labelProduit(detail.produit_id)],
                ["Stock actuel", formatNombre(detail.stock_fin_jour)],
                ["Seuil", formatNombre(detail.seuil_alerte)],
                ["Couverture", formatJours(detail.jours_couverture)],
                ["Conso. / jour", formatNombre(detail.conso_jour)],
                ["Assignee", detail.assignee || "—"],
                ["Créée", detail.created_at],
                ["MAJ", detail.updated_at],
              ].map(([k, v]) => (
                <div key={k} className="rounded border border-line px-3 py-2">
                  <p className="text-[10px] uppercase tracking-wide text-ink-muted">{k}</p>
                  <p className="mt-0.5 font-medium text-ink">{v}</p>
                </div>
              ))}
            </div>
            <div className="rounded border border-accent/30 bg-accent-soft/40 p-4">
              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-navy-800">
                <Sparkles size={12} /> Suggestion semi-automatique
              </p>
              <p className="text-ink-soft leading-relaxed">{detail.suggestion.formule}</p>
              <p className="mt-2 text-base font-semibold text-ink">
                → {formatNombre(detail.suggestion.quantite_suggeree)} · {detail.suggestion.fournisseur_nom} · urgence{" "}
                {detail.suggestion.urgence_heures} h
              </p>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal semi-auto batch */}
      <Modal
        open={!!autoPreview}
        onClose={() => setAutoPreview(null)}
        title="Génération semi-automatique de commandes"
        wide
        footer={
          <>
            <Button variant="secondary" onClick={() => setAutoPreview(null)}>
              Annuler
            </Button>
            <Button loading={busy} onClick={confirmerSemiAuto}>
              Confirmer {autoPreview?.cibles.length || 0} commande(s)
            </Button>
          </>
        }
      >
        {autoPreview && (
          <div className="space-y-3 text-sm">
            <p className="text-ink-soft">
              L&apos;IA propose de créer {autoPreview.cibles.length} bons de commande pour les alertes critiques sélectionnées.
              Tu peux confirmer en bloc — chaque quantité reste ajustable ensuite dans Commandes.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded border border-line p-3">
                <p className="text-[10px] uppercase text-ink-muted">Volume total</p>
                <p className="text-xl font-semibold mono-nums">{formatNombre(autoPreview.totalQte)}</p>
              </div>
              <div className="rounded border border-line p-3">
                <p className="text-[10px] uppercase text-ink-muted">Impact estimé</p>
                <p className="text-xl font-semibold mono-nums">{formatUsd(autoPreview.totalUsd)}</p>
              </div>
            </div>
            <ul className="divide-y divide-line rounded border border-line">
              {autoPreview.cibles.map((c) => (
                <li key={c.id} className="flex justify-between px-3 py-2 text-xs">
                  <span>
                    {c.id} · {labelDepot(c.depot_id)} / {labelProduit(c.produit_id)}
                  </span>
                  <span className="font-medium mono-nums">
                    {formatNombre(c.suggestion.quantite_suggeree)} → {c.suggestion.fournisseur_nom}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Modal>
    </div>
  );
}
