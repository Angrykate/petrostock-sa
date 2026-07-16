import { useEffect, useMemo, useState } from "react";
import { Banknote, ReceiptText } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api } from "../lib/api";
import CarteKpi from "../components/CarteKpi";
import EtatChargement from "../components/EtatChargement";

export default function Finances() {
  const [factures, setFactures] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);

  useEffect(() => {
    setChargement(true);
    setErreur(null);
    // TODO: vérifier le format exact une fois l'API disponible
    api.get("/factures/")
      .then(setFactures)
      .catch((err) => setErreur(err.message))
      .finally(() => setChargement(false));
  }, []);

  const totalFacture = useMemo(() => factures.reduce((somme, facture) => somme + facture.montant_ttc, 0), [factures]);

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
      <div className="mb-6 rounded-[1.75rem] border border-white/60 bg-white/75 p-6 shadow-soft backdrop-blur">
        <p className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-brand-800">
          <Banknote size={14} /> Finances et facturation
        </p>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-ink md:text-4xl">Vue financière simplifiée</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
          Synthèse des ventes facturées et de leur répartition dans un graphique de suivi.
        </p>
      </div>

      <EtatChargement chargement={chargement} erreur={erreur} title="Chargement des factures">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <CarteKpi titre="Chiffre d'affaires total" valeur={`${totalFacture.toLocaleString("fr-FR")} FCFA`} sousTitre="Sur la série facturée simulée" niveau="normal" />
          <CarteKpi titre="Nombre de factures" valeur={factures.length} sousTitre="Transactions disponibles" niveau="info" />
          <CarteKpi titre="Ticket moyen" valeur={`${Math.round(totalFacture / Math.max(factures.length, 1)).toLocaleString("fr-FR")} FCFA`} sousTitre="Moyenne de la période" niveau="attention" />
          <CarteKpi titre="Dépôt dominant" valeur="D001" sousTitre="Plus forte activité" niveau="info" />
        </div>

        <section className="mt-8 rounded-2xl border border-white/60 bg-white p-6 shadow-soft">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-ink">Factures par transaction</h2>
              <p className="mt-1 text-sm text-muted">Visualisation comparative des montants TTC.</p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-800">
              <ReceiptText size={14} /> 5 enregistrements
            </div>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={factures}>
              <CartesianGrid strokeDasharray="4 4" stroke="#dbe4f0" vertical={false} />
              <XAxis dataKey="facture_id" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} width={48} />
              <Tooltip />
              <Bar dataKey="montant_ttc" fill="#3556E6" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </section>
      </EtatChargement>
    </div>
  );
}
