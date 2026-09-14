import React, { useState, useEffect } from "react";
import { api } from "../api/client";
import { daysUntilDue } from "../utils/dates";

function StudentDeadline() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const data = await api("/api/assignments");
        setAssignments(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAssignments();
  }, []);

  const upcomingAssignments = assignments
    .filter((a) => a.status === "pending" && !a.expired)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 5);

  if (loading) {
    return (
      <div className="student-upcoming-deadlines">
        <h3>Upcoming Deadlines</h3>
        <p>Loading upcoming deadlines...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="student-upcoming-deadlines">
        <h3>Upcoming Deadlines</h3>
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="student-upcoming-deadlines">
      <h3>Upcoming Deadlines</h3>
      <div className="student-deadline-list">
        {upcomingAssignments.length === 0 ? (
          <p>No upcoming pending assignments.</p>
        ) : (
          upcomingAssignments.map((assignment) => {
            const days = daysUntilDue(assignment.dueDate);
            const isUrgent = days <= 2;
            return (
              <div key={assignment._id} className="student-deadline-item">
                <div className="student-deadline-info">
                  <h5>{assignment.title}</h5>
                  <p>
                    {assignment.subject} • {days === 1 ? "1 day left" : `${days} days left`}
                  </p>
                </div>
                <span className={`student-deadline-status ${isUrgent ? "student-status-urgent" : "student-status-pending"}`}>
                  {isUrgent ? "Urgent" : "Upcoming"}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default StudentDeadline;
