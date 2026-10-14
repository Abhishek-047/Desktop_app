import { useState, useEffect } from 'react';

export default function Exam({ onFinish }) {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [sessionId, setSessionId] = useState(null);
  const [status, setStatus] = useState('starting'); // starting, in-progress, finished
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Start session
    fetch('http://localhost:3000/exam/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'student-123', name: 'Test Student' })
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to start session. Is the backend running?');
        return res.json();
      })
      .then(data => {
        setSessionId(data.sessionId);
        // Fetch questions
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
  }, []);

  const handleAnswer = (selectedAnswer) => {
    const questionId = questions[currentQuestionIndex].id;
    fetch('http://localhost:3000/exam/answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, questionId, selectedAnswer })
    })
      .then(() => {
        if (currentQuestionIndex < questions.length - 1) {
          setCurrentQuestionIndex(prev => prev + 1);
        } else {
          submitExam();
        }
      })
      .catch(err => console.error(err));
  };

  const handleSkip = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      submitExam();
    }
  };

  const submitExam = () => {
    fetch('http://localhost:3000/exam/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId })
    })
      .then(res => res.json())
      .then(data => {
        setResult(data.result);
        setStatus('finished');
        if (onFinish) onFinish();
      })
      .catch(err => console.error(err));
  };

  if (status === 'starting') return <div style={{ padding: '20px' }}>Connecting to backend and starting exam...</div>;
  if (status === 'error') return <div style={{ padding: '20px', color: 'red' }}>Error: {error}</div>;
  if (status === 'finished') return (
    <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', margin: '20px', backgroundColor: '#ffffff', color: '#000000', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <h2>Exam Finished!</h2>
      <p>Attempted: {result?.attempted}</p>
      <p>Correct: {result?.correct}</p>
      <p>Wrong: {result?.wrong}</p>
    </div>
  );

  if (questions.length === 0) return <div>No questions available.</div>;

  const q = questions[currentQuestionIndex];

  return (
    <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', margin: '20px', backgroundColor: '#ffffff', color: '#000000', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <h3 style={{ color: '#333' }}>Question {currentQuestionIndex + 1} of {questions.length}</h3>
      <p style={{ fontSize: '18px', marginBottom: '20px', color: '#111' }}>{q.question}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {q.options.map((opt, idx) => (
          <button 
            key={idx} 
            onClick={() => handleAnswer(idx)}
            style={{ padding: '10px', textAlign: 'left', cursor: 'pointer', borderRadius: '5px', border: '1px solid #ccc', backgroundColor: '#f9f9f9', color: '#000', transition: 'background-color 0.2s' }}
          >
            {opt}
          </button>
        ))}
      </div>
      <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
        <button 
          onClick={handleSkip}
          style={{ padding: '8px 16px', cursor: 'pointer', borderRadius: '5px', border: 'none', backgroundColor: '#007aff', color: 'white', fontWeight: 'bold' }}
        >
          {currentQuestionIndex < questions.length - 1 ? 'Skip Question' : 'Skip & Finish'}
        </button>
      </div>
    </div>
  );
}
