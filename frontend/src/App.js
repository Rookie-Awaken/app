import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { UserProvider, useUser } from "./context/UserContext";
import Header from "./components/Header";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Quiz from "./pages/Quiz";
import Result from "./pages/Result";
import Leaderboard from "./pages/Leaderboard";

function RequireUser({ children }) {
  const { user, loaded } = useUser();
  if (!loaded) return null;
  if (!user) return <Navigate to="/" replace />;
  return children;
}

function RedirectIfUser({ children }) {
  const { user, loaded } = useUser();
  if (!loaded) return null;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
}

function Shell() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<RedirectIfUser><Landing /></RedirectIfUser>} />
        <Route path="/dashboard" element={<RequireUser><Dashboard /></RequireUser>} />
        <Route path="/quiz/practice/:subject" element={<RequireUser><Quiz /></RequireUser>} />
        <Route path="/quiz/mock" element={<RequireUser><Quiz /></RequireUser>} />
        <Route path="/result" element={<RequireUser><Result /></RequireUser>} />
        <Route path="/leaderboard" element={<RequireUser><Leaderboard /></RequireUser>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <UserProvider>
      <Shell />
      <Toaster position="top-center" richColors closeButton />
    </UserProvider>
  );
}
