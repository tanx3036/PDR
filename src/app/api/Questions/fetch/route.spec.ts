// src/app/api/Questions/fetch/route.spec.ts

import { POST } from "./route";
import { db } from "~/server/db/index";
import { ChatHistory } from "~/server/db/schema";
import { eq, and } from "drizzle-orm";

jest.mock("~/server/db/index", () => ({
  db: {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn(),
  },
}));

jest.mock("~/server/db/schema", () => ({
  ChatHistory: { UserId: "mockUserId", documentId: "mockDocumentId" },
}));

jest.mock("drizzle-orm", () => ({
  eq: jest.fn(),
  and: jest.fn(),
}));

describe("fetch chat history POST API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should fetch and return chat history successfully", async () => {
    (db.where as jest.Mock).mockResolvedValueOnce([
      {
        id: 1,
        UserId: "user123",
        documentId: "doc123",
        question: "What is AI?",
        response: "AI is artificial intelligence.",
        pages: [1, 2],
      },
      {
        id: 2,
        UserId: "user123",
        documentId: "doc123",
        question: "What is LangChain?",
        response: "LangChain is a framework for LLM apps.",
        pages: [3],
      },
    ]);

    const mockRequest = {
      json: jest.fn().mockResolvedValue({
        userId: "user123",
        documentId: "doc123",
      }),
    } as unknown as Request;

    const response = await POST(mockRequest);
    const responseData = await response.json();

    expect(response.status).toBe(200);
    expect(responseData.success).toBe(true);
    expect(responseData.chatHistory).toHaveLength(2);
    expect(db.select).toHaveBeenCalled();
    expect(db.from).toHaveBeenCalledWith(ChatHistory);
    expect(eq).toHaveBeenCalled();
    expect(and).toHaveBeenCalled();
  });

  it("should return 500 if there is an error", async () => {
    (db.where as jest.Mock).mockRejectedValueOnce(new Error("DB error"));

    const mockRequest = {
      json: jest.fn().mockResolvedValue({
        userId: "user123",
        documentId: "doc123",
      }),
    } as unknown as Request;

    const response = await POST(mockRequest);
    const responseData = await response.json();

    expect(response.status).toBe(500);
    expect(responseData).toHaveProperty("error");
  });
});
