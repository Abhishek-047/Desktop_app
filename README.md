# Athena Proctoring Desktop App

An Electron + React desktop application for conducting proctored online exams.

## Project Structure

```
Athena-Clone-new/
├── app/               # Electron main process
│   ├── app.js         # Main process entry point
│   └── preload.js     # Preload bridge between main and renderer
├── backend/           # Express API backend (bundled in the app)
│   ├── data/
│   │   ├── questions.json   # MCQ questions
│   │   └── sessions.json    # Exam sessions
│   ├── server.js      # Express API server (port 3000)
│   └── package.json
├── src/               # React frontend (renderer)
│   ├── App.jsx        # Setup/permissions screen
│   ├── main_exam.jsx  # Exam questions UI
│   └── App.css        # Styles
├── public/
├── index.html
├── vite.config.js
└── package.json
```

## Features

- 📷 **Camera proctoring** — requests camera access, captures snapshots every 5s
- 🖥️ **Screen capture** — captures full screen every 5s during the exam
- ⛔ **Copy-paste prevention** — blocks Ctrl+C / Ctrl+V during exam
- 🔒 **Fullscreen enforcement** — requires fullscreen before starting
- 📝 **MCQ exam flow** — fetches questions, records answers, scores and submits
- ⏭️ **Skip question** — students can skip and move to the next question
- ✅ **Rules dialog** — native checkbox dialog for exam rules confirmation

## Backend API (runs at localhost:3000)

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/exam/start` | Start a new exam session |
| GET | `/exam/mcq` | Get all questions (no correct answers) |
| POST | `/exam/answer` | Submit an answer for a question |
| POST | `/exam/submit` | Submit exam and get final score |
| GET | `/exam/session/:id` | Get session progress |

## Development

```bash
# Terminal 1 — Start the React dev server
npm run dev

# Terminal 2 — Start Electron
npm run electron
```

## Build DMG

```bash
npm run build   # Builds React into dist/
npm run dist    # Packages into release/Athena-*.dmg
```

> The DMG is pre-built and available in the `release/` folder of this repo.

## Tech Stack

- **Electron** — Desktop shell
- **React + Vite** — UI framework
- **Express** — Embedded backend API
- **electron-builder** — DMG packaging
