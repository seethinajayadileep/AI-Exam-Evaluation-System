import React, { useState } from "react";
import { api } from "../api/client";
import "./CalibrationPanel.css";

function emptySample(index) {
  return { label: `Sample ${index + 1}`, answer: "", expectedScore: "" };
}

function CalibrationPanel({ questionText, modelAnswer, rubric, maxMarks }) {
  const [samples, setSamples] = useState([emptySample(0), emptySample(1)]);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");
  const [report, setReport] = useState(null);

  const updateSample = (index, field, value) => {
    setSamples((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  };

  const readySamples = samples.filter((item) => item.answer.trim() && item.expectedScore !== "");

  const runCalibration = async () => {
    setError("");
    if (readySamples.length < 2) {
      setError("Add at least two sample answers with expected scores.");
      return;
    }
    setRunning(true);
    try {
      const data = await api("/api/assignments/calibrate", {
        method: "POST",
        body: JSON.stringify({
          questionText,
          modelAnswer,
          rubric,
          maxMarks: Number(maxMarks),
          samples: readySamples.map((item) => ({
            label: item.label,
            answer: item.answer,
            expectedScore: Number(item.expectedScore)
          }))
        })
      });
      setReport(data);
    } catch (err) {
      setError(err.message || "Calibration failed.");
    } finally {
      setRunning(false);
    }
  };

  return (
    <section className="calibration-panel">
      <h3>AI calibration mode</h3>
      <p className="ui-live">
        Before publishing, give 2–3 sample answers with the scores you would award. The AI grades them against this rubric so you can see drift before students submit.
      </p>
      {samples.map((sample, index) => (
        <div key={index} className="calibration-sample">
          <div className="calibration-sample-head">
            <div className="ui-field">
              <label htmlFor={`sample-label-${index}`}>Sample name</label>
              <input
                id={`sample-label-${index}`}
                value={sample.label}
                onChange={(e) => updateSample(index, "label", e.target.value)}
              />
            </div>
            <div className="ui-field">
              <label htmlFor={`sample-score-${index}`}>Expected score</label>
              <input
                id={`sample-score-${index}`}
                type="number"
                min="0"
                max={maxMarks}
                value={sample.expectedScore}
                placeholder={`0–${maxMarks}`}
                onChange={(e) => updateSample(index, "expectedScore", e.target.value)}
              />
            </div>
            {samples.length > 2 && (
              <button
                type="button"
                className="ui-btn ui-btn-ghost calibration-remove"
                onClick={() => setSamples((prev) => prev.filter((_, i) => i !== index))}
              >
                Remove sample
              </button>
            )}
          </div>
          <div className="ui-field">
            <label htmlFor={`sample-answer-${index}`}>Sample answer</label>
            <textarea
              id={`sample-answer-${index}`}
              rows="4"
              value={sample.answer}
              onChange={(e) => updateSample(index, "answer", e.target.value)}
              placeholder="Paste or write a sample student answer"
            />
          </div>
        </div>
      ))}
      {samples.length < 3 && (
        <button type="button" className="ui-btn ui-btn-secondary" onClick={() => setSamples((prev) => [...prev, emptySample(prev.length)])}>
          Add another sample
        </button>
      )}
      <div className="calibration-actions">
        <button type="button" className="ui-btn ui-btn-primary" onClick={runCalibration} disabled={running}>
          {running ? "Calibrating…" : "Run calibration"}
        </button>
      </div>
      {error && <p className="login-error" role="alert">{error}</p>}
      {report && (
        <div className="calibration-report">
          <div className="ui-table-wrap">
            <table className="ui-table">
              <thead>
                <tr>
                  <th>Sample</th>
                  <th>Expected score</th>
                  <th>AI score</th>
                  <th>Difference</th>
                  <th>Confidence</th>
                </tr>
              </thead>
              <tbody>
                {report.results.map((item) => (
                  <tr key={item.label}>
                    <td>{item.label}</td>
                    <td>{item.expectedScore}</td>
                    <td>{item.aiScore}</td>
                    <td>{item.difference > 0 ? `+${item.difference}` : item.difference}</td>
                    <td>{Math.round((item.confidence || 0) * 100)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {report.results.map((item) => (
            <article key={`${item.label}-notes`} className="calibration-result">
              <h4>{item.label}</h4>
              {item.disagreements?.length > 0 && (
                <div>
                  <p><strong>Criterion disagreements</strong></p>
                  <ul>
                    {item.disagreements.map((row, idx) => (
                      <li key={idx}>{row.criterion}: AI {row.score}/{row.maxMarks} — {row.comment}</li>
                    ))}
                  </ul>
                </div>
              )}
            </article>
          ))}
          {report.suggestedRubricImprovements?.length > 0 && (
            <div className="calibration-suggestions">
              <h4>Suggested rubric improvements</h4>
              <ul>
                {report.suggestedRubricImprovements.map((tip, index) => (
                  <li key={index}>{tip}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export default CalibrationPanel;
