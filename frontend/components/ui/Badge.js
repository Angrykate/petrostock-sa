const STYLES = {
  normal: "bg-success-soft text-success",
  attention: "bg-warning-soft text-warning",
  critique: "bg-danger-soft text-danger",
  info: "bg-navy-50 text-navy-700",
  neutre: "bg-canvas-tint text-ink-muted",
};

export default function Badge({ label, niveau = "info", className = "" }) {
  return (
    <span
      className={`inline-flex items-center rounded-sm px-2 py-0.5 text-[11px] font-semibold tracking-wide ${STYLES[niveau] || STYLES.info} ${className}`}
    >
      {label}
    </span>
  );
}
