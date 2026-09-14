import React, { useEffect, useRef, useState } from "react";
import FeedbackModal from "./FeedbackModal";
import TeacherGradingModal from "./TeacherGradingModal";
import { api } from "../api/client";
import { SUBJECTS } from "../constants";
import { displayStatus, formatDate, reviewScoreLabel } from "../utils/dates";
import ResponsiveTable from "../ui/ResponsiveTable";
import StatusBadge from "../ui/StatusBadge";
import EmptyState from "../ui/EmptyState";
import Skeleton from "../ui/Skeleton";
import { Icons } from "../ui/icons";
import { useToast } from "../ui/ToastContext";

function TeacherSubmissionButton({ onIndexChange, focus }) {
  const toast = useToast();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterSubject, setFilterSubject] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isGradingModalOpen, setIsGradingModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const appliedFocusAt = useRef(null);

  const fetchAssignments = async () => {
    try {
      const data = await api("/api/submissions");
      setAssignments(data);
      setError(null);
      onIndexChange?.({
        searchItems: [
          ...data.map((item) => ({
            label: item.title,
            group: "Assignment",
            tab: "dashboard",
            assignmentId: item.assignmentId
          })),
          ...data.map((item) => ({
            label: item.studentName,
            group: "Student",
            tab: "submission",
            submissionId: item._id
          })),
          ...data.map((item) => ({
            label: item.subject,
            group: "Subject",
            tab: "dashboard",
            assignmentId: item.assignmentId
          }))
        ],
        notifications: data.filter((item) => item.status === "pending_review").map((item) => ({
          id: item._id,
          label: `${item.studentName} needs review: ${item.title}`,
          tab: "submission",
          submissionId: item._id
        }))
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!focus?.submissionId || assignments.length === 0) return;
    if (appliedFocusAt.current === focus.at) return;
    const match = assignments.find((item) => String(item._id) === String(focus.submissionId));
    if (!match) return;
    appliedFocusAt.current = focus.at;
    setSelectedAssignment(match);
    if (match.status === "graded") {
      setIsFeedbackModalOpen(true);
      setIsGradingModalOpen(false);
    } else {
      setIsGradingModalOpen(true);
      setIsFeedbackModalOpen(false);
    }
  }, [focus, assignments]);

  const handleGradeSubmit = async (assignmentId, score, feedback, action) => {
    try {
      await api(`/api/submissions/${assignmentId}/grade`, {
        method: "PUT",
        body: JSON.stringify({ score, feedback, action })
      });
      setIsGradingModalOpen(false);
      setSelectedAssignment(null);
      toast.success("Grade saved.");
      fetchAssignments();
    } catch (err) {
      toast.error(err.message || "Failed to submit grade.");
    }
  };

  const filteredSubmissions = assignments.filter((submission) => {
    const matchesSubject = filterSubject === "" || submission.subject === filterSubject;
    const matchesStatus = filterStatus === "" || submission.status === filterStatus;
    return matchesSubject && matchesStatus;
  });

  const approvalCount = assignments.filter((item) => item.status === "pending_review").length;

  if (loading) {
    return <div className="teacher-ai-tab-content" id="submissions"><Skeleton rows={4} /></div>;
  }

  if (error) {
    return (
      <div className="teacher-ai-tab-content" id="submissions">
        <EmptyState title="Could not load submissions" description={error} action={<button type="button" className="ui-btn ui-btn-primary" onClick={fetchAssignments}>{Icons.Retry()} Retry</button>} />
      </div>
    );
  }

  return (
    <>
      <div className="teacher-ai-tab-content" id="submissions">
        <div className="ui-page-header">
          <h2>Student Submissions</h2>
          <div className="teacher-ai-filter-controls">
            <label htmlFor="filterSubject" className="sr-only">Filter by subject</label>
            <select id="filterSubject" onChange={(e) => setFilterSubject(e.target.value)} value={filterSubject}>
              <option value="">All Subjects</option>
              {SUBJECTS.map((subject) => (
                <option key={subject.value} value={subject.value}>{subject.label}</option>
              ))}
            </select>
            <label htmlFor="filterStatus" className="sr-only">Filter by status</label>
            <select id="filterStatus" onChange={(e) => setFilterStatus(e.target.value)} value={filterStatus}>
              <option value="">All Status</option>
              <option value="submitted">Submitted</option>
              <option value="pending_review">Pending review</option>
              <option value="graded">Graded</option>
            </select>
          </div>
        </div>

        {approvalCount > 0 && (
          <div className="teacher-approval-banner">
            {approvalCount} submission{approvalCount === 1 ? "" : "s"} in the AI approval queue.
            <button type="button" className="teacher-ai-btn teacher-ai-btn-secondary" onClick={() => setFilterStatus("pending_review")}>
              Show queue
            </button>
          </div>
        )}

        <ResponsiveTable
          empty="No submissions found matching the criteria."
          columns={[
            { key: "student", header: "Student Name" },
            { key: "title", header: "Question" },
            { key: "subject", header: "Subject" },
            { key: "submitted", header: "Submitted" },
            { key: "status", header: "Status" },
            { key: "score", header: "Score" },
            { key: "actions", header: "Actions" }
          ]}
          rows={filteredSubmissions.map((submission) => {
            const actions = (
              <div className="submission-card-actions">
                <button
                  type="button"
                  className="ui-btn ui-btn-secondary"
                  onClick={() => {
                    setSelectedAssignment(submission);
                    setIsFeedbackModalOpen(true);
                  }}
                  aria-label={`View ${submission.studentName}'s submission for ${submission.title}`}
                >
                  View
                </button>
                {submission.status !== "graded" && (
                  <button
                    type="button"
                    className="ui-btn ui-btn-primary"
                    onClick={() => {
                      setSelectedAssignment(submission);
                      setIsGradingModalOpen(true);
                    }}
                    aria-label={`Grade ${submission.studentName}'s submission for ${submission.title}`}
                  >
                    Grade
                  </button>
                )}
              </div>
            );
            return {
              id: submission._id,
              cells: {
                student: submission.studentName,
                title: submission.title,
                subject: submission.subject,
                submitted: formatDate(submission.submittedAt),
                status: <StatusBadge status={submission.status}>{displayStatus(submission.status)}</StatusBadge>,
                score: reviewScoreLabel(submission),
                actions
              },
              card: (
                <>
                  <header>
                    <h3>{submission.title}</h3>
                    <StatusBadge status={submission.status} />
                  </header>
                  <p><strong>Student:</strong> {submission.studentName}</p>
                  <p><strong>Subject:</strong> {submission.subject}</p>
                  <p><strong>Submitted:</strong> {formatDate(submission.submittedAt)}</p>
                  <p><strong>Score:</strong> {reviewScoreLabel(submission)}</p>
                  {actions}
                </>
              )
            };
          })}
        />
      </div>

      {isFeedbackModalOpen && (
        <FeedbackModal
          assignment={selectedAssignment}
          viewerRole="teacher"
          onClose={() => {
            setIsFeedbackModalOpen(false);
            setSelectedAssignment(null);
          }}
        />
      )}

      {isGradingModalOpen && (
        <TeacherGradingModal
          assignment={selectedAssignment}
          onClose={() => {
            setIsGradingModalOpen(false);
            setSelectedAssignment(null);
          }}
          onGrade={handleGradeSubmit}
        />
      )}
    </>
  );
}

export default TeacherSubmissionButton;
