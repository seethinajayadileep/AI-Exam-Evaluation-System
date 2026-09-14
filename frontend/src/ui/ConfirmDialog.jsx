import React, { useCallback } from "react";
import { useEscape } from "./useEscape";
import { Icons } from "./icons";

function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "primary",
  onConfirm,
  onCancel
}) {
  const handleCancel = useCallback(() => onCancel?.(), [onCancel]);
  useEscape(open, handleCancel);

  if (!open) return null;

  return (
    <div className="ui-dialog-overlay" onClick={handleCancel}>
      <div
        className="ui-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-desc"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="ui-dialog-header">
          <h2 id="confirm-title">{title}</h2>
          <button type="button" className="ui-icon-btn" aria-label="Close confirmation dialog" onClick={handleCancel}>
            {Icons.Close()}
          </button>
        </div>
        <p id="confirm-desc">{description}</p>
        <div className="ui-dialog-actions">
          <button type="button" className="ui-btn ui-btn-secondary" onClick={handleCancel}>{cancelLabel}</button>
          <button
            type="button"
            className={`ui-btn ${tone === "danger" ? "ui-btn-danger" : "ui-btn-primary"}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
