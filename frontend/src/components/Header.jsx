import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { GraduationCap, Trophy, LogOut } from "lucide-react";
import { useUser } from "../context/UserContext";

export default function Header() {
  const { user, logout } = useUser();
  const nav = useNavigate();
  const loc = useLocation();
  const isQuiz = loc.pathname.startsWith("/quiz");

  return (
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-xl border-b border-slate-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link
          to={user ? "/dashboard" : "/"}
          data-testid="header-logo"
          className="flex items-center gap-2.5 group"
        >
          <span className="w-9 h-9 rounded-xl bg-[#13294B] text-white grid place-items-center shadow-md group-hover:scale-105 transition-transform">
            <GraduationCap className="w-5 h-5" />
          </span>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-bold text-slate-900 tracking-tight">GPSC Elite</span>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest">Mock Master</span>
          </div>
        </Link>

        {!isQuiz && user && (
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/leaderboard"
              data-testid="header-leaderboard-link"
              className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-slate-700 hover:text-[#13294B] px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <Trophy className="w-4 h-4 text-[#FF9933]" />
              લીડરબોર્ડ
            </Link>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200">
              <span className="w-6 h-6 rounded-full bg-[#FF9933] text-white grid place-items-center text-xs font-bold">
                {user.name?.charAt(0)?.toUpperCase()}
              </span>
              <span data-testid="header-user-name" className="text-sm font-semibold text-slate-800 max-w-[120px] truncate">
                {user.name}
              </span>
            </div>
            <button
              data-testid="header-logout-btn"
              onClick={() => { logout(); nav("/"); }}
              className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-[#DC2626] transition-colors"
              aria-label="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
