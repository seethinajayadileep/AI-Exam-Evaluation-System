import React, { useEffect, useMemo, useState } from "react";
import { api } from "../api/client";
import { daysUntilDue, formatDate, formatScore, isExpired } from "../utils/dates";
import { assignmentHasDraft } from "../utils/drafts";
import MetricCard from "../ui/MetricCard";
import EmptyState from "../ui/EmptyState";
import Skeleton from "../ui/Skeleton";
import StatusBadge from "../ui/StatusBadge";
import { Icons } from "../ui/icons";
import { useAuth } from "../auth/AuthContext";

function StudentHome({ onViewAssignments, onViewSubmissions, onIndexChange }) {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await api("/api/assignments");
      setAssignments(data);
      setError(null);
      onIndexChange?.({
        searchItems: [
          ...data.map((item) => ({
            label: item.title,
            group: "Assignment",
            tab: "Assignments",
            assignmentId: item._id
          })),
          ...data.map((item) => ({
            label: item.subject,
            group: "Subject",
            tab: "Assignments",
            assignmentId: item._id
          }))
        ],
        notifications: [
          ...data.filter((item) => item.status === "pending" && daysUntilDue(item.dueDate) <= 2).map((item) => ({
            id: `due-${item._id}`,
            label: `${item.title} is due soon`,
            tab: "Assignments",
            assignmentId: item._id
          })),
          ...data.filter((item) => item.status === "graded").slice(0, 3).map((item) => ({
            id: `fb-${item._id}`,
            label: `Feedback ready: ${item.title}`,
            tab: "Submission"
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
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pending = assignments.filter((a) => a.status === "pending");
  const submitted = assignments.filter((a) => a.status === "submitted" || a.status === "pending_review");
  const graded = assignments.filter((a) => a.status === "graded");
  const nextAction = useMemo(() => (
    [...pending]
      .filter((item) => !item.expired && !isExpired(item.dueDate))
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))[0]
  ), [pending]);

  const upcoming = pending
    .filter((item) => !item.expired)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 4);
  const recentFeedback = graded.slice(0, 3);
  const subjectProgress = graded.reduce((acc, item) => {
    if (!item.maxMarks) return acc;
    acc[item.subject] = acc[item.subject] || { score: 0, max: 0 };
    acc[item.subject].score += item.score || 0;
    acc[item.subject].max += item.maxMarks;
    return acc;
  }, {});

  if (loading) return <Skeleton rows={4} />;
  if (error) {
    return (
      <EmptyState
        title="Could not load your dashboard"
        description={error}
        action={<button type="button" className="ui-btn ui-btn-primary" onClick={load}>{Icons.Retry()} Retry</button>}
      />
    );
  }

  const average = graded.length
    ? `${Math.round((graded.reduce((sum, item) => sum + (item.score || 0), 0) / graded.reduce((sum, item) => sum + item.maxMarks, 0)) * 100)}%`
    : "N/A";
  const nextHasDraft = assignmentHasDraft(nextAction, user?.id);

  return (
    <div className="student-tab-content active" id="dashboard">
      <div className="ui-page-header">
        <div>
          <h2>Your next step</h2>
          <p className="ui-live">A short list of what matters now. Use View all for the full set.</p>
        </div>
      </div>

      {nextAction ? (
        <section className="ui-next-action">
          <div>
            <p className="ui-live">Next action</p>
            <h3>{nextAction.title}</h3>
          </div>
          <div className="ui-next-action-meta">
            <span>Due {formatDate(nextAction.dueDate)}</span>
            <span>{daysUntilDue(nextAction.dueDate)} days remaining</span>
            <span>{nextHasDraft ? "Draft saved" : "No draft yet"}</span>
            <span>About {Math.max(15, nextAction.maxMarks * 4)} minutes</span>
          </div>
          <button
            type="button"
            className="ui-btn ui-btn-primary"
            onClick={() => onViewAssignments?.(nextAction._id)}
          >
            {nextHasDraft ? "Continue" : "Start"}
          </button>
        </section>
      ) : (
        <EmptyState title="You are caught up" description="No open assignments need your attention." />
      )}

      <div className="ui-grid-metrics" style={{ marginTop: 24 }}>
        <MetricCard label="Pending assignments" value={pending.length} />
        <MetricCard label="Submitted" value={submitted.length} />
        <MetricCard label="Graded" value={graded.length} />
        <MetricCard label="Average score" value={average} />
      </div>

      <div className="ui-dashboard-grid">
        <section className="ui-card">
          <div className="ui-page-header">
            <h3>Upcoming deadlines</h3>
            <button type="button" className="ui-btn ui-btn-ghost" onClick={() => onViewAssignments?.()}>View all</button>
          </div>
          {upcoming.length === 0 ? (
            <p className="ui-live">No upcoming pending assignments.</p>
          ) : (
            upcoming.map((item) => (
              <p key={item._id} style={{ marginTop: 12 }}>
                <strong>{item.title}</strong>
                <span className="ui-live"> · {item.subject} · {daysUntilDue(item.dueDate)} days left</span>
              </p>
            ))
          )}
        </section>
        <section className="ui-card">
          <div className="ui-page-header">
            <h3>Recent feedback</h3>
            <button type="button" className="ui-btn ui-btn-ghost" onClick={onViewSubmissions}>View all</button>
          </div>
          {recentFeedback.length === 0 ? (
            <p className="ui-live">No graded feedback yet.</p>
          ) : (
            recentFeedback.map((item) => (
              <p key={item._id} style={{ marginTop: 12 }}>
                <strong>{item.title}</strong>
                <span className="ui-live"> · {formatScore(item.score, item.maxMarks)}</span>
                <StatusBadge status="graded" />
              </p>
            ))
          )}
        </section>
      </div>

      <section className="ui-card" style={{ marginTop: 16 }}>
        <div className="ui-page-header">
          <h3>Subject progress</h3>
          <button type="button" className="ui-btn ui-btn-ghost" onClick={() => onViewAssignments?.()}>View assignments</button>
        </div>
        {Object.keys(subjectProgress).length === 0 ? (
          <p className="ui-live">Progress appears after graded work.</p>
        ) : (
          Object.entries(subjectProgress).slice(0, 4).map(([subject, value]) => {
            const percent = Math.round((value.score / value.max) * 100);
            return (
              <div key={subject} style={{ marginTop: 12 }}>
                <p>{subject} · {percent}%</p>
                <div className="ui-progress" aria-label={`${subject} ${percent} percent`}>
                  <span style={{ width: `${percent}%` }} />
                </div>
              </div>
            );
          })
        )}
      </section>
    </div>
  );
}

export default StudentHome;
