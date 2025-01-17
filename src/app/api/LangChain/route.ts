import { NextResponse } from "next/server";
import { db } from "../../../server/db/index";
import { sql } from "drizzle-orm";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

// e.g. if your "pdfChunks" table is called "pdr_ai_v2_pdf_chunks" in the DB schema
// and has columns: id, document_id, page, content, embedding (vector).

type PostBody = {
    documentId: number; // or string, depending on your schema
    question: string;
};

// A helper interface for the row shape returned by the query.
type PdfChunkRow = Record<string, unknown> & {
    id: number;
    content: string;
    page: number;
    distance: number;
};


export async function POST(request: Request) {
    try {
        // 1) Parse the request body
        const { documentId, question } = (await request.json()) as PostBody;

        // 2) Embed the user's question
        const embeddings = new OpenAIEmbeddings({
            model: "text-embedding-ada-002",
            openAIApiKey: process.env.OPENAI_API_KEY,
        });
        const questionEmbedding = await embeddings.embedQuery(question);

        // 3) pgvector expects bracketed notation "[x,y,z]" not curly braces.
        const bracketedEmbedding = `[${questionEmbedding.join(",")}]`;

        console.log(documentId);

        // 4) Use Drizzle's `db.execute(sql<...>)` to run raw SQL with vector similarity
        //    We ORDER BY embedding <-> $QUESTION_EMBEDDING::vector(1536) (lowest = most similar).
        //    Adjust the dimension if needed; 1536 is standard for "text-embedding-ada-002".
        const query = sql`
          SELECT
            id,
            content,
            page,
            embedding <-> ${bracketedEmbedding}::vector(1536) AS distance
          FROM pdr_ai_v2_pdf_chunks
          WHERE document_id = ${documentId}
          ORDER BY embedding <-> ${bracketedEmbedding}::vector(1536)
          LIMIT 3
        `;


        // Then execute
        const result = await db.execute<PdfChunkRow>(query);
        // Drizzle returns rows in `result.rows`
        const rows = result.rows;

        if (rows.length === 0) {
            return NextResponse.json({
                success: false,
                message: "No chunks found for the given documentId.",
            });
        }

        // 5) Combine all top-chunks into a single prompt
        const combinedContent = rows
            .map(
                (row, idx) =>
                    `=== Chunk #${idx + 1}, Page ${row.page}, Distance: ${row.distance} === ${row.content}`
            )
            .join("\n\n");

        // 6) Summarize / answer with ChatOpenAI
        const chat = new ChatOpenAI({
            openAIApiKey: process.env.OPENAI_API_KEY,
            modelName: "gpt-4", // or gpt-3.5-turbo
            temperature: 0.5,
        });

        const summarizedAnswer = await chat.call([
            new SystemMessage(
                "You are a helpful assistant that answers questions about a document."
            ),
            new HumanMessage(
                `User's question: "${question}"\n\n${combinedContent}\n\nAnswer concisely.`
            ),
        ]);

        // 7) Return JSON response
        return NextResponse.json({
            success: true,
            summarizedAnswer: summarizedAnswer.text,
            recommendedPages: rows.map((row) => row.page),
        });
    } catch (error: unknown) {
        console.error(error);
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
    }
}
