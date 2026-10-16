/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  transform: {
    '^.+\\.[tj]sx?$': ['ts-jest', { tsconfig: { allowJs: true, module: 'CommonJS', jsx: 'react-jsx' } }],
  },
  transformIgnorePatterns: ['node_modules/(?!.*(?:sanitize-html|htmlparser2|domelementtype|domhandler|domutils|dom-serializer|entities)/)'],
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1', // Or '<rootDir>/$1' if you don't use src/
    'server-only': '<rootDir>/__mocks__/server-only.js',
  },
};
