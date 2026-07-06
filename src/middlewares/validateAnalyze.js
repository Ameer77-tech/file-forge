import BadRequestError from "../errors/BadRequest.js";
import analyzeSchema from "../schema/analyze.schema.js";

const ValidateAnalyze = (req, res, next) => {
  const ok = analyzeSchema.safeParse({ fileId: req.params.id });
  if (!ok.success) {
    throw new BadRequestError("File Id Is Required");
  } else {
    next();
  }
};

export default ValidateAnalyze;
