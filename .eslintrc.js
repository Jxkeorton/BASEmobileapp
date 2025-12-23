// https://docs.expo.dev/guides/using-eslint/
module.exports = {
  extends: ['expo', 'prettier'],
  ignorePatterns: ['/dist/*'],
  plugins: ['prettier', 'unused-imports', 'expo'],
  rules: {
    'prettier/prettier': 'error',
    'unused-imports/no-unused-imports': 'error',
    "expo/no-env-var-destructuring": "error",
    "expo/no-dynamic-env-var": "error",
    "no-console": "warn"
  },
};
