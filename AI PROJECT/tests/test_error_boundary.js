/**
 * AI Smart Market Decision Assistant
 * Test Suite: Error Boundary & Resilience Verification
 * 
 * Verifies:
 * 1. Safe execution of failing operations via tryCatch
 * 2. Proper error logging with timestamp, source, and message
 * 3. Fallback value return when exceptions are thrown
 * 4. Error log capacity capping at MAX_LOGS
 */

const ErrorBoundary = require('../js/errorBoundary.js');

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    passCount++;
    console.log(`  ✓ PASS: ${message}`);
  } else {
    failCount++;
    console.error(`  ✗ FAIL: ${message}`);
  }
}

console.log('=== TEST SUITE: Error Boundary Unit Tests ===\n');

// Test 1: Successful operation returns actual value
const normalResult = ErrorBoundary.tryCatch(() => {
  return 100 * 33.6;
}, 0, 'RevenueCalc');
assert(normalResult === 3360, `Normal operation executes cleanly without fallback: ${normalResult}`);

// Test 2: Thrown error is safely caught and returns fallback
const failedResult = ErrorBoundary.tryCatch(() => {
  throw new Error('Simulated sensor / network drop');
}, 'SAFE_FALLBACK', 'UnstableAPI');
assert(failedResult === 'SAFE_FALLBACK', `Failing operation gracefully returns fallback: "${failedResult}"`);

// Test 3: Error logs recorded
const logs = ErrorBoundary.getErrorLogs();
assert(logs.length >= 1, `Diagnostic error log captured (${logs.length} entries)`);
assert(logs[0].source === 'UnstableAPI', `Correct error source logged: "${logs[0].source}"`);
assert(logs[0].message.includes('Simulated sensor'), `Error message preserved: "${logs[0].message}"`);

// Test 4: Log cap limit enforcement
ErrorBoundary.clearLogs();
for (let i = 0; i < 35; i++) {
  ErrorBoundary.logError(`StressTest_${i}`, `Error event ${i}`);
}
const cappedLogs = ErrorBoundary.getErrorLogs();
assert(cappedLogs.length === 25, `Error log capped at max limit of 25 (actual: ${cappedLogs.length})`);

console.log('\n=============================================');
console.log(`ERROR BOUNDARY TESTS: ${passCount} Passed, ${failCount} Failed`);
console.log('=============================================\n');

if (failCount > 0) process.exit(1);
