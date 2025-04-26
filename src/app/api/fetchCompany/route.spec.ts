// src/app/api/fetchCompany/route.spec.ts

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
  users: { userId: "mockUserId", companyId: "mockCompanyId" },
  company: { id: "mockCompanyId" },
}));

jest.mock("drizzle-orm", () => ({
  eq: jest.fn(),
  and: jest.fn(),
}));

describe("fetchCompany POST API", () => {
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

  it("should fetch and return company info successfully", async () => {
    (db.where as jest.Mock)
      .mockResolvedValueOnce([{ companyId: 456 }]) // Mock finding user
      .mockResolvedValueOnce([{ id: 456, name: "TestCompany" }]); // Mock finding company

    const mockRequest = {
      json: jest.fn().mockResolvedValue({ userId: "user123" }),
    } as unknown as Request;

    const response = await POST(mockRequest);
    const responseData = await response.json();

    expect(response.status).toBe(200);
    expect(responseData).toEqual([{ id: 456, name: "TestCompany" }]);

    expect(db.select).toHaveBeenCalledTimes(2);
    expect(db.from).toHaveBeenCalledWith(users);
    expect(eq).toHaveBeenCalled();
    expect(and).toHaveBeenCalled();
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
