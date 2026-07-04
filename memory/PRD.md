# GPSC Elite Mock Master — PRD

## Problem Statement
Build a single-page React web app for GPSC (Gujarat Public Service Commission) Class 1 & 2 Mock Exams in Gujarati (Unicode). Mobile-first, WhatsApp-shareable, name-based access, subject-wise + full-mock modes with instant feedback, timer, net-scoring (+1/−0.33), Performance Radar and GPSC Selection Probability.

## User Choices
- Data: MongoDB backend (persist questions + results + leaderboard)
- Auth: Simple name-based entry (no login)
- Modes: Both — subject-wise practice + full mock (120 min)
- Sample questions: Provided directly (70 Gujarati Qs, 10 per subject)
- Theme: Modern Indigo (#13294B) + Saffron (#FF9933) — GPSC official feel

## Architecture
- **Frontend**: React (CRA + craco) · React Router v7 · Framer Motion · Recharts · sonner · lucide-react · Tailwind + Noto Sans/Serif Gujarati fonts.
- **Backend**: FastAPI + Motor (Async Mongo). Seeds 70 questions on first startup.
- **DB collections**: `questions`, `users`, `results`.
- **Session**: browser `localStorage` (key `gpsc_user`). No JWT.

## Core Requirements (Static)
- Dashboard with 7 subjects: History, Polity, Geography, Economy, Sci-Tech, Mental Ability, 2026 Current Affairs (10 questions each).
- Quiz Engine: 4 radio options, instant color feedback + Gujarati explanation.
- Timer: 120 min for mock, 30 min for practice; urgent pulsing under 5 min.
- Scoring: +1 correct, −0.33 wrong, 0 skipped. Live Net Score top-right.
- Result: Net Score, subject-wise breakdown, Performance Radar (Recharts), GPSC Selection Probability tiers (Elite/Promising/Borderline/Threshold).
- Leaderboard: sorted by net_score desc, filter by mode.

## Implemented (2026-07-04)
- ✅ 70 Gujarati questions seeded (10 × 7 subjects) with detailed Gujarati explanations
- ✅ REST API: /api/subjects, /api/users, /api/questions/practice/{subject}, /api/questions/mock, /api/results, /api/results/user/{id}, /api/leaderboard
- ✅ Landing page (name entry) + Dashboard (subject grid + mock CTA)
- ✅ Quiz page: timer, net score, instant feedback, explanation, skip, exit-confirm
- ✅ Result page: hero stats card, probability tier, Performance Radar, retry/leaderboard CTAs
- ✅ Leaderboard with filter chips (all/mock/practice)
- ✅ Mobile-first responsive UI (Noto Gujarati fonts, 48px+ tap targets, Indigo/Saffron palette)
- ✅ Testing subagent: backend 13/13 pass · frontend 100% pass

## Prioritized Backlog
### P0 (next)
- Expand question bank from 70 → 700+ (per user's spec "700+ questions")
- Add subject-wise & topic filters on leaderboard

### P1
- Bookmark / mark-for-review during quiz
- Explanation deep-links (source/reference URLs)
- Share Score to WhatsApp button (deep-link with pre-filled text)
- User results history page (per-user attempt log)

### P2
- Adaptive difficulty (progressively harder questions based on accuracy)
- Weekly/monthly leaderboards
- Streak & study reminders (PWA push)
- Admin panel for adding questions without redeploying
