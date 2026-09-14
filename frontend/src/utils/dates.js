export function formatDate(value) {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

export function formatDateTime(value) {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

export function isExpired(dueDate) {
  if (!dueDate) return false;
  const due = new Date(`${dueDate}T23:59:59`);
  return due < new Date();
}

export function daysUntilDue(dueDate) {
  const due = new Date(`${dueDate}T00:00:00`);
  const today = new Date();
  due.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function displayStatus(status) {
  const labels = {
    pending: "Pending",
    submitted: "Submitted",
    pending_review: "Pending review",
    graded: "Graded",
    expired: "Expired",
    open: "Open"
  };
  return labels[status] || status;
}

export function assignmentCardStatus({ dueDate, submissions = 0, graded = 0 } = {}) {
  const total = Number(submissions) || 0;
  const done = Number(graded) || 0;
  if (total > 0 && done >= total) return "graded";
  if (total > done) return "pending_review";
  if (isExpired(dueDate)) return "expired";
  return "open";
}

export function formatScore(score, maxMarks) {
  if (score === null || score === undefined || score === "") {
    return "Not graded";
  }
  return `${score}/${maxMarks}`;
}

export function reviewScoreLabel(item) {
  if (!item) return "Not graded";
  if (item.status === "graded") return formatScore(item.score, item.maxMarks);
  const hasSuggestion = item.score !== null && item.score !== undefined && item.score !== "";
  if (item.status === "pending_review" && hasSuggestion) {
    return `AI suggested: ${item.score}/${item.maxMarks}`;
  }
  return "Not graded";
}

export function isDueDateValid(dueDate, today = todayInputDate()) {
  return Boolean(dueDate) && dueDate >= today;
}

export function todayInputDate() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const local = new Date(now.getTime() - offset * 60000);
  return local.toISOString().slice(0, 10);
}

export function wordCount(text) {
  return String(text || "").trim().split(/\s+/).filter(Boolean).length;
}
