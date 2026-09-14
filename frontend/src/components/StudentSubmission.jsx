import React, { useState, useEffect } from "react";
import FeedbackModal from "./FeedbackModal";
import { api } from "../api/client";
import { displayStatus, formatDate, formatScore } from "../utils/dates";
import EmptyState from "../ui/EmptyState";
import Skeleton from "../ui/Skeleton";
import { Icons } from "../ui/icons";

function StudentSubmission() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const data = await api("/api/submissions");
      setAssignments(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  if (loading) {
    return <div className="student-tab-content active" id="submissions"><Skeleton rows={3} /></div>;
  }
  if (error) {
    return (
      <div className="student-tab-content active" id="submissions">
        <EmptyState title="Could not load submissions" description={error} action={<button type="button" className="ui-btn ui-btn-primary" onClick={fetchAssignments}>{Icons.Retry()} Retry</button>} />
      </div>
    );
  }

  return (
    <>
      <div className="student-tab-content active" id="submissions">
        <div className="student-content-header">
          <h2>My Submissions</h2>
        </div>
        <div className="table-wrapper student-submissions-table-container">
          <table className="student-submissions-table desktop-table">
            <thead>
              <tr>
                <th>Assignment</th>
                <th>Subject</th>
                <th>Submitted Date</th>
                <th>Status</th>
                <th>Score</th>
                <th>Feedback</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {assignments.length > 0 ? (
                assignments.map((assignment) => (
                  <tr key={assignment._id}>
                    <td>{assignment.title}</td>
                    <td>{assignment.subject}</td>
                    <td>{formatDate(assignment.submittedAt)}</td>
                    <td>
                      <span className={`student-status-badge student-status-${assignment.status}`}>
                        {displayStatus(assignment.status)}
                      </span>
                    </td>
                    <td>{assignment.status === "graded" ? formatScore(assignment.score, assignment.maxMarks) : "Not graded"}</td>
                    <td>{assignment.status === "graded" && assignment.feedback ? "Available" : "Pending"}</td>
                    <td>
                      <button
                        type="button"
                        className="student-btn student-btn-secondary student-btn-sm"
                        onClick={() => {
                          setSelectedAssignment(assignment);
                          setIsFeedbackModalOpen(true);
                        }}
                        aria-label={`View submission for ${assignment.title}`}
                        title="View submission"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      </button>
                      {assignment.status === "graded" && assignment.feedback && (
                        <button
                          type="button"
                          className="student-btn student-btn-primary student-btn-sm"
                          onClick={() => {
                            setSelectedAssignment(assignment);
                            setIsFeedbackModalOpen(true);
                          }}
                          aria-label={`View feedback for ${assignment.title}`}
                          title="View feedback"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                          </svg>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7">No submitted or graded assignments found.</td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="submission-cards">
            {assignments.length > 0 ? (
              assignments.map((assignment) => (
                <article key={assignment._id} className="submission-card">
                  <header>
                    <h3>{assignment.title}</h3>
                    <span className={`student-status-badge student-status-${assignment.status}`}>
                      {displayStatus(assignment.status)}
                    </span>
                  </header>
                  <p><strong>Subject:</strong> {assignment.subject}</p>
                  <p><strong>Submitted:</strong> {formatDate(assignment.submittedAt)}</p>
                  <p><strong>Score:</strong> {assignment.status === "graded" ? formatScore(assignment.score, assignment.maxMarks) : "Not graded"}</p>
                  <p><strong>Feedback:</strong> {assignment.status === "graded" && assignment.feedback ? "Available" : "Pending"}</p>
                  <div className="submission-card-actions">
                    <button
                      type="button"
                      className="student-btn student-btn-secondary"
                      onClick={() => {
                        setSelectedAssignment(assignment);
                        setIsFeedbackModalOpen(true);
                      }}
                    >
                      View
                    </button>
                  </div>
                </article>
              ))
            ) : (
              <p>No submitted or graded assignments found.</p>
            )}
          </div>
        </div>
      </div>

      {isFeedbackModalOpen && (
        <FeedbackModal
          assignment={selectedAssignment}
          viewerRole="student"
          onClose={() => {
            setIsFeedbackModalOpen(false);
            setSelectedAssignment(null);
          }}
        />
      )}
    </>
  );
}

export default StudentSubmission;
