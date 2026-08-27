const { GoogleGenerativeAI } = require("@google/generative-ai");

const STOPWORDS = new Set(
  `a an the and or but if then else for of to in on at by from with without about into over after before between is are was were be been being it this that those these i we you they he she them their our your not no so as than too very can could should would will just also into over under again further then once here there when where why how all any both each few more most other some such only own same so than too very`.split(
    /\s+/
  )
);

function tokenize(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 2 && !STOPWORDS.has(token));
}

function unique(list) {
  return [...new Set(list)];
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function round1(value) {
  return Math.round(value * 10) / 10;
}

function sentenceStats(text) {
  const trimmed = String(text || "").trim();
  const sentences = trimmed.split(/[.!?]+/).filter((part) => part.trim().length > 0);
  const words = trimmed.split(/\s+/).filter(Boolean);
  let capitalized = 0;
  sentences.forEach((sentence) => {
    const start = sentence.trim()[0];
    if (start && start === start.toUpperCase()) capitalized += 1;
  });
  const avgLen = words.length / Math.max(sentences.length, 1);
  const punctuation = (trimmed.match(/[.!?,;:]/g) || []).length;
  return {
    sentences: sentences.length,
    words: words.length,
    capitalized,
    avgLen,
    punctuation,
  };
}

function termFreq(tokens) {
  const map = new Map();
  tokens.forEach((token) => map.set(token, (map.get(token) || 0) + 1));
  return map;
}

function cosine(aTokens, bTokens) {
  const a = termFreq(aTokens);
  const b = termFreq(bTokens);
  let dot = 0;
  let magA = 0;
  let magB = 0;
  a.forEach((value, key) => {
    magA += value * value;
    if (b.has(key)) dot += value * b.get(key);
  });
  b.forEach((value) => {
    magB += value * value;
  });
  if (!magA || !magB) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

function missingFromModel(modelAnswer, studentAnswer) {
  const student = String(studentAnswer || "").toLowerCase();
  const sentences = String(modelAnswer || "")
    .split(/[.!?]/)
    .map((part) => part.trim())
    .filter((part) => part.length > 20);
  const gaps = sentences.filter((sentence) => {
    const tokens = tokenize(sentence);
    if (!tokens.length) return false;
    const hits = tokens.filter((token) => student.includes(token)).length;
    return hits / tokens.length < 0.45;
  });
  return gaps.slice(0, 5);
}

function heuristicEvaluate({ question, modelAnswer, studentAnswer, maxMarks }) {
  const modelTokens = tokenize(modelAnswer || question);
  const studentTokens = tokenize(studentAnswer);
  const modelKeys = unique(modelTokens);
  const studentSet = new Set(studentTokens);
  const covered = modelKeys.filter((key) => studentSet.has(key));
  const coverage = modelKeys.length ? covered.length / modelKeys.length : 0;
  const similarity = cosine(modelTokens, studentTokens);
  const stats = sentenceStats(studentAnswer);
  const missing = missingFromModel(modelAnswer, studentAnswer);

  let grammarRatio = 0.5;
  if (stats.sentences > 0) {
    const capScore = stats.capitalized / stats.sentences;
    const lengthScore = clamp(stats.words / 80, 0, 1);
    const punctScore = clamp(stats.punctuation / Math.max(stats.sentences, 1), 0, 1);
    const runOnPenalty = stats.avgLen > 40 ? 0.15 : 0;
    grammarRatio = clamp(0.35 * capScore + 0.4 * lengthScore + 0.25 * punctScore - runOnPenalty, 0.15, 1);
  }
  if (stats.words < 25) grammarRatio *= 0.7;

  const weights = { content: 0.4, semantic: 0.35, grammar: 0.25 };
  const contentMax = round1(maxMarks * weights.content);
  const semanticMax = round1(maxMarks * weights.semantic);
  const grammarMax = round1(maxMarks - contentMax - semanticMax);

  const contentScore = round1(contentMax * clamp(coverage, 0, 1));
  const semanticScore = round1(semanticMax * clamp(similarity * 1.15, 0, 1));
  const grammarScore = round1(grammarMax * grammarRatio);
  const score = clamp(Math.round(contentScore + semanticScore + grammarScore), 0, maxMarks);

  const suggestions = [];
  if (coverage < 0.7) suggestions.push("Cover more of the expected points from the question / model answer.");
  if (similarity < 0.45) suggestions.push("Stay closer to the required concepts instead of general commentary.");
  if (grammarRatio < 0.7) suggestions.push("Use complete sentences, punctuation, and a clearer academic tone.");
  if (stats.words < 60) suggestions.push("Expand the answer with a worked example or a short justification.");
  if (!suggestions.length) suggestions.push("Add a brief concluding sentence that restates the key result.");

  const feedback = `Score ${score}/${maxMarks}. Content coverage is ${Math.round(
    coverage * 100
  )}% versus the model answer, with semantic overlap of ${Math.round(
    similarity * 100
  )}%. ${missing.length ? "Some model-answer ideas are still missing." : "Most expected points are present."}`;

  return {
    score,
    feedback,
    evaluation: {
      method: "heuristic",
      rubric: {
        contentCoverage: {
          score: contentScore,
          max: contentMax,
          comment: coverage >= 0.75 ? "Most expected keywords and ideas are present." : "Several expected ideas are missing or underdeveloped.",
        },
        semanticSimilarity: {
          score: semanticScore,
          max: semanticMax,
          comment: similarity >= 0.5 ? "The response is aligned with the model answer." : "The response drifts from the intended meaning.",
        },
        grammarClarity: {
          score: grammarScore,
          max: grammarMax,
          comment:
            grammarRatio >= 0.75
              ? "Language is generally clear and well structured."
              : "Grammar, length, or sentence structure needs work.",
        },
      },
      missingPoints: missing.length ? missing : [],
      suggestions,
    },
  };
}

function extractJson(text) {
  const trimmed = String(text || "").trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = fenced ? fenced[1] : trimmed;
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON object in model response");
  return JSON.parse(raw.slice(start, end + 1));
}

function normalizeGeminiResult(parsed, maxMarks) {
  const rubricIn = parsed.rubric || {};
  const pick = (key, fallbackMax) => {
    const item = rubricIn[key] || {};
    const max = Number(item.max) || fallbackMax;
    const score = clamp(Number(item.score) || 0, 0, max);
    return {
      score: round1(score),
      max: round1(max),
      comment: String(item.comment || "").trim() || "No comment provided.",
    };
  };

  const contentMax = round1(maxMarks * 0.4);
  const semanticMax = round1(maxMarks * 0.35);
  const grammarMax = round1(maxMarks - contentMax - semanticMax);
  const rubric = {
    contentCoverage: pick("contentCoverage", contentMax),
    semanticSimilarity: pick("semanticSimilarity", semanticMax),
    grammarClarity: pick("grammarClarity", grammarMax),
  };

  let score = Number(parsed.score);
  if (Number.isNaN(score)) {
    score = rubric.contentCoverage.score + rubric.semanticSimilarity.score + rubric.grammarClarity.score;
  }
  score = clamp(Math.round(score), 0, maxMarks);

  return {
    score,
    feedback: String(parsed.overallFeedback || parsed.feedback || "").trim() || `Score ${score}/${maxMarks}.`,
    evaluation: {
      method: "gemini",
      rubric,
      missingPoints: Array.isArray(parsed.missingPoints) ? parsed.missingPoints.map(String).slice(0, 8) : [],
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions.map(String).slice(0, 8) : [],
    },
  };
}

async function geminiEvaluate(payload) {
  const apiKey = (process.env.GOOGLE_API_KEY || "").trim();
  if (!apiKey) return null;

  const genAI = new GoogleGenerativeAI(apiKey);
  const modelName = process.env.GEMINI_MODEL || "gemini-2.0-flash";
  const model = genAI.getGenerativeModel({ model: modelName });
  const prompt = `You are an exam grader for long-form (subjective) student answers.
Return ONLY valid JSON with this shape:
{
  "score": number,
  "overallFeedback": "2-4 sentence summary",
  "rubric": {
    "contentCoverage": { "score": number, "max": number, "comment": "string" },
    "semanticSimilarity": { "score": number, "max": number, "comment": "string" },
    "grammarClarity": { "score": number, "max": number, "comment": "string" }
  },
  "missingPoints": ["short bullet", "..."],
  "suggestions": ["short bullet", "..."]
}

Rules:
- maxMarks is ${payload.maxMarks}. Rubric max values must sum to maxMarks (40% content, 35% semantic similarity to the model answer, 25% grammar/clarity).
- score must equal the sum of rubric scores, rounded to a whole number, between 0 and maxMarks.
- Be fair and specific. Do not invent facts the student did not write.
- missingPoints should list ideas from the model answer that the student omitted.

Question: ${payload.question}
Model answer: ${payload.modelAnswer || "(not provided — grade from the question alone)"}
Student answer: ${payload.studentAnswer}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  return normalizeGeminiResult(extractJson(text), payload.maxMarks);
}

async function evaluateAnswer(payload) {
  try {
    const gemini = await geminiEvaluate(payload);
    if (gemini) return gemini;
  } catch (error) {
    console.warn("Gemini evaluation failed, using heuristic:", error.message);
  }
  return heuristicEvaluate(payload);
}

module.exports = { evaluateAnswer, heuristicEvaluate };
