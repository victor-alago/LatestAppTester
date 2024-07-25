import "dotenv/config";
import { startApp } from "./boot/setup";

(() => {
  try {
    startApp();
  } catch (error) {
    console.log("Error in index.js => startApp");
    console.log(`Error; ${JSON.stringify(error, undefined, 2)}`);
  }
})();