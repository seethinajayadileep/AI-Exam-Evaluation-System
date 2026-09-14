import React, { useEffect, useRef, useState } from "react";
import TeacherEditModal from "./TeacherEditModal";
import { api } from "../api/client";
import { assignmentCardStatus, daysUntilDue, isExpired, reviewScoreLabel } from "../utils/dates";
import MetricCard from "../ui/MetricCard";
import AssignmentCard from "../ui/AssignmentCard";
import EmptyState from "../ui/EmptyState";
import Skeleton from "../ui/Skeleton";
import ConfirmDialog from "../ui/ConfirmDialog";
import { Icons } from "../ui/icons";
import { useToast } from "../ui/ToastContext";

function TeacherDashBoardQuestion({ onNavigate, onIndexChange, focus }) {
  const toast = useToast();
  const [questions, setQuestions] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [showAllAssignments, setShowAllAssignments] = useState(false);
  const appliedFocusAt = useRef(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [assignmentData, submissionData] = await Promise.all([
        api("/api/assignments"),
        api("/api/submissions")
      ]);
      setQuestions(assignmentData);
      setSubmissions(submissionData);
      setError(null);
      onIndexChange?.({
        searchItems: [
          ...assignmentData.map((item) => ({
            label: item.title,
            group: "Assignment",
            tab: "dashboard",
            assignmentId: item._id
          })),
          ...assignmentData.map((item) => ({
            label: item.subject,
            group: "Subject",
            tab: "dashboard",
            assignmentId: item._id
          })),
          ...submissionData.map((item) => ({
            label: item.studentName,
            group: "Student",
            tab: "submission",
            submissionId: item._id
          }))
        ],
        notifications: [
          ...submissionData.filter((item) => item.status === "pending_review").map((item) => ({
            id: item._id,
            label: `${item.studentName} needs review: ${item.title}`,
            tab: "submission",
            submissionId: item._id
          }))
        ]
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!focus?.assignmentId || questions.length === 0) return;
    if (appliedFocusAt.current === focus.at) return;
    const question = questions.find((item) => String(item._id) === String(focus.assignmentId));
    if (!question) return;
    appliedFocusAt.current = focus.at;
    const index = questions.findIndex((item) => String(item._id) === String(focus.assignmentId));
    if (index >= 6) setShowAllAssignments(true);
    setSelectedQuestion(question);
    setIsEditModalOpen(true);
  }, [focus, questions]);

  useEffect(() => {
    if (!focus?.assignmentId) return;
    const node = document.getElementById(`assignment-${focus.assignmentId}`);
    node?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [focus, showAllAssignments, questions]);

  const totalQuestions = questions.length;
  const totalSubmissions = submissions.length || questions.reduce((sum, q) => sum + (q.submissions || 0), 0);
  const awaitingReview = submissions.filter((item) => item.status === "pending_review" || item.status === "submitted").length;
  const gradedSubmissions = submissions.filter((item) => item.status === "graded").length;
  const gradedPercent = totalSubmissions ? Math.round((gradedSubmissions / totalSubmissions) * 100) : 0;

  const handleSaveEdit = async (questionId, updatedData) => {
    try {
      await api(`/api/assignments/${questionId}`, {
        method: "PUT",
        body: JSON.stringify(updatedData)
      });
      setIsEditModalOpen(false);
      setSelectedQuestion(null);
      toast.success("Assignment updated.");
      fetchData();
    } catch (err) {
      toast.error(err.message || "Failed to save changes.");
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await api(`/api/assignments/${pendingDelete._id}`, { method: "DELETE" });
      toast.success("Assignment deleted.");
      setPendingDelete(null);
      fetchData();
    } catch (err) {
      toast.error(err.message || "Failed to delete question.");
    }
  };

  if (loading) {
    return (
      <div className="teacher-ai-tab-content active" id="dashboard">
        <Skeleton rows={4} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="teacher-ai-tab-content active" id="dashboard">
        <EmptyState
          title="Could not load the dashboard"
          description={error}
          action={<button type="button" className="ui-btn ui-btn-primary" onClick={fetchData}>{Icons.Retry()} Retry</button>}
        />
      </div>
    );
  }

  const reviewQueue = submissions.filter((item) => item.status === "pending_review" || item.status === "submitted");
  const upcoming = [...questions]
    .filter((item) => !isExpired(item.dueDate))
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 4);
  const assignmentPreviewLimit = 6;
  const visibleAssignments = showAllAssignments ? questions : questions.slice(0, assignmentPreviewLimit);

  return (
    <div>
      <div className="teacher-ai-tab-content active" id="dashboard">
        <div className="ui-page-header">
          <div>
            <h2>Dashboard</h2>
            <p className="ui-live">Review queue first, then upcoming deadlines.</p>
          </div>
          <button type="button" className="ui-btn ui-btn-primary" onClick={() => onNavigate?.("upload")}>
            {Icons.Plus()} Create assignment
          </button>
        </div>

        <div className="ui-grid-metrics">
          <MetricCard label="Total questions" value={totalQuestions} />
          <MetricCard label="Total submissions" value={totalSubmissions} />
          <MetricCard label="Awaiting review" value={awaitingReview} />
          <MetricCard label="Graded" value={`${gradedPercent}%`} hint={`${gradedSubmissions} approved`} />
        </div>

        <div className="ui-dashboard-grid">
          <section className="ui-card">
            <h3>Needs your review</h3>
            <div className="ui-stack" style={{ marginTop: 16 }}>
              {reviewQueue.length === 0 ? (
                <EmptyState title="Nothing waiting" description="New student submissions will appear here." />
              ) : (
                reviewQueue.slice(0, 5).map((item) => (
                  <article key={item._id} className="ui-card">
                    <h4>{item.title}</h4>
                    <p className="ui-live">{item.studentName} · {item.subject} · {reviewScoreLabel(item)}</p>
                    <button
                      type="button"
                      className="ui-btn ui-btn-primary"
                      onClick={() => onNavigate?.("submission", { submissionId: item._id })}
                    >
                      Review
                    </button>
                  </article>
                ))
              )}
            </div>
          </section>
          <div className="ui-stack">
            <section className="ui-card">
              <h3>Upcoming deadlines</h3>
              {upcoming.length === 0 ? (
                <p className="ui-live">No open assignments.</p>
              ) : (
                upcoming.map((item) => (
                  <p key={item._id} style={{ marginTop: 12 }}>
                    <strong>{item.title}</strong>
                    <span className="ui-live"> · {item.subject} · {daysUntilDue(item.dueDate)} days</span>
                  </p>
                ))
              )}
            </section>
            <section className="ui-card">
              <h3>Quick actions</h3>
              <div className="ui-stack" style={{ marginTop: 12 }}>
                <button type="button" className="ui-btn ui-btn-primary" onClick={() => onNavigate?.("upload")}>Create assignment</button>
                <button type="button" className="ui-btn ui-btn-secondary" onClick={() => onNavigate?.("submission")}>Open submissions</button>
              </div>
            </section>
          </div>
        </div>

        <section style={{ marginTop: 24 }}>
          <div className="ui-page-header">
            <h3>Assignments</h3>
            {questions.length > assignmentPreviewLimit && (
              <button
                type="button"
                className="ui-btn ui-btn-ghost"
                onClick={() => setShowAllAssignments((open) => !open)}
              >
                {showAllAssignments ? "Show fewer" : "View all"}
              </button>
            )}
          </div>
          <div className="ui-stack">
            {questions.length === 0 ? (
              <EmptyState
                title="No assignments yet"
                description="Publish a question with a rubric to start collecting answers."
                action={<button type="button" className="ui-btn ui-btn-primary" onClick={() => onNavigate?.("upload")}>Create assignment</button>}
              />
            ) : (
              visibleAssignments.map((question) => (
                <AssignmentCard
                  key={question._id}
                  id={question._id}
                  highlighted={String(focus?.assignmentId) === String(question._id)}
                  title={question.title}
                  subject={question.subject}
                  dueDate={question.dueDate}
                  status={assignmentCardStatus(question)}
                  submissions={question.submissions || 0}
                  graded={question.graded || 0}
                  actions={[
                    {
                      label: "Edit",
                      onSelect: () => {
                        setSelectedQuestion(question);
                        setIsEditModalOpen(true);
                      }
                    },
                    {
                      label: "Delete",
                      tone: "danger",
                      onSelect: () => setPendingDelete(question)
                    }
                  ]}
                >
                  <p className="ui-live" style={{ marginTop: 8 }}>{question.text}</p>
                </AssignmentCard>
              ))
            )}
          </div>
        </section>
      </div>

      {isEditModalOpen && (
        <TeacherEditModal
          question={selectedQuestion}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedQuestion(null);
          }}
          onEdit={handleSaveEdit}
        />
      )}
      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete assignment?"
        description={pendingDelete ? `Delete “${pendingDelete.title}”? This cannot be undone.` : ""}
        confirmLabel="Delete"
        tone="danger"
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

export default TeacherDashBoardQuestion;
