"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerCoreMiddleWare = exports.startApp = void 0;
const express_1 = __importDefault(require("express"));
const express_session_1 = __importDefault(require("express-session"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const mongoose_1 = __importDefault(require("mongoose"));
const morgan_1 = __importDefault(require("morgan"));
const winston_1 = __importDefault(require("../middleware/winston"));
const authentication_1 = __importDefault(require("../middleware/authentication"));
const users_routes_1 = __importDefault(require("../routes/users.routes"));
const profile_routes_1 = __importDefault(require("../routes/profile.routes"));
const PORT = process.env.PORT || 8080;
const app = (0, express_1.default)();
try {
    mongoose_1.default.connect("mongodb://localhost:27017/epita").then(() => {
        winston_1.default.info("MongoDB Connected");
    }).catch((error) => {
        winston_1.default.error("Error connecting to DB" + error.message);
    });
}
catch (error) {
    winston_1.default.error("Error connecting to DB" + error);
}
const registerCoreMiddleWare = () => {
    try {
        app.use((0, express_session_1.default)({
            secret: "1234",
            resave: false,
            saveUninitialized: true,
            cookie: {
                secure: false,
                httpOnly: true,
            },
        }));
        app.use((0, morgan_1.default)("combined", {
            stream: { write: (message) => winston_1.default.info(message.trim()) },
        }));
        app.use(express_1.default.json());
        app.use((0, cors_1.default)({}));
        app.use((0, helmet_1.default)());
        app.use("/users", users_routes_1.default);
        app.use("/profile", authentication_1.default, profile_routes_1.default);
        winston_1.default.http("Done registering all middlewares");
        return app;
    }
    catch (err) {
        winston_1.default.error("Error thrown while executing registerCoreMiddleWare");
        process.exit(1);
    }
};
exports.registerCoreMiddleWare = registerCoreMiddleWare;
const handleError = () => {
    process.on("uncaughtException", (err) => {
        winston_1.default.error(`UNCAUGHT_EXCEPTION OCCURED : ${JSON.stringify(err.stack)}`);
    });
};
const startApp = () => {
    try {
        registerCoreMiddleWare();
        app.listen(PORT, () => {
            winston_1.default.info("Listening on 127.0.0.1:" + PORT);
        });
        handleError();
    }
    catch (err) {
        winston_1.default.error(`startup :: Error while booting the applicaiton ${JSON.stringify(err, undefined, 2)}`);
        throw err;
    }
};
exports.startApp = startApp;
//# sourceMappingURL=setup.js.map