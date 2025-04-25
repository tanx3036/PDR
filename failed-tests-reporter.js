// failed-tests-reporter.mjs (Save with .mjs extension)
import fs from 'fs';
import path from 'path';

class FailedTestsReporter {
  constructor(globalConfig, options) {
    this._globalConfig = globalConfig;
    this._options = options;
    // Determine output file path, using options first, then default
    this._outputFile = path.resolve(options.outputFile || 'failed-tests.log');
    console.log(`FailedTestsReporter: Writing failed test info to ${this._outputFile}`);
  }

  // Jest requires reporters to implement getLastError
  getLastError() {
    // If an error occurs within the reporter, return it here
    return undefined;
  }

  // This method is called after all test runs are complete
  onRunComplete(contexts, results) {
    const failedTests = [];
    // process.cwd() is available in ESM
    const relativePathBase = process.cwd() + path.sep;

    // results.testResults contains results for each test file
    results.testResults.forEach(testSuiteResult => {
      // testSuiteResult.testResults contains results for each test case (it/test)
      testSuiteResult.testResults.forEach(testResult => {
        if (testResult.status === 'failed') {
          failedTests.push({
            // Path to the test file (make relative)
            filePath: testSuiteResult.testFilePath.replace(relativePathBase, ''),
            // Full description name (including describe blocks)
            fullName: testResult.fullName,
            // Title of the test case
            title: testResult.title,
            // Failure messages/error stack traces
            failureMessages: testResult.failureMessages,
            // Test duration
            duration: testResult.duration,
          });
        }
      });
    });

    // If there were failed tests, write the info to the file
    if (failedTests.length > 0) {
      console.log(`\nFound ${failedTests.length} failed tests. Writing to log file...`);
      let output = `Test Run At: ${new Date().toISOString()}\n`;
      output += `Total Failed Tests: ${failedTests.length}\n\n`;
      output += "=".repeat(50) + "\n\n";

      failedTests.forEach((test, index) => {
        output += `Failure #${index + 1}:\n`;
        output += `  File: ${test.filePath}\n`;
        output += `  Name: ${test.fullName}\n`;
        // Clean up error messages (remove ANSI color codes if present)
        const cleanMessages = test.failureMessages.map(msg =>
            msg.replace(
              // eslint-disable-next-line no-control-regex
              /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
              ''
            )
        ).join('\n');
        output += `  Error:\n${cleanMessages}\n`;
        output += `  Duration: ${test.duration ? (test.duration / 1000).toFixed(2) + 's' : 'N/A'}\n`;
        output += "-".repeat(50) + "\n\n";
      });

      try {
        // Ensure the output directory exists
        const outputDir = path.dirname(this._outputFile);
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }
        // Write the formatted failure info to the file
        fs.writeFileSync(this._outputFile, output);
        console.log(`Failed test info successfully written to: ${this._outputFile}`);
      } catch (error) {
        console.error(`Error writing failed tests log file (${this._outputFile}):`, error);
      }
    } else {
      console.log('\nAll tests passed. No failure log generated.');
      // Optionally: Delete old log file if tests pass now
      // if (fs.existsSync(this._outputFile)) {
      //   fs.unlinkSync(this._outputFile);
      // }
    }
  }

  // You can implement other methods like onRunStart, onTestStart, onTestResult if needed
  // onTestResult(test, testResult, aggregatedResult) {
  //   // Called after each test file completes
  // }
}

// Use export default instead of module.exports for ESM
export default FailedTestsReporter;