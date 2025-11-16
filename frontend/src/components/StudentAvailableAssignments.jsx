import React, { useState, useEffect } from 'react';
import AssignmentModal from './AssignmentModal';
import FeedbackModal from './FeedbackModal'; 


function StudentAvailableAssignments() {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterSubject, setFilterSubject] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    
   
    const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState(null);

    
    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
    const [selectedGradedAssignment, setSelectedGradedAssignment] = useState(null);

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
          console.error("Failed to fetch assignments:", err);
          setError(err.message);
      } finally {
          setLoading(false);
      }
    };

    useEffect(() => {
      fetchAssignments();
    }, []);

   
    const handleStartClick = (assignment) => {
        setSelectedAssignment(assignment);
        setIsSubmissionModalOpen(true);
    };

    const handleCloseSubmissionModal = () => {
        setIsSubmissionModalOpen(false);
        setSelectedAssignment(null);
    };

    const handleSubmitAnswer = async (assignmentId, answer) => {
        try {
            const response = await fetch(`https://backend-ai-subjective-exam-evaluato.vercel.app/assignments/${assignmentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ submittedAnswer: answer }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            handleCloseSubmissionModal();
            fetchAssignments();
            alert('Your answer has been submitted successfully!');
        } catch (err) {
            console.error("Failed to submit answer:", err);
            alert("An error occurred during submission. Please try again.");
        }
    };
    
   
    const handleViewFeedbackClick = (assignment) => {
        setSelectedGradedAssignment(assignment);
        setIsFeedbackModalOpen(true);
    };

    const handleCloseFeedbackModal = () => {
        setIsFeedbackModalOpen(false);
        setSelectedGradedAssignment(null);
    };

    const filteredAssignments = assignments.filter(assignment => {
        const matchesSubject = filterSubject === "" || assignment.subject === filterSubject;
        const matchesStatus = filterStatus === "" || assignment.status === filterStatus;
        return matchesSubject && matchesStatus;
    });

    if (loading) {
        return <div className="student-tab-content" id="assignments"><p>Loading assignments...</p></div>;
    }

    if (error) {
        return <div className="student-tab-content" id="assignments"><p>Error: {error}</p></div>;
    }

    return (
        <>
            <div className="student-tab-content" id="assignments">
                <div className="student-content-header">
                    <h2>Available Assignments</h2>
                    <div className="student-filter-controls">
                        <select id="filterSubject" onChange={(e) => setFilterSubject(e.target.value)} value={filterSubject}>
                            <option value="">All Subjects</option>
                            <option value="mathematics">Mathematics</option>
                            <option value="science">Science</option>
                            <option value="english">English</option>
                            <option value="history">History</option>
                        </select>
                        <select id="filterStatus" onChange={(e) => setFilterStatus(e.target.value)} value={filterStatus}>
                            <option value="">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="submitted">Submitted</option>
                            <option value="graded">Graded</option>
                        </select>
                    </div>
                </div>
                <div className="student-assignments-grid" id="assignmentsGrid">
                    {filteredAssignments.length > 0 ? (
                        filteredAssignments.map((assignment) => {
                            let isUrgent = false;
                            try {
                                const dueDateObj = new Date(assignment.dueDate);
                                if (!isNaN(dueDateObj.getTime())) {
                                    isUrgent = dueDateObj < new Date();
                                }
                            } catch (e) {
                                console.warn("Invalid dueDate format for assignment:", assignment.id, e);
                            }

                            return (
                                <div key={assignment._id} className={`student-assignment-card ${assignment.status}`}>
                                    <div className="student-assignment-header">
                                        <div>
                                            <h4 className="student-assignment-title">{assignment.title}</h4>
                                            <div className="student-assignment-meta">
                                                <span>Subject: {assignment.subject}</span>
                                                <span>Max Marks: {assignment.maxMarks}</span>
                                                {assignment.score !== null && (
                                                    <span>Score: {assignment.score}/{assignment.maxMarks}</span>
                                                )}
                                            </div>
                                        </div>
                                        <span className={`student-assignment-status student-status-${assignment.status}`}>
                                            {assignment.status}
                                        </span>
                                    </div>

                                    <p className="student-assignment-text">{assignment.text}</p>

                                    <div className="student-assignment-footer">
                                        <span className={`student-due-date ${isUrgent ? 'urgent' : ''}`}>
                                            Due: {assignment.dueDate}
                                        </span>

                                        <div className="student-assignment-actions">
                                            {assignment.status === 'pending' ? (
                                                <button 
                                                    className="student-btn student-btn-primary" 
                                                    onClick={() => handleStartClick(assignment)}
                                                >
                                                    Start
                                                </button>
                                            ) : assignment.status === 'graded' ? (
                                                <button 
                                                    className="student-btn student-btn-secondary"
                                                    onClick={() => handleViewFeedbackClick(assignment)} 
                                                >
                                                    View Feedback
                                                </button>
                                            ) : (
                                                // Add onClick handler to View Submission button ---
                                                <button className="student-btn student-btn-secondary"
                                                    onClick={() => handleViewFeedbackClick(assignment)} 
                                                >
                                                    View Submission
                                                </button>
                                               
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <p>No assignments found matching the criteria.</p>
                    )}
                </div>
            </div>
            
           
            {isSubmissionModalOpen && (
                <AssignmentModal
                    assignment={selectedAssignment}
                    onClose={handleCloseSubmissionModal}
                    onSubmit={handleSubmitAnswer}
                />
            )}

           
            {isFeedbackModalOpen && (
                <FeedbackModal
                    assignment={selectedGradedAssignment} 
                    onClose={handleCloseFeedbackModal}
                />
            )}
        </>
    );
}

export default StudentAvailableAssignments;