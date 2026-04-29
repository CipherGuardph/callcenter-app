import { useEffect, useState } from "react";
import PracticeHistory from "../components/PracticeHistory.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { getUserSessions } from "../services/sessions.js";

export default function HistoryPage() {
  const { currentUser } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getUserSessions(currentUser.uid)
      .then(setSessions)
      .catch((historyError) => setError(historyError.message))
      .finally(() => setLoading(false));
  }, [currentUser.uid]);

  return (
    <section className="content-section">
      <div className="section-heading">
        <span className="eyebrow">Your recordings</span>
        <h1>Practice history</h1>
      </div>
      {error ? <p className="error-text">{error}</p> : null}
      <PracticeHistory sessions={sessions} loading={loading} />
    </section>
  );
}
