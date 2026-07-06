import { uploadValidationSchema } from "../schema/upload.schema.js";
import BadRequestError from "../errors/BadRequest.js";
import UnsupportedMediaTypeError from "../errors/UnsopportedMediaType.js";

const validateUpload = (req, res, next) => {
  const result = uploadValidationSchema.safeParse(req.headers);

  if (!result.success) {
    const issue = result.error.issues[0];
    const message = issue?.message || "Invalid upload request";
  

    if (message === "Unsupported file type") {    
      throw new UnsupportedMediaTypeError(message);
    }

    throw new BadRequestError(message);
  }

  next();
};

export default validateUpload;
