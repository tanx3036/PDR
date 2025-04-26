// src/app/api/signup/employee/route.spec.ts

import { POST } from "./route";
import { db } from "~/server/db/index";
import { users, company } from "~/server/db/schema";
import { eq, and } from "drizzle-orm";

jest.mock("~/server/db/index", () => ({
  db: {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn(),
    insert: jest.fn().mockReturnThis(),
    values: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock("~/server/db/schema", () => ({
  users: {},
  company: { name: "mockCompany", employeepasskey: "mockPasskey", id: 123 },
}));

jest.mock("drizzle-orm", () => ({
  eq: jest.fn(),
  and: jest.fn(),
}));

describe("signup employee POST API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 400 if company not found", async () => {
    (db.where as jest.Mock).mockResolvedValueOnce([]);

    const mockRequest = {
      json: jest.fn().mockResolvedValue({
        userId: "user123",
        name: "Test User",
        email: "test@example.com",
        employeePasskey: "wrongPass",
        companyName: "NonExistentCompany",
      }),
    } as unknown as Request;

    const response = await POST(mockRequest);
    const responseData = await response.json();

    expect(response.status).toBe(400);
    expect(responseData).toEqual({ error: "Invalid company name or passkey." });
  });

  it("should insert a new user successfully", async () => {
    (db.where as jest.Mock).mockResolvedValueOnce([
      { id: 456, name: "TestCompany", employeepasskey: "pass123" }
    ]);

    const mockRequest = {
      json: jest.fn().mockResolvedValue({
        userId: "user123",
        name: "Test User",
        email: "test@example.com",
        employeePasskey: "pass123",
        companyName: "TestCompany",
      }),
    } as unknown as Request;

    const response = await POST(mockRequest);
    const responseData = await response.json();

    expect(response.status).toBe(200);
    expect(responseData).toEqual({ success: true });

    expect(db.insert).toHaveBeenCalledWith(users);
    expect(db.values).toHaveBeenCalledWith(expect.objectContaining({
      userId: "user123",
      name: "Test User",
      email: "test@example.com",
      companyId: "456",
      role: "employee",
      status: "pending",
    }));
  });

  it("should return 500 if there is an error", async () => {
    (db.where as jest.Mock).mockRejectedValueOnce(new Error("DB error"));

    const mockRequest = {
      json: jest.fn().mockResolvedValue({
        userId: "user123",
        name: "Test User",
        email: "test@example.com",
        employeePasskey: "pass123",
        companyName: "TestCompany",
      }),
    } as unknown as Request;

    const response = await POST(mockRequest);
    const responseData = await response.json();

    expect(response.status).toBe(500);
    expect(responseData).toHaveProperty("error");
  });
});
