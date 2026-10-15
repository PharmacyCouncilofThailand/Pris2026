import { defineConfig } from "@playwright/test";
import base from "./playwright.merchandise.config";

// Same complete suite and browser settings; retain a machine-readable final proof.
export default defineConfig({
  ...base,
  reporter: [
    ["list"],
    ["json", { outputFile: ".merchandise-local/p14-browser-results.json" }],
    ["html", { outputFolder: "playwright-report", open: "never" }],
  ],
});
