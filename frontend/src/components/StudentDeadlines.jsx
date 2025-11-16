
import React, { useState, useEffect } from 'react';



function getDaysUntilDue(dueDate) {
  const due = new Date(dueDate);
  const today = new Date();
  
  due.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

function StudentDeadline() {
  const [assignments, setAssignments] = useState([]); 
  const [loading, setLoading] = useState(true);     
  const [error, setError] = useState(null);         

  
  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        
        const response = await fetch('https://backend-ai-subjective-exam-evaluato.vercel.app/assignments');
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
        }
        const data = await response.json();
        setAssignments(data); 
      } catch (err) {
        console.error("Failed to fetch assignments for deadlines:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, []); 

 
  const upcomingAssignments = assignments
    .filter(a => a.status === 'pending' && new Date(a.dueDate) >= new Date()) 
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
          upcomingAssignments.map(assignment => {
            
            const daysUntilDue = getDaysUntilDue(assignment.dueDate);
            const isUrgent = daysUntilDue <= 2;

            return (
              <div key={assignment._id} className="student-deadline-item">
                <div className="student-deadline-info">
                  <h5>{assignment.title}</h5>
                  <p>
                    {assignment.subject} • {daysUntilDue} day{daysUntilDue !== 1 ? "s" : ""} left
                  </p>
                </div>
                <span
                  className={`student-deadline-status ${
                    isUrgent ? "student-status-urgent" : "student-status-pending"
                  }`}
                >
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