"use client";

import { useState } from "react";

export default function HomePage() {
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState("");
    const [references, setReferences] = useState<number[]>([]);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    async function handleAsk() {
        setLoading(true);
        setErrorMsg("");
        setAnswer("");
        setReferences([]);

        try {
            const response = await fetch("/api/ask", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ question }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Request failed");
            }

            const data = await response.json();
            setAnswer(data.answer);
            setReferences(data.references);
        } catch (err: any) {
            setErrorMsg(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <main style={{ padding: "2rem" }}>
            <h1>Ask About the PDF</h1>
            <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                rows={4}
                style={{ width: "100%" }}
                placeholder="Ask a question about the PDF..."
            />
            <br />
            <button onClick={handleAsk} disabled={!question || loading}>
                {loading ? "Asking..." : "Ask"}
            </button>
            {errorMsg && <p style={{ color: "red" }}>Error: {errorMsg}</p>}
            {answer && (
                <div style={{ marginTop: "1rem" }}>
                    <h2>Answer</h2>
                    <p>{answer}</p>
                    {references.length > 0 && (
                        <p><b>References (pages):</b> {references.join(", ")}</p>
                    )}
                </div>
            )}
        </main>
    );
}