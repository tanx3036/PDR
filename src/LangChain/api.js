import { Document } from "@langchain/core/documents";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { OpenAIEmbeddings } from "@langchain/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";


const documents = [
    new Document({
        pageContent:
            "Dogs are great companions, known for their loyalty and friendliness.",
        metadata: { source: "mammal-pets-doc" },
    }),
    new Document({
        pageContent: "Cats are independent pets that often enjoy their own space.",
        metadata: { source: "mammal-pets-doc" },
    }),
];


const loader = new PDFLoader("../../data/nke-10k-2023.pdf");

const docs = await loader.load();

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
});

// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
const allSplits = await textSplitter.splitDocuments(docs);

const embeddings = new OpenAIEmbeddings({
    model: "text-embedding-3-large"
});


// @ts-expect-error
const vector1 = await embeddings.embedQuery(allSplits[0].pageContent);
// @ts-expect-error
const vector2 = await embeddings.embedQuery(allSplits[1].pageContent);

console.assert(vector1.length === vector2.length);
console.log(`Generated vectors of length ${vector1.length}\n`);
console.log(vector1.slice(0, 10));

const vectorStore = new MemoryVectorStore(embeddings);
await vectorStore.addDocuments(allSplits);


const results1 = await vectorStore.similaritySearch(
    "When was Nike incorporated?"
);

console.log(results1[0]);

const results2 = await vectorStore.similaritySearchWithScore(
    "What was Nike's revenue in 2023?"
);

console.log(results2[0]);

const embedding = await embeddings.embedQuery(
    "How were Nike's margins impacted in 2023?"
);

const results3 = await vectorStore.similaritySearchVectorWithScore(
    embedding,
    1
);

console.log(results3[0]);

const retriever = vectorStore.asRetriever({
    searchType: "mmr",
    searchKwargs: {
        fetchK: 1,
    },
});

await retriever.batch([
    "When was Nike incorporated?",
    "What was Nike's revenue in 2023?",
])