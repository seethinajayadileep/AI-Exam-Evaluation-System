import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { DEMO_ACCOUNTS, SHOW_DEMO_LOGIN } from "../constants";
import "./Login.css";

function dashboardPath(role) {
  return role === "teacher" ? "/TeacherDashBoard" : "/StudentDashBoard";
}

function Login() {
  const { user, ready, login, logout } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const role = params.get("role") === "teacher" ? "teacher" : "student";
  const demo = DEMO_ACCOUNTS[role];
  const otherSession = Boolean(user && user.role !== role);

  const [email, setEmail] = useState(SHOW_DEMO_LOGIN ? demo.email : "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (SHOW_DEMO_LOGIN) {
      setEmail(demo.email);
      setPassword("");
    }
  }, [demo.email]);

  useEffect(() => {
    if (!ready || !user || user.role !== role) return;
    navigate(dashboardPath(user.role), { replace: true });
  }, [ready, user, role, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const signedIn = await login(email.trim(), password, role);
      navigate(dashboardPath(signedIn.role), { replace: true });
    } catch (err) {
      setError(err.message || "Login failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <p className="login-kicker">AI Subjective Exam Evaluator</p>
        <h1>{role === "teacher" ? "Teacher sign in" : "Student sign in"}</h1>
        <p className="login-copy">
          This local build uses hashed passwords, JWT sessions, and server-side role checks.
          Demo credentials below are for local exploration only and must not be used in production.
        </p>
        {otherSession && (
          <p className="login-session-warning" role="status">
            You are signed in as {user.name} ({user.role}). Signing in here replaces that session.
            {" "}
            <button type="button" className="login-inline-action" onClick={logout}>
              Log out instead
            </button>
          </p>
        )}
        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
          <div className="login-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>
          {error && <p className="login-error" role="alert">{error}</p>}
          <button type="submit" className="login-submit" disabled={submitting}>
            {submitting ? "Signing in…" : otherSession ? "Replace session and sign in" : "Sign in"}
          </button>
        </form>
        {SHOW_DEMO_LOGIN && (
          <div className="login-demo">
            <p><strong>Local demo {role} only:</strong> {demo.email}</p>
            <p>Password: {demo.password}</p>
            <button
              type="button"
              className="login-fill"
              onClick={() => {
                setEmail(demo.email);
                setPassword(demo.password);
              }}
            >
              Fill demo credentials
            </button>
          </div>
        )}
        <p className="login-switch">
          {role === "teacher" ? (
            <Link to="/login?role=student">Sign in as a student instead</Link>
          ) : (
            <Link to="/login?role=teacher">Sign in as a teacher instead</Link>
          )}
          <span> · </span>
          <Link to="/">Back to home</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
