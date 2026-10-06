const fs = require('fs');
const vm = require('vm');

const context = {
  console: console,
  setTimeout: setTimeout,
  clearTimeout: clearTimeout,
  document: {
    readyState: 'complete',
    addEventListener: (ev, cb) => cb(),
    querySelectorAll: () => [],
    getElementById: (id) => null
  }
};
context.window = context;
context.self = context;

const dataCode = fs.readFileSync('js/data.js', 'utf8');
vm.runInNewContext(dataCode, context);

console.log('After data.js, context.DEMO_DATA is:', typeof context.DEMO_DATA);

const engineCode = fs.readFileSync('js/engine.js', 'utf8');
vm.runInNewContext(engineCode, context);
console.log('After engine.js, context.MarketEngine is:', typeof context.MarketEngine);

const trendsCode = fs.readFileSync('js/trends.js', 'utf8');
vm.runInNewContext(trendsCode, context);
console.log('After trends.js, context.PriceTrendsChart is:', typeof context.PriceTrendsChart);
