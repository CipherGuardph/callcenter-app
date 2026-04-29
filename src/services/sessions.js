import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { db, firebaseReady, storage } from "./firebase.js";

const MAX_AUDIO_BYTES = 15 * 1024 * 1024;
const ALLOWED_AUDIO_TYPES = ["audio/webm", "audio/mp4", "audio/ogg", "audio/wav"];

export function createFutureAiFeedbackPlaceholder() {
  return {
    status: "not_enabled",
    message: "AI feedback is planned for a future version. This MVP works without backend AI."
  };
}

export async function createPracticeSession({ userId, totalQuestions }) {
  ensureFirebase();
  const sessionRef = await addDoc(collection(db, "sessions"), {
    userId,
    status: "active",
    startedAt: serverTimestamp(),
    completedAt: null,
    totalQuestions,
    answeredQuestions: 0,
    categories: [],
    durationSeconds: 0
  });
  return sessionRef.id;
}

export async function completePracticeSession({ sessionId, answeredQuestions, durationSeconds, categories }) {
  ensureFirebase();
  await updateDoc(doc(db, "sessions", sessionId), {
    status: "completed",
    completedAt: serverTimestamp(),
    answeredQuestions,
    durationSeconds,
    categories: [...new Set(categories)]
  });
}

export async function getSession(sessionId) {
  ensureFirebase();
  const snapshot = await getDoc(doc(db, "sessions", sessionId));
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() };
}

export async function getSessionAnswers(sessionId) {
  ensureFirebase();
  const answersRef = collection(db, "sessions", sessionId, "answers");
  const answersQuery = query(answersRef, orderBy("createdAt", "asc"));
  const snapshot = await getDocs(answersQuery);
  return snapshot.docs.map((answerDoc) => ({ id: answerDoc.id, ...answerDoc.data() }));
}

export async function getUserSessions(userId, count = 20) {
  ensureFirebase();
  const sessionsQuery = query(
    collection(db, "sessions"),
    where("userId", "==", userId),
    orderBy("startedAt", "desc"),
    limit(count)
  );
  const snapshot = await getDocs(sessionsQuery);
  return snapshot.docs.map((sessionDoc) => ({ id: sessionDoc.id, ...sessionDoc.data() }));
}

export async function uploadAnswerAudio({ blob, userId, sessionId, question, durationSeconds }) {
  ensureFirebase();
  validateAudioBlob(blob);

  const extension = blob.type.includes("mp4") ? "mp4" : blob.type.includes("ogg") ? "ogg" : "webm";
  const storagePath = `interview-recordings/${userId}/${sessionId}/${question.id}.${extension}`;
  const audioRef = ref(storage, storagePath);
  const uploadResult = await uploadBytes(audioRef, blob, {
    contentType: blob.type || "audio/webm",
    customMetadata: {
      sessionId,
      questionId: question.id,
      category: question.category
    }
  });
  const audioUrl = await getDownloadURL(uploadResult.ref);

  await addDoc(collection(db, "sessions", sessionId, "answers"), {
    questionId: question.id,
    questionText: question.text,
    category: question.category,
    audioUrl,
    storagePath,
    durationSeconds,
    createdAt: serverTimestamp(),
    aiFeedback: createFutureAiFeedbackPlaceholder()
  });

  return { audioUrl, storagePath };
}

function validateAudioBlob(blob) {
  if (!blob) throw new Error("No recording found. Please record your answer first.");
  if (blob.size > MAX_AUDIO_BYTES) throw new Error("Recording is too large. Please keep answers under 15 MB.");
  if (blob.type && !ALLOWED_AUDIO_TYPES.includes(blob.type)) {
    throw new Error("Unsupported audio format. Please record again using your browser microphone.");
  }
}

function ensureFirebase() {
  if (!firebaseReady || !db || !storage) {
    throw new Error("Firebase is not configured. Add your Vite Firebase environment variables first.");
  }
}
