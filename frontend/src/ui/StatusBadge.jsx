import React from "react";
import { displayStatus } from "../utils/dates";

function StatusBadge({ status, children }) {
  const label = children || displayStatus(status);
  return <span className={`ui-badge ui-badge-${status || "neutral"}`}>{label}</span>;
}

export default StatusBadge;
