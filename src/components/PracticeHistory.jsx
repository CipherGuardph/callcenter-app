import { Link } from "react-router-dom";
import { formatDuration } from "../utils/format.js";

export default function PracticeHistory({ sessions, loading, emptyText = "No practice sessions yet." }) {
  if (loading) return <div className="state-card">Loading practice sessions...</div>;
  if (!sessions.length) return <div className="state-card">{emptyText}</div>;

  return (
    <div className="history-list">
      {sessions.map((session) => (
        <Link className="history-item" to={`/practice/session/${session.id}`} key={session.id}>
          <div>
            <strong>{formatDate(session.startedAt)}</strong>
            <span>{(session.categories || []).join(", ") || "Mixed practice"}</span>
          </div>
          <div>
            <span>{session.answeredQuestions || 0} answers</span>
            <span>{formatDuration(session.durationSeconds || 0)}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}

function formatDate(timestamp) {
  const date = timestamp?.toDate ? timestamp.toDate() : timestamp ? new Date(timestamp) : null;
  if (!date) return "Practice session";
  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(date);
}
