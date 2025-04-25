// jest.config.mjs
import nextJest from 'next/jest.js'; // Ensure .js extension
import path from 'path'; // 导入 path 以便解析路径 (如果需要更复杂的路径处理)

const createJestConfig = nextJest({
  dir: './',
});

/** @type {import('jest').Config} */
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'], // Ensure points to .ts
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    // ----- Ensure this mapping is correct -----
    '^~/(.*)$': '<rootDir>/src/$1', // Maps ~ to the src directory
    // ------------------------------------------
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
  transformIgnorePatterns: [
      '/node_modules/',
      '^.+\\.module\\.(css|sass|scss)$',
  ],
  // Coverage Configuration
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageProvider: "v8", // or "babel"

  collectCoverageFrom: [
      "src/**/*.tsx", // Base target: Include all ts/tsx files in src

      // --- Standard Exclusions (Usually Keep These) ---
      "!src/**/*.test.ts,tsx}",            // Exclude test files
      "!src/**/*.spec.{ts,tsx}",            // Exclude spec files
      "!src/**/__tests__/**",              // Exclude test directories
      "!src/app/api/**",                   // Exclude API routes
      "!src/pages/api/**",                 // Exclude old API routes (if any)
      "!**/*.d.ts",                        // Exclude type definition files
      "!**/node_modules/**",             // Exclude node_modules
      "!<rootDir>/src/app/layout.tsx",      // Exclude root layout
      "!<rootDir>/src/app/page.tsx",        // Exclude root page
      "!<rootDir>/jest.setup.ts",         // Exclude test setup file
      "!<rootDir>/jest.config.mjs",       // Exclude jest config file
      "!<rootDir>/src/app/employee/documents/types/**", // Keep excluding types

      // --- Kept Exclusions (For non-component/untested areas) ---
      "!<rootDir>/src/middleware.ts",
      "!<rootDir>/src/app/about/**",
      "!<rootDir>/src/app/contact/**",
      "!<rootDir>/src/app/scripts/**",
      "!<rootDir>/src/app/authentication/**",
      "!<rootDir>/src/app/unavailable/**",
      "!<rootDir>/src/app/utils/**",      // Exclude utils unless testing them
      "!<rootDir>/src/server/**",
  ],

  // ----- 添加自定义报告器配置 -----
  reporters: [
    // 1. 保留 Jest 默认的控制台输出报告器
    'default',
    // 2. 添加你的自定义失败测试报告器
    [
      // **重要:** 将这里的路径修改为你的 failed-tests-reporter.js 文件的实际路径
      './failed-tests-reporter.js',
      // 这里是传递给你报告器构造函数的选项对象
      {
        // 指定失败测试日志文件的输出路径和名称
        outputFile: 'logs/jest-failed-tests.log'
      }
    ]
  ],
  // --------------------------------

  // Optional: Set coverage thresholds
  // coverageThreshold: { /* ... */ },
  // Optional: Specify coverage reporters explicitly if needed (often inferred)
  // coverageReporters: ["html", "text", "lcov"], // reporters 选项和 coverageReporters 不同
};

export default createJestConfig(customJestConfig);