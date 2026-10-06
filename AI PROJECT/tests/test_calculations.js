/**
 * AI Smart Market Decision Assistant
 * Automated Verification Script
 * 
 * Verifies:
 * 1. Selling Revenue = Quantity * Market Price
 * 2. Transport Cost = Distance * Transport Cost per km
 * 3. Wastage Quantity = Quantity * Wastage %
 * 4. Wastage Loss = Wastage Quantity * Market Price
 * 5. Estimated Net Return = Selling Revenue - Transport Cost - Other Costs - Wastage Loss
 * 6. Edge cases: Zero quantity, negative numbers, missing fields, empty strings
 * 7. Market sorting behaviors (by price, transport, net return, distance)
 * 8. Surplus buyer matching bounds and calculation consistency
 * 9. Zero NaN, zero undefined in output structures
 */

const { DEMO_DATA } = require('../js/data.js');
const MarketEngine = require('../js/engine.js');

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

console.log('=== TEST 1: Math Formulas Verification ===');
// Test case: 100 kg Tomato, Dadagapatti sandhai, ₹10/km, ₹200 other costs
const dadagapattiMkt = DEMO_DATA.markets.find(m => m.id === 'mkt_dadagapatti');
const fin = MarketEngine.calculateMarketFinancials('tomato', 100, 'dadagapatti', 10, 200, dadagapattiMkt);

// Check Tomato baseline price: 32 * 1.05 = 33.60
assert(fin.marketPricePerKg === 33.6, `Market price correctly computed: ₹${fin.marketPricePerKg} (expected 33.6)`);
// Selling Revenue: 100 * 33.6 = 3360.00
assert(fin.sellingRevenue === 3360, `Selling revenue = Qty * Price: ₹${fin.sellingRevenue} (expected 3360)`);
// Distance: 2.1 km -> Transport cost = 2.1 * 10 = 21.00
assert(fin.transportCost === 21, `Transport cost = Distance * Rate: ₹${fin.transportCost} (expected 21)`);
// Wastage %: 2.0% * 1.0 * distance scale = 2.0%
assert(fin.effectiveWastagePct === 2.0, `Wastage percentage = ${fin.effectiveWastagePct}% (expected 2.0%)`);
// Wastage Qty: 100 * 2.0% = 2.0 kg
assert(fin.wastageQuantityKg === 2.0, `Wastage quantity = ${fin.wastageQuantityKg} kg (expected 2.0)`);
// Wastage Loss: 2.0 * 33.6 = 67.20
assert(fin.wastageLoss === 67.2, `Wastage loss = Wastage Qty * Price: ₹${fin.wastageLoss} (expected 67.2)`);
// Estimated Net Return = 3360 - 21 - 200 - 0 - 67.2 = 3071.80
const expectedNetReturn = Math.round((3360 - 21 - 200 - 0 - 67.2) * 100) / 100;
assert(fin.estimatedNetReturn === expectedNetReturn, `Net Return = Revenue - Transport - Other - Wastage: ₹${fin.estimatedNetReturn} (expected ${expectedNetReturn})`);

console.log('\n=== TEST 2: Dynamic Input Change Recalculation ===');
// Double quantity from 100 to 200 kg and increase other costs to 350
const fin2 = MarketEngine.calculateMarketFinancials('tomato', 200, 'dadagapatti', 10, 350, dadagapattiMkt);
assert(fin2.sellingRevenue === 6720, `Updated quantity doubles revenue: ₹${fin2.sellingRevenue}`);
assert(fin2.wastageQuantityKg === 4.0, `Wastage quantity scales: ${fin2.wastageQuantityKg} kg`);
assert(fin2.estimatedNetReturn !== fin.estimatedNetReturn, `Net return updates when inputs change: ₹${fin2.estimatedNetReturn} vs ₹${fin.estimatedNetReturn}`);

console.log('\n=== TEST 3: Validation & Error Handling ===');
// Empty inputs
const v1 = MarketEngine.validateProduceInputs({});
assert(!v1.isValid, 'Empty input fails validation');
assert(v1.errors.produceId !== undefined, 'produceId error reported');
assert(v1.errors.quantity !== undefined, 'quantity error reported');

// Zero quantity
const v2 = MarketEngine.validateProduceInputs({ produceId: 'tomato', quantity: 0, location: 'dadagapatti', sellingDate: '2026-09-19', transportCostPerKm: 10, otherCosts: 100 });
assert(!v2.isValid, 'Zero quantity fails validation');
assert(v2.errors.quantity.includes('greater than 0'), `Appropriate zero qty message: "${v2.errors.quantity}"`);

// Negative quantity
const v3 = MarketEngine.validateProduceInputs({ produceId: 'tomato', quantity: -50, location: 'dadagapatti', sellingDate: '2026-09-19', transportCostPerKm: 10, otherCosts: 100 });
assert(!v3.isValid, 'Negative quantity fails validation');

// Negative transport cost
const v4 = MarketEngine.validateProduceInputs({ produceId: 'tomato', quantity: 100, location: 'dadagapatti', sellingDate: '2026-09-19', transportCostPerKm: -5, otherCosts: 100 });
assert(!v4.isValid, 'Negative transport cost fails validation');

// Valid inputs
const v5 = MarketEngine.validateProduceInputs({ produceId: 'tomato', quantity: 100, location: 'dadagapatti', sellingDate: '2026-09-19', transportCostPerKm: 10, otherCosts: 200 });
assert(v5.isValid, 'Valid inputs pass validation');

console.log('\n=== TEST 4: Market Recommendation & Multi-Market Analysis ===');
const analysis = MarketEngine.analyzeSellingOptions({
  produceId: 'tomato',
  quantity: 100,
  location: 'dadagapatti',
  sellingDate: '2026-09-19',
  transportCostPerKm: 10,
  otherCosts: 200
});

assert(analysis.success === true, 'Analysis runs successfully');
assert(analysis.markets.length === DEMO_DATA.markets.length, `Evaluated all ${DEMO_DATA.markets.length} markets`);
assert(analysis.recommendation !== null, 'Recommendation generated');
assert(analysis.recommendation.market.marketName !== undefined, `Recommended market identified: ${analysis.recommendation.market.marketName}`);
assert(analysis.recommendation.whyReasons.length >= 4, `At least 4 "Why this option" reasons provided (${analysis.recommendation.whyReasons.length})`);
assert(analysis.recommendation.disclaimerNotice.includes('Estimate'), 'Includes realistic non-guaranteed disclaimer');

// Ensure no NaN anywhere in results
let hasNaN = false;
analysis.markets.forEach(m => {
  ['sellingRevenue', 'transportCost', 'wastageQuantityKg', 'wastageLoss', 'estimatedNetReturn', 'netReturnPerKg'].forEach(k => {
    if (isNaN(m[k]) || m[k] === null || m[k] === undefined) {
      hasNaN = true;
      console.error(`NaN or undefined found in ${m.marketName} field ${k}`);
    }
  });
});
assert(!hasNaN, 'Zero NaN or undefined across all market financials');

console.log('\n=== TEST 5: Market Sorting ===');
const sortedByNetReturn = MarketEngine.sortMarkets(analysis.markets, 'netReturn', 'desc');
assert(sortedByNetReturn[0].estimatedNetReturn >= sortedByNetReturn[1].estimatedNetReturn, 'Sorting by Net Return (desc) works');

const sortedByTransport = MarketEngine.sortMarkets(analysis.markets, 'transport', 'asc');
assert(sortedByTransport[0].transportCost <= sortedByTransport[1].transportCost, 'Sorting by Transport Cost (asc) works');

const sortedByPrice = MarketEngine.sortMarkets(analysis.markets, 'price', 'desc');
assert(sortedByPrice[0].marketPricePerKg >= sortedByPrice[1].marketPricePerKg, 'Sorting by Price (desc) works');

const sortedByDist = MarketEngine.sortMarkets(analysis.markets, 'distance', 'asc');
assert(sortedByDist[0].distanceKm <= sortedByDist[1].distanceKm, 'Sorting by Distance (asc) works');

console.log('\n=== TEST 6: Surplus Buyer Matching ===');
const buyerMatches = MarketEngine.matchSurplusBuyers('tomato', 80, 'dadagapatti');
assert(buyerMatches.length > 0, `Found ${buyerMatches.length} matching surplus buyers for 80kg tomato`);
assert(buyerMatches[0].matchPercentage >= 50 && buyerMatches[0].matchPercentage <= 100, `Top buyer match percentage in range: ${buyerMatches[0].matchPercentage}%`);
assert(buyerMatches[0].totalEstimatedValue > 0, `Buyer procurement value calculated: ₹${buyerMatches[0].totalEstimatedValue}`);

// Check zero quantity handling
const zeroBuyers = MarketEngine.matchSurplusBuyers('tomato', 0, 'dadagapatti');
assert(zeroBuyers.length === 0, 'Zero quantity produces safe empty buyer list');

console.log('\n=============================================');
console.log(`TOTAL PASSES: ${passCount}`);
console.log(`TOTAL FAILURES: ${failCount}`);
console.log('=============================================');

if (failCount > 0) {
  process.exit(1);
} else {
  console.log('ALL VERIFICATION TESTS PASSED SUCCESSFULLY!\n');
}
