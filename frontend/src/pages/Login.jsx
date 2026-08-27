import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const preferred = params.get("role");
  const [email, setEmail] = useState(preferred === "student" ? "student@demo.local" : "teacher@demo.local");
  const [password, setPassword] = useState("demo123");
  const [accounts, setAccounts] = useState([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user?.role === "teacher") navigate("/teacher");
    if (user?.role === "student") navigate("/student");
  }, [user, navigate]);

  useEffect(() => {
    api.demoAccounts().then((data) => setAccounts(data.accounts || [])).catch(() => {});
  }, []);

  async function onSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const next = await login(email, password);
      navigate(next.role === "teacher" ? "/teacher" : "/student");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-page">
      <aside className="auth-aside">
        <Link to="/" className="brand">
          <span className="brand-mark">S</span>
          Subjective AI
        </Link>
        <div>
          <div className="kicker">Demo access</div>
          <h1>A living exam desk, not an empty CRUD app.</h1>
          <p className="muted" style={{ marginTop: "1rem", maxWidth: "36rem" }}>
            Use the seeded teacher or student account. Questions, submissions, and rubric scores are
            already in the store so recruiters can click through immediately.
          </p>
        </div>
        <p className="muted">Passwords are demo-only placeholders, stored in source as sample credentials.</p>
      </aside>
      <div className="auth-panel">
        <form className="auth-card" onSubmit={onSubmit}>
          <div className="kicker">Sign in</div>
          <h2>Choose a demo desk</h2>
          <p className="muted">No sign-up. These two accounts unlock the full product tour.</p>
          <div className="demo-chips">
            {(accounts.length ? accounts : [
              { email: "teacher@demo.local", password: "demo123", role: "teacher", name: "Dr. Meera Iyer" },
              { email: "student@demo.local", password: "demo123", role: "student", name: "Alex Kumar" },
            ]).map((account) => (
              <button
                type="button"
                className="chip"
                key={account.email}
                onClick={() => {
                  setEmail(account.email);
                  setPassword(account.password);
                }}
              >
                {account.role}: {account.email}
              </button>
            ))}
          </div>
          <label className="field">
            <span>Email</span>
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
          </label>
          <label className="field">
            <span>Password</span>
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
          </label>
          {error ? <div className="error-box">{error}</div> : null}
          <button className="btn btn-primary" type="submit" disabled={busy} style={{ width: "100%" }}>
            {busy ? "Signing in…" : "Enter dashboard"}
          </button>
          <p className="muted" style={{ marginTop: "1rem" }}>
            <Link to="/">Back to landing</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
