import React, { useCallback, useState, useEffect } from "react";
import "./TeacherGradingModal.css";
import { formatScore } from "../utils/dates";
import { api } from "../api/client";
import { extractEvidence } from "../utils/evidence";
import RubricCriterionCard from "../ui/RubricCriterionCard";
import { Icons } from "../ui/icons";
import { useEscape } from "../ui/useEscape";

function TeacherGradingModal({ assignment, onClose, onGrade }) {
  const [current, setCurrent] = useState(assignment);
  const [score, setScore] = useState(assignment?.score ?? "");
  const [feedback, setFeedback] = useState(assignment?.feedback || "");
  const [overrideReason, setOverrideReason] = useState("");
  const [evaluating, setEvaluating] = useState(false);
  const [error, setError] = useState("");
  const [showAudit, setShowAudit] = useState(false);
  const [manualMode, setManualMode] = useState(false);

  useEffect(() => {
    setCurrent(assignment);
    setScore(assignment?.score ?? "");
    setFeedback(assignment?.feedback || "");
  }, [assignment]);

  const handleClose = useCallback(() => onClose?.(), [onClose]);
  useEscape(Boolean(current), handleClose);

  if (!current) return null;

  const evaluation = current.aiEvaluation;
  const log = current.evaluationLog || [];
  const aiScore = evaluation?.score;
  const scoreChanged = aiScore !== undefined && aiScore !== null && String(score) !== String(aiScore);

  const applyEvaluation = (submission) => {
    setCurrent(submission);
    if (submission.score !== null && submission.score !== undefined) setScore(submission.score);
    if (submission.feedback) setFeedback(submission.feedback);
  };

  const handleEvaluate = async () => {
    setEvaluating(true);
    setError("");
    try {
      const result = await api(`/api/submissions/${current._id}/evaluate`, { method: "POST" });
      applyEvaluation(result.submission);
    } catch (err) {
      setError(err.message || "AI evaluation failed.");
    } finally {
      setEvaluating(false);
    }
  };

  const handleGradeSubmit = (action) => {
    if (score === "" || feedback.trim() === "") {
      setError("Please enter a score and feedback.");
      return;
    }
    if (scoreChanged && !overrideReason.trim()) {
      setError("Add a reason when you change the AI suggested score.");
      setManualMode(true);
      return;
    }
    const finalFeedback = scoreChanged
      ? `${feedback.trim()}\n\nTeacher override reason: ${overrideReason.trim()}`
      : feedback;
    onGrade(current._id, parseInt(score, 10), finalFeedback, action);
  };

  return (
    <div className="ui-dialog-overlay today-teacher-modal-overlay" onClick={handleClose}>
      <div
        className="ui-dialog ui-dialog-wide today-teacher-modal-content"
        role="dialog"
        aria-modal="true"
        aria-labelledby="grade-dialog-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="ui-dialog-header today-teacher-modal-header">
          <div>
            <h2 id="grade-dialog-title">Grade: {current.title}</h2>
            <p className="ui-live">{current.studentName} · {current.subject}</p>
          </div>
          <button type="button" className="ui-icon-btn today-teacher-modal-close" onClick={handleClose} aria-label="Close grading dialog">
            {Icons.Close()}
          </button>
        </div>
        <div className="today-teacher-modal-body">
          <div className="ui-compare">
            <section className="ui-card">
              <h4>Student answer</h4>
              <p className="today-teacher-submission-text">{current.submittedAnswer}</p>
            </section>
            {current.modelAnswer && (
              <section className="ui-card">
                <h4>Model answer</h4>
                <p className="today-teacher-submission-text">{current.modelAnswer}</p>
              </section>
            )}
          </div>

          {current.rubric?.length > 0 && (
            <div className="ui-stack" style={{ marginTop: 16 }}>
              {(evaluation?.criteria?.length ? evaluation.criteria : current.rubric).map((item, index) => (
                <RubricCriterionCard
                  key={`${item.criterion}-${index}`}
                  criterion={item.criterion}
                  score={item.score}
                  maxMarks={item.maxMarks}
                  comment={item.comment || item.description}
                  evidence={extractEvidence(current.submittedAnswer, item.comment || item.description)}
                />
              ))}
            </div>
          )}

          <div className="teacher-ai-eval-actions">
            <button type="button" className="ui-btn ui-btn-secondary" onClick={handleEvaluate} disabled={evaluating}>
              {evaluating ? "Evaluating…" : "Evaluate with AI"}
            </button>
            <button type="button" className="ui-btn ui-btn-ghost" onClick={() => setShowAudit((value) => !value)}>
              {showAudit ? "Hide audit trail" : "View audit trail"}
            </button>
          </div>
          <div className="ui-live" aria-live="polite">{evaluating ? "Running AI evaluation." : error}</div>
          {error && <p className="login-error" role="alert">{error}</p>}

          <div className="ui-score-strip">
            <div className="ui-score-box">
              <span>AI suggested score</span>
              <strong>{evaluation ? formatScore(evaluation.score, current.maxMarks) : "Not run"}</strong>
            </div>
            <div className="ui-score-box">
              <span>AI confidence</span>
              <strong>{evaluation?.confidence != null ? `${Math.round(evaluation.confidence * 100)}%` : "—"}</strong>
            </div>
            <div className="ui-score-box">
              <span>Teacher-adjusted score</span>
              <strong>{score === "" ? "—" : formatScore(score, current.maxMarks)}</strong>
            </div>
            <div className="ui-score-box">
              <span>Final approved grade</span>
              <strong>{current.status === "graded" ? formatScore(current.score, current.maxMarks) : "Pending approval"}</strong>
            </div>
          </div>

          {evaluation?.feedback && <p className="today-teacher-submission-text">{evaluation.feedback}</p>}

          {showAudit && (
            <div className="teacher-audit-trail">
              <h4>Evaluation audit trail</h4>
              {log.length === 0 ? (
                <p>No evaluation events yet.</p>
              ) : (
                <ol>
                  {log.map((entry, index) => (
                    <li key={index}>
                      {entry.timestamp}: {entry.actorName} — {entry.action}
                      {entry.details?.score !== undefined ? ` (score ${entry.details.score})` : ""}
                    </li>
                  ))}
                </ol>
              )}
            </div>
          )}

          <div className="today-teacher-grading-form">
            <div className="ui-field">
              <label htmlFor="score">Score ({current.maxMarks} max)</label>
              <input
                type="number"
                id="score"
                value={score}
                onChange={(e) => {
                  setScore(e.target.value);
                  setManualMode(true);
                }}
                min="0"
                max={current.maxMarks}
                required
              />
            </div>
            <div className="ui-field">
              <label htmlFor="feedback">Feedback</label>
              <textarea id="feedback" value={feedback} onChange={(e) => setFeedback(e.target.value)} rows="6" required />
            </div>
            {(manualMode || scoreChanged) && (
              <div className="ui-field">
                <label htmlFor="overrideReason">Reason for changing the AI score</label>
                <textarea
                  id="overrideReason"
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  rows="3"
                  required={scoreChanged}
                />
              </div>
            )}
          </div>
        </div>
        <div className="ui-dialog-actions today-teacher-modal-footer">
          <button type="button" className="ui-btn ui-btn-secondary" onClick={handleClose}>Cancel</button>
          <button type="button" className="ui-btn ui-btn-ghost" onClick={() => setManualMode(true)}>
            Manual override
          </button>
          {current.status === "pending_review" && (
            <button type="button" className="ui-btn ui-btn-primary" onClick={() => handleGradeSubmit("approve")}>
              Approve AI grade
            </button>
          )}
          <button type="button" className="ui-btn ui-btn-secondary" onClick={() => handleGradeSubmit("teacher_grade")}>
            Submit grade
          </button>
        </div>
      </div>
    </div>
  );
}

export default TeacherGradingModal;
