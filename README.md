# ⚡ SkillSprint — The Adaptive Coding Arena

<div align="center">

![SkillSprint Banner](https://img.shields.io/badge/SkillSprint-Adaptive%20Arena-7C3AED?style=for-the-badge&logo=lightning&logoColor=white)

**An AI-powered, gamified coding challenge platform that adapts to your skill level in real-time.**

[![Next.js](https://img.shields.io/badge/Next.js-16.2-000000?style=flat-square&logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat-square&logo=python)](https://www.python.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.x-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)

[🎮 Live Demo](#) · [📖 Documentation](#api-documentation) · [🐛 Report Bug](../../issues) · [✨ Request Feature](../../issues)

</div>

---

## 🎯 Overview

**SkillSprint** is a next-generation coding practice platform that combines:

- 🤖 **AI-Powered Evaluation** — Get instant, detailed feedback on your code quality, efficiency, and style
- 🎮 **Gamification** — Level up, earn XP, unlock achievements, and climb the leaderboard
- 📊 **Adaptive Learning** — AI analyzes your weaknesses and generates personalized challenges
- ⚔️ **Boss Fights** — Epic coding challenges that test your limits
- 📈 **Skill Radar** — Visual tracking of your progress across 6 skill dimensions

---

## ✨ Features

### 🏟️ The Arena
- **Monaco Editor** — VS Code-quality code editor with syntax highlighting
- **Multi-language Support** — Python, JavaScript, C++, Java
- **Real-time Execution** — Instant code testing with test case validation
- **AI Feedback** — Comprehensive evaluation with suggestions for improvement

### 📊 Dashboard
- **Glassmorphism UI** — Modern, futuristic dark theme design
- **Skill Radar Chart** — Track progress across Algorithm, Data Structures, Efficiency, Edge Cases, Readability, and Problem Solving
- **XP Progress Bar** — Animated level progression
- **Recent Submissions** — Quick access to your coding history

### 🏆 Leaderboard
- **Global Rankings** — Compete with coders worldwide
- **Top 3 Podium** — Animated highlighting for elite performers
- **Streak Tracking** — Maintain your daily solve streak

### 👤 Profile
- **Achievement Badges** — Unlock rewards for milestones
- **Submission History** — Complete record of all your attempts
- **Statistics Dashboard** — Accuracy rate, favorite language, best streak

### ⚔️ Boss Fights
- **Epic Challenges** — Special difficulty problems with enhanced rewards
- **Dramatic Animations** — Immersive boss encounter UI
- **500 XP Rewards** — High-risk, high-reward challenges

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **Next.js 16** | React framework with App Router |
| **TypeScript** | Type-safe development |
| **Tailwind CSS 4** | Utility-first styling |
| **Framer Motion** | Smooth animations |
| **Monaco Editor** | VS Code-quality code editing |
| **Recharts** | Skill radar visualization |
| **Lucide React** | Beautiful iconography |

### Backend
| Technology | Purpose |
|------------|---------|
| **FastAPI** | High-performance Python API |
| **Uvicorn** | ASGI server |
| **SQLAlchemy** | Async ORM |
| **PostgreSQL** | Primary database |
| **Pydantic** | Data validation |

### AI/LLM Layer
| Technology | Purpose |
|------------|---------|
| **Groq API** | Primary LLM (Llama 3.3 70B) — Ultra-fast inference |
| **Google Gemini** | Fallback LLM — Excellent reasoning |

### Code Execution
| Technology | Purpose |
|------------|---------|
| **Piston API** | Sandboxed code execution (60+ languages) |

---

## 📁 Project Structure

```
Codezetsu/
├── frontend/                 # Next.js Frontend Application
│   ├── src/
│   │   ├── app/             # App Router pages
│   │   │   ├── arena/       # Code editor & problem solving
│   │   │   ├── dashboard/   # User dashboard & stats
│   │   │   ├── leaderboard/ # Global rankings
│   │   │   └── profile/     # User profile & achievements
│   │   ├── components/      # Reusable UI components
│   │   │   ├── Sidebar.tsx
│   │   │   ├── CodeEditor.tsx
│   │   │   ├── ProblemPanel.tsx
│   │   │   ├── SkillRadar.tsx
│   │   │   ├── StatsCard.tsx
│   │   │   ├── XPBar.tsx
│   │   │   ├── LeaderboardTable.tsx
│   │   │   ├── AchievementBadge.tsx
│   │   │   ├── BossFight.tsx
│   │   │   └── ...
│   │   └── lib/             # Utilities & API client
│   │       ├── api.ts       # Backend API integration
│   │       └── mockData.ts  # Demo/fallback data
│   └── public/              # Static assets
│
├── backend/                  # FastAPI Backend Application
│   ├── main.py              # Application entry point
│   ├── config.py            # Configuration & settings
│   ├── middleware.py        # Rate limiting & security
│   ├── routers/             # API route handlers
│   │   ├── problems.py      # Problem CRUD endpoints
│   │   ├── submissions.py   # Code submission handling
│   │   ├── users.py         # User management
│   │   ├── challenges.py    # Adaptive challenge generation
│   │   ├── skills.py        # Skill analysis endpoints
│   │   └── leaderboard.py   # Ranking system
│   ├── services/            # Business logic layer
│   │   ├── ai_client.py     # Groq/Gemini integration
│   │   ├── ai_evaluator.py  # Code evaluation logic
│   │   ├── challenge_generator.py
│   │   ├── code_executor.py # Piston API integration
│   │   ├── skill_analyzer.py
│   │   └── gamification.py  # XP & leveling system
│   └── models/              # Database models
│
├── data/                     # Problem datasets & seeding
│   ├── codeforces_problems.json
│   ├── fetch_codeforces.py
│   └── seed_db.py
│
└── Gamification Reports/     # Design documentation
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ 
- **Python** 3.11+
- **npm** or **pnpm**

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/codezetsu.git
cd codezetsu
```

### 2. Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend will be available at **http://localhost:3000**

### 3. Setup Backend

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env with your API keys

# Run the server
uvicorn main:app --reload
```

Backend will be available at **http://localhost:8000**

### 4. Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Environment
ENVIRONMENT=development

# Database (Optional - uses mock data if not set)
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/skillsprint

# AI API Keys (Get free at console.groq.com and aistudio.google.com)
GROQ_API_KEY=your_groq_api_key
GEMINI_API_KEY=your_gemini_api_key

# Code Execution
PISTON_API_URL=https://emkc.org/api/v2/piston
```

---

## 📡 API Documentation

Once the backend is running, access interactive API docs at:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Key Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/problems` | GET | List all problems |
| `/api/problems/{id}` | GET | Get problem details |
| `/api/submissions` | POST | Submit code solution |
| `/api/submissions/history` | GET | Get submission history |
| `/api/challenge/next` | POST | Get adaptive next challenge |
| `/api/skills/radar` | GET | Get skill radar data |
| `/api/users/me` | GET | Get current user profile |
| `/api/users/stats` | GET | Get user statistics |
| `/api/leaderboard` | GET | Get global leaderboard |

---

## 🎨 Design System

### Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| **Background** | `#0B0F1A` → `#12182B` | Gradient dark theme |
| **Neon Blue** | `#4F9CF9` | Primary accent |
| **Purple** | `#7C3AED` | Secondary accent |
| **Pink** | `#EC4899` | Tertiary/Boss fights |
| **Cyan** | `#22D3EE` | Success states |
| **Success** | `#4ADE80` | Accepted submissions |
| **Error** | `#FF6B6B` | Wrong answers |
| **Warning** | `#FBBF24` | Caution states |

### UI Components

- **Glassmorphism** — Blur + transparency panels
- **Neon Glow** — Accent borders and shadows
- **Smooth Animations** — Framer Motion transitions
- **Responsive** — Mobile-first with bottom navigation

---

## 🎮 Gamification System

### XP Rewards

| Action | XP Earned |
|--------|-----------|
| Easy Problem Solved | 50 XP |
| Medium Problem Solved | 100 XP |
| Hard Problem Solved | 200 XP |
| Boss Fight Victory | 500 XP |
| Perfect Score (10/10) | +50% Bonus |
| Streak Bonus (7+ days) | +25% Bonus |

### Level Progression

| Level | Title | XP Required |
|-------|-------|-------------|
| 1-9 | Novice Coder | 0 - 2,000 |
| 10-19 | Code Apprentice | 2,000 - 5,000 |
| 20-29 | Bug Squasher | 5,000 - 10,000 |
| 30-39 | Algorithm Adept | 10,000 - 20,000 |
| 40-49 | Data Warrior | 20,000 - 60,000 |
| 50-59 | Efficiency Expert | 60,000 - 85,000 |
| 60-79 | Pattern Master | 85,000 - 120,000 |
| 80-99 | Algorithm Legend | 120,000 - 200,000 |
| 100 | Arena Champion | 200,000+ |

### Achievements

- 🏆 **First Blood** — Solve your first problem
- 🔥 **On Fire** — 3-day solve streak
- ⚡ **Lightning Fast** — Solve within 5 minutes
- 🧠 **Big Brain** — Get 10/10 AI evaluation
- 👑 **Boss Slayer** — Defeat a Boss Fight
- 💎 **Diamond Coder** — Reach Level 10

---

## 🧪 Running Tests

```bash
# Frontend tests
cd frontend
npm run test

# Backend tests
cd backend
pytest
```

---

## 📦 Building for Production

### Frontend

```bash
cd frontend
npm run build
npm run start
```

### Backend

```bash
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Monaco Editor](https://microsoft.github.io/monaco-editor/) — VS Code's editor
- [Piston API](https://github.com/engineer-man/piston) — Code execution
- [Groq](https://groq.com/) — Ultra-fast LLM inference
- [Codeforces](https://codeforces.com/) — Problem dataset
- [Lucide Icons](https://lucide.dev/) — Beautiful icons

---

<div align="center">

**Built with ❤️ by the Codezetsu Team**

⚡ *Enter the Arena. Level Up. Dominate.* ⚡

</div>
