// // scripts/pdfIndexer.ts
// import fs from "fs";
// import path from "path";
// import pdfParse from "pdf-parse";
// import OpenAIApi from "openai";
// import Configuration from "openai"
// import { db } from "../../server/db"; // your Drizzle connection
// import { pdfChunks } from "../../server/db/schema";
//
// const PDF_PATH = "https://utfs.io/f/zllPuoqtDQmMPzmHHUhDqHSOGy4zRcrUfXQuNKl5ohkb2a38";
//
// const CHUNK_SIZE = 500; // characters, adjust as needed
//
// function chunkText(text: string, size: number) {
//     const chunks: string[] = [];
//     let startIndex = 0;
//     while (startIndex < text.length) {
//         chunks.push(text.slice(startIndex, startIndex + size));
//         startIndex += size;
//     }
//     return chunks;
// }
//
// async function main() {
//     // 1. Parse PDF
//     const pdfBuffer = fs.readFileSync(PDF_PATH);
//     const pdfData = await pdfParse(pdfBuffer);
//
//     const pages = pdfData.text.split("\f"); // assume form-feed per page
//
//     console.log("fs read pdf. # of pages in PDF: ", pages.length)
//
//     // 2. OpenAI config
//     const config = new Configuration({
//         apiKey: process.env.OPENAI_API_KEY,
//     });
//     const openai = new OpenAIApi(config);
//
//     // Clear existing table rows (optional) - be mindful in production
//     await db.execute(`DELETE FROM pdf_chunks;`);
//
//     // 3. Loop over pages
//     console.log(`Indexing ${pages.length} pages...`);
//     for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
//         const pageText = pages[pageIndex]?.trim() ?? "";
//         if (!pageText) continue;
//
//         // 3A. Chunk the text
//         const textChunks = chunkText(pageText, CHUNK_SIZE);
//
//         for (const chunk of textChunks) {
//             // 3B. Create embedding
//             const embedResponse = await openai.createEmbedding({
//                 model: "text-embedding-ada-002",
//                 input: chunk,
//             });
//             const embedding = embedResponse.data.data[0].embedding; // number[]
//
//             // 3C. Insert into db
//             // Drizzle requires specifying the array in a form recognized by pgvector
//             const vectorLiteral = `'[${embedding.join(", ")}]'`; // e.g. '[0.12, 0.23, ...]'
//
//             await db.execute(
//                 `
//         INSERT INTO pdf_chunks (page, content, embedding)
//         VALUES ($1, $2, $3::vector(1536))
//         `,
//                 [pageIndex + 1, chunk, vectorLiteral]
//             );
//
//             console.log(`Inserted page ${pageIndex + 1} chunk (length: ${chunk.length})`);
//         }
//     }
//
//     console.log("PDF indexing complete!");
// }
//
// main().catch((err) => {
//     console.error(err);
//     process.exit(1);
// });