import { useState } from "react";

export default function QuestionGenerator() {
  const [theme, setTheme] = useState("");
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generateQuestions = async () => {
    if (!theme.trim()) return;
    
    setLoading(true);
    setQuestions([]);
    setError("");

    try {
      const res = await fetch("/api/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme, n: 5, style: "creative" }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate questions');
      }

      setQuestions(data.questions || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-2">Prompt Question Generator</h2>
      <input
        type="text"
        placeholder="Enter a theme (e.g., space exploration)"
        className="border p-2 w-full rounded mb-3"
        value={theme}
        onChange={(e) => setTheme(e.target.value)}
      />
      <button
        onClick={generateQuestions}
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        disabled={loading || !theme.trim()}
      >
        {loading ? "Generating..." : "Generate"}
      </button>

      {error && (
        <div className="mt-3 p-2 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <ul className="mt-4 list-disc pl-5">
        {questions.map((q, i) => (
          <li key={i}>{q}</li>
        ))}
      </ul>
    </div>
  );
}