import React, { useEffect, useRef, useState } from "react";
import { Timer as TimerIcon } from "lucide-react";

function fmt(sec) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return h > 0 
    ? `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
    : `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function Timer({ seconds = 3960, onExpire, urgentBelow = 300, testId = "quiz-timer" }) {
  const [remaining, setRemaining] = useState(seconds);
  const expiredRef = useRef(false);

  useEffect(() => {
    setRemaining(seconds);
    expiredRef.current = false;
  }, [seconds]);

  useEffect(() => {
    if (remaining <= 0) {
      if (!expiredRef.current) {
        expiredRef.current = true;
        onExpire?.();
      }
      return;
    }
    const t = setInterval(() => setRemaining((r) => r - 1), 1000);
    return () => clearInterval(t);
  }, [remaining, onExpire]);

  const urgent = remaining <= urgentBelow;
  return (
    <div
      data-testid={testId}
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg font-mono-num font-bold text-base sm:text-lg border ${
        urgent ? "timer-urgent border-red-300 bg-red-50" : "bg-slate-100 text-slate-700 border-slate-200"
      }`}
    >
      <TimerIcon className="w-4 h-4" />
      <span>{fmt(Math.max(0, remaining))}</span>
    </div>
  );
}
