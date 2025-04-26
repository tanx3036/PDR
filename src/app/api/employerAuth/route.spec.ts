// src/app/api/employerAuth/route.spec.ts

import { POST } from "./route";
import { db } from "../../../server/db/index";
import { users } from "../../../server/db/schema";
import { eq } from "drizzle-orm";

jest.mock("../../../server/db/index", () => ({
  db: {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn(),
  },
}));

jest.mock("../../../server/db/schema", () => ({
  users: { userId: "mockUserId" },
}));

jest.mock("drizzle-orm", () => ({
  eq: jest.fn(),
}));

describe("employerAuth POST API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 404 if user not found", async () => {
    (db.where as jest.Mock).mockResolvedValueOnce([]);

    const mockRequest = {
      json: jest.fn().mockResolvedValue({ userId: "user123" }),
    } as unknown as Request;

    const response = await POST(mockRequest);
    const responseData = await response.json();

    expect(response.status).toBe(404);
    expect(responseData).toEqual({ error: "User not found" });
  });

  it("should return 403 if user role is employee", async () => {
    (db.where as jest.Mock).mockResolvedValueOnce([{ role: "employee", status: "verified" }]);

    const mockRequest = {
      json: jest.fn().mockResolvedValue({ userId: "user123" }),
    } as unknown as Request;

    const response = await POST(mockRequest);
    const responseData = await response.json();

    expect(response.status).toBe(403);
    expect(responseData).toEqual({ error: "Not authorized" });
  });

  it("should return 300 if user is not verified", async () => {
    (db.where as jest.Mock).mockResolvedValueOnce([{ role: "manager", status: "pending" }]);

    const mockRequest = {
      json: jest.fn().mockResolvedValue({ userId: "user123" }),
    } as unknown as Request;

    const response = await POST(mockRequest);
    const responseData = await response.json();

    expect(response.status).toBe(300);
    expect(responseData).toEqual({ error: "User not verified" });
  });

  it("should return 200 and role if user is a verified non-employee", async () => {
    (db.where as jest.Mock).mockResolvedValueOnce([{ role: "manager", status: "verified" }]);

    const mockRequest = {
      json: jest.fn().mockResolvedValue({ userId: "user123" }),
    } as unknown as Request;

    const response = await POST(mockRequest);
    const responseData = await response.json();

    expect(response.status).toBe(200);
    expect(responseData).toEqual({ role: "manager" });
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
