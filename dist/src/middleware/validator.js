"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = require("./winston");
const statusCodes_1 = __importDefault(require("../constants/statusCodes"));
const validator = (req, res, next) => {
    if (req.body.creation_date) {
        delete req.body.creation_date;
    }
    const creationDate = new Date().toJSON().slice(0, 10);
    req.body.creation_date = creationDate;
    try {
        for (const [key, value] of Object.entries(req.body)) {
            if (value === "") {
                req.body[key] = null;
                continue;
            }
        }
        next();
    }
    catch (error) {
        winston_1.logger.error(error);
        res.status(statusCodes_1.default.badRequest).json({ error: "Bad request" });
    }
};
exports.default = validator;
//# sourceMappingURL=validator.js.map