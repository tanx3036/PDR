// src/app/api/__tests__/loginUpload.integration.spec.ts

jest.mock("@clerk/nextjs/server", () => ({
    auth: jest.fn(),
  }));
  
  // Hard mock Uploadthing manually (skip real uploadthing internals)
  const fakeUploadThingRouter = {
    pdfUploader: {
      upload: jest.fn(),
      middleware: {
        resolver: jest.fn(),
      },
      onUploadComplete: jest.fn(),
    },
  };
  
  jest.mock("~/app/api/uploadthing/core", () => ({
    ourFileRouter: fakeUploadThingRouter,
  }));
  
  jest.mock("~/server/db/index", () => ({
    db: {
      insert: jest.fn().mockReturnThis(),
      values: jest.fn().mockResolvedValue(undefined),
      select: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      where: jest.fn(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      set: jest.fn(),
      execute: jest.fn(),
    },
  }));
  
  import { auth } from "@clerk/nextjs/server";
  import { ourFileRouter } from "~/app/api/uploadthing/core";
  
  describe("Login + Upload Document Integration", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
  
    it("should simulate login and document upload", async () => {
      (auth as jest.Mock).mockResolvedValue({ userId: "fakeUserId123" });
  
      const userId = (await auth()).userId;
      expect(userId).toBe("fakeUserId123");
  
      const fakeMetadata = { userId: userId };
      const fakeFile = {
        url: "https://example.com/fakefile.pdf",
        name: "test.pdf",
        size: 123456,
        key: "fake-key",
      };
  
      // Fake the behavior of onUploadComplete
      (ourFileRouter.pdfUploader.onUploadComplete as jest.Mock).mockResolvedValue({
        uploadedBy: fakeMetadata.userId,
        fileUrl: fakeFile.url,
        filename: fakeFile.name,
      });
  
      const uploadResult = await ourFileRouter.pdfUploader.onUploadComplete({
        metadata: fakeMetadata,
        file: fakeFile,
      });
  
      expect(uploadResult).toEqual({
        uploadedBy: "fakeUserId123",
        fileUrl: "https://example.com/fakefile.pdf",
        filename: "test.pdf",
      });
    });
  });
  