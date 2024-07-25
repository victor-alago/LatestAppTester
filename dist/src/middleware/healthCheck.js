"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
router.get("/api/health", (res) => {
    res.status(200).json({
        message: "All up and running !!",
    });
});
exports.default = router;
//# sourceMappingURL=healthCheck.js.map