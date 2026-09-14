import React from "react";

function MetricCard({ label, value, hint }) {
  return (
    <article className="ui-metric">
      <p className="ui-metric-value">{value}</p>
      <p className="ui-metric-label">{label}</p>
      {hint ? <p className="ui-live">{hint}</p> : null}
    </article>
  );
}

export default MetricCard;
