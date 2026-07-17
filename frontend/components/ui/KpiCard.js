import { useEffect, useRef } from "react";
import { TrendingDown, TrendingUp } from "lucide-react";

export default function KpiCard({ title, value, icon: Icon, variation, tone = "default" }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current || typeof value !== "string") return;
    ref.current.classList.add("animate-fade-up");
  }, [value]);

  const border =
    tone === "danger"
      ? "border-l-danger"
      : tone === "warning"
        ? "border-l-warning"
        : tone === "success"
          ? "border-l-success"
          : "border-l-navy-700";

  return (
    <div className={`panel border-l-4 ${border} p-4`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">{title}</p>
          <p ref={ref} className="mt-2 text-2xl font-semibold text-ink mono-nums">
            {value}
          </p>
          {variation != null && (
            <p
              className={`mt-2 inline-flex items-center gap-1 text-xs font-medium ${
                variation >= 0 ? "text-success" : "text-danger"
              }`}
            >
              {variation >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {Math.abs(variation).toFixed(1)} % vs j-1
            </p>
          )}
        </div>
        {Icon && (
          <div className="flex h-9 w-9 items-center justify-center rounded bg-navy-50 text-navy-700">
            <Icon size={16} />
          </div>
        )}
      </div>
    </div>
  );
}
