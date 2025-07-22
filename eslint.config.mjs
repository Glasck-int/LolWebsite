import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "**/generated/**", // Ignore all generated files
      "**/backend/src/generated/**", // Ignore backend generated files
      "**/.next/**", // Ignore Next.js build files
      "**/node_modules/**", // Ignore node_modules
    ],
  },
];

export default eslintConfig;
