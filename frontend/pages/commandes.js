import { useEffect, useState } from "react";
import { ClipboardList, PlusCircle } from "lucide-react";
import { api } from "../lib/api";
import EtatChargement from "../components/EtatChargement";

const FORM_INITIAL = {
  date_commande: "",
  fournisseur_id: "",
  depot_destination_id: "",
  produit_id: "",
  quantite_commandee: "",
};

export default function Commandes() {
  const [commandes, setCommandes] = useState([]);
  const [formulaire, setFormulaire] = useState(FORM_INITIAL);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);
  const [soumission, setSoumission] = useState(false);

  const chargerCommandes = async () => {
    // TODO: vérifier le format exact une fois l'API disponible
    const donnees = await api.get("/commandes/");
    setCommandes(donnees);
  };

  useEffect(() => {
    setChargement(true);
    setErreur(null);
    chargerCommandes()
      .catch((err) => setErreur(err.message))
      .finally(() => setChargement(false));
  }, []);

  const soumettre = async (event) => {
    event.preventDefault();
    setSoumission(true);
    setErreur(null);
    try {
      // TODO: vérifier le format exact une fois l'API disponible
      await api.post("/commandes/", formulaire);
      setFormulaire(FORM_INITIAL);
      await chargerCommandes();
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
          <ClipboardList size={14} /> Commandes fournisseurs
        </p>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-ink md:text-4xl">Gestion des approvisionnements</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
          Crée une nouvelle commande simulée puis consulte l’historique enregistré au fil de la session.
        </p>
      </div>

      <EtatChargement chargement={chargement} erreur={erreur} title="Chargement des commandes">
        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <form onSubmit={soumettre} className="rounded-2xl border border-white/60 bg-white p-6 shadow-soft">
            <h2 className="text-lg font-bold text-ink">Nouvelle commande</h2>
            <div className="mt-5 grid gap-4">
              {[
                ["date_commande", "Date"],
                ["fournisseur_id", "ID Fournisseur"],
                ["depot_destination_id", "ID Dépôt destination"],
                ["produit_id", "ID Produit"],
                ["quantite_commandee", "Quantité commandée"],
              ].map(([champ, label]) => (
                <label key={champ} className="grid gap-2 text-sm font-medium text-slate-700">
                  <span>{label}</span>
                  <input
                    type={champ === "date_commande" ? "date" : champ === "quantite_commandee" ? "number" : "text"}
                    value={formulaire[champ]}
                    onChange={(e) => setFormulaire({ ...formulaire, [champ]: e.target.value })}
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-ink outline-none transition focus:border-brand-300 focus:bg-white"
                    required
                  />
                </label>
              ))}
            </div>
            <button
              type="submit"
              disabled={soumission}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-950 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-brand-900 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <PlusCircle size={16} /> {soumission ? "Création..." : "Créer la commande"}
            </button>
          </form>

          <div className="overflow-hidden rounded-2xl border border-white/60 bg-white shadow-soft">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-muted">ID</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-muted">Date</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-muted">Statut</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-muted">Montant</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {commandes.map((commande) => (
                  <tr key={commande.bon_commande_id} className="transition hover:bg-brand-50/40">
                    <td className="px-5 py-4 text-sm font-semibold text-ink">{commande.bon_commande_id}</td>
                    <td className="px-5 py-4 text-sm text-slate-700">{commande.date_commande}</td>
                    <td className="px-5 py-4 text-sm text-slate-700">{commande.statut}</td>
                    <td className="px-5 py-4 text-sm font-semibold text-brand-800">{commande.montant_total?.toLocaleString("fr-FR")} FCFA</td>
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
