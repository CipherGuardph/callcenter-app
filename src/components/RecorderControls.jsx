export default function RecorderControls({
  supported,
  recordingState,
  error,
  audioBlob,
  durationSeconds,
  onStart,
  onStop,
  onReset,
  disabled
}) {
  const isRecording = recordingState === "recording";

  return (
    <section className="recorder-panel">
      <div>
        <span className={`status-dot ${isRecording ? "live" : ""}`} />
        <div>
          <h3>{isRecording ? "Recording now" : "Record your answer"}</h3>
          <p>{getRecorderText({ supported, recordingState, audioBlob, durationSeconds })}</p>
        </div>
      </div>
      {error ? <p className="error-text">{error}</p> : null}
      {!supported ? <p className="warning-text">Use Chrome, Edge, or another browser with MediaRecorder support to save audio.</p> : null}
      <div className="button-row big-actions">
        <button className="primary-button" onClick={onStart} disabled={!supported || isRecording || disabled} type="button">
          Start Recording
        </button>
        <button className="danger-button" onClick={onStop} disabled={!isRecording} type="button">
          Stop
        </button>
        <button className="secondary-button" onClick={onReset} disabled={isRecording || disabled} type="button">
          Reset
        </button>
      </div>
      {audioBlob ? (
        <audio className="audio-preview" controls src={URL.createObjectURL(audioBlob)}>
          <track kind="captions" />
        </audio>
      ) : null}
    </section>
  );
}

function getRecorderText({ supported, recordingState, audioBlob, durationSeconds }) {
  if (!supported) return "Audio recording is unavailable on this browser.";
  if (recordingState === "recording") return "Speak clearly. The timer will stop the recording when time is up.";
  if (audioBlob) return `Saved locally for review. Length: ${durationSeconds} seconds.`;
  return "Tap Start Recording when you are ready.";
}
