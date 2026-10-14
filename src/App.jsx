// App.jsx
import { useEffect, useRef, useState } from 'react'
import './App.css'
import Exam from './main_exam.jsx'

function App() {
  // state variables
  const [isExamStarted, setIsExamStarted] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [fullScreen, setFullScreen] = useState(false);
  const [timer, setTimer] = useState('');

  // Added local states to visually track selected paths in UI
  const [selectedFolder, setSelectedFolder] = useState('Default App Folder');
  const [selectedFilePath, setSelectedFilePath] = useState('No file chosen');

  // ref variables
  const videoRef = useRef(null);


  useEffect(() => {
    // Register Listener for handling Timer Tick from Main
    const removeTimerTickListener = window.athena.registerListenerForTimerTickFromMain(setTimer);

    // Register Listener for handling Camera Snap Request from Main
    const removeCameraSnapListener = window.athena.registerListenerForCameraSnapFromMain(saveVideoScreenShots);

    return () => {
      removeTimerTickListener()
      removeCameraSnapListener()
    };
  }, []);

  async function saveVideoScreenShots() {
    if (!videoRef.current || !videoRef.current.srcObject) {
      return;
    }

    try {
      const track = videoRef.current.srcObject.getVideoTracks()[0];
      if (!track) return;

      // Use ImageCapture API
      const imageCapture = new ImageCapture(track);
      const blob = await imageCapture.takePhoto();
      const arrayBuffer = await blob.arrayBuffer();

      // Send raw binary buffer to main process
      window.athena.storeCameraSnapImageOnDisk(arrayBuffer);
    } catch (error) {
      console.error("Failed to capture image via ImageCapture:", error);
    }
  }

  async function getCameraAccess() {
    try {
      const videoData = await navigator.mediaDevices.getUserMedia({
        video: true
      });

      if (videoRef.current) {
        videoRef.current.srcObject = videoData
      }
      setCameraEnabled(true);
    } catch (error) {
      alert('Cannot access Camera');
    }
  }

  async function enableFullScreen() {
    try {
      await document.documentElement.requestFullscreen();
      setFullScreen(true);
    } catch (error) {
      alert('Cannot access full screen');
    }
  }

  // TASK IMPLEMENTATION: Execute specific function logic based on checkbox checked & which button clicked
  async function handleShowRulesDialog() {
    const result = await window.athena.showRules();
    
    if (result.buttonClicked === "ACCEPT" && result.checkboxChecked) {
        alert("Action: Executing function for ACCEPT with checkbox checked.");
    } else if (result.buttonClicked === "ACCEPT" && !result.checkboxChecked) {
        alert("Action: Executing function for ACCEPT but checkbox was NOT checked.");
    } else {
        alert("Action: Executing function for CANCEL button clicked.");
    }
  }

  // TASK IMPLEMENTATION: UI trigger allowing user to change where camera shots are stored
  async function handleSelectStorageFolder() {
    const customPath = await window.athena.selectStorageFolder();
    if (customPath) {
        setSelectedFolder(customPath);
    }
  }

  // TASK IMPLEMENTATION: UI trigger that selects file and gets its system path string
  async function handleSelectFile() {
    const filePath = await window.athena.selectFile();
    if (filePath) {
        setSelectedFilePath(filePath);
    }
  }


  return (
    <div className="page-container">
      {isExamStarted ? (
        <Exam />
      ) : (
        <>
          {/* Main Card */}
          <div className="card-container">
        {/* Section 1: Camera / Heimdall */}
        <div className="permission-item">
          <div className="permission-content">
            <h3>Configure Camera</h3>
            <p>Kindly configure Camera to attempt quiz/contests.</p>
            <div className="action-row">
              <button
                className="btn btn-black"
                disabled={cameraEnabled}
                onClick={getCameraAccess}
              >
                {cameraEnabled ? 'Camera Connected' : 'Get Camera Access'}
              </button>

              {/* Hidden/Active Video Feed Preview */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className={`video-preview`}
              />
            </div>
          </div>
        </div>

        <div className="divider"></div>

        {/* Section 2: Fullscreen */}
        <div className="permission-item">
          <div className="permission-content">
            <h3>Switch to full screen</h3>
            <button
              className="btn btn-primary"
              disabled={fullScreen}
              onClick={() => {
                enableFullScreen();
              }}
            >
              {fullScreen ? 'Full Screen Enabled' : 'Give Full Screen Permissions'}
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Action Buttons */}
      <div className="bottom-actions">
        <button
          className="btn btn-primary"
          disabled={!cameraEnabled || !fullScreen}
          onClick={async () => {
            try {
              const response = await window.athena.startTimerOnMain();
              setIsExamStarted(true);
            } catch (error) {

            }
          }}
        >
          Go To Test
        </button>
      </div>

      <div>
        {timer + ' (s) elapsed'}
      </div>

      <div>
        <button onClick={() => {
          saveVideoScreenShots()
        }}>
          saveVideoScreenShots
        </button>
      </div>


      {/* TASK UI ELEMENT LAYOUT */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px', alignItems: 'center' }}>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleShowRulesDialog}>
            Show Native Rules (With Checkbox & Choice buttons)
          </button>

          <button onClick={() => { alert("Rules ...") }}>
            Show Chromium Rules
          </button>
        </div>

        <div style={{ marginTop: '10px', border: '1px solid #ccc', padding: '15px', borderRadius: '8px', width: '80%' }}>
          <h4>Storage & File Configurations</h4>
          
          <div style={{ margin: '10px 0' }}>
            <button onClick={handleSelectStorageFolder}>📁 Select Camera Snap Storage Folder</button>
            <p style={{ fontSize: '12px', wordBreak: 'break-all' }}><strong>Saving snaps to:</strong> {selectedFolder}</p>
          </div>

          <div style={{ margin: '10px 0' }}>
            <button onClick={handleSelectFile}>📄 Select File & Get Its Path</button>
            <p style={{ fontSize: '12px', wordBreak: 'break-all' }}><strong>Target Path:</strong> {selectedFilePath}</p>
          </div>
        </div>

      </div>
      </>
      )}
    </div>
  );
}

export default App
