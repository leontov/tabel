module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true
  },
  extends: ['eslint:recommended', 'plugin:react-hooks/recommended', 'prettier'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  plugins: ['@typescript-eslint'],
  rules: {
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }]
  },
  ignorePatterns: ['dist', 'node_modules']
};
