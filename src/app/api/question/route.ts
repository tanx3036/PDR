// app/api/ask/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Configuration, OpenAIApi } from "openai";
import { db } from "../../../server/db/index";

export async function POST(req: NextRequest) {
    try {
        const { question } = await req.json();
        if (!question) {
            return NextResponse.json(
                { error: "No question provided." },
                { status: 400 }
            );
        }

        // 1. Create embedding of user question
        const config = new Configuration({
            apiKey: process.env.OPENAI_API_KEY,
        });
        const openai = new OpenAIApi(config);

        const embedRes = await openai.createEmbedding({
            model: "text-embedding-ada-002",
            input: question,
        });
        const questionEmbedding = embedRes.data.data[0].embedding; // number[]

        // Convert to pgvector literal
        const vectorLiteral = `'[${questionEmbedding.join(", ")}]'`;

        // 2. Query top K matches using vector <-> operator (cosine distance).
        // Example: find top 3
        const topK = 3;
        const results = await db.execute(
            `
      SELECT id, page, content,
             (embedding <-> ${vectorLiteral}) AS distance
      FROM pdf_chunks
      ORDER BY embedding <-> ${vectorLiteral}
      LIMIT ${topK};
      `
        );

        // `results` is typically in the form { rows: [...] }.
        const rows = (results as any).rows || [];

        // 3. Construct context
        let contextText = "";
        rows.forEach((r: any, i: number) => {
            contextText += `${i + 1}) [Page ${r.page}] ${r.content}\n\n`;
        });

        // 4. Build final prompt for ChatGPT
        const systemPrompt = `
You are a helpful assistant with access to the following PDF excerpts.
Use ONLY these excerpts to answer the user's question. 
If the answer is not in the provided excerpts, say "I don't have enough information."
    
Excerpts:
${contextText}
`;

        const userPrompt = `User question: ${question}`;

        // 5. Call ChatGPT
        const chatCompletion = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt },
            ],
            max_tokens: 1000,
            temperature: 0.2,
        });

        const answer = chatCompletion.data.choices[0].message?.content || "";

        // 6. Return JSON
        const references = rows.map((r: any) => r.page);

        return NextResponse.json({
            answer,
            references,
        });
    } catch (err: any) {
        console.error("Error in /api/ask:", err);
        return NextResponse.json(
            { error: "Something went wrong." },
            { status: 500 }
        );
    }
}