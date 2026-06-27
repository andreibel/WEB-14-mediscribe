import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // JetBrains "Inspect Code" HTML export artifacts (local, untracked) — not
    // project source, so don't lint script.js/styles.css next to index.html.
    "index.html",
    "script.js",
    "styles.css",
  ]),
]);

export default eslintConfig;
