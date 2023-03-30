module.exports = {
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  root: true,
  ignorePatterns: ['syft/lint/rules'],
  rules: {
    required_syft_fields: 2,
    required_tsdoc: 1
  }
};
