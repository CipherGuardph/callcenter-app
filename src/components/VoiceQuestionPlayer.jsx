import { useSpeechSynthesis } from "../hooks/useSpeechSynthesis.js";

export default function VoiceQuestionPlayer({ text }) {
  const speech = useSpeechSynthesis(text);

  return (
    <section className="tool-panel">
      <div>
        <h3>Voice prompt</h3>
        <p>{speech.supported ? "Listen first, then answer like a real interview." : "Voice playback is not supported here. Read the question below."}</p>
      </div>
      <div className="button-row">
        <button className="secondary-button" onClick={speech.play} type="button" disabled={!speech.supported}>
          Play
        </button>
        <button
          className="secondary-button"
          onClick={speech.status === "paused" ? speech.resume : speech.pause}
          type="button"
          disabled={!speech.supported || speech.status === "idle"}
        >
          {speech.status === "paused" ? "Resume" : "Pause"}
        </button>
        <button className="secondary-button" onClick={speech.stop} type="button" disabled={!speech.supported}>
          Stop
        </button>
      </div>
    </section>
  );
}
