import React, { useEffect, useRef, useState } from "react";
import AssignmentModal from "./AssignmentModal";
import FeedbackModal from "./FeedbackModal";
import { api } from "../api/client";
import { SUBJECTS } from "../constants";
import { displayStatus, formatDate, formatScore, isExpired } from "../utils/dates";
import { assignmentHasDraft } from "../utils/drafts";
import EmptyState from "../ui/EmptyState";
import Skeleton from "../ui/Skeleton";
import StatusBadge from "../ui/StatusBadge";
import { Icons } from "../ui/icons";
import { useToast } from "../ui/ToastContext";
import { useAuth } from "../auth/AuthContext";

function StudentAvailableAssignments({ focus }) {
  const toast = useToast();
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterSubject, setFilterSubject] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [page, setPage] = useState(1);
  const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [selectedGradedAssignment, setSelectedGradedAssignment] = useState(null);
  const appliedFocusAt = useRef(null);

  const fetchAssignments = async () => {
    try {
      const data = await api("/api/assignments");
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

  useEffect(() => {
    if (!focus?.assignmentId || assignments.length === 0) return;
    if (appliedFocusAt.current === focus.at) return;
    const match = assignments.find((item) => String(item._id) === String(focus.assignmentId));
    if (!match) return;
    appliedFocusAt.current = focus.at;
    setFilterSubject("");
    setFilterStatus("");
    const index = assignments.findIndex((item) => String(item._id) === String(focus.assignmentId));
    if (index >= 0) setPage(Math.floor(index / 6) + 1);
    if (match.status === "pending" && match.canStart) {
      setSelectedAssignment(match);
      setIsSubmissionModalOpen(true);
      setIsFeedbackModalOpen(false);
      return;
    }
    setSelectedGradedAssignment(match);
    setIsFeedbackModalOpen(true);
    setIsSubmissionModalOpen(false);
  }, [focus, assignments]);

  const handleSubmitAnswer = async (assignmentId, answer) => {
    try {
      await api("/api/submissions", {
        method: "POST",
        body: JSON.stringify({ assignmentId, submittedAnswer: answer })
      });
      setIsSubmissionModalOpen(false);
      setSelectedAssignment(null);
      fetchAssignments();
      toast.success("Your answer has been submitted successfully.");
    } catch (err) {
      toast.error(err.message || "An error occurred during submission.");
    }
  };

  const filteredAssignments = assignments.filter((assignment) => {
    const matchesSubject = filterSubject === "" || assignment.subject === filterSubject;
    const matchesStatus = filterStatus === "" || assignment.status === filterStatus;
    return matchesSubject && matchesStatus;
  });

  const pageSize = 6;
  const pageCount = Math.max(1, Math.ceil(filteredAssignments.length / pageSize));
  const paged = filteredAssignments.slice((page - 1) * pageSize, page * pageSize);

  if (loading) return <div className="student-tab-content active" id="assignments"><Skeleton rows={3} /></div>;
  if (error) {
    return (
      <div className="student-tab-content active" id="assignments">
        <EmptyState title="Could not load assignments" description={error} action={<button type="button" className="ui-btn ui-btn-primary" onClick={fetchAssignments}>{Icons.Retry()} Retry</button>} />
      </div>
    );
  }

  return (
    <>
      <div className="student-tab-content active" id="assignments">
        <div className="student-content-header">
          <h2>Available Assignments</h2>
          <div className="student-filter-controls">
            <label htmlFor="studentFilterSubject" className="sr-only">Filter by subject</label>
            <select id="studentFilterSubject" onChange={(e) => { setFilterSubject(e.target.value); setPage(1); }} value={filterSubject}>
              <option value="">All Subjects</option>
              {SUBJECTS.map((subject) => (
                <option key={subject.value} value={subject.value}>{subject.label}</option>
              ))}
            </select>
            <label htmlFor="studentFilterStatus" className="sr-only">Filter by status</label>
            <select id="studentFilterStatus" onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }} value={filterStatus}>
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="submitted">Submitted</option>
              <option value="pending_review">Pending review</option>
              <option value="graded">Graded</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </div>
        <div className="student-assignments-grid">
          {paged.length > 0 ? (
            paged.map((assignment) => {
              const expired = assignment.expired || isExpired(assignment.dueDate);
              const hasDraft = assignmentHasDraft(assignment, user?.id);
              return (
                <div key={assignment._id} className={`student-assignment-card ${assignment.status}`}>
                  <div className="student-assignment-header">
                    <div>
                      <h4 className="student-assignment-title">{assignment.title}</h4>
                      <div className="student-assignment-meta">
                        <span>Subject: {assignment.subject}</span>
                        <span>Max Marks: {assignment.maxMarks}</span>
                        <span>Score: {assignment.status === "graded" ? formatScore(assignment.score, assignment.maxMarks) : "Not graded"}</span>
                      </div>
                    </div>
                    <div className="student-assignment-flags">
                      <StatusBadge status={assignment.status}>{displayStatus(assignment.status)}</StatusBadge>
                      {hasDraft && assignment.status === "pending" && (
                        <span className="ui-live">Draft saved</span>
                      )}
                    </div>
                  </div>
                  <p className="student-assignment-text">{assignment.text}</p>
                  <div className="student-assignment-footer">
                    <span className={`student-due-date ${expired ? "urgent" : ""}`}>
                      Due: {formatDate(assignment.dueDate)}
                      {expired && assignment.status === "expired" ? " (expired)" : ""}
                    </span>
                    <div className="student-assignment-actions">
                      {assignment.status === "pending" && assignment.canStart ? (
                        <button
                          type="button"
                          className="ui-btn ui-btn-primary student-btn student-btn-primary"
                          onClick={() => {
                            setSelectedAssignment(assignment);
                            setIsSubmissionModalOpen(true);
                          }}
                        >
                          {hasDraft ? "Continue" : "Start"}
                        </button>
                      ) : assignment.status === "expired" ? (
                        <button type="button" className="student-btn student-btn-secondary" disabled>
                          Closed
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="student-btn student-btn-secondary"
                          onClick={() => {
                            setSelectedGradedAssignment(assignment);
                            setIsFeedbackModalOpen(true);
                          }}
                        >
                          {assignment.status === "graded" ? "View Feedback" : "View Submission"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <EmptyState title="No assignments found" description="Try another subject or status filter." />
          )}
        </div>
        {pageCount > 1 && (
          <div className="ui-dialog-actions">
            <button type="button" className="ui-btn ui-btn-secondary" disabled={page === 1} onClick={() => setPage((value) => value - 1)}>Previous</button>
            <span className="ui-live">Page {page} of {pageCount}</span>
            <button type="button" className="ui-btn ui-btn-secondary" disabled={page === pageCount} onClick={() => setPage((value) => value + 1)}>Next</button>
          </div>
        )}
      </div>

      {isSubmissionModalOpen && (
        <AssignmentModal
          assignment={selectedAssignment}
          onClose={() => {
            setIsSubmissionModalOpen(false);
            setSelectedAssignment(null);
            fetchAssignments();
          }}
          onSubmit={handleSubmitAnswer}
        />
      )}

      {isFeedbackModalOpen && (
        <FeedbackModal
          assignment={selectedGradedAssignment}
          viewerRole="student"
          onClose={() => {
            setIsFeedbackModalOpen(false);
            setSelectedGradedAssignment(null);
          }}
        />
      )}
    </>
  );
}

export default StudentAvailableAssignments;
