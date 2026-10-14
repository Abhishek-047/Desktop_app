# Athena Proctoring Desktop App

An Electron + React desktop application for conducting proctored online exams with automated camera and screen monitoring, full-screen lockdown, anti-cheat shortcut prevention, and an integrated Express assessment backend.

---

## 📥 Direct Download (.DMG Installer)

Click the link or button below to download the compiled macOS installer immediately:

[![Download Athena DMG](https://img.shields.io/badge/⬇️_Download_Athena-macOS_(Apple_Silicon_arm64)-blue?style=for-the-badge&logo=apple)](https://github.com/Abhishek-047/Desktop_app/raw/main/release/Athena-0.0.0-arm64.dmg)

👉 **[Click here to download `Athena-0.0.0-arm64.dmg` directly](https://github.com/Abhishek-047/Desktop_app/raw/main/release/Athena-0.0.0-arm64.dmg)**

*(File located in repository at [`release/Athena-0.0.0-arm64.dmg`](release/Athena-0.0.0-arm64.dmg))*

---

### 🚀 How to Install & Run:
1. Click the download link above to download `Athena-0.0.0-arm64.dmg`.
2. Double-click the downloaded `.dmg` file to mount it.
3. Drag **Athena** into your **Applications** folder.
4. Launch **Athena** from Launchpad or Applications.
   - *Everything is fully integrated:* The assessment backend auto-starts internally on port `3000` with zero configuration needed.

> **💡 Note on Package Size:**
> Like all standalone Electron desktop apps (e.g. VS Code, Slack, Notion), the `.dmg` bundles the local Chromium execution runtime and Node.js core so that the app runs independently offline without requiring any dependencies or browsers pre-installed.

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
