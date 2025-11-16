import React, { useState, useEffect } from 'react';
import FeedbackModal from './FeedbackModal'; // Reuse this for viewing feedback
import TeacherGradingModal from './TeacherGradingModal'; // Import the new modal


function TeacherSubmissionButton() {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [filterSubject, setFilterSubject] = useState("");
    const [filterStatus, setFilterStatus] = useState("");

    
    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
    const [isGradingModalOpen, setIsGradingModalOpen] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState(null);


    const fetchAssignments = async () => {
        try {
            const response = await fetch('https://backend-ai-subjective-exam-evaluato.vercel.app/assignments');
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
            }
            const data = await response.json();
            const allSubmissions = data.filter(a => a.submittedAnswer !== null);
            setAssignments(allSubmissions);
        } catch (err) {
            console.error("❌ Failed to fetch submissions:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAssignments();
    }, []);

  
    const handleViewSubmission = (assignment) => {
        setSelectedAssignment(assignment);
        setIsFeedbackModalOpen(true);
    };

    const handleCloseFeedbackModal = () => {
        setIsFeedbackModalOpen(false);
        setSelectedAssignment(null);
    };

    
    const handleGradeSubmissionClick = (assignment) => {
        setSelectedAssignment(assignment);
        setIsGradingModalOpen(true);
    };

    const handleCloseGradingModal = () => {
        setIsGradingModalOpen(false);
        setSelectedAssignment(null);
    };

    const handleGradeSubmit = async (assignmentId, score, feedback) => {
        try {
            const response = await fetch(`https://backend-ai-subjective-exam-evaluato.vercel.app/${assignmentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ score, feedback }), // Send the new score and feedback
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
           
            handleCloseGradingModal();
            fetchAssignments();
            alert('Assignment graded successfully!');
        } catch (err) {
            console.error("❌ Failed to submit grade:", err);
            alert("An error occurred while submitting the grade. Please try again.");
        }
    };

    const filteredSubmissions = assignments.filter(submission => {
        const matchesSubject = filterSubject === "" || submission.subject === filterSubject;
        const matchesStatus = filterStatus === "" || submission.status === filterStatus;
        return matchesSubject && matchesStatus;
    });

    if (loading) {
        return (
            <div className="teacher-ai-tab-content" id="submissions">
                <p>Loading submissions...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="teacher-ai-tab-content" id="submissions">
                <p>Error: {error}</p>
            </div>
        );
    }

    return (
        <>
            <div className="teacher-ai-tab-content" id="submissions">
                <div className="teacher-ai-content-header">
                    <h2>Student Submissions</h2>
                    <div className="teacher-ai-filter-controls">
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
                            <option value="graded">Graded</option>
                            <option value="reviewed">Reviewed</option>
                        </select>
                    </div>
                </div>
                <div className="teacher-ai-submissions-table-container">
                    <table className="teacher-ai-submissions-table">
                        <thead>
                            <tr>
                                <th>Student Name</th>
                                <th>Question</th>
                                <th>Subject</th>
                                <th>Submitted</th>
                                <th>Status</th>
                                <th>Score</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="teacher-ai-submissionsTableBody">
                            {filteredSubmissions.length > 0 ? (
                                filteredSubmissions.map(submission => (
                                    <tr key={submission._id}>
                                        <td>Kumar</td>
                                        <td>{submission.title}</td>
                                        <td>{submission.subject}</td>
                                        <td>{submission.dueDate}</td>
                                        <td>
                                            <span className={`teacher-ai-status-badge teacher-ai-status-${submission.status}`}>
                                                {submission.status}
                                            </span>
                                        </td>
                                        <td>
                                            {submission.score !== null
                                                ? `${submission.score}/${submission.maxMarks}`
                                                : '-'}
                                        </td>
                                        <td>
                                            <button
                                                className="teacher-ai-btn teacher-ai-btn-secondary teacher-ai-btn-icon"
                                                onClick={() => handleViewSubmission(submission)}
                                                title="View"
                                            >
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                    <circle cx="12" cy="12" r="3" />
                                                </svg>
                                            </button>
                                           
                                            {submission.status !== 'graded' && (
                                                <button
                                                    className="teacher-ai-btn teacher-ai-btn-primary teacher-ai-btn-icon"
                                                    onClick={() => handleGradeSubmissionClick(submission)}
                                                    title="Grade"
                                                >
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                                    </svg>
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7">No submissions found matching the criteria.</td>
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

           
            {isGradingModalOpen && (
                <TeacherGradingModal
                    assignment={selectedAssignment}
                    onClose={handleCloseGradingModal}
                    onGrade={handleGradeSubmit}
                />
            )}
        </>
    );
}

export default TeacherSubmissionButton;