// ESLint v9 flat config for backend (Node ESM)
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
      sourceType: 'module'
    },
    rules: {
      // Add project rules here as needed
    }
  }
]

