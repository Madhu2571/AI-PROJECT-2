/**
 * AI Smart Market Decision Assistant
 * Demo Dataset based on Salem Uzhavar Sandhai, Dadagapatti Field Study
 * 
 * DISCLAIMER:
 * Demo Data — Prototype Demonstration.
 * All prices, transport estimates, and buyer requirements are realistic 
 * representations for prototype evaluation, not live commodity exchange feeds.
 */

(function (root, factory) {
  const data = factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DEMO_DATA: data };
  }
  root.DEMO_DATA = data;
  if (typeof window !== 'undefined') {
    window.DEMO_DATA = data;
  }
  if (typeof globalThis !== 'undefined') {
    globalThis.DEMO_DATA = data;
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  return {
    meta: {
      title: "AI Smart Market Decision Assistant",
      fieldStudyContext: "Salem Uzhavar Sandhai, Dadagapatti (Tamil Nadu)",
      disclaimer: "Demo Data — Prototype Demonstration. Actual market prices fluctuate daily based on arrivals, auction dynamics, and seasonal factors."
    },

    // Locations available for vendor starting point
    vendorLocations: [
      { id: "dadagapatti", name: "Dadagapatti, Salem South" },
      { id: "suramangalam", name: "Suramangalam, Salem West" },
      { id: "ammapet", name: "Ammapet, Salem East" },
      { id: "shevapet", name: "Shevapet / Leigh Bazaar" },
      { id: "hasthampatti", name: "Hasthampatti, Salem North" },
      { id: "omalur", name: "Omalur Rural Belt" }
    ],

    // Produce types with baseline attributes
    produceTypes: [
      {
        id: "tomato",
        name: "Tomato (தக்காளி)",
        category: "Perishable Vegetable",
        defaultPrice: 32, // ₹ / kg baseline
        perishability: "High",
        baseWastageFactor: 1.0, // multiplier
        unit: "kg"
      },
      {
        id: "onion",
        name: "Small Onion / Shallot (சின்ன வெங்காயம்)",
        category: "Semi-Perishable Vegetable",
        defaultPrice: 54,
        perishability: "Low",
        baseWastageFactor: 0.4,
        unit: "kg"
      },
      {
        id: "potato",
        name: "Potato (உருளைக்கிழங்கு)",
        category: "Root Vegetable",
        defaultPrice: 28,
        perishability: "Low",
        baseWastageFactor: 0.3,
        unit: "kg"
      },
      {
        id: "carrot",
        name: "Carrot (கேரட்)",
        category: "Root Vegetable",
        defaultPrice: 42,
        perishability: "Medium",
        baseWastageFactor: 0.6,
        unit: "kg"
      },
      {
        id: "brinjal",
        name: "Brinjal / Eggplant (கத்தரிக்காய்)",
        category: "Perishable Vegetable",
        defaultPrice: 36,
        perishability: "High",
        baseWastageFactor: 0.9,
        unit: "kg"
      },
      {
        id: "cabbage",
        name: "Cabbage (முட்டைக்கோஸ்)",
        category: "Leafy / Perishable",
        defaultPrice: 22,
        perishability: "Medium",
        baseWastageFactor: 0.7,
        unit: "kg"
      },
      {
        id: "green_chilli",
        name: "Green Chilli (பச்சை மிளகாய்)",
        category: "Spices / Perishable",
        defaultPrice: 48,
        perishability: "Medium",
        baseWastageFactor: 0.5,
        unit: "kg"
      }
    ],

    // Regional Markets around Salem
    markets: [
      {
        id: "mkt_dadagapatti",
        name: "Salem Uzhavar Sandhai (Dadagapatti)",
        tamilName: "தாதகாப்பட்டி உழவர் சந்தை",
        type: "Direct Farmer-Consumer Market",
        distanceKmFromDadagapatti: 2.1,
        operatingHours: "05:00 AM - 11:30 AM",
        basePriceAdjustments: {
          tomato: 1.05,
          onion: 1.02,
          potato: 1.00,
          carrot: 1.06,
          brinjal: 1.04,
          cabbage: 1.05,
          green_chilli: 1.08
        },
        baseWastagePct: 2.0,
        demandLevel: "High",
        climateRisk: "Low",
        highlights: [
          "Direct consumer retail pricing without middlemen commission",
          "Very low transit distance & minimal transit bruising",
          "Strong early-morning household buyer footfall"
        ],
        marketFee: 0
      },
      {
        id: "mkt_suramangalam",
        name: "Salem Uzhavar Sandhai (Suramangalam)",
        tamilName: "சூரமங்கலம் உழவர் சந்தை",
        type: "Direct Farmer-Consumer Market",
        distanceKmFromDadagapatti: 8.4,
        operatingHours: "05:30 AM - 12:00 PM",
        basePriceAdjustments: {
          tomato: 1.08,
          onion: 1.04,
          potato: 1.03,
          carrot: 1.07,
          brinjal: 1.02,
          cabbage: 1.04,
          green_chilli: 1.05
        },
        baseWastagePct: 3.2,
        demandLevel: "High",
        climateRisk: "Low",
        highlights: [
          "Suburban railway junction consumer catchment area",
          "Higher willingness-to-pay for graded fresh produce",
          "Covered sheds with organized weighing stations"
        ],
        marketFee: 0
      },
      {
        id: "mkt_hasthampatti",
        name: "Salem Uzhavar Sandhai (Hasthampatti)",
        tamilName: "ஹஸ்தம்பட்டி உழவர் சந்தை",
        type: "Direct Farmer-Consumer Market",
        distanceKmFromDadagapatti: 6.8,
        operatingHours: "06:00 AM - 11:30 AM",
        basePriceAdjustments: {
          tomato: 1.06,
          onion: 1.03,
          potato: 1.02,
          carrot: 1.09,
          brinjal: 1.05,
          cabbage: 1.02,
          green_chilli: 1.04
        },
        baseWastagePct: 2.8,
        demandLevel: "Moderate",
        climateRisk: "Low",
        highlights: [
          "Premium residential locality with steady morning demand",
          "Stable retail rates for fresh cooking vegetables",
          "Quick stall turnaround"
        ],
        marketFee: 0
      },
      {
        id: "mkt_shevapet",
        name: "Shevapet Wholesale Mandi (Leigh Bazaar)",
        tamilName: "செவ்வாய்ப்பேட்டை மொத்த மண்டி",
        type: "Wholesale Trader Auction",
        distanceKmFromDadagapatti: 4.5,
        operatingHours: "03:30 AM - 09:00 AM",
        basePriceAdjustments: {
          tomato: 0.86,
          onion: 0.88,
          potato: 0.90,
          carrot: 0.87,
          brinjal: 0.85,
          cabbage: 0.84,
          green_chilli: 0.88
        },
        baseWastagePct: 4.5,
        demandLevel: "High",
        climateRisk: "Medium",
        highlights: [
          "Immediate wholesale bulk liquidation capability",
          "Commission and loading deductions apply",
          "Prices fluctuate rapidly with outstation lorry arrivals"
        ],
        marketFee: 75
      },
      {
        id: "mkt_attur",
        name: "Attur Regulated Agricultural Market",
        tamilName: "ஆத்தூர் ஒழுங்குமுறை விற்பனைக்கூடம்",
        type: "Semi-Wholesale & Regulated Hub",
        distanceKmFromDadagapatti: 48.0,
        operatingHours: "06:00 AM - 02:00 PM",
        basePriceAdjustments: {
          tomato: 0.92,
          onion: 0.94,
          potato: 0.93,
          carrot: 0.91,
          brinjal: 0.92,
          cabbage: 0.90,
          green_chilli: 0.95
        },
        baseWastagePct: 7.2,
        demandLevel: "Moderate",
        climateRisk: "High",
        highlights: [
          "High absorption for large harvest surpluses (500kg+)",
          "Extended transit distance increases fuel and wastage loss",
          "Electronic weighing and regulated market committee monitoring"
        ],
        marketFee: 60
      },
      {
        id: "mkt_omalur",
        name: "Omalur Weekly Sandhai",
        tamilName: "ஓமலூர் வாரச் சந்தை",
        type: "Periodic Rural/Semi-Urban Sandhai",
        distanceKmFromDadagapatti: 17.5,
        operatingHours: "07:00 AM - 01:00 PM",
        basePriceAdjustments: {
          tomato: 0.97,
          onion: 1.01,
          potato: 0.98,
          carrot: 0.96,
          brinjal: 1.01,
          cabbage: 0.97,
          green_chilli: 1.02
        },
        baseWastagePct: 4.8,
        demandLevel: "Moderate",
        climateRisk: "Medium",
        highlights: [
          "Good demand on weekly market cycle days",
          "Mix of small retailers and local household buyers",
          "Moderate transit distance from Salem south"
        ],
        marketFee: 40
      }
    ],

    // Climate and Weather Condition Scenarios for Salem
    climateProfiles: {
      current: {
        location: "Salem Urban / Dadagapatti",
        temperature: "29°C",
        humidity: "74%",
        condition: "Partly Cloudy with Afternoon Warmth",
        riskLevel: "Medium",
        forecastNote: "High midday temperatures increase transit dehydration risk for leafy vegetables and vine-ripened tomatoes. Morning sales (before 10:30 AM) minimize wastage loss.",
        possibleImpact: "Changing weather conditions may affect supply and market conditions."
      },
      rainy: {
        location: "Salem Region",
        temperature: "25°C",
        humidity: "88%",
        condition: "Moderate Showers Expected",
        riskLevel: "High",
        forecastNote: "Wet ground conditions slow retail footfall; moisture increases fungal rot risk if produce is packed wet in gunny bags.",
        possibleImpact: "Localized precipitation may delay transport and reduce outdoor consumer foot traffic."
      },
      dry_cool: {
        location: "Salem Region",
        temperature: "24°C",
        humidity: "58%",
        condition: "Mild & Clear Morning",
        riskLevel: "Low",
        forecastNote: "Optimal weather for open-air marketing and longer shelf stability.",
        possibleImpact: "Steady weather supports consistent consumer turnout and low transit spoilage."
      }
    },

    // Historical Price Trends (10 days historical, today, and 3-day short-term demo trend)
    priceTrends: {
      tomato: {
        produceName: "Tomato (தக்காளி)",
        unit: "₹ / kg",
        days: ["Sep 08", "Sep 09", "Sep 10", "Sep 11", "Sep 12", "Sep 13", "Sep 14", "Sep 15", "Sep 16", "Sep 17", "Sep 18 (Today)", "Sep 19 (Est.)", "Sep 20 (Est.)", "Sep 21 (Est.)"],
        historical: [26, 27, 28, 30, 31, 29, 30, 31, 33, 32, 32],
        forecast: [null, null, null, null, null, null, null, null, null, null, 32, 34, 35, 33],
        trendDirection: "Slight Upward (+6.2%)",
        trendRationale: "Incoming arrivals from Rayakottai and Hosur belts expected to tighten slightly over the next 48 hours.",
        minPrice: 26,
        maxPrice: 35,
        avgPrice: 30.6
      },
      onion: {
        produceName: "Small Onion (சின்ன வெங்காயம்)",
        unit: "₹ / kg",
        days: ["Sep 08", "Sep 09", "Sep 10", "Sep 11", "Sep 12", "Sep 13", "Sep 14", "Sep 15", "Sep 16", "Sep 17", "Sep 18 (Today)", "Sep 19 (Est.)", "Sep 20 (Est.)", "Sep 21 (Est.)"],
        historical: [58, 57, 56, 56, 55, 54, 55, 54, 53, 54, 54],
        forecast: [null, null, null, null, null, null, null, null, null, null, 54, 53, 52, 52],
        trendDirection: "Stable / Slight Downward (-3.7%)",
        trendRationale: "Fresh harvest supplies arriving steadily from Perambalur and Dindigul producing pockets.",
        minPrice: 52,
        maxPrice: 58,
        avgPrice: 54.5
      },
      potato: {
        produceName: "Potato (உருளைக்கிழங்கு)",
        unit: "₹ / kg",
        days: ["Sep 08", "Sep 09", "Sep 10", "Sep 11", "Sep 12", "Sep 13", "Sep 14", "Sep 15", "Sep 16", "Sep 17", "Sep 18 (Today)", "Sep 19 (Est.)", "Sep 20 (Est.)", "Sep 21 (Est.)"],
        historical: [27, 27, 28, 28, 28, 29, 28, 29, 28, 28, 28],
        forecast: [null, null, null, null, null, null, null, null, null, null, 28, 28, 29, 29],
        trendDirection: "Stable (±1.5%)",
        trendRationale: "Cold storage supplies from Mettupalayam and Hassan maintaining steady price equilibrium.",
        minPrice: 27,
        maxPrice: 29,
        avgPrice: 28.1
      },
      carrot: {
        produceName: "Carrot (கேரட்)",
        unit: "₹ / kg",
        days: ["Sep 08", "Sep 09", "Sep 10", "Sep 11", "Sep 12", "Sep 13", "Sep 14", "Sep 15", "Sep 16", "Sep 17", "Sep 18 (Today)", "Sep 19 (Est.)", "Sep 20 (Est.)", "Sep 21 (Est.)"],
        historical: [38, 39, 40, 42, 44, 43, 42, 41, 43, 42, 42],
        forecast: [null, null, null, null, null, null, null, null, null, null, 42, 44, 45, 46],
        trendDirection: "Upward (+7.1%)",
        trendRationale: "Intermittent Ooty hill rains causing minor supply transit delays to plains mandis.",
        minPrice: 38,
        maxPrice: 46,
        avgPrice: 42.1
      },
      brinjal: {
        produceName: "Brinjal (கத்தரிக்காய்)",
        unit: "₹ / kg",
        days: ["Sep 08", "Sep 09", "Sep 10", "Sep 11", "Sep 12", "Sep 13", "Sep 14", "Sep 15", "Sep 16", "Sep 17", "Sep 18 (Today)", "Sep 19 (Est.)", "Sep 20 (Est.)"],
        historical: [32, 33, 34, 35, 36, 35, 37, 36, 35, 36, 36],
        forecast: [null, null, null, null, null, null, null, null, null, null, 36, 37, 38, 37],
        trendDirection: "Slight Upward (+2.8%)",
        trendRationale: "Consistent local culinary demand across Salem restaurants and catering clusters.",
        minPrice: 32,
        maxPrice: 38,
        avgPrice: 35.4
      },
      cabbage: {
        produceName: "Cabbage (முட்டைக்கோஸ்)",
        unit: "₹ / kg",
        days: ["Sep 08", "Sep 09", "Sep 10", "Sep 11", "Sep 12", "Sep 13", "Sep 14", "Sep 15", "Sep 16", "Sep 17", "Sep 18 (Today)", "Sep 19 (Est.)", "Sep 20 (Est.)"],
        historical: [20, 21, 21, 22, 23, 22, 21, 22, 23, 22, 22],
        forecast: [null, null, null, null, null, null, null, null, null, null, 22, 23, 23, 22],
        trendDirection: "Stable (±0.0%)",
        trendRationale: "Plentiful arrivals from Talavadi and Hosur meeting daily institutional procurement demands.",
        minPrice: 20,
        maxPrice: 23,
        avgPrice: 21.8
      },
      green_chilli: {
        produceName: "Green Chilli (பச்சை மிளகாய்)",
        unit: "₹ / kg",
        days: ["Sep 08", "Sep 09", "Sep 10", "Sep 11", "Sep 12", "Sep 13", "Sep 14", "Sep 15", "Sep 16", "Sep 17", "Sep 18 (Today)", "Sep 19 (Est.)", "Sep 20 (Est.)"],
        historical: [42, 44, 45, 47, 46, 48, 49, 48, 47, 48, 48],
        forecast: [null, null, null, null, null, null, null, null, null, null, 48, 50, 52, 51],
        trendDirection: "Upward (+6.2%)",
        trendRationale: "Export grade sorting diverting top qualities; domestic sandhai supply moderately tight.",
        minPrice: 42,
        maxPrice: 52,
        avgPrice: 47.3
      }
    },

    // Realistic Surplus / Institutional Buyers in Salem
    surplusBuyers: [
      {
        id: "buyer_1",
        businessName: "Sri Saravana Bhavan Hotel & Mess",
        category: "Restaurant",
        contactPerson: "K. Rangarajan (Purchasing)",
        phoneDemo: "+91 94432 *****",
        location: "Salem Junction Road",
        distanceKmFromDadagapatti: 4.8,
        acceptedProduce: ["tomato", "onion", "potato", "carrot", "brinjal", "green_chilli"],
        preferredDailyQty: {
          tomato: 80,
          onion: 60,
          potato: 70,
          carrot: 40,
          brinjal: 30,
          cabbage: 50,
          green_chilli: 15
        },
        qualityRequirement: "Grade A / Fresh culinary grade",
        paymentTerms: "Immediate Cash on Morning Delivery (by 06:30 AM)",
        offeredPriceAdjustment: 0.96
      },
      {
        id: "buyer_2",
        businessName: "Selvam Chettinad Restaurant & Catering",
        category: "Restaurant & Catering",
        contactPerson: "M. Soundar (Kitchen Head)",
        phoneDemo: "+91 98427 *****",
        location: "Dadagapatti Main Road",
        distanceKmFromDadagapatti: 1.2,
        acceptedProduce: ["tomato", "onion", "brinjal", "green_chilli", "cabbage"],
        preferredDailyQty: {
          tomato: 50,
          onion: 50,
          brinjal: 40,
          green_chilli: 20,
          cabbage: 30
        },
        qualityRequirement: "Good fresh quality; standard farm sorting",
        paymentTerms: "Same-Day UPI / Cash settlement",
        offeredPriceAdjustment: 0.95
      },
      {
        id: "buyer_3",
        businessName: "Nilgiris Fresh Supermarket (Fairlands)",
        category: "Modern Retailer",
        contactPerson: "P. Vignesh (Store Ops)",
        phoneDemo: "+91 97891 *****",
        location: "Fairlands, Salem",
        distanceKmFromDadagapatti: 7.5,
        acceptedProduce: ["tomato", "carrot", "potato", "cabbage", "green_chilli"],
        preferredDailyQty: {
          tomato: 120,
          carrot: 80,
          potato: 100,
          cabbage: 75,
          green_chilli: 25
        },
        qualityRequirement: "Clean, sorted, uniform size, zero pest defects",
        paymentTerms: "Weekly account billing or next-day bank transfer",
        offeredPriceAdjustment: 0.98
      },
      {
        id: "buyer_4",
        businessName: "Salem District Central Canteen & Hostel Mess",
        category: "Institutional Mess",
        contactPerson: "V. Duraisamy (Steward)",
        phoneDemo: "+91 94421 *****",
        location: "Hasthampatti Road",
        distanceKmFromDadagapatti: 6.2,
        acceptedProduce: ["tomato", "onion", "potato", "cabbage", "brinjal"],
        preferredDailyQty: {
          tomato: 150,
          onion: 120,
          potato: 150,
          cabbage: 90,
          brinjal: 80
        },
        qualityRequirement: "Bulk cooking grade, washed, medium-large sizes",
        paymentTerms: "Cheque / NEFT settlement within 3 days",
        offeredPriceAdjustment: 0.92
      },
      {
        id: "buyer_5",
        businessName: "Ammapet Daily Greens & Veg Retail Outlet",
        category: "Vegetable Shop",
        contactPerson: "S. Murugesan",
        phoneDemo: "+91 98433 *****",
        location: "Ammapet Bazaar",
        distanceKmFromDadagapatti: 4.1,
        acceptedProduce: ["tomato", "onion", "potato", "carrot", "brinjal", "green_chilli", "cabbage"],
        preferredDailyQty: {
          tomato: 40,
          onion: 40,
          potato: 35,
          carrot: 25,
          brinjal: 25,
          green_chilli: 12,
          cabbage: 25
        },
        qualityRequirement: "Direct garden freshness, harvested same morning",
        paymentTerms: "Spot cash upon gate arrival",
        offeredPriceAdjustment: 0.94
      },
      {
        id: "buyer_6",
        businessName: "Gokulam Hospital Dietary Services",
        category: "Institutional Healthcare",
        contactPerson: "Dr. Latha (Nutrition Dept)",
        phoneDemo: "+91 99440 *****",
        location: "Meyyanur, Salem",
        distanceKmFromDadagapatti: 5.8,
        acceptedProduce: ["carrot", "tomato", "potato", "cabbage"],
        preferredDailyQty: {
          carrot: 45,
          tomato: 60,
          potato: 50,
          cabbage: 35
        },
        qualityRequirement: "Hygienic, chemical residue free, crisp condition",
        paymentTerms: "Monthly consolidated purchase voucher",
        offeredPriceAdjustment: 0.97
      }
    ]
  };
});
