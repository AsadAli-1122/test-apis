const jwt = require("jsonwebtoken");
const user = require("../models/user");

const authMiddleware = async (req, res, next) => {
  const authHeader = req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(400)
      .json({ message: "No token provided, authorization denied" });
  }

  const token = authHeader.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await user.findById(decoded.userId).select("-password -createdAt -updatedAt -__v");

    if (!req.user) {
      return res
        .status(401)
        .json({ message: "User not found, authorization denied" });
    }

    next();
  } catch (err) {
    console.error(err.message);
    res.status(401).json({ message: "Token is not valid" });
  }
};

module.exports = authMiddleware;
