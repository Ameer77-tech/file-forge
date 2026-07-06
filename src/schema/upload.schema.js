import { z } from "zod/v4";

const allowedContentTypes = [
  "text/plain",
  "text/csv",
  "application/csv",
  "application/vnd.ms-excel",
];

const uploadValidationSchema = z.object({
  "content-type": z
    .string({
      error: (issue) => {
        if (issue.input === undefined) {
          return "Content-Type header is required";
        }

        return "Content-Type header must be a string";
      },
    })
    .refine(
      (value) => {
        const normalized = value.toLowerCase();

        return (
          normalized.includes("multipart/form-data") ||
          allowedContentTypes.some((type) => normalized.includes(type))
        );
      },
      {
        message: "Unsupported file Type",
      },
    ),
  "x-file-name": z.string().trim().min(1, "File name is required").optional(),
});

export { uploadValidationSchema };
