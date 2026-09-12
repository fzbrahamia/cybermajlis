/** @type {import('jest').Config} */
const config = {
  testEnvironment: "jsdom",

  // jest.setup.ts existed but was never referenced here, so its polyfills did
  // nothing and every suite hand-imported @testing-library/jest-dom instead.
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],

  transform: {
    "^.+\\.(ts|tsx)$": ["ts-jest", { tsconfig: { jsx: "react-jsx" } }],
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    "\\.(png|jpg|gif|svg|webp)$": "<rootDir>/__mocks__/fileMock.js",
  },
  testPathIgnorePatterns: ["<rootDir>/node_modules/", "<rootDir>/.next/"],
  testMatch: ["**/__tests__/**/*.test.(ts|tsx)"],
};

module.exports = config;
