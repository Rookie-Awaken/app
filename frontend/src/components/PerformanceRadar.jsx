import React from "react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from "recharts";

const NAMES_GU = {
  history: "ઇતિહાસ",
  polity: "રાજ્યવ્યવસ્થા",
  geography: "ભૂગોળ",
  economy: "અર્થ.",
  sci_tech: "વિજ્ઞાન",
  mental_ability: "મા.ક્ષ.",
  current_affairs: "કરંટ",
};

export default function PerformanceRadar({ breakdown }) {
  const data = Object.entries(breakdown).map(([key, v]) => ({
    subject: NAMES_GU[key] || key,
    percent: v.total > 0 ? Math.round((v.correct / v.total) * 100) : 0,
    correct: v.correct,
    total: v.total,
  }));

  return (
    <div className="w-full h-72" data-testid="performance-radar">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="75%">
          <PolarGrid stroke="#CBD5E1" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: "#0F172A", fontSize: 11, fontFamily: "'Noto Sans Gujarati', sans-serif" }}
          />
          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: "#64748B", fontSize: 10 }} />
          <Radar name="Score" dataKey="percent" stroke="#13294B" fill="#FF9933" fillOpacity={0.55} />
          <Tooltip
            formatter={(val, _n, props) => [`${val}% (${props.payload.correct}/${props.payload.total})`, "સ્કોર"]}
            contentStyle={{ borderRadius: 8, fontFamily: "'Noto Sans Gujarati', sans-serif" }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
