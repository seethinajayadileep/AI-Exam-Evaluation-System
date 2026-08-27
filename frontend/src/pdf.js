function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function exportEvaluationPdf(assignment, viewer = "Student") {
  if (!assignment) return;
  const rubric = (assignment.evaluation && assignment.evaluation.rubric) || {};
  const missing = (assignment.evaluation && assignment.evaluation.missingPoints) || [];
  const suggestions = (assignment.evaluation && assignment.evaluation.suggestions) || [];
  const method = (assignment.evaluation && assignment.evaluation.method) || "n/a";

  const rubricHtml = Object.entries(rubric)
    .map(([key, item]) => {
      const label = key.replace(/([A-Z])/g, " $1");
      return `<tr><td>${escapeHtml(label)}</td><td>${escapeHtml(item.score)} / ${escapeHtml(
        item.max
      )}</td><td>${escapeHtml(item.comment)}</td></tr>`;
    })
    .join("");

  const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(assignment.title)} — evaluation</title>
    <style>
      body { font-family: Georgia, serif; color: #1c1917; padding: 32px; }
      h1 { font-size: 28px; margin-bottom: 4px; }
      .meta { color: #57534e; margin-bottom: 24px; }
      .score { font-size: 22px; margin: 16px 0; }
      table { width: 100%; border-collapse: collapse; margin: 12px 0 24px; }
      th, td { border: 1px solid #d6d3d1; padding: 8px; text-align: left; vertical-align: top; }
      th { background: #f5f5f4; }
      ul { margin: 0 0 20px 18px; }
      .box { background: #fafaf9; padding: 12px; border: 1px solid #e7e5e4; }
    </style>
  </head>
  <body>
    <h1>Subjective AI — Evaluation report</h1>
    <div class="meta">Prepared for ${escapeHtml(viewer)} · ${new Date().toLocaleString()}</div>
    <h2>${escapeHtml(assignment.title)}</h2>
    <div class="meta">${escapeHtml(assignment.subject)} · Due ${escapeHtml(assignment.dueDate)} · Method: ${escapeHtml(method)}</div>
    <div class="score">Score: <strong>${escapeHtml(assignment.score ?? "—")} / ${escapeHtml(assignment.maxMarks)}</strong></div>
    <h3>Question</h3>
    <p>${escapeHtml(assignment.text)}</p>
    <h3>Submitted answer</h3>
    <div class="box">${escapeHtml(assignment.submittedAnswer || "Not submitted")}</div>
    <h3>Overall feedback</h3>
    <p>${escapeHtml(assignment.feedback || "No feedback yet.")}</p>
    <h3>Rubric</h3>
    <table>
      <thead><tr><th>Criterion</th><th>Score</th><th>Comment</th></tr></thead>
      <tbody>${rubricHtml || "<tr><td colspan='3'>No rubric breakdown stored.</td></tr>"}</tbody>
    </table>
    <h3>Missing points</h3>
    <ul>${missing.length ? missing.map((item) => `<li>${escapeHtml(item)}</li>`).join("") : "<li>None recorded</li>"}</ul>
    <h3>Suggestions</h3>
    <ul>${suggestions.length ? suggestions.map((item) => `<li>${escapeHtml(item)}</li>`).join("") : "<li>None recorded</li>"}</ul>
    <script>window.onload = () => window.print();</script>
  </body>
</html>`;

  const popup = window.open("", "_blank", "noopener,noreferrer,width=900,height=700");
  if (!popup) {
    throw new Error("Pop-up blocked. Allow pop-ups to export the PDF.");
  }
  popup.document.write(html);
  popup.document.close();
}
