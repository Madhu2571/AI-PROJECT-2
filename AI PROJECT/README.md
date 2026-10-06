# AI Smart Market Decision Assistant

> **Semester 3 – Project Better Tomorrow (C29) | Review 2 Continuation Track**  
> Based on a field immersion study of vegetable vendors at **Salem Uzhavar Sandhai, Dadagapatti (Tamil Nadu)**.  
> **Repository**: [https://github.com/Madhu2571/AI-Immersion-Project/tree/main/AI%20PROJECT](https://github.com/Madhu2571/AI-Immersion-Project/tree/main/AI%20PROJECT)  
> **Previous Review 1 Score**: 32.2 / 35 (92%)

---

## 🌾 1. Project Overview & Problem Statement

Smallholder vegetable vendors operating in the Salem agricultural belt face high-stakes market allocation decisions every morning between **04:00 AM and 11:30 AM**:
1. **Direct Consumer Sandhai vs. Wholesale Mandi Trade-Off**:
   - *Salem Uzhavar Sandhai (Dadagapatti)*: Direct farmer-to-consumer pricing, 0% middleman commission, zero stall cess, but restricted morning-only retail volume.
   - *Shevapet Wholesale Mandi (Leigh Bazaar)*: Immediate bulk absorption, but lower wholesale prices (-15%), commission agent margins, and trader handling deductions.
   - *Regional Mandis (Attur, Omalur)*: Variable volume capacity, but longer transit distances incurring high fuel costs and perishable transit spoilage.
2. **Transit Logistics & Heat Spoilage**: Transporting delicate produce (like tomatoes and leafy crops) in high ambient heat causes significant dehydration and bruising (up to 7.2% transit loss on highway routes to Attur).
3. **Surplus Distress Dumping**: Leftover afternoon inventory faces distress price collapses unless rapidly matched with local B2B institutional buyers (hotels, messes, supermarkets).

**The Solution**: The **AI Smart Market Decision Assistant** provides transparent, multi-criteria decision-support to help vendors estimate net returns, evaluate transit risks, forecast short-term prices, and match surplus lots with nearby commercial offtakers.

> [!IMPORTANT]
> **Human-in-the-Loop Principle**: The system provides transparent decision-support recommendations, but the **vendor ALWAYS makes the final decision**.

---

## 👥 2. Target Users

- **Primary Persona**: Smallholder vegetable cultivators and daily stall vendors at Salem Uzhavar Sandhai, Dadagapatti.
- **Secondary Persona**: Vegetable farmers in peri-urban Salem (Suramangalam, Ammapet, Omalur, Attur) choosing between wholesale mandis and direct retail.
- **Tertiary Persona**: Local institutional bulk buyers (restaurants, caterers, hospital messes, supermarket fresh counters) seeking direct-from-farm produce.

---

## 🚀 3. Key Features

1. **Selling Decision Assistant (Dashboard)**:
   - Dynamic produce form (Produce, Quantity, Starting Location, Dispatch Date, Transport Cost/km, Other Costs).
   - Real-time mathematical net-return calculation.
   - Multi-criteria market recommendation with transparent *"Why this option?"* rationale.
   - **Review 2 Enhancement**: Live Sensitivity & Volume Simulator (interactive sliders testing price/volume variations and break-even thresholds).
   - **Review 2 Enhancement**: Printable / Exportable Sandhai Decision Slip (thermal-receipt style manifest with pre-trip checklist).
   - **Review 2 Enhancement**: Bilingual English / தமிழ் Quick Toggle.
2. **Regional Market Comparison Matrix**:
   - Evaluates 6 Salem regional markets:
     - *Salem Uzhavar Sandhai (Dadagapatti)* (2.1 km, direct retail, 0% cess, 2.0% wastage)
     - *Salem Uzhavar Sandhai (Suramangalam)* (8.4 km, railway junction consumer demand, 3.2% wastage)
     - *Salem Uzhavar Sandhai (Hasthampatti)* (6.8 km, premium residential demand, 2.8% wastage)
     - *Shevapet Wholesale Mandi (Leigh Bazaar)* (4.5 km, bulk wholesale auction, commission fee, 4.5% wastage)
     - *Attur Regulated Agricultural Market* (48.0 km, regional hub, 7.2% transit wastage)
     - *Omalur Weekly Sandhai* (17.5 km, periodic sandhai, 4.8% wastage)
   - Dynamic sorting by Net Return, Price, Transport Cost, and Distance.
   - Step-by-step arithmetic breakdown modal for every market.
3. **Price Trends & Short-Term Projections**:
   - Standalone SVG line chart rendering 10-day historical actuals, today's baseline, and 3-day projected trend window.
   - Dynamic produce switcher (Tomato, Small Onion, Potato, Carrot, Brinjal, Cabbage, Green Chilli).
   - Key metrics: Current price, 10-day min/max, trend direction badge, and AI arrival rationales.
4. **Climate & Ambient Risk Insight**:
   - Localized ambient weather indicator (Temperature, Humidity, Rain Probability).
   - Perishable risk assessment highlighting morning stall clearance advantages without making unsupported price guarantees.
5. **Surplus Buyer Matching**:
   - Dynamic similarity scoring algorithm connecting vendors with Salem hotels, messes, and supermarkets (*Sri Saravana Bhavan*, *Hotel Selvam*, *Nilgiris Supermarket*, *Salem Central Canteen Mess*, *Ammapet Daily Greens*, *Gokulam Hospital*).
   - Working "Contact / Request Buyer" modal capturing offered quantity, proposed rate, and delivery notes.
6. **My Decisions & After-Selling Feedback**:
   - Persistent `localStorage` history of saved decisions with View and Delete actions.
   - Post-sale actuals recording (Actual Selling Price, Actual Quantity Sold, Actual Wastage, Actual Costs).
   - Variance analysis table comparing estimated vs. actual net returns ($+\text{₹}$ in green, $-\text{₹}$ in red).
7. **Global Error Boundary & Safeguards (Review 2 Addition)**:
   - Dedicated `js/errorBoundary.js` module trapping uncaught exceptions, rendering safe recovery banners, and capping error logs.

---

## 🧮 4. Mathematical Model & Formulas

For every evaluated market destination $i$:

$$\text{Gross Selling Revenue}_i = \text{Quantity} \times \text{Market Price}_i$$

$$\text{Transport Cost}_i = \text{Distance}_i \times \text{Transport Cost per km}$$

$$\text{Effective Wastage \%}_i = \text{Base Wastage \%}_i \times \text{Perishability Factor} \times \left(1 + \max(0, (\text{Distance}_i - 5) \times 0.02)\right)$$

$$\text{Wastage Quantity}_i = \text{Quantity} \times \left(\frac{\text{Effective Wastage \%}_i}{100}\right)$$

$$\text{Wastage Loss}_i = \text{Wastage Quantity}_i \times \text{Market Price}_i$$

$$\text{Estimated Net Return}_i = \text{Gross Revenue}_i - \text{Transport Cost}_i - \text{Other Costs} - \text{Market Fee}_i - \text{Wastage Loss}_i$$

$$\text{Break-Even Quantity} = \frac{\text{Transport Cost}_i + \text{Other Costs} + \text{Market Fee}_i}{\text{Market Price}_i \times \left(1 - \frac{\text{Effective Wastage \%}_i}{100}\right)}$$

---

## 🏗️ 5. Technical Architecture & Tech Stack

```
+-------------------------------------------------------------------------+
|                              PRESENTATION LAYER                         |
|   index.html | css/styles.css (Light Agricultural Design System)       |
|   Responsive CSS Grid & Flexbox | Thermal Receipt Print Styles           |
+-------------------------------------------------------------------------+
                                    |
+-------------------------------------------------------------------------+
|                           CONTROLLER & RESILIENCE                       |
|   js/app.js (Master Controller, Form Validation, Modals, Tab Router)    |
|   js/errorBoundary.js (Global Error Trapping, UI Safe Recovery Banner)  |
+-------------------------------------------------------------------------+
         |                                  |                     |
+--------------------+            +-------------------+   +---------------+
|   DECISION ENGINE  |            |   VISUALIZATION   |   | DATA & STATE  |
|   js/engine.js     |            |   js/trends.js    |   | js/storage.js |
|   - Net Return     |            |   - High-DPI SVG  |   | - localStorage|
|   - MCDA Ranking   |            |   - Tooltips      |   | - JSON Schemas|
|   - Buyer Matching |            |   - Trend Window  |   | js/data.js    |
+--------------------+            +-------------------+   +---------------+
```

### Technology Stack
- **Frontend Core**: Semantic HTML5, Modern CSS3 (custom CSS custom properties, no CSS frameworks required).
- **Application Logic**: Vanilla ECMAScript 2022 (ES6+ modular architecture, zero runtime dependencies).
- **Charts**: High-DPI responsive SVG renderer with zero external charting library dependencies (works 100% offline).
- **Persistence**: Web Storage API (`localStorage`) with defensive in-memory fallback.
- **Testing**: Node.js automated assertion runner.

---

## 📂 6. Repository Folder Structure

```
AI PROJECT/
├── index.html                          # Main application layout, semantic sections & modals
├── README.md                           # Comprehensive documentation & review evidence
├── css/
│   └── styles.css                      # Agri-tech design system, print styles & components
├── js/
│   ├── app.js                          # Master UI controller & event binding
│   ├── data.js                         # Salem regional markets, produce & buyer catalog
│   ├── engine.js                       # Mathematical engine & ranking algorithms
│   ├── errorBoundary.js                # Global resilience & error boundary module
│   ├── storage.js                      # LocalStorage persistence & session data
│   └── trends.js                       # Interactive SVG price trend charting engine
├── tests/
│   ├── test_calculations.js            # 33 unit tests verifying math formulas & edge cases
│   ├── test_dom_elements.js            # Verifies all 77 DOM IDs match index.html
│   ├── test_error_boundary.js          # 6 unit tests verifying error recovery & log capping
│   ├── test_schema_integrity.js        # 29 unit tests asserting data contracts & schemas
│   ├── test_trends_dom.js              # Verifies price trends DOM bindings
│   └── test_e2e_tabs.js                # End-to-end headless simulation of tab clicks & actions
└── better-tomorrow/
    ├── 02_ai-ideation/
    │   └── AI_INTERACTION_AUDIT.md     # AI prompts, divergence, trade-off matrix & corrections
    ├── 03_user-validation/
    │   └── USER_VALIDATION_PROTOCOL.md # Validation methodology & 3 real tester response templates
    └── FINAL_REVIEW_2_REPORT.md        # Comprehensive 20-section formal C29 Review 2 report
```

---

## 🗄️ 7. Database Schema & Data Models

The client persistence layer (`js/storage.js`) implements structured entity storage using the browser's `localStorage` engine:

### 1. `SavedDecision` Entity (`agy_market_saved_decisions_v1`)
| Field | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string` | Primary Key, `dec_{timestamp}` | Unique decision identifier |
| `date` | `string` | ISO Date (`YYYY-MM-DD`) | Target market dispatch date |
| `produceId` | `string` | Foreign Key -> `produceTypes.id` | Selected commodity key |
| `produceName` | `string` | Non-empty | Bilingual commodity name |
| `quantity` | `number` | Float > 0 | Total load volume in kg |
| `location` | `string` | Foreign Key -> `vendorLocations.id` | Farmer origin location |
| `locationName` | `string` | Non-empty | Descriptive location label |
| `recommendedMarketId` | `string` | Foreign Key -> `markets.id` | Top-ranked destination market |
| `recommendedMarketName` | `string` | Non-empty | Display name of recommended market |
| `expectedPricePerKg` | `number` | Float > 0 | Target selling price (₹/kg) |
| `expectedRevenue` | `number` | Float >= 0 | Gross projected revenue (₹) |
| `transportCost` | `number` | Float >= 0 | Calculated transit freight (₹) |
| `otherCosts` | `number` | Float >= 0 | Incidental loading/bag costs (₹) |
| `wastageLoss` | `number` | Float >= 0 | Projected transit spoilage loss (₹) |
| `expectedNetReturn` | `number` | Float | Final net realized return (₹) |
| `status` | `string` | Enum (`Planned`, `Sold / Completed`) | Operational status |

### 2. `PostSaleFeedback` Entity (`agy_market_post_sale_feedback_v1`)
| Field | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string` | Primary Key, `fb_{timestamp}` | Unique feedback log identifier |
| `decisionId` | `string|null` | Optional FK -> `SavedDecision.id` | Linked planned scenario |
| `date` | `string` | ISO Date (`YYYY-MM-DD`) | Date of actual sale |
| `produceName` | `string` | Non-empty | Commodity sold |
| `marketName` | `string` | Non-empty | Market where sale took place |
| `actualPricePerKg` | `number` | Float > 0 | Actual realized price (₹/kg) |
| `actualQtySold` | `number` | Float > 0 | Actual sold volume (kg) |
| `actualWastageKg` | `number` | Float >= 0 | Actual spoiled volume (kg) |
| `actualOtherCosts` | `number` | Float >= 0 | Actual incidental expenses (₹) |
| `actualNetReturn` | `number` | Float | Realized net return (₹) |
| `estimatedNetReturn` | `number` | Float | Predicted net return baseline (₹) |
| `variance` | `number` | Float | Variance $\Delta = \text{Actual} - \text{Estimated}$ |
| `notes` | `string` | Optional | Farmer qualitative observations |

---

## 🔌 8. API Specification & Data Exchange Contracts

While the current prototype runs entirely client-side for zero-latency offline reliability, the application modules communicate via strict JSON data contracts designed for seamless backend API migration:

### Endpoint: `GET /api/v1/markets`
- **Purpose**: Retrieve regional market directory around Salem.
- **Response**:
```json
[
  {
    "id": "mkt_dadagapatti",
    "name": "Salem Uzhavar Sandhai (Dadagapatti)",
    "tamilName": "தாதகாப்பட்டி உழவர் சந்தை",
    "type": "Direct Farmer-Consumer Market",
    "distanceKmFromDadagapatti": 2.1,
    "operatingHours": "05:00 AM - 11:30 AM",
    "basePriceAdjustments": { "tomato": 1.05, "onion": 1.02 },
    "baseWastagePct": 2.0,
    "demandLevel": "High",
    "climateRisk": "Low",
    "marketFee": 0
  }
]
```

### Endpoint: `POST /api/v1/decisions/evaluate`
- **Purpose**: Run multi-criteria market evaluation.
- **Request Body**:
```json
{
  "produceId": "tomato",
  "quantity": 100,
  "location": "dadagapatti",
  "sellingDate": "2026-09-19",
  "transportCostPerKm": 10,
  "otherCosts": 200
}
```
- **Response**: Returns sorted array of evaluated markets, top recommendation, and "Why this option" bullet points.

### Endpoint: `GET /api/v1/trends/:produceId`
- **Purpose**: Retrieve historical prices and 3-day short-term projection.
- **Response**: Returns arrays of dates, historical actuals, forecasted figures, and arrival rationale notes.

### Endpoint: `POST /api/v1/buyers/request`
- **Purpose**: Submit surplus B2B offtake inquiry.
- **Request Body**:
```json
{
  "buyerId": "buyer_1",
  "produceId": "tomato",
  "quantityKg": 80,
  "offeredPricePerKg": 30.7,
  "vendorPhone": "+91 98420 12345",
  "deliveryTiming": "Morning delivery before 06:30 AM"
}
```

---

## 🧪 9. Automated Testing & Verification

The repository includes a comprehensive automated test suite with **74 total assertions across 5 test scripts**:

```bash
# 1. Run Core Calculation & Formula Verification
node tests/test_calculations.js
# Result: 33 Passed, 0 Failed

# 2. Run Error Boundary & Resilience Verification
node tests/test_error_boundary.js
# Result: 6 Passed, 0 Failed

# 3. Run Data & Storage Schema Integrity Tests
node tests/test_schema_integrity.js
# Result: 29 Passed, 0 Failed

# 4. Run DOM Element ID Verification
node tests/test_dom_elements.js
# Result: All 77 DOM IDs verified

# 5. Run Price Trends Chart DOM Tests
node tests/test_trends_dom.js
# Result: 6 Passed, 0 Failed

# 6. Run Headless End-to-End Tab Simulation
node tests/test_e2e_tabs.js
# Result: All 6 tabs active & visible; actions executed cleanly
```

### Combined Test Assertion Summary:
- **Total Assertions**: 74
- **Success Rate**: 100% (74/74 Passed)
- **Zero NaN / Undefined**: Verified across all market financial outputs.

---

## 🛡️ 10. Error Handling & Error Boundaries

1. **Inline Field Validations**:
   - Zero or negative quantities trigger inline warning banners (*"Quantity must be greater than 0 kg"*).
   - Negative transport rates and missing dates are blocked before running calculations.
2. **Global Error Boundary (`js/errorBoundary.js`)**:
   - Catches uncaught `window.onerror` and `unhandledrejection` events.
   - Renders a non-intrusive in-app banner explaining the incident without losing vendor data.
   - Provides a "Restore Safe State" action that gracefully recovers the interface.
3. **Storage Fallback**:
   - When private browsing or device policies restrict `localStorage`, storage gracefully switches to an in-memory session store.

---

## 💻 11. How to Run Locally

### Option A: Direct Browser Launch
Simply double-click [`index.html`](file:///c:/Users/madhu/Desktop/AI%20PROJECT/index.html) in your file explorer.

### Option B: Python Local Server
```bash
python -m http.server 8080
```
Open `http://localhost:8080` in your web browser.

### Option C: Node / npx
```bash
npx serve .
```

---

## ⚠️ 12. Demo Data / Prototype Disclaimer

> **Demo Data — Prototype Demonstration:**
> This software is an academic field study prototype. All market prices, transport distances, price trends, climate indicators, and buyer profiles are simulated demo data designed for product evaluation.
> 
> The application does **not** claim to provide live commodity exchange feeds, guaranteed profits, or certain price increases. The vendor always makes the final selling decision.
