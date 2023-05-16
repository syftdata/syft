/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  globalSetup: './tests/jest-setup.js',
  testMatch: ['**/tests/**/*.test.[jt]s?(x)']
};
