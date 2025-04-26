import { POST } from "./route";
import { db } from "../../../server/db/index";
import { users, document, pdfChunks } from "../../../server/db/schema";
import { eq, sql } from "drizzle-orm";
import fetch from "node-fetch";

jest.mock("../../../server/db/index", () => ({
  db: {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn(),
    insert: jest.fn().mockReturnThis(),
    values: jest.fn().mockReturnThis(),
    returning: jest.fn().mockResolvedValue([{ id: "mockDocId" }]),
  },
}));

jest.mock("../../../server/db/schema", () => ({
  users: { userId: "mockUserId" },
  document: {},
  pdfChunks: {},
}));

jest.mock("drizzle-orm", () => ({
  eq: jest.fn(),
  sql: (val: any) => val,
}));

jest.mock("node-fetch", () => jest.fn());

jest.mock("fs/promises", () => ({
  writeFile: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("os", () => ({
  tmpdir: jest.fn().mockReturnValue("/tmp"),
}));

jest.mock("@langchain/community/document_loaders/fs/pdf", () => ({
  PDFLoader: jest.fn().mockImplementation(() => ({
    load: jest.fn().mockResolvedValue([
      { pageContent: "Page 1", metadata: { loc: { pageNumber: 1 } } },
      { pageContent: "Page 2", metadata: { loc: { pageNumber: 2 } } },
    ]),
  })),
}));

jest.mock("@langchain/textsplitters", () => ({
  RecursiveCharacterTextSplitter: jest.fn().mockImplementation(() => ({
    splitDocuments: jest.fn().mockResolvedValue([
      { pageContent: "Chunk 1", metadata: { loc: { pageNumber: 1 } } },
      { pageContent: "Chunk 2", metadata: { loc: { pageNumber: 2 } } },
    ]),
  })),
}));

jest.mock("@langchain/openai", () => ({
  OpenAIEmbeddings: jest.fn().mockImplementation(() => ({
    embedDocuments: jest.fn().mockResolvedValue([
      Array(1536).fill(0.1), // Mock embedding vectors
      Array(1536).fill(0.2),
    ]),
  })),
}));

describe("POST /api/document - Create Document API", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should create document and chunks successfully", async () => {
    (db.where as jest.Mock).mockResolvedValue([{ companyId: "mockCompanyId" }]);
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      arrayBuffer: async () => Buffer.from("dummy pdf content"),
    });

    const mockRequest = {
      json: jest.fn().mockResolvedValue({
        userId: "user123",
        documentName: "TestDoc",
        documentUrl: "http://example.com/test.pdf",
        documentCategory: "TestCategory",
      }),
    } as unknown as Request;

    const response = await POST(mockRequest);
    const responseData = await response.json();

    expect(response.status).toBe(201);
    expect(responseData).toHaveProperty("document");
    expect(responseData.message).toBe("Document created and embeddings stored successfully");
  });

  it("should return 400 if user is invalid", async () => {
    (db.where as jest.Mock).mockResolvedValue([]);

    const mockRequest = {
      json: jest.fn().mockResolvedValue({
        userId: "invalidUser",
        documentName: "TestDoc",
        documentUrl: "http://example.com/test.pdf",
        documentCategory: "TestCategory",
      }),
    } as unknown as Request;

    const response = await POST(mockRequest);
    const responseData = await response.json();

    expect(response.status).toBe(400);
    expect(responseData).toEqual({ error: "Invalid user." });
  });

  it("should return 500 if fetch fails", async () => {
    (db.where as jest.Mock).mockResolvedValue([{ companyId: "mockCompanyId" }]);
    (fetch as jest.Mock).mockResolvedValue({
      ok: false,
    });

    const mockRequest = {
      json: jest.fn().mockResolvedValue({
        userId: "user123",
        documentName: "TestDoc",
        documentUrl: "http://example.com/test.pdf",
        documentCategory: "TestCategory",
      }),
    } as unknown as Request;

    const response = await POST(mockRequest);
    const responseData = await response.json();

    expect(response.status).toBe(500);
    expect(responseData).toHaveProperty("error");
  });
});
