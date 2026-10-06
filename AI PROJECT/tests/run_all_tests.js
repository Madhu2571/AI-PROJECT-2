/**
 * Master Test Runner for AI Smart Market Decision Assistant
 * Semester 3 - C29 Project Review 2
 * Executes all unit and integration test suites sequentially.
 */

const { execSync } = require('child_process');
const path = require('path');

const testSuites = [
  'test_calculations.js',
  'test_error_boundary.js',
  'test_schema_integrity.js',
  'test_browser_scope.js',
  'test_dom_elements.js',
  'test_trends_dom.js',
  'test_e2e_tabs.js'
];

console.log('===============================================================');
console.log('   AI SMART MARKET DECISION ASSISTANT - MASTER TEST SUITE      ');
console.log('   Review 2 Verification - Salem Uzhavar Sandhai Field Study   ');
console.log('===============================================================\n');

let totalPassed = 0;
let totalFailed = 0;

testSuites.forEach((suite, index) => {
  const suitePath = path.join(__dirname, suite);
  process.stdout.write(`[${index + 1}/${testSuites.length}] Running ${suite.padEnd(26)} ... `);
  try {
    const output = execSync(`node "${suitePath}"`, { encoding: 'utf-8' });
    console.log('PASS');
    totalPassed++;
  } catch (err) {
    console.log('FAIL');
    console.error(err.stdout || err.message);
    totalFailed++;
  }
});

console.log('\n---------------------------------------------------------------');
console.log(`Summary: ${totalPassed} suites passed, ${totalFailed} suites failed.`);
console.log('===============================================================');

if (totalFailed > 0) {
  process.exit(1);
} else {
  console.log('ALL VERIFICATION CRITERIA SATISFIED (100% PASS RATE).');
  process.exit(0);
}
