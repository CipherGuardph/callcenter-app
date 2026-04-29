import { formatDuration } from "../utils/format.js";

export default function SessionSummary({ session, answers = [] }) {
  if (!session) return null;

  return (
    <section className="summary-grid">
      <div className="metric">
        <span>Answered</span>
        <strong>{session.answeredQuestions ?? answers.length}</strong>
      </div>
      <div className="metric">
        <span>Total questions</span>
        <strong>{session.totalQuestions ?? 0}</strong>
      </div>
      <div className="metric">
        <span>Duration</span>
        <strong>{formatDuration(session.durationSeconds ?? sumAnswerDurations(answers))}</strong>
      </div>
    </section>
  );
}

function sumAnswerDurations(answers) {
  return answers.reduce((total, answer) => total + (answer.durationSeconds || 0), 0);
}
