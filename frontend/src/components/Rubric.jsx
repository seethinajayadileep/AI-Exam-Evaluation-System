export function Rubric({ assignment }) {
  const evaluation = assignment?.evaluation;
  const rubric = evaluation?.rubric || {};
  const missing = evaluation?.missingPoints || [];
  const suggestions = evaluation?.suggestions || [];

  return (
    <div className="list">
      <div className="score-hero">
        <div>
          <div className="kicker">Result</div>
          <div>
            {assignment.status === "graded" ? "Graded with rubric breakdown" : "Awaiting evaluation"}
          </div>
          <div className="muted">
            Method: {evaluation?.method || "—"}
            {assignment.studentName ? ` · ${assignment.studentName}` : ""}
          </div>
        </div>
        <strong>
          {assignment.score ?? "—"}/{assignment.maxMarks}
        </strong>
      </div>

      {assignment.feedback ? (
        <div>
          <h4>Overall feedback</h4>
          <p>{assignment.feedback}</p>
        </div>
      ) : null}

      {Object.keys(rubric).length ? (
        <div className="rubric">
          {Object.entries(rubric).map(([key, item]) => (
            <div className="rubric-item" key={key}>
              <strong>{key.replace(/([A-Z])/g, " $1")}</strong>
              <div className="muted">
                {item.score} / {item.max}
              </div>
              <p>{item.comment}</p>
            </div>
          ))}
        </div>
      ) : null}

      {missing.length ? (
        <div>
          <h4>Missing points</h4>
          <ul>
            {missing.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {suggestions.length ? (
        <div>
          <h4>Suggestions</h4>
          <ul>
            {suggestions.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
