export function formatNombre(valeur, decimales = 0) {
  if (valeur == null || Number.isNaN(Number(valeur))) return "—";
  return new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: decimales,
    minimumFractionDigits: decimales,
  }).format(Number(valeur));
}

export function formatUsd(valeur) {
  if (valeur == null || Number.isNaN(Number(valeur))) return "—";
  const n = Number(valeur);
  const decimales = Math.abs(n) >= 1000 ? 0 : 2;
  return `${formatNombre(n, decimales)} $`;
}

export function formatFcfa(valeur) {
  if (valeur == null || Number.isNaN(Number(valeur))) return "—";
  return `${formatNombre(Number(valeur), 0)} FCFA`;
}

export function formatPct(valeur) {
  if (valeur == null || Number.isNaN(Number(valeur))) return "—";
  return `${formatNombre(Number(valeur), 1)} %`;
}

export function formatDate(valeur, style = "court") {
  if (!valeur) return "—";
  const d = valeur instanceof Date ? valeur : new Date(valeur);
  if (Number.isNaN(d.getTime())) return "—";
  if (style === "long") {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(d);
  }
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

export function formatHeure(valeur) {
  if (!valeur) return "—";
  const d = valeur instanceof Date ? valeur : new Date(valeur);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);
}

export function formatJours(n) {
  if (n == null || Number.isNaN(Number(n))) return "—";
  const v = Math.round(Number(n));
  return `${v} jour${v > 1 ? "s" : ""}`;
}

export function formatScore(valeur) {
  if (valeur == null || Number.isNaN(Number(valeur))) return "—";
  return formatNombre(Number(valeur), 2);
}

export function exporterCsv(nomFichier, lignes) {
  const csv = lignes.map((l) => l.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(";")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = nomFichier;
  a.click();
  URL.revokeObjectURL(a.href);
}
