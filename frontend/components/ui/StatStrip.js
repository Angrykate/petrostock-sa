/** Bandeau de chiffres denses — une ligne, pas de carte décorative */
export default function StatStrip({ items }) {
  return (
    <div className="grid grid-cols-2 divide-x divide-line border border-line bg-white sm:grid-cols-3 lg:grid-cols-6">
      {items.map((it) => (
        <div key={it.label} className="px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted">{it.label}</p>
          <p className={`mt-1 text-lg font-semibold mono-nums ${it.tone === "danger" ? "text-danger" : it.tone === "warning" ? "text-warning" : it.tone === "success" ? "text-success" : "text-ink"}`}>
            {it.value}
          </p>
          {it.hint && <p className="mt-0.5 text-[11px] text-ink-faint">{it.hint}</p>}
        </div>
      ))}
    </div>
  );
}
