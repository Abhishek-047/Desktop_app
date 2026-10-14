import { app, BrowserWindow, ipcMain, dialog, desktopCapturer } from "electron";
import path from "path";
import fs from "fs";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { startServer } = require("../backend/server.js");

let electronWindow = null;
let startTimestamp = null;
let timerInterval = null;
let cameraInterval = null;
let screenInterval = null;

// Mutable path variable to track chosen snapshot directory
let storageDirectory = path.join(app.getPath('userData'), "user-camera-snap");

// Create default path if it doesn't exist yet
if (!fs.existsSync(storageDirectory)) {
    fs.mkdirSync(storageDirectory, { recursive: true });
}

function createWindow() {
    electronWindow = new BrowserWindow({
        height: 1000,
        width: 1000,
        webPreferences: {
            devTools: true,
            preload: path.join(import.meta.dirname, 'preload.js')
        }
    });

    if (app.isPackaged) {
        electronWindow.loadFile(path.join(import.meta.dirname, '../dist/index.html'));
    } else {
        electronWindow.loadURL('http://localhost:5173');
    }

    electronWindow.webContents.on('before-input-event', (event, input) => {
        if (input.type !== 'keyDown') return;
        const isCtrlorCmd = input.control || input.meta;
        const isCkey = input.key.toLowerCase() === 'c' || input.key.toLowerCase() === 'v';

        if (isCtrlorCmd && isCkey) {
            event.preventDefault();
            dialog.showMessageBox(electronWindow, {
                type: "warning",
                title: "Security Notice",
                message: "Copy and paste shortcuts are disabled during proctored examinations.",
                buttons: ["Understood"]
            });
        }
    });

    electronWindow.on('closed', () => {
        electronWindow = null;
        if (timerInterval) clearInterval(timerInterval);
        if (cameraInterval) clearInterval(cameraInterval);
        if (screenInterval) clearInterval(screenInterval);
    });
}

async function captureScreen() {
    try {
        const sources = await desktopCapturer.getSources({ 
            types: ['screen'],
            thumbnailSize: {
                width: 1920,
                height: 1080
            }
        });
        if (!sources.length) return;
        const primaryscreen = sources[0];
        const pingBuffer = primaryscreen.thumbnail.toPNG();
        const filePath = path.join(storageDirectory, `screen-${Date.now()}.png`);
        fs.writeFileSync(filePath, pingBuffer);
    } catch (e) {
        console.error("Screen capture error:", e.message);
    }
}

ipcMain.handle('start-timer', (_event) => {
    startTimestamp = Date.now();

    if (timerInterval) clearInterval(timerInterval);
    if (cameraInterval) clearInterval(cameraInterval);
    if (screenInterval) clearInterval(screenInterval);

    // Send Timer Tick every 1s
    timerInterval = setInterval(() => {
        if (electronWindow && !electronWindow.isDestroyed()) {
            electronWindow.webContents.send('timer', Math.floor((Date.now() - startTimestamp) / 1000));
        }
    }, 1000);

    // Capture user's camera snap every 5s
    cameraInterval = setInterval(() => {
        if (electronWindow && !electronWindow.isDestroyed()) {
            electronWindow.webContents.send('camera-shot');
        }
    }, 5000);

    // Capture user's screen every 5s
    screenInterval = setInterval(() => {
        captureScreen();
    }, 5000);

    return true;
});


ipcMain.handle('store-camera-snap-image-on-disk', (_event, data) => {
    // TASK: Stores photos into your dynamically selected directory path
    const filePath = path.join(storageDirectory, `${Date.now()}.jpg`);
    fs.writeFileSync(filePath, Buffer.from(data));
})


// TASK: Use dialog api to show checkbox and with more button and perform call fn according to the checkbox checked or which button is clicked.
ipcMain.handle("show-rules", () => {
    return new Promise((resolve) => {
        // 1. Spawn a custom native dialog window frame
        let rulesDialog = new BrowserWindow({
            width: 420,
            height: 440,
            parent: electronWindow, // Sticks it explicitly to your main exam window
            modal: true,            // Freezes the background exam until they finish
            resizable: false,
            frame: false,           // Strips browser window bars so it looks like a clean OS alert
            transparent: true,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false // Allows fast event processing for this popup
            }
        });

        // 2. The code mapping actual checkboxes directly near the numbers
        const dialogContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {
                    background-color: #2b2b2b;
                    color: #ffffff;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
                    padding: 24px;
                    margin: 0;
                    border-radius: 20px;
                    border: 1px solid #444;
                    box-shadow: 0 12px 40px rgba(0,0,0,0.6);
                    user-select: none;
                }
                h3 { margin: 0 0 4px 0; font-size: 18px; font-weight: 600; }
                .subtitle { color: #8a8a8e; font-size: 13px; margin-bottom: 20px; }
                
                .rules-list { display: flex; flex-direction: column; gap: 14px; }
                
                /* Layout wrapper putting the checkbox right next to the rule */
                .rule-row {
                    display: flex;
                    align-items: flex-start;
                    font-size: 14px;
                    line-height: 1.4;
                }
                .rule-row input[type="checkbox"] {
                    margin-right: 12px;
                    margin-top: 2px;
                    width: 16px;
                    height: 16px;
                    cursor: pointer;
                }
                
                .button-group {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    margin-top: 28px;
                }
                button {
                    width: 100%;
                    padding: 11px;
                    border-radius: 10px;
                    border: none;
                    font-size: 14px;
                    font-weight: 500;
                    cursor: pointer;
                }
                .btn-accept { background-color: #007aff; color: white; }
                .btn-cancel { background-color: #3a3a3c; color: #ff453a; }
            </style>
        </head>
        <body>
            <h3>Exam Rules Confirmation</h3>
            <div class="subtitle">Please check each rule box individually to confirm:</div>
            
            <div class="rules-list">
                <div class="rule-row">
                    <input type="checkbox" id="check1">
                    <label for="check1">1. Stay on the exam screen.</label>
                </div>
                <div class="rule-row">
                    <input type="checkbox" id="check2">
                    <label for="check2">2. Camera must remain enabled.</label>
                </div>
                <div class="rule-row">
                    <input type="checkbox" id="check3">
                    <label for="check3">3. Do not leave the exam.</label>
                </div>
                <div class="rule-row">
                    <input type="checkbox" id="check4">
                    <label for="check4">4. Do not use external assistance.</label>
                </div>
                <div class="rule-row">
                    <input type="checkbox" id="check5">
                    <label for="check5">5. Click Exit Exam when finished.</label>
                </div>
            </div>

            <div class="button-group">
                <button class="btn-accept" id="submitAccept">Accept Rules</button>
                <button class="btn-cancel" id="submitCancel">Cancel / Decline</button>
            </div>

            <script>
                const { ipcRenderer } = require('electron');

                document.getElementById('submitAccept').addEventListener('click', () => {
                    // Read the checkboxes near the numbers one by one
                    const checkState = {
                        button: "ACCEPT",
                        checkboxes: {
                            rule1: document.getElementById('check1').checked,
                            rule2: document.getElementById('check2').checked,
                            rule3: document.getElementById('check3').checked,
                            rule4: document.getElementById('check4').checked,
                            rule5: document.getElementById('check5').checked
                        }
                    };
                    ipcRenderer.send('rules-popup-response', checkState);
                });

                document.getElementById('submitCancel').addEventListener('click', () => {
                    ipcRenderer.send('rules-popup-response', { button: "CANCEL", checkboxes: {} });
                });
            </script>
        </body>
        </html>
        `;

        // Load the view string data directly into your clean window frame
        rulesDialog.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(dialogContent)}`);

        // 3. Catch the selection payload back into the main terminal logs
        ipcMain.once('rules-popup-response', (_event, data) => {
            console.log("\n====== TERMINAL DIALOG SELECTION LOG ======");
            console.log("Clicked Action Button:", data.button);
            console.log("Checkboxes Clicked Status:", data.checkboxes);
            console.log("===========================================\n");

            if (rulesDialog) {
                rulesDialog.close();
            }
            
            // Sends the checkbox data array back to your React application frame
            resolve(data); 
        });
    });
});

// TASK: Select folder where you want to store the default camera shots captured
ipcMain.handle("select-storage-folder", async () => {
    const result = await dialog.showOpenDialog(electronWindow, {
        title: "Select Snapshot Directory",
        properties: ["openDirectory", "createDirectory"]
    });

    if (!result.canceled && result.filePaths.length > 0) {
        storageDirectory = result.filePaths[0]; // Update target storage location
        return storageDirectory;
    }
    return null;
});

// TASK: Select file using dialog box and gets its path
ipcMain.handle("select-file", async () => {
    const result = await dialog.showOpenDialog(electronWindow, {
        title: "Select a File",
        properties: ["openFile"]
    });

    if (!result.canceled && result.filePaths.length > 0) {
        return result.filePaths[0]; // Return chosen file path back to React UI
    }
    return null;
});

// Exit the app cleanly
ipcMain.handle("exit-app", () => {
    app.quit();
});

app.whenReady().then(async () => {
    // Set EXAM_DATA_DIR so sessions are stored in writable userData when packaged
    process.env.EXAM_DATA_DIR = path.join(app.getPath('userData'), 'exam-data');
    await startServer(3000);
    createWindow();
});
