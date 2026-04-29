import Timer from "./Timer.jsx";
import VoiceQuestionPlayer from "./VoiceQuestionPlayer.jsx";

export default function InterviewCard({ question, questionNumber, totalQuestions, timerActive, timerResetKey, onTimeUp }) {
  return (
    <article className="interview-card">
      <div className="question-meta">
        <span>{question.category}</span>
        <span>{question.difficulty}</span>
        <span>
          {questionNumber} of {totalQuestions}
        </span>
      </div>
      <h1>{question.text}</h1>
      <VoiceQuestionPlayer text={question.text} />
      <Timer durationSeconds={question.timerSeconds} active={timerActive} resetKey={timerResetKey} onTimeUp={onTimeUp} />
    </article>
  );
}
