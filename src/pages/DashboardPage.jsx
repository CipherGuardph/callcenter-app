import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PracticeHistory from "../components/PracticeHistory.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { interviewQuestions } from "../data/questions.js";
import { createLocalSession } from "../services/localSessions.js";
import { getUserSessions } from "../services/sessions.js";

export default function DashboardPage() {
  const { currentUser } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    if (!currentUser) {
      setSessions([]);
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    getUserSessions(currentUser.uid, 5)
      .then((items) => {
        if (mounted) setSessions(items);
      })
      .catch((sessionError) => {
        if (mounted) setError(sessionError.message);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [currentUser]);

  const completedSessions = sessions.filter((session) => session.status === "completed");
  const progress = useMemo(() => {
    const answers = completedSessions.reduce((total, session) => total + (session.answeredQuestions || 0), 0);
    const minutes = Math.round(completedSessions.reduce((total, session) => total + (session.durationSeconds || 0), 0) / 60);
    return { answers, minutes };
  }, [completedSessions]);

  const startPractice = async () => {
    setStarting(true);
    setError("");
    try {
      const sessionId = await createLocalSession(interviewQuestions.length);
      navigate(`/practice?sessionId=${sessionId}`);
    } catch (startError) {
      setError(startError.message);
    } finally {
      setStarting(false);
    }
  };

  return (
    <div className="stack">
      <section className="dashboard-hero">
        <div>
          <span className="eyebrow">Welcome back</span>
          <h1>Build confidence before your first BPO interview.</h1>
          <p>Practice common questions first. Your recordings stay in this browser until you choose to save them to an account.</p>
        </div>
        <button className="primary-button hero-action" onClick={startPractice} disabled={starting} type="button">
          {starting ? "Starting..." : "Start Practice"}
        </button>
      </section>
      {error ? <p className="error-text">{error}</p> : null}
      <section className="summary-grid">
        <div className="metric">
          <span>Completed sessions</span>
          <strong>{completedSessions.length}</strong>
        </div>
        <div className="metric">
          <span>Answers recorded</span>
          <strong>{progress.answers}</strong>
        </div>
        <div className="metric">
          <span>Practice minutes</span>
          <strong>{progress.minutes}</strong>
        </div>
      </section>
      <section className="content-section">
        <div className="section-heading">
          <h2>Beginner tips</h2>
        </div>
        <div className="tips-grid">
          <article>
            <strong>Use simple English</strong>
            <p>Clear and natural answers are better than complicated words.</p>
          </article>
          <article>
            <strong>Answer in a structure</strong>
            <p>Start direct, give one example, then connect it to customer service.</p>
          </article>
          <article>
            <strong>Practice your voice</strong>
            <p>Smile while speaking, slow down, and finish your sentences.</p>
          </article>
        </div>
      </section>
      <section className="content-section">
        <div className="section-heading">
          <h2>Recent sessions</h2>
        </div>
        <PracticeHistory
          sessions={sessions}
          loading={loading}
          emptyText={currentUser ? "Start your first saved practice session to see history here." : "Log in after practice if you want to save sessions to cloud history."}
        />
      </section>
    </div>
  );
}
