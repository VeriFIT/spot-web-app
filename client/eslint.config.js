import js from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import jsxA11y from "eslint-plugin-jsx-a11y";
import prettier from "eslint-config-prettier";

// jsx-a11y's recommended rules are surfacing real problems (see section 6 of
// modernize.md) that cannot all be fixed at once. Keep them visible as warnings
// for now, and promote them to errors once the accessibility pass is done.
const a11yAsWarnings = Object.fromEntries(
  Object.keys(jsxA11y.flatConfigs.recommended.rules).map((rule) => [rule, "warn"])
);

export default [
  { ignores: ["build/**", "dist/**", "public/**"] },
  js.configs.recommended,
  react.configs.flat.recommended,
  react.configs.flat["jsx-runtime"],
  jsxA11y.flatConfigs.recommended,
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: "module",
      globals: { ...globals.browser },
    },
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
  {
    files: ["*.config.js"],
    languageOptions: { globals: { ...globals.node } },
  },
  prettier,
];
