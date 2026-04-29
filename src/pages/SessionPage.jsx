import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import SessionSummary from "../components/SessionSummary.jsx";
import { getSession, getSessionAnswers } from "../services/sessions.js";

export default function SessionPage() {
  const { sessionId } = useParams();
  const [session, setSession] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([getSession(sessionId), getSessionAnswers(sessionId)])
      .then(([sessionData, answerData]) => {
        setSession(sessionData);
        setAnswers(answerData);
      })
      .catch((sessionError) => setError(sessionError.message))
      .finally(() => setLoading(false));
  }, [sessionId]);

  if (loading) return <div className="center-state">Loading session...</div>;

  return (
    <div className="stack">
      <section className="content-section">
        <div className="section-heading">
          <span className="eyebrow">Session summary</span>
          <h1>{session ? "Great practice run" : "Session not found"}</h1>
        </div>
        {error ? <p className="error-text">{error}</p> : null}
        {session ? <SessionSummary session={session} answers={answers} /> : <p className="state-card">This session could not be found.</p>}
      </section>
      <section className="content-section">
        <div className="section-heading">
          <h2>Recorded answers</h2>
        </div>
        {!answers.length ? (
          <div className="state-card">No recordings were saved for this session.</div>
        ) : (
          <div className="answer-list">
            {answers.map((answer) => (
              <article className="answer-item" key={answer.id}>
                <div>
                  <span className="eyebrow">{answer.category}</span>
                  <h3>{answer.questionText}</h3>
                  <p>{answer.durationSeconds || 0} seconds</p>
                </div>
                {answer.audioUrl ? (
                  <audio controls src={answer.audioUrl}>
                    <track kind="captions" />
                  </audio>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </section>
      <div className="button-row">
        <Link className="primary-button" to="/practice">
          Practice Again
        </Link>
        <Link className="secondary-button" to="/history">
          View History
        </Link>
      </div>
    </div>
  );
}
