import React, { useCallback, useState } from "react";
import "./StudentMyFeedbackModal.css";
import { formatScore, displayStatus } from "../utils/dates";
import RubricCriterionCard from "../ui/RubricCriterionCard";
import RequestRegrade from "./RequestRegrade";
import { Icons } from "../ui/icons";
import { useEscape } from "../ui/useEscape";

function FeedbackModal({ assignment, onClose, viewerRole = "student" }) {
  const [regradeOpen, setRegradeOpen] = useState(false);
  const handleClose = useCallback(() => onClose?.(), [onClose]);
  useEscape(Boolean(assignment), handleClose);

  if (!assignment) return null;

  const { title, subject, score, maxMarks, submittedAnswer, feedback, aiEvaluation, status, studentName, hideRubricFromStudents } = assignment;
  const answerLabel = viewerRole === "teacher" ? "Submitted answer" : "Your submitted answer";
  const showRubric = Boolean(aiEvaluation?.criteria?.length) && (
    viewerRole === "teacher" || (status === "graded" && !hideRubricFromStudents)
  );

  return (
    <div className="ui-dialog-overlay student-my-feedback-modal-overlay" onClick={handleClose}>
      <div
        className="ui-dialog student-my-feedback-modal-content"
        role="dialog"
        aria-modal="true"
        aria-labelledby="feedback-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="ui-dialog-header student-my-feedback-modal-header">
          <h2 id="feedback-title">{title}</h2>
          <button type="button" className="ui-icon-btn student-my-feedback-modal-close" onClick={handleClose} aria-label="Close feedback dialog">
            {Icons.Close()}
          </button>
        </div>
        <div className="student-my-feedback-modal-body">
          <div className="ui-score-strip">
            <div className="ui-score-box">
              <span>Score</span>
              <strong>{status === "graded" ? formatScore(score, maxMarks) : "Not graded"}</strong>
            </div>
            <div className="ui-score-box">
              <span>AI confidence</span>
              <strong>
                {aiEvaluation?.confidence != null && (viewerRole === "teacher" || (status === "graded" && !hideRubricFromStudents))
                  ? `${Math.round(aiEvaluation.confidence * 100)}%`
                  : "—"}
              </strong>
            </div>
            <div className="ui-score-box">
              <span>Status</span>
              <strong>{displayStatus(status)}</strong>
            </div>
            <div className="ui-score-box">
              <span>Subject</span>
              <strong>{subject}</strong>
            </div>
          </div>
          {viewerRole === "teacher" && studentName && <p className="ui-live">Student: {studentName}</p>}
          <div className="student-my-feedback-student-answer">
            <h4>{answerLabel}</h4>
            <p>{submittedAnswer}</p>
          </div>
          {showRubric && (
            <div className="ui-stack">
              <h4>Rubric breakdown</h4>
              {aiEvaluation.criteria.map((item, index) => (
                <RubricCriterionCard
                  key={`${item.criterion}-${index}`}
                  criterion={item.criterion}
                  score={item.score}
                  maxMarks={item.maxMarks}
                  comment={item.comment}
                  tone={item.maxMarks && item.score / item.maxMarks >= 0.8 ? "success" : "warning"}
                />
              ))}
            </div>
          )}
          {viewerRole === "student" && status === "graded" && hideRubricFromStudents && (
            <p>Your teacher hid the criterion-level breakdown for this assignment.</p>
          )}
          <div className="student-my-feedback-evaluation">
            <h4>{status === "graded" ? "Overall feedback" : "Evaluation"}</h4>
            <p>{status === "graded" ? (feedback || "No feedback yet.") : "Not graded yet."}</p>
          </div>
          {viewerRole === "student" && status === "graded" && (
            regradeOpen ? (
              <RequestRegrade assignment={assignment} onClose={() => setRegradeOpen(false)} />
            ) : (
              <button type="button" className="ui-btn ui-btn-secondary" onClick={() => setRegradeOpen(true)}>
                Request regrade
              </button>
            )
          )}
        </div>
        <div className="ui-dialog-actions student-my-feedback-modal-footer">
          <button type="button" className="ui-btn ui-btn-primary" onClick={handleClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

export default FeedbackModal;
