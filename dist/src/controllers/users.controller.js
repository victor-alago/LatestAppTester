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
exports.login = exports.register = void 0;
const statusCodes_1 = __importDefault(require("../constants/statusCodes"));
const winston_1 = __importDefault(require("../middleware/winston"));
const db_connect_1 = __importDefault(require("../boot/database/db_connect"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, username, password, country, city, street } = req.body;
    if (!email || !username || !password || !country) {
        res.status(statusCodes_1.default.badRequest).json({ message: "Missing parameters" });
    }
    else {
        const client = yield db_connect_1.default.connect();
        try {
            const result = yield client.query("SELECT * FROM users WHERE email = $1;", [email]);
            if (result.rowCount) {
                res
                    .status(statusCodes_1.default.userAlreadyExists)
                    .json({ message: "User already has an account" });
            }
            else {
                yield client.query("BEGIN");
                const addedUser = yield client.query(`INSERT INTO users(email, username, password, creation_date)
           VALUES ($1, $2, crypt($3, gen_salt('bf')), $4);`, [email, username, password, req.body.creation_date]);
                winston_1.default.info("USER ADDED", addedUser.rowCount);
                const address = yield client.query(`INSERT INTO addresses(email, country, street, city) VALUES ($1, $2, $3, $4);`, [email, country, street, city]);
                winston_1.default.info("ADDRESS ADDED", address.rowCount);
                res.status(statusCodes_1.default.success).json({ message: "User created" });
                yield client.query("COMMIT");
            }
        }
        catch (error) {
            yield client.query("ROLLBACK");
            winston_1.default.error(error.stack);
            res.status(statusCodes_1.default.queryError).json({
                message: "Exception occurred while registering",
            });
        }
        finally {
            client.release();
        }
    }
});
exports.register = register;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(statusCodes_1.default.badRequest).json({ message: "Missing parameters" });
    }
    else {
        db_connect_1.default.query("SELECT * FROM users WHERE email = $1 AND password = crypt($2, password);", [email, password], (err, rows) => {
            if (err) {
                winston_1.default.error(err.stack);
                res
                    .status(statusCodes_1.default.queryError)
                    .json({ error: "Exception occurred while logging in" });
            }
            else {
                if (rows.rows[0]) {
                    req.session.user = {
                        email: rows.rows[0].email,
                    };
                    const token = jsonwebtoken_1.default.sign({ user: { email: rows.rows[0].email } }, process.env.JWT_SECRET_KEY, {
                        expiresIn: "1h",
                    });
                    res
                        .status(statusCodes_1.default.success)
                        .json({ token, username: rows.rows[0].username });
                }
                else {
                    res
                        .status(statusCodes_1.default.notFound)
                        .json({ message: "Incorrect email/password" });
                }
            }
        });
    }
});
exports.login = login;
//# sourceMappingURL=users.controller.js.map