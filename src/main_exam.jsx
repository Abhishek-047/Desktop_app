import { useState, useEffect } from 'react';

export default function Exam({ timer = 0, candidateName = 'Student', candidateId = 'STU-101', onExit }) {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [sessionId, setSessionId] = useState(null);
  const [status, setStatus] = useState('starting'); // starting, in-progress, finished, error
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [userAnswers, setUserAnswers] = useState({}); // { [questionIndex]: selectedIdx }
  const [selectedOption, setSelectedOption] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetch('http://localhost:3000/exam/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: candidateId, name: candidateName })
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to start session. Is backend running?');
        return res.json();
      })
      .then(data => {
        setSessionId(data.sessionId);
        return fetch('http://localhost:3000/exam/mcq');
      })
      .then(res => res.json())
      .then(data => {
        setQuestions(data);
        setStatus('in-progress');
      })
      .catch(err => {
        console.error(err);
        setError(err.message);
        setStatus('error');
      });
  }, [candidateId, candidateName]);

  const handleSelectOption = (idx) => {
    setSelectedOption(idx);
  };

  const handleConfirmAnswer = () => {
    if (selectedOption === null) return;
    setIsSubmitting(true);
    const questionId = questions[currentQuestionIndex].id;

    fetch('http://localhost:3000/exam/answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, questionId, selectedAnswer: selectedOption })
    })
      .then(res => res.json())
      .then(() => {
        setUserAnswers(prev => ({ ...prev, [currentQuestionIndex]: selectedOption }));
        setSelectedOption(null);
        setIsSubmitting(false);

        if (currentQuestionIndex < questions.length - 1) {
          setCurrentQuestionIndex(prev => prev + 1);
        } else {
          submitExam();
        }
      })
      .catch(err => {
        console.error(err);
        setIsSubmitting(false);
      });
  };

  const handleSkip = () => {
    setSelectedOption(null);
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      submitExam();
    }
  };

  const submitExam = () => {
    setStatus('submitting');
    fetch('http://localhost:3000/exam/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId })
    })
      .then(res => res.json())
      .then(data => {
        setResult(data.result);
        setStatus('finished');
      })
      .catch(err => {
        console.error(err);
        setError('Error submitting exam.');
        setStatus('error');
      });
  };

  const formatTimer = (secs) => {
    const s = Number(secs) || 0;
    const m = Math.floor(s / 60);
    const remainder = s % 60;
    return `${m.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  if (status === 'starting') {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <div style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', marginBottom: '8px' }}>Initializing Exam Environment...</div>
        <p style={{ color: '#64748b', fontSize: '14px' }}>Connecting to local proctoring engine & loading question bank.</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div style={{ padding: '30px', background: '#fff', borderRadius: '12px', border: '1px solid #fecaca', textAlign: 'center' }}>
        <h3 style={{ color: '#dc2626', marginBottom: '8px' }}>Connection Error</h3>
        <p style={{ color: '#7f1d1d', marginBottom: '20px' }}>{error}</p>
        <button onClick={() => window.location.reload()} className="btn btn-primary">Retry</button>
      </div>
    );
  }

  if (status === 'finished') {
    const total = questions.length;
    const attempted = result?.attempted || 0;
    const correct = result?.correct || 0;
    const wrong = result?.wrong || 0;
    const scorePct = total > 0 ? Math.round((correct / total) * 100) : 0;
    const isPassed = scorePct >= 50;

    return (
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '40px', maxWidth: '640px', margin: '0 auto', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ display: 'inline-block', padding: '8px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: '700', letterSpacing: '0.5px', textTransform: 'uppercase', background: isPassed ? '#dcfce7' : '#fee2e2', color: isPassed ? '#15803d' : '#b91c1c', marginBottom: '12px' }}>
            {isPassed ? 'Assessment Completed — Passed' : 'Assessment Completed'}
          </div>
          <h2 style={{ fontSize: '26px', color: '#0f172a', fontWeight: '800' }}>{candidateName}</h2>
          <p style={{ color: '#64748b', fontSize: '14px' }}>Candidate ID: {candidateId} • Session: {sessionId}</p>
        </div>

        {/* Score Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '28px', textAlign: 'center' }}>
          <div style={{ background: '#f8fafc', padding: '16px 8px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '22px', fontWeight: '700', color: '#0f172a' }}>{total}</div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Questions</div>
          </div>
          <div style={{ background: '#f8fafc', padding: '16px 8px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '22px', fontWeight: '700', color: '#3b82f6' }}>{attempted}</div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Attempted</div>
          </div>
          <div style={{ background: '#f0fdf4', padding: '16px 8px', borderRadius: '10px', border: '1px solid #bbf7d0' }}>
            <div style={{ fontSize: '22px', fontWeight: '700', color: '#16a34a' }}>{correct}</div>
            <div style={{ fontSize: '12px', color: '#15803d', marginTop: '4px' }}>Correct</div>
          </div>
          <div style={{ background: '#fef2f2', padding: '16px 8px', borderRadius: '10px', border: '1px solid #fecaca' }}>
            <div style={{ fontSize: '22px', fontWeight: '700', color: '#dc2626' }}>{wrong}</div>
            <div style={{ fontSize: '12px', color: '#b91c1c', marginTop: '4px' }}>Incorrect</div>
          </div>
        </div>

        {/* Accuracy Progress Bar */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>
            <span>Score Accuracy</span>
            <span>{scorePct}%</span>
          </div>
          <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: `${scorePct}%`, height: '100%', background: isPassed ? '#16a34a' : '#ef4444', transition: 'width 0.4s' }}></div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '14px' }}>
          <button 
            onClick={() => {
              if (window.athena && window.athena.exitApp) {
                window.athena.exitApp();
              } else {
                window.close();
              }
            }} 
            className="btn btn-black"
            style={{ width: '100%', padding: '12px 20px' }}
          >
            Finish & Exit Application
          </button>
        </div>
      </div>
    );
  }

  if (questions.length === 0) return <div>No examination questions available.</div>;

  const q = questions[currentQuestionIndex];
  const progressPercent = Math.round(((currentQuestionIndex + 1) / questions.length) * 100);

  return (
    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '32px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
      {/* Top Proctoring Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9', marginBottom: '24px' }}>
        <div>
          <div style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>Athena Examination</div>
          <div style={{ fontSize: '12px', color: '#64748b' }}>Candidate: <strong>{candidateName}</strong> ({candidateId})</div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#16a34a', background: '#f0fdf4', padding: '4px 10px', borderRadius: '12px', border: '1px solid #bbf7d0', fontWeight: '600' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', display: 'inline-block' }}></span>
            Proctored (Cam & Screen)
          </div>

          <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', background: '#f1f5f9', padding: '6px 14px', borderRadius: '8px', fontFamily: 'monospace' }}>
            ⏱️ {formatTimer(timer)}
          </div>
        </div>
      </div>

      {/* Question Progress Tracker */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#64748b', fontWeight: '600', marginBottom: '8px' }}>
          <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
          <span>{progressPercent}% Complete</span>
        </div>
        <div style={{ width: '100%', height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
          <div style={{ width: `${progressPercent}%`, height: '100%', background: '#2563eb', transition: 'width 0.3s ease' }}></div>
        </div>
      </div>

      {/* Question Number Pills Navigation */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {questions.map((_, i) => {
          const isCurrent = i === currentQuestionIndex;
          const isAnswered = userAnswers[i] !== undefined;
          return (
            <div 
              key={i}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: '700',
                background: isCurrent ? '#2563eb' : isAnswered ? '#dbeafe' : '#f8fafc',
                color: isCurrent ? '#ffffff' : isAnswered ? '#1d4ed8' : '#64748b',
                border: isCurrent ? '1px solid #2563eb' : '1px solid #e2e8f0',
              }}
            >
              {i + 1}
            </div>
          );
        })}
      </div>

      {/* Question Text */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#0f172a', lineHeight: '1.5' }}>
          {q.question}
        </h3>
      </div>

      {/* Options List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
        {q.options.map((opt, idx) => {
          const isSelected = selectedOption === idx;
          const optionPrefix = String.fromCharCode(65 + idx); // A, B, C, D
          return (
            <div
              key={idx}
              onClick={() => handleSelectOption(idx)}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '14px 18px',
                borderRadius: '10px',
                border: isSelected ? '2px solid #2563eb' : '1px solid #e2e8f0',
                backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <span style={{ 
                width: '28px', 
                height: '28px', 
                borderRadius: '50%', 
                background: isSelected ? '#2563eb' : '#f1f5f9', 
                color: isSelected ? '#fff' : '#64748b', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                fontWeight: '700', 
                fontSize: '12px', 
                marginRight: '14px',
                flexShrink: 0
              }}>
                {optionPrefix}
              </span>
              <span style={{ fontSize: '15px', color: isSelected ? '#1e3a8a' : '#1e293b', fontWeight: isSelected ? '600' : '400' }}>
                {opt}
              </span>
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
        <button
          onClick={handleSkip}
          disabled={isSubmitting}
          className="btn btn-outline"
          style={{ padding: '10px 20px' }}
        >
          {currentQuestionIndex < questions.length - 1 ? 'Skip Question' : 'Skip & Finish'}
        </button>

        <button
          onClick={handleConfirmAnswer}
          disabled={selectedOption === null || isSubmitting}
          className="btn btn-primary"
          style={{ padding: '10px 28px' }}
        >
          {isSubmitting ? 'Saving...' : currentQuestionIndex < questions.length - 1 ? 'Confirm & Next →' : 'Submit Assessment'}
        </button>
      </div>
    </div>
  );
}
