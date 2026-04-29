import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where
} from "firebase/firestore";
import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { deleteUser } from "firebase/auth";
import { auth, db, firebaseReady, storage } from "./firebase.js";

export const ADMIN_EMAIL = "cjquintoph@gmail.com";
export const DAY_MS = 24 * 60 * 60 * 1000;
export const MONTH_MS = 30 * DAY_MS;
const RECEIPT_MAX_BYTES = 10 * 1024 * 1024;
const RECEIPT_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
const ONLINE_WINDOW_MS = 5 * 60 * 1000;

export function createDefaultMembershipProfile(user, now = Date.now()) {
  const isAdmin = user.email === ADMIN_EMAIL;
  return {
    displayName: user.displayName || "",
    email: user.email || "",
    role: isAdmin ? "admin" : "member",
    createdAtMs: now,
    updatedAtMs: now,
    lastSeenAtMs: now,
    isOnline: true,
    membershipStatus: isAdmin ? "admin" : "trial_active",
    trialStartedAtMs: now,
    trialEndsAtMs: now + DAY_MS,
    subscriptionStartedAtMs: null,
    subscriptionEndsAtMs: null,
    accountDeleteAtMs: null,
    receiptStatus: "none",
    receiptUrl: "",
    receiptStoragePath: "",
    receiptUploadedAtMs: null,
    receiptApprovedAtMs: null,
    paymentMethod: "",
    isDeleted: false
  };
}

export function evaluateMembership(profile, now = Date.now()) {
  const role = profile.role || "member";
  const trialEndsAtMs = profile.trialEndsAtMs || null;
  const subscriptionEndsAtMs = profile.subscriptionEndsAtMs || null;
  const accountDeleteAtMs = profile.accountDeleteAtMs || null;

  let membershipStatus = profile.membershipStatus || "trial_active";
  let nextAccountDeleteAtMs = accountDeleteAtMs;

  if (role === "admin") {
    membershipStatus = "admin";
  } else if (membershipStatus === "trial_active" && trialEndsAtMs && now >= trialEndsAtMs) {
    membershipStatus = "trial_expired";
  } else if (membershipStatus === "subscription_active" && subscriptionEndsAtMs && now >= subscriptionEndsAtMs) {
    membershipStatus = "subscription_expired";
    nextAccountDeleteAtMs = accountDeleteAtMs || subscriptionEndsAtMs + MONTH_MS;
  } else if (membershipStatus === "subscription_expired" && nextAccountDeleteAtMs && now >= nextAccountDeleteAtMs) {
    membershipStatus = "delete_due";
  }

  const isAdmin = role === "admin";
  const canAccessApp = isAdmin || membershipStatus === "trial_active" || membershipStatus === "subscription_active";
  const needsOrder = !isAdmin && (membershipStatus === "trial_expired" || membershipStatus === "subscription_expired" || membershipStatus === "delete_due");
  const trialDaysLeft = trialEndsAtMs ? Math.max(0, Math.ceil((trialEndsAtMs - now) / DAY_MS)) : 0;
  const subscriptionDaysLeft = subscriptionEndsAtMs ? Math.max(0, Math.ceil((subscriptionEndsAtMs - now) / DAY_MS)) : 0;
  const deleteDaysLeft = nextAccountDeleteAtMs ? Math.max(0, Math.ceil((nextAccountDeleteAtMs - now) / DAY_MS)) : 0;
  const isOnline = Boolean(profile.isOnline) || ((profile.lastSeenAtMs || 0) > now - ONLINE_WINDOW_MS);
  const isSubscribed = isAdmin || membershipStatus === "subscription_active";

  return {
    ...profile,
    role,
    membershipStatus,
    canAccessApp,
    needsOrder,
    isAdmin,
    isOnline,
    isSubscribed,
    trialDaysLeft,
    subscriptionDaysLeft,
    deleteDaysLeft,
    nextAccountDeleteAtMs
  };
}

export async function loadOrCreateMembershipProfile(user) {
  ensureFirebase();
  const profileRef = doc(db, "users", user.uid);
  const snapshot = await getDoc(profileRef);
  const now = Date.now();
  const fallbackProfile = createDefaultMembershipProfile(user, now);
  const current = snapshot.exists() ? snapshot.data() : fallbackProfile;
  const merged = {
    ...fallbackProfile,
    ...current,
    displayName: user.displayName || current.displayName || "",
    email: user.email || current.email || ""
  };
  merged.role = user.email === ADMIN_EMAIL ? "admin" : merged.role || "member";
  const profile = evaluateMembership(merged, now);

  if (!snapshot.exists()) {
    await setDoc(profileRef, profile);
  }

  return profile;
}

export async function syncMembershipProfile(user, profile) {
  ensureFirebase();
  const now = Date.now();
  const profileRef = doc(db, "users", user.uid);
  const evaluated = evaluateMembership(profile, now);
  const patch = {
    updatedAtMs: now,
    lastSeenAtMs: now,
    isOnline: true,
    membershipStatus: evaluated.membershipStatus,
    accountDeleteAtMs: evaluated.nextAccountDeleteAtMs || profile.accountDeleteAtMs || null
  };

  if (evaluated.membershipStatus === "trial_expired" && profile.membershipStatus !== "trial_expired") {
    patch.membershipStatus = "trial_expired";
  }

  if (evaluated.membershipStatus === "subscription_expired" && profile.membershipStatus !== "subscription_expired") {
    patch.membershipStatus = "subscription_expired";
    patch.accountDeleteAtMs = evaluated.nextAccountDeleteAtMs;
  }

  if (evaluated.membershipStatus === "delete_due") {
    await deleteExpiredAccount(user, profile);
    return { ...evaluated, isDeleted: true };
  }

  await updateDoc(profileRef, patch);
  return evaluateMembership({ ...profile, ...patch }, now);
}

export async function updateLastSeen(user, online = true) {
  ensureFirebase();
  await updateDoc(doc(db, "users", user.uid), {
    lastSeenAtMs: Date.now(),
    updatedAtMs: Date.now(),
    isOnline: online
  });
}

export async function saveReceiptAndActivate(user, file, paymentMethod) {
  ensureFirebase();
  validateReceiptFile(file);
  const now = Date.now();
  const fileName = `${now}-${sanitizeFileName(file.name || "receipt")}`;
  const storagePath = `payment-receipts/${user.uid}/${fileName}`;
  const receiptRef = ref(storage, storagePath);
  const uploadResult = await uploadBytes(receiptRef, file, {
    contentType: file.type || "image/jpeg",
    customMetadata: {
      uid: user.uid,
      paymentMethod: paymentMethod || "manual_upload"
    }
  });
  const receiptUrl = await getDownloadURL(uploadResult.ref);
  const profileRef = doc(db, "users", user.uid);

  await updateDoc(profileRef, {
    membershipStatus: "subscription_active",
    receiptStatus: "approved",
    receiptUrl,
    receiptStoragePath: storagePath,
    receiptUploadedAtMs: now,
    receiptApprovedAtMs: now,
    paymentMethod: paymentMethod || "manual_upload",
    subscriptionStartedAtMs: now,
    subscriptionEndsAtMs: now + MONTH_MS,
    accountDeleteAtMs: null,
    updatedAtMs: now,
    lastSeenAtMs: now,
    isOnline: true
  });

  return {
    receiptUrl,
    storagePath,
    subscriptionEndsAtMs: now + MONTH_MS
  };
}

export async function getAllMembershipProfiles() {
  ensureFirebase();
  const snapshot = await getDocs(collection(db, "users"));
  return snapshot.docs.map((profileDoc) => ({ id: profileDoc.id, ...profileDoc.data() }));
}

export async function deleteExpiredAccount(user, profile) {
  ensureFirebase();
  const profileRef = doc(db, "users", user.uid);
  const sessionsSnapshot = await getDocs(query(collection(db, "sessions"), where("userId", "==", user.uid)));

  for (const sessionDoc of sessionsSnapshot.docs) {
    const answersSnapshot = await getDocs(collection(db, "sessions", sessionDoc.id, "answers"));
    for (const answerDoc of answersSnapshot.docs) {
      const answer = answerDoc.data();
      if (answer.storagePath) {
        await safeDeleteStoragePath(answer.storagePath);
      }
      await deleteDoc(answerDoc.ref);
    }
    await deleteDoc(sessionDoc.ref);
  }

  if (profile?.receiptStoragePath) {
    await safeDeleteStoragePath(profile.receiptStoragePath);
  }

  await deleteDoc(profileRef);

  if (auth.currentUser?.uid === user.uid) {
    try {
      await deleteUser(auth.currentUser);
    } catch {
      // Best effort: auth deletion needs a recent login.
    }
  }
}

function validateReceiptFile(file) {
  if (!file) throw new Error("Please choose a receipt file to upload.");
  if (file.size > RECEIPT_MAX_BYTES) throw new Error("Receipt file is too large. Please keep it under 10 MB.");
  const contentType = (file.type || "").toLowerCase();
  if (contentType && !RECEIPT_TYPES.includes(contentType)) {
    throw new Error("Unsupported receipt format. Please upload a JPG, PNG, WEBP, or PDF file.");
  }
}

function sanitizeFileName(fileName) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
}

async function safeDeleteStoragePath(storagePath) {
  try {
    await deleteObject(ref(storage, storagePath));
  } catch {
    // Ignore storage cleanup failures during account deletion.
  }
}

function ensureFirebase() {
  if (!firebaseReady || !db || !storage) {
    throw new Error("Firebase is not configured yet.");
  }
}
