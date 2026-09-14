import React, { useState } from "react";
import { submitRegradeRequest } from "../services/regrade";

function RequestRegrade({ assignment, onClose }) {
  const [criterion, setCriterion] = useState(assignment?.rubric?.[0]?.criterion || assignment?.aiEvaluation?.criteria?.[0]?.criterion || "");
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");
  const options = assignment?.aiEvaluation?.criteria?.length
    ? assignment.aiEvaluation.criteria
    : assignment?.rubric || [];

  const handleSubmit = async (event) => {
    event.preventDefault();
    const result = await submitRegradeRequest({
      assignmentId: assignment?._id,
      criterion,
      reason
    });
    setMessage(result.message);
  };

  return (
    <form className="ui-stack" onSubmit={handleSubmit}>
      <h3>Request regrade</h3>
      <div className="ui-field">
        <label htmlFor="regrade-criterion">Rubric criterion</label>
        <select id="regrade-criterion" value={criterion} onChange={(e) => setCriterion(e.target.value)} required>
          <option value="">Select a criterion</option>
          {options.map((item) => (
            <option key={item.criterion} value={item.criterion}>{item.criterion}</option>
          ))}
        </select>
      </div>
      <div className="ui-field">
        <label htmlFor="regrade-reason">Explain the concern</label>
        <textarea id="regrade-reason" rows="4" value={reason} onChange={(e) => setReason(e.target.value)} required />
      </div>
      {message && <p className="ui-live" role="status">{message}</p>}
      <div className="ui-dialog-actions">
        <button type="button" className="ui-btn ui-btn-secondary" onClick={onClose}>Cancel</button>
        <button type="submit" className="ui-btn ui-btn-primary">Submit request</button>
      </div>
    </form>
  );
}

export default RequestRegrade;
