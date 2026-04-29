import { useEffect, useState } from "react";

export function useSpeechSynthesis(text) {
  const supported = typeof window !== "undefined" && "speechSynthesis" in window;
  const [status, setStatus] = useState("idle");

  useEffect(() => {
    return () => {
      if (supported) window.speechSynthesis.cancel();
    };
  }, [supported]);

  const play = () => {
    if (!supported || !text) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.92;
    utterance.pitch = 1;
    utterance.onend = () => setStatus("idle");
    utterance.onerror = () => setStatus("idle");
    setStatus("playing");
    window.speechSynthesis.speak(utterance);
  };

  const pause = () => {
    if (!supported) return;
    window.speechSynthesis.pause();
    setStatus("paused");
  };

  const resume = () => {
    if (!supported) return;
    window.speechSynthesis.resume();
    setStatus("playing");
  };

  const stop = () => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    setStatus("idle");
  };

  return { supported, status, play, pause, resume, stop };
}
