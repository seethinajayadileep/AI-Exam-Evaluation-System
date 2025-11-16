import React, { useState } from  'react';


function TeacherUploadQuestion() {
   
    const [formState, setFormState] = useState({
        questionTitle: '',
        questionText: '',
        maxMarks: 10,
        subject: '',
        dueDate: '' 
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormState(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleReset = () => {
        setFormState({
            questionTitle: '',
            questionText: '',
            maxMarks: 10,
            subject: '',
            dueDate: ''
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); 

        
        try {
            const response = await fetch('https://backend-ai-subjective-exam-evaluato.vercel.app/assignments/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    questionTitle: formState.questionTitle,
                    questionText: formState.questionText,
                    maxMarks: parseInt(formState.maxMarks), 
                    subject: formState.subject,
                    dueDate: formState.dueDate 
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
            }

            const result = await response.json();
            alert(result.message);
            handleReset(); 

        } catch (error) {
            console.error("❌ Failed to upload question:", error);
            alert("Failed to upload question. Please try again.");
        }
    };

    return (
        <div className="teacher-ai-tab-content" id="upload">
            <div className="teacher-ai-content-header">
                <h2>Upload New Question</h2>
            </div>
            <div className="teacher-ai-upload-form-container">
                <form className="teacher-ai-upload-form" onSubmit={handleSubmit}>
                    <div className="teacher-ai-form-group">
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
                    <div className="teacher-ai-form-group">
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
                    <div className="teacher-ai-form-group">
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
                    <div className="teacher-ai-form-group">
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
                    
                    <div className="teacher-ai-form-group">
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
                    <div className="teacher-ai-form-actions">
                        <button
                            type="button"
                            className="teacher-ai-btn teacher-ai-btn-secondary"
                            onClick={handleReset}
                        >
                            Reset
                        </button>
                        <button
                            type="submit"
                            className="teacher-ai-btn teacher-ai-btn-primary"
                        >
                            Upload Question
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
export default TeacherUploadQuestion;