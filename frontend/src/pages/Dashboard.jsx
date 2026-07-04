import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ClipboardList, Flame, Zap } from "lucide-react";
import { toast } from "sonner";
import { api } from "../lib/api";
import { useUser } from "../context/UserContext";
import SubjectIcon from "../components/SubjectIcon";

export default function Dashboard() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();
  const nav = useNavigate();

  useEffect(() => {
    if (!user) { nav("/"); return; }
    api.getSubjects().then((s) => setSubjects(s)).catch(() => toast.error("વિષયો લોડ કરવામાં ભૂલ")).finally(() => setLoading(false));
  }, [user, nav]);

  const startPractice = (subject) => nav(`/quiz/practice/${subject.key}`);
  const startMock = () => nav("/quiz/mock");

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 sm:mb-10"
      >
        <div className="text-xs uppercase tracking-widest text-slate-500 font-bold">
          {user?.name ? `નમસ્કાર, ${user.name}` : "નમસ્કાર"}
        </div>
        <h1 className="mt-1 text-3xl sm:text-4xl lg:text-5xl gu-serif font-bold text-slate-900 tracking-tight leading-tight">
          આજે શું કરવું છે?
        </h1>
        <p className="mt-2 text-slate-600 text-base sm:text-lg">
          વિષય-વાર પ્રેક્ટિસ કરો અથવા 120-મિનિટ ફુલ મોક એટેમ્પ્ટ કરો.
        </p>
      </motion.div>

      {/* Full Mock CTA */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="relative overflow-hidden rounded-2xl mb-10"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#13294B] to-[#1E3A6F]" />
        <div className="absolute -right-8 -top-8 w-52 h-52 bg-[#FF9933]/25 rounded-full blur-3xl" />
        <div className="relative p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <span className="w-12 h-12 rounded-xl bg-[#FF9933] text-white grid place-items-center shadow-lg">
              <Flame className="w-6 h-6" />
            </span>
            <div>
              <div className="text-xs uppercase tracking-widest text-[#FFB366] font-bold">Full Mock Exam</div>
              <h2 className="mt-1 text-xl sm:text-2xl font-bold text-white gu-serif">
                120-મિનિટ ગ્રાન્ડ મોક
              </h2>
              <p className="mt-1 text-sm text-slate-200 max-w-md">
                બધા 7 વિષયોમાંથી પ્રશ્નો · +1 / −0.33 સ્કોરિંગ · ફાઈનલ પરફોર્મન્સ રડાર
              </p>
            </div>
          </div>
          <button
            onClick={startMock}
            data-testid="start-mock-btn"
            className="btn-accent w-full sm:w-auto"
          >
            <Zap className="w-5 h-5" />
            મોક શરૂ કરો
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </motion.div>

      {/* Subject Grid */}
      <div className="flex items-center gap-3 mb-4">
        <ClipboardList className="w-5 h-5 text-[#13294B]" />
        <h3 className="text-lg font-bold text-slate-900">વિષય-વાર પ્રેક્ટિસ</h3>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card-surface p-6 h-40 animate-pulse bg-slate-100" />
          ))}
        </div>
      ) : (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {subjects.map((s) => (
            <motion.button
              key={s.key}
              variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }}
              onClick={() => startPractice(s)}
              data-testid={`subject-card-${s.key}`}
              className="card-surface p-5 text-left group hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer relative overflow-hidden"
            >
              <div
                className="absolute top-0 left-0 w-full h-1 opacity-70 group-hover:opacity-100 transition-opacity"
                style={{ background: s.color }}
              />
              <div
                className="w-12 h-12 rounded-xl grid place-items-center mb-4"
                style={{ background: `${s.color}18`, color: s.color }}
              >
                <SubjectIcon name={s.icon} className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 gu-serif leading-tight">{s.name_gu}</h4>
              <div className="mt-1 flex items-center justify-between">
                <p className="text-xs text-slate-500 uppercase tracking-wider">{s.name_en}</p>
                <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                  {s.question_count} Qs
                </span>
              </div>
              <div className="mt-4 flex items-center gap-1 text-sm font-semibold text-[#13294B] group-hover:gap-2 transition-all">
                પ્રેક્ટિસ શરૂ કરો
                <ArrowRight className="w-4 h-4" />
              </div>
            </motion.button>
          ))}
        </motion.div>
      )}
    </main>
  );
}
