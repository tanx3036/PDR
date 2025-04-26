// src/app/api/updateCompany/route.spec.ts

import { POST } from "./route";
import { db } from "../../../server/db/index";
import { users, company } from "../../../server/db/schema";
import { eq } from "drizzle-orm";

jest.mock("../../../server/db/index", () => ({
  db: {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),   // ✅ mock it returns "this"!
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    returning: jest.fn().mockResolvedValue([{ id: 1 }]),  // ✅ should return something!
  },
}));


jest.mock("../../../server/db/schema", () => ({
  users: { userId: "mockUserId", companyId: "mockCompanyId" },
  company: { id: "mockCompanyId" },
}));

jest.mock("drizzle-orm", () => ({
  eq: jest.fn(),
}));

describe("updateCompany POST API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 400 if user is invalid", async () => {
    (db.where as jest.Mock).mockResolvedValueOnce([]); // User not found

    const mockRequest = {
      json: jest.fn().mockResolvedValue({
        userId: "user123",
        name: "New Company Name",
        employerPasskey: "newEmployerPass",
        employeePasskey: "newEmployeePass",
        numberOfEmployees: "50",
      }),
    } as unknown as Request;

    const response = await POST(mockRequest);
    const responseData = await response.json();

    expect(response.status).toBe(400);
    expect(responseData).toEqual({ error: "Invalid user." });
  });

  it("should update the company successfully", async () => {
    (db.where as jest.Mock).mockResolvedValueOnce([{ companyId: 789 }]); // Mock found user

    const mockRequest = {
      json: jest.fn().mockResolvedValue({
        userId: "user123",
        name: "Updated Company",
        employerPasskey: "updatedEmployerPass",
        employeePasskey: "updatedEmployeePass",
        numberOfEmployees: "100",
      }),
    } as unknown as Request;

    const response = await POST(mockRequest);
    const responseData = await response.json();

    expect(response.status).toBe(200);
    expect(responseData).toEqual({ status: 200 });

    expect(db.update).toHaveBeenCalledWith(company);
    expect(db.set).toHaveBeenCalledWith(expect.objectContaining({
      name: "Updated Company",
      employerpasskey: "updatedEmployerPass",
      employeepasskey: "updatedEmployeePass",
      numberOfEmployees: "100",
    }));
    expect(db.where).toHaveBeenCalled();
    expect(db.returning).toHaveBeenCalled();
  });

  it("should return 500 if there is an exception", async () => {
    (db.where as jest.Mock).mockRejectedValueOnce(new Error("DB error"));

    const mockRequest = {
      json: jest.fn().mockResolvedValue({
        userId: "user123",
        name: "New Company Name",
        employerPasskey: "newEmployerPass",
        employeePasskey: "newEmployeePass",
        numberOfEmployees: "50",
      }),
    } as unknown as Request;

    const response = await POST(mockRequest);
    const responseData = await response.json();

    expect(response.status).toBe(500);
    expect(responseData).toEqual({ error: "Unable to fetch documents" });
  });
});
