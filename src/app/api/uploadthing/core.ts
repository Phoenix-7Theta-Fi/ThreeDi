import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UTApi } from "uploadthing/server";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();
const utapi = new UTApi();

// Simple auth function - Replace this with your own
const auth = async () => ({ id: "guest" });

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  chartImage: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1
    }
  })
    .middleware(async ({ req }) => {
      try {
        const user = await auth();
        if (!user) throw new UploadThingError("Unauthorized");
        return { userId: user.id };
      } catch (error) {
        console.error("Middleware error:", error);
        throw new UploadThingError("Middleware failed");
      }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      try {
        console.log("Upload complete for userId:", metadata.userId);
        console.log("File URL:", file.ufsUrl || file.url);

        // Verify the file info using either URL format
        if (!(file.ufsUrl || file.url) || !file.key) {
          throw new Error("File upload failed: Missing file information");
        }

        return {
          uploadedBy: metadata.userId,
          url: file.ufsUrl || file.url,
          key: file.key,
          name: file.name,
          size: file.size
        };
      } catch (error) {
        console.error("Upload complete error:", error);
        throw new UploadThingError("Failed to process upload");
      }
    }),
} satisfies FileRouter;

// Helper function to delete uploaded file
export async function deleteUploadedFile(fileKey: string) {
  try {
    await utapi.deleteFiles(fileKey);
    return true;
  } catch (error) {
    console.error("Error deleting file from UploadThing:", error);
    return false;
  }
}

export type OurFileRouter = typeof ourFileRouter;
