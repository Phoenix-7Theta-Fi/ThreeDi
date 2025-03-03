import { generateUploadButton, generateUploadDropzone, generateReactHelpers } from "@uploadthing/react";
import type { OurFileRouter } from "../app/api/uploadthing/core";

export const uploadButtonConfig = {
  appearance: {
    button: {
      background: "var(--text)",
      color: "var(--background)",
    },
  },
};

// Configuration for UploadDropzone
export const uploadDropzoneConfig = {
  mode: "auto" as const,
  appendOnPaste: true
};

// Custom styling for UploadDropzone can be applied through CSS
export const getUploadDropzoneClassNames = () => ({
  container: "ut-upload-container bg-opacity-5 border-2 border-dashed rounded-md p-8",
  label: "ut-label text-text",
  allowedContent: "ut-allowed-content opacity-70"
});

export const UploadButton = generateUploadButton<OurFileRouter>();
export const UploadDropzone = generateUploadDropzone<OurFileRouter>();
export const { useUploadThing } = generateReactHelpers<OurFileRouter>();
