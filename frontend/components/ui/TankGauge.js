/** Jauge de cuve — signature visuelle, usage ponctuel pour un niveau instantané */
export default function TankGauge({ taux = 0, seuilPct = 40, height = 120, className = "" }) {
  const niveau = Math.max(0, Math.min(100, Number(taux) || 0));
  const fillH = (niveau / 100) * (height - 16);
  const color = niveau < 35 ? "#C63B3B" : niveau < 55 ? "#C9841A" : "#1E8E5A";
  const seuilY = height - 8 - (seuilPct / 100) * (height - 16);

  return (
    <svg
      viewBox={`0 0 56 ${height}`}
      width={56}
      height={height}
      className={className}
      aria-label={`Taux de remplissage ${niveau} %`}
    >
      <rect x="10" y="4" width="36" height={height - 8} rx="2" fill="#F1F4F8" stroke="#B8C2D1" strokeWidth="1.5" />
      <rect
        x="12"
        y={height - 8 - fillH}
        width="32"
        height={fillH}
        rx="1"
        fill={color}
        style={{ transition: "y 0.6s cubic-bezier(0.4, 0, 0.2, 1), height 0.6s cubic-bezier(0.4, 0, 0.2, 1)" }}
      />
      <line x1="12" y1={seuilY} x2="44" y2={seuilY} stroke="#C9841A" strokeWidth="1.5" strokeDasharray="3 2" />
      <text x="28" y={height / 2} textAnchor="middle" className="fill-ink text-[10px] font-semibold" style={{ fill: "#1A2332" }}>
        {Math.round(niveau)}%
      </text>
    </svg>
  );
}
