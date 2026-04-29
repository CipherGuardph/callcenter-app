import { useEffect, useMemo, useState } from "react";

export default function Timer({ durationSeconds = 90, active, resetKey, onTimeUp }) {
  const [remaining, setRemaining] = useState(durationSeconds);

  useEffect(() => {
    setRemaining(durationSeconds);
  }, [durationSeconds, resetKey]);

  useEffect(() => {
    if (!active || remaining <= 0) return undefined;

    const timerId = window.setInterval(() => {
      setRemaining((seconds) => {
        if (seconds <= 1) {
          window.clearInterval(timerId);
          onTimeUp?.();
          return 0;
        }
        return seconds - 1;
      });
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [active, remaining, onTimeUp]);

  const progress = useMemo(() => {
    return Math.max(0, Math.min(100, (remaining / durationSeconds) * 100));
  }, [durationSeconds, remaining]);

  return (
    <section className="timer-panel" aria-label="Answer timer">
      <div>
        <span className="eyebrow">Time left</span>
        <strong>{formatTime(remaining)}</strong>
      </div>
      <div className="progress-track" aria-hidden="true">
        <span style={{ width: `${progress}%` }} />
      </div>
    </section>
  );
}

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
