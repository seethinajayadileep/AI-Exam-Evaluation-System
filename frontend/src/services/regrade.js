// TODO: Persist regrade requests when the backend exposes POST /api/submissions/:id/regrade
export async function submitRegradeRequest(payload) {
  return {
    ok: false,
    placeholder: true,
    message: "Regrade requests are not stored yet. This UI is ready for a future API.",
    payload
  };
}
