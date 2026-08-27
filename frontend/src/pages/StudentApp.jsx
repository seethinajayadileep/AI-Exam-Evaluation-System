import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { api } from "../api";
import { exportEvaluationPdf } from "../pdf";
import { useAuth } from "../context/AuthContext";
import { AppShell } from "../components/AppShell";
import { Rubric } from "../components/Rubric";
import { EmptyState, ErrorState, LoadingState, Modal, StatCard, StatusBadge } from "../components/ui";

export default function StudentApp() {
  const { user } = useAuth();
  const [tab, setTab] = useState("overview");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [subject, setSubject] = useState("");
  const [status, setStatus] = useState("");
  const [active, setActive] = useState(null);
  const [answer, setAnswer] = useState("");
  const [detail, setDetail] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const nav = [
    { id: "overview", label: "Overview", active: tab === "overview", onClick: () => setTab("overview") },
    { id: "assignments", label: "Assignments", active: tab === "assignments", onClick: () => setTab("assignments") },
    { id: "submissions", label: "My submissions", active: tab === "submissions", onClick: () => setTab("submissions") },
    { id: "progress", label: "Progress", active: tab === "progress", onClick: () => setTab("progress") },
  ];

  async function load() {
    setLoading(true);
    setError("");
    try {
      setItems(await api.assignments());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(""), 3200);
    return () => clearTimeout(timer);
  }, [toast]);

  const stats = useMemo(() => {
    const pending = items.filter((item) => item.status === "pending").length;
    const submitted = items.filter((item) => item.status === "submitted").length;
    const graded = items.filter((item) => item.status === "graded");
    const avg = graded.length
      ? Math.round(
          (graded.reduce((sum, item) => sum + (item.score || 0) / Math.max(item.maxMarks || 1, 1), 0) / graded.length) *
            100
        )
      : 0;
    const bySubject = {};
    graded.forEach((item) => {
      const key = item.subject || "general";
      if (!bySubject[key]) bySubject[key] = { score: 0, max: 0 };
      bySubject[key].score += item.score || 0;
      bySubject[key].max += item.maxMarks || 0;
    });
    return { pending, submitted, graded: graded.length, avg, bySubject };
  }, [items]);

  const visible = items.filter((item) => (!subject || item.subject === subject) && (!status || item.status === status));
  const mine = items.filter((item) => item.submittedAnswer);
  const upcoming = items
    .filter((item) => item.status === "pending")
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 5);

  if (!user) return <Navigate to="/login?role=student" replace />;
  if (user.role !== "student") return <Navigate to="/teacher" replace />;

  async function submit() {
    if (!active) return;
    if (!answer.trim()) {
      setError("Write an answer before submitting.");
      return;
    }
    setSubmitting(true);
    try {
      const result = await api.submitAnswer(active._id, answer);
      setToast("Submitted and graded. Open the rubric to see the breakdown.");
      setActive(null);
      setAnswer("");
      setDetail(result.assignment);
      setTab("submissions");
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppShell title="Student desk" subtitle="Assignments, instant AI feedback, and progress" nav={nav}>
      {toast ? <div className="app-toast">{toast}</div> : null}
      {error ? <ErrorState message={error} onRetry={() => setError("")} /> : null}
      {loading ? <LoadingState /> : null}

      {!loading && tab === "overview" ? (
        <div>
          <div className="page-head">
            <div>
              <h2>Welcome back, {user.name.split(" ")[0]}</h2>
              <p className="muted">Pending work on the left, deadlines on the right.</p>
            </div>
            <button className="btn btn-primary" type="button" onClick={() => setTab("assignments")}>
              View assignments
            </button>
          </div>
          <div className="stats-grid">
            <StatCard label="Pending" value={stats.pending} />
            <StatCard label="Submitted" value={stats.submitted} />
            <StatCard label="Graded" value={stats.graded} />
            <StatCard label="Average" value={`${stats.avg}%`} />
          </div>
          <div className="split">
            <section className="panel">
              <h3>Recent assignments</h3>
              {items.slice(0, 6).map((item) => (
                <div className="list-item" key={item._id}>
                  <div>
                    <strong>{item.title}</strong>
                    <div className="muted">
                      {item.subject} · due {item.dueDate}
                    </div>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
              ))}
            </section>
            <section className="panel">
              <h3>Upcoming deadlines</h3>
              {upcoming.length === 0 ? (
                <EmptyState title="All caught up" body="No pending questions with a future due date." />
              ) : (
                upcoming.map((item) => (
                  <div className="list-item" key={item._id}>
                    <div>
                      <strong>{item.title}</strong>
                      <div className="muted">Due {item.dueDate}</div>
                    </div>
                    <button className="btn btn-soft btn-sm" type="button" onClick={() => setActive(item)}>
                      Start
                    </button>
                  </div>
                ))
              )}
            </section>
          </div>
        </div>
      ) : null}

      {!loading && tab === "assignments" ? (
        <div>
          <div className="page-head">
            <div>
              <h2>Available assignments</h2>
              <p className="muted">Submit a long-form answer to receive an automatic rubric score.</p>
            </div>
            <div className="filters">
              <select value={subject} onChange={(e) => setSubject(e.target.value)}>
                <option value="">All subjects</option>
                <option value="programming">Programming</option>
                <option value="mathematics">Mathematics</option>
                <option value="science">Science</option>
                <option value="history">History</option>
                <option value="english">English</option>
              </select>
              <select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="">All statuses</option>
                <option value="pending">Pending</option>
                <option value="submitted">Submitted</option>
                <option value="graded">Graded</option>
              </select>
            </div>
          </div>
          {visible.length === 0 ? (
            <EmptyState title="Nothing here" body="Try clearing filters or restoring demo data from the teacher desk." />
          ) : (
            <div className="card-grid">
              {visible.map((item) => (
                <article className={`question-card`} key={item._id}>
                  <div className="inline">
                    <StatusBadge status={item.status} />
                    <span className="muted">
                      {item.maxMarks} marks · due {item.dueDate}
                    </span>
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                  <div className="row-actions">
                    {item.status === "pending" ? (
                      <button className="btn btn-primary btn-sm" type="button" onClick={() => setActive(item)}>
                        Start
                      </button>
                    ) : (
                      <button className="btn btn-ghost btn-sm" type="button" onClick={() => setDetail(item)}>
                        View feedback
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      ) : null}

      {!loading && tab === "submissions" ? (
        <div>
          <div className="page-head">
            <h2>My submissions</h2>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Assignment</th>
                  <th>Submitted</th>
                  <th>Status</th>
                  <th>Score</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {mine.length === 0 ? (
                  <tr>
                    <td colSpan="5">You have not submitted any answers yet.</td>
                  </tr>
                ) : (
                  mine.map((item) => (
                    <tr key={item._id}>
                      <td>
                        {item.title}
                        <div className="muted">{item.subject}</div>
                      </td>
                      <td>{item.submittedAt || item.dueDate}</td>
                      <td>
                        <StatusBadge status={item.status} />
                      </td>
                      <td>{item.score != null ? `${item.score}/${item.maxMarks}` : "—"}</td>
                      <td>
                        <div className="row-actions">
                          <button className="btn btn-ghost btn-sm" type="button" onClick={() => setDetail(item)}>
                            Feedback
                          </button>
                          {item.status === "graded" ? (
                            <button className="btn btn-soft btn-sm" type="button" onClick={() => exportEvaluationPdf(item, user.name)}>
                              PDF
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {!loading && tab === "progress" ? (
        <div>
          <div className="page-head">
            <div>
              <h2>Academic progress</h2>
              <p className="muted">Computed only from graded scripts — no dummy trophies.</p>
            </div>
          </div>
          <div className="split">
            <section className="panel">
              <h3>Overall</h3>
              <div className="score-hero">
                <div>Average across graded work</div>
                <strong>{stats.avg}%</strong>
              </div>
            </section>
            <section className="panel">
              <h3>Subject breakdown</h3>
              {Object.keys(stats.bySubject).length === 0 ? (
                <EmptyState title="No graded work yet" body="Submit an assignment to see subject scores." />
              ) : (
                Object.entries(stats.bySubject).map(([key, row]) => {
                  const pct = row.max ? Math.round((row.score / row.max) * 100) : 0;
                  return (
                    <div className="bar-row" key={key}>
                      <span style={{ textTransform: "capitalize" }}>{key}</span>
                      <div className="bar">
                        <span style={{ width: `${pct}%` }} />
                      </div>
                      <span>{pct}%</span>
                    </div>
                  );
                })
              )}
            </section>
          </div>
        </div>
      ) : null}

      {active ? (
        <Modal
          title={active.title}
          onClose={() => setActive(null)}
          footer={
            <>
              <button className="btn btn-ghost" type="button" onClick={() => setActive(null)}>
                Cancel
              </button>
              <button className="btn btn-primary" type="button" onClick={submit} disabled={submitting}>
                {submitting ? "Evaluating…" : "Submit for AI grading"}
              </button>
            </>
          }
        >
          <div className="muted">
            {active.subject} · {active.maxMarks} marks · due {active.dueDate}
          </div>
          <div>
            <h4>Question</h4>
            <p>{active.text}</p>
          </div>
          <label className="field">
            <span>Your answer</span>
            <textarea value={answer} onChange={(e) => setAnswer(e.target.value)} rows="10" placeholder="Write a complete, structured response…" />
          </label>
        </Modal>
      ) : null}

      {detail ? (
        <Modal
          title={detail.title}
          onClose={() => setDetail(null)}
          footer={
            <>
              <button className="btn btn-ghost" type="button" onClick={() => setDetail(null)}>
                Close
              </button>
              <button className="btn btn-primary" type="button" onClick={() => exportEvaluationPdf(detail, user.name)}>
                Export PDF
              </button>
            </>
          }
        >
          <div>
            <h4>Your answer</h4>
            <p>{detail.submittedAnswer}</p>
          </div>
          <Rubric assignment={detail} />
        </Modal>
      ) : null}
    </AppShell>
  );
}
