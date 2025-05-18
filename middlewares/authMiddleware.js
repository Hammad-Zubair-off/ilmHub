const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET || process.env.jwt_secret);
    // For admin, set both id and userId to "admin"
    if (decodedToken.id === "admin") {
      req.user = { id: "admin", userId: "admin" };
    } else {
      req.user = { id: decodedToken.userId, userId: decodedToken.userId };
    }
    next();
  } catch (error) {
    res.status(401).send({
      message: "You are not authenticated",
      data: error,
      success: false,
    });
  }
};
