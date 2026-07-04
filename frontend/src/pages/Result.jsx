import React from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Award, Home, RotateCcw, Trophy } from "lucide-react";
import PerformanceRadar from "../components/PerformanceRadar";

function computeProbability(netScore, total) {
  if (total === 0) return { label: "—", pct: 0, color: "#64748B", msg: "કોઈ ડેટા નથી." };
  const pct = (netScore / total) * 100;
  if (pct >= 70) return {
    label: "એલિટ ઝોન",
    pct,
    color: "#16A34A",
    msg: "શાનદાર! GPSC સિલેક્શન પ્રોબેબિલિટી ઘણી ઊંચી છે. મુખ્ય પરીક્ષા માટે ડિપ ડાઇવ કરો.",
  };
  if (pct >= 55) return {
    label: "ફાઈનલ કટ પ્રોમિસિંગ",
    pct,
    color: "#0369A1",
    msg: "સારો સ્કોર! સતત પ્રેક્ટિસથી કટ-ઓફ પાર કરી શકો છો. કરંટ અફેર્સ પર ધ્યાન આપો.",
  };
  if (pct >= 40) return {
    label: "બોર્ડરલાઈન",
    pct,
    color: "#FF9933",
    msg: "તમે યોગ્ય દિશામાં છો. નબળા વિષયોમાં પુનરાવર્તન કરો અને દરરોજ 20+ પ્રશ્નો સોલ્વ કરો.",
  };
  return {
    label: "ઉમ્બરસ્તલ પર",
    pct,
    color: "#DC2626",
    msg: "ચિંતા નહીં કરો — ફાઉન્ડેશન મજબૂત કરો. NCERT + ગુજરાત બોર્ડ પુસ્તકોથી શરૂ કરો.",
  };
}

const SUBJECT_LABELS = {
  history: "ઇતિહાસ",
  polity: "રાજ્યવ્યવસ્થા",
  geography: "ભૂગોળ",
  economy: "અર્થશાસ્ત્ર",
  sci_tech: "વિજ્ઞાન અને ટેકનોલોજી",
  mental_ability: "માનસિક ક્ષમતા",
  current_affairs: "2026 કરંટ અફેર્સ",
};

export default function Result() {
  const loc = useLocation();
  const nav = useNavigate();
  const result = loc.state?.result;
  const breakdown = loc.state?.breakdown;

  if (!result) {
    return (
      <main className="max-w-xl mx-auto px-4 py-16 text-center">
        <p className="text-slate-600">પરિણામ ઉપલબ્ધ નથી.</p>
        <Link to="/dashboard" className="btn-primary mt-6 inline-flex">ડેશબોર્ડ પર જાઓ</Link>
      </main>
    );
  }

  const prob = computeProbability(result.net_score, result.total_questions);
  const accuracy = result.total_questions > 0 ? Math.round((result.correct / result.total_questions) * 100) : 0;
  const timeMin = Math.floor(result.time_taken_seconds / 60);
  const timeSec = result.time_taken_seconds % 60;

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      {/* Hero Score */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#13294B] to-[#1E3A6F] p-6 sm:p-10 text-white"
      >
        <div className="absolute -top-16 -right-16 w-72 h-72 bg-[#FF9933]/25 rounded-full blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#FFB366] font-bold">
            <Trophy className="w-4 h-4" />
            {result.mode === "mock" ? "Full Mock" : `Practice · ${SUBJECT_LABELS[result.subject] || result.subject}`}
          </div>
          <h1 className="mt-2 text-4xl sm:text-6xl gu-serif font-bold tracking-tight">
            {result.user_name}
          </h1>

          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <Stat label="Net સ્કોર" value={result.net_score.toFixed(2)} accent testId="result-net-score" />
            <Stat label="કુલ પ્રશ્નો" value={result.total_questions} />
            <Stat label="ચોકસાઈ" value={`${accuracy}%`} />
            <Stat label="સમય" value={`${timeMin}:${String(timeSec).padStart(2, "0")}`} />
          </div>
        </div>
      </motion.div>

      {/* Body */}
      <div className="mt-6 grid lg:grid-cols-5 gap-6">
        {/* Probability Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="card-surface p-6 lg:col-span-3"
        >
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-slate-500">
            <Award className="w-4 h-4" style={{ color: prob.color }} />
            GPSC Selection Probability
          </div>
          <h2
            data-testid="result-probability-label"
            className="mt-1 text-3xl sm:text-4xl font-bold gu-serif"
            style={{ color: prob.color }}
          >
            {prob.label}
          </h2>
          <p className="mt-3 text-slate-700 leading-relaxed gu-script">{prob.msg}</p>

          <div className="mt-5">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-2">
              <span>સ્કોર %</span>
              <span className="font-mono-num" style={{ color: prob.color }}>{prob.pct.toFixed(1)}%</span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.max(0, Math.min(100, prob.pct))}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{ background: prob.color }}
              />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3">
            <MiniStat label="સાચા" value={result.correct} color="#16A34A" />
            <MiniStat label="ખોટા" value={result.wrong} color="#DC2626" />
            <MiniStat label="છોડ્યા" value={result.skipped} color="#64748B" />
          </div>
        </motion.div>

        {/* Radar */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card-surface p-6 lg:col-span-2"
        >
          <div className="text-xs uppercase tracking-widest font-bold text-slate-500 mb-1">
            Performance Radar
          </div>
          <h3 className="text-lg font-bold text-slate-900 gu-serif mb-2">વિષય-વાર પ્રદર્શન</h3>
          {breakdown ? (
            <PerformanceRadar breakdown={breakdown} />
          ) : (
            <div className="text-sm text-slate-500 py-8 text-center">ડેટા ઉપલબ્ધ નથી</div>
          )}
        </motion.div>
      </div>

      {/* CTAs */}
      <div className="mt-8 flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => nav("/dashboard")}
          data-testid="result-home-btn"
          className="btn-primary flex-1"
        >
          <Home className="w-5 h-5" />
          ડેશબોર્ડ પર જાઓ
        </button>
        <button
          onClick={() => {
            if (result.mode === "mock") nav("/quiz/mock");
            else nav(`/quiz/practice/${result.subject}`);
          }}
          data-testid="result-retry-btn"
          className="btn-accent flex-1"
        >
          <RotateCcw className="w-5 h-5" />
          ફરી પ્રયાસ કરો
        </button>
        <Link
          to="/leaderboard"
          data-testid="result-leaderboard-btn"
          className="btn-ghost flex-1"
        >
          <Trophy className="w-5 h-5" />
          લીડરબોર્ડ
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </main>
  );
}

function Stat({ label, value, accent, testId }) {
  return (
    <div
      data-testid={testId}
      className={`rounded-xl p-3 sm:p-4 backdrop-blur-sm border ${
        accent ? "bg-[#FF9933]/20 border-[#FF9933]/40" : "bg-white/10 border-white/20"
      }`}
    >
      <div className="text-[10px] uppercase tracking-widest opacity-80">{label}</div>
      <div className="mt-1 font-mono-num text-2xl sm:text-3xl font-bold">{value}</div>
    </div>
  );
}

function MiniStat({ label, value, color }) {
  return (
    <div className="rounded-xl p-3 bg-slate-50 border border-slate-200 text-center">
      <div className="text-xs uppercase tracking-widest text-slate-500 font-bold">{label}</div>
      <div className="mt-1 font-mono-num text-2xl font-bold" style={{ color }}>{value}</div>
    </div>
  );
}
