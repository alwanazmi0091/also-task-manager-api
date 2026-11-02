const validate = (schema, property = "body") => {
  return (req, res, next) => {
    const result = schema.safeParse(req[property]);

    if (!result.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    if (property === "query") {
      req.validatedQuery = result.data;
    } else if (property === "params") {
      req.validatedParams = result.data;
    } else {
      req[property] = result.data;
    }

    next();
  };
};

export default validate;
