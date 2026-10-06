/**
 * AI Smart Market Decision Assistant
 * Test Suite: Data & Storage Schema Integrity
 * 
 * Verifies:
 * 1. Market entities have all mandatory fields (id, name, type, distance, adjustments, wastage, demand, risk)
 * 2. Produce entities have pricing, category, and perishability factors
 * 3. Saved Decision schema structure compliance
 * 4. Post-sale Feedback schema structure compliance
 * 5. B2B Buyer profiles entity integrity
 */

const { DEMO_DATA } = require('../js/data.js');
const MarketStorage = require('../js/storage.js');

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

console.log('=== TEST SUITE: Data & Storage Schema Integrity ===\n');

// Test 1: Market Schema Completeness
assert(Array.isArray(DEMO_DATA.markets) && DEMO_DATA.markets.length >= 5, `Markets list has at least 5 markets (${DEMO_DATA.markets.length} found)`);

const marketFields = ['id', 'name', 'tamilName', 'type', 'distanceKmFromDadagapatti', 'basePriceAdjustments', 'baseWastagePct', 'demandLevel', 'climateRisk'];
DEMO_DATA.markets.forEach(m => {
  const missing = marketFields.filter(f => m[f] === undefined);
  assert(missing.length === 0, `Market "${m.id}" contains all required schema fields (missing: ${missing.join(', ') || 'none'})`);
});

// Test 2: Produce Schema Completeness
assert(Array.isArray(DEMO_DATA.produceTypes) && DEMO_DATA.produceTypes.length >= 5, `Produce types catalog has at least 5 items (${DEMO_DATA.produceTypes.length} found)`);

const produceFields = ['id', 'name', 'category', 'defaultPrice', 'perishability', 'baseWastageFactor'];
DEMO_DATA.produceTypes.forEach(p => {
  const missing = produceFields.filter(f => p[f] === undefined);
  assert(missing.length === 0, `Produce "${p.id}" satisfies schema contract (missing: ${missing.join(', ') || 'none'})`);
});

// Test 3: Storage Saved Decisions Schema
const decisions = MarketStorage.getDecisions();
assert(Array.isArray(decisions) && decisions.length > 0, `Storage contains initial decisions (${decisions.length} records)`);

const decisionFields = ['id', 'date', 'produceId', 'produceName', 'quantity', 'location', 'recommendedMarketId', 'recommendedMarketName', 'expectedPricePerKg', 'expectedRevenue', 'transportCost', 'otherCosts', 'wastageLoss', 'expectedNetReturn', 'status'];
decisions.forEach(d => {
  const missing = decisionFields.filter(f => d[f] === undefined);
  assert(missing.length === 0, `Saved decision "${d.id}" has valid schema (missing: ${missing.join(', ') || 'none'})`);
});

// Test 4: Storage Feedback Schema
const feedbackList = MarketStorage.getFeedbackList();
assert(Array.isArray(feedbackList) && feedbackList.length > 0, `Storage contains post-sale feedback records (${feedbackList.length} records)`);

const feedbackFields = ['id', 'date', 'produceName', 'marketName', 'actualPricePerKg', 'actualQtySold', 'actualWastageKg', 'actualOtherCosts', 'actualNetReturn', 'estimatedNetReturn', 'variance'];
feedbackList.forEach(fb => {
  const missing = feedbackFields.filter(f => fb[f] === undefined);
  assert(missing.length === 0, `Feedback entry "${fb.id}" has valid schema (missing: ${missing.join(', ') || 'none'})`);
});

// Test 5: Surplus Buyers Schema
assert(Array.isArray(DEMO_DATA.surplusBuyers) && DEMO_DATA.surplusBuyers.length >= 5, `Buyer catalog has at least 5 buyers (${DEMO_DATA.surplusBuyers.length} found)`);
const buyerFields = ['id', 'businessName', 'category', 'contactPerson', 'location', 'acceptedProduce', 'preferredDailyQty', 'paymentTerms'];
DEMO_DATA.surplusBuyers.forEach(b => {
  const missing = buyerFields.filter(f => b[f] === undefined);
  assert(missing.length === 0, `Buyer "${b.id}" meets entity contract (missing: ${missing.join(', ') || 'none'})`);
});

console.log('\n=============================================');
console.log(`SCHEMA INTEGRITY TESTS: ${passCount} Passed, ${failCount} Failed`);
console.log('=============================================\n');

if (failCount > 0) process.exit(1);
