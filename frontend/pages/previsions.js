import { useEffect, useMemo, useState } from "react";
import { ArrowRightLeft, CalendarRange } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api } from "../lib/api";
import EtatChargement from "../components/EtatChargement";
import { mockMetas } from "../lib/mockData";

export default function Previsions() {
  const [produitId, setProduitId] = useState("PRD003");
  const [depotId, setDepotId] = useState("D001");
  const [prevision, setPrevision] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);

  useEffect(() => {
    setChargement(true);
    setErreur(null);
    // TODO: vérifier le format exact une fois l'API disponible
    api.get(`/previsions/${produitId}?depot_id=${depotId}&horizon_jours=30`)
      .then(setPrevision)
      .catch((err) => setErreur(err.message))
      .finally(() => setChargement(false));
  }, [produitId, depotId]);

  const donneesGraphique = useMemo(() => {
    if (!prevision) return [];
    return prevision.prevision.map((valeur, index) => ({
      jour: index + 1,
      prevision: valeur,
      basse: prevision.intervalle_confiance_basse?.[index],
      haute: prevision.intervalle_confiance_haute?.[index],
    }));
  }, [prevision]);

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
      <div className="mb-6 rounded-[1.75rem] border border-white/60 bg-white/75 p-6 shadow-soft backdrop-blur">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-brand-800">
              <CalendarRange size={14} /> Prévisions IA
            </p>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-ink md:text-4xl">Projection de demande sur 30 jours</h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
              Compare l’évolution estimée pour chaque couple dépôt/produit, avec intervalle de confiance simulé.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <span className="block text-xs font-semibold uppercase tracking-[0.2em] text-muted">Produit</span>
              <select
                value={produitId}
                onChange={(e) => setProduitId(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-ink outline-none transition focus:border-brand-300 focus:bg-white"
              >
                {mockMetas.produits.map((produit) => (
                  <option key={produit.id} value={produit.id}>{produit.label}</option>
                ))}
              </select>
            </label>
            <label className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <span className="block text-xs font-semibold uppercase tracking-[0.2em] text-muted">Dépôt</span>
              <select
                value={depotId}
                onChange={(e) => setDepotId(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-ink outline-none transition focus:border-brand-300 focus:bg-white"
              >
                {mockMetas.depots.map((depot) => (
                  <option key={depot.id} value={depot.id}>{depot.label}</option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </div>

      <EtatChargement chargement={chargement} erreur={erreur} title={`Calcul de la prévision pour ${produitId}`}>
        <section className="rounded-2xl border border-white/60 bg-white p-6 shadow-soft">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-ink">Tendance estimée</h2>
              <p className="mt-1 text-sm text-muted">{depotId} · {produitId} · horizon 30 jours</p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-accent-50 px-3 py-1 text-xs font-semibold text-accent-800">
              <ArrowRightLeft size={14} /> Mode simulation
            </div>
          </div>

          {prevision ? (
            <ResponsiveContainer width="100%" height={360}>
              <AreaChart data={donneesGraphique}>
                <defs>
                  <linearGradient id="forecastFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3556E6" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#3556E6" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke="#dbe4f0" vertical={false} />
                <XAxis dataKey="jour" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} width={48} />
                <Tooltip />
                <Area type="monotone" dataKey="prevision" stroke="#3556E6" fill="url(#forecastFill)" strokeWidth={2.4} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted">Aucune prévision disponible.</p>
          )}
        </section>
      </EtatChargement>
    </div>
  );
}
