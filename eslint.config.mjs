import js from "@eslint/js";
import globals from "globals";

export default [
  { ignores: ["eslint.config.mjs", "node_modules/**", "dist/**", "coverage/**"] },
  js.configs.recommended,
  {
    files: ["**/*.{js,cjs}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "commonjs",
      globals: { ...globals.node },
    },
    rules: {
      indent: ["error", 2],
      "linebreak-style": ["error", "unix"],
      quotes: ["error", "single"],
      semi: ["error", "always"],
      "no-unused-vars": ["error", { argsIgnorePattern: "^_" }] 
    },
  },
  {
    files: ["**/*.mjs", "config/**/*.js", "lib/**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: { ...globals.node },
    },
  },
  // Tests (Jest)
  {
    files: ["**/*.test.js"],
    languageOptions: {
      globals: { ...globals.node, ...globals.jest },
    },
  },
];
