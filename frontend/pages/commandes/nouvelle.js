import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { api } from "../../lib/api";
import { useToast } from "../../context/ToastContext";
import { useProfile } from "../../context/ProfileContext";
import PageHeader from "../../components/ui/PageHeader";
import SubNav from "../../components/ui/SubNav";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import ErrorBanner from "../../components/ui/ErrorBanner";

const INITIAL = {
  date_commande: new Date().toISOString().slice(0, 10),
  fournisseur_id: "",
  depot_destination_id: "",
  produit_id: "",
  quantite_commandee: "",
};

export default function NouvelleCommandePage() {
  const router = useRouter();
  const { push } = useToast();
  const { isAchats } = useProfile();
  const [metas, setMetas] = useState({ depots: [], produits: [], fournisseurs: [] });
  const [form, setForm] = useState(INITIAL);
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur] = useState(null);

  useEffect(() => {
    api.get("/metas/").then((m) => {
      setMetas(m);
      setForm((f) => ({
        ...f,
        fournisseur_id: m.fournisseurs[0]?.id || "",
        depot_destination_id: router.query.depot || m.depots[0]?.id || "",
        produit_id: router.query.produit || m.produits[0]?.id || "",
        quantite_commandee: router.query.qte || "",
      }));
    });
  }, [router.query]);

  if (!isAchats) {
    return (
      <div className="animate-fade-up">
        <SubNav parentHref="/commandes" parentLabel="Commandes" current="Nouvelle commande" />
        <PageHeader title="Nouvelle commande" description="Accès réservé au responsable des achats." />
        <ErrorBanner title="Accès restreint" description="Changez de profil pour créer une commande." />
      </div>
    );
  }

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErreur(null);
    try {
      await api.post("/commandes/", form);
      push("Commande créée avec succès");
      router.push("/commandes");
    } catch (err) {
      setErreur(err.message);
      push(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-up space-y-5">
      <SubNav parentHref="/commandes" parentLabel="Commandes" current="Nouvelle commande" />
      <PageHeader title="Nouvelle commande" description="Création d'un bon de commande fournisseur." />

      {erreur && <ErrorBanner title="Impossible d'enregistrer" description={erreur} />}

      <Card>
        <form onSubmit={submit} className="grid max-w-2xl gap-3 sm:grid-cols-2">
          <div>
            <label className="field-label">Date</label>
            <input
              type="date"
              required
              className="field-input"
              value={form.date_commande}
              onChange={(e) => setForm((f) => ({ ...f, date_commande: e.target.value }))}
            />
          </div>
          <div>
            <label className="field-label">Fournisseur</label>
            <select
              required
              className="field-input"
              value={form.fournisseur_id}
              onChange={(e) => setForm((f) => ({ ...f, fournisseur_id: e.target.value }))}
            >
              {(metas.fournisseurs || []).map((f) => (
                <option key={f.id} value={f.id}>
                  {f.nom}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="field-label">Dépôt destination</label>
            <select
              required
              className="field-input"
              value={form.depot_destination_id}
              onChange={(e) => setForm((f) => ({ ...f, depot_destination_id: e.target.value }))}
            >
              {(metas.depots || []).map((d) => (
                <option key={d.id} value={d.id}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="field-label">Produit</label>
            <select
              required
              className="field-input"
              value={form.produit_id}
              onChange={(e) => setForm((f) => ({ ...f, produit_id: e.target.value }))}
            >
              {(metas.produits || []).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="field-label">Quantité</label>
            <input
              type="number"
              required
              min="1"
              className="field-input"
              value={form.quantite_commandee}
              onChange={(e) => setForm((f) => ({ ...f, quantite_commandee: e.target.value }))}
            />
          </div>
          <div className="flex gap-2 sm:col-span-2">
            <Button type="submit" loading={loading}>
              Créer la commande
            </Button>
            <Button type="button" variant="secondary" onClick={() => router.push("/commandes")}>
              Annuler
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
