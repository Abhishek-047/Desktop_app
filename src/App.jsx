// App.jsx
import { useEffect, useRef, useState } from 'react'
import './App.css'
import Exam from './main_exam.jsx'

function App() {
  // state variables
  const [isExamStarted, setIsExamStarted] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [fullScreen, setFullScreen] = useState(false);
  const [rulesAccepted, setRulesAccepted] = useState(false);
  const [timer, setTimer] = useState(0);

  // Candidate Details
  const [candidateName, setCandidateName] = useState('Abhishek');
  const [candidateId, setCandidateId] = useState('STU-2026-47');

  // Storage selection
  const [selectedFolder, setSelectedFolder] = useState('Default App Data Folder');
  const [selectedFilePath, setSelectedFilePath] = useState('No file chosen');

  // ref variables
  const videoRef = useRef(null);

  useEffect(() => {
    // Register Listener for handling Timer Tick from Main
    const removeTimerTickListener = window.athena?.registerListenerForTimerTickFromMain(setTimer);

    // Register Listener for handling Camera Snap Request from Main
    const removeCameraSnapListener = window.athena?.registerListenerForCameraSnapFromMain(saveVideoScreenShots);

    return () => {
      if (removeTimerTickListener) removeTimerTickListener();
      if (removeCameraSnapListener) removeCameraSnapListener();
    };
  }, []);

  async function saveVideoScreenShots() {
    if (!videoRef.current || !videoRef.current.srcObject) {
      return;
    }

    try {
      const track = videoRef.current.srcObject.getVideoTracks()[0];
      if (!track) return;

      const imageCapture = new ImageCapture(track);
      const blob = await imageCapture.takePhoto();
      const arrayBuffer = await blob.arrayBuffer();

      window.athena?.storeCameraSnapImageOnDisk(arrayBuffer);
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
        videoRef.current.srcObject = videoData;
      }
      setCameraEnabled(true);
    } catch (error) {
      alert('Cannot access Camera. Please ensure webcam permissions are enabled.');
    }
  }

  async function enableFullScreen() {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }
      setFullScreen(true);
    } catch (error) {
      alert('Cannot access full screen');
    }
  }

  async function handleShowRulesDialog() {
    if (!window.athena?.showRules) {
      setRulesAccepted(true);
      return;
    }
    const result = await window.athena.showRules();
    if (result && result.button === "ACCEPT") {
      setRulesAccepted(true);
    }
  }

  async function handleSelectStorageFolder() {
    const customPath = await window.athena?.selectStorageFolder();
    if (customPath) {
      setSelectedFolder(customPath);
    }
  }

  async function handleSelectFile() {
    const filePath = await window.athena?.selectFile();
    if (filePath) {
      setSelectedFilePath(filePath);
    }
  }

  const isReadyToStart = cameraEnabled && fullScreen && rulesAccepted;

  return (
    <div className="page-container">
      {isExamStarted ? (
        <Exam 
          timer={timer} 
          candidateName={candidateName} 
          candidateId={candidateId}
          onExit={() => setIsExamStarted(false)} 
        />
      ) : (
        <>
          {/* Header */}
          <div className="header-section">
            <h1>Athena Proctoring Assessment</h1>
            <p>Complete the system checklist below to unlock the secure exam environment</p>
          </div>

          {/* Candidate Profile Card */}
          <div className="card-container" style={{ padding: '24px 32px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: '#0f172a' }}>
              👤 Candidate Profile
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>
                  Student Full Name
                </label>
                <input
                  type="text"
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                  placeholder="Enter your name"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>
                  Roll / Candidate ID
                </label>
                <input
                  type="text"
                  value={candidateId}
                  onChange={(e) => setCandidateId(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                  placeholder="e.g. STU-101"
                />
              </div>
            </div>
          </div>

          {/* Verification Cards */}
          <div className="card-container">
            {/* Step 1: Camera */}
            <div className="permission-item">
              <div className="permission-content" style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <h3>1. Webcam Verification</h3>
                  <span style={{ fontSize: '12px', fontWeight: '700', padding: '4px 10px', borderRadius: '12px', background: cameraEnabled ? '#dcfce7' : '#f1f5f9', color: cameraEnabled ? '#15803d' : '#64748b' }}>
                    {cameraEnabled ? '✓ Verified' : 'Action Required'}
                  </span>
                </div>
                <p>Webcam proctoring captures periodic snapshots during the exam to maintain integrity.</p>
                <div className="action-row">
                  <button
                    className="btn btn-black"
                    disabled={cameraEnabled}
                    onClick={getCameraAccess}
                  >
                    {cameraEnabled ? 'Camera Connected' : 'Grant Camera Access'}
                  </button>

                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    style={{ width: '140px', height: '90px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #cbd5e1', display: cameraEnabled ? 'block' : 'none' }}
                  />
                </div>
              </div>
            </div>

            <div className="divider"></div>

            {/* Step 2: Fullscreen */}
            <div className="permission-item">
              <div className="permission-content" style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <h3>2. Fullscreen Lockdown</h3>
                  <span style={{ fontSize: '12px', fontWeight: '700', padding: '4px 10px', borderRadius: '12px', background: fullScreen ? '#dcfce7' : '#f1f5f9', color: fullScreen ? '#15803d' : '#64748b' }}>
                    {fullScreen ? '✓ Verified' : 'Action Required'}
                  </span>
                </div>
                <p>Switch to fullscreen to prevent app switching and external window assistance.</p>
                <button
                  className="btn btn-primary"
                  disabled={fullScreen}
                  onClick={enableFullScreen}
                >
                  {fullScreen ? 'Fullscreen Active' : 'Enter Fullscreen Mode'}
                </button>
              </div>
            </div>

            <div className="divider"></div>

            {/* Step 3: Rules Confirmation */}
            <div className="permission-item">
              <div className="permission-content" style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <h3>3. Examination Code of Conduct</h3>
                  <span style={{ fontSize: '12px', fontWeight: '700', padding: '4px 10px', borderRadius: '12px', background: rulesAccepted ? '#dcfce7' : '#f1f5f9', color: rulesAccepted ? '#15803d' : '#64748b' }}>
                    {rulesAccepted ? '✓ Rules Accepted' : 'Action Required'}
                  </span>
                </div>
                <p>Read and accept the 5 integrity rules in the native modal to confirm compliance.</p>
                <button
                  className="btn btn-outline"
                  onClick={handleShowRulesDialog}
                >
                  {rulesAccepted ? 'Review Guidelines Again' : 'Review & Accept Exam Rules'}
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Start Action Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px 28px', marginBottom: '24px' }}>
            <div>
              <div style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>Ready to Begin?</div>
              <div style={{ fontSize: '13px', color: '#64748b' }}>
                {isReadyToStart 
                  ? 'All verification checks passed! You may now begin.' 
                  : 'Complete camera, fullscreen, and rules acceptance above.'}
              </div>
            </div>

            <button
              className="btn btn-primary"
              disabled={!isReadyToStart}
              style={{ padding: '14px 32px', fontSize: '15px' }}
              onClick={async () => {
                try {
                  await window.athena?.startTimerOnMain();
                  setIsExamStarted(true);
                } catch (error) {
                  console.error(error);
                  setIsExamStarted(true);
                }
              }}
            >
              Start Examination →
            </button>
          </div>

          {/* Optional Storage Configurations */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '18px 24px', fontSize: '13px', color: '#64748b' }}>
            <div style={{ fontWeight: '600', color: '#334155', marginBottom: '6px' }}>⚙️ Proctoring Snapshot Storage:</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <span>{selectedFolder}</span>
              <button onClick={handleSelectStorageFolder} style={{ fontSize: '12px', padding: '4px 10px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer' }}>
                Change Folder
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
