import { useEffect, useState } from "react";
import { TriangleAlert } from "lucide-react";
import { api } from "../lib/api";
import EtatChargement from "../components/EtatChargement";

export default function Anomalies() {
  const [anomalies, setAnomalies] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);

  useEffect(() => {
    setChargement(true);
    setErreur(null);
    // TODO: vérifier le format exact une fois l'API disponible
    api.get("/anomalies/")
      .then(setAnomalies)
      .catch((err) => setErreur(err.message))
      .finally(() => setChargement(false));
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
      <div className="mb-6 rounded-[1.75rem] border border-white/60 bg-white/75 p-6 shadow-soft backdrop-blur">
        <p className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-brand-800">
          <TriangleAlert size={14} /> Anomalies détectées
        </p>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-ink md:text-4xl">Surveillance des comportements atypiques</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
          Liste des observations détectées comme anormales par les règles métier ou le modèle IA simulé.
        </p>
      </div>

      <EtatChargement chargement={chargement} erreur={erreur} title="Chargement des anomalies">
        <div className="overflow-hidden rounded-2xl border border-white/60 bg-white shadow-soft">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-muted">Date</th>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-muted">Dépôt</th>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-muted">Produit</th>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-muted">Stock fin</th>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-muted">Score</th>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-muted">Niveau</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {anomalies.map((anomalie) => (
                <tr key={`${anomalie.date}-${anomalie.depot_id}-${anomalie.produit_id}`} className="transition hover:bg-brand-50/40">
                  <td className="px-5 py-4 text-sm text-slate-700">{anomalie.date}</td>
                  <td className="px-5 py-4 text-sm font-medium text-ink">{anomalie.depot_id}</td>
                  <td className="px-5 py-4 text-sm text-slate-700">{anomalie.produit_id}</td>
                  <td className="px-5 py-4 text-sm text-slate-700">{anomalie.stock_fin_jour.toLocaleString("fr-FR")}</td>
                  <td className="px-5 py-4 text-sm font-semibold text-brand-800">{anomalie.score_suspicion.toFixed(2)}</td>
                  <td className="px-5 py-4 text-sm">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${anomalie.score_suspicion >= 0.9 ? "bg-danger-50 text-danger-700" : "bg-warning-50 text-warning-700"}`}>
                      {anomalie.score_suspicion >= 0.9 ? "Critique" : "Attention"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </EtatChargement>
    </div>
  );
}
