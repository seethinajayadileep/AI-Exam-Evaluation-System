import React, { useState } from "react";
import "./RubricBuilder.css";

export function createRubricItem() {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    criterion: "",
    maxMarks: 5,
    description: ""
  };
}

export function withRubricIds(items) {
  return (items || []).map((item) => ({
    ...createRubricItem(),
    ...item,
    id: item.id || `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
  }));
}

export function rubricTotal(rubric) {
  return (rubric || []).reduce((sum, item) => sum + (Number(item.maxMarks) || 0), 0);
}

export function rubricIsBalanced(rubric, maxMarks) {
  return rubricTotal(rubric) === Number(maxMarks);
}

function RubricBuilder({ rubric, maxMarks, onChange }) {
  const [dragIndex, setDragIndex] = useState(null);
  const total = rubricTotal(rubric);
  const balanced = total === Number(maxMarks);

  const update = (next) => onChange(next);

  const changeField = (index, field, value) => {
    update(rubric.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  };

  const move = (from, to) => {
    if (to < 0 || to >= rubric.length) return;
    const next = [...rubric];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    update(next);
  };

  return (
    <fieldset className="rubric-builder">
      <legend>Rubric</legend>
      <p className={`rubric-total ${balanced ? "is-balanced" : "is-unbalanced"}`} aria-live="polite">
        Rubric total: {total} / {maxMarks || 0}
        {balanced ? " — matches maximum marks" : " — must equal maximum marks before publishing"}
      </p>
      <ol className="rubric-builder-list">
        {rubric.map((item, index) => (
          <li
            key={item.id}
            className={`rubric-builder-row ${dragIndex === index ? "is-dragging" : ""}`}
            draggable
            onDragStart={() => setDragIndex(index)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => {
              if (dragIndex === null || dragIndex === index) return;
              move(dragIndex, index);
              setDragIndex(null);
            }}
            onDragEnd={() => setDragIndex(null)}
          >
            <span className="rubric-drag-handle" aria-hidden="true">⋮⋮</span>
            <div className="rubric-builder-fields">
              <label htmlFor={`rubric-criterion-${item.id}`}>Criterion {index + 1}</label>
              <input
                id={`rubric-criterion-${item.id}`}
                value={item.criterion}
                onChange={(e) => changeField(index, "criterion", e.target.value)}
                placeholder="e.g. Correct method"
                required
              />
              <label htmlFor={`rubric-marks-${item.id}`}>Marks</label>
              <input
                id={`rubric-marks-${item.id}`}
                type="number"
                min="1"
                max="100"
                value={item.maxMarks}
                onChange={(e) => changeField(index, "maxMarks", Number(e.target.value))}
                required
              />
              <label htmlFor={`rubric-desc-${item.id}`}>Description</label>
              <input
                id={`rubric-desc-${item.id}`}
                value={item.description}
                onChange={(e) => changeField(index, "description", e.target.value)}
                placeholder="What a full-mark answer includes"
                required
              />
            </div>
            <div className="rubric-builder-actions">
              <button type="button" onClick={() => move(index, index - 1)} disabled={index === 0} aria-label={`Move criterion ${index + 1} up`}>
                Up
              </button>
              <button type="button" onClick={() => move(index, index + 1)} disabled={index === rubric.length - 1} aria-label={`Move criterion ${index + 1} down`}>
                Down
              </button>
              <button
                type="button"
                className="rubric-remove"
                onClick={() => update(rubric.filter((_, i) => i !== index))}
                disabled={rubric.length === 1}
                aria-label={`Remove criterion ${index + 1}`}
              >
                Remove
              </button>
            </div>
          </li>
        ))}
      </ol>
      <button type="button" className="teacher-ai-btn teacher-ai-btn-secondary" onClick={() => update([...rubric, createRubricItem()])}>
        Add criterion
      </button>
    </fieldset>
  );
}

export default RubricBuilder;
