import { useEffect, useState } from "react";
import { ChevronDown, Fuel } from "lucide-react";
import { api } from "../lib/api";
import GraphiqueStock from "../components/GraphiqueStock";
import EtatChargement from "../components/EtatChargement";
import { mockMetas } from "../lib/mockData";

export default function Stocks() {
  const [depotId, setDepotId] = useState("D001");
  const [donnees, setDonnees] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);

  useEffect(() => {
    setChargement(true);
    setErreur(null);
    // TODO: vérifier le format exact une fois l'API disponible
    api.get(`/stocks/${depotId}`)
      .then(setDonnees)
      .catch((err) => setErreur(err.message))
      .finally(() => setChargement(false));
  }, [depotId]);

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
      <div className="mb-6 rounded-[1.75rem] border border-white/60 bg-white/75 p-6 shadow-soft backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-brand-800">
              <Fuel size={14} /> Gestion des stocks
            </p>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-ink md:text-4xl">Evolution quotidienne des stocks</h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
              Sélectionne un dépôt pour visualiser sa trajectoire de stock et les seuils d’alerte associés.
            </p>
          </div>

          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <span className="text-sm font-semibold text-slate-700">Dépôt</span>
            <div className="relative">
              <select
                value={depotId}
                onChange={(e) => setDepotId(e.target.value)}
                className="appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2 pl-4 pr-10 text-sm font-medium text-ink outline-none transition focus:border-brand-300 focus:bg-white"
              >
                {mockMetas.depots.map((depot) => (
                  <option key={depot.id} value={depot.id}>
                    {depot.label}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted" />
            </div>
          </label>
        </div>
      </div>

      <EtatChargement chargement={chargement} erreur={erreur} title={`Chargement des stocks pour ${depotId}`}>
        <section className="rounded-2xl border border-white/60 bg-white p-6 shadow-soft">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-ink">Courbe de stock</h2>
              <p className="mt-1 text-sm text-muted">Dépôt {depotId} · produit principal Gasoil Premium.</p>
            </div>
            <div className="rounded-full bg-success-50 px-3 py-1 text-xs font-semibold text-success-700">
              {donnees.filter((item) => item.alerte_stock_bas).length} journées sous alerte
            </div>
          </div>
          <GraphiqueStock donnees={donnees} />
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          {donnees.slice(0, 3).map((ligne) => (
            <article key={ligne.date} className="rounded-2xl border border-white/70 bg-white p-5 shadow-soft">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">{ligne.date}</p>
              <p className="mt-3 text-2xl font-bold text-ink">{ligne.stock_fin_jour.toLocaleString("fr-FR")}</p>
              <p className="mt-1 text-sm text-slate-600">stock fin de journée</p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
                <span className={`rounded-full px-3 py-1 ${ligne.alerte_stock_bas ? "bg-warning-50 text-warning-700" : "bg-success-50 text-success-700"}`}>
                  {ligne.alerte_stock_bas ? "Alerte" : "Normal"}
                </span>
                <span className={`rounded-full px-3 py-1 ${ligne.anomalie_detectee ? "bg-danger-50 text-danger-700" : "bg-slate-100 text-slate-600"}`}>
                  {ligne.anomalie_detectee ? "Anomalie" : "OK"}
                </span>
              </div>
            </article>
          ))}
        </section>
      </EtatChargement>
    </div>
  );
}
