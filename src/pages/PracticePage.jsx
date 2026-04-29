import { useCallback, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import InterviewCard from "../components/InterviewCard.jsx";
import RecorderControls from "../components/RecorderControls.jsx";
import SuggestedAnswerPanel from "../components/SuggestedAnswerPanel.jsx";
import { interviewQuestions } from "../data/questions.js";
import { useMediaRecorder } from "../hooks/useMediaRecorder.js";
import { completeLocalSession, createLocalSession, saveLocalAnswer } from "../services/localSessions.js";

export default function PracticePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [sessionId, setSessionId] = useState(searchParams.get("sessionId"));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [answeredCategories, setAnsweredCategories] = useState([]);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [timerResetKey, setTimerResetKey] = useState(0);
  const recorder = useMediaRecorder();

  const question = interviewQuestions[currentIndex];
  const hasRecording = Boolean(recorder.audioBlob);
  const isLastQuestion = currentIndex === interviewQuestions.length - 1;
  const timerActive = recorder.recordingState === "recording";

  const ensureSession = async () => {
    if (sessionId) return sessionId;
    const newSessionId = await createLocalSession(interviewQuestions.length);
    setSessionId(newSessionId);
    window.history.replaceState(null, "", `/practice?sessionId=${newSessionId}`);
    return newSessionId;
  };

  const handleStartRecording = async () => {
    setError("");
    await ensureSession();
    setTimerResetKey((key) => key + 1);
    await recorder.startRecording();
  };

  const handleTimeUp = useCallback(() => {
    recorder.stopRecording();
  }, [recorder]);

  const saveCurrentAnswer = async () => {
    if (!recorder.audioBlob) return false;
    setSaving(true);
    setError("");
    try {
      const activeSessionId = await ensureSession();
      await saveLocalAnswer({
        blob: recorder.audioBlob,
        sessionId: activeSessionId,
        question,
        durationSeconds: recorder.durationSeconds
      });
      setAnsweredCount((count) => count + 1);
      setAnsweredCategories((categories) => [...categories, question.category]);
      setElapsedSeconds((seconds) => seconds + recorder.durationSeconds);
      return true;
    } catch (saveError) {
      setError(saveError.message);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const moveNext = async () => {
    const saved = hasRecording ? await saveCurrentAnswer() : true;
    if (!saved) return;

    if (isLastQuestion) {
      const activeSessionId = await ensureSession();
      await completeLocalSession({
        sessionId: activeSessionId,
        answeredQuestions: answeredCount + (hasRecording ? 1 : 0),
        durationSeconds: elapsedSeconds + (hasRecording ? recorder.durationSeconds : 0),
        categories: hasRecording ? [...answeredCategories, question.category] : answeredCategories
      });
      navigate(`/practice/session/${activeSessionId}`);
      return;
    }

    recorder.resetRecording();
    setCurrentIndex((index) => index + 1);
    setTimerResetKey((key) => key + 1);
  };

  const skipQuestion = () => {
    recorder.resetRecording();
    if (isLastQuestion) {
      if (sessionId) {
        completeLocalSession({
          sessionId,
          answeredQuestions: answeredCount,
          durationSeconds: elapsedSeconds,
          categories: answeredCategories
        }).finally(() => navigate(`/practice/session/${sessionId}`));
      } else {
        navigate("/dashboard");
      }
      return;
    }
    setCurrentIndex((index) => index + 1);
    setTimerResetKey((key) => key + 1);
  };

  const progressText = useMemo(() => `${currentIndex + 1} / ${interviewQuestions.length}`, [currentIndex]);

  return (
    <div className="practice-layout">
      <section className="practice-header">
        <div>
          <span className="eyebrow">Practice mode</span>
          <h1>Question {progressText}</h1>
        </div>
        <button className="secondary-button" onClick={skipQuestion} disabled={saving || timerActive} type="button">
          Skip
        </button>
      </section>
      {error ? <p className="error-text">{error}</p> : null}
      <InterviewCard
        question={question}
        questionNumber={currentIndex + 1}
        totalQuestions={interviewQuestions.length}
        timerActive={timerActive}
        timerResetKey={timerResetKey}
        onTimeUp={handleTimeUp}
      />
      <RecorderControls
        supported={recorder.supported}
        recordingState={recorder.recordingState}
        error={recorder.error}
        audioBlob={recorder.audioBlob}
        durationSeconds={recorder.durationSeconds}
        onStart={handleStartRecording}
        onStop={recorder.stopRecording}
        onReset={recorder.resetRecording}
        disabled={saving}
      />
      <SuggestedAnswerPanel question={question} visible={hasRecording} />
      <div className="bottom-actions">
        <button className="primary-button full-width" onClick={moveNext} disabled={saving || timerActive} type="button">
          {saving ? "Saving..." : isLastQuestion ? "Finish Session" : hasRecording ? "Save and Next" : "Next Question"}
        </button>
      </div>
    </div>
  );
}
