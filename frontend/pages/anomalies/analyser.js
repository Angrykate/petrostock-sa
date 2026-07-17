import { useState } from "react";
import { api } from "../../lib/api";
import { formatScore } from "../../lib/format";
import { useToast } from "../../context/ToastContext";
import PageHeader from "../../components/ui/PageHeader";
import SubNav from "../../components/ui/SubNav";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";

const INITIAL = {
  stock_fin_jour: "",
  entrees: "",
  sorties: "",
  taux_remplissage_pct: "",
};

export default function AnalyserAnomaliePage() {
  const { push } = useToast();
  const [form, setForm] = useState(INITIAL);
  const [resultat, setResultat] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResultat(null);
    try {
      const res = await api.post("/anomalies/detecter", {
        stock_fin_jour: Number(form.stock_fin_jour),
        entrees: Number(form.entrees),
        sorties: Number(form.sorties),
        taux_remplissage_pct: Number(form.taux_remplissage_pct),
      });
      setResultat(res);
      push(res.anomalie_detectee ? "Anomalie détectée" : "Observation normale", res.anomalie_detectee ? "error" : "success");
    } catch (err) {
      push(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-up space-y-5">
      <SubNav parentHref="/anomalies" parentLabel="Anomalies" current="Analyse manuelle" />
      <PageHeader
        title="Analyse manuelle"
        description="Testez une observation hypothétique avant saisie officielle."
      />

      <Card title="Paramètres de l'observation">
        <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
          {[
            ["stock_fin_jour", "Stock fin de jour"],
            ["entrees", "Entrées"],
            ["sorties", "Sorties"],
            ["taux_remplissage_pct", "Taux de remplissage (%)"],
          ].map(([key, label]) => (
            <div key={key}>
              <label className="field-label">{label}</label>
              <input
                required
                type="number"
                step="any"
                className="field-input"
                value={form[key]}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
              />
            </div>
          ))}
          <div className="sm:col-span-2">
            <Button type="submit" loading={loading}>
              Analyser cette observation
            </Button>
          </div>
        </form>
      </Card>

      {resultat && (
        <Card title="Résultat">
          <div className="flex flex-wrap items-center gap-3">
            <Badge
              label={resultat.anomalie_detectee ? "Anomalie détectée" : "Normal"}
              niveau={resultat.anomalie_detectee ? "critique" : "normal"}
            />
            <p className="text-sm text-ink-muted">
              Score de suspicion : <span className="mono-nums font-semibold text-ink">{formatScore(resultat.score_suspicion)}</span>
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
