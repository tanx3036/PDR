// app/api/ask/route.ts (Next.js 13+ with the App Router)
// or pages/api/ask.ts (Next.js 12)

import { NextRequest, NextResponse } from "next/server";
// If you're on Next 12, use (req, res) => {} syntax with express-like handlers
import Configuration from "openai";
import OpenAIApi from "openai";

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY, // set your environment variable
});
const openai = new OpenAIApi(configuration);

export async function POST(request: NextRequest) {
    try {
        const { question } = await request.json();
        // Validate input
        if (!question || typeof question !== "string") {
            return NextResponse.json(
                { error: "Invalid question" },
                { status: 400 }
            );
        }

        // Call your model (OpenAI example)
        const response = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: `Answer this question concisely: ${question}`,
            max_tokens: 150,
            temperature: 0.7,
        });

        const answer = response?.data?.choices?.[0]?.text ?? "No answer found.";

        return NextResponse.json({ answer });
    } catch (error: any) {
        console.error("API Error:", error);
        return NextResponse.json(
            { error: "An error occurred while processing your request." },
            { status: 500 }
        );
    }
}