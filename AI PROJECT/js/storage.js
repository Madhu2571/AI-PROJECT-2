/**
 * AI Smart Market Decision Assistant
 * LocalStorage & Data Persistence Layer
 * 
 * Manages:
 * - Saved Selling Decisions
 * - After-Selling Actual Feedback Records
 * - Pre-seeded demo records for realistic initial prototype state
 */

(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
  } else {
    const storage = factory();
    root.MarketStorage = storage;
    if (typeof window !== 'undefined') {
      window.MarketStorage = storage;
    }
    if (typeof globalThis !== 'undefined') {
      globalThis.MarketStorage = storage;
    }
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const STORAGE_KEYS = {
    DECISIONS: 'agy_market_saved_decisions_v1',
    FEEDBACK: 'agy_market_post_sale_feedback_v1',
    INITIALIZED: 'agy_market_demo_initialized_v1'
  };

  const INITIAL_DEMO_DECISIONS = [
    {
      id: "dec_1726561200",
      date: "2026-09-16",
      produceId: "tomato",
      produceName: "Tomato (தக்காளி)",
      quantity: 120,
      location: "dadagapatti",
      locationName: "Dadagapatti, Salem South",
      recommendedMarketId: "mkt_dadagapatti",
      recommendedMarketName: "Salem Uzhavar Sandhai (Dadagapatti)",
      expectedPricePerKg: 33.6,
      expectedRevenue: 4032,
      transportCost: 25.2,
      otherCosts: 180,
      wastageLoss: 80.64,
      expectedNetReturn: 3746.16,
      status: "Sold / Completed",
      notes: "Early morning batch at stall 14. Sold out by 09:45 AM."
    },
    {
      id: "dec_1726474800",
      date: "2026-09-14",
      produceId: "onion",
      produceName: "Small Onion / Shallot (சின்ன வெங்காயம்)",
      quantity: 80,
      location: "dadagapatti",
      locationName: "Dadagapatti, Salem South",
      recommendedMarketId: "mkt_suramangalam",
      recommendedMarketName: "Salem Uzhavar Sandhai (Suramangalam)",
      expectedPricePerKg: 56.16,
      expectedRevenue: 4492.8,
      transportCost: 84.0,
      otherCosts: 150,
      wastageLoss: 43.13,
      expectedNetReturn: 4215.67,
      status: "Sold / Completed",
      notes: "High retail demand near railway junction."
    },
    {
      id: "dec_1726388400",
      date: "2026-09-12",
      produceId: "carrot",
      produceName: "Carrot (கேரட்)",
      quantity: 90,
      location: "dadagapatti",
      locationName: "Dadagapatti, Salem South",
      recommendedMarketId: "mkt_hasthampatti",
      recommendedMarketName: "Salem Uzhavar Sandhai (Hasthampatti)",
      expectedPricePerKg: 45.78,
      expectedRevenue: 4120.2,
      transportCost: 68.0,
      otherCosts: 160,
      wastageLoss: 74.16,
      expectedNetReturn: 3818.04,
      status: "Sold / Completed",
      notes: "Good price realization for grade-A Nilgiris variety."
    }
  ];

  const INITIAL_DEMO_FEEDBACK = [
    {
      id: "fb_1726564800",
      decisionId: "dec_1726561200",
      date: "2026-09-16",
      produceName: "Tomato (தக்காளி)",
      marketName: "Salem Uzhavar Sandhai (Dadagapatti)",
      actualPricePerKg: 34.0,
      actualQtySold: 118,
      actualWastageKg: 2.0,
      actualOtherCosts: 180,
      actualNetReturn: 3806.8,
      estimatedNetReturn: 3746.16,
      variance: 60.64,
      notes: "Firm quality helped achieve ₹34/kg. Quick morning clearance."
    },
    {
      id: "fb_1726478400",
      decisionId: "dec_1726474800",
      date: "2026-09-14",
      produceName: "Small Onion (சின்ன வெங்காயம்)",
      marketName: "Salem Uzhavar Sandhai (Suramangalam)",
      actualPricePerKg: 55.5,
      actualQtySold: 79,
      actualWastageKg: 1.0,
      actualOtherCosts: 150,
      actualNetReturn: 4150.5,
      estimatedNetReturn: 4215.67,
      variance: -65.17,
      notes: "Slight downward pressure due to more arrivals from Dindigul."
    }
  ];

  function isLocalStorageAvailable() {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return false;
      const testKey = '__test_storage__';
      window.localStorage.setItem(testKey, '1');
      window.localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
  }

  let memoryDecisions = [...INITIAL_DEMO_DECISIONS];
  let memoryFeedback = [...INITIAL_DEMO_FEEDBACK];

  function initialize() {
    if (!isLocalStorageAvailable()) return;

    try {
      const hasInit = window.localStorage.getItem(STORAGE_KEYS.INITIALIZED);
      if (!hasInit) {
        window.localStorage.setItem(STORAGE_KEYS.DECISIONS, JSON.stringify(INITIAL_DEMO_DECISIONS));
        window.localStorage.setItem(STORAGE_KEYS.FEEDBACK, JSON.stringify(INITIAL_DEMO_FEEDBACK));
        window.localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
      }
    } catch (e) {
      console.warn("Storage initialize error:", e);
    }
  }

  initialize();

  function getDecisions() {
    if (isLocalStorageAvailable()) {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEYS.DECISIONS);
        if (raw) return JSON.parse(raw);
      } catch (e) {
        console.error("Failed to parse saved decisions from storage:", e);
      }
    }
    return memoryDecisions;
  }

  function saveDecision(decision) {
    const decisions = getDecisions();
    const newDecision = {
      id: "dec_" + Date.now(),
      createdTimestamp: Date.now(),
      ...decision
    };
    decisions.unshift(newDecision);

    if (isLocalStorageAvailable()) {
      try {
        window.localStorage.setItem(STORAGE_KEYS.DECISIONS, JSON.stringify(decisions));
      } catch (e) {
        console.error("Failed to save decision to storage:", e);
      }
    } else {
      memoryDecisions = decisions;
    }
    return newDecision;
  }

  function deleteDecision(id) {
    let decisions = getDecisions();
    const initialLen = decisions.length;
    decisions = decisions.filter(d => d.id !== id);

    if (isLocalStorageAvailable()) {
      try {
        window.localStorage.setItem(STORAGE_KEYS.DECISIONS, JSON.stringify(decisions));
      } catch (e) {
        console.error("Failed to update decisions after delete:", e);
      }
    } else {
      memoryDecisions = decisions;
    }
    return decisions.length < initialLen;
  }

  function getDecisionById(id) {
    const decisions = getDecisions();
    return decisions.find(d => d.id === id) || null;
  }

  function getFeedbackList() {
    if (isLocalStorageAvailable()) {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEYS.FEEDBACK);
        if (raw) return JSON.parse(raw);
      } catch (e) {
        console.error("Failed to parse feedback list from storage:", e);
      }
    }
    return memoryFeedback;
  }

  function saveFeedback(feedback) {
    const feedbackList = getFeedbackList();
    const newFeedback = {
      id: "fb_" + Date.now(),
      timestamp: Date.now(),
      ...feedback
    };
    feedbackList.unshift(newFeedback);

    if (isLocalStorageAvailable()) {
      try {
        window.localStorage.setItem(STORAGE_KEYS.FEEDBACK, JSON.stringify(feedbackList));
      } catch (e) {
        console.error("Failed to save feedback to storage:", e);
      }
    } else {
      memoryFeedback = feedbackList;
    }

    if (feedback.decisionId) {
      updateDecisionStatus(feedback.decisionId, "Feedback Recorded");
    }

    return newFeedback;
  }

  function updateDecisionStatus(decisionId, newStatus) {
    const decisions = getDecisions();
    const target = decisions.find(d => d.id === decisionId);
    if (target) {
      target.status = newStatus;
      if (isLocalStorageAvailable()) {
        try {
          window.localStorage.setItem(STORAGE_KEYS.DECISIONS, JSON.stringify(decisions));
        } catch (e) {
          console.error("Failed to update decision status:", e);
        }
      }
    }
  }

  function resetToDefaults() {
    if (isLocalStorageAvailable()) {
      window.localStorage.setItem(STORAGE_KEYS.DECISIONS, JSON.stringify(INITIAL_DEMO_DECISIONS));
      window.localStorage.setItem(STORAGE_KEYS.FEEDBACK, JSON.stringify(INITIAL_DEMO_FEEDBACK));
    }
    memoryDecisions = [...INITIAL_DEMO_DECISIONS];
    memoryFeedback = [...INITIAL_DEMO_FEEDBACK];
  }

  return {
    getDecisions,
    saveDecision,
    deleteDecision,
    getDecisionById,
    getFeedbackList,
    saveFeedback,
    updateDecisionStatus,
    resetToDefaults
  };
});
