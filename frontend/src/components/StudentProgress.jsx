import React, { useState, useEffect } from "react";
import { api } from "../api/client";
import { formatDate } from "../utils/dates";

function formatSubjectName(subject) {
  if (!subject) return "";
  return subject.charAt(0).toUpperCase() + subject.slice(1).toLowerCase();
}

function buildAchievements(assignments) {
  const graded = assignments
    .filter((a) => a.status === "graded" && a.score !== null && a.maxMarks > 0)
    .sort((a, b) => new Date(b.gradedAt || b.submittedAt || b.dueDate) - new Date(a.gradedAt || a.submittedAt || a.dueDate));

  const achievements = [];
  const perfect = graded.find((a) => a.score === a.maxMarks);
  if (perfect) {
    achievements.push({
      id: "perfect",
      icon: "⭐",
      title: "Perfect Score",
      description: `100% on ${perfect.title}`,
      date: formatDate(perfect.gradedAt || perfect.submittedAt)
    });
  }

  if (graded.length) {
    const top = [...graded].sort((a, b) => (b.score / b.maxMarks) - (a.score / a.maxMarks))[0];
    achievements.push({
      id: "top",
      icon: "🏆",
      title: "Strong result",
      description: `${Math.round((top.score / top.maxMarks) * 100)}% in ${formatSubjectName(top.subject)}`,
      date: formatDate(top.gradedAt || top.submittedAt)
    });
  }

  const highStreak = graded.filter((a) => (a.score / a.maxMarks) >= 0.8);
  if (highStreak.length >= 2) {
    const latest = highStreak[0];
    achievements.push({
      id: "streak",
      icon: "🎯",
      title: "Consistent Performance",
      description: `${highStreak.length} graded assignments at or above 80%`,
      date: formatDate(latest.gradedAt || latest.submittedAt)
    });
  }

  return achievements.slice(0, 3);
}

function StudentProgress() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const data = await api("/api/assignments");
        setAssignments(data);
      } catch (err) {
        setError("Could not load assignments. Check network connection or API status.");
      } finally {
        setLoading(false);
      }
    };
    fetchAssignments();
  }, []);

  if (loading) {
    return <div className="student-tab-content active" id="progress"><p>Loading academic progress...</p></div>;
  }
  if (error) {
    return <div className="student-tab-content active" id="progress"><p>Error: {error}</p></div>;
  }

  const gradedAssignments = assignments.filter((a) => a.status === "graded" && a.score !== null && a.maxMarks > 0);
  let overallPerformance = 0;
  if (gradedAssignments.length > 0) {
    const totalScore = gradedAssignments.reduce((sum, a) => sum + a.score, 0);
    const totalMaxMarks = gradedAssignments.reduce((sum, a) => sum + a.maxMarks, 0);
    overallPerformance = totalMaxMarks > 0 ? Math.round((totalScore / totalMaxMarks) * 100) : 0;
  }

  const subjectScores = {};
  const subjectMaxMarks = {};
  gradedAssignments.forEach((assignment) => {
    const key = assignment.subject.toLowerCase();
    subjectScores[key] = (subjectScores[key] || 0) + assignment.score;
    subjectMaxMarks[key] = (subjectMaxMarks[key] || 0) + assignment.maxMarks;
  });
  const subjectPerformance = {};
  Object.keys(subjectScores).forEach((key) => {
    subjectPerformance[key] = Math.round((subjectScores[key] / subjectMaxMarks[key]) * 100);
  });

  const achievements = buildAchievements(assignments);

  return (
    <div className="student-tab-content active" id="progress">
      <div className="student-content-header">
        <h2>Academic Progress</h2>
      </div>
      <div className="student-progress-section">
        <div className="student-progress-cards">
          <div className="student-progress-card">
            <h4>Overall Performance</h4>
            <div className="student-progress-circle">
              <div className="student-circle-progress" data-progress={overallPerformance}>
                <span className="student-progress-value">{overallPerformance}%</span>
              </div>
            </div>
            <p>Performance based on graded assignments</p>
          </div>
          <div className="student-subject-progress">
            <h4>Subject-wise Performance</h4>
            <div className="student-subject-bars">
              {Object.keys(subjectPerformance).length > 0 ? (
                Object.entries(subjectPerformance).map(([subject, score]) => (
                  <div key={subject} className="student-subject-bar">
                    <div className="student-subject-info">
                      <span>{formatSubjectName(subject)}</span>
                      <span>{score}%</span>
                    </div>
                    <div className="student-progress-bar">
                      <div className="student-progress-fill" style={{ width: `${score}%` }} />
                    </div>
                  </div>
                ))
              ) : (
                <p>No graded assignments to show subject progress.</p>
              )}
            </div>
          </div>
        </div>
        <div className="student-achievements">
          <h4>Recent Achievements</h4>
          <div className="student-achievement-list">
            {achievements.length > 0 ? (
              achievements.map((achievement) => (
                <div key={achievement.id} className="student-achievement-item">
                  <div className="student-achievement-icon">{achievement.icon}</div>
                  <div className="student-achievement-info">
                    <h5>{achievement.title}</h5>
                    <p>{achievement.description}</p>
                  </div>
                  <div className="student-achievement-date">{achievement.date}</div>
                </div>
              ))
            ) : (
              <p>No recent achievements.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentProgress;
