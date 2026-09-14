import React, { useEffect, useMemo, useState } from "react";
import { api } from "../api/client";
import { SUBJECTS } from "../constants";
import { isDueDateValid, todayInputDate } from "../utils/dates";
import RubricBuilder, { createRubricItem, rubricIsBalanced, rubricTotal } from "./RubricBuilder";
import CalibrationPanel from "./CalibrationPanel";
import FormStepper from "../ui/FormStepper";
import ConfirmDialog from "../ui/ConfirmDialog";
import { useToast } from "../ui/ToastContext";

const STEPS = [
  { id: "details", label: "Question details" },
  { id: "model", label: "Model answer" },
  { id: "rubric", label: "Rubric" },
  { id: "calibration", label: "AI calibration" },
  { id: "preview", label: "Preview and publish" }
];

const EMPTY_FORM = {
  questionTitle: "",
  questionText: "",
  maxMarks: 10,
  subject: "",
  dueDate: "",
  modelAnswer: "",
  hideRubricFromStudents: false,
  rubric: [createRubricItem()]
};

function TeacherUploadQuestion({ onDirtyChange, onPublished }) {
  const toast = useToast();
  const [step, setStep] = useState(0);
  const [formState, setFormState] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [resetOpen, setResetOpen] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    onDirtyChange?.(dirty);
  }, [dirty, onDirtyChange]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setDirty(true);
    setFormState((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const resetForm = () => {
    setFormState({ ...EMPTY_FORM, rubric: [createRubricItem()] });
    setFormError("");
    setFieldErrors({});
    setStep(0);
    setDirty(false);
    setResetOpen(false);
  };

  const validateStep = (index) => {
    const errors = {};
    const maxMarks = parseInt(formState.maxMarks, 10);
    if (index === 0) {
      if (!formState.questionTitle.trim()) errors.questionTitle = "Enter a title.";
      if (!formState.questionText.trim()) errors.questionText = "Enter the question text.";
      if (!formState.subject) errors.subject = "Choose a subject.";
      if (!formState.dueDate) errors.dueDate = "Choose a due date.";
      else if (!isDueDateValid(formState.dueDate)) errors.dueDate = "Due date cannot be earlier than today.";
      if (!maxMarks || maxMarks < 1) errors.maxMarks = "Maximum marks must be at least 1.";
    }
    if (index === 1 && !formState.modelAnswer.trim()) {
      errors.modelAnswer = "Add a model answer the AI can grade against.";
    }
    if (index === 2) {
      if (!rubricIsBalanced(formState.rubric, maxMarks)) {
        errors.rubric = "Rubric total must equal maximum marks.";
      }
      if (formState.rubric.some((item) => !item.criterion.trim() || !item.description.trim())) {
        errors.rubric = "Each rubric row needs a criterion and description.";
      }
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const goNext = () => {
    if (!validateStep(step)) {
      setFormError("Please fix the highlighted fields before continuing.");
      return;
    }
    setFormError("");
    setStep((current) => Math.min(current + 1, STEPS.length - 1));
  };

  const publishAssignment = async () => {
    if (step !== STEPS.length - 1) return;
    if (![0, 1, 2].every((index) => validateStep(index))) {
      setFormError("Complete question, model answer, and balanced rubric before publishing.");
      setStep(0);
      return;
    }
    setSaving(true);
    setFormError("");
    try {
      const result = await api("/api/assignments", {
        method: "POST",
        body: JSON.stringify({
          questionTitle: formState.questionTitle,
          questionText: formState.questionText,
          maxMarks: parseInt(formState.maxMarks, 10),
          subject: formState.subject,
          dueDate: formState.dueDate,
          modelAnswer: formState.modelAnswer,
          hideRubricFromStudents: formState.hideRubricFromStudents,
          rubric: formState.rubric.map(({ criterion, maxMarks: marks, description }) => ({
            criterion: criterion.trim(),
            maxMarks: Number(marks),
            description: description.trim()
          }))
        })
      });
      toast.success(result.message || "Assignment published.");
      resetForm();
      onPublished?.();
    } catch (error) {
      setFormError(error.message || "Failed to upload question.");
      toast.error(error.message || "Failed to upload question.");
    } finally {
      setSaving(false);
    }
  };

  const preview = useMemo(() => formState, [formState]);

  return (
    <div className="teacher-ai-tab-content" id="upload">
      <div className="ui-page-header">
        <div>
          <h2>Create assignment</h2>
          <p className="ui-live">Guided setup keeps rubric totals aligned before students see the question.</p>
        </div>
      </div>
      <div className="teacher-ai-upload-form-container teacher-ai-upload-form-wide">
        <FormStepper steps={STEPS} current={step} onSelect={(index) => index <= step && setStep(index)} />
        <form
          className="teacher-ai-upload-form"
          onSubmit={(event) => {
            event.preventDefault();
          }}
        >
          {step === 0 && (
            <>
              <div className="ui-field">
                <label htmlFor="questionTitle">Question Title</label>
                <input type="text" id="questionTitle" name="questionTitle" value={formState.questionTitle} onChange={handleChange} required />
                {fieldErrors.questionTitle && <p className="ui-field-error">{fieldErrors.questionTitle}</p>}
              </div>
              <div className="ui-field">
                <label htmlFor="questionText">Question Text</label>
                <textarea id="questionText" name="questionText" rows="6" value={formState.questionText} onChange={handleChange} required />
                {fieldErrors.questionText && <p className="ui-field-error">{fieldErrors.questionText}</p>}
              </div>
              <div className="ui-field">
                <label htmlFor="maxMarks">Maximum Marks</label>
                <input type="number" id="maxMarks" name="maxMarks" min="1" max="100" value={formState.maxMarks} onChange={handleChange} required />
                {fieldErrors.maxMarks && <p className="ui-field-error">{fieldErrors.maxMarks}</p>}
              </div>
              <div className="ui-field">
                <label htmlFor="subject">Subject</label>
                <select id="subject" name="subject" value={formState.subject} onChange={handleChange} required>
                  <option value="">Select Subject</option>
                  {SUBJECTS.map((subject) => (
                    <option key={subject.value} value={subject.value}>{subject.label}</option>
                  ))}
                </select>
                {fieldErrors.subject && <p className="ui-field-error">{fieldErrors.subject}</p>}
              </div>
              <div className="ui-field">
                <label htmlFor="dueDate">Due Date</label>
                <input type="date" id="dueDate" name="dueDate" min={todayInputDate()} value={formState.dueDate} onChange={handleChange} required />
                {fieldErrors.dueDate && <p className="ui-field-error">{fieldErrors.dueDate}</p>}
              </div>
            </>
          )}

          {step === 1 && (
            <div className="ui-field">
              <label htmlFor="modelAnswer">Model Answer</label>
              <textarea
                id="modelAnswer"
                name="modelAnswer"
                rows="10"
                value={formState.modelAnswer}
                onChange={handleChange}
                placeholder="Reference answer the AI should grade against"
                required
              />
              {fieldErrors.modelAnswer && <p className="ui-field-error">{fieldErrors.modelAnswer}</p>}
            </div>
          )}

          {step === 2 && (
            <>
              <RubricBuilder
                rubric={formState.rubric}
                maxMarks={formState.maxMarks}
                onChange={(rubric) => {
                  setDirty(true);
                  setFormState((prev) => ({ ...prev, rubric }));
                }}
              />
              <label className="teacher-ai-checkbox">
                <input
                  type="checkbox"
                  name="hideRubricFromStudents"
                  checked={formState.hideRubricFromStudents}
                  onChange={handleChange}
                />
                Hide criterion-level breakdown from students
              </label>
              {fieldErrors.rubric && <p className="ui-field-error" role="alert">{fieldErrors.rubric}</p>}
            </>
          )}

          {step === 3 && (
            <CalibrationPanel
              questionText={formState.questionText}
              modelAnswer={formState.modelAnswer}
              rubric={formState.rubric}
              maxMarks={formState.maxMarks}
            />
          )}

          {step === 4 && (
            <section className="ui-stack">
              <article className="ui-card">
                <h3>{preview.questionTitle || "Untitled assignment"}</h3>
                <p className="ui-live">{preview.subject || "No subject"} · {preview.maxMarks} marks · Due {preview.dueDate || "not set"}</p>
                <p style={{ marginTop: 12 }}>{preview.questionText}</p>
              </article>
              <article className="ui-card">
                <h4>Model answer</h4>
                <p>{preview.modelAnswer}</p>
              </article>
              <article className="ui-card">
                <h4>Rubric · {rubricTotal(preview.rubric)} / {preview.maxMarks}</h4>
                <ul>
                  {preview.rubric.map((item) => (
                    <li key={item.id}>{item.criterion || "Untitled"} ({item.maxMarks}) — {item.description}</li>
                  ))}
                </ul>
                <p className="ui-live">
                  {preview.hideRubricFromStudents
                    ? "Students will not see criterion-level scores."
                    : "Students will see the rubric breakdown after grading."}
                </p>
              </article>
            </section>
          )}

          {formError && <p className="login-error" role="alert">{formError}</p>}
          <div className="teacher-ai-form-actions">
            <button type="button" className="ui-btn ui-btn-secondary" onClick={() => setResetOpen(true)}>Reset</button>
            {step > 0 && (
              <button type="button" className="ui-btn ui-btn-ghost" onClick={() => setStep((current) => current - 1)}>Back</button>
            )}
            {step < STEPS.length - 1 ? (
              <button type="button" className="ui-btn ui-btn-primary" onClick={goNext}>
                Continue
              </button>
            ) : (
              <button type="button" className="ui-btn ui-btn-primary" disabled={saving} onClick={publishAssignment}>
                {saving ? "Publishing…" : "Publish assignment"}
              </button>
            )}
          </div>
        </form>
      </div>
      <ConfirmDialog
        open={resetOpen}
        title="Reset this assignment?"
        description="All entered question, rubric, and calibration details will be cleared."
        confirmLabel="Reset form"
        tone="danger"
        onCancel={() => setResetOpen(false)}
        onConfirm={resetForm}
      />
    </div>
  );
}

export default TeacherUploadQuestion;
