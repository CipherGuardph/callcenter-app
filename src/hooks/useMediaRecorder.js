import { useRef, useState } from "react";

const preferredTypes = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"];

export function useMediaRecorder() {
  const supported = typeof window !== "undefined" && "MediaRecorder" in window && navigator.mediaDevices?.getUserMedia;
  const recorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const startedAtRef = useRef(0);
  const [recordingState, setRecordingState] = useState("idle");
  const [audioBlob, setAudioBlob] = useState(null);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [error, setError] = useState("");

  const startRecording = async () => {
    if (!supported) {
      setError("Voice recording is not supported on this browser.");
      return false;
    }

    setError("");
    setAudioBlob(null);
    setDurationSeconds(0);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];
      const mimeType = preferredTypes.find((type) => MediaRecorder.isTypeSupported(type)) || "";
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      recorder.onstop = () => {
        const blobType = recorder.mimeType || "audio/webm";
        const blob = new Blob(chunksRef.current, { type: blobType });
        setAudioBlob(blob);
        setDurationSeconds(Math.max(1, Math.round((Date.now() - startedAtRef.current) / 1000)));
        setRecordingState("stopped");
        stopTracks();
      };

      startedAtRef.current = Date.now();
      recorderRef.current = recorder;
      recorder.start();
      setRecordingState("recording");
      return true;
    } catch (recordingError) {
      setError(getPermissionError(recordingError));
      setRecordingState("idle");
      stopTracks();
      return false;
    }
  };

  const stopRecording = () => {
    if (recorderRef.current?.state === "recording") {
      recorderRef.current.stop();
    }
  };

  const resetRecording = () => {
    stopTracks();
    chunksRef.current = [];
    recorderRef.current = null;
    setAudioBlob(null);
    setDurationSeconds(0);
    setRecordingState("idle");
    setError("");
  };

  const stopTracks = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  };

  return {
    supported,
    recordingState,
    audioBlob,
    durationSeconds,
    error,
    startRecording,
    stopRecording,
    resetRecording
  };
}

function getPermissionError(error) {
  if (error?.name === "NotAllowedError") return "Microphone permission was blocked. Please allow microphone access and try again.";
  if (error?.name === "NotFoundError") return "No microphone was found on this device.";
  return "Could not start recording. Please check your microphone and browser permissions.";
}
