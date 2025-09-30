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
      ecmaFeatures: { jsx: true }
    },
    rules: {
      // Add project rules here as needed
    }
  }
]

