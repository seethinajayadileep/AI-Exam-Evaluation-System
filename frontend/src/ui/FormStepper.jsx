import React from "react";

function FormStepper({ steps, current, onSelect }) {
  return (
    <nav className="ui-stepper" aria-label="Form steps">
      {steps.map((step, index) => {
        const state = index === current ? "is-active" : index < current ? "is-complete" : "";
        return (
          <button
            key={step.id || step.label}
            type="button"
            className={`ui-step ${state}`}
            aria-current={index === current ? "step" : undefined}
            onClick={() => onSelect?.(index)}
          >
            {index + 1}. {step.label}
          </button>
        );
      })}
    </nav>
  );
}

export default FormStepper;
