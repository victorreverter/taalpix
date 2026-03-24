# TaalPix 🇳🇱🇪🇸

TaalPix is a modern language learning web application designed for Spanish speakers learning Dutch. It uses the **Spaced Repetition (SM-2)** algorithm and **Pixel Art** aesthetics to provide an engaging and efficient learning experience.

## ✨ Features

- **Auth System:** Secure Email/Password login powered by Supabase.
- **Dynamic Exercises:**
  - **Shadowing:** Listen and repeat to practice pronunciation.
  - **Multiple Choice:** Select the correct translation from randomized distractors.
  - **Writing:** Type the Dutch translation for Spanish cues.
- **Smart Queue:** Uses the SuperMemo-2 algorithm to show you words at the most efficient intervals.
- **Audio Support:** Uses the Web Speech API for high-quality Dutch pronunciation.
- **Progress Tracking:** Automatic logging of your study sessions to your personal dashboard.

## 🚀 Getting Started

### 1. Requirements

- [Node.js](https://nodejs.org/) (Version 18+)
- [Supabase](https://supabase.com/) account and project.

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

Create a `.env.local` file in the root directory (the app won't work without this):

```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

See `.env.example` for reference.

### 4. Database Initialization

Execute the SQL script found in `src/lib/database_schema.sql` within your Supabase SQL Editor to create the necessary tables and RLS policies.

### 5. Running Locally

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

## 🛠️ Built With

- **Framework:** React + Vite
- **Database / Auth:** Supabase
- **Spaced Repetition:** Custom SM-2 Implementation
- **Audio:** Web Speech API

## 🎨 Pixel Art Assets

(Placeholder for pixel art information)
