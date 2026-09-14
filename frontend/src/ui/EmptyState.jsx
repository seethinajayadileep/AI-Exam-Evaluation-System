import React from "react";

function EmptyState({ title, description, action }) {
  return (
    <div className="ui-empty">
      <h3>{title}</h3>
      {description ? <p>{description}</p> : null}
      {action}
    </div>
  );
}

export default EmptyState;
