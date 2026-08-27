import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { IconMoon, IconSun } from "../components/ui";
import { api } from "../api";

export default function Landing() {
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const [health, setHealth] = useState(null);

  useEffect(() => {
    api.health().then(setHealth).catch(() => setHealth({ ok: false }));
  }, []);

  return (
    <div className="landing">
      <header className="nav">
        <Link to="/" className="brand">
          <span className="brand-mark">S</span>
          Subjective AI
        </Link>
        <div className="nav-actions">
          <button className="icon-btn" type="button" onClick={toggle} aria-label="Toggle theme">
            {theme === "dark" ? <IconSun /> : <IconMoon />}
          </button>
          <Link className="btn btn-ghost" to="/login">
            Sign in
          </Link>
          <Link className="btn btn-primary" to="/login?role=teacher">
            Open demo
          </Link>
        </div>
      </header>

      <section className="hero">
        <div className="kicker">AI-based subjective exam evaluation</div>
        <h1>Grade long-form answers with a fair, explainable score.</h1>
        <p className="lede">
          Teachers upload questions and model answers. Students submit descriptive responses.
          The system scores them with keyword coverage, semantic similarity, grammar checks, and
          optional Gemini feedback — then returns a rubric the student can actually learn from.
        </p>
        <div className="role-grid">
          <article className="role-card">
            <div className="kicker">Teachers</div>
            <h3>Build the paper. Review the class.</h3>
            <p>
              Upload items with model answers, inspect AI rubric scores, override a grade, and
              export a PDF report. Analytics show averages, subject splits, and score bands.
            </p>
            <button className="btn btn-primary" type="button" onClick={() => navigate("/login?role=teacher")}>
              Continue as teacher
            </button>
          </article>
          <article className="role-card">
            <div className="kicker">Students</div>
            <h3>Write. Submit. See why you lost marks.</h3>
            <p>
              Open a pending question, write a long-form answer, and get an instant breakdown:
              content coverage, similarity to the model answer, grammar, missing points.
            </p>
            <button className="btn btn-soft" type="button" onClick={() => navigate("/login?role=student")}>
              Continue as student
            </button>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div className="kicker">How it works</div>
          <h2>Three steps from question bank to feedback.</h2>
        </div>
        <div className="steps">
          <div className="step">
            <span>01</span>
            <h3>Author</h3>
            <p className="muted">Add a question, model answer, subject, marks, and due date.</p>
          </div>
          <div className="step">
            <span>02</span>
            <h3>Evaluate</h3>
            <p className="muted">NLP heuristics always run. Gemini is used when an API key is configured.</p>
          </div>
          <div className="step">
            <span>03</span>
            <h3>Review</h3>
            <p className="muted">Dashboards, rubric cards, and a print-to-PDF evaluation report.</p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div className="kicker">Why it exists</div>
          <h2>Consistent grading for descriptive exams.</h2>
        </div>
        <div className="feature-grid">
          <article className="feature-card">
            <h3>Rubric, not a black box</h3>
            <p className="muted">Content, semantic overlap, and language each carry a visible share of the mark.</p>
          </article>
          <article className="feature-card">
            <h3>Works without a filled database</h3>
            <p className="muted">In-memory demo seed data ships with graded, submitted, and pending items.</p>
          </article>
          <article className="feature-card">
            <h3>Teacher analytics</h3>
            <p className="muted">Class average, pending grading queue, and score distribution by band.</p>
          </article>
        </div>
        {health ? (
          <p className="muted" style={{ marginTop: "1.2rem" }}>
            API {health.ok ? "reachable" : "offline"} · store {health.mode || "unknown"} · Gemini{" "}
            {health.gemini ? "configured" : "heuristic fallback"}
          </p>
        ) : null}
      </section>

      <footer className="footer">
        <span>Subjective AI · exam evaluation</span>
        <span>Demo logins on the sign-in page · no production secrets committed</span>
      </footer>
    </div>
  );
}
