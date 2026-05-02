import { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db, firebaseReady } from "../services/firebase.js";
import { clearLocalBrowserCache } from "../services/localSessions.js";
import {
  ADMIN_EMAIL,
  createDefaultMembershipProfile,
  evaluateMembership,
  loadOrCreateMembershipProfile,
  saveReceiptAndActivate,
  syncMembershipProfile
} from "../services/membership.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [membership, setMembership] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firebaseReady) {
      setLoading(false);
      return undefined;
    }

    let alive = true;
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!alive) return;
      setCurrentUser(user);

      if (!user) {
        setMembership(null);
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const profile = await loadOrCreateMembershipProfile(user);
        const reconciled = await syncMembershipProfile(user, profile);
        if (!alive) return;
        if (reconciled?.isDeleted) {
          await clearLocalBrowserCache();
          await signOut(auth);
          setCurrentUser(null);
          setMembership(null);
          setLoading(false);
          return;
        }
        setMembership(reconciled);
      } catch {
        if (!alive) return;
        setMembership({
          ...createDefaultMembershipProfile(user),
          membershipStatus: user.email === ADMIN_EMAIL ? "admin" : "trial_active",
          isAdmin: user.email === ADMIN_EMAIL,
          canAccessApp: true,
          needsOrder: false,
          trialDaysLeft: 1,
          subscriptionDaysLeft: 0,
          deleteDaysLeft: 0
        });
      } finally {
        if (alive) setLoading(false);
      }
    });

    return () => {
      alive = false;
      unsubscribe();
    };
  }, []);

  const signUp = useCallback(async ({ name, email, password }) => {
    if (!firebaseReady) throw new Error("Firebase is not configured yet.");
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(credential.user, { displayName: name });

    const profile = createDefaultMembershipProfile(credential.user);
    await setDoc(doc(db, "users", credential.user.uid), {
      ...profile,
      displayName: name,
      email,
      updatedAtMs: Date.now()
    });

    return credential.user;
  }, []);

  const login = useCallback(async ({ email, password }) => {
    if (!firebaseReady) throw new Error("Firebase is not configured yet.");
    const credential = await signInWithEmailAndPassword(auth, email, password);
    return credential.user;
  }, []);

  const logout = useCallback(async () => {
    if (!firebaseReady) return;
    await signOut(auth);
  }, []);

  const saveReceipt = useCallback(async ({ file, paymentMethod }) => {
    if (!currentUser) throw new Error("Please log in first.");
    const result = await saveReceiptAndActivate(currentUser, file, paymentMethod);
    const profile = await loadOrCreateMembershipProfile(currentUser);
    const refreshed = evaluateMembership({
      ...profile,
      membershipStatus: "subscription_active",
      subscriptionEndsAtMs: result.subscriptionEndsAtMs,
      receiptStatus: "approved",
      receiptUrl: result.receiptUrl,
      receiptStoragePath: result.storagePath
    });
    setMembership(refreshed);
    return refreshed;
  }, [currentUser]);

  const refreshMembership = useCallback(async () => {
    if (!currentUser) return null;
    const profile = await loadOrCreateMembershipProfile(currentUser);
    const reconciled = await syncMembershipProfile(currentUser, profile);
    if (reconciled?.isDeleted) {
      await clearLocalBrowserCache();
      await signOut(auth);
      setCurrentUser(null);
      setMembership(null);
      return null;
    }
    setMembership(reconciled);
    return reconciled;
  }, [currentUser]);

  const resetLocalCacheForDeletion = useCallback(async () => {
    await clearLocalBrowserCache();
  }, []);

  useEffect(() => {
    if (!firebaseReady || !currentUser) return undefined;

    const heartbeat = window.setInterval(() => {
      refreshMembership().catch(() => {});
    }, 60000);

    return () => window.clearInterval(heartbeat);
  }, [currentUser, refreshMembership]);

  const value = {
    currentUser,
    membership,
    loading,
    membershipLoading: loading,
    login,
    logout,
    signUp,
    saveReceipt,
    refreshMembership,
    resetLocalCacheForDeletion,
    firebaseReady
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
