/**
 * AI Smart Market Decision Assistant
 * Decision & Analytics Engine
 * 
 * Core Calculations:
 * - Selling Revenue = Quantity * Market Price
 * - Transport Cost = Distance * Transport Cost per km
 * - Wastage Quantity = Quantity * Wastage %
 * - Wastage Loss = Wastage Quantity * Market Price
 * - Estimated Net Return = Selling Revenue - Transport Cost - Other Costs - Wastage Loss
 */

(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    // Node.js test environment
    const { DEMO_DATA } = require('./data.js');
    module.exports = factory(DEMO_DATA);
  } else {
    // Browser environment
    const data = root.DEMO_DATA || (typeof window !== 'undefined' && window.DEMO_DATA) || (typeof globalThis !== 'undefined' && globalThis.DEMO_DATA);
    const engine = factory(data);
    root.MarketEngine = engine;
    if (typeof window !== 'undefined') {
      window.MarketEngine = engine;
    }
    if (typeof globalThis !== 'undefined') {
      globalThis.MarketEngine = engine;
    }
  }
})(typeof self !== 'undefined' ? self : this, function (DEMO_DATA) {
  'use strict';

  // Distance matrix (in km) from vendor starting points to each market
  const DISTANCE_MATRIX = {
    dadagapatti: {
      mkt_dadagapatti: 2.1,
      mkt_suramangalam: 8.4,
      mkt_hasthampatti: 6.8,
      mkt_shevapet: 4.5,
      mkt_attur: 48.0,
      mkt_omalur: 17.5
    },
    suramangalam: {
      mkt_dadagapatti: 8.2,
      mkt_suramangalam: 1.8,
      mkt_hasthampatti: 6.2,
      mkt_shevapet: 5.1,
      mkt_attur: 52.0,
      mkt_omalur: 14.0
    },
    ammapet: {
      mkt_dadagapatti: 5.5,
      mkt_suramangalam: 9.6,
      mkt_hasthampatti: 4.8,
      mkt_shevapet: 5.8,
      mkt_attur: 42.0,
      mkt_omalur: 19.0
    },
    shevapet: {
      mkt_dadagapatti: 4.2,
      mkt_suramangalam: 5.4,
      mkt_hasthampatti: 5.5,
      mkt_shevapet: 1.2,
      mkt_attur: 47.0,
      mkt_omalur: 16.5
    },
    hasthampatti: {
      mkt_dadagapatti: 7.0,
      mkt_suramangalam: 6.0,
      mkt_hasthampatti: 1.5,
      mkt_shevapet: 5.6,
      mkt_attur: 49.0,
      mkt_omalur: 15.0
    },
    omalur: {
      mkt_dadagapatti: 18.0,
      mkt_suramangalam: 14.5,
      mkt_hasthampatti: 16.0,
      mkt_shevapet: 17.0,
      mkt_attur: 62.0,
      mkt_omalur: 2.5
    }
  };

  /**
   * Helper: Round number safely to given decimals using Number.EPSILON to prevent IEEE 754 precision artifacts.
   * @param {number} val - Raw floating-point number
   * @param {number} [decimals=2] - Target decimal places
   * @returns {number} Rounded scalar value
   */
  function round(val, decimals = 2) {
    if (val === null || val === undefined || isNaN(val)) return 0;
    const factor = Math.pow(10, decimals);
    return Math.round((val + Number.EPSILON) * factor) / factor;
  }

  /**
   * Validate user input produce details with boundary enforcement.
   * Enforces positive kilograms, positive rates, and mandatory field selections.
   * 
   * @param {Object} inputs - Raw vendor form input object
   * @param {string} inputs.produceId - Unique commodity identifier (e.g. 'tomato')
   * @param {number|string} inputs.quantity - Total harvest volume in kilograms (1 to 100,000 kg)
   * @param {string} inputs.location - Starting vendor base identifier (e.g. 'dadagapatti')
   * @param {string} inputs.sellingDate - Dispatch date in YYYY-MM-DD format
   * @param {number|string} inputs.transportCostPerKm - Fuel / freight rate per kilometer in INR
   * @param {number|string} inputs.otherCosts - Incidental costs (bags, loading, porterage) in INR
   * @returns {{isValid: boolean, errors: Object.<string, string>}} Validation result and field-mapped error messages
   */
  function validateProduceInputs(inputs) {
    const errors = {};

    if (!inputs.produceId) {
      errors.produceId = "Please select a produce type.";
    }

    const qty = Number(inputs.quantity);
    if (inputs.quantity === "" || inputs.quantity === null || inputs.quantity === undefined || isNaN(qty)) {
      errors.quantity = "Please enter quantity in kilograms.";
    } else if (qty <= 0) {
      errors.quantity = "Quantity must be greater than 0 kg.";
    } else if (qty > 100000) {
      errors.quantity = "Quantity exceeds realistic single-trip capacity (max 100,000 kg).";
    }

    if (!inputs.location) {
      errors.location = "Please select your starting location.";
    }

    if (!inputs.sellingDate) {
      errors.sellingDate = "Please select an intended selling date.";
    }

    const transportRate = Number(inputs.transportCostPerKm);
    if (inputs.transportCostPerKm === "" || inputs.transportCostPerKm === null || isNaN(transportRate)) {
      errors.transportCostPerKm = "Please specify transport cost per km.";
    } else if (transportRate < 0) {
      errors.transportCostPerKm = "Transport cost cannot be negative.";
    }

    const otherCosts = Number(inputs.otherCosts);
    if (inputs.otherCosts === "" || inputs.otherCosts === null || isNaN(otherCosts)) {
      errors.otherCosts = "Please specify other incidental costs (or enter 0).";
    } else if (otherCosts < 0) {
      errors.otherCosts = "Other costs cannot be negative.";
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors: errors
    };
  }

  /**
   * Look up transit distance between a vendor starting point and a specific market destination.
   * Utilizes the Salem regional distance matrix with Dadagapatti as default baseline.
   * 
   * @param {string} vendorLocationId - Vendor origin ID ('dadagapatti', 'suramangalam', etc.)
   * @param {string} marketId - Destination market ID ('mkt_dadagapatti', 'mkt_attur', etc.)
   * @returns {number} Distance in kilometers
   */
  function getMarketDistance(vendorLocationId, marketId) {
    const locMap = DISTANCE_MATRIX[vendorLocationId] || DISTANCE_MATRIX.dadagapatti;
    if (locMap && typeof locMap[marketId] === 'number') {
      return locMap[marketId];
    }
    const market = DEMO_DATA && DEMO_DATA.markets ? DEMO_DATA.markets.find(m => m.id === marketId) : null;
    return market ? market.distanceKmFromDadagapatti : 5.0;
  }

  /**
   * Calculate precise financial metrics for a single market destination.
   * 
   * Mathematical Model:
   * 1. Selling Revenue = Quantity * Market Price
   * 2. Transport Cost = Distance (km) * Transport Rate (₹/km)
   * 3. Wastage % = Base Wastage % * Produce Perishability Factor * Distance Scaling
   * 4. Wastage Loss = (Quantity * Wastage %) * Market Price
   * 5. Estimated Net Return = Revenue - Transport Cost - Other Costs - Market Fee - Wastage Loss
   * 
   * @param {string} produceId - Unique commodity identifier
   * @param {number} quantity - Total harvest load in kg
   * @param {string} locationId - Origin base identifier
   * @param {number} transportCostPerKm - Rate per km in INR
   * @param {number} otherCosts - Incidental costs in INR
   * @param {Object} market - Market catalog entity
   * @returns {Object} Calculated financial breakdown object
   */
  function calculateMarketFinancials(produceId, quantity, locationId, transportCostPerKm, otherCosts, market) {
    const defaultProduce = { id: produceId, name: produceId, defaultPrice: 30, baseWastageFactor: 1.0 };
    const produce = (DEMO_DATA && DEMO_DATA.produceTypes ? DEMO_DATA.produceTypes.find(p => p.id === produceId) : null) || defaultProduce;
    const qty = Math.max(0, Number(quantity) || 0);
    const transportRate = Math.max(0, Number(transportCostPerKm) || 0);
    const extraCosts = Math.max(0, Number(otherCosts) || 0);

    // 1. Adjusted Market Price per kg
    const priceAdjustment = (market.basePriceAdjustments && market.basePriceAdjustments[produceId]) ? market.basePriceAdjustments[produceId] : 1.0;
    const marketPrice = round(produce.defaultPrice * priceAdjustment, 2);

    // 2. Distance and Transport Cost
    const distanceKm = getMarketDistance(locationId, market.id);
    const transportCost = round(distanceKm * transportRate, 2);

    // 3. Selling Revenue
    const sellingRevenue = round(qty * marketPrice, 2);

    // 4. Wastage % & Loss
    const perishFactor = produce.baseWastageFactor || 1.0;
    const distanceWastageScale = 1 + Math.max(0, (distanceKm - 5) * 0.02);
    const baseWastage = market.baseWastagePct || 3.0;
    const effectiveWastagePct = round(baseWastage * perishFactor * distanceWastageScale, 1);
    
    const wastageQuantity = round(qty * (effectiveWastagePct / 100), 2);
    const wastageLoss = round(wastageQuantity * marketPrice, 2);

    // 5. Total Incidental Costs for this market
    const marketIncidentalFee = market.marketFee || 0;
    const totalDeductionsExceptReturn = round(transportCost + extraCosts + marketIncidentalFee + wastageLoss, 2);

    // 6. Estimated Net Return
    const estimatedNetReturn = round(sellingRevenue - transportCost - extraCosts - marketIncidentalFee - wastageLoss, 2);

    // 7. Net Realized Price per kg after all costs
    const netReturnPerKg = qty > 0 ? round(estimatedNetReturn / qty, 2) : 0;

    return {
      marketId: market.id,
      marketName: market.name,
      marketTamilName: market.tamilName,
      marketType: market.type,
      operatingHours: market.operatingHours,
      demandLevel: market.demandLevel,
      climateRisk: market.climateRisk,
      highlights: market.highlights,
      distanceKm: distanceKm,
      produceId: produce.id,
      produceName: produce.name,
      quantityKg: qty,
      marketPricePerKg: marketPrice,
      sellingRevenue: sellingRevenue,
      transportCostPerKm: transportRate,
      transportCost: transportCost,
      otherCosts: extraCosts,
      marketFee: marketIncidentalFee,
      effectiveWastagePct: effectiveWastagePct,
      wastageQuantityKg: wastageQuantity,
      wastageLoss: wastageLoss,
      totalCostsAndLosses: totalDeductionsExceptReturn,
      estimatedNetReturn: estimatedNetReturn,
      netReturnPerKg: netReturnPerKg
    };
  }

  /**
   * Run multi-criteria decision analysis across all available regional markets.
   * 
   * Multi-Criteria Utility Formulation:
   * U_i = w_r * Score_Return(i) + w_d * Score_Demand(i) + w_s * Score_Safety(i)
   * where:
   * - w_r = 0.70 (Weight on Net Realized Return)
   * - w_d = 0.15 (Weight on Footfall Demand absorption)
   * - w_s = 0.15 (Weight on Perishable & Climate Risk mitigation)
   * 
   * @param {Object} inputs - User input parameters
   * @returns {{success: boolean, inputs?: Object, markets: Array<Object>, recommendation: Object|null, validation?: Object}}
   */
  function analyzeSellingOptions(inputs) {
    const validation = validateProduceInputs(inputs);
    if (!validation.isValid) {
      return {
        success: false,
        validation: validation,
        markets: [],
        recommendation: null
      };
    }

    const { produceId, quantity, location, transportCostPerKm, otherCosts, sellingDate } = inputs;
    const qty = Number(quantity);
    const rate = Number(transportCostPerKm);
    const other = Number(otherCosts);

    const marketsList = (DEMO_DATA && DEMO_DATA.markets) ? DEMO_DATA.markets : [];

    // Calculate financials for all markets
    const evaluatedMarkets = marketsList.map(market => {
      return calculateMarketFinancials(produceId, qty, location, rate, other, market);
    });

    if (evaluatedMarkets.length === 0) {
      return {
        success: false,
        validation: { isValid: false, errors: { general: "No market data available." } },
        markets: [],
        recommendation: null
      };
    }

    // Score & Rank Markets using Multi-Criteria Evaluation:
    const returns = evaluatedMarkets.map(m => m.estimatedNetReturn);
    const maxReturn = Math.max(...returns);
    const minReturn = Math.min(...returns);
    const returnSpan = maxReturn - minReturn > 0 ? maxReturn - minReturn : 1;

    evaluatedMarkets.forEach(m => {
      const returnScore = Math.max(0, ((m.estimatedNetReturn - minReturn) / returnSpan) * 100);

      let demandScore = 50;
      if (m.demandLevel === "High") demandScore = 100;
      else if (m.demandLevel === "Moderate") demandScore = 65;
      else if (m.demandLevel === "Fair") demandScore = 40;

      let riskScore = 80;
      if (m.climateRisk === "Low") riskScore += 15;
      else if (m.climateRisk === "High") riskScore -= 25;
      riskScore -= Math.min(30, m.effectiveWastagePct * 4);
      riskScore = Math.max(10, Math.min(100, riskScore));

      m.compositeScore = round(0.70 * returnScore + 0.15 * demandScore + 0.15 * riskScore, 1);
    });

    // Sort default descending by compositeScore
    evaluatedMarkets.sort((a, b) => b.compositeScore - a.compositeScore);

    // Identify top recommended market
    const topMarket = evaluatedMarkets[0];

    const whyReasons = [
      `Higher estimated net return (₹${topMarket.estimatedNetReturn.toLocaleString('en-IN')}, approx. ₹${topMarket.netReturnPerKg}/kg net)`,
      `Transport cost accounted for (${topMarket.distanceKm} km transit, ₹${topMarket.transportCost.toLocaleString('en-IN')})`,
      `${topMarket.demandLevel} consumer buyer demand during morning sandhai hours`,
      `Manageable climate & perishable risk (${topMarket.effectiveWastagePct}% estimated transit wastage)`
    ];

    if (topMarket.marketFee === 0) {
      whyReasons.push("Zero administrative middleman stall cess / direct farmer privileges");
    }

    const prodInfo = DEMO_DATA && DEMO_DATA.produceTypes ? DEMO_DATA.produceTypes.find(p => p.id === produceId) : null;
    const locInfo = DEMO_DATA && DEMO_DATA.vendorLocations ? DEMO_DATA.vendorLocations.find(l => l.id === location) : null;

    return {
      success: true,
      inputs: {
        produceId,
        produceName: prodInfo?.name || produceId,
        quantity: qty,
        location,
        locationName: locInfo?.name || location,
        transportCostPerKm: rate,
        otherCosts: other,
        sellingDate
      },
      markets: evaluatedMarkets,
      recommendation: {
        market: topMarket,
        whyReasons: whyReasons,
        disclaimerNotice: "Recommended option based on current demo inputs. Estimate — actual market conditions may differ."
      }
    };
  }

  /**
   * Sort evaluated market objects by specified financial or geographical criterion.
   * 
   * @param {Array<Object>} markets - Evaluated market financial records
   * @param {('netReturn'|'price'|'transport'|'distance'|'score')} sortBy - Criterion key
   * @param {('desc'|'asc')} [direction='desc'] - Sort direction
   * @returns {Array<Object>} Reordered shallow copy of market list
   */
  function sortMarkets(markets, sortBy, direction = 'desc') {
    const list = [...markets];
    list.sort((a, b) => {
      let valA, valB;
      switch (sortBy) {
        case 'price':
          valA = a.marketPricePerKg;
          valB = b.marketPricePerKg;
          break;
        case 'transport':
          valA = a.transportCost;
          valB = b.transportCost;
          break;
        case 'netReturn':
          valA = a.estimatedNetReturn;
          valB = b.estimatedNetReturn;
          break;
        case 'distance':
          valA = a.distanceKm;
          valB = b.distanceKm;
          break;
        case 'score':
        default:
          valA = a.compositeScore || a.estimatedNetReturn;
          valB = b.compositeScore || b.estimatedNetReturn;
          break;
      }
      return direction === 'asc' ? valA - valB : valB - valA;
    });
    return list;
  }

  /**
   * Match surplus harvest lots to registered commercial buyers using normalized attribute distance.
   * 
   * Similarity Scoring Model:
   * Match% = clamp(round(0.55 * QtyScore + 0.35 * DistanceScore + 0.10 * CategoryWeight), 48%, 98%)
   * where:
   * - QtyScore = 1 - (|Q_avail - Q_target| / (max(Q_avail, Q_target) * 1.2))
   * - DistanceScore = max(0.2, 1 - (dist / 20 km))
   * 
   * @param {string} produceId - Commodity identifier
   * @param {number} availableQty - Harvest surplus volume in kg
   * @param {string} vendorLocationId - Vendor origin ID
   * @returns {Array<Object>} Ranked list of matching buyer candidates with match percentage
   */
  function matchSurplusBuyers(produceId, availableQty, vendorLocationId) {
    const qty = Math.max(0, Number(availableQty) || 0);
    const defaultProduce = { id: produceId, name: produceId, defaultPrice: 30 };
    const produce = (DEMO_DATA && DEMO_DATA.produceTypes ? DEMO_DATA.produceTypes.find(p => p.id === produceId) : null) || defaultProduce;

    if (qty <= 0) {
      return [];
    }

    const matches = [];
    const buyersList = (DEMO_DATA && DEMO_DATA.surplusBuyers) ? DEMO_DATA.surplusBuyers : [];

    buyersList.forEach(buyer => {
      const acceptsProduce = buyer.acceptedProduce && buyer.acceptedProduce.includes(produceId);
      if (!acceptsProduce) {
        return;
      }

      const reqQty = (buyer.preferredDailyQty && buyer.preferredDailyQty[produceId]) ? buyer.preferredDailyQty[produceId] : 50;

      const qtyDiff = Math.abs(qty - reqQty);
      const maxQty = Math.max(qty, reqQty);
      const qtyMatchScore = Math.max(0, 1 - (qtyDiff / (maxQty * 1.2)));

      const dist = buyer.distanceKmFromDadagapatti || 5.0;
      const distScore = Math.max(0.2, 1 - (dist / 20));

      let categoryFactor = 0.9;
      if (buyer.category === "Restaurant" || buyer.category === "Restaurant & Catering") categoryFactor = 1.0;
      else if (buyer.category === "Modern Retailer") categoryFactor = 0.95;
      else if (buyer.category === "Institutional Mess") categoryFactor = 0.88;

      const compositeMatch = Math.round((0.55 * qtyMatchScore + 0.35 * distScore + 0.10 * categoryFactor) * 100);
      const matchPercentage = Math.min(98, Math.max(48, compositeMatch));

      const baselinePrice = produce.defaultPrice || 30;
      const offeredPrice = round(baselinePrice * (buyer.offeredPriceAdjustment || 0.95), 2);
      const totalEstimatedValue = round(qty * offeredPrice, 2);

      matches.push({
        buyerId: buyer.id,
        businessName: buyer.businessName,
        category: buyer.category,
        contactPerson: buyer.contactPerson,
        phoneDemo: buyer.phoneDemo,
        location: buyer.location,
        distanceKm: dist,
        requiredProduceId: produceId,
        requiredProduceName: produce.name,
        targetDailyQtyKg: reqQty,
        vendorAvailableQtyKg: qty,
        matchPercentage: matchPercentage,
        qualityRequirement: buyer.qualityRequirement,
        paymentTerms: buyer.paymentTerms,
        offeredPricePerKg: offeredPrice,
        totalEstimatedValue: totalEstimatedValue
      });
    });

    matches.sort((a, b) => b.matchPercentage - a.matchPercentage);
    return matches;
  }

  // Public API
  return {
    round,
    validateProduceInputs,
    getMarketDistance,
    calculateMarketFinancials,
    analyzeSellingOptions,
    sortMarkets,
    matchSurplusBuyers
  };
});
