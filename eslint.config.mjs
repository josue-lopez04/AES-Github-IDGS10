import js from "@eslint/js";
import globals from "globals";

export default [
  { ignores: ["eslint.config.mjs", "node_modules/**", "dist/**", "coverage/**"] },

  js.configs.recommended,

  // Default: CommonJS (tu proyecto usa require/module.exports)
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
      "no-unused-vars": ["error", { argsIgnorePattern: "^_" }] // permite _next
    },
  },

  // Soporte ESM cuando sea necesario
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
