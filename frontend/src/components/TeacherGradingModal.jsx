import React, { useState } from 'react';

import './TeacherGradingModal.css';

function TeacherGradingModal({ assignment, onClose, onGrade }) {
    
    const [score, setScore] = useState(assignment?.score || '');
    const [feedback, setFeedback] = useState(assignment?.feedback || '');

    
    if (!assignment) {
        return null;
    }
    
    const handleGradeSubmit = () => {
        if (score === '' || feedback.trim() === '') {
            alert('Please enter a score and feedback.');
            return;
        }
        onGrade(assignment._id, parseInt(score), feedback);
    };

    return (
        <div className="today-teacher-modal-overlay">
            <div className="today-teacher-modal-content">
                <div className="today-teacher-modal-header">
                    <h2>Grade: {assignment.title}</h2>
                    <button className="today-teacher-modal-close" onClick={onClose}>&times;</button>
                </div>
                <div className="today-teacher-modal-body">
                    <div className="today-teacher-submission-info">
                        <h4>Student Submission:</h4>
                        <p className="today-teacher-submission-text">{assignment.submittedAnswer}</p>
                    </div>
                    <div className="today-teacher-grading-form">
                        <div className="today-teacher-form-group">
                            <label htmlFor="score">Score ({assignment.maxMarks} max):</label>
                            <input
                                type="number"
                                id="score"
                                value={score}
                                onChange={(e) => setScore(e.target.value)}
                                min="0"
                                max={assignment.maxMarks}
                                required
                            />
                        </div>
                        <div className="today-teacher-form-group">
                            <label htmlFor="feedback">Feedback:</label>
                            <textarea
                                id="feedback"
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                rows="6"
                                required
                            ></textarea>
                        </div>
                    </div>
                </div>
                <div className="today-teacher-modal-footer">
                    <button className="today-teacher-btn today-teacher-btn-secondary" onClick={onClose}>Cancel</button>
                    <button className="today-teacher-btn today-teacher-btn-primary" onClick={handleGradeSubmit}>Submit Grade</button>
                </div>
            </div>
        </div>
    );
}

export default TeacherGradingModal;