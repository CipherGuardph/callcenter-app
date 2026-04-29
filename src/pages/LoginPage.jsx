import { useState } from "react";
import { Navigate, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function LoginPage() {
  const { currentUser, firebaseReady, login, signUp } = useAuth();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const destination = searchParams.get("redirect") || location.state?.from?.pathname || "/dashboard";

  if (currentUser) return <Navigate to={destination} replace />;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "signup") {
        await signUp(form);
      } else {
        await login(form);
      }
      navigate(destination, { replace: true });
    } catch (authError) {
      setError(getAuthMessage(authError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-page">
      <div className="auth-copy">
        <span className="eyebrow">Beginner friendly</span>
        <h1>Practice BPO interviews with your voice.</h1>
        <p>Answer common call center questions, record yourself, and compare with simple sample answers made for first-time applicants.</p>
      </div>
      <form className="auth-card" onSubmit={handleSubmit}>
        <div className="segmented-control" aria-label="Authentication mode">
          <button className={mode === "login" ? "active" : ""} onClick={() => setMode("login")} type="button">
            Log in
          </button>
          <button className={mode === "signup" ? "active" : ""} onClick={() => setMode("signup")} type="button">
            Sign up
          </button>
        </div>
        {!firebaseReady ? (
          <p className="warning-text">Firebase is not configured yet. Add values from .env.example to .env.local.</p>
        ) : null}
        {mode === "signup" ? (
          <label>
            Full name
            <input
              autoComplete="name"
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              minLength={2}
              required
            />
          </label>
        ) : null}
        <label>
          Email
          <input
            autoComplete="email"
            type="email"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            required
          />
        </label>
        <label>
          Password
          <input
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            type="password"
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            minLength={6}
            required
          />
        </label>
        {error ? <p className="error-text">{error}</p> : null}
        <button className="primary-button full-width" disabled={loading || !firebaseReady} type="submit">
          {loading ? "Please wait..." : mode === "login" ? "Log in" : "Create account"}
        </button>
      </form>
    </section>
  );
}

function getAuthMessage(error) {
  if (error?.code === "auth/configuration-not-found") {
    return "Firebase Authentication is not enabled yet for this project. In Firebase Console, open Authentication, click Get started, then enable Email/Password sign-in.";
  }
  if (error?.code === "auth/invalid-credential") return "Email or password is incorrect.";
  if (error?.code === "auth/email-already-in-use") return "This email already has an account.";
  if (error?.code === "auth/weak-password") return "Use at least 6 characters for your password.";
  return error?.message || "Something went wrong. Please try again.";
}
