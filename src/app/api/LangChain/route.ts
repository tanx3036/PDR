import { NextResponse } from "next/server";
import fetch from "node-fetch";
import fs from "fs/promises";
import path from "path";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import {  ChatOpenAI, OpenAIEmbeddings} from "@langchain/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import {HumanMessage, SystemMessage} from "@langchain/core/messages";

export async function POST(request: Request) {
    try {
        // 1) Fetch the remote PDF file
        const { url, question } = await request.json();
        console.log("Received URL:", url);
        console.log("Received question:", question);

        const pdfUrl = url;
        const response = await fetch(pdfUrl);

        if (!response.ok) {
            throw new Error(
                `Unable to fetch PDF from ${pdfUrl}: ${response.status} ${response.statusText}`
            );
        } else{
            console.log("PDF fetched successfully");
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

        // --- LangChain Logic ---
        const textSplitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000,
            chunkOverlap: 200,
        });
        const allSplits = await textSplitter.splitDocuments(docs);

        const embeddings = new OpenAIEmbeddings({
            model: "text-embedding-3-large",
            openAIApiKey: process.env.OPENAI_API_KEY,
        });

        const vectorStore = new MemoryVectorStore(embeddings);
        await vectorStore.addDocuments(allSplits);


        // 5) Similarity search
        const results = await vectorStore.similaritySearch(question);

        console.log("Results:", results);

        // 6) OPTIONAL: Summarize using ChatOpenAI
        //    We'll merge all relevant chunks into one prompt for simplicity:
        const chat = new ChatOpenAI({
            openAIApiKey: process.env.OPENAI_API_KEY,
            temperature: 0.5,
            modelName: "gpt-4-turbo",
        });

        // Combine the relevant content into a single string
        const combinedContent = results.map((doc, idx) => {
            const pageNum = doc.metadata?.loc?.pageNumber ?? "unknown";
            return `=== Result #${idx + 1}, Page: ${pageNum} ===\n${doc.pageContent}`;
        }).join("\n\n");

        // Ask for a short summary or answer to the user's question
        const summarizedAnswer = await chat.call([
            new SystemMessage("You are a helpful assistant. Read the provided PDF excerpts and answer the user's question concisely."),
            new HumanMessage(
                `User's question: "${question}"\n\nRelevant PDF content:\n${combinedContent}\n\nPlease provide a short, helpful answer.`
            ),
        ]);




        // 5) Clean up - remove the temp PDF file if you like
        await fs.unlink(tempFilePath);

        const relevantPages = results.map((doc) => doc.metadata?.loc?.pageNumber ?? "unknown");

        console.log("Summarized answer:", summarizedAnswer.text);
        console.log("Relevant pages:", relevantPages);

        // Return JSON with the AI answer + relevant pages
        return NextResponse.json({
            success: true,
            summarizedAnswer: summarizedAnswer.text,
            recommendedPages: relevantPages,
        });

    } catch (error: any) {
        console.error(error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}