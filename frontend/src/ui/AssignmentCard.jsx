import React from "react";
import StatusBadge from "./StatusBadge";
import OverflowMenu from "./OverflowMenu";
import { formatDate } from "../utils/dates";

function AssignmentCard({
  id,
  highlighted = false,
  title,
  subject,
  dueDate,
  status,
  submissions = 0,
  graded = 0,
  actions = [],
  children
}) {
  const percent = submissions > 0 ? Math.round((graded / submissions) * 100) : 0;
  return (
    <article
      id={id ? `assignment-${id}` : undefined}
      className={`ui-card ${highlighted ? "is-highlighted" : ""}`}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <div>
          <h3 style={{ marginBottom: 6 }}>{title}</h3>
          <p className="ui-live">{subject} · Due {formatDate(dueDate)}</p>
        </div>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
          <StatusBadge status={status} />
          {actions.length > 0 && <OverflowMenu label={`Actions for ${title}`} items={actions} />}
        </div>
      </div>
      {children}
      <div style={{ marginTop: 16 }}>
        <p className="ui-live">{graded} graded of {submissions} submissions</p>
        <div className="ui-progress" aria-label={`${percent} percent graded`}>
          <span style={{ width: `${percent}%` }} />
        </div>
      </div>
    </article>
  );
}

export default AssignmentCard;
