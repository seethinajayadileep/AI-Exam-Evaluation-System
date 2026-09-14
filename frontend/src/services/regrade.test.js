import { submitRegradeRequest } from "./regrade";

test("keeps regrade requests as an isolated placeholder", async () => {
  const result = await submitRegradeRequest({ criterion: "Method", reason: "Missed evidence" });
  expect(result.placeholder).toBe(true);
  expect(result.ok).toBe(false);
});
