// https://docs.expo.dev/guides/using-eslint/
const expoConfig = require("eslint-config-expo/flat");
const prettier = require("eslint-config-prettier");
const prettierPlugin = require("eslint-plugin-prettier");
const unusedImports = require("eslint-plugin-unused-imports");
const { defineConfig } = require("eslint/config");

module.exports = defineConfig([
  {
    ignores: [
      "dist/*",
      ".expo",
      "node_modules",
      "build",
      "bin",
      "expo-env.d.ts",
      "nativewind-env.d.ts",
      "pnpm-lock.yaml",
      "ios",
      "android",
    ],
  },
  expoConfig,
  prettier,
  {
    plugins: {
      prettier: prettierPlugin,
      "unused-imports": unusedImports,
    },
    rules: {
      "prettier/prettier": "error",
      "unused-imports/no-unused-imports": "error",
      "expo/no-env-var-destructuring": "error",
      "expo/no-dynamic-env-var": "error",
      "no-console": "warn",
      "react/display-name": "off",
    },
  },
]);
