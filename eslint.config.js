import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";

export default [
  {
    ignores: [".data/*"],
  },
  js.configs.recommended,
  eslintConfigPrettier,
];
