import React, { useState } from 'react';

import './StudentAssignmentModal.css';

function AssignmentModal({ assignment, onClose, onSubmit }) {
  const [answer, setAnswer] = useState('');

  const handleTextareaChange = (e) => {
    setAnswer(e.target.value);
  };

  const handleSubmit = () => {
    if (answer.trim() !== '') {
      onSubmit(assignment._id, answer);
    } else {
      alert("Please write an answer before submitting.");
    }
  };

  if (!assignment) {
    return null; 
  }

  return (
    <div className="student-my-modal-overlay">
      <div className="student-my-modal-content">
        <div className="student-my-modal-header">
          <h2>{assignment.title}</h2>
          <button className="student-my-modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="student-my-modal-body">
          <div className="student-my-assignment-details">
            <p><strong>Subject:</strong> {assignment.subject}</p>
            <p><strong>Max Marks:</strong> {assignment.maxMarks}</p>
            <p><strong>Due Date:</strong> {assignment.dueDate}</p>
          </div>
          <div className="student-my-assignment-question">
            <h4>Question:</h4>
            <p>{assignment.text}</p>
          </div>
          <div className="student-my-assignment-answer">
            <h4>Your Answer:</h4>
            <textarea
              className="student-my-answer-textarea"
              placeholder="Write your answer here..."
              value={answer}
              onChange={handleTextareaChange}
              rows="10"
            ></textarea>
          </div>
        </div>
        <div className="student-my-modal-footer">
          <button className="student-my-btn student-my-btn-secondary" onClick={onClose}>Cancel</button>
          <button className="student-my-btn student-my-btn-primary" onClick={handleSubmit}>Submit Answer</button>
        </div>
      </div>
    </div>
  );
}

export default AssignmentModal;