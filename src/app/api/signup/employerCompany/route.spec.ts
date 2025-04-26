// src/app/api/signup/employerCompany/route.spec.ts

import { POST } from "./route";
import { db } from "~/server/db/index";
import { company, users } from "~/server/db/schema";
import { eq } from "drizzle-orm";

jest.mock("~/server/db/index", () => ({
  db: {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn(),
    insert: jest.fn().mockReturnThis(),
    values: jest.fn().mockReturnThis(),
    returning: jest.fn(),
  },
}));

jest.mock("~/server/db/schema", () => ({
  company: { id: "mockCompanyId", name: "mockCompanyName" },
  users: {},
}));

jest.mock("drizzle-orm", () => ({
  eq: jest.fn(),
}));

describe("signup employer company POST API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 400 if company already exists", async () => {
    (db.where as jest.Mock).mockResolvedValueOnce([{ id: 1, name: "ExistingCompany" }]);

    const mockRequest = {
      json: jest.fn().mockResolvedValue({
        userId: "user123",
        name: "Owner User",
        email: "owner@example.com",
        companyName: "ExistingCompany",
        employerPasskey: "pass1",
        employeePasskey: "pass2",
        numberOfEmployees: "10",
      }),
    } as unknown as Request;

    const response = await POST(mockRequest);
    const responseData = await response.json();

    expect(response.status).toBe(400);
    expect(responseData).toEqual({ error: "Company already exists." });
  });

  it("should create a new company and insert owner user successfully", async () => {
    (db.where as jest.Mock).mockResolvedValueOnce([]); // No existing company
    (db.returning as jest.Mock).mockResolvedValueOnce([{ id: 456 }]); // Mock newly created company id

    const mockRequest = {
      json: jest.fn().mockResolvedValue({
        userId: "user123",
        name: "Owner User",
        email: "owner@example.com",
        companyName: "NewCompany",
        employerPasskey: "employerpass",
        employeePasskey: "employeepass",
        numberOfEmployees: "15",
      }),
    } as unknown as Request;

    const response = await POST(mockRequest);
    const responseData = await response.json();

    expect(response.status).toBe(200);
    expect(responseData).toEqual({ success: true });

    expect(db.insert).toHaveBeenCalled();
    expect(db.values).toHaveBeenCalled();
    expect(db.returning).toHaveBeenCalled();
  });

  it("should return 400 if company creation fails", async () => {
    (db.where as jest.Mock).mockResolvedValueOnce([]);
    (db.returning as jest.Mock).mockResolvedValueOnce([]); // No company returned

    const mockRequest = {
      json: jest.fn().mockResolvedValue({
        userId: "user123",
        name: "Owner User",
        email: "owner@example.com",
        companyName: "NewCompany",
        employerPasskey: "employerpass",
        employeePasskey: "employeepass",
        numberOfEmployees: "15",
      }),
    } as unknown as Request;

    const response = await POST(mockRequest);
    const responseData = await response.json();

    expect(response.status).toBe(400);
    expect(responseData).toEqual({ error: "Could not create company." });
  });

  it("should return 500 if there is an exception", async () => {
    (db.where as jest.Mock).mockRejectedValueOnce(new Error("DB error"));

    const mockRequest = {
      json: jest.fn().mockResolvedValue({
        userId: "user123",
        name: "Owner User",
        email: "owner@example.com",
        companyName: "NewCompany",
        employerPasskey: "employerpass",
        employeePasskey: "employeepass",
        numberOfEmployees: "15",
      }),
    } as unknown as Request;

    const response = await POST(mockRequest);
    const responseData = await response.json();

    expect(response.status).toBe(500);
    expect(responseData).toHaveProperty("error");
  });
});
