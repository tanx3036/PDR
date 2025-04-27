// src/app/api/approveEmployees/approveEmployees.spec.ts

import { POST } from "./route"; // if your POST is inside route.ts
import { db } from "../../../server/db/index";
import { users } from "../../../server/db/schema";
import { eq } from "drizzle-orm";

jest.mock("../../../server/db/index", () => ({
  db: {
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    where: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock("../../../server/db/schema", () => ({
  users: { id: "mockUserId" },
}));

jest.mock("drizzle-orm", () => ({
  eq: jest.fn(),
}));


describe("approveEmployees POST API", () => {
  it("should update the user status and return 200", async () => {
    const mockRequest = {
      json: jest.fn().mockResolvedValue({ employeeId: "123" }),
    } as unknown as Request;

    const response = await POST(mockRequest);

    const responseData = await response.json();
    expect(response.status).toBe(200);
    expect(responseData).toEqual({ status: 200 });

    expect(db.update).toHaveBeenCalledWith(users);
    expect(db.set).toHaveBeenCalledWith({ status: "verified" });
    expect(eq).toHaveBeenCalledWith(users.id, 123);
    expect(db.where).toHaveBeenCalled();
  });

  it("should return 500 if request.json() throws error", async () => {
    const mockRequest = {
      json: jest.fn().mockRejectedValue(new Error("Test error")),
    } as unknown as Request;

    const response = await POST(mockRequest);

    const responseData = await response.json();
    expect(response.status).toBe(500);
    expect(responseData).toEqual({ error: "Unable to fetch documents" });
  });
});
