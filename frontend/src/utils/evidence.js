export function extractEvidence(answer, comment) {
  const text = String(answer || "");
  const tokens = String(comment || "")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 4);
  if (!text || tokens.length === 0) return "";
  const sentences = text.split(/(?<=[.!?])\s+/);
  const match = sentences.find((sentence) => {
    const lower = sentence.toLowerCase();
    return tokens.some((token) => lower.includes(token));
  });
  return (match || "").trim();
}

export function highlightAnswer(answer, comment) {
  const evidence = extractEvidence(answer, comment);
  if (!evidence) return answer;
  return answer;
}
