import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { api } from "../api";
import { exportEvaluationPdf } from "../pdf";
import { useAuth } from "../context/AuthContext";
import { AppShell } from "../components/AppShell";
import { Rubric } from "../components/Rubric";
import { EmptyState, ErrorState, LoadingState, Modal, StatCard, StatusBadge } from "../components/ui";

const emptyForm = {
  questionTitle: "",
  questionText: "",
  modelAnswer: "",
  maxMarks: 10,
  subject: "programming",
  dueDate: "",
};

export default function TeacherApp() {
  const { user } = useAuth();
  const [tab, setTab] = useState("overview");
  const [items, setItems] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [detail, setDetail] = useState(null);
  const [busyId, setBusyId] = useState("");
  const [subject, setSubject] = useState("");
  const [status, setStatus] = useState("");

  const nav = [
    { id: "overview", label: "Overview", active: tab === "overview", onClick: () => setTab("overview") },
    { id: "questions", label: "Question bank", active: tab === "questions", onClick: () => setTab("questions") },
    { id: "upload", label: "Upload question", active: tab === "upload", onClick: () => setTab("upload") },
    { id: "submissions", label: "Submissions", active: tab === "submissions", onClick: () => setTab("submissions") },
  ];

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [list, stats] = await Promise.all([api.assignments(), api.analytics()]);
      setItems(list);
      setAnalytics(stats);
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

  const submissions = useMemo(
    () =>
      items.filter((item) => item.submittedAnswer).filter((item) => {
        const subjectOk = !subject || item.subject === subject;
        const statusOk = !status || item.status === status;
        return subjectOk && statusOk;
      }),
    [items, subject, status]
  );

  if (!user) return <Navigate to="/login?role=teacher" replace />;
  if (user.role !== "teacher") return <Navigate to="/student" replace />;

  function setField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function saveQuestion(event) {
    event.preventDefault();
    try {
      if (editing) {
        await api.updateAssignment(editing, form);
        setToast("Question updated.");
      } else {
        await api.createAssignment(form);
        setToast("Question uploaded.");
      }
      setForm(emptyForm);
      setEditing(null);
      setTab("questions");
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  function startEdit(item) {
    setEditing(item._id);
    setForm({
      questionTitle: item.title,
      questionText: item.text,
      modelAnswer: item.modelAnswer || "",
      maxMarks: item.maxMarks,
      subject: item.subject,
      dueDate: item.dueDate,
    });
    setTab("upload");
  }

  async function remove(id) {
    if (!window.confirm("Delete this question?")) return;
    await api.deleteAssignment(id);
    setToast("Question deleted.");
    await load();
  }

  async function gradeWithAi(id) {
    setBusyId(id);
    try {
      const result = await api.evaluate(id);
      setToast("AI evaluation saved.");
      setDetail(result.assignment);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId("");
    }
  }

  async function resetDemo() {
    await api.seed();
    setToast("Demo data restored.");
    await load();
  }

  return (
    <AppShell title="Teacher desk" subtitle="Questions, AI grading, and class analytics" nav={nav}>
      {toast ? <div className="app-toast">{toast}</div> : null}
      {error ? <ErrorState message={error} onRetry={load} /> : null}
      {loading ? <LoadingState /> : null}

      {!loading && tab === "overview" ? (
        <div>
          <div className="page-head">
            <div>
              <h2>Class pulse</h2>
              <p className="muted">Live counts from the current question bank, including seeded demo scripts.</p>
            </div>
            <button className="btn btn-ghost" type="button" onClick={resetDemo}>
              Restore demo data
            </button>
          </div>
          <div className="stats-grid">
            <StatCard label="Questions" value={analytics?.totalQuestions ?? 0} />
            <StatCard label="Submitted" value={analytics?.submitted ?? 0} />
            <StatCard label="Graded" value={analytics?.graded ?? 0} />
            <StatCard label="Average" value={`${analytics?.averagePct ?? 0}%`} hint="Across graded scripts" />
          </div>
          <div className="split">
            <section className="panel">
              <h3>Score distribution</h3>
              {(analytics?.distribution || []).map((row) => (
                <div className="bar-row" key={row.label}>
                  <span>{row.label}</span>
                  <div className="bar">
                    <span style={{ width: `${Math.min(100, (row.count / Math.max(analytics.graded || 1, 1)) * 100)}%` }} />
                  </div>
                  <span>{row.count}</span>
                </div>
              ))}
            </section>
            <section className="panel">
              <h3>By subject</h3>
              {(analytics?.subjects || []).map((row) => (
                <div className="list-item" key={row.subject}>
                  <div>
                    <strong style={{ textTransform: "capitalize" }}>{row.subject}</strong>
                    <div className="muted">
                      {row.graded} graded · {row.questions} items
                    </div>
                  </div>
                  <strong>{row.averagePct}%</strong>
                </div>
              ))}
            </section>
          </div>
        </div>
      ) : null}

      {!loading && tab === "questions" ? (
        <div>
          <div className="page-head">
            <div>
              <h2>Question bank</h2>
              <p className="muted">Model answers stay on the teacher side and feed the evaluator.</p>
            </div>
            <button className="btn btn-primary" type="button" onClick={() => setTab("upload")}>
              New question
            </button>
          </div>
          {items.length === 0 ? (
            <EmptyState title="No questions yet" body="Upload a question or restore the demo seed." />
          ) : (
            <div className="card-grid">
              {items.map((item) => (
                <article className="question-card" key={item._id}>
                  <div className="inline">
                    <StatusBadge status={item.status} />
                    <span className="muted" style={{ textTransform: "capitalize" }}>
                      {item.subject} · {item.maxMarks} marks
                    </span>
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                  <div className="muted">Due {item.dueDate}</div>
                  <div className="row-actions">
                    <button className="btn btn-ghost btn-sm" type="button" onClick={() => startEdit(item)}>
                      Edit
                    </button>
                    <button className="btn btn-danger btn-sm" type="button" onClick={() => remove(item._id)}>
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      ) : null}

      {!loading && tab === "upload" ? (
        <form className="form-card" onSubmit={saveQuestion}>
          <h2>{editing ? "Edit question" : "Upload question"}</h2>
          <p className="muted" style={{ marginBottom: "1rem" }}>
            Include a model answer. Students never see it; the grader uses it for coverage and similarity.
          </p>
          <label className="field">
            <span>Title</span>
            <input name="questionTitle" value={form.questionTitle} onChange={setField} required />
          </label>
          <label className="field">
            <span>Question</span>
            <textarea name="questionText" value={form.questionText} onChange={setField} required />
          </label>
          <label className="field">
            <span>Model answer</span>
            <textarea name="modelAnswer" value={form.modelAnswer} onChange={setField} />
          </label>
          <label className="field">
            <span>Subject</span>
            <select name="subject" value={form.subject} onChange={setField}>
              <option value="programming">Programming</option>
              <option value="mathematics">Mathematics</option>
              <option value="science">Science</option>
              <option value="history">History</option>
              <option value="english">English</option>
            </select>
          </label>
          <label className="field">
            <span>Maximum marks</span>
            <input type="number" min="1" max="100" name="maxMarks" value={form.maxMarks} onChange={setField} required />
          </label>
          <label className="field">
            <span>Due date</span>
            <input type="date" name="dueDate" value={form.dueDate} onChange={setField} required />
          </label>
          <div className="form-actions">
            <button
              className="btn btn-ghost"
              type="button"
              onClick={() => {
                setForm(emptyForm);
                setEditing(null);
              }}
            >
              Reset
            </button>
            <button className="btn btn-primary" type="submit">
              {editing ? "Save changes" : "Publish question"}
            </button>
          </div>
        </form>
      ) : null}

      {!loading && tab === "submissions" ? (
        <div>
          <div className="page-head">
            <div>
              <h2>Submissions</h2>
              <p className="muted">Re-run AI grading or export a printable PDF report.</p>
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
                <option value="submitted">Submitted</option>
                <option value="graded">Graded</option>
              </select>
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Question</th>
                  <th>Status</th>
                  <th>Score</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {submissions.length === 0 ? (
                  <tr>
                    <td colSpan="5">No submissions match these filters.</td>
                  </tr>
                ) : (
                  submissions.map((item) => (
                    <tr key={item._id}>
                      <td>{item.studentName || "Alex Kumar"}</td>
                      <td>
                        {item.title}
                        <div className="muted" style={{ textTransform: "capitalize" }}>
                          {item.subject}
                        </div>
                      </td>
                      <td>
                        <StatusBadge status={item.status} />
                      </td>
                      <td>{item.score != null ? `${item.score}/${item.maxMarks}` : "—"}</td>
                      <td>
                        <div className="row-actions">
                          <button className="btn btn-ghost btn-sm" type="button" onClick={() => setDetail(item)}>
                            View
                          </button>
                          <button
                            className="btn btn-soft btn-sm"
                            type="button"
                            disabled={busyId === item._id}
                            onClick={() => gradeWithAi(item._id)}
                          >
                            {busyId === item._id ? "Scoring…" : "AI grade"}
                          </button>
                          {item.status === "graded" ? (
                            <button className="btn btn-ghost btn-sm" type="button" onClick={() => exportEvaluationPdf(item, user.name)}>
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
            <h4>Student answer</h4>
            <p>{detail.submittedAnswer}</p>
          </div>
          {detail.modelAnswer ? (
            <div>
              <h4>Model answer</h4>
              <p className="muted">{detail.modelAnswer}</p>
            </div>
          ) : null}
          <Rubric assignment={detail} />
        </Modal>
      ) : null}
    </AppShell>
  );
}
