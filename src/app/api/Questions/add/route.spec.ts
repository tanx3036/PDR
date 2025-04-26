// src/app/api/Questions/add/route.spec.ts

import { POST } from "./route";
import { db } from "~/server/db/index";
import { ChatHistory } from "~/server/db/schema";

jest.mock("~/server/db/index", () => ({
  db: {
    insert: jest.fn().mockReturnThis(),
    values: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock("~/server/db/schema", () => ({
  ChatHistory: {},
}));

describe("add question POST API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should insert a chat history record successfully", async () => {
    const mockRequest = {
      json: jest.fn().mockResolvedValue({
        userId: "user123",
        question: "What is LangChain?",
        documentId: "doc123",
        documentTitle: "Intro to LangChain",
        response: "LangChain is a framework for LLM apps.",
        pages: [1, 2],
      }),
    } as unknown as Request;

    const response = await POST(mockRequest);
    const responseData = await response.json();

    expect(response.status).toBe(200);
    expect(responseData).toEqual({ success: true });

    expect(db.insert).toHaveBeenCalledWith(ChatHistory);
    expect(db.values).toHaveBeenCalledWith({
      UserId: "user123",
      documentId: "doc123",
      documentTitle: "Intro to LangChain",
      question: "What is LangChain?",
      response: "LangChain is a framework for LLM apps.",
      pages: [1, 2],
    });
  });

  it("should return 500 if there is an exception", async () => {
    (db.values as jest.Mock).mockRejectedValueOnce(new Error("DB insert error"));

    const mockRequest = {
      json: jest.fn().mockResolvedValue({
        userId: "user123",
        question: "test",
        documentId: "doc123",
        documentTitle: "test title",
        response: "test response",
        pages: [1],
      }),
    } as unknown as Request;

    const response = await POST(mockRequest);
    const responseData = await response.json();

    expect(response.status).toBe(500);
    expect(responseData).toHaveProperty("error");
  });
});
