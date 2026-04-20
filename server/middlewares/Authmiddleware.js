import jwt from "jsonwebtoken";

const isAuth = (req, res, next) => {
    try {
         let {token} = req.cookies

         if(!token) {
            return res.status(400).json({ message: "Bad Request: No token provided" });
         }
         
         const verifyToken = jwt.verify(token, process.env.JWT_SECRET_KEY);

         if(!verifyToken) {
            return res.status(400).json({ message: "Unauthorized: Invalid token" });
         }
         req.userId = verifyToken.userId;
         next();

    } catch (error) {
        return res.status(400).json({ message: `Authentication error: ${error.message}` });
    }
}

export default isAuth;