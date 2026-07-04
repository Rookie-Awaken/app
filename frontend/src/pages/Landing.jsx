import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, GraduationCap, Sparkles, Trophy, Zap } from "lucide-react";
import { toast } from "sonner";
import { api } from "../lib/api";
import { useUser } from "../context/UserContext";

export default function Landing() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const { setUser } = useUser();
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      toast.error("કૃપા કરી ઓછામાં ઓછા 2 અક્ષરનું નામ દાખલ કરો");
      return;
    }
    setLoading(true);
    try {
      const u = await api.createUser(trimmed);
      setUser(u);
      toast.success(`સ્વાગત છે, ${u.name}!`);
      nav("/dashboard");
    } catch (err) {
      toast.error(err?.response?.data?.detail || "કંઈક ખોટું થયું");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen relative overflow-hidden bg-[#F8FAFC]">
      {/* Decorative background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#FF9933]/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-24 w-96 h-96 bg-[#13294B]/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-16">
        {/* Brand row */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-10"
        >
          <span className="w-11 h-11 rounded-xl bg-[#13294B] text-white grid place-items-center shadow-lg">
            <GraduationCap className="w-6 h-6" />
          </span>
          <div>
            <div className="font-bold text-slate-900 text-lg leading-none">GPSC Elite</div>
            <div className="text-[10px] uppercase tracking-widest text-slate-500 mt-1">Mock Master</div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left: pitch */}
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05 }}
            className="order-2 lg:order-1"
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF9933]/15 text-[#B45309] text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              GPSC Class 1 & 2 · 2026
            </span>
            <h1 className="mt-4 text-4xl sm:text-5xl lg:text-6xl gu-serif font-bold text-slate-900 leading-[1.15] tracking-tight">
              ગુજરાતના
              <br />
              <span className="text-[#13294B]">GPSC</span> ટોપર્સ માટે
              <br />
              <span className="text-[#FF9933]">એલિટ મોક</span> એન્જિન
            </h1>
            <p className="mt-5 text-base sm:text-lg text-slate-600 leading-relaxed max-w-lg">
              700+ પ્રશ્નોનું ડિપ ડેટાબેઝ. ગુજરાતી ભાષામાં તાત્કાલિક ફીડબેક, વિષય-વાર પરફોર્મન્સ રડાર, અને GPSC સિલેક્શન પ્રોબેબિલિટી.
            </p>

            <div className="mt-8 flex items-center gap-6 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-slate-100 grid place-items-center"><Zap className="w-4 h-4 text-[#FF9933]" /></span>
                તાત્કાલિક ફીડબેક
              </div>
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-slate-100 grid place-items-center"><Trophy className="w-4 h-4 text-[#13294B]" /></span>
                લીડરબોર્ડ
              </div>
            </div>
          </motion.div>

          {/* Right: name-entry card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="order-1 lg:order-2"
          >
            <form
              onSubmit={submit}
              className="card-surface p-6 sm:p-8 relative overflow-hidden"
              data-testid="landing-name-form"
            >
              <div className="absolute top-0 right-0 h-1 w-24 bg-[#FF9933] rounded-bl-lg" />
              <label className="text-xs uppercase tracking-widest text-slate-500 font-bold">
                ચાલો શરૂ કરીએ
              </label>
              <h2 className="mt-1 text-2xl sm:text-3xl font-bold text-slate-900 gu-serif">
                તમારું નામ દાખલ કરો
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                કોઈ પાસવર્ડ નહીં. બસ નામ — અને લીડરબોર્ડ પર તમારો સ્કોર દેખાશે.
              </p>

              <input
                type="text"
                data-testid="landing-name-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="દા.ત. રમેશ પટેલ"
                maxLength={50}
                className="mt-6 w-full h-14 px-4 rounded-xl border-2 border-slate-200 bg-white text-lg font-semibold text-slate-900 placeholder:text-slate-400 focus:border-[#13294B] focus:outline-none transition-colors"
                autoFocus
              />

              <button
                type="submit"
                disabled={loading}
                data-testid="landing-submit-btn"
                className="btn-primary w-full mt-4"
              >
                {loading ? "લોડ થઈ રહ્યું છે..." : (
                  <>
                    ડેશબોર્ડ પર જાઓ
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              <p className="mt-4 text-xs text-slate-500 text-center">
                કોઈ સાઈન-અપ, કોઈ ઇમેલ — ફક્ત નામથી પ્રેક્ટિસ કરો.
              </p>
            </form>
          </motion.div>
        </div>

        {/* Feature strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4"
        >
          {[
            { k: "7", v: "વિષયો" },
            { k: "70+", v: "પ્રશ્નો" },
            { k: "120", v: "મિનિટ મોક" },
            { k: "+1 / −0.33", v: "GPSC સ્કોરિંગ" },
          ].map((s, i) => (
            <div key={i} className="card-surface p-4 text-center">
              <div className="text-2xl sm:text-3xl font-bold text-[#13294B] font-mono-num">{s.k}</div>
              <div className="text-xs sm:text-sm text-slate-600 mt-1">{s.v}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </main>
  );
}
