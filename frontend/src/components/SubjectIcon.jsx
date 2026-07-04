import React from "react";
import { Landmark, Scale, Globe2, TrendingUp, FlaskConical, Brain, Newspaper, HelpCircle } from "lucide-react";

const MAP = {
  landmark: Landmark,
  scale: Scale,
  globe: Globe2,
  "trending-up": TrendingUp,
  "flask-conical": FlaskConical,
  brain: Brain,
  newspaper: Newspaper,
};

export default function SubjectIcon({ name, className = "w-6 h-6" }) {
  const Cmp = MAP[name] || HelpCircle;
  return <Cmp className={className} strokeWidth={2} />;
}
