import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Crown, Trophy, Filter } from "lucide-react";
import { api } from "../lib/api";
import { toast } from "sonner";

const SUBJECT_LABELS = {
  history: "ઇતિહાસ",
  polity: "રાજ્યવ્યવસ્થા",
  geography: "ભૂગોળ",
  economy: "અર્થશાસ્ત્ર",
  sci_tech: "વિજ્ઞાન",
  mental_ability: "માનસિક ક્ષમતા",
  current_affairs: "કરંટ અફેર્સ",
};

export default function Leaderboard() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState(""); // "", "mock", "practice"

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (mode) params.mode = mode;
    api.getLeaderboard(params)
      .then(setEntries)
      .catch(() => toast.error("લીડરબોર્ડ લોડ કરવામાં ભૂલ"))
      .finally(() => setLoading(false));
  }, [mode]);

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-slate-500 font-bold">
          <Trophy className="w-4 h-4 text-[#FF9933]" />
          Leaderboard
        </div>
        <h1 className="mt-1 text-3xl sm:text-4xl gu-serif font-bold text-slate-900">
          ટોપ પરફોર્મર્સ
        </h1>
        <p className="mt-1 text-slate-600">રિયલ-ટાઈમ સ્કોર્સ, દરેક એટેમ્પ્ટ ગણાય છે.</p>
      </motion.div>

      {/* Filter chips */}
      <div className="flex items-center gap-2 mb-5">
        <Filter className="w-4 h-4 text-slate-500" />
        {[
          { k: "", label: "બધા" },
          { k: "mock", label: "Full Mock" },
          { k: "practice", label: "Practice" },
        ].map((f) => (
          <button
            key={f.k}
            data-testid={`leaderboard-filter-${f.k || "all"}`}
            onClick={() => setMode(f.k)}
            className={`px-3 py-1.5 text-sm font-semibold rounded-full border-2 transition-colors ${
              mode === f.k ? "border-[#13294B] bg-[#13294B] text-white" : "border-slate-200 bg-white text-slate-700 hover:border-[#13294B]"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="card-surface overflow-hidden" data-testid="leaderboard-list">
        {loading ? (
          <div className="p-10 text-center text-slate-500 animate-pulse">લોડ થઈ રહ્યું છે...</div>
        ) : entries.length === 0 ? (
          <div className="p-10 text-center text-slate-500">
            હજી કોઈ સ્કોર નથી. પ્રથમ ટોપર બનો!
          </div>
        ) : (
          <ul className="divide-y divide-slate-200">
            {entries.map((e, i) => {
              const isTop3 = i < 3;
              const medalColor = i === 0 ? "#F59E0B" : i === 1 ? "#94A3B8" : i === 2 ? "#B45309" : "#CBD5E1";
              return (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center gap-3 sm:gap-4 p-4 hover:bg-slate-50 transition-colors"
                  data-testid={`leaderboard-row-${i}`}
                >
                  <div
                    className="w-10 h-10 rounded-full grid place-items-center font-bold font-mono-num text-sm shrink-0"
                    style={{
                      background: isTop3 ? `${medalColor}20` : "#F1F5F9",
                      color: isTop3 ? medalColor : "#475569",
                    }}
                  >
                    {isTop3 ? <Crown className="w-4 h-4" /> : `#${i + 1}`}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-slate-900 truncate gu-script">{e.user_name}</div>
                    <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                      <span className="uppercase tracking-widest font-bold">{e.mode}</span>
                      {e.subject && <span>· {SUBJECT_LABELS[e.subject] || e.subject}</span>}
                      <span>· {e.correct}/{e.total_questions} સાચા</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono-num text-xl font-bold text-[#13294B]">
                      {e.net_score.toFixed(2)}
                    </div>
                    <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Net</div>
                  </div>
                </motion.li>
              );
            })}
          </ul>
        )}
      </div>
    </main>
  );
}
