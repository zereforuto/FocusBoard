# FocusBoard 🎯

A minimalist, high-performance personal productivity dashboard built with **Next.js (App Router)**, **TypeScript**, and **Tailwind CSS**. Ready to deploy instantly to Vercel with zero environment variables or database configuration needed.

---

## ✨ Features

- **Task Management**:
  - Add, edit, complete, delete, and drag to reorder tasks.
  - Custom priority levels (Low, Medium, High) with distinct visual badges.
  - Optional due dates with specialized formatting and "Due Today" highlight.
  - Confetti burst celebration on task completion.
- **Smart Filtering & Search**:
  - Filter by **All**, **Active**, **Completed**, and **Due Today**.
  - Instant live keyword search matching task titles.
- **Pomodoro Focus Timer**:
  - 25-minute deep focus and 5-minute break cycles.
  - Start, pause, and reset controls with an interactive circular SVG gauge.
  - Synthesized gentle chime (via Web Audio API) with zero external audio assets.
  - Browser notifications when a session completes.
  - Link any task to the timer to automatically count completed Pomodoros per task.
- **Daily Analytics & 7-Day Chart**:
  - Real-time counters: Tasks completed today, focus minutes today, and 7-day cumulative focus time.
  - Responsive 7-day bar chart built with **Recharts**, automatically themed for dark/light modes.
- **Dark / Light Mode**:
  - Seamless toggle with instant persistence in `localStorage`.
  - Respects system appearance preference (`prefers-color-scheme`) by default.
- **Data Portability**:
  - One-click JSON export for full data backups.
  - Import JSON functionality to restore your tasks and focus history anytime.
- **Hydration Safe**:
  - Custom `useLocalStorage` and `useTimer` hooks built to eliminate SSR/prerender hydration mismatches.
- **PWA Friendly**:
  - Includes `manifest.json` and responsive viewport metadata for a native-like experience on mobile and desktop.
  - Responsive sidebar on desktop that seamlessly collapses to an ergonomic bottom tab bar on mobile.

---

## 📁 Folder Structure

```text
FocusBoard/
├── app/
│   ├── globals.css         # Styling, custom theme tokens & scrollbars
│   ├── layout.tsx          # Root layout with metadata, viewport & ThemeProvider
│   └── page.tsx            # Client page with dynamic hydration-safe Dashboard
├── components/
│   ├── DailyStats.tsx      # Metrics summary & Recharts 7-day bar chart
│   ├── Dashboard.tsx       # Main dashboard orchestrator
│   ├── DataBackup.tsx      # Export and import JSON backup controls
│   ├── Navigation.tsx      # Responsive Sidebar (desktop) & Bottom Tab Bar (mobile)
│   ├── PomodoroTimer.tsx   # Pomodoro UI with circular gauge & task selector
│   ├── TaskManager.tsx     # Drag-and-drop tasks, inline editing, filters & search
│   └── ThemeProvider.tsx   # Theme context with system, dark, and light modes
├── hooks/
│   ├── useLocalStorage.ts  # Safe localStorage hook with useSyncExternalStore
│   └── useTimer.ts         # Pomodoro state machine with notification & audio triggers
├── lib/
│   ├── sound.ts            # Gentle chime generator via Web Audio API
│   ├── types.ts            # Core TypeScript data contracts
│   └── utils.ts            # Date formatting, seed data, and JSON download utilities
├── public/
│   ├── favicon.ico
│   └── manifest.json       # PWA manifest
├── package.json
└── README.md
```

---

## 🚀 Running Locally

### 1. Prerequisites
Ensure you have **Node.js 18+** installed.

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production & Lint Check
```bash
# Verify linting
npm run lint

# Compile production bundle
npm run build

# Preview production build locally
npm run start
```

---

## 🌐 Deploy to Vercel

FocusBoard requires **zero environment variables** or backend database configuration.

### Option 1: Deploy with Vercel CLI
```bash
npm install -g vercel
vercel
```
Follow the interactive prompts to link and deploy your project in seconds.

### Option 2: Deploy via GitHub / GitLab / Bitbucket
1. Push your repository to GitHub:
   ```bash
   git init
   git add .
   git commit -m "feat: initial FocusBoard release"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```
2. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import your `FocusBoard` repository.
4. Leave all build settings at their defaults:
   - **Framework Preset**: `Next.js`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
5. Click **Deploy**. Your dashboard will be live within a minute!
