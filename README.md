# Athena Proctoring Desktop App

An Electron + React desktop application for conducting proctored online exams with automated camera and screen monitoring, full-screen lockdown, anti-cheat shortcut prevention, and an integrated Express assessment backend.

---

## 📦 Download Production Installer (.DMG)

The pre-built, production macOS installer is located directly inside the repository at:

```text
release/Athena-0.0.0-arm64.dmg
```

### Installation Steps:
1. Double-click `release/Athena-0.0.0-arm64.dmg`.
2. Drag **Athena** into your `/Applications` folder.
3. Open **Athena** from Launchpad or Applications. (The embedded Express backend will auto-launch internally on port `3000` with zero configuration needed).

> **Note on DMG Size:**
> Any standalone Electron macOS app packages the full Chromium rendering engine and Node.js framework inside its binary (`Electron Framework.framework` is **285 MB** uncompressed). Even with maximum LZMA disk compression, an Electron `.dmg` physically measures **~120 MB**. To make cloning fast and avoid repository limits, this DMG is tracked and served through **Git LFS**.
>
> *(If an ultra-lightweight `<50MB` binary is strictly required in the future, the desktop shell can be ported to **Tauri / Wry**, which uses the macOS native WebKit library instead of bundling Chromium).*

---

## 📁 Project Structure

```
Athena-Clone-new/
├── app/               # Electron main process
│   ├── app.js         # Main process entry point & proctoring intervals
│   └── preload.js     # Secure context bridge between main and renderer
├── backend/           # Express API backend (bundled inside the app)
│   ├── data/
│   │   ├── questions.json   # MCQ questions database
│   │   └── sessions.json    # Candidate exam sessions and results
│   ├── server.js      # Express API server (port 3000)
│   └── package.json
├── src/               # React frontend (renderer)
│   ├── App.jsx        # Candidate setup & 3-step readiness checklist
│   ├── main_exam.jsx  # Live proctored examination & analytics screen
│   └── App.css        # Styles
├── release/           # Production DMG builds
│   └── Athena-0.0.0-arm64.dmg
├── public/
├── index.html
├── vite.config.js
└── package.json
```

---

## ✨ Features

- 👤 **Candidate Profile**: Student Name and Roll / Candidate ID inputs before starting.
- 📷 **Camera Proctoring**: Verifies webcam connectivity and captures snapshots every 5 seconds.
- 🖥️ **Screen Integrity Monitoring**: Captures periodic full-screen captures (`desktopCapturer`) every 5 seconds.
- 🔒 **Fullscreen Enforcement**: Enforces fullscreen before the assessment can begin.
- ⛔ **Anti-Cheat Shortcut Prevention**: Traps and disables `Cmd+C` / `Cmd+V` / `Ctrl+C` / `Ctrl+V` with a security notice dialog.
- 📝 **MCQ Exam Flow**: Fetches questions, saves answers, records attempt statistics, and calculates final score.
- ⏭️ **Question Skip & Navigation Matrix**: Allows skipping questions and visually tracks answered vs skipped items.
- 📈 **Performance Analytics Dashboard**: Displays total questions, attempts, correct, incorrect, and percentage accuracy with grade status.
- ✅ **Native Rules Modal**: Native modal dialog confirming the 5 core examination integrity rules.
- 🚀 **Zero-Config Backend**: Embedded Express server auto-starts upon opening the `.dmg`.

---

## 📡 Backend API Reference (`http://localhost:3000`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Backend health check |
| `POST` | `/exam/start` | Start candidate session and return `sessionId` |
| `GET` | `/exam/mcq` | Get all questions (sanitized without correct answers) |
| `GET` | `/exam/mcq/:id` | Get single question details |
| `POST` | `/exam/answer` | Submit candidate answer for a specific question |
| `GET` | `/exam/session/:sessionId` | Check candidate session progress |
| `POST` | `/exam/submit` | Mark session submitted and compute final score |

---

## 💻 Local Development

### Prerequisites
- Node.js (v18+)
- npm

### Running the App:
```bash
# 1. Install dependencies
npm install

# 2. Terminal 1 — Start the React dev server
npm run dev

# 3. Terminal 2 — Start Electron
npm run electron
```

---

## 🔨 Building the DMG Installer

```bash
# 1. Build the React web assets
npm run build

# 2. Package into a macOS DMG installer
npm run dist
```

The output DMG is generated in:
```text
release/Athena-0.0.0-arm64.dmg
```
