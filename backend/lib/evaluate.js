const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const DEFAULT_MODEL = "gpt-4o-mini";
const FALLBACK_MODELS = ["gpt-4.1-mini", "gpt-4o"];

const GRADE_SCHEMA = {
    type: "object",
    additionalProperties: false,
    properties: {
        score: { type: "number" },
        confidence: { type: "number" },
        criteria: {
            type: "array",
            items: {
                type: "object",
                additionalProperties: false,
                properties: {
                    criterion: { type: "string" },
                    score: { type: "number" },
                    maxMarks: { type: "number" },
                    comment: { type: "string" }
                },
                required: ["criterion", "score", "maxMarks", "comment"]
            }
        },
        feedback: { type: "string" },
        strengths: { type: "array", items: { type: "string" } },
        improvements: { type: "array", items: { type: "string" } }
    },
    required: ["score", "confidence", "criteria", "feedback", "strengths", "improvements"]
};

function getApiKey() {
    return String(process.env.OPENAI_API_KEY || "").trim();
}

function cleanLine(value) {
    return String(value || "")
        .replace(/```[\s\S]*?```/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function clampScore(value, max) {
    const num = Number(value);
    if (Number.isNaN(num)) return 0;
    return Math.max(0, Math.min(max, Math.round(num)));
}

function extractJson(text) {
    if (!text) return null;
    let raw = String(text).trim().replace(/^\uFEFF/, "");
    const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fenced) raw = fenced[1].trim();
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    if (start === -1 || end === -1) return null;
    const slice = raw.slice(start, end + 1);
    try {
        return JSON.parse(slice);
    } catch {
        try {
            return JSON.parse(slice.replace(/,\s*([}\]])/g, "$1"));
        } catch {
            return null;
        }
    }
}

function unwrapGrade(parsed) {
    if (!parsed || typeof parsed !== "object") return null;
    if (typeof parsed.score !== "undefined" || Array.isArray(parsed.criteria)) return parsed;
    const nested = parsed.grade || parsed.evaluation || parsed.result || parsed.data;
    if (nested && typeof nested === "object") return nested;
    return parsed;
}

function normalizeList(values) {
    return (Array.isArray(values) ? values : [])
        .map(cleanLine)
        .filter(Boolean)
        .slice(0, 3);
}

function normalizeEvaluation(parsed, rubric, maxMarks, modelUsed) {
    const source = unwrapGrade(parsed) || {};
    const rubricItems = Array.isArray(rubric) ? rubric : [];
    const rawCriteria = Array.isArray(source.criteria) ? source.criteria : [];

    const criteria = rubricItems.length
        ? rubricItems.map((item, index) => {
            const match = rawCriteria.find((row) => (
                cleanLine(row.criterion).toLowerCase() === cleanLine(item.criterion).toLowerCase()
            )) || rawCriteria[index] || {};
            const itemMax = Number(item.maxMarks) || 0;
            return {
                criterion: item.criterion,
                score: clampScore(match.score, itemMax),
                maxMarks: itemMax,
                comment: cleanLine(match.comment).slice(0, 240)
            };
        })
        : rawCriteria.slice(0, 8).map((item) => {
            const itemMax = Number(item.maxMarks) || maxMarks;
            return {
                criterion: cleanLine(item.criterion) || "Criterion",
                score: clampScore(item.score, itemMax),
                maxMarks: itemMax,
                comment: cleanLine(item.comment).slice(0, 240)
            };
        });

    const criteriaTotal = criteria.reduce((sum, item) => sum + item.score, 0);
    const score = criteria.length
        ? clampScore(criteriaTotal, maxMarks)
        : clampScore(source.score, maxMarks);

    return {
        score,
        confidence: Math.max(0, Math.min(1, Number(source.confidence) || 0.5)),
        criteria,
        feedback: cleanLine(source.feedback).slice(0, 600) || "No feedback was generated.",
        strengths: normalizeList(source.strengths),
        improvements: normalizeList(source.improvements),
        rawModel: modelUsed
    };
}

function publicAiError(error) {
    const status = error?.status;
    if (status === 401 || status === 403) {
        return "OpenAI rejected the API key. Check OPENAI_API_KEY.";
    }
    if (status === 429) {
        return "The AI grader is rate limited. Try again in a moment.";
    }
    return error?.message || "AI evaluation failed.";
}

async function generateWithModel(modelName, messages, { schema = GRADE_SCHEMA, schemaName = "exam_grade", jsonSchema = true } = {}) {
    const key = getApiKey();
    const body = {
        model: modelName,
        messages,
        temperature: 0.1,
        max_tokens: 900
    };

    if (jsonSchema) {
        body.response_format = {
            type: "json_schema",
            json_schema: {
                name: schemaName,
                strict: true,
                schema
            }
        };
    } else {
        body.response_format = { type: "json_object" };
    }

    const response = await fetch(OPENAI_URL, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${key}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
        const err = new Error(payload?.error?.message || `OpenAI request failed (${response.status}).`);
        err.status = response.status;
        throw err;
    }

    const text = payload?.choices?.[0]?.message?.content;
    if (!text) {
        throw new Error("The AI evaluator returned an empty response.");
    }
    return { text, modelUsed: payload?.model || modelName };
}

async function generateJson(messages, options = {}) {
    const preferred = process.env.OPENAI_MODEL || DEFAULT_MODEL;
    const models = [preferred, ...FALLBACK_MODELS.filter((name) => name !== preferred)];
    let lastError;

    for (const modelName of models) {
        for (const jsonSchema of [true, false]) {
            try {
                return await generateWithModel(modelName, messages, { ...options, jsonSchema });
            } catch (error) {
                lastError = error;
                const message = String(error.message || "").toLowerCase();
                const retryWithoutSchema = jsonSchema && (
                    error.status === 400
                    || message.includes("response_format")
                    || message.includes("json_schema")
                    || message.includes("structured")
                );
                if (retryWithoutSchema) continue;
                break;
            }
        }
    }

    throw lastError || new Error("AI evaluation failed.");
}

function gradeMessages({ question, modelAnswer, rubric, studentAnswer, maxMarks }) {
    const rubricItems = Array.isArray(rubric) && rubric.length
        ? rubric
        : [{ criterion: "Overall quality", maxMarks, description: "Accuracy, completeness, and clarity." }];

    const rubricText = rubricItems
        .map((item, index) => `${index + 1}. ${item.criterion} (max ${item.maxMarks}): ${item.description || ""}`)
        .join("\n");

    return [
        {
            role: "system",
            content: "You are an exam grader. Return JSON only. No markdown, no extra keys, no commentary."
        },
        {
            role: "user",
            content: `Grade the student answer against the question, model answer, and rubric.
Use the exact criterion names and max marks. Criterion scores must sum to the overall score, which cannot exceed ${maxMarks}.
Keep feedback to 2 short sentences. Strengths and improvements: at most 3 short phrases each.

JSON shape:
{"score":number,"confidence":number,"criteria":[{"criterion":string,"score":number,"maxMarks":number,"comment":string}],"feedback":string,"strengths":[string],"improvements":[string]}

Question: ${question}
Maximum marks: ${maxMarks}
Model answer: ${modelAnswer || "Not provided. Grade on correctness and completeness."}
Rubric:
${rubricText}
Student answer:
${studentAnswer}`
        }
    ];
}

async function evaluateSubmission({ question, modelAnswer, rubric, studentAnswer, maxMarks }) {
    if (!getApiKey()) {
        throw new Error("AI evaluation is not configured. Add an OPENAI_API_KEY to grade with AI.");
    }

    try {
        const { text, modelUsed } = await generateJson(
            gradeMessages({ question, modelAnswer, rubric, studentAnswer, maxMarks })
        );
        const parsed = extractJson(text);
        if (!parsed) {
            throw new Error("The AI evaluator returned an unreadable response. Please grade manually.");
        }
        return normalizeEvaluation(parsed, rubric, maxMarks, modelUsed);
    } catch (error) {
        throw new Error(publicAiError(error));
    }
}

async function suggestRubricImprovements({ question, rubric, results }) {
    const summary = results.map((item) => (
        `${item.label}: expected ${item.expectedScore}, AI ${item.aiScore}, difference ${item.difference}`
    )).join("\n");
    try {
        const { text } = await generateJson([
            {
                role: "system",
                content: "You calibrate exam rubrics. Return JSON only: {\"suggestions\":[string]} with 2-5 short suggestions."
            },
            {
                role: "user",
                content: `Question: ${question}\nRubric: ${JSON.stringify(rubric)}\nResults:\n${summary}`
            }
        ], {
            schemaName: "rubric_suggestions",
            schema: {
                type: "object",
                additionalProperties: false,
                properties: { suggestions: { type: "array", items: { type: "string" } } },
                required: ["suggestions"]
            }
        });
        const parsed = extractJson(text);
        const suggestions = Array.isArray(parsed?.suggestions)
            ? parsed.suggestions.map(cleanLine).filter(Boolean).slice(0, 5)
            : [];
        return suggestions;
    } catch {
        return ["If scores drifted, make each criterion more specific about what earns full marks versus partial marks."];
    }
}

async function calibrateSamples({ question, modelAnswer, rubric, maxMarks, samples }) {
    const results = [];
    for (const sample of samples) {
        const evaluation = await evaluateSubmission({
            question,
            modelAnswer,
            rubric,
            studentAnswer: sample.answer,
            maxMarks
        });
        const expectedScore = Number(sample.expectedScore);
        const expectedRatio = maxMarks ? expectedScore / maxMarks : 0;
        const disagreements = (evaluation.criteria || []).filter((item) => {
            const ratio = item.maxMarks ? item.score / item.maxMarks : 0;
            return Math.abs(ratio - expectedRatio) >= 0.25;
        });
        results.push({
            label: sample.label || "Sample",
            expectedScore,
            aiScore: evaluation.score,
            difference: evaluation.score - expectedScore,
            confidence: evaluation.confidence,
            criteria: evaluation.criteria,
            disagreements,
            feedback: evaluation.feedback
        });
    }
    const suggestedRubricImprovements = await suggestRubricImprovements({ question, rubric, results });
    return { results, suggestedRubricImprovements };
}

module.exports = { evaluateSubmission, calibrateSamples };
