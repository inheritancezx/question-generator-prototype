import { Ollama } from "ollama";

const ollama = new Ollama({
  host: process.env.OLLAMA_HOST || "http://localhost:11434",
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { theme, n = 3, style = "creative" } = req.body;

  if (!theme || theme.trim() === '') {
    return res.status(400).json({ error: 'Theme is required' });
  }

  const prompt = `
    You are a ${style} question generator.
    Generate ${n} unique and interesting questions about the theme "${theme}".
    Each question should be clear, concise, and thought-provoking.
    Respond with ONLY valid JSON using this exact shape (no prose, no backticks):
    {"questions": ["question 1", "question 2", ...]}
  `;

  try {
    const model = process.env.OLLAMA_MODEL || "llama3:instruct";
    const response = await ollama.chat({
      model,
      messages: [{ role: "user", content: prompt }],
      format: "json",
    });

    const output = response?.message?.content ?? "";

    const extractJson = (text) => {
      if (!text) return "";
      let t = text.trim().replace(/^```(?:json)?\n?/i, "").replace(/```\s*$/i, "");
      const objectMatch = t.match(/\{[\s\S]*\}/);
      if (objectMatch) return objectMatch[0];
      const arrayMatch = t.match(/\[[\s\S]*\]/);
      if (arrayMatch) return arrayMatch[0];
      return t; 
    };

    let parsed;
    try {
      parsed = JSON.parse(extractJson(output));
    } catch (e) {
      console.error("Failed to parse model output as JSON", { output });
      throw e;
    }

    let questions = Array.isArray(parsed) ? parsed : parsed?.questions;
    if (!Array.isArray(questions)) {
      throw new Error("Model did not return a questions array");
    }

    questions = questions.map((q) => (typeof q === "string" ? q : String(q)));

    res.status(200).json({ questions });
  } catch (error) {
    console.error(error);
    const host = process.env.OLLAMA_HOST || "http://localhost:11434";
    const model = process.env.OLLAMA_MODEL || "llama3:instruct";

    const isConnError =
      error?.code === 'ECONNREFUSED' ||
      error?.cause?.code === 'ECONNREFUSED' ||
      /ECONNREFUSED|fetch failed/i.test(String(error?.message || ''));
    if (isConnError) {
      return res.status(503).json({
        error: `Cannot connect to Ollama at ${host}. Ensure the Ollama service is running and reachable, and that the model specified by OLLAMA_MODEL is available.`,
      });
    }

    const isModelNotFound =
      error?.status_code === 404 ||
      /model .*not found/i.test(String(error?.error || error?.message || ''));
    if (isModelNotFound) {
      return res.status(400).json({
        error: `Ollama model "${model}" was not found. Install it by running: ollama pull ${model}. Or set a different model via OLLAMA_MODEL in your .env.local.`,
      });
    }

    const isTimeout =
      error?.cause?.code === 'UND_ERR_HEADERS_TIMEOUT' ||
      /headers timeout|timeout/i.test(String(error?.cause?.message || error?.message || ''));
    if (isTimeout) {
      return res.status(408).json({
        error: `Request timed out waiting for Ollama response. The model "${model}" may be taking too long to load or generate. Try a smaller/faster model or increase Ollama's timeout settings.`,
      });
    }
    res.status(500).json({ error: "Failed to generate questions" });
  }
}