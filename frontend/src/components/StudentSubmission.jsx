import React, { useState, useEffect } from 'react';
import FeedbackModal from './FeedbackModal'; // Import the new modal component


function StudentSubmission() {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    
    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState(null);

   
    const fetchAssignments = async () => {
      try {
          const response = await fetch('https://backend-ai-subjective-exam-evaluato.vercel.app/assignments');
          if (!response.ok) {
              const errorText = await response.text();
              throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
          }
          const data = await response.json();
         
          const submittedOrGraded = data.filter(a => a.status === 'submitted' || a.status === 'graded');
          setAssignments(submittedOrGraded); 
      } catch (err) {
          console.error("Failed to fetch submissions:", err);
          setError(err.message);
      } finally {
          setLoading(false);
      }
    };

    useEffect(() => {
      fetchAssignments();
    }, []);

   
    const handleViewSubmissionClick = (assignment) => {
        setSelectedAssignment(assignment);
        setIsFeedbackModalOpen(true);
    };

    const handleCloseFeedbackModal = () => {
        setIsFeedbackModalOpen(false);
        setSelectedAssignment(null);
    };

    if (loading) {
        return (
            <div className="student-tab-content" id="submissions">
                <p>Loading submissions...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="student-tab-content" id="submissions">
                <p>Error: {error}</p>
            </div>
        );
    }

    return (
        <>
            <div className="student-tab-content" id="submissions">
                <div className="student-content-header">
                    <h2>My Submissions</h2>
                </div>
                <div className="student-submissions-table-container">
                    <table className="student-submissions-table">
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
                        <tbody id="student-submissionsTableBody">
                            {assignments.length > 0 ? (
                                assignments.map((assignment) => (
                                    <tr key={assignment._id}>
                                        <td>{assignment.title}</td>
                                        <td>{assignment.subject}</td>
                                        <td>{assignment.dueDate}</td>
                                        <td>
                                            <span className={`student-status-badge student-status-${assignment.status}`}>
                                                {assignment.status}
                                            </span>
                                        </td>
                                        <td>{assignment.score !== null ? `${assignment.score}/${assignment.maxMarks}` : '-'}</td>
                                        <td>{assignment.feedback ? 'Available' : 'Pending'}</td>
                                        <td>
                                            <button
                                                className="student-btn student-btn-secondary student-btn-sm"
                                                onClick={() => handleViewSubmissionClick(assignment)} // Use the new handler
                                                title="View"
                                            >
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                    <circle cx="12" cy="12" r="3" />
                                                </svg>
                                            </button>

                                            {}
                                            {assignment.status === 'graded' && assignment.feedback && (
                                                <button
                                                    className="student-btn student-btn-primary student-btn-sm"
                                                    onClick={() => handleViewSubmissionClick(assignment)} 
                                                    title="Feedback"
                                                >
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
                </div>
            </div>
            
      
            {isFeedbackModalOpen && (
                <FeedbackModal
                    assignment={selectedAssignment}
                    onClose={handleCloseFeedbackModal}
                />
            )}
        </>
    );
}

export default StudentSubmission;