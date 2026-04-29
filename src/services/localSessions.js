const DB_NAME = "bpo-interview-simulator";
const DB_VERSION = 1;
const SESSION_STORE = "sessions";
const ANSWER_STORE = "answers";

export function createLocalSessionId() {
  return `local_${Date.now()}_${crypto.randomUUID?.() || Math.random().toString(36).slice(2)}`;
}

export async function createLocalSession(totalQuestions) {
  const session = {
    id: createLocalSessionId(),
    status: "active",
    startedAt: new Date().toISOString(),
    completedAt: null,
    totalQuestions,
    answeredQuestions: 0,
    categories: [],
    durationSeconds: 0,
    storageMode: "browser_cache"
  };
  await putSession(session);
  return session.id;
}

export async function saveLocalAnswer({ sessionId, question, blob, durationSeconds }) {
  const db = await openDb();
  const answer = {
    id: `${sessionId}_${question.id}`,
    sessionId,
    questionId: question.id,
    questionText: question.text,
    category: question.category,
    durationSeconds,
    createdAt: new Date().toISOString(),
    blob,
    localOnly: true
  };

  await transaction(db, ANSWER_STORE, "readwrite", (store) => store.put(answer));
  return answer;
}

export async function completeLocalSession({ sessionId, answeredQuestions, durationSeconds, categories }) {
  const session = await getLocalSession(sessionId);
  if (!session) return;
  await putSession({
    ...session,
    status: "completed",
    completedAt: new Date().toISOString(),
    answeredQuestions,
    durationSeconds,
    categories: [...new Set(categories)]
  });
}

export async function getLocalSession(sessionId) {
  const db = await openDb();
  return transaction(db, SESSION_STORE, "readonly", (store) => store.get(sessionId));
}

export async function getLocalAnswers(sessionId) {
  const db = await openDb();
  const answers = await transaction(db, ANSWER_STORE, "readonly", (store) => store.getAll());
  return answers
    .filter((answer) => answer.sessionId === sessionId)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
}

async function putSession(session) {
  const db = await openDb();
  await transaction(db, SESSION_STORE, "readwrite", (store) => store.put(session));
}

function openDb() {
  return new Promise((resolve, reject) => {
    if (!("indexedDB" in window)) {
      reject(new Error("Browser cache storage is not supported here."));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(SESSION_STORE)) {
        db.createObjectStore(SESSION_STORE, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(ANSWER_STORE)) {
        db.createObjectStore(ANSWER_STORE, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function transaction(db, storeName, mode, action) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, mode);
    const store = tx.objectStore(storeName);
    const request = action(store);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    tx.onerror = () => reject(tx.error);
  });
}
