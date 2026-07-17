import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { api } from "../../lib/api";
import { TYPES_INCIDENT } from "../../lib/constants";
import { useProfile } from "../../context/ProfileContext";
import { useToast } from "../../context/ToastContext";
import PageHeader from "../../components/ui/PageHeader";
import SubNav from "../../components/ui/SubNav";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import ErrorBanner from "../../components/ui/ErrorBanner";

const INITIAL = {
  date_incident: new Date().toISOString().slice(0, 10),
  depot_id: "",
  produit_id: "",
  type_incident: TYPES_INCIDENT[0],
  description: "",
};

export default function DeclarerIncidentPage() {
  const router = useRouter();
  const { isDepot } = useProfile();
  const { push } = useToast();
  const [metas, setMetas] = useState({ depots: [], produits: [] });
  const [form, setForm] = useState(INITIAL);
  const [resultat, setResultat] = useState(null);
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur] = useState(null);

  useEffect(() => {
    api.get("/metas/").then((m) => {
      setMetas(m);
      setForm((f) => ({ ...f, depot_id: m.depots[0]?.id || "" }));
    });
  }, []);

  if (!isDepot) {
    return (
      <div className="animate-fade-up">
        <SubNav parentHref="/incidents" parentLabel="Incidents" current="Déclarer" />
        <PageHeader title="Déclarer un incident" description="Réservé au responsable de dépôt." />
        <ErrorBanner title="Accès restreint" description="Changez de profil pour déclarer un incident." />
      </div>
    );
  }

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErreur(null);
    try {
      const res = await api.post("/incidents/", form);
      setResultat(res);
      push("Incident déclaré");
    } catch (err) {
      setErreur(err.message);
      push(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-up space-y-5">
      <SubNav parentHref="/incidents" parentLabel="Incidents" current="Déclarer" />
      <PageHeader
        title="Déclarer un incident"
        description="La gravité est estimée automatiquement par le modèle — elle n’est pas saisie manuellement."
      />

      {erreur && <ErrorBanner title="Impossible d'enregistrer" description={erreur} />}

      {!resultat ? (
        <Card>
          <form onSubmit={submit} className="grid max-w-2xl gap-3 sm:grid-cols-2">
            <div>
              <label className="field-label">Date</label>
              <input
                type="date"
                required
                className="field-input"
                value={form.date_incident}
                onChange={(e) => setForm((f) => ({ ...f, date_incident: e.target.value }))}
              />
            </div>
            <div>
              <label className="field-label">Dépôt</label>
              <select
                required
                className="field-input"
                value={form.depot_id}
                onChange={(e) => setForm((f) => ({ ...f, depot_id: e.target.value }))}
              >
                {(metas.depots || []).map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="field-label">Produit concerné (optionnel)</label>
              <select
                className="field-input"
                value={form.produit_id}
                onChange={(e) => setForm((f) => ({ ...f, produit_id: e.target.value }))}
              >
                <option value="">—</option>
                {(metas.produits || []).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="field-label">Type d&apos;incident</label>
              <select
                required
                className="field-input"
                value={form.type_incident}
                onChange={(e) => setForm((f) => ({ ...f, type_incident: e.target.value }))}
              >
                {TYPES_INCIDENT.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="field-label">Description</label>
              <textarea
                required
                rows={4}
                className="field-input"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" loading={loading}>
                Déclarer
              </Button>
            </div>
          </form>
        </Card>
      ) : (
        <Card title="Incident enregistré">
          <div className="space-y-3 text-sm">
            <p>
              Identifiant : <strong>{resultat.incident_id}</strong>
            </p>
            <p className="flex items-center gap-2">
              Gravité estimée :{" "}
              <Badge
                label={resultat.gravite}
                niveau={
                  resultat.gravite === "Critique" || resultat.gravite === "Élevé"
                    ? "critique"
                    : resultat.gravite === "Modéré"
                      ? "attention"
                      : "neutre"
                }
              />
            </p>
            {(resultat.gravite === "Élevé" || resultat.gravite === "Critique") && (
              <p className="rounded bg-warning-soft px-3 py-2 text-warning">
                Notification envoyée à : Responsable du dépôt concerné
                {resultat.gravite === "Critique" ? " et à la Direction" : ""}.
              </p>
            )}
            <Button onClick={() => router.push("/incidents")}>Voir le registre</Button>
          </div>
        </Card>
      )}
    </div>
  );
}
