// ESLint básico para frontend (React) ESM
module.exports = {
  root: true,
  env: { browser: true, es2022: true },
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: { jsx: true }
  },
  ignorePatterns: ['coverage/', 'dist/', 'reports/']
}
