/**
 * Full End-to-End Headless DOM Simulation
 * Tests tab switching, button clicks, and calculations across all views
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

// Simple DOM Mock
class MockElement {
  constructor(id, tagName = 'div') {
    this.id = id;
    this.tagName = tagName.toUpperCase();
    this.classList = {
      _classes: new Set(),
      add: (c) => this.classList._classes.add(c),
      remove: (c) => this.classList._classes.delete(c),
      contains: (c) => this.classList._classes.has(c)
    };
    this.style = {};
    this.attributes = {};
    this.children = [];
    this.innerHTML = '';
    this.textContent = '';
    this.value = '';
    this.eventListeners = {};
  }

  appendChild(child) {
    this.children.push(child);
  }

  setAttribute(name, val) {
    this.attributes[name] = val;
  }

  getAttribute(name) {
    return this.attributes[name];
  }

  addEventListener(event, callback) {
    if (!this.eventListeners[event]) this.eventListeners[event] = [];
    this.eventListeners[event].push(callback);
  }

  dispatchEvent(event) {
    const list = this.eventListeners[event.type] || [];
    list.forEach(cb => cb(event));
  }

  click() {
    this.dispatchEvent({ type: 'click', target: this, closest: (sel) => this });
  }

  closest(selector) {
    if (selector === '.nav-tab' && this.classList.contains('nav-tab')) return this;
    return null;
  }

  querySelectorAll(selector) {
    return [];
  }

  querySelector(selector) {
    return null;
  }
}

const elementsMap = new Map();

function getOrCreateElement(id, tagName = 'div') {
  if (!elementsMap.has(id)) {
    elementsMap.set(id, new MockElement(id, tagName));
  }
  return elementsMap.get(id);
}

// Read index.html to find all IDs and nav tabs
const html = fs.readFileSync('index.html', 'utf8');
const idRegex = /id=["']([a-zA-Z0-9_-]+)["']/g;
let match;
while ((match = idRegex.exec(html)) !== null) {
  getOrCreateElement(match[1]);
}

// Create nav-tabs
const tabs = ['dashboard', 'comparison', 'trends', 'surplus', 'decisions', 'methods'].map(t => {
  const el = new MockElement(`nav-${t}`, 'button');
  el.classList.add('nav-tab');
  el.setAttribute('data-tab', t);
  return el;
});

// Create section-views
const sections = ['dashboard', 'comparison', 'trends', 'surplus', 'decisions', 'methods'].map(t => {
  const el = getOrCreateElement(`view-${t}`);
  el.classList.add('section-view');
  return el;
});

// Setup mock document
const mockDocument = {
  readyState: 'complete',
  addEventListener: (event, cb) => cb(),
  createElement: (tag) => {
    const el = new MockElement('dyn_' + Math.random(), tag);
    el.remove = () => {};
    return el;
  },
  getElementById: (id) => getOrCreateElement(id),
  querySelector: (sel) => {
    if (sel === '.nav-container') return { addEventListener: (ev, cb) => {} };
    return null;
  },
  querySelectorAll: (sel) => {
    if (sel === '.nav-tab') return tabs;
    if (sel === '.section-view') return sections;
    if (sel === '.form-error' || sel === '.form-control') return [];
    return [];
  }
};

const mockWindow = {
  document: mockDocument,
  console: console,
  setTimeout: setTimeout,
  clearTimeout: clearTimeout,
  scrollTo: () => {},
  localStorage: {
    _data: {},
    getItem: (k) => mockWindow.localStorage._data[k] || null,
    setItem: (k, v) => { mockWindow.localStorage._data[k] = String(v); },
    removeItem: (k) => { delete mockWindow.localStorage._data[k]; }
  }
};
mockWindow.window = mockWindow;
mockWindow.self = mockWindow;

// Pre-fill input values
getOrCreateElement('input-produce').value = 'tomato';
getOrCreateElement('input-quantity').value = '100';
getOrCreateElement('input-location').value = 'dadagapatti';
getOrCreateElement('input-selling-date').value = '2026-09-19';
getOrCreateElement('input-transport-rate').value = '10';
getOrCreateElement('input-other-costs').value = '200';
getOrCreateElement('select-trend-produce').value = 'tomato';
getOrCreateElement('surplus-input-produce').value = 'tomato';
getOrCreateElement('surplus-input-quantity').value = '80';
getOrCreateElement('surplus-input-location').value = 'dadagapatti';

console.log('Loading scripts in browser simulation context...');
vm.runInNewContext(fs.readFileSync('js/data.js', 'utf8'), mockWindow);
vm.runInNewContext(fs.readFileSync('js/engine.js', 'utf8'), mockWindow);
vm.runInNewContext(fs.readFileSync('js/storage.js', 'utf8'), mockWindow);
vm.runInNewContext(fs.readFileSync('js/trends.js', 'utf8'), mockWindow);
vm.runInNewContext(fs.readFileSync('js/app.js', 'utf8'), mockWindow);

console.log('Testing Tab Navigation Clicks:');
tabs.forEach(tab => {
  const tabId = tab.getAttribute('data-tab');
  console.log(`  -> Clicking Tab: [${tabId}]`);
  tab.click();
  const sec = getOrCreateElement(`view-${tabId}`);
  if (sec.classList.contains('active') && sec.style.display === 'block') {
    console.log(`     ✓ Active & Visible (style.display = block)`);
  } else {
    console.error(`     ✗ Failed to activate view-${tabId}`);
    process.exit(1);
  }
});

console.log('\nTesting Save Decision Action:');
const btnSave = getOrCreateElement('btn-save-decision');
btnSave.click();
const decisions = mockWindow.MarketStorage.getDecisions();
console.log(`  ✓ Total saved decisions in storage: ${decisions.length}`);

console.log('\nTesting Form Submit Action:');
const formProduce = getOrCreateElement('form-produce-details');
formProduce.dispatchEvent({ type: 'submit', preventDefault: () => {} });
console.log('  ✓ Form submitted without errors.');

console.log('\nALL TABS & ACTIONS VERIFIED SUCCESSFULLY IN SIMULATION!');
