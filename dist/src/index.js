"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const setup_1 = require("./boot/setup");
(() => {
    try {
        (0, setup_1.startApp)();
    }
    catch (error) {
        console.log("Error in index.js => startApp");
        console.log(`Error; ${JSON.stringify(error, undefined, 2)}`);
    }
})();
//# sourceMappingURL=index.js.map