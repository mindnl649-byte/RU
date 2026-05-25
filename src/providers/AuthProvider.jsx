import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInAnonymously,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { auth, firebaseReady, googleProvider } from "../lib/firebase.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(Boolean(auth));

  useEffect(() => {
    if (!auth) {
      setAuthLoading(false);
      return undefined;
    }

    return onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setAuthLoading(false);
    });
  }, []);

  const value = useMemo(() => {
    async function loginWithGoogle() {
      if (!auth) throw new Error("Firebase is not configured.");
      await signInWithPopup(auth, googleProvider);
    }

    async function loginWithEmail(email, password) {
      if (!auth) throw new Error("Firebase is not configured.");
      await signInWithEmailAndPassword(auth, email, password);
    }

    async function createAccount(email, password) {
      if (!auth) throw new Error("Firebase is not configured.");
      await createUserWithEmailAndPassword(auth, email, password);
    }

    async function continueAsGuest() {
      if (!auth) throw new Error("Firebase is not configured.");
      await signInAnonymously(auth);
    }

    async function logout() {
      if (auth) await signOut(auth);
    }

    return {
      authLoading,
      createAccount,
      continueAsGuest,
      firebaseReady,
      loginWithEmail,
      loginWithGoogle,
      logout,
      user,
    };
  }, [authLoading, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
