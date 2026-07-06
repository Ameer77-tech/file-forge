import { z } from "zod/v4";

const analyzeSchema = z.object({
  fileId: z.string().min(1, { error: "File Id Required" }),
});

export default analyzeSchema;
