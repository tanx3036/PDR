// jest.config.api.mjs (Corrected export)

/** @type {import('jest').Config} */
const config = {
    preset: 'ts-jest',
    testEnvironment: 'node', // Use 'node' for API tests
    testMatch: [
      '<rootDir>/src/app/api/**/*.spec.(ts|js)', // Pattern for API tests
    ],
    // setupFilesAfterEnv: ['<rootDir>/jest.api.setup.ts'], // Optional setup file
    moduleNameMapper: {
        '^~/(.*)$': '<rootDir>/src/$1',
    },
    transformIgnorePatterns: ['/node_modules/'],
    collectCoverage: true,
    collectCoverageFrom: [
        'src/app/api/**/*.{ts,js}',
    ],
    reporters: [
        'default',
        [
            './failed-tests-reporter.js',
            {
                outputFile: '<rootDir>/failed-tests-api.log', // Output file for failed tests
            },
        ],
    ],
  };
  
  // Use 'export default' because the file extension is .mjs
  export default config;