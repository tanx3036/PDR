// src/app/api/Categories/Categories.integration.spec.ts

import { POST as AddCategory } from "/AddCategories/route";
import { POST as GetCategories } from "/GetCategories/route";
import { DELETE as DeleteCategory } from "/DeleteCategories/route";
import { db } from "../../../server/db/index";
import { users, category } from "../../../server/db/schema";
import { eq } from "drizzle-orm";

// Mock db setup
jest.mock("../../../../server/db/index", () => ({
  db: {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn(),
    insert: jest.fn().mockReturnThis(),
    values: jest.fn().mockResolvedValue(undefined),
    delete: jest.fn().mockReturnThis(),
  },
}));

jest.mock("../../../../server/db/schema", () => ({
  users: { userId: "mockUserId" },
  category: { id: "mockCategoryId", companyId: "mockCompanyId" },
}));

jest.mock("drizzle-orm", () => ({
  eq: jest.fn(),
}));

describe("Categories Integration Flow", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should add, retrieve, and delete a category successfully", async () => {
    // Step 1: Add a category
    (db.where as jest.Mock)
      .mockResolvedValueOnce([{ companyId: "company123" }]); // user found for AddCategory

    const addRequest = {
      json: jest.fn().mockResolvedValue({
        userId: "user123",
        CategoryName: "TestCategory",
      }),
    } as unknown as Request;

    const addResponse = await AddCategory(addRequest);
    const addData = await addResponse.json();

    expect(addResponse.status).toBe(200);
    expect(addData).toEqual({ success: true });

    // Step 2: Get categories (after adding)
    (db.where as jest.Mock)
      .mockResolvedValueOnce([{ companyId: "company123" }]) // user found for GetCategories
      .mockResolvedValueOnce([
        { id: 123, name: "TestCategory" },
      ]); // newly added category

    const getRequest = {
      json: jest.fn().mockResolvedValue({
        userId: "user123",
      }),
    } as unknown as Request;

    const getResponse = await GetCategories(getRequest);
    const getData = await getResponse.json();

    expect(getResponse.status).toBe(200);
    expect(getData).toEqual([{ id: 123, name: "TestCategory" }]);

    // Step 3: Delete the category
    const deleteRequest = {
      json: jest.fn().mockResolvedValue({
        id: "123",
      }),
    } as unknown as Request;

    const deleteResponse = await DeleteCategory(deleteRequest);
    const deleteData = await deleteResponse.json();

    expect(deleteResponse.status).toBe(200);
    expect(deleteData).toEqual({ success: true });
  });
});
