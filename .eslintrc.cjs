module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  extends: [
    'airbnb-base',
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  // Configuration for JavaScript files
  rules: {
    'jest/no-mocks-import': 'off',
    'prettier/prettier': [
      'error',
      {
        singleQuote: true,
        endOfLine: 'auto',
        printWidth: 140,
      },
    ],
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['react', '@typescript-eslint', '@typescript-eslint', 'unused-imports', 'simple-import-sort'],
  overrides: [
    // Configuration for TypeScript files
    {
      files: ['src/**/*.ts', 'src/**/*.tsx'],
      plugins: ['@typescript-eslint', 'unused-imports', 'simple-import-sort'],
      extends: ['airbnb-typescript/base', 'plugin:prettier/recommended'],
      parserOptions: {
        project: './tsconfig.json',
      },
      rules: {
        'prettier/prettier': [
          'error',
          {
            singleQuote: true,
            endOfLine: 'auto',
            printWidth: 140,
          },
        ],
        'import/extensions': [
          'error',
          'ignorePackages',
          {
            js: 'never',
            jsx: 'never',
            ts: 'never',
            tsx: 'never',
            '': 'never',
          },
        ], // Avoid missing file extension errors when using '@/' alias
        '@typescript-eslint/comma-dangle': 'off', // Avoid conflict rule between Eslint and Prettier
        '@typescript-eslint/consistent-type-imports': 'error', // Ensure `import type` is used when it's necessary
        'import/prefer-default-export': 'off', // Named export is easier to refactor automatically
        'simple-import-sort/imports': 'error', // Import configuration for `eslint-plugin-simple-import-sort`
        'simple-import-sort/exports': 'error', // Export configuration for `eslint-plugin-simple-import-sort`
        '@typescript-eslint/no-unused-vars': 'off',
        'unused-imports/no-unused-imports': 'error',
        'unused-imports/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
        '@typescript-eslint/explicit-module-boundary-types': 'off',
      },
    },
    // Configuration for testing
    {
      files: ['src/**/*.test.ts'],
      plugins: ['jest', 'jest-formatting'],
      extends: ['plugin:jest/recommended', 'plugin:jest-formatting/recommended'],
      rules: {
        'jest/no-mocks-import': 'off',
      },
    },
  ],
};
