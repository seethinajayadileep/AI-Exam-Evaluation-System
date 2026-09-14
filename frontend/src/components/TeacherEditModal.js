import React, { useCallback, useState } from "react";
import { useEscape } from "../ui/useEscape";
import "./TeacherEditModal.css";
import { SUBJECTS } from "../constants";
import { todayInputDate } from "../utils/dates";
import RubricBuilder, { createRubricItem, rubricIsBalanced, withRubricIds } from "./RubricBuilder";

function TeacherEditModal({ question, onClose, onEdit }) {
  const [formState, setFormState] = useState({
    questionTitle: question?.title || "",
    questionText: question?.text || "",
    maxMarks: question?.maxMarks || 10,
    subject: question?.subject || "",
    dueDate: question?.dueDate || "",
    modelAnswer: question?.modelAnswer || "",
    hideRubricFromStudents: Boolean(question?.hideRubricFromStudents),
    rubric: withRubricIds(question?.rubric?.length ? question.rubric : [createRubricItem()])
  });
  const [formError, setFormError] = useState("");

  const handleClose = useCallback(() => onClose?.(), [onClose]);
  useEscape(Boolean(question), handleClose);

  if (!question) return null;

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormState((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const maxMarks = parseInt(formState.maxMarks, 10);
    const originalDue = question?.dueDate || "";
    if (formState.dueDate !== originalDue && formState.dueDate < todayInputDate()) {
      setFormError("Due date cannot be earlier than today.");
      return;
    }
    if (!rubricIsBalanced(formState.rubric, maxMarks)) {
      setFormError("Rubric total must equal maximum marks.");
      return;
    }
    onEdit(question._id, {
      questionTitle: formState.questionTitle,
      questionText: formState.questionText,
      maxMarks,
      subject: formState.subject,
      dueDate: formState.dueDate,
      modelAnswer: formState.modelAnswer,
      hideRubricFromStudents: formState.hideRubricFromStudents,
      rubric: formState.rubric.map(({ criterion, maxMarks: marks, description }) => ({
        criterion: criterion.trim(),
        maxMarks: Number(marks),
        description: description.trim()
      }))
    });
  };

  return (
    <div className="today1-teacher-modal-overlay">
      <div className="today1-teacher-modal-content" role="dialog" aria-labelledby="edit-question-title">
        <div className="today1-teacher-modal-header">
          <h2 id="edit-question-title">Edit Question</h2>
          <button type="button" className="today1-teacher-modal-close" onClick={onClose} aria-label="Close edit dialog">&times;</button>
        </div>
        <div className="today1-teacher-modal-body">
          <form className="today1-teacher-edit-form" onSubmit={handleSubmit}>
            <div className="today1-teacher-form-group">
              <label htmlFor="edit-questionTitle">Question Title</label>
              <input id="edit-questionTitle" name="questionTitle" value={formState.questionTitle} onChange={handleChange} required />
            </div>
            <div className="today1-teacher-form-group">
              <label htmlFor="edit-questionText">Question Text</label>
              <textarea id="edit-questionText" name="questionText" rows="6" value={formState.questionText} onChange={handleChange} required />
            </div>
            <div className="today1-teacher-form-group">
              <label htmlFor="edit-modelAnswer">Model Answer</label>
              <textarea id="edit-modelAnswer" name="modelAnswer" rows="5" value={formState.modelAnswer} onChange={handleChange} required />
            </div>
            <div className="today1-teacher-form-group">
              <label htmlFor="edit-maxMarks">Maximum Marks</label>
              <input type="number" id="edit-maxMarks" name="maxMarks" min="1" max="100" value={formState.maxMarks} onChange={handleChange} required />
            </div>
            <div className="today1-teacher-form-group">
              <RubricBuilder
                rubric={formState.rubric}
                maxMarks={formState.maxMarks}
                onChange={(rubric) => setFormState((prev) => ({ ...prev, rubric }))}
              />
            </div>
            <div className="today1-teacher-form-group">
              <label htmlFor="edit-subject">Subject</label>
              <select id="edit-subject" name="subject" value={formState.subject} onChange={handleChange} required>
                <option value="">Select Subject</option>
                {SUBJECTS.map((subject) => (
                  <option key={subject.value} value={subject.value}>{subject.label}</option>
                ))}
              </select>
            </div>
            <div className="today1-teacher-form-group">
              <label htmlFor="edit-dueDate">Due Date</label>
              <input
                type="date"
                id="edit-dueDate"
                name="dueDate"
                min={formState.dueDate && formState.dueDate < todayInputDate() ? formState.dueDate : todayInputDate()}
                value={formState.dueDate}
                onChange={handleChange}
                required
              />
            </div>
            <div className="today1-teacher-form-group">
              <label className="teacher-ai-checkbox">
                <input
                  type="checkbox"
                  name="hideRubricFromStudents"
                  checked={formState.hideRubricFromStudents}
                  onChange={handleChange}
                />
                Hide criterion-level breakdown from students
              </label>
            </div>
            {formError && <p className="login-error" role="alert">{formError}</p>}
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
