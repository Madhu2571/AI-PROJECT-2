/**
 * AI Smart Market Decision Assistant
 * Master UI Controller & Interaction Logic
 * 
 * Field Context: Salem Uzhavar Sandhai, Dadagapatti
 */

(function () {
  'use strict';

  // Global references
  const data = (typeof window !== 'undefined' && window.DEMO_DATA) || (typeof DEMO_DATA !== 'undefined' ? DEMO_DATA : {});
  const engine = (typeof window !== 'undefined' && window.MarketEngine) || (typeof MarketEngine !== 'undefined' ? MarketEngine : null);
  const storage = (typeof window !== 'undefined' && window.MarketStorage) || (typeof MarketStorage !== 'undefined' ? MarketStorage : null);
  const trendsChart = (typeof window !== 'undefined' && window.PriceTrendsChart) || (typeof PriceTrendsChart !== 'undefined' ? PriceTrendsChart : null);

  // Application State
  let currentAnalysis = null;
  let currentProduceId = 'tomato';
  let currentSortCriteria = 'netReturn';
  let activeBuyerModalData = null;
  let currentLanguage = 'en';

  // Bilingual Dictionary (Review 2 Salem Field Enhancement)
  const TRANSLATIONS = {
    en: {
      dashTitle: "Selling Decision Assistant",
      compTitle: "Regional Market Comparison",
      trendsTitle: "Price Trends & Short-Term Projections",
      surplusTitle: "Surplus Buyer Matching",
      decisionsTitle: "My Decisions & After Selling Feedback",
      methodsTitle: "Proposed AI Methods & Field Study Context",
      btnLang: "🌐 தமிழ் / English"
    },
    ta: {
      dashTitle: "விற்பனை முடிவு உதவியாளர் (Selling Decision Assistant)",
      compTitle: "சேலம் மண்டல சந்தை ஒப்பீடு (Market Comparison)",
      trendsTitle: "விலை போக்குகள் & மதிப்பீடுகள் (Price Trends)",
      surplusTitle: "உபரி காய்கறி வாங்குவோர் இணைப்பு (Surplus Buyers)",
      decisionsTitle: "என் முடிவுகள் & விற்பனைக்குப் பின் ஆய்வு (My Decisions)",
      methodsTitle: "AI கணிப்பு முறைகள் & கள ஆய்வு (AI Methods)",
      btnLang: "🌐 English / தமிழ்"
    }
  };

  /**
   * Helper: Show transient toast notification
   */
  function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>
      <div>${message}</div>
    `;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.25s ease';
      setTimeout(() => toast.remove(), 250);
    }, 3200);
  }

  /**
   * Format currency safely
   */
  function formatINR(val) {
    if (val === null || val === undefined || isNaN(val)) return '₹0.00';
    return '₹' + Number(val).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  /**
   * Tab Navigation Switcher
   */
  function switchTab(targetTabId) {
    if (!targetTabId) return;

    // Update Nav Tab Buttons
    const tabs = document.querySelectorAll('.nav-tab');
    tabs.forEach(tab => {
      const tid = tab.getAttribute('data-tab');
      if (tid === targetTabId) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });

    // Update Section Views
    const sections = document.querySelectorAll('.section-view');
    sections.forEach(sec => {
      if (sec.id === `view-${targetTabId}`) {
        sec.classList.add('active');
        sec.style.display = 'block';
      } else {
        sec.classList.remove('active');
        sec.style.display = 'none';
      }
    });

    // Lazy re-render or resize on tab switch
    if (targetTabId === 'trends' && trendsChart) {
      const selectTrendProduce = document.getElementById('select-trend-produce');
      const prodId = selectTrendProduce ? selectTrendProduce.value : currentProduceId;
      trendsChart.renderChart('price-trend-chart-container', prodId);
    } else if (targetTabId === 'comparison') {
      if (currentAnalysis && currentAnalysis.markets) {
        renderComparisonTable(currentAnalysis.markets);
      }
    } else if (targetTabId === 'decisions') {
      renderSavedDecisions();
      renderFeedbackHistory();
      populateFeedbackDecisionDropdown();
    } else if (targetTabId === 'surplus') {
      runSurplusMatching();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * Clear all inline validation errors
   */
  function clearValidationErrors() {
    document.querySelectorAll('.form-error').forEach(el => el.classList.remove('visible'));
    document.querySelectorAll('.form-control').forEach(el => el.classList.remove('is-invalid'));
  }

  /**
   * Show inline validation errors
   */
  function showValidationErrors(errors) {
    clearValidationErrors();
    for (const [field, message] of Object.entries(errors)) {
      const errEl = document.getElementById(`err-${field}`);
      if (errEl) {
        errEl.textContent = message;
        errEl.classList.add('visible');
      }
      const inputEl = document.getElementById(`input-${field.replace(/([A-Z])/g, '-$1').toLowerCase()}`);
      if (inputEl) {
        inputEl.classList.add('is-invalid');
      }
    }
  }

  /**
   * Run Analysis Engine & Update All Views
   */
  function runAnalysis() {
    clearValidationErrors();

    const inputProduce = document.getElementById('input-produce');
    const inputQuantity = document.getElementById('input-quantity');
    const inputLocation = document.getElementById('input-location');
    const inputSellingDate = document.getElementById('input-selling-date');
    const inputTransportRate = document.getElementById('input-transport-rate');
    const inputOtherCosts = document.getElementById('input-other-costs');

    if (!inputProduce || !inputQuantity || !inputLocation || !engine) return false;

    const inputs = {
      produceId: inputProduce.value,
      quantity: inputQuantity.value.trim(),
      location: inputLocation.value,
      sellingDate: inputSellingDate ? inputSellingDate.value : '',
      transportCostPerKm: inputTransportRate ? inputTransportRate.value.trim() : '10',
      otherCosts: inputOtherCosts ? inputOtherCosts.value.trim() : '200'
    };

    const result = engine.analyzeSellingOptions(inputs);

    if (!result.success) {
      if (result.validation && result.validation.errors) {
        showValidationErrors(result.validation.errors);
      }
      showToast("Please check the produce inputs.", "info");
      return false;
    }

    currentAnalysis = result;
    currentProduceId = inputs.produceId;

    // 1. Update Recommendation Card
    renderRecommendation(result.recommendation);

    // 2. Update Top Markets Summary Cards
    renderTopMarketsSummary(result.markets);

    // 3. Update Climate Insight Card
    updateClimateInsight(currentProduceId);

    // 4. Update Market Comparison Table
    renderComparisonTable(result.markets);

    // 5. Sync Produce into Surplus & Trends
    const surplusInputProduce = document.getElementById('surplus-input-produce');
    const surplusInputQuantity = document.getElementById('surplus-input-quantity');
    const selectTrendProduce = document.getElementById('select-trend-produce');

    if (surplusInputProduce) surplusInputProduce.value = inputs.produceId;
    if (surplusInputQuantity) surplusInputQuantity.value = Math.max(10, Math.round(Number(inputs.quantity) * 0.3));
    if (selectTrendProduce) selectTrendProduce.value = inputs.produceId;
    
    if (trendsChart) {
      trendsChart.renderChart('price-trend-chart-container', inputs.produceId);
    }

    // 6. Update scenario text on Comparison view
    const compScenarioText = document.getElementById('comp-scenario-text');
    if (compScenarioText) {
      const prodName = data.produceTypes ? data.produceTypes.find(p => p.id === inputs.produceId)?.name : inputs.produceId;
      const locName = data.vendorLocations ? data.vendorLocations.find(l => l.id === inputs.location)?.name : inputs.location;
      compScenarioText.textContent = `${inputs.quantity} kg ${prodName || inputs.produceId} from ${locName || inputs.location}`;
    }

    return true;
  }

  /**
   * Render Top Recommendation Banner
   */
  function renderRecommendation(recommendation) {
    if (!recommendation || !recommendation.market) return;
    const m = recommendation.market;

    const recMarketName = document.getElementById('rec-market-name');
    const recMarketTamil = document.getElementById('rec-market-tamil');
    const recNetReturn = document.getElementById('rec-net-return');
    const recPrice = document.getElementById('rec-price');
    const recTransport = document.getElementById('rec-transport');
    const recWastage = document.getElementById('rec-wastage');
    const recDemand = document.getElementById('rec-demand');
    const recRisk = document.getElementById('rec-risk');
    const recWhyList = document.getElementById('rec-why-list');
    const recDisclaimer = document.getElementById('rec-disclaimer');

    if (recMarketName) recMarketName.textContent = m.marketName;
    if (recMarketTamil) recMarketTamil.textContent = m.marketTamilName || '';
    if (recNetReturn) recNetReturn.textContent = formatINR(m.estimatedNetReturn);
    if (recPrice) recPrice.textContent = `${formatINR(m.marketPricePerKg)} / kg`;
    if (recTransport) recTransport.textContent = `${formatINR(m.transportCost)} (${m.distanceKm} km)`;
    if (recWastage) recWastage.textContent = `${m.effectiveWastagePct}% (${m.wastageQuantityKg} kg)`;

    if (recDemand) {
      recDemand.textContent = `${m.demandLevel} Demand`;
      recDemand.className = `table-badge ${m.demandLevel === 'High' ? 'badge-high' : 'badge-med'}`;
    }

    if (recRisk) {
      recRisk.textContent = `${m.climateRisk} Risk`;
      recRisk.className = `table-badge ${m.climateRisk === 'Low' ? 'badge-risk-low' : m.climateRisk === 'Medium' ? 'badge-risk-med' : 'badge-risk-high'}`;
    }

    if (recWhyList && recommendation.whyReasons) {
      recWhyList.innerHTML = recommendation.whyReasons.map(r => {
        return `
          <li>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span>${r}</span>
          </li>
        `;
      }).join('');
    }

    if (recDisclaimer) {
      recDisclaimer.textContent = `* ${recommendation.disclaimerNotice} The vendor always makes the final selling decision.`;
    }

    // Update sensitivity stress test simulator
    updateSensitivitySimulator();
  }

  /**
   * Review 2 Enhancement: Live Profitability & Volume Sensitivity Simulator
   * Allows farmer to stress-test price swings and volume changes in real-time.
   */
  function updateSensitivitySimulator() {
    if (!currentAnalysis || !currentAnalysis.recommendation) return;
    const rec = currentAnalysis.recommendation.market;

    const sliderQty = document.getElementById('slider-quantity');
    const sliderPriceShift = document.getElementById('slider-price-shift');
    const sensQtyDisplay = document.getElementById('sens-qty-display');
    const sensQtyDelta = document.getElementById('sens-qty-delta');
    const sensPriceDisplay = document.getElementById('sens-price-display');
    const sensPriceDelta = document.getElementById('sens-price-delta');
    const sensNetReturn = document.getElementById('sens-net-return');
    const sensVarianceVal = document.getElementById('sens-variance-val');
    const sensBreakevenVal = document.getElementById('sens-breakeven-val');

    if (!sliderQty || !sliderPriceShift) return;

    const baselineQty = currentAnalysis.inputs.quantity || 100;
    const simQty = Number(sliderQty.value);
    const priceShift = Number(sliderPriceShift.value);

    // Display labels
    if (sensQtyDisplay) sensQtyDisplay.textContent = `${simQty} kg`;
    if (sensQtyDelta) {
      const diff = simQty - baselineQty;
      sensQtyDelta.textContent = diff === 0 ? '(Baseline load)' : (diff > 0 ? `(+${diff} kg)` : `(${diff} kg)`);
    }

    if (sensPriceDisplay) sensPriceDisplay.textContent = priceShift === 0 ? '₹0 / kg' : (priceShift > 0 ? `+₹${priceShift} / kg` : `-₹${Math.abs(priceShift)} / kg`);
    if (sensPriceDelta) {
      sensPriceDelta.textContent = priceShift === 0 ? '(Mandi baseline)' : (priceShift > 0 ? '(Price surge)' : '(Arrival pressure)');
    }

    // Calculations
    const effPrice = Math.max(1, rec.marketPricePerKg + priceShift);
    const gross = simQty * effPrice;
    const transport = rec.transportCost; // Fixed single-trip cost
    const other = rec.otherCosts + (rec.marketFee || 0);
    const wastageKg = simQty * (rec.effectiveWastagePct / 100);
    const wastageLoss = wastageKg * effPrice;
    const simNet = Math.round((gross - transport - other - wastageLoss) * 100) / 100;
    const variance = Math.round((simNet - rec.estimatedNetReturn) * 100) / 100;

    // Break-even quantity: Q * effPrice * (1 - wastagePct/100) = (transport + other)
    const netPerKgRatio = (1 - rec.effectiveWastagePct / 100);
    const breakevenKg = netPerKgRatio > 0 ? Math.round(((transport + other) / (effPrice * netPerKgRatio)) * 10) / 10 : 0;

    if (sensNetReturn) {
      sensNetReturn.textContent = formatINR(simNet);
      sensNetReturn.style.color = simNet >= 0 ? '#166534' : '#b91c1c';
    }
    if (sensVarianceVal) {
      sensVarianceVal.textContent = (variance >= 0 ? '+' : '') + formatINR(variance);
      sensVarianceVal.style.color = variance >= 0 ? '#166534' : '#b91c1c';
    }
    if (sensBreakevenVal) {
      sensBreakevenVal.textContent = `${breakevenKg} kg`;
    }
  }

  /**
   * Review 2 Enhancement: Open Printable Sandhai Decision Slip Modal
   * Generates a thermal receipt style pre-trip manifest for the vendor.
   */
  function openSandhaiSlipModal() {
    if (!currentAnalysis || !currentAnalysis.recommendation) {
      showToast("Please analyse selling options first.", "info");
      return;
    }

    const modal = document.getElementById('modal-sandhai-slip');
    const bodyEl = document.getElementById('slip-modal-body');
    if (!modal || !bodyEl) return;

    const rec = currentAnalysis.recommendation.market;
    const inp = currentAnalysis.inputs;
    const dateFormatted = inp.sellingDate || new Date().toISOString().split('T')[0];

    bodyEl.innerHTML = `
      <div class="sandhai-slip-receipt" id="printable-sandhai-slip">
        <div class="slip-header-title">
          SALEM UZHAVAR SANDHAI DISPATCH MANIFEST
          <div style="font-size: 0.72rem; font-weight: normal; margin-top: 2px;">
            Department of Agricultural Marketing & Agri Business (TN)
          </div>
        </div>

        <div class="slip-meta-row">
          <span>DISPATCH DATE:</span>
          <strong>${dateFormatted}</strong>
        </div>
        <div class="slip-meta-row">
          <span>OPERATING WINDOW:</span>
          <strong>05:00 AM - 11:30 AM (Morning)</strong>
        </div>
        <div class="slip-meta-row">
          <span>STARTING LOCATION:</span>
          <strong>${inp.locationName}</strong>
        </div>
        <div class="slip-meta-row">
          <span>RECOMMENDED MARKET:</span>
          <strong style="color: #1b4332;">${rec.marketName}</strong>
        </div>
        <div class="slip-meta-row">
          <span>COMMODITY / LOAD:</span>
          <strong>${inp.produceName} • ${inp.quantity} kg</strong>
        </div>
        <div class="slip-meta-row">
          <span>TARGET REALIZATION:</span>
          <strong>${formatINR(rec.marketPricePerKg)} / kg</strong>
        </div>
        <div class="slip-meta-row">
          <span>ESTIMATED FREIGHT:</span>
          <strong>${formatINR(rec.transportCost)} (${rec.distanceKm} km)</strong>
        </div>
        <div class="slip-meta-row" style="border-bottom: 2px solid #0f172a; padding: 6px 0;">
          <span style="font-size: 0.95rem; font-weight: bold;">PROJECTED NET RETURN:</span>
          <strong style="font-size: 1.1rem; color: #166534;">${formatINR(rec.estimatedNetReturn)}</strong>
        </div>

        <ul class="slip-checklist">
          <li><strong>[ ] Uzhavar Sandhai Farmer ID Card:</strong> Mandatory for free stall allotment.</li>
          <li><strong>[ ] Packing & Crates:</strong> Clean ventilated gunny bags to prevent transit heat rot.</li>
          <li><strong>[ ] Digital Weighing Scale:</strong> Check certified zero calibration at gate.</li>
          <li><strong>[ ] Early Gate Arrival:</strong> Report before 05:00 AM to secure consumer-facing stall.</li>
        </ul>

        <div style="text-align: center; font-size: 0.70rem; color: #64748b; margin-top: 10px;">
          * Decision-Support Guidance (Prototype) • Final sale is subject to open morning sandhai demand.
        </div>
      </div>
    `;

    modal.classList.add('active');
  }

  /**
   * Review 2 Enhancement: Bilingual Tamil / English Language Switcher
   */
  function toggleLanguage() {
    currentLanguage = currentLanguage === 'en' ? 'ta' : 'en';
    const dict = TRANSLATIONS[currentLanguage];

    const langBtn = document.getElementById('btn-lang-toggle');
    if (langBtn) langBtn.textContent = dict.btnLang;

    // Headings
    const dashH2 = document.querySelector('#view-dashboard .section-title');
    if (dashH2) dashH2.textContent = dict.dashTitle;

    const compH2 = document.querySelector('#view-comparison .section-title');
    if (compH2) compH2.textContent = dict.compTitle;

    const trendsH2 = document.querySelector('#view-trends .section-title');
    if (trendsH2) trendsH2.textContent = dict.trendsTitle;

    const surplusH2 = document.querySelector('#view-surplus .section-title');
    if (surplusH2) surplusH2.textContent = dict.surplusTitle;

    const decisionsH2 = document.querySelector('#view-decisions .section-title');
    if (decisionsH2) decisionsH2.textContent = dict.decisionsTitle;

    const methodsH2 = document.querySelector('#view-methods .section-title');
    if (methodsH2) methodsH2.textContent = dict.methodsTitle;

    showToast(currentLanguage === 'ta' ? "மொழி மாற்றப்பட்டது: தமிழ் (Tamil active)" : "Language switched: English", "info");
  }

  /**
   * Render Top 3 Markets Snapshot List
   */
  function renderTopMarketsSummary(markets) {
    const listEl = document.getElementById('top-markets-summary-list');
    if (!listEl || !markets || !markets.length) return;
    const top3 = markets.slice(0, 3);

    listEl.innerHTML = top3.map((m, idx) => {
      const isTop = idx === 0;
      return `
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: ${isTop ? '#f0fdf4' : '#f8fafc'}; border: 1px solid ${isTop ? '#86efac' : '#e2e8f0'}; border-radius: 8px; font-size: 0.85rem;">
          <div>
            <div style="font-weight: 700; color: var(--slate-900);">
              ${idx + 1}. ${m.marketName}
              ${isTop ? '<span class="table-badge badge-high" style="margin-left: 6px;">Top Choice</span>' : ''}
            </div>
            <div style="font-size: 0.76rem; color: var(--slate-500); margin-top: 2px;">
              Price: ${formatINR(m.marketPricePerKg)}/kg • Distance: ${m.distanceKm} km • Wastage: ${m.effectiveWastagePct}%
            </div>
          </div>
          <div style="text-align: right;">
            <div style="font-weight: 700; color: ${isTop ? '#166534' : 'var(--slate-800)'}; font-size: 0.95rem;">
              ${formatINR(m.estimatedNetReturn)}
            </div>
            <div style="font-size: 0.72rem; color: var(--slate-500);">Net Realized</div>
          </div>
        </div>
      `;
    }).join('');
  }

  /**
   * Update Climate Insight Card based on Produce
   */
  function updateClimateInsight(produceId) {
    const climateTemp = document.getElementById('climate-temp');
    const climateDesc = document.getElementById('climate-desc');
    const climateImpactNote = document.getElementById('climate-impact-note');

    const climate = data.climateProfiles ? data.climateProfiles.current : { temperature: "29°C", condition: "Warm", location: "Salem", humidity: "74%", possibleImpact: "Changing weather conditions may affect supply." };
    if (climateTemp) climateTemp.textContent = climate.temperature;
    if (climateDesc) climateDesc.textContent = `${climate.condition} in ${climate.location} (Humidity: ${climate.humidity}).`;

    const produce = data.produceTypes ? data.produceTypes.find(p => p.id === produceId) : null;
    let extraNote = "";
    if (produce && produce.perishability === "High") {
      extraNote = ` Highly perishable produce (${produce.name}) is vulnerable to ambient heat; early morning sandhai stalls minimize dehydration.`;
    }

    if (climateImpactNote) {
      climateImpactNote.innerHTML = `<strong>Possible market impact:</strong> ${climate.possibleImpact}${extraNote}`;
    }
  }

  /**
   * Render Market Comparison Table
   */
  function renderComparisonTable(markets) {
    const tbody = document.getElementById('tbody-market-comparison');
    if (!tbody || !markets || !markets.length || !engine) return;

    const sorted = engine.sortMarkets(markets, currentSortCriteria, currentSortCriteria === 'transport' || currentSortCriteria === 'distance' ? 'asc' : 'desc');

    tbody.innerHTML = sorted.map((m, idx) => {
      const isTop = idx === 0 && currentSortCriteria === 'netReturn';
      return `
        <tr class="${isTop ? 'highlight-row' : ''}">
          <td>
            <div style="font-weight: 600; color: var(--slate-900);">${m.marketName}</div>
            <div style="font-size: 0.74rem; color: var(--slate-500);">${m.marketType}</div>
          </td>
          <td>${m.distanceKm} km</td>
          <td style="font-weight: 600;">${formatINR(m.marketPricePerKg)}</td>
          <td>${formatINR(m.sellingRevenue)}</td>
          <td style="color: #b91c1c;">${formatINR(m.transportCost)}</td>
          <td>${m.effectiveWastagePct}% (${m.wastageQuantityKg} kg)</td>
          <td>${formatINR(m.otherCosts + (m.marketFee || 0))}</td>
          <td style="font-weight: 700; color: ${m.estimatedNetReturn > 0 ? '#166534' : '#991b1b'};">
            ${formatINR(m.estimatedNetReturn)}
          </td>
          <td>
            <span class="table-badge ${m.demandLevel === 'High' ? 'badge-high' : 'badge-med'}">
              ${m.demandLevel}
            </span>
          </td>
          <td>
            <span class="table-badge ${m.climateRisk === 'Low' ? 'badge-risk-low' : m.climateRisk === 'Medium' ? 'badge-risk-med' : 'badge-risk-high'}">
              ${m.climateRisk}
            </span>
          </td>
          <td>
            <button type="button" class="btn btn-outline btn-sm btn-table-breakdown" data-market-id="${m.marketId}" style="padding: 4px 8px; font-size: 0.76rem;">
              Breakdown
            </button>
          </td>
        </tr>
      `;
    }).join('');

    tbody.querySelectorAll('.btn-table-breakdown').forEach(btn => {
      btn.addEventListener('click', () => {
        const marketId = btn.getAttribute('data-market-id');
        openBreakdownModal(marketId);
      });
    });
  }

  /**
   * Open Cost Breakdown Modal
   */
  function openBreakdownModal(marketId) {
    if (!currentAnalysis || !currentAnalysis.markets) return;
    const targetMarket = currentAnalysis.markets.find(m => m.marketId === marketId) || currentAnalysis.recommendation.market;

    const modal = document.getElementById('modal-breakdown');
    const titleEl = document.getElementById('breakdown-modal-title');
    const contentEl = document.getElementById('breakdown-modal-content');

    if (!modal || !titleEl || !contentEl) return;

    titleEl.textContent = `Calculation Breakdown: ${targetMarket.marketName}`;

    contentEl.innerHTML = `
      <div style="background: #f8fafc; padding: 14px; border-radius: 8px; margin-bottom: 16px; border: 1px solid #e2e8f0;">
        <div style="font-size: 0.85rem; color: var(--slate-600); margin-bottom: 4px;">Scenario Parameters:</div>
        <div style="font-weight: 600; color: var(--slate-900);">
          ${targetMarket.quantityKg} kg of ${targetMarket.produceName} • ${targetMarket.distanceKm} km from starting base
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 10px; font-size: 0.88rem;">
        <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;">
          <span>1. Gross Selling Revenue (${targetMarket.quantityKg} kg × ${formatINR(targetMarket.marketPricePerKg)})</span>
          <strong style="color: #166534;">+ ${formatINR(targetMarket.sellingRevenue)}</strong>
        </div>

        <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;">
          <span>2. Transport Cost (${targetMarket.distanceKm} km × ${formatINR(targetMarket.transportCostPerKm)}/km)</span>
          <strong style="color: #b91c1c;">− ${formatINR(targetMarket.transportCost)}</strong>
        </div>

        <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;">
          <span>3. Wastage Loss (${targetMarket.effectiveWastagePct}% transit spoilage = ${targetMarket.wastageQuantityKg} kg)</span>
          <strong style="color: #b91c1c;">− ${formatINR(targetMarket.wastageLoss)}</strong>
        </div>

        <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;">
          <span>4. Other Incidental Costs (Loading, packaging, bags)</span>
          <strong style="color: #b91c1c;">− ${formatINR(targetMarket.otherCosts)}</strong>
        </div>

        ${targetMarket.marketFee > 0 ? `
        <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;">
          <span>5. Market Handling / Mandi Fee</span>
          <strong style="color: #b91c1c;">− ${formatINR(targetMarket.marketFee)}</strong>
        </div>
        ` : `
        <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; font-size: 0.82rem; color: #166534;">
          <span>5. Market Stall Fee</span>
          <span>₹0.00 (Uzhavar Sandhai direct farmer privilege)</span>
        </div>
        `}

        <div style="display: flex; justify-content: space-between; padding-top: 10px; font-size: 1.05rem; border-top: 2px solid var(--slate-300);">
          <strong>Estimated Net Realized Return:</strong>
          <strong style="color: #166534;">${formatINR(targetMarket.estimatedNetReturn)}</strong>
        </div>

        <div style="display: flex; justify-content: space-between; font-size: 0.84rem; color: var(--slate-600); margin-top: 2px;">
          <span>Net Return per kg realized:</span>
          <strong>${formatINR(targetMarket.netReturnPerKg)} / kg</strong>
        </div>
      </div>
    `;

    modal.classList.add('active');
  }

  /**
   * Run Surplus Matching
   */
  function runSurplusMatching() {
    const surplusInputProduce = document.getElementById('surplus-input-produce');
    const surplusInputQuantity = document.getElementById('surplus-input-quantity');
    const surplusInputLocation = document.getElementById('surplus-input-location');
    const grid = document.getElementById('surplus-buyers-grid');
    const countEl = document.getElementById('matched-buyers-count');

    if (!grid || !engine) return;

    const produceId = surplusInputProduce ? surplusInputProduce.value : 'tomato';
    const qty = Number(surplusInputQuantity ? surplusInputQuantity.value : 80) || 0;
    const location = surplusInputLocation ? surplusInputLocation.value : 'dadagapatti';

    const matches = engine.matchSurplusBuyers(produceId, qty, location);
    if (countEl) countEl.textContent = matches.length;

    if (matches.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; padding: 40px 20px; text-align: center; background: #ffffff; border: 1px dashed #cbd5e1; border-radius: 8px;">
          <p style="color: var(--slate-600); font-weight: 500;">No direct buyers found for the specified quantity and produce criteria.</p>
          <p style="font-size: 0.80rem; color: var(--slate-500); margin-top: 4px;">Try adjusting the surplus quantity or selecting another produce type.</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = matches.map(b => {
      return `
        <div class="buyer-card">
          <div>
            <div class="buyer-header">
              <div>
                <div class="buyer-category">${b.category}</div>
                <h4 class="buyer-name">${b.businessName}</h4>
              </div>
              <span class="match-score-badge">${b.matchPercentage}% Match</span>
            </div>

            <ul class="buyer-detail-list">
              <li>
                <span class="prop">Location:</span>
                <span class="val">${b.location} (${b.distanceKm} km)</span>
              </li>
              <li>
                <span class="prop">Typical Daily Intake:</span>
                <span class="val">${b.targetDailyQtyKg} kg</span>
              </li>
              <li>
                <span class="prop">Quality Grade:</span>
                <span class="val">${b.qualityRequirement}</span>
              </li>
              <li>
                <span class="prop">Payment Terms:</span>
                <span class="val">${b.paymentTerms}</span>
              </li>
              <li>
                <span class="prop">Indicative Offer Rate:</span>
                <span class="val" style="color: #166534;">${formatINR(b.offeredPricePerKg)} / kg</span>
              </li>
              <li>
                <span class="prop">Total Estimated Value:</span>
                <span class="val" style="color: #166534; font-weight: 700;">${formatINR(b.totalEstimatedValue)}</span>
              </li>
            </ul>
          </div>

          <button type="button" class="btn btn-outline btn-block btn-contact-buyer" data-buyer-id="${b.buyerId}" style="margin-top: 10px;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
              <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
            Contact / Request Buyer
          </button>
        </div>
      `;
    }).join('');

    grid.querySelectorAll('.btn-contact-buyer').forEach(btn => {
      btn.addEventListener('click', () => {
        const buyerId = btn.getAttribute('data-buyer-id');
        const buyer = matches.find(m => m.buyerId === buyerId);
        if (buyer) {
          openBuyerContactModal(buyer);
        }
      });
    });
  }

  /**
   * Open Buyer Contact Modal
   */
  function openBuyerContactModal(buyer) {
    activeBuyerModalData = buyer;
    const modal = document.getElementById('modal-buyer-contact');
    const reqBuyerId = document.getElementById('req-buyer-id');
    const reqBuyerDisplayName = document.getElementById('req-buyer-display-name');
    const reqBuyerDisplayTerms = document.getElementById('req-buyer-display-terms');
    const reqProduceDisplay = document.getElementById('req-produce-display');
    const reqQuantityInput = document.getElementById('req-quantity-input');
    const reqRateInput = document.getElementById('req-rate-input');

    if (!modal) return;

    if (reqBuyerId) reqBuyerId.value = buyer.buyerId;
    if (reqBuyerDisplayName) reqBuyerDisplayName.textContent = `${buyer.businessName} (${buyer.category})`;
    if (reqBuyerDisplayTerms) reqBuyerDisplayTerms.textContent = `Contact: ${buyer.contactPerson} • ${buyer.paymentTerms}`;
    if (reqProduceDisplay) reqProduceDisplay.value = `${buyer.requiredProduceName}`;
    if (reqQuantityInput) reqQuantityInput.value = buyer.vendorAvailableQtyKg;
    if (reqRateInput) reqRateInput.value = buyer.offeredPricePerKg;

    modal.classList.add('active');
  }

  /**
   * Save Current Decision
   */
  function handleSaveDecision() {
    if (!currentAnalysis || !currentAnalysis.recommendation) {
      showToast("Please run an analysis before saving.", "info");
      return;
    }

    if (!storage) return;

    const rec = currentAnalysis.recommendation.market;
    const inputs = currentAnalysis.inputs;

    const saved = storage.saveDecision({
      date: inputs.sellingDate || new Date().toISOString().split('T')[0],
      produceId: inputs.produceId,
      produceName: inputs.produceName,
      quantity: inputs.quantity,
      location: inputs.location,
      locationName: inputs.locationName,
      recommendedMarketId: rec.marketId,
      recommendedMarketName: rec.marketName,
      expectedPricePerKg: rec.marketPricePerKg,
      expectedRevenue: rec.sellingRevenue,
      transportCost: rec.transportCost,
      otherCosts: rec.otherCosts,
      wastageLoss: rec.wastageLoss,
      expectedNetReturn: rec.estimatedNetReturn,
      status: "Planned / Ready for Sandhai",
      notes: `Planned selling option based on ${inputs.locationName} base.`
    });

    renderSavedDecisions();
    populateFeedbackDecisionDropdown();
    showToast(`Decision saved to history (#${saved.id})!`, 'success');
  }

  /**
   * Render Saved Decisions Table
   */
  function renderSavedDecisions() {
    if (!storage) return;
    const decisions = storage.getDecisions();

    const badge = document.getElementById('saved-decisions-badge');
    const navBadge = document.getElementById('nav-decisions-count');
    const tbody = document.getElementById('tbody-saved-decisions');

    if (badge) badge.textContent = `${decisions.length} Records`;
    if (navBadge) navBadge.textContent = decisions.length;
    if (!tbody) return;

    if (decisions.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 24px; color: var(--slate-500);">
            No saved decisions yet. Click "Save This Decision" from the dashboard analysis to record options.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = decisions.map(d => {
      return `
        <tr>
          <td>${d.date}</td>
          <td style="font-weight: 600;">${d.produceName}</td>
          <td>${d.quantity} kg</td>
          <td>${d.recommendedMarketName}</td>
          <td style="font-weight: 700; color: #166534;">${formatINR(d.expectedNetReturn)}</td>
          <td>
            <span class="table-badge ${d.status.includes('Sold') ? 'badge-high' : 'badge-med'}">
              ${d.status}
            </span>
          </td>
          <td>
            <div style="display: flex; gap: 6px;">
              <button type="button" class="btn btn-outline btn-sm btn-view-decision" data-decision-id="${d.id}" style="padding: 3px 8px; font-size: 0.76rem;">
                View
              </button>
              <button type="button" class="btn btn-danger-outline btn-sm btn-delete-decision" data-decision-id="${d.id}" style="padding: 3px 8px; font-size: 0.76rem;">
                Delete
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    tbody.querySelectorAll('.btn-delete-decision').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-decision-id');
        if (confirm("Are you sure you want to remove this saved selling decision?")) {
          storage.deleteDecision(id);
          renderSavedDecisions();
          populateFeedbackDecisionDropdown();
          showToast("Decision record removed successfully.", "info");
        }
      });
    });

    tbody.querySelectorAll('.btn-view-decision').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-decision-id');
        const decision = storage.getDecisionById(id);
        if (decision) {
          alert(`Decision Snapshot (${decision.date}):\n\nProduce: ${decision.produceName} (${decision.quantity} kg)\nMarket: ${decision.recommendedMarketName}\nExpected Net Return: ${formatINR(decision.expectedNetReturn)}\nStatus: ${decision.status}`);
        }
      });
    });
  }

  /**
   * Populate Feedback Link Dropdown
   */
  function populateFeedbackDecisionDropdown() {
    if (!storage) return;
    const dropdown = document.getElementById('feedback-select-decision');
    if (!dropdown) return;

    const decisions = storage.getDecisions();
    dropdown.innerHTML = `
      <option value="">-- Standalone Post-Sale Entry --</option>
      ${decisions.map(d => `<option value="${d.id}">#${d.id} — ${d.date} (${d.produceName}, ${d.quantity}kg at ${d.recommendedMarketName})</option>`).join('')}
    `;
  }

  /**
   * Render After-Selling Feedback History Table
   */
  function renderFeedbackHistory() {
    if (!storage) return;
    const list = storage.getFeedbackList();
    const tbody = document.getElementById('tbody-feedback-history');
    if (!tbody) return;

    if (!list || list.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; padding: 20px; color: var(--slate-500);">
            No post-sale actuals recorded yet.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = list.map(item => {
      const isPositive = (item.variance || 0) >= 0;
      return `
        <tr>
          <td>${item.date}</td>
          <td>
            <div style="font-weight: 600;">${item.marketName}</div>
            <div style="font-size: 0.74rem; color: var(--slate-500);">${item.produceName}</div>
          </td>
          <td style="font-weight: 600;">${formatINR(item.actualNetReturn)}</td>
          <td style="color: var(--slate-600);">${formatINR(item.estimatedNetReturn)}</td>
          <td>
            <span class="table-badge ${isPositive ? 'badge-high' : 'badge-risk-high'}">
              ${isPositive ? '+' : ''}${formatINR(item.variance)}
            </span>
          </td>
        </tr>
      `;
    }).join('');
  }

  /**
   * Initialize Controls & Dropdowns
   */
  function initControls() {
    try {
      // 1. Populate Produce Dropdowns
      if (data && data.produceTypes) {
        const produceOptionsHtml = data.produceTypes.map(p => {
          return `<option value="${p.id}">${p.name} (Base ₹${p.defaultPrice}/kg)</option>`;
        }).join('');

        const inputProduce = document.getElementById('input-produce');
        const surplusInputProduce = document.getElementById('surplus-input-produce');
        const selectTrendProduce = document.getElementById('select-trend-produce');

        if (inputProduce) inputProduce.innerHTML = produceOptionsHtml;
        if (surplusInputProduce) surplusInputProduce.innerHTML = produceOptionsHtml;
        if (selectTrendProduce) selectTrendProduce.innerHTML = produceOptionsHtml;
      }

      // 2. Populate Location Dropdowns
      if (data && data.vendorLocations) {
        const locationOptionsHtml = data.vendorLocations.map(l => {
          return `<option value="${l.id}">${l.name}</option>`;
        }).join('');

        const inputLocation = document.getElementById('input-location');
        const surplusInputLocation = document.getElementById('surplus-input-location');

        if (inputLocation) inputLocation.innerHTML = locationOptionsHtml;
        if (surplusInputLocation) surplusInputLocation.innerHTML = locationOptionsHtml;
      }

      // 3. Set Default Date
      const inputSellingDate = document.getElementById('input-selling-date');
      if (inputSellingDate) {
        const today = new Date();
        inputSellingDate.value = today.toISOString().split('T')[0];
      }

      // 4. Initial Run Analysis
      runAnalysis();

      // 5. Initial Price Trends
      if (trendsChart) {
        trendsChart.renderChart('price-trend-chart-container', 'tomato');
      }

      // 6. Initial Surplus Buyers
      runSurplusMatching();

      // 7. Initial Decisions & Feedback
      renderSavedDecisions();
      renderFeedbackHistory();
      populateFeedbackDecisionDropdown();
    } catch (e) {
      console.error("Error in initControls:", e);
    }
  }

  /**
   * Event Listeners Registration
   */
  function bindEvents() {
    try {
      // 1. Primary Tab Navigation (Both Delegation on Container and Direct on Tab)
      const navContainer = document.querySelector('.nav-container');
      if (navContainer) {
        navContainer.addEventListener('click', (e) => {
          const tab = e.target.closest('.nav-tab');
          if (tab) {
            const tabId = tab.getAttribute('data-tab');
            if (tabId) {
              switchTab(tabId);
            }
          }
        });
      }

      // Direct binding on each tab button
      document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', () => {
          const tabId = tab.getAttribute('data-tab');
          if (tabId) {
            switchTab(tabId);
          }
        });
      });

      // 2. Dashboard Form Submit
      const formProduceDetails = document.getElementById('form-produce-details');
      if (formProduceDetails) {
        formProduceDetails.addEventListener('submit', (e) => {
          e.preventDefault();
          const success = runAnalysis();
          if (success) {
            showToast("Selling options analysed successfully!", "success");
          }
        });
      }

      // 3. Save Decision Button
      const btnSaveDecision = document.getElementById('btn-save-decision');
      if (btnSaveDecision) {
        btnSaveDecision.addEventListener('click', handleSaveDecision);
      }

      // 4. Shortcut: View Full Comparison Table
      const btnViewAllComparison = document.getElementById('btn-view-all-comparison');
      if (btnViewAllComparison) {
        btnViewAllComparison.addEventListener('click', () => {
          switchTab('comparison');
        });
      }

      // 5. Detailed Breakdown of Top Option
      const btnViewRecBreakdown = document.getElementById('btn-view-rec-breakdown');
      if (btnViewRecBreakdown) {
        btnViewRecBreakdown.addEventListener('click', () => {
          if (currentAnalysis && currentAnalysis.recommendation) {
            openBreakdownModal(currentAnalysis.recommendation.market.marketId);
          }
        });
      }

      // 6. Comparison Sorting
      const selectSortMarket = document.getElementById('select-sort-market');
      if (selectSortMarket) {
        selectSortMarket.addEventListener('change', (e) => {
          currentSortCriteria = e.target.value;
          if (currentAnalysis && currentAnalysis.markets) {
            renderComparisonTable(currentAnalysis.markets);
          }
        });
      }

      // 7. Recalculate Button on Comparison
      const btnRecalculateAll = document.getElementById('btn-recalculate-all');
      if (btnRecalculateAll) {
        btnRecalculateAll.addEventListener('click', () => {
          runAnalysis();
          showToast("Market options recalculated.", "info");
        });
      }

      // 8. Trends Produce Selector
      const selectTrendProduce = document.getElementById('select-trend-produce');
      if (selectTrendProduce) {
        selectTrendProduce.addEventListener('change', (e) => {
          const selectedId = e.target.value;
          if (trendsChart) {
            trendsChart.renderChart('price-trend-chart-container', selectedId);
          }
        });
      }

      // 9. Surplus Matching Form
      const formSurplusMatching = document.getElementById('form-surplus-matching');
      if (formSurplusMatching) {
        formSurplusMatching.addEventListener('submit', (e) => {
          e.preventDefault();
          runSurplusMatching();
          showToast("Surplus buyer matches updated.", "info");
        });
      }

      // 10. Buyer Contact Modal Events
      const btnCloseBuyerModal = document.getElementById('btn-close-buyer-modal');
      const modalBuyerContact = document.getElementById('modal-buyer-contact');
      if (btnCloseBuyerModal && modalBuyerContact) {
        btnCloseBuyerModal.addEventListener('click', () => {
          modalBuyerContact.classList.remove('active');
        });
      }

      const formBuyerRequest = document.getElementById('form-buyer-request');
      if (formBuyerRequest) {
        formBuyerRequest.addEventListener('submit', (e) => {
          e.preventDefault();
          const buyerName = activeBuyerModalData ? activeBuyerModalData.businessName : "Buyer";
          if (modalBuyerContact) modalBuyerContact.classList.remove('active');
          showToast(`Request recorded successfully for ${buyerName}! (Logged in prototype session)`, "success");
        });
      }

      // 11. Cost Breakdown Modal Events
      const btnCloseBreakdownModal = document.getElementById('btn-close-breakdown-modal');
      const btnDismissBreakdown = document.getElementById('btn-dismiss-breakdown');
      const modalBreakdown = document.getElementById('modal-breakdown');

      if (btnCloseBreakdownModal && modalBreakdown) {
        btnCloseBreakdownModal.addEventListener('click', () => {
          modalBreakdown.classList.remove('active');
        });
      }
      if (btnDismissBreakdown && modalBreakdown) {
        btnDismissBreakdown.addEventListener('click', () => {
          modalBreakdown.classList.remove('active');
        });
      }

      // 12. Feedback Selection Auto-fill
      const feedbackSelectDecision = document.getElementById('feedback-select-decision');
      if (feedbackSelectDecision) {
        feedbackSelectDecision.addEventListener('change', (e) => {
          const decisionId = e.target.value;
          if (!decisionId || !storage) return;
          const dec = storage.getDecisionById(decisionId);
          if (dec) {
            const feedbackActualPrice = document.getElementById('feedback-actual-price');
            const feedbackActualQty = document.getElementById('feedback-actual-qty');
            const feedbackActualCosts = document.getElementById('feedback-actual-costs');

            if (feedbackActualPrice) feedbackActualPrice.value = dec.expectedPricePerKg;
            if (feedbackActualQty) feedbackActualQty.value = dec.quantity;
            if (feedbackActualCosts) feedbackActualCosts.value = Math.round(dec.transportCost + dec.otherCosts);
          }
        });
      }

      // 13. Feedback Form Submit
      const formAfterSelling = document.getElementById('form-after-selling');
      if (formAfterSelling) {
        formAfterSelling.addEventListener('submit', (e) => {
          e.preventDefault();

          const feedbackActualPrice = document.getElementById('feedback-actual-price');
          const feedbackActualQty = document.getElementById('feedback-actual-qty');
          const feedbackActualWastage = document.getElementById('feedback-actual-wastage');
          const feedbackActualCosts = document.getElementById('feedback-actual-costs');
          const feedbackNotes = document.getElementById('feedback-notes');
          const feedbackSelectDecisionEl = document.getElementById('feedback-select-decision');

          const price = Number(feedbackActualPrice ? feedbackActualPrice.value : 0);
          const qty = Number(feedbackActualQty ? feedbackActualQty.value : 0);
          const wastage = Number(feedbackActualWastage ? feedbackActualWastage.value : 0) || 0;
          const costs = Number(feedbackActualCosts ? feedbackActualCosts.value : 0) || 0;
          const notes = feedbackNotes ? feedbackNotes.value.trim() : '';
          const linkedDecisionId = feedbackSelectDecisionEl ? feedbackSelectDecisionEl.value : '';

          if (!price || price <= 0 || !qty || qty <= 0) {
            showToast("Please enter valid price and quantity values.", "info");
            return;
          }

          const actualGross = qty * price;
          const actualNet = actualGross - costs - (wastage * price);

          let estNet = actualNet;
          let marketName = "Salem Uzhavar Sandhai (Dadagapatti)";
          let produceName = "Fresh Produce";

          if (linkedDecisionId && storage) {
            const dec = storage.getDecisionById(linkedDecisionId);
            if (dec) {
              estNet = dec.expectedNetReturn;
              marketName = dec.recommendedMarketName;
              produceName = dec.produceName;
            }
          }

          const variance = Math.round((actualNet - estNet) * 100) / 100;

          if (storage) {
            storage.saveFeedback({
              decisionId: linkedDecisionId || null,
              date: new Date().toISOString().split('T')[0],
              produceName: produceName,
              marketName: marketName,
              actualPricePerKg: price,
              actualQtySold: qty,
              actualWastageKg: wastage,
              actualOtherCosts: costs,
              actualNetReturn: Math.round(actualNet * 100) / 100,
              estimatedNetReturn: estNet,
              variance: variance,
              notes: notes || "Post-sale vendor actuals."
            });
          }

          renderFeedbackHistory();
          renderSavedDecisions();
          formAfterSelling.reset();
          showToast("Feedback recorded successfully.", "success");
        });
      }

      // 14. Review 2: Bilingual Language Toggle
      const btnLangToggle = document.getElementById('btn-lang-toggle');
      if (btnLangToggle) {
        btnLangToggle.addEventListener('click', toggleLanguage);
      }

      // 15. Review 2: Live Sensitivity Sliders
      const sliderQty = document.getElementById('slider-quantity');
      if (sliderQty) {
        sliderQty.addEventListener('input', updateSensitivitySimulator);
      }
      const sliderPriceShift = document.getElementById('slider-price-shift');
      if (sliderPriceShift) {
        sliderPriceShift.addEventListener('input', updateSensitivitySimulator);
      }

      // 16. Review 2: Printable Sandhai Slip Modal Events
      const btnPrintSlip = document.getElementById('btn-print-slip');
      if (btnPrintSlip) {
        btnPrintSlip.addEventListener('click', openSandhaiSlipModal);
      }
      const modalSlip = document.getElementById('modal-sandhai-slip');
      const btnCloseSlipModal = document.getElementById('btn-close-slip-modal');
      const btnDismissSlip = document.getElementById('btn-dismiss-slip');
      const btnTriggerPrint = document.getElementById('btn-trigger-print');

      if (btnCloseSlipModal && modalSlip) {
        btnCloseSlipModal.addEventListener('click', () => modalSlip.classList.remove('active'));
      }
      if (btnDismissSlip && modalSlip) {
        btnDismissSlip.addEventListener('click', () => modalSlip.classList.remove('active'));
      }
      if (btnTriggerPrint) {
        btnTriggerPrint.addEventListener('click', () => {
          if (typeof window !== 'undefined' && window.print) {
            window.print();
          }
        });
      }
    } catch (e) {
      console.error("Error in bindEvents:", e);
    }
  }

  // Initialize application
  function initApp() {
    bindEvents();
    initControls();
  }

  // Support both DOMContentLoaded and immediate load if already ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }

})();
