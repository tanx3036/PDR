// src/app/api/deleteDocument/route.spec.ts

import { DELETE } from "./route";
import { db } from "../../../server/db/index";
import { document } from "../../../server/db/schema";
import { eq } from "drizzle-orm";

jest.mock("../../../server/db/index", () => ({
  db: {
    delete: jest.fn().mockReturnThis(),
    where: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock("../../../server/db/schema", () => ({
  document: { id: "mockDocumentId" },
}));

jest.mock("drizzle-orm", () => ({
  eq: jest.fn(),
}));

describe("deleteDocument DELETE API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should delete a document successfully", async () => {
    const mockRequest = {
      json: jest.fn().mockResolvedValue({ docId: "123" }),
    } as unknown as Request;

    const response = await DELETE(mockRequest);
    const responseData = await response.json();

    expect(response.status).toBe(200);
    expect(responseData).toEqual({ success: true });

    expect(db.delete).toHaveBeenCalledWith(document);
    expect(eq).toHaveBeenCalledWith(document.id, 123);
    expect(db.where).toHaveBeenCalled();
  });

  it("should return 500 if there is an exception", async () => {
    (db.where as jest.Mock).mockRejectedValueOnce(new Error("DB delete error"));

    const mockRequest = {
      json: jest.fn().mockResolvedValue({ docId: "123" }),
    } as unknown as Request;

    const response = await DELETE(mockRequest);
    const responseData = await response.json();

    expect(response.status).toBe(500);
    expect(responseData).toEqual({ error: "Error deleting document" });
  });
});
