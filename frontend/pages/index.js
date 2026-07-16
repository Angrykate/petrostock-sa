import { useEffect, useState } from "react";
import { BellRing, CircleDollarSign, ShieldAlert, TrendingUp } from "lucide-react";
import { api } from "../lib/api";
import CarteKpi from "../components/CarteKpi";
import EtatChargement from "../components/EtatChargement";
import GraphiqueStock from "../components/GraphiqueStock";
import { mockAlertes, mockKpi, mockStocks } from "../lib/mockData";

export default function Dashboard() {
  const [kpi, setKpi] = useState(mockKpi);
  const [alertes, setAlertes] = useState(mockAlertes);
  const [stocks, setStocks] = useState(mockStocks.D001);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);

  useEffect(() => {
    // TODO: vérifier le format exact une fois l'API disponible
    Promise.all([api.get("/kpi/"), api.get("/stocks/alertes/"), api.get("/stocks/D001")])
      .then(([donneesKpi, donneesAlertes, donneesStocks]) => {
        setKpi(donneesKpi);
        setAlertes(donneesAlertes);
        setStocks(donneesStocks);
      })
      .catch((err) => setErreur(err.message))
      .finally(() => setChargement(false));
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 rounded-[1.75rem] border border-white/60 bg-white/75 p-6 shadow-soft backdrop-blur xl:flex-row xl:items-end xl:justify-between">
        <div className="max-w-3xl">
          <p className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-brand-800">
            <TrendingUp size={14} /> Supervision opérationnelle
          </p>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-ink md:text-5xl">Tableau de bord PetroStock SA</h1>
          <p className="mt-4 text-base leading-7 text-slate-600 md:text-lg">
            Vision synthétique des niveaux de stock, alertes actives, ruptures potentielles et incidents opérationnels.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm text-slate-600">
          <div className="rounded-2xl bg-slate-50 px-4 py-3 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Périmètre</p>
            <p className="mt-1 font-semibold text-ink">7 pages métier</p>
          </div>
          <div className="rounded-2xl bg-slate-50 px-4 py-3 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Statut</p>
            <p className="mt-1 font-semibold text-success-700">Mode mock actif</p>
          </div>
        </div>
      </div>

      <EtatChargement chargement={chargement} erreur={erreur} title="Chargement du tableau de bord">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <CarteKpi titre="Valeur totale du stock" valeur={`${kpi.valeur_totale_stock_usd.toLocaleString("fr-FR")} USD`} sousTitre="Estimation agrégée multi-dépôts" niveau="info" />
          <CarteKpi titre="Alertes actives" valeur={kpi.nombre_alertes_actives} sousTitre="Seuils de stock bas détectés" niveau="critique" />
          <CarteKpi titre="Taux de remplissage moyen" valeur={`${kpi.taux_remplissage_moyen_pct.toFixed(1)}%`} sousTitre="Moyenne pondérée du réseau" niveau="normal" />
          <CarteKpi titre="Incidents ouverts" valeur={kpi.incidents_ouverts} sousTitre="Points opérationnels à traiter" niveau="attention" />
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
          <section className="rounded-2xl border border-white/60 bg-white p-6 shadow-soft">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-ink">Tendance du stock principal</h2>
                <p className="mt-1 text-sm text-muted">Evolution quotidienne simulée pour le dépôt central.</p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-800">
                <CircleDollarSign size={14} /> Gasoil Premium
              </div>
            </div>
            <GraphiqueStock donnees={stocks} />
          </section>

          <section className="rounded-2xl border border-white/60 bg-white p-6 shadow-soft">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-danger-50 text-danger-700">
                <BellRing size={18} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-ink">Alertes de stock bas</h2>
                <p className="text-sm text-muted">Dernières alertes simulées pour le dashboard.</p>
              </div>
            </div>

            <div className="space-y-3">
              {alertes.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-muted">
                  Aucune alerte active.
                </div>
              ) : (
                alertes.slice(0, 6).map((alerte, index) => {
                  const palette = alerte.niveau === "rouge" ? "border-danger-200 bg-danger-50 text-danger-800" : "border-warning-200 bg-warning-50 text-warning-800";
                  return (
                    <article key={`${alerte.depot_id}-${alerte.produit_id}-${index}`} className={`rounded-2xl border p-4 transition hover:-translate-y-0.5 ${palette}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-ink">{alerte.depot_id} · {alerte.produit_id}</p>
                          <p className="mt-1 text-sm text-slate-600">Stock disponible : {alerte.stock_fin_jour.toLocaleString("fr-FR")} litres</p>
                        </div>
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em]">{alerte.niveau}</span>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </section>
        </div>
      </EtatChargement>
    </div>
  );
}
