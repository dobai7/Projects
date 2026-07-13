import jwt from "jsonwebtoken";
import config from "../config/index.js";
import userModel from "../models/user.model.js";

const authMiddleware = async (req, res, next) => {
    const accessToken = req.headers.authorization?.split(" ")[1];

    if (!accessToken) {
        return res.status(401).json({
            message: "Access token not found"
        });
    }

    try {
        const decoded = jwt.verify(accessToken, config.jwt_secret);

        const user = await userModel.findById(decoded.userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        req.user = user;

        next();

    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired access token"
        });
    }
};

export default authMiddleware;