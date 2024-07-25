"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const notFound = (res) => {
    const err = new Error("Not Found");
    res.status(404).json({
        error: {
            message: err.message,
        },
    });
};
exports.default = notFound;
//# sourceMappingURL=notFound.js.map