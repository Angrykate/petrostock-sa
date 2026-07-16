import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Area, ComposedChart } from "recharts";

export default function GraphiqueStock({ donnees }) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <ComposedChart data={donnees}>
        <defs>
          <linearGradient id="stockGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3556E6" stopOpacity={0.32} />
            <stop offset="95%" stopColor="#3556E6" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="4 4" stroke="#dbe4f0" vertical={false} />
        <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} width={48} />
        <Tooltip
          contentStyle={{
            borderRadius: 16,
            border: "1px solid rgba(15, 23, 42, 0.08)",
            boxShadow: "0 18px 48px rgba(15, 23, 42, 0.12)",
          }}
        />
        <Area type="monotone" dataKey="stock_fin_jour" stroke="#3556E6" fill="url(#stockGradient)" strokeWidth={2} />
        <Line type="monotone" dataKey="stock_fin_jour" stroke="#18295F" strokeWidth={2.5} dot={false} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
