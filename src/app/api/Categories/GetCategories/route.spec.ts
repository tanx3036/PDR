// src/app/api/Categories/GetCategories/route.spec.ts

import { POST } from "./route"; // Import your POST handler
import { db } from "../../../../server/db";
import { users, category } from "../../../../server/db/schema";
import { eq } from "drizzle-orm";

jest.mock("../../../../server/db", () => ({
  db: {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn(),
  },
}));

jest.mock("../../../../server/db/schema", () => ({
  users: { userId: "mockUserId" },
  category: { companyId: "mockCompanyId" },
}));

jest.mock("drizzle-orm", () => ({
  eq: jest.fn(),
}));

describe("GetCategories POST API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should fetch categories successfully when user exists", async () => {
    // Step 1: first select call -> return user info
    (db.where as jest.Mock)
      .mockResolvedValueOnce([{ companyId: "company123" }]) // Mock user lookup
      .mockResolvedValueOnce([{ id: 1, name: "Category1" }, { id: 2, name: "Category2" }]); // Mock category lookup

    const mockRequest = {
      json: jest.fn().mockResolvedValue({
        userId: "user123",
      }),
    } as unknown as Request;

    const response = await POST(mockRequest);
    const responseData = await response.json();

    expect(response.status).toBe(200);
    expect(responseData).toEqual([
      { id: 1, name: "Category1" },
      { id: 2, name: "Category2" },
    ]);

    expect(db.select).toHaveBeenCalledTimes(2);
    expect(db.from).toHaveBeenCalledWith(users);
    expect(eq).toHaveBeenCalledWith(users.userId, "user123");
  });

  it("should return 400 if user is not found", async () => {
    (db.where as jest.Mock).mockResolvedValueOnce([]); // User not found

    const mockRequest = {
      json: jest.fn().mockResolvedValue({
        userId: "invalidUser",
      }),
    } as unknown as Request;

    const response = await POST(mockRequest);
    const responseData = await response.json();

    expect(response.status).toBe(400);
    expect(responseData).toEqual({ error: "Invalid user." });

    expect(db.select).toHaveBeenCalledTimes(1); // only users lookup attempted
    expect(db.from).toHaveBeenCalledWith(users);
  });

  it("should return 500 if something throws", async () => {
    (db.where as jest.Mock).mockRejectedValueOnce(new Error("DB error"));

    const mockRequest = {
      json: jest.fn().mockResolvedValue({
        userId: "user123",
      }),
    } as unknown as Request;

    const response = await POST(mockRequest);
    const responseData = await response.json();

    expect(response.status).toBe(500);
    expect(responseData).toEqual({ error: "Unable to fetch documents" });
  });
});
