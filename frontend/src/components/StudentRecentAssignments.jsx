
import React, { useState, useEffect } from 'react';


function StudentRecentAssignments() {
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
               
                const sortedAssignments = data.sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate));
               
                setAssignments(sortedAssignments);
            } catch (err) {
                console.error("Failed to fetch recent assignments:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchAssignments();
    }, []); 

    if (loading) {
        return (
            <div className="student-recent-assignments">
                <h3>Recent Assignments</h3>
                <p>Loading recent assignments...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="student-recent-assignments">
                <h3>Recent Assignments</h3>
                <p>Error: {error}</p>
            </div>
        );
    }

    return (
        <>
            <div className="student-recent-assignments">
                <h3>Recent Assignments</h3>
                <div className="student-assignment-list" id="recentAssignmentsList">
                    {assignments.length > 0 ? (
                        assignments.map((assignment) => (
                           
                            <div key={assignment._id} className="student-assignment-item">
                                <div className="student-assignment-info">
                                    <h5>{assignment.title}</h5>
                                    <p>{assignment.subject} • Due: {assignment.dueDate}</p>
                                </div>
                                <span className={`student-assignment-status student-status-${assignment.status}`}>{assignment.status}</span>
                            </div>
                        ))
                    ) : (
                        <p>No recent assignments found.</p>
                    )}
                </div>
            </div>
        </>
    );
}

export default StudentRecentAssignments;