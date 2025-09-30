// ESLint v9 flat config for frontend (React + ESM)
export default [
  {
    ignores: [
      'node_modules/**',
      'coverage/**',
      'reports/**',
      'dist/**'
    ]
  },
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: { jsx: true }
      }
    },
    rules: {
      // Add project rules here as needed
    }
  }
]
