import { useEffect, useState } from "react";
import { Siren, PlusCircle } from "lucide-react";
import { api } from "../lib/api";
import EtatChargement from "../components/EtatChargement";

const FORM_INITIAL = {
  date_incident: "",
  depot_id: "",
  type_incident: "",
  description: "",
};

export default function Incidents() {
  const [incidents, setIncidents] = useState([]);
  const [formulaire, setFormulaire] = useState(FORM_INITIAL);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);
  const [soumission, setSoumission] = useState(false);

  const chargerIncidents = async () => {
    // TODO: vérifier le format exact une fois l'API disponible
    const donnees = await api.get("/incidents/");
    setIncidents(donnees);
  };

  useEffect(() => {
    setChargement(true);
    setErreur(null);
    chargerIncidents()
      .catch((err) => setErreur(err.message))
      .finally(() => setChargement(false));
  }, []);

  const soumettre = async (event) => {
    event.preventDefault();
    setSoumission(true);
    setErreur(null);
    try {
      // TODO: vérifier le format exact une fois l'API disponible
      const nouvelIncident = await api.post("/incidents/", formulaire);
      setFormulaire(FORM_INITIAL);
      setIncidents((courant) => [nouvelIncident, ...courant]);
    } catch (error) {
      setErreur(error.message);
    } finally {
      setSoumission(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
      <div className="mb-6 rounded-[1.75rem] border border-white/60 bg-white/75 p-6 shadow-soft backdrop-blur">
        <p className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-brand-800">
          <Siren size={14} /> Incidents opérationnels
        </p>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-ink md:text-4xl">Déclaration et suivi des incidents</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
          Enregistre un incident simulé avec sa gravité estimée, puis suis son évolution dans la liste.
        </p>
      </div>

      <EtatChargement chargement={chargement} erreur={erreur} title="Chargement des incidents">
        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <form onSubmit={soumettre} className="rounded-2xl border border-white/60 bg-white p-6 shadow-soft">
            <h2 className="text-lg font-bold text-ink">Nouvel incident</h2>
            <div className="mt-5 grid gap-4">
              {[
                ["date_incident", "Date", "date"],
                ["depot_id", "ID Dépôt", "text"],
                ["type_incident", "Type d'incident", "text"],
                ["description", "Description", "text"],
              ].map(([champ, label, type]) => (
                <label key={champ} className="grid gap-2 text-sm font-medium text-slate-700">
                  <span>{label}</span>
                  {champ === "description" ? (
                    <textarea
                      rows={4}
                      value={formulaire[champ]}
                      onChange={(e) => setFormulaire({ ...formulaire, [champ]: e.target.value })}
                      className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-ink outline-none transition focus:border-brand-300 focus:bg-white"
                      required
                    />
                  ) : (
                    <input
                      type={type}
                      value={formulaire[champ]}
                      onChange={(e) => setFormulaire({ ...formulaire, [champ]: e.target.value })}
                      className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-ink outline-none transition focus:border-brand-300 focus:bg-white"
                      required
                    />
                  )}
                </label>
              ))}
            </div>
            <button
              type="submit"
              disabled={soumission}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-950 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-brand-900 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <PlusCircle size={16} /> {soumission ? "Création..." : "Déclarer l'incident"}
            </button>
          </form>

          <div className="overflow-hidden rounded-2xl border border-white/60 bg-white shadow-soft">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-muted">ID</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-muted">Dépôt</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-muted">Type</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-muted">Gravité</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-muted">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {incidents.map((incident) => (
                  <tr key={incident.incident_id} className="transition hover:bg-brand-50/40">
                    <td className="px-5 py-4 text-sm font-semibold text-ink">{incident.incident_id}</td>
                    <td className="px-5 py-4 text-sm text-slate-700">{incident.depot_id}</td>
                    <td className="px-5 py-4 text-sm text-slate-700">{incident.type_incident}</td>
                    <td className="px-5 py-4 text-sm">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${incident.gravite === "Critique" ? "bg-danger-50 text-danger-700" : incident.gravite === "Élevé" ? "bg-warning-50 text-warning-700" : "bg-success-50 text-success-700"}`}>
                        {incident.gravite}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-700">{incident.statut}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </EtatChargement>
    </div>
  );
}
