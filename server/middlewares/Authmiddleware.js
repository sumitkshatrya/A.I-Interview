import jwt from "jsonwebtoken";

const isAuth = (req, res, next) => {
  try {
    let token = req.cookies?.token;

    if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: "Unauthorized: Please log in to proceed." });
    }

    const secretKey = process.env.JWT_SECRET_KEY || process.env.JWT_SECRET || "default_secret_key";
    const verifyToken = jwt.verify(token, secretKey);

    if (!verifyToken || !verifyToken.userId) {
      return res.status(401).json({ success: false, message: "Unauthorized: Token verification failed." });
    }

    req.userId = verifyToken.userId;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: `Authentication expired: ${error.message}` });
  }
};

export default isAuth;