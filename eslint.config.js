import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // Casts through unknown are intentional for PF2e-specific APIs.
      "@typescript-eslint/no-explicit-any": "warn",
      // Non-null assertions on embedded document ids are safe by design.
      "@typescript-eslint/no-non-null-assertion": "warn",
      // ts-expect-error comments must have a description.
      "@typescript-eslint/ban-ts-comment": ["error", {
        "ts-expect-error": "allow-with-description",
        "ts-ignore": true,
      }],
    },
  },
  {
    ignores: ["scripts/**", "node_modules/**", "eslint.config.js"],
  }
);
