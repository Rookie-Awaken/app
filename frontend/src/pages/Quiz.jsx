import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, ArrowRight, Check, ChevronLeft, X } from "lucide-react";
import { toast } from "sonner";
import { api } from "../lib/api";
import { useUser } from "../context/UserContext";
import Timer from "../components/Timer";

const LETTERS = ["A", "B", "C", "D"];

const SUBJECT_LABELS = {
  history: "ઇતિહાસ",
  polity: "રાજ્યવ્યવસ્થા",
  geography: "ભૂગોળ",
  economy: "અર્થશાસ્ત્ર",
  sci_tech: "વિજ્ઞાન અને ટેકનોલોજી",
  mental_ability: "માનસિક ક્ષમતા",
  current_affairs: "2026 કરંટ અફેર્સ",
};

export default function Quiz() {
  const { subject } = useParams();
  const location = useLocation();
  const mode = location.pathname.includes("/quiz/mock") ? "mock" : "practice";
  const { user } = useUser();
  const nav = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null); // index chosen
  const [locked, setLocked] = useState(false); // once user picks, options lock and feedback shows
  const [answers, setAnswers] = useState([]); // {question_id, subject, selected, is_correct}
  const [startTs] = useState(() => Date.now());
  const [confirmExit, setConfirmExit] = useState(false);

  const totalSeconds = mode === "mock" ? 120 * 60 : 30 * 60; // 30-min for practice

  useEffect(() => {
    if (!user) { nav("/"); return; }
    setLoading(true);
    const p = mode === "mock"
      ? api.getMockQuestions(110)
      : api.getPracticeQuestions(subject, 110);
    p.then((qs) => {
      if (!qs.length) {
        toast.error("પ્રશ્નો ઉપલબ્ધ નથી");
        nav("/dashboard");
        return;
      }
      setQuestions(qs);
    }).catch(() => {
      toast.error("પ્રશ્નો લોડ કરવામાં ભૂલ");
      nav("/dashboard");
    }).finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, subject]);

  const current = questions[idx];
  const progress = questions.length > 0 ? ((idx + 1) / questions.length) * 100 : 0;

  const netScore = useMemo(() => {
    let s = 0;
    for (const a of answers) {
      if (a.selected === null || a.selected === undefined) continue;
      s += a.is_correct ? 1 : -0.33;
    }
    return Math.round(s * 100) / 100;
  }, [answers]);

  const pick = (i) => {
    if (locked) return;
    setSelected(i);
    setLocked(true);
    const isCorrect = i === current.answer;
    const rec = {
      question_id: current.id,
      subject: current.subject,
      selected: i,
      is_correct: isCorrect,
    };
    setAnswers((prev) => [...prev, rec]);
  };

  const skip = () => {
    if (locked) return;
    const rec = {
      question_id: current.id,
      subject: current.subject,
      selected: null,
      is_correct: false,
    };
    setAnswers((prev) => [...prev, rec]);
    setLocked(true);
    setSelected(null);
  };

  const goNext = () => {
    if (idx + 1 >= questions.length) return finish(false);
    setIdx((i) => i + 1);
    setSelected(null);
    setLocked(false);
  };

  const finish = async (autoSubmitted) => {
    const finalAnswers = [...answers];
    // If user didn't answer last shown question but pressed submit early, we skip inserting.
    const correct = finalAnswers.filter((a) => a.is_correct).length;
    const wrong = finalAnswers.filter((a) => !a.is_correct && a.selected !== null && a.selected !== undefined).length;
    const skipped = finalAnswers.filter((a) => a.selected === null || a.selected === undefined).length;
    const remaining = questions.length - finalAnswers.length;

    // Count remaining unattempted as skipped
    const totalSkipped = skipped + Math.max(0, remaining);
    const total = questions.length;
    const net = Math.round((correct * 1 - wrong * 0.33) * 100) / 100;

    // Subject breakdown
    const breakdown = {};
    for (const q of questions) {
      if (!breakdown[q.subject]) breakdown[q.subject] = { correct: 0, wrong: 0, skipped: 0, total: 0 };
      breakdown[q.subject].total += 1;
    }
    for (const a of finalAnswers) {
      if (!breakdown[a.subject]) breakdown[a.subject] = { correct: 0, wrong: 0, skipped: 0, total: 0 };
      if (a.selected === null || a.selected === undefined) breakdown[a.subject].skipped += 1;
      else if (a.is_correct) breakdown[a.subject].correct += 1;
      else breakdown[a.subject].wrong += 1;
    }
    // Mark unattempted (remaining) as skipped in breakdown
    const answeredIds = new Set(finalAnswers.map((a) => a.question_id));
    for (const q of questions) {
      if (!answeredIds.has(q.id)) breakdown[q.subject].skipped += 1;
    }

    const payload = {
      user_id: user.id,
      user_name: user.name,
      mode,
      subject: mode === "practice" ? subject : null,
      total_questions: total,
      correct,
      wrong,
      skipped: totalSkipped,
      net_score: net,
      time_taken_seconds: Math.floor((Date.now() - startTs) / 1000),
      subject_breakdown: breakdown,
      answers: finalAnswers,
    };
    try {
      const saved = await api.submitResult(payload);
      if (autoSubmitted) toast("⏰ સમય પૂરો! પરિણામ સાચવ્યું.", { duration: 3000 });
      nav("/result", { state: { result: saved, breakdown } });
    } catch {
      toast.error("પરિણામ સાચવવામાં ભૂલ");
    }
  };

  if (loading) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="animate-pulse text-slate-500">પ્રશ્નો લોડ થઈ રહ્યા છે...</div>
      </main>
    );
  }
  if (!current) return null;

  const isCorrectPick = locked && selected === current.answer;
  const isWrongPick = locked && selected !== null && selected !== current.answer;

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-5 sm:py-8 pb-24">
      {/* Top bar: Timer + Net Score + Back */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <button
          onClick={() => setConfirmExit(true)}
          data-testid="quiz-back-btn"
          className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-[#13294B] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          છોડો
        </button>
        <div className="flex items-center gap-2 sm:gap-3">
          <div
            data-testid="net-score-display"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[#13294B] text-white font-bold border border-[#13294B]"
          >
            <span className="text-[10px] uppercase tracking-widest opacity-80">Net</span>
            <span className="font-mono-num text-base sm:text-lg">{netScore.toFixed(2)}</span>
          </div>
          <Timer seconds={totalSeconds} onExpire={() => finish(true)} testId="quiz-timer" />
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2 text-xs">
          <span className="uppercase tracking-widest font-bold text-slate-500">
            {mode === "mock" ? "Full Mock" : SUBJECT_LABELS[subject] || subject}
          </span>
          <span data-testid="quiz-progress-text" className="font-bold text-slate-700 font-mono-num">
            {idx + 1} / {questions.length}
          </span>
        </div>
        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-[#FF9933]"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Question card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="card-surface p-5 sm:p-7"
        >
          <div className="text-xs uppercase tracking-widest text-slate-500 font-bold">
            પ્રશ્ન {idx + 1}
            {mode === "mock" && current.subject && (
              <span className="ml-2 px-2 py-0.5 bg-slate-100 rounded-full normal-case tracking-normal text-slate-600 gu-script">
                {SUBJECT_LABELS[current.subject]}
              </span>
            )}
          </div>
          <h2
            data-testid="quiz-question-text"
            className="mt-2 text-xl sm:text-2xl font-semibold text-slate-900 gu-script leading-relaxed"
          >
            {current.question}
          </h2>

          <div className="mt-6 grid grid-cols-1 gap-3">
            {current.options.map((opt, i) => {
              const isSel = selected === i;
              const isAns = current.answer === i;
              let cls = "quiz-option gu-script";
              if (locked && isAns) cls += " correct";
              else if (locked && isSel && !isAns) cls += " wrong";
              else if (isSel) cls += " selected";
              return (
                <button
                  key={i}
                  onClick={() => pick(i)}
                  disabled={locked}
                  data-testid={`quiz-option-${i}`}
                  className={cls}
                >
                  <span className="option-badge">{LETTERS[i]}</span>
                  <span className="flex-1">{opt}</span>
                  {locked && isAns && <Check className="w-5 h-5 text-[#16A34A]" />}
                  {locked && isSel && !isAns && <X className="w-5 h-5 text-[#DC2626]" />}
                </button>
              );
            })}
          </div>

          {/* Feedback */}
          <AnimatePresence>
            {locked && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-5 overflow-hidden"
              >
                <div
                  data-testid="quiz-explanation"
                  className={`rounded-xl border-2 p-4 ${
                    isCorrectPick
                      ? "border-[#16A34A] bg-[#DCFCE7]"
                      : isWrongPick
                      ? "border-[#DC2626] bg-[#FEE2E2]"
                      : "border-slate-300 bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-2 text-sm font-bold mb-1.5">
                    {isCorrectPick ? (
                      <>
                        <Check className="w-4 h-4 text-[#16A34A]" />
                        <span className="text-[#166534]">સાચો જવાબ! +1</span>
                      </>
                    ) : isWrongPick ? (
                      <>
                        <X className="w-4 h-4 text-[#DC2626]" />
                        <span className="text-[#991B1B]">ખોટો જવાબ · −0.33</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4 text-slate-600" />
                        <span className="text-slate-700">છોડી દીધું · 0</span>
                      </>
                    )}
                  </div>
                  <div className="text-sm sm:text-[15px] leading-relaxed text-slate-800 gu-script">
                    <span className="font-bold">સ્પષ્ટીકરણ: </span>
                    {current.explanation}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions */}
          <div className="mt-6 flex items-center justify-between gap-3">
            {!locked ? (
              <button
                onClick={skip}
                data-testid="quiz-skip-btn"
                className="btn-ghost"
              >
                છોડો
              </button>
            ) : (
              <div />
            )}
            {locked && (
              <button
                onClick={goNext}
                data-testid="quiz-next-btn"
                className="btn-primary"
              >
                {idx + 1 >= questions.length ? "પરિણામ જુઓ" : "આગળનો પ્રશ્ન"}
                <ArrowRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Confirm Exit Modal */}
      {confirmExit && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm grid place-items-center p-4" data-testid="exit-confirm-modal">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl"
          >
            <h3 className="text-lg font-bold text-slate-900">ક્વિઝ છોડવો છે?</h3>
            <p className="mt-2 text-sm text-slate-600">
              તમારી પ્રગતિ સાચવવામાં નહીં આવે.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                onClick={() => setConfirmExit(false)}
                data-testid="exit-cancel-btn"
                className="btn-ghost"
              >
                રહો
              </button>
              <button
                onClick={() => nav("/dashboard")}
                data-testid="exit-confirm-btn"
                className="min-h-[48px] rounded-xl bg-[#DC2626] text-white font-bold hover:bg-red-700 transition-colors"
              >
                હા, છોડો
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </main>
  );
}
