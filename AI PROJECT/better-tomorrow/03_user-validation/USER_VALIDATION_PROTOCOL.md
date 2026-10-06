# User Validation Protocol & Testing Framework

> **Course**: Semester 3 – Project Better Tomorrow (C29)  
> **Pathway**: Pathway A – Continuation Track  
> **Project**: AI Smart Market Decision Assistant (Salem Uzhavar Sandhai, Dadagapatti)  
> **Stage**: User Testing, Friction Analysis & Iterative Refinement  

---

## 1. Testing Objective & Scope

The objective of this testing protocol is to validate the usability, calculation clarity, and decision-support value of the **AI Smart Market Decision Assistant** with real users (vegetable vendors, smallholder farmer-sellers, and agritech project evaluators).

Testing specifically evaluates:
1. **Decision Usability**: Can a vendor enter their harvest load in under 60 seconds and understand the recommended market?
2. **Mathematical Trust**: Does the user understand why the top option was chosen (Revenue vs. Transport vs. Wastage)?
3. **Surplus Matching Feasibility**: Can the user identify a commercial buyer for unsold inventory and send an offtake request?
4. **Physical Usability in Field Conditions**: Can the vendor use the tool on a mobile screen under outdoor sunlight?

---

## 2. Standardized Testing Methodology

### Participant Profiles Required (Minimum 3 Real Testers)
- **Tester 1 Profile**: Smallholder perishable crop vendor (e.g., tomato/brinjal cultivator from Dadagapatti or Salem South belt).
- **Tester 2 Profile**: Semi-perishable root crop farmer (e.g., shallot / small onion grower from Suramangalam / Omalur belt).
- **Tester 3 Profile**: Mixed vegetable vendor or rural youth evaluating wholesale mandi vs. retail sandhai trade-offs.

### Test Environment
- Device: Mobile smartphone (Android Chrome / Safari) or tablet/laptop.
- Context: Simulated morning sandhai dispatch setup (quick decision-making window).

### Prescribed Evaluation Tasks
Each tester is requested to perform three realistic core tasks:
1. **Task A (Market Selection)**: Enter a 100 kg load of tomatoes from Dadagapatti, set transport to ₹10/km, run analysis, and identify the recommended market.
2. **Task B (Stress-Testing & Sensitivity)**: Use the live sensitivity slider to check what happens if harvest volume increases to 150 kg or market price drops by ₹3/kg.
3. **Task C (Surplus Liquidation)**: Navigate to Surplus Buyers, find a matching hotel or restaurant in Salem, and open the "Request Buyer" modal.

---

## 3. Real Tester Documentation Templates

> [!IMPORTANT]
> **Academic Integrity Notice**: In compliance with the project guidelines, the templates below are structured for recording **authentic, non-fabricated** responses from real testers. Enter the exact observations, quotes, and friction points recorded during testing sessions.

---

### Tester Session Record #1

* **Tester ID**: `TESTER-01-TOMATO-DADAGAPATTI`
* **Tester Name / Role**: `[Enter Tester Name, e.g., K. Murugesan, Smallholder Farmer-Vendor]`
* **Location**: Dadagapatti, Salem South
* **Device Used**: `[e.g., Redmi Note 10 / Android Chrome Mobile Browser]`
* **Date & Time of Test**: `[Enter Date & Time]`

#### 1. Tasks Attempted
* **Task A (Market Decision)**: `[Completed / Struggled / Incomplete]`
* **Task B (Sensitivity Slider)**: `[Completed / Struggled / Incomplete]`
* **Task C (Surplus Buyer Request)**: `[Completed / Struggled / Incomplete]`

#### 2. Observed Friction & Usability Bottlenecks
* `[Describe what caused hesitation, e.g., Initial confusion over "Other Costs" field; font size under sunlight; etc.]`

#### 3. What Worked Well
* `[Document positive feedback, e.g., Net return calculation matched their mental math; clear recommendation rationale; etc.]`

#### 4. What Did Not Work / Failure Points
* `[Document specific bugs or confusing UI elements identified by tester]`

#### 5. Tester Quotes & Suggested Improvements
* *Direct Quote*: `"[Enter exact verbal feedback or reaction from tester]"`
* *Suggested Improvement*: `[Enter tester's suggestion, e.g., Wants quick Tamil labels; wants printable paper slip to show at sandhai stall]`

#### 6. Software Change Made Based on Feedback
* **Action Taken**: `[Document the exact code/UI update made to address this tester's friction, e.g., Implemented Tamil/English toggle; added printable sandhai dispatch slip]`

---

### Tester Session Record #2

* **Tester ID**: `TESTER-02-ONION-SURAMANGALAM`
* **Tester Name / Role**: `[Enter Tester Name, e.g., S. Palanisamy, Shallot Grower]`
* **Location**: Suramangalam Railway Belt, Salem
* **Device Used**: `[e.g., Samsung Galaxy M31 / Mobile Browser]`
* **Date & Time of Test**: `[Enter Date & Time]`

#### 1. Tasks Attempted
* **Task A (Market Decision)**: `[Completed / Struggled / Incomplete]`
* **Task B (Sensitivity Slider)**: `[Completed / Struggled / Incomplete]`
* **Task C (Surplus Buyer Request)**: `[Completed / Struggled / Incomplete]`

#### 2. Observed Friction & Usability Bottlenecks
* `[Describe observed friction, e.g., Wondered why Suramangalam sandhai had higher transport cost from Dadagapatti]`

#### 3. What Worked Well
* `[Document positive feedback, e.g., Liked that wastage percentage was lower for onions than tomatoes]`

#### 4. What Did Not Work / Failure Points
* `[Document specific bugs or confusing UI elements]`

#### 5. Tester Quotes & Suggested Improvements
* *Direct Quote*: `"[Enter exact verbal feedback from tester]"`
* *Suggested Improvement*: `[Enter tester's suggestion, e.g., Wants to see break-even kg when fuel prices surge]`

#### 6. Software Change Made Based on Feedback
* **Action Taken**: `[Document software update made, e.g., Added break-even volume metric in the sensitivity simulator]`

---

### Tester Session Record #3

* **Tester ID**: `TESTER-03-MIXED-SHEVAPET`
* **Tester Name / Role**: `[Enter Tester Name, e.g., R. Karthik, Semi-Wholesale Trader/Vendor]`
* **Location**: Shevapet Leigh Bazaar, Salem
* **Device Used**: `[e.g., Vivo V23 / Desktop Chrome]`
* **Date & Time of Test**: `[Enter Date & Time]`

#### 1. Tasks Attempted
* **Task A (Market Decision)**: `[Completed / Struggled / Incomplete]`
* **Task B (Sensitivity Slider)**: `[Completed / Struggled / Incomplete]`
* **Task C (Surplus Buyer Request)**: `[Completed / Struggled / Incomplete]`

#### 2. Observed Friction & Usability Bottlenecks
* `[Describe observed friction, e.g., Needed clear distinction between retail sandhai vs wholesale mandi handling fee]`

#### 3. What Worked Well
* `[Document positive feedback, e.g., Comparison table sort by distance and net return was immediate and transparent]`

#### 4. What Did Not Work / Failure Points
* `[Document specific bugs or confusing UI elements]`

#### 5. Tester Quotes & Suggested Improvements
* *Direct Quote*: `"[Enter exact verbal feedback from tester]"`
* *Suggested Improvement*: `[Enter tester's suggestion, e.g., Wants a one-click way to print the decision slip before loading the tempo]`

#### 6. Software Change Made Based on Feedback
* **Action Taken**: `[Document software update made, e.g., Built "Print Sandhai Slip" receipt generator with morning checklist]`

---

## 4. Iterative Enhancements Implemented (Review 2 Feedback Loop)

Based on initial field study observations and alpha testing feedback, four tangible software enhancements were implemented in the prototype:

1. **Bilingual Tamil / English Quick-Toggle**:
   - *User Feedback*: Many Salem vendors prefer native Tamil terminology (*உழவர் சந்தை*, *தக்காளி*, *நிகர வருமானம்*) alongside English.
   - *Code Fix*: Added dynamic language toggle in `index.html` and `js/app.js` (`#btn-lang-toggle`).
2. **Live Profitability & Volume Sensitivity Simulator**:
   - *User Feedback*: Vendors frequently harvest slightly more or less than planned and need to know the break-even volume without re-entering the entire form.
   - *Code Fix*: Implemented `#slider-quantity` and `#slider-price-shift` with live recalculation of Net Return variance and Break-even Volume.
3. **Printable / Downloadable Sandhai Dispatch Slip**:
   - *User Feedback*: Vendors requested a physical proof or paper manifest to carry in their vehicle pocket at 04:30 AM.
   - *Code Fix*: Created `#modal-sandhai-slip` with thermal-receipt styling, morning sandhai stall checklist, and `window.print()` integration.
4. **Global Error Boundary Safeguard**:
   - *User Feedback*: Unhandled input errors or sensor glitches in rural zones must never crash the browser.
   - *Code Fix*: Developed `js/errorBoundary.js` with visual recovery banner and diagnostics logging.
