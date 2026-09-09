import js from "@eslint/js";
import ts from "typescript-eslint";
import astro from "eslint-plugin-astro";
import globals from "globals";
import { defineConfig } from "eslint/config";
export default defineConfig(
  {
    ignores: [
      "dist/**",
      ".astro/**",
      "node_modules/**",
      "test-results/**",
      "playwright-report/**",
    ],
  },
  js.configs.recommended,
  ...ts.configs.recommended,
  ...astro.configs.recommended,
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
);
