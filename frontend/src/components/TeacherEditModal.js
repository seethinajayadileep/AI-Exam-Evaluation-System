import React, { useState } from 'react';
import './TeacherEditModal.css'; 

function TeacherEditModal({ question, onClose, onEdit }) {
    
    const [formState, setFormState] = useState({
        questionTitle: question?.title || '',
        questionText: question?.text || '',
        maxMarks: question?.maxMarks || 10,
        subject: question?.subject || '',
        dueDate: question?.dueDate || ''
    });

    
    if (!question) {
        return null;
    }
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormState(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onEdit(question._id, {
            questionTitle: formState.questionTitle,
            questionText: formState.questionText,
            maxMarks: parseInt(formState.maxMarks),
            subject: formState.subject,
            dueDate: formState.dueDate
        });
    };

    return (
        <div className="today1-teacher-modal-overlay">
            <div className="today1-teacher-modal-content">
                <div className="today1-teacher-modal-header">
                    <h2>Edit Question</h2>
                    <button className="today1-teacher-modal-close" onClick={onClose}>&times;</button>
                </div>
                <div className="today1-teacher-modal-body">
                    <form className="today1-teacher-edit-form" onSubmit={handleSubmit}>
                        <div className="today1-teacher-form-group">
                            <label htmlFor="questionTitle">Question Title</label>
                            <input
                                type="text"
                                id="questionTitle"
                                name="questionTitle"
                                value={formState.questionTitle}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="today1-teacher-form-group">
                            <label htmlFor="questionText">Question Text</label>
                            <textarea
                                id="questionText"
                                name="questionText"
                                rows="6"
                                value={formState.questionText}
                                onChange={handleChange}
                                required
                            ></textarea>
                        </div>
                        <div className="today1-teacher-form-group">
                            <label htmlFor="maxMarks">Maximum Marks</label>
                            <input
                                type="number"
                                id="maxMarks"
                                name="maxMarks"
                                min="1"
                                max="100"
                                value={formState.maxMarks}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="today1-teacher-form-group">
                            <label htmlFor="subject">Subject</label>
                            <select
                                id="subject"
                                name="subject"
                                value={formState.subject}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select Subject</option>
                                <option value="mathematics">Mathematics</option>
                                <option value="science">Science</option>
                                <option value="english">English</option>
                                <option value="history">History</option>
                                <option value="geography">Geography</option>
                            </select>
                        </div>
                        <div className="today1-teacher-form-group">
                            <label htmlFor="dueDate">Due Date</label>
                            <input
                                type="date"
                                id="dueDate"
                                name="dueDate"
                                value={formState.dueDate}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="today1-teacher-form-actions">
                            <button type="button" className="today1-teacher-btn today1-teacher-btn-secondary" onClick={onClose}>Cancel</button>
                            <button type="submit" className="today1-teacher-btn today1-teacher-btn-primary">Save Changes</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default TeacherEditModal;