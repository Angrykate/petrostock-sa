import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatNombre } from "../lib/format";

const tooltipStyle = {
  background: "#fff",
  border: "1px solid #D8DEE8",
  borderRadius: 6,
  fontSize: 12,
};

export function StockAreaChart({ data, dataKey = "stock_fin_jour", animate = true }) {
  return (
    <div className="h-72 w-full" aria-label="Évolution du stock">
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#E8EEF5" strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#5B6B7C" }} tickMargin={8} minTickGap={24} />
          <YAxis tick={{ fontSize: 11, fill: "#5B6B7C" }} tickFormatter={(v) => formatNombre(v / 1000) + "k"} width={48} />
          <Tooltip contentStyle={tooltipStyle} formatter={(v) => formatNombre(v)} />
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke="#14325A"
            fill="#D5E3F4"
            strokeWidth={2}
            isAnimationActive={animate}
            animationDuration={500}
            name="Stock fin de jour"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function StockComposedChart({ data, showEntrees, showSorties, showStock, animate = true }) {
  return (
    <div className="h-80 w-full" aria-label="Évolution stock avec entrées et sorties">
      <ResponsiveContainer>
        <ComposedChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#E8EEF5" strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#5B6B7C" }} minTickGap={28} />
          <YAxis tick={{ fontSize: 11, fill: "#5B6B7C" }} tickFormatter={(v) => formatNombre(v / 1000) + "k"} width={48} />
          <Tooltip contentStyle={tooltipStyle} formatter={(v) => formatNombre(v)} />
          <Legend />
          {showEntrees && <Bar dataKey="entrees" fill="#1E8E5A" name="Entrées" opacity={0.55} isAnimationActive={animate} />}
          {showSorties && <Bar dataKey="sorties" fill="#C63B3B" name="Sorties" opacity={0.45} isAnimationActive={animate} />}
          {showStock && (
            <Line
              type="monotone"
              dataKey="stock_fin_jour"
              stroke="#14325A"
              strokeWidth={2}
              dot={false}
              name="Stock fin"
              isAnimationActive={animate}
            />
          )}
          <Line
            type="monotone"
            dataKey="seuil_alerte_min"
            stroke="#C9841A"
            strokeDasharray="4 4"
            strokeWidth={1.5}
            dot={false}
            name="Seuil alerte"
            isAnimationActive={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ForecastChart({ data, animate = true }) {
  return (
    <div className="h-80 w-full" aria-label="Courbe de prévision de demande">
      <ResponsiveContainer>
        <ComposedChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#E8EEF5" strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#5B6B7C" }} minTickGap={28} />
          <YAxis tick={{ fontSize: 11, fill: "#5B6B7C" }} tickFormatter={(v) => formatNombre(v / 1000) + "k"} width={48} />
          <Tooltip contentStyle={tooltipStyle} formatter={(v) => (v == null ? "—" : formatNombre(v))} />
          <Legend />
          <Area type="monotone" dataKey="haute" stroke="none" fill="#F7F0DB" name="Intervalle haut" isAnimationActive={animate} />
          <Area type="monotone" dataKey="basse" stroke="none" fill="#F1F4F8" name="Intervalle bas" isAnimationActive={animate} />
          <Line type="monotone" dataKey="sorties" stroke="#14325A" strokeWidth={2} dot={false} name="Historique" isAnimationActive={animate} />
          <Line type="monotone" dataKey="prevision" stroke="#B8952F" strokeWidth={2} strokeDasharray="5 4" dot={false} name="Prévision" isAnimationActive={animate} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

export function RevenueBarChart({ data, stacked = false, animate = true }) {
  const keys = ["Transport", "Aviation", "Industrie", "État", "Distribution"];
  const colors = ["#14325A", "#2F6799", "#4F85B8", "#B8952F", "#1E8E5A"];
  return (
    <div className="h-72 w-full" aria-label="Chiffre d'affaires mensuel">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#E8EEF5" strokeDasharray="3 3" />
          <XAxis dataKey="mois" tick={{ fontSize: 11, fill: "#5B6B7C" }} />
          <YAxis tick={{ fontSize: 11, fill: "#5B6B7C" }} width={40} />
          <Tooltip contentStyle={tooltipStyle} />
          <Legend />
          {stacked
            ? keys.map((k, i) => <Bar key={k} dataKey={k} stackId="a" fill={colors[i]} isAnimationActive={animate} />)
            : <Bar dataKey="total" fill="#14325A" name="CA (Mds FCFA)" isAnimationActive={animate} />}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function HorizontalClientsChart({ data, animate = true }) {
  return (
    <div className="h-80 w-full" aria-label="Top clients par chiffre d'affaires">
      <ResponsiveContainer>
        <BarChart data={data} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
          <CartesianGrid stroke="#E8EEF5" strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 11, fill: "#5B6B7C" }} tickFormatter={(v) => formatNombre(v / 1e6) + "M"} />
          <YAxis type="category" dataKey="nom" width={110} tick={{ fontSize: 11, fill: "#5B6B7C" }} />
          <Tooltip contentStyle={tooltipStyle} formatter={(v) => formatNombre(v) + " FCFA"} />
          <Bar dataKey="ca" fill="#14325A" name="CA" isAnimationActive={animate} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
