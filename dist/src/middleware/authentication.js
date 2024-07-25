"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const statusCodes_1 = __importDefault(require("../constants/statusCodes"));
const winston_1 = require("./winston");
const verifyToken = (req, res, next) => {
    const token = req.header("Authorization");
    if (!token) {
        return res.status(statusCodes_1.default.unauthorized).json({ error: "Unauthorized" });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token.split(" ")[1], process.env.JWT_SECRET_KEY);
        req.user = decoded.user;
        console.log("TOKEN USER: ", req.user);
        next();
    }
    catch (error) {
        winston_1.logger.error(error);
        return res.status(statusCodes_1.default.unauthorized).json({ error: "Invalid token" });
    }
};
exports.default = verifyToken;
//# sourceMappingURL=authentication.js.map