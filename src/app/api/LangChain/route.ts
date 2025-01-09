import { NextResponse } from "next/server";
import fetch from "node-fetch";
import fs from "fs/promises";
import path from "path";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { OpenAIEmbeddings } from "@langchain/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";

export async function POST(request: Request) {
    try {
        // 1) Fetch the remote PDF file
        const { url } = await request.json();


        const pdfUrl = "https://utfs.io/f/zllPuoqtDQmMPzmHHUhDqHSOGy4zRcrUfXQuNKl5ohkb2a38";
        const response = await fetch(pdfUrl);

        if (!response.ok) {
            throw new Error(
                `Unable to fetch PDF from ${pdfUrl}: ${response.status} ${response.statusText}`
            );
        }

        // 2) Convert response to a Buffer
        const pdfArrayBuffer = await response.arrayBuffer();
        const pdfBuffer = Buffer.from(pdfArrayBuffer);

        // 3) Write to a temp file in your server environment
        const tempFilePath = path.join(process.cwd(), "temp.pdf");
        await fs.writeFile(tempFilePath, pdfBuffer);

        // 4) Use PDFLoader on that temp file
        const loader = new PDFLoader(tempFilePath);
        const docs = await loader.load();

        // --- Now do your LangChain logic (splitting, embedding, vector store, etc.) ---
        const textSplitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000,
            chunkOverlap: 200,
        });
        const allSplits = await textSplitter.splitDocuments(docs);

        const embeddings = new OpenAIEmbeddings({
            model: "text-embedding-ada-002",
            openAIApiKey: process.env.OPENAI_API_KEY,
        });

        const vectorStore = new MemoryVectorStore(embeddings);
        await vectorStore.addDocuments(allSplits);

        // Example: similarity search
        const results = await vectorStore.similaritySearch(
            "Sample query about the PDF..."
        );

        // 5) Clean up - remove the temp PDF file if you like
        await fs.unlink(tempFilePath);

        return NextResponse.json({
            success: true,
            results,
        });
    } catch (error: any) {
        console.error(error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}