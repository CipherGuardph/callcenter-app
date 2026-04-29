import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import SessionSummary from "../components/SessionSummary.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { getLocalAnswers, getLocalSession } from "../services/localSessions.js";
import { getSession, getSessionAnswers, saveLocalSessionToCloud } from "../services/sessions.js";

export default function SessionPage() {
  const { sessionId } = useParams();
  const { currentUser } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const isLocalSession = sessionId.startsWith("local_");

  useEffect(() => {
    const sessionLoader = isLocalSession ? getLocalSession(sessionId) : getSession(sessionId);
    const answersLoader = isLocalSession ? getLocalAnswers(sessionId) : getSessionAnswers(sessionId);

    Promise.all([sessionLoader, answersLoader])
      .then(([sessionData, answerData]) => {
        setSession(sessionData);
        setAnswers(answerData);
      })
      .catch((sessionError) => setError(sessionError.message))
      .finally(() => setLoading(false));
  }, [isLocalSession, sessionId]);

  const saveToAccount = useCallback(async () => {
    if (!session || !answers.length) return;
    if (!currentUser) {
      navigate(`/login?redirect=${encodeURIComponent(`/practice/session/${sessionId}?save=1`)}`);
      return;
    }

    setSaving(true);
    setError("");
    try {
      const cloudSessionId = await saveLocalSessionToCloud({
        userId: currentUser.uid,
        localSession: session,
        answers
      });
      navigate(`/practice/session/${cloudSessionId}`);
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  }, [answers, currentUser, navigate, session, sessionId]);

  useEffect(() => {
    if (searchParams.get("save") === "1" && currentUser && isLocalSession && session && answers.length && !saving) {
      saveToAccount();
    }
  }, [answers.length, currentUser, isLocalSession, saveToAccount, saving, searchParams, session]);

  if (loading) return <div className="center-state">Loading session...</div>;

  return (
    <div className="stack">
      <section className="content-section">
        <div className="section-heading">
          <span className="eyebrow">Session summary</span>
          <h1>{session ? "Great practice run" : "Session not found"}</h1>
          {isLocalSession && session ? <p>Your recordings are saved only in this browser cache until you save them to an account.</p> : null}
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
                {answer.audioUrl || answer.blob ? (
                  <audio controls src={answer.audioUrl || URL.createObjectURL(answer.blob)}>
                    <track kind="captions" />
                  </audio>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </section>
      <div className="button-row">
        {isLocalSession && session ? (
          <button className="primary-button" onClick={saveToAccount} disabled={saving || !answers.length} type="button">
            {saving ? "Saving..." : currentUser ? "Save to Account" : "Log in to Save"}
          </button>
        ) : null}
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
