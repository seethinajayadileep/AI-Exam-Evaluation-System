import React from 'react';

import './StudentMyFeedbackModal.css';

function FeedbackModal({ assignment, onClose }) {
  if (!assignment) {
    return null;
  }

  const { title, subject, score, maxMarks, submittedAnswer, feedback } = assignment;

  return (
    <div className="student-my-feedback-modal-overlay">
      <div className="student-my-feedback-modal-content">
        <div className="student-my-feedback-modal-header">
          <h2>{title}</h2>
          <button className="student-my-feedback-modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="student-my-feedback-modal-body">
          <div className="student-my-feedback-meta">
            <p><strong>Subject:</strong> {subject}</p>
            <p><strong>Score:</strong> {score}/{maxMarks}</p>
          </div>
          <div className="student-my-feedback-student-answer">
            <h4>Your Submitted Answer:</h4>
            <p>{submittedAnswer}</p>
          </div>
          <div className="student-my-feedback-evaluation">
            <h4>AI Feedback:</h4>
            <p>{feedback}</p>
          </div>
        </div>
        <div className="student-my-feedback-modal-footer">
          <button className="student-my-btn student-my-btn-primary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

export default FeedbackModal;