import React from "react";

function RubricCriterionCard({ criterion, score, maxMarks, comment, tone = "neutral", evidence }) {
  const ratio = maxMarks ? score / maxMarks : 0;
  const resolvedTone = tone !== "neutral" ? tone : ratio >= 0.8 ? "success" : ratio >= 0.5 ? "warning" : "danger";
  return (
    <article className="ui-card">
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <h4>{criterion}</h4>
        <strong>{score ?? "—"} / {maxMarks}</strong>
      </div>
      {comment ? <p className={resolvedTone === "success" ? "ui-strength" : "ui-improve"}>{comment}</p> : null}
      {evidence ? (
        <p className="ui-live"><strong>Evidence: </strong>{evidence}</p>
      ) : null}
    </article>
  );
}

export default RubricCriterionCard;
