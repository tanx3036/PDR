import { NextResponse } from "next/server";
import { db } from "../../../server/db/index";
import { users, document, pdfChunks } from "../../../server/db/schema";
import { eq, sql } from "drizzle-orm";
import fetch from "node-fetch";
import fs from "fs/promises";
import os from "os";
import path from "path";

import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { OpenAIEmbeddings } from "@langchain/openai";

// Drizzle expects a type for the table columns, skip for brevity
// import type { InsertPdfChunks } from '../../../server/db/schema/pdfChunks';

type PostBody = {
    userId: string;
    documentName: string;
    documentUrl: string;
    documentCategory: string;
};

export async function POST(request: Request) {
    try {
        const { userId, documentName, documentUrl, documentCategory } =
            (await request.json()) as PostBody;

        // 1) Validate user
        const [userInfo] = await db
            .select()
            .from(users)
            .where(eq(users.userId, userId));
        if (!userInfo) {
            return NextResponse.json({ error: "Invalid user." }, { status: 400 });
        }

        // 2) Insert new document
        const [insertedDocument] = await db
            .insert(document)
            .values({
                url: documentUrl,
                category: documentCategory,
                title: documentName,
                companyId: userInfo.companyId,
            })
            .returning();

        if (!insertedDocument) {
            throw new Error("Failed to insert document");
        }

        // 3) Download PDF
        const response = await fetch(documentUrl);
        if (!response.ok) {
            throw new Error(`Unable to fetch PDF from ${documentUrl}`);
        }
        const pdfArrayBuffer = await response.arrayBuffer();
        const pdfBuffer = Buffer.from(pdfArrayBuffer);

        // 4) Write to tmp file
        const tempFilePath = path.join(os.tmpdir(), "temp.pdf");
        await fs.writeFile(tempFilePath, pdfBuffer);

        // 5) Load & split
        const loader = new PDFLoader(tempFilePath);
        const docs = await loader.load();
        const textSplitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000,
            chunkOverlap: 200,
        });
        const allSplits = await textSplitter.splitDocuments(docs);

        // 6) Embed
        const embeddings = new OpenAIEmbeddings({
            model: "text-embedding-ada-002",
            openAIApiKey: process.env.OPENAI_API_KEY,
        });

        const chunkTexts = allSplits.map((split) => split.pageContent);
        const chunkEmbeddings = await embeddings.embedDocuments(chunkTexts);

        if(chunkEmbeddings.length !== allSplits.length) {
            throw new Error("Mismatch between number of splits and embeddings");
        }


        // 7) Insert chunks -> pdfChunks table
        const rowsToInsert = allSplits.map((split, i) => {
            if (!chunkEmbeddings[i]) {
                throw new Error("Missing embedding for chunk");
            }

            // Sanitize the text: remove all null-byte characters
            const sanitizedContent = split.pageContent.replace(/\0/g, "");

            const bracketedVector = `[${chunkEmbeddings[i].join(",")}]`;

            return {
                documentId: insertedDocument.id,
                page: split.metadata?.loc?.pageNumber ?? 1,
                content: sanitizedContent,
                embedding: sql`${bracketedVector}::vector(1536)`,
            };
        });

        await db.insert(pdfChunks).values(rowsToInsert);

        // 9) Return success
        return NextResponse.json(
            {
                message: "Document created and embeddings stored successfully",
                document: insertedDocument,
            },
            { status: 201 }
        );
    } catch (error: unknown) {
        console.error(error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
