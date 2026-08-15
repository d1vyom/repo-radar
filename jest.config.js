/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1', // Or '<rootDir>/$1' if you don't use src/
    'server-only': '<rootDir>/__mocks__/server-only.js',
  },
};
