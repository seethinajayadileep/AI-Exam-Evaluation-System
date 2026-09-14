export function draftStorageKey(userId, assignmentId) {
  if (!userId || !assignmentId) return null;
  return `examEvalDraft:${userId}:${assignmentId}`;
}

export function readLocalDraft(userId, assignmentId) {
  const key = draftStorageKey(userId, assignmentId);
  if (!key) return null;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function draftExists(userId, assignmentId) {
  const local = readLocalDraft(userId, assignmentId);
  return Boolean(String(local?.answer || "").trim());
}

export function assignmentHasDraft(assignment, userId) {
  if (!assignment || assignment.status !== "pending") return false;
  if (assignment.hasDraft) return true;
  return draftExists(userId, assignment._id);
}

export function writeLocalDraft(userId, assignmentId, answer) {
  const key = draftStorageKey(userId, assignmentId);
  if (!key) return null;
  const payload = { answer, savedAt: new Date().toISOString() };
  localStorage.setItem(key, JSON.stringify(payload));
  return payload;
}

export function clearLocalDraft(userId, assignmentId) {
  const key = draftStorageKey(userId, assignmentId);
  if (key) localStorage.removeItem(key);
}
