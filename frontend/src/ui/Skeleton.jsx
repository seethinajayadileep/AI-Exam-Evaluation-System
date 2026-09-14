import React from "react";

function Skeleton({ rows = 3, height = 72 }) {
  return (
    <div className="ui-stack" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading</span>
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="ui-skeleton" style={{ height }} />
      ))}
    </div>
  );
}

export default Skeleton;
