// src/app/api/fetchDocument/route.spec.ts

import { POST } from "./route";
import { db } from "../../../server/db/index";
import { users, document } from "../../../server/db/schema";
import { eq } from "drizzle-orm";

jest.mock("../../../server/db/index", () => ({
  db: {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn(),
  },
}));

jest.mock("../../../server/db/schema", () => ({
  users: { userId: "mockUserId", companyId: "mockCompanyId" },
  document: { companyId: "mockCompanyId" },
}));

jest.mock("drizzle-orm", () => ({
  eq: jest.fn(),
}));

describe("fetchDocument POST API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 400 if user is invalid", async () => {
    (db.where as jest.Mock).mockResolvedValueOnce([]);

    const mockRequest = {
      json: jest.fn().mockResolvedValue({ userId: "user123" }),
    } as unknown as Request;

    const response = await POST(mockRequest);
    const responseData = await response.json();

    expect(response.status).toBe(400);
    expect(responseData).toEqual({ error: "Invalid user." });
  });

  it("should fetch and return documents successfully", async () => {
    (db.where as jest.Mock)
      .mockResolvedValueOnce([{ companyId: 456 }]) // mock finding user
      .mockResolvedValueOnce([
        { id: 1, title: "Doc1" },
        { id: 2, title: "Doc2" },
      ]); // mock finding documents

    const mockRequest = {
      json: jest.fn().mockResolvedValue({ userId: "user123" }),
    } as unknown as Request;

    const response = await POST(mockRequest);
    const responseData = await response.json();

    expect(response.status).toBe(200);
    expect(responseData).toEqual([
      { id: 1, title: "Doc1" },
      { id: 2, title: "Doc2" },
    ]);

    expect(db.select).toHaveBeenCalledTimes(2);
    expect(db.from).toHaveBeenCalledWith(users);
    expect(eq).toHaveBeenCalled();
  });

  it("should return 500 if there is an exception", async () => {
    (db.where as jest.Mock).mockRejectedValueOnce(new Error("DB error"));

    const mockRequest = {
      json: jest.fn().mockResolvedValue({ userId: "user123" }),
    } as unknown as Request;

    const response = await POST(mockRequest);
    const responseData = await response.json();

    expect(response.status).toBe(500);
    expect(responseData).toEqual({ error: "Unable to fetch documents" });
  });
});
