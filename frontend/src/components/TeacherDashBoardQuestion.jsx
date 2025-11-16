import React, { useState, useEffect } from 'react';
import TeacherEditModal from './TeacherEditModal'; // Import the new modal


function TeacherDashBoardQuestion({ onNavigate }) {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [totalQuestions, setTotalQuestions] = useState(0);
    const [totalSubmissions, setTotalSubmissions] = useState(0);
    const [gradedSubmissions, setGradedSubmissions] = useState(0);

    
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedQuestion, setSelectedQuestion] = useState(null);


    const fetchAssignments = async () => {
        try {
            const response = await fetch('https://backend-ai-subjective-exam-evaluato.vercel.app/assignments');
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
            }
            const data = await response.json();
            setQuestions(data);
        } catch (err) {
            console.error("❌ Failed to fetch questions for teacher dashboard:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAssignments();
    }, []);

    useEffect(() => {
        if (questions.length > 0) {
            setTotalQuestions(questions.length);
            const subCount = questions.filter(q => q.status === 'submitted' || q.status === 'graded').length;
            const gradCount = questions.filter(q => q.status === 'graded').length;
            setTotalSubmissions(subCount);
            setGradedSubmissions(gradCount);
        } else {
            setTotalQuestions(0);
            setTotalSubmissions(0);
            setGradedSubmissions(0);
        }
    }, [questions]);

    const handleAddQuestionClick = () => {
        if (onNavigate) {
            onNavigate('upload');
        } else {
            alert("Navigation not available. Please ensure a parent component handles state.");
        }
    };

    //  Handler to open the edit modal
    const handleEditQuestion = (question) => {
        setSelectedQuestion(question);
        setIsEditModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setSelectedQuestion(null);
    };

    //  Handler to send the updated data to the backend
    const handleSaveEdit = async (questionId, updatedData) => {
        try {
            const response = await fetch(`https://backend-ai-subjective-exam-evaluato.vercel.app/${questionId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    questionTitle: updatedData.questionTitle,
                    questionText: updatedData.questionText,
                    maxMarks: updatedData.maxMarks,
                    subject: updatedData.subject,
                    dueDate: updatedData.dueDate
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            alert('Question updated successfully!');
            handleCloseEditModal();
            fetchAssignments(); 
        } catch (err) {
            console.error("❌ Failed to save changes:", err);
            alert("Failed to save changes. Please try again.");
        }
    };


    const handleDeleteQuestion = async (questionId) => {
        if (window.confirm("Are you sure you want to delete this question? This cannot be undone.")) {
            try {
                const response = await fetch(`https://backend-ai-subjective-exam-evaluato.vercel.app/${questionId}`, { method: 'DELETE' });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                alert('Question deleted successfully!');
                fetchAssignments();
            } catch (err) {
                console.error("❌ Failed to delete question:", err);
                alert("Failed to delete question. Please try again.");
            }
        }
    };

    if (loading) {
        return (
            <div className="teacher-ai-tab-content active" id="dashboard">
                <p>Loading teacher dashboard data...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="teacher-ai-tab-content active" id="dashboard">
                <p>Error: {error}</p>
            </div>
        );
    }

    return (
        <div>
            <div className="teacher-ai-tab-content active" id="dashboard">
                <div className="teacher-ai-content-header">
                    <h2>Dashboard Overview</h2>
                    <button className="teacher-ai-btn teacher-ai-btn-primary" onClick={handleAddQuestionClick}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="16" />
                            <line x1="8" y1="12" x2="16" y2="12" />
                        </svg>
                        Add New Question
                    </button>
                </div>
                {}
                <div className="teacher-ai-questions-section">
                    <h3>Recent Questions</h3>
                    <div className="teacher-ai-questions-grid" id="questionsGrid">
                        {questions.length > 0 ? (
                            questions.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate)).slice(0, 3).map(question => (
                                <div key={question._id} className="teacher-ai-question-card">
                                    <div className="question-card-header">
                                        <div>
                                            <h4 className="teacher-ai-question-title">{question.title}</h4>
                                            <div className="teacher-ai-question-meta">
                                                <span>Subject: {question.subject}</span>
                                                <span>Max Marks: {question.maxMarks}</span>
                                                <span>Created: {question.createdDate || 'N/A'}</span>
                                            </div>
                                        </div>
                                        <div className="teacher-ai-question-actions">
                                            {/*  Pass the full question object to the handler */}
                                            <button className="teacher-ai-btn teacher-ai-btn-secondary btn-icon" onClick={() => handleEditQuestion(question)} title="Edit">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                                </svg>
                                            </button>
                                            <button className="teacher-ai-btn teacher-ai-btn-secondary teacher-ai-btn-icon" onClick={() => handleDeleteQuestion(question._id)} title="Delete">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <polyline points="3,6 5,6 21,6" />
                                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                                    <line x1="10" y1="11" x2="10" y2="17" />
                                                    <line x1="14" y1="11" x2="14" y2="17" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                    <p className="teacher-ai-question-text">{question.text}</p>
                                    <div className="teacher-ai-question-stats">
                                        <span>Submissions: {question.status === 'submitted' || question.status === 'graded' ? 1 : 0}</span>
                                        <span>Graded: {question.status === 'graded' ? 1 : 0}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p>No questions found.</p>
                        )}
                    </div>
                </div>
            </div>
            
            {isEditModalOpen && (
                <TeacherEditModal
                    question={selectedQuestion}
                    onClose={handleCloseEditModal}
                    onEdit={handleSaveEdit}
                />
            )}
        </div>
    );
}

export default TeacherDashBoardQuestion;