// src/app/api/removeEmployees/route.spec.ts

import { POST } from "./route";
import { db } from "../../../server/db/index";
import { users } from "../../../server/db/schema";
import { eq } from "drizzle-orm";

jest.mock("../../../server/db/index", () => ({
  db: {
    delete: jest.fn().mockReturnThis(),
    where: jest.fn(),
  },
}));

jest.mock("../../../server/db/schema", () => ({
  users: { id: "mockUserId" },
}));

jest.mock("drizzle-orm", () => ({
  eq: jest.fn(),
}));

describe("removeEmployees POST API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should delete an employee successfully", async () => {
    (db.where as jest.Mock).mockResolvedValueOnce(undefined);

    const mockRequest = {
      json: jest.fn().mockResolvedValue({ employeeId: "123" }),
    } as unknown as Request;

    const response = await POST(mockRequest);
    const responseData = await response.json();

    expect(response.status).toBe(200);
    expect(responseData).toEqual({ status: 200 });

    expect(db.delete).toHaveBeenCalledWith(users);
    expect(eq).toHaveBeenCalledWith(users.id, 123);
    expect(db.where).toHaveBeenCalled();
  });

  it("should return 500 if there is an exception", async () => {
    (db.where as jest.Mock).mockRejectedValueOnce(new Error("DB delete error"));

    const mockRequest = {
      json: jest.fn().mockResolvedValue({ employeeId: "123" }),
    } as unknown as Request;

    const response = await POST(mockRequest);
    const responseData = await response.json();

    expect(response.status).toBe(500);
    expect(responseData).toEqual({ error: "Unable to fetch documents" });
  });
});
