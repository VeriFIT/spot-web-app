import js from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import jsxA11y from "eslint-plugin-jsx-a11y";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";

// jsx-a11y's recommended rules are surfacing real problems (see section 6 of
// modernize.md) that cannot all be fixed at once. Keep them visible as warnings
// for now, and promote them to errors once the accessibility pass is done.
const a11yAsWarnings = Object.fromEntries(
  Object.keys(jsxA11y.flatConfigs.recommended.rules).map((rule) => [rule, "warn"])
);

// Every source module is TypeScript now; only the config files are plain JS.
const jsFiles = ["**/*.js"];
const tsFiles = ["**/*.{ts,tsx}"];

const browserSource = {
  ecmaVersion: 2023,
  sourceType: "module",
  globals: { ...globals.browser },
};

export default [
  { ignores: ["build/**", "dist/**", "public/**"] },

  // Existing JavaScript sources (JSX included).
  { ...js.configs.recommended, files: jsFiles, languageOptions: browserSource },
  { ...react.configs.flat.recommended, files: jsFiles },
  { ...react.configs.flat["jsx-runtime"], files: jsFiles },
  { ...jsxA11y.flatConfigs.recommended, files: jsFiles },
  {
    files: jsFiles,
    languageOptions: browserSource,
    plugins: { "react-hooks": reactHooks },
    settings: { react: { version: "detect" } },
    rules: {
      ...a11yAsWarnings,
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      // PropTypes are not used in this project; types come from TypeScript
      // during the migration described in section 2.1 of modernize.md.
      "react/prop-types": "off",
      // Plain quotation marks in the help prose are intentional and render
      // correctly; escaping them would only obscure the text.
      "react/no-unescaped-entities": "off",
      "no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrors: "none" },
      ],
    },
  },

  // TypeScript sources: components included, so React and accessibility rules
  // apply here as well.
  ...tseslint.configs.recommended.map((config) => ({ ...config, files: tsFiles })),
  { ...react.configs.flat.recommended, files: tsFiles },
  { ...react.configs.flat["jsx-runtime"], files: tsFiles },
  { ...jsxA11y.flatConfigs.recommended, files: tsFiles },
  {
    files: tsFiles,
    languageOptions: browserSource,
    plugins: { "react-hooks": reactHooks },
    settings: { react: { version: "detect" } },
    rules: {
      ...a11yAsWarnings,
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "react/prop-types": "off",
      "react/no-unescaped-entities": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrors: "none" },
      ],
    },
  },

  {
    files: ["*.config.{js,ts}"],
    languageOptions: { globals: { ...globals.node } },
  },
  prettier,
];
