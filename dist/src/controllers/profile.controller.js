"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.editPassword = void 0;
const db_connect_1 = __importDefault(require("../boot/database/db_connect"));
const winston_1 = require("../middleware/winston");
const statusCodes_1 = __importDefault(require("../constants/statusCodes"));
const editPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
        res.status(statusCodes_1.default.badRequest).json({ message: "Missing parameters" });
    }
    else {
        if (oldPassword === newPassword) {
            res
                .status(statusCodes_1.default.badRequest)
                .json({ message: "New password cannot be equal to old password" });
        }
        else {
            db_connect_1.default.query("SELECT * FROM users WHERE email = $1 AND password = crypt($2, password);", [req.user.email, oldPassword], (err, rows) => {
                if (err) {
                    winston_1.logger.error(err.stack);
                    res
                        .status(statusCodes_1.default.queryError)
                        .json({ error: "Exception occurred while updating password" });
                }
                else {
                    if (rows.rows[0]) {
                        db_connect_1.default.query("UPDATE users SET password = crypt($1, gen_salt('bf')) WHERE email = $2;", [newPassword, req.user.email], (err) => {
                            if (err) {
                                winston_1.logger.error(err.stack);
                                res.status(statusCodes_1.default.queryError).json({
                                    error: "Exception occurred while updating password",
                                });
                            }
                            else {
                                res
                                    .status(statusCodes_1.default.success)
                                    .json({ message: "Password updated" });
                            }
                        });
                    }
                    else {
                        res
                            .status(statusCodes_1.default.badRequest)
                            .json({ message: "Incorrect password" });
                    }
                }
            });
        }
    }
});
exports.editPassword = editPassword;
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.session.user) {
        delete req.session.user;
    }
    return res.status(200).json({ message: "Disconnected" });
});
exports.logout = logout;
//# sourceMappingURL=profile.controller.js.map