import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../providers/AuthProvider.jsx";

export function AuthPanel({ onUseLocal }) {
  const {
    authLoading,
    continueAsGuest,
    createAccount,
    firebaseReady,
    loginWithEmail,
    loginWithGoogle,
    user,
  } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  if (authLoading || user) return null;

  async function submit(mode) {
    setError("");
    try {
      if (mode === "google") await loginWithGoogle();
      if (mode === "guest") await continueAsGuest();
      if (mode === "login") await loginWithEmail(email, password);
      if (mode === "create") await createAccount(email, password);
    } catch (err) {
      setError(err.message || "Unable to sign in.");
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink-900/45 p-4 backdrop-blur-sm">
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-2xl border border-ink-900/10 bg-paper-100 p-5 shadow-lifted"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-500">StudyPath cloud</p>
        <h1 className="mt-2 font-serif text-3xl text-ink-900">Sign in to sync progress</h1>
        <p className="mt-2 text-sm leading-6 text-ink-600">
          Your study plan is saved locally first. Sign in to sync subjects, notes, checklists, and timer progress across devices.
        </p>

        {!firebaseReady && (
          <div className="mt-4 rounded-lg border border-amber-500/25 bg-amber-500/10 p-3 text-sm text-ink-700">
            Firebase environment variables are missing. Add `.env.local` before using cloud sync.
          </div>
        )}

        <div className="mt-5 grid gap-3">
          <input
            className="rounded-lg border border-ink-900/10 bg-white/60 px-3 py-3 text-sm outline-none focus:border-amber-500"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <input
            className="rounded-lg border border-ink-900/10 bg-white/60 px-3 py-3 text-sm outline-none focus:border-amber-500"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>

        {error && <p className="mt-3 text-sm text-red-700">{error}</p>}

        <div className="mt-5 grid gap-2">
          <button className="btn-primary" disabled={!firebaseReady} onClick={() => submit("google")}>
            Continue with Google
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button className="btn-secondary" disabled={!firebaseReady} onClick={() => submit("login")}>
              Sign in
            </button>
            <button className="btn-secondary" disabled={!firebaseReady} onClick={() => submit("create")}>
              Create account
            </button>
          </div>
          <button className="btn-ghost" disabled={!firebaseReady} onClick={() => submit("guest")}>
            Continue as guest
          </button>
          <button className="btn-ghost" onClick={onUseLocal}>
            Use this device only
          </button>
        </div>
      </motion.section>
    </div>
  );
}
