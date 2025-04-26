// src/app/api/signup/employer/route.spec.ts

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
  company: { name: "mockCompany", employerpasskey: "mockPasskey", id: 789 },
}));

jest.mock("drizzle-orm", () => ({
  eq: jest.fn(),
  and: jest.fn(),
}));

describe("signup employer POST API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 400 if company not found", async () => {
    (db.where as jest.Mock).mockResolvedValueOnce([]);

    const mockRequest = {
      json: jest.fn().mockResolvedValue({
        userId: "employer123",
        name: "Employer Test",
        email: "employer@example.com",
        employerPasskey: "wrongPass",
        companyName: "NonexistentCo",
      }),
    } as unknown as Request;

    const response = await POST(mockRequest);
    const responseData = await response.json();

    expect(response.status).toBe(400);
    expect(responseData).toEqual({ error: "Invalid company name or passkey." });
  });

  it("should insert a new employer user successfully", async () => {
    (db.where as jest.Mock).mockResolvedValueOnce([
      { id: 999, name: "EmployerCo", employerpasskey: "rightPass" }
    ]);

    const mockRequest = {
      json: jest.fn().mockResolvedValue({
        userId: "employer123",
        name: "Employer Test",
        email: "employer@example.com",
        employerPasskey: "rightPass",
        companyName: "EmployerCo",
      }),
    } as unknown as Request;

    const response = await POST(mockRequest);

    // Since successful insert doesn't explicitly return a response, we expect nothing (undefined)
    expect(response).toBeUndefined();

    expect(db.insert).toHaveBeenCalledWith(users);
    expect(db.values).toHaveBeenCalledWith(expect.objectContaining({
      userId: "employer123",
      name: "Employer Test",
      email: "employer@example.com",
      companyId: "999",
      status: "pending",
      role: "employer",
    }));
  });

  it("should return 500 if there is an exception", async () => {
    (db.where as jest.Mock).mockRejectedValueOnce(new Error("DB error"));

    const mockRequest = {
      json: jest.fn().mockResolvedValue({
        userId: "employer123",
        name: "Employer Test",
        email: "employer@example.com",
        employerPasskey: "rightPass",
        companyName: "EmployerCo",
      }),
    } as unknown as Request;

    const response = await POST(mockRequest);
    const responseData = await response?.json();

    expect(response?.status).toBe(500);
    expect(responseData).toHaveProperty("error");
  });
});
