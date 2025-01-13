import { NextResponse } from "next/server";
import fetch from "node-fetch";
import fs from "fs/promises";
import os from "os";
import path from "path";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

export async function POST(request: Request) {
    try {
        const { url, question } = await request.json();

        // 1) Fetch the remote PDF file
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Unable to fetch PDF from ${url}`);
        }

        // 2) Convert response to a Buffer
        const pdfArrayBuffer = await response.arrayBuffer();
        const pdfBuffer = Buffer.from(pdfArrayBuffer);

        // 3) Write to an ephemeral temp directory
        const tempFilePath = path.join(os.tmpdir(), "temp.pdf");
        await fs.writeFile(tempFilePath, pdfBuffer);

        // 4) Load the PDF
        const loader = new PDFLoader(tempFilePath);
        const docs = await loader.load();

        // 5) Text splitter, embeddings, vector store, similarity search...
        //    (same as in your original code)
        const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000, chunkOverlap: 200 });
        const allSplits = await textSplitter.splitDocuments(docs);

        const embeddings = new OpenAIEmbeddings({
            model: "text-embedding-3-large",
            openAIApiKey: process.env.OPENAI_API_KEY,
        });

        const vectorStore = new MemoryVectorStore(embeddings);
        await vectorStore.addDocuments(allSplits);

        const results = await vectorStore.similaritySearch(question);

        // 6) Summarize with ChatOpenAI...
        const chat = new ChatOpenAI({
            openAIApiKey: process.env.OPENAI_API_KEY,
            temperature: 0.5,
            modelName: "gpt-4-turbo",
        });

        const combinedContent = results
            .map((doc, idx) => `=== Result #${idx + 1}, Page: ${doc.metadata?.loc?.pageNumber} ===\n${doc.pageContent}`)
            .join("\n\n");

        const summarizedAnswer = await chat.call([
            new SystemMessage("You are a helpful assistant..."),
            new HumanMessage(`User's question: "${question}"\n\n${combinedContent}\n\nAnswer concisely.`),
        ]);

        // 7) Clean up
        await fs.unlink(tempFilePath);

        return NextResponse.json({
            success: true,
            summarizedAnswer: summarizedAnswer.text,
            recommendedPages: results.map((doc) => doc.metadata?.loc?.pageNumber),
        });
    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
