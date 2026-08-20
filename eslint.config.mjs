import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: ["dist/**", "coverage/**", "node_modules/**", "site/**", "screenshots/**"]
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.node
      }
    },
    rules: {
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }]
    }
  },
  {
    // assets/ is copied into site/ and runs in the browser (kg-shell.js is a
    // <script src> in the rendered pages), not Node - it needs browser
    // globals (document, fetch, ...) instead of the Node ones above.
    files: ["assets/**/*.js"],
    languageOptions: {
      globals: {
        ...globals.browser
      }
    }
  }
);
