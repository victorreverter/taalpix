# TaalPix 🇳🇱

A modern Dutch language learning PWA with pixel art visual identity.

## Features

- **Scene-based learning** — Real-life situations in the Netherlands
- **6 exercise types** — Visual recognition, matching, listening, sentence building, translation, mini dialogues
- **SM-2 spaced repetition** — Optimal review scheduling
- **Dual dialogue modes** — Free text and multiple choice
- **Review queue** — Mistakes automatically scheduled for review
- **Progress tracking** — Streak counter, word mastery (mastered/pending/review)
- **Level-based progression** — A1 → A2 → B1 → B2
- **Dark/Light mode** — Full theme support
- **PWA ready** — Works offline, mobile-friendly

## Tech Stack

- React 19 + Vite
- Tailwind CSS
- Supabase (Auth + Database)
- Web Speech API (TTS)
- Vite PWA Plugin

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a new Supabase project at https://supabase.com
2. Enable Email/Password auth in Authentication → Providers
3. Run the SQL schema in `src/lib/database_schema.sql` in the Supabase SQL Editor
4. Run the seed data in `src/lib/seed_data.sql`

### 3. Configure Environment

Create `.env.local`:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Run Development Server

```bash
npm run dev
```

Access at `http://localhost:5173`

## Project Structure

```
src/
├── components/
│   ├── common/          # Reusable UI components
│   │   ├── PixelButton.jsx
│   │   ├── PixelCard.jsx
│   │   ├── Header.jsx
│   │   ├── ThemeToggle.jsx
│   │   └── ReviewBadge.jsx
│   ├── map/             # Level and scene selection
│   │   ├── LevelCard.jsx
│   │   └── SceneCard.jsx
│   └── exercises/       # 6 exercise types
│       ├── VisualRecognition.jsx
│       ├── Matching.jsx
│       ├── Listening.jsx
│       ├── BuildSentence.jsx
│       ├── Translate.jsx
│       └── MiniDialogue.jsx
├── contexts/            # React contexts
│   ├── AuthContext.jsx
│   ├── ThemeContext.jsx
│   └── ProgressContext.jsx
├── pages/               # Route pages
│   ├── Login.jsx
│   ├── SignUp.jsx
│   ├── Home.jsx
│   ├── Level.jsx
│   └── Scene.jsx
├── lib/                 # Utilities
│   ├── supabase.js
│   ├── sm2.js           # SM-2 algorithm
│   ├── validation.js    # Free text validation
│   ├── audio.js         # TTS wrapper
│   ├── database_schema.sql
│   └── seed_data.sql
└── index.css            # Global styles + theme vars
```

## Content Plan (MVP)

### Level A1 (Active)
1. **Het Kantoor** — Office basics (7 words, freq 1-50)
2. **De Jumbo** — Grocery shopping (7 words, freq 50-150)
3. **Het Park** — Outdoor activities (7 words, freq 150-300)

### Level A1 (Coming Soon)
4. De Huisarts
5. Het Café
6. De Fietswinkel

### Level B1 (Future)
7. Het Station
8. De Gemeente

## Design System

### Colors (CSS Variables)
- `--tp-bg`, `--tp-surface`, `--tp-surface2`
- `--tp-border`, `--tp-text`, `--tp-text2`, `--tp-text3`
- `--tp-primary`, `--tp-success`, `--tp-warning`, `--tp-error`
- Full light/dark mode support

### Typography
- **Pixel**: Press Start 2P (headers, UI labels)
- **Body**: Inter (content, exercises)

### Visual Rules
- Zero border-radius (hard pixel borders)
- 2px solid borders throughout
- Pixel art placeholders (CSS boxes with labels)

## SM-2 Algorithm

Mastery thresholds:
- 5 consecutive correct repetitions
- 21+ day interval
- Periodic review every 90 days for mastered words

Exercise modifiers (affects interval calculation):
- Visual: 0.9x
- Matching: 0.95x
- Listening: 1.0x
- Build: 1.05x
- Translate: 1.1x
- Dialogue: 1.15x

## Free Text Validation

- Case-insensitive exact match = perfect (counts toward mastery)
- 1 typo per word allowed = accepted but doesn't count toward mastery
- Articles (de/het) are mandatory — never ignored

## PWA Configuration

- Auto-update service worker
- Offline support for static assets
- Standalone display mode
- Custom manifest with theme color

## Scripts

```bash
npm run dev      # Development server
npm run build    # Production build
npm run preview  # Preview production build
npm run lint     # ESLint
```

## License

MIT
