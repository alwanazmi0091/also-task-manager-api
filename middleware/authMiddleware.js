const authenticate = (req, res, next) => {
  if (req.session?.userId) {
    return next();
  }

  return res.status(401).json({
    message: "Unauthorized, login first",
  });
};

export default authenticate
