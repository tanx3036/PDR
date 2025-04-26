// src/app/api/Categories/AddCategories/route.spec.ts

import { POST } from "./route"; // Import the POST handler
import { db } from "~/server/db/index";
import { users, category } from "~/server/db/schema";
import { eq } from "drizzle-orm";

jest.mock("~/server/db/index", () => ({
  db: {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockResolvedValue([{ companyId: "mockCompanyId" }]),
    insert: jest.fn().mockReturnThis(),
    values: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock("~/server/db/schema", () => ({
  users: { userId: "mockUserId" },
  category: {},
}));

jest.mock("drizzle-orm", () => ({
  eq: jest.fn(),
}));

describe("AddCategories POST API", () => {
  it("should insert a new category if user is valid", async () => {
    const mockRequest = {
      json: jest.fn().mockResolvedValue({
        userId: "user123",
        CategoryName: "TestCategory",
      }),
    } as unknown as Request;

    const response = await POST(mockRequest);
    const responseData = await response.json();

    expect(response.status).toBe(200);
    expect(responseData).toEqual({ success: true });

    expect(db.select).toHaveBeenCalled();
    expect(db.from).toHaveBeenCalledWith(users);
    expect(eq).toHaveBeenCalledWith(users.userId, "user123");
    expect(db.where).toHaveBeenCalled();
    expect(db.insert).toHaveBeenCalledWith(category);
    expect(db.values).toHaveBeenCalledWith({
      name: "TestCategory",
      companyId: "mockCompanyId",
    });
  });

  it("should return 400 if user is invalid", async () => {
    (db.where as jest.Mock).mockResolvedValueOnce([]); // simulate no user found

    const mockRequest = {
      json: jest.fn().mockResolvedValue({
        userId: "invalidUser",
        CategoryName: "TestCategory",
      }),
    } as unknown as Request;

    const response = await POST(mockRequest);
    const responseData = await response.json();

    expect(response.status).toBe(400);
    expect(responseData).toEqual({ error: "Invalid user." });
  });

  it("should return 500 if there is an exception", async () => {
    (db.where as jest.Mock).mockRejectedValueOnce(new Error("Database error"));

    const mockRequest = {
      json: jest.fn().mockResolvedValue({
        userId: "user123",
        CategoryName: "TestCategory",
      }),
    } as unknown as Request;

    const response = await POST(mockRequest);
    const responseData = await response.json();

    expect(response.status).toBe(500);
    expect(responseData).toHaveProperty("error");
  });
});
