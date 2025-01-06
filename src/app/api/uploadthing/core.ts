import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { auth } from "@clerk/nextjs/server";

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
    pdfUploader: f({
        pdf: {
            maxFileSize: "16MB",
            maxFileCount: 1,
        },
    })
        .middleware(async () => {
            // This code runs on your server before upload
            const { userId } = await auth();
            if (!userId) throw new UploadThingError("Unauthorized");

            // Whatever is returned here is accessible in onUploadComplete as `metadata`
            return { userId };
        })
        .onUploadComplete(async ({ metadata, file }) => {
            // This code RUNS ON YOUR SERVER after upload
            console.log("Upload complete for userId:", metadata.userId);
            console.log("File URL:", file.url);

            // Return the file.url so it can be accessed on the client via onClientUploadComplete
            return {
                uploadedBy: metadata.userId,
                fileUrl: file.url,
                filename: file.name,
            };
        }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;