export default function SuggestedAnswerPanel({ question, visible }) {
  if (!visible) {
    return (
      <section className="suggestion-panel muted-panel">
        <h2>Suggested answer unlocks after recording</h2>
        <p>Try your own answer first. After you stop recording, compare it with the sample and improve one part at a time.</p>
      </section>
    );
  }

  return (
    <section className="suggestion-panel">
      <h2>Suggested answer</h2>
      <p className="sample-answer">{question.suggestedAnswer}</p>
      <InfoList title="Speaking structure" items={question.structure} />
      <InfoList title="Improvement tips" items={question.tips} />
      <InfoList title="Common mistakes to avoid" items={question.mistakes} />
    </section>
  );
}

function InfoList({ title, items }) {
  return (
    <div className="info-list">
      <h3>{title}</h3>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
