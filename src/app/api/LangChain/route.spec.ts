// src/app/api/LangChain/route.spec.ts

import { POST } from "./route";
import { db } from "../../../server/db/index";
import { sql } from "drizzle-orm";
import { OpenAIEmbeddings } from "@langchain/openai";
import { ChatOpenAI } from "@langchain/openai";

jest.mock("../../../server/db/index", () => ({
  db: {
    execute: jest.fn(),
  },
}));

jest.mock("@langchain/openai", () => ({
  OpenAIEmbeddings: jest.fn().mockImplementation(() => ({
    embedQuery: jest.fn().mockResolvedValue(new Array(1536).fill(0.5)), // Mock embedding vector
  })),
  ChatOpenAI: jest.fn().mockImplementation(() => ({
    call: jest.fn().mockResolvedValue({ text: "This is a summarized answer." }),
  })),
}));

jest.mock("drizzle-orm", () => ({
  sql: jest.fn(),
}));

describe("LangChain POST API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return summarized answer when chunks are found", async () => {
    // Mock db.execute() returning 3 fake chunks
    (db.execute as jest.Mock).mockResolvedValueOnce({
      rows: [
        { id: 1, content: "Chunk 1 content", page: 1, distance: 0.1 },
        { id: 2, content: "Chunk 2 content", page: 2, distance: 0.2 },
        { id: 3, content: "Chunk 3 content", page: 3, distance: 0.3 },
      ],
    });

    const mockRequest = {
      json: jest.fn().mockResolvedValue({
        documentId: 123,
        question: "What is the document about?",
      }),
    } as unknown as Request;

    const response = await POST(mockRequest);
    const responseData = await response.json();

    expect(response.status).toBe(200);
    expect(responseData.success).toBe(true);
    expect(responseData.summarizedAnswer).toBe("This is a summarized answer.");
    expect(responseData.recommendedPages).toEqual([1, 2, 3]);

    expect(OpenAIEmbeddings).toHaveBeenCalled();
    expect(ChatOpenAI).toHaveBeenCalled();
    expect(db.execute).toHaveBeenCalled();
  });

  it("should return failure if no chunks are found", async () => {
    (db.execute as jest.Mock).mockResolvedValueOnce({ rows: [] });

    const mockRequest = {
      json: jest.fn().mockResolvedValue({
        documentId: 123,
        question: "Any content?",
      }),
    } as unknown as Request;

    const response = await POST(mockRequest);
    const responseData = await response.json();

    expect(response.status).toBe(200); // Still 200, but success: false
    expect(responseData.success).toBe(false);
    expect(responseData.message).toBe("No chunks found for the given documentId.");
  });

  it("should return 500 if there is an error", async () => {
    (db.execute as jest.Mock).mockRejectedValueOnce(new Error("DB connection error"));

    const mockRequest = {
      json: jest.fn().mockResolvedValue({
        documentId: 123,
        question: "test error handling",
      }),
    } as unknown as Request;

    const response = await POST(mockRequest);
    const responseData = await response.json();

    expect(response.status).toBe(500);
    expect(responseData.success).toBe(false);
    expect(responseData.error).toContain("Error");
  });
});
