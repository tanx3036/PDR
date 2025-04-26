// src/app/api/Categories/DeleteCategories/route.spec.ts

import { DELETE } from "./route";
import { db } from "../../../../server/db/index";
import { category } from "../../../../server/db/schema";
import { eq } from "drizzle-orm";

jest.mock("../../../../server/db/index", () => ({
  db: {
    delete: jest.fn().mockReturnThis(),
    where: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock("../../../../server/db/schema", () => ({
  category: { id: "mockCategoryId" },
}));

jest.mock("drizzle-orm", () => ({
  eq: jest.fn(),
}));

describe("DeleteCategories DELETE API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should delete a category successfully", async () => {
    const mockRequest = {
      json: jest.fn().mockResolvedValue({ id: "123" }),
    } as unknown as Request;

    const response = await DELETE(mockRequest);
    const responseData = await response.json();

    expect(response.status).toBe(200);
    expect(responseData).toEqual({ success: true });

    expect(db.delete).toHaveBeenCalledWith(category);
    expect(eq).toHaveBeenCalledWith(category.id, 123);
    expect(db.where).toHaveBeenCalled();
  });

  it("should return 500 if there is an exception", async () => {
    (db.where as jest.Mock).mockRejectedValueOnce(new Error("DB delete error"));

    const mockRequest = {
      json: jest.fn().mockResolvedValue({ id: "123" }),
    } as unknown as Request;

    const response = await DELETE(mockRequest);
    const responseData = await response.json();

    expect(response.status).toBe(500);
    expect(responseData).toHaveProperty("error");
  });
});
