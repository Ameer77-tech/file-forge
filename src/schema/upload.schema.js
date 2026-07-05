import { z } from "zod";

const allowedContentTypes = [
  "text/plain",
  "text/csv",
  "application/csv",
  "application/vnd.ms-excel",
];

const uploadValidationSchema = z.object({
  "content-type": z
    .string()
    .refine((value) => {
      const normalized = value.toLowerCase();
      return (
        normalized.includes("multipart/form-data") ||
        allowedContentTypes.some((type) => normalized.includes(type))
      );
    }, "Unsupported file type")
    .optional(),
  "x-file-name": z.string().trim().min(1, "File name is required").optional(),
});

export { uploadValidationSchema };
