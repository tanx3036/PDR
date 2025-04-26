// src/app/api/fetchUserInfo/route.spec.ts

import { POST } from "./route";
import { db } from "../../../server/db/index";
import { users, company } from "../../../server/db/schema";
import { eq, and } from "drizzle-orm";

jest.mock("../../../server/db/index", () => ({
  db: {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn(),
  },
}));

jest.mock("../../../server/db/schema", () => ({
  users: { userId: "mockUserId", companyId: "mockCompanyId", createdAt: "mockCreatedAt" },
  company: { id: "mockCompanyId" },
}));

jest.mock("drizzle-orm", () => ({
  eq: jest.fn(),
  and: jest.fn(),
}));

describe("fetchUserInfo POST API", () => {
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

  it("should return 404 if company is not found", async () => {
    (db.where as jest.Mock)
      .mockResolvedValueOnce([{ companyId: 456, createdAt: "2024-01-01T00:00:00.000Z" }]) // mock user found
      .mockResolvedValueOnce([]); // mock no company found

    const mockRequest = {
      json: jest.fn().mockResolvedValue({ userId: "user123" }),
    } as unknown as Request;

    const response = await POST(mockRequest);
    const responseData = await response.json();

    expect(response.status).toBe(404);
    expect(responseData).toEqual({ error: "Company not found" });
  });

  it("should return 200 with user info and company name", async () => {
    (db.where as jest.Mock)
      .mockResolvedValueOnce([{ 
        companyId: 456, 
        createdAt: "2024-01-01T00:00:00.000Z", 
        userId: "user123",
        name: "Test User",
        role: "employee",
        status: "verified"
      }]) // mock user found
      .mockResolvedValueOnce([{ id: 456, name: "TestCompany" }]); // mock company found

    const mockRequest = {
      json: jest.fn().mockResolvedValue({ userId: "user123" }),
    } as unknown as Request;

    const response = await POST(mockRequest);
    const responseData = await response.json();

    expect(response.status).toBe(200);
    expect(responseData).toMatchObject({
      company: "TestCompany",
      submissionDate: expect.any(String), // formatted date
      userId: "user123",
      name: "Test User",
      role: "employee",
      status: "verified",
      companyId: 456
    });
  });

  it("should return 500 if there is an exception", async () => {
    (db.where as jest.Mock).mockRejectedValueOnce(new Error("DB error"));

    const mockRequest = {
      json: jest.fn().mockResolvedValue({ userId: "user123" }),
    } as unknown as Request;

    const response = await POST(mockRequest);
    const responseData = await response.json();

    expect(response.status).toBe(500);
    expect(responseData).toEqual({ error: "Unable to fetch user and company info" });
  });
});
