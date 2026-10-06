/**
 * AI Smart Market Decision Assistant
 * Price Trends Visualizer (SVG-based Clean Line Chart)
 * 
 * Features:
 * - Historical actual prices (past 10 days)
 * - Current price baseline (Today)
 * - 3-day estimated short-term trend (Projected)
 * - Interactive hover tooltips
 * - Dynamic produce switching (Tomato, Onion, Potato, Carrot, Brinjal, Cabbage, Green Chilli)
 * - Responsive SVG rendering with zero external library dependencies
 */

(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    const { DEMO_DATA } = require('./data.js');
    module.exports = factory(DEMO_DATA);
  } else {
    const data = root.DEMO_DATA || (typeof window !== 'undefined' && window.DEMO_DATA) || (typeof globalThis !== 'undefined' && globalThis.DEMO_DATA);
    const trends = factory(data);
    root.PriceTrendsChart = trends;
    if (typeof window !== 'undefined') {
      window.PriceTrendsChart = trends;
    }
    if (typeof globalThis !== 'undefined') {
      globalThis.PriceTrendsChart = trends;
    }
  }
})(typeof self !== 'undefined' ? self : this, function (DEMO_DATA) {
  'use strict';

  function renderChart(containerId, produceId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const dataObj = DEMO_DATA || (typeof window !== 'undefined' && window.DEMO_DATA) || {};
    const trendsObj = dataObj.priceTrends || {};
    const trendData = trendsObj[produceId] || trendsObj.tomato;

    if (!trendData) {
      container.innerHTML = `<div style="padding: 24px; text-align: center; color: #64748b;">No price trend data available for ${produceId}.</div>`;
      return;
    }

    const days = trendData.days || [];
    const historical = trendData.historical || [];
    const forecast = trendData.forecast || [];

    // Determine scale limits
    const allValidValues = [...historical, ...forecast.filter(v => v !== null)];
    const minVal = Math.floor(Math.min(...allValidValues) * 0.92);
    const maxVal = Math.ceil(Math.max(...allValidValues) * 1.08);
    const valRange = maxVal - minVal > 0 ? maxVal - minVal : 10;

    // SVG coordinate space
    const width = 860;
    const height = 340;
    const padLeft = 65;
    const padRight = 45;
    const padTop = 35;
    const padBottom = 55;

    const chartWidth = width - padLeft - padRight;
    const chartHeight = height - padTop - padBottom;

    const xStep = days.length > 1 ? chartWidth / (days.length - 1) : chartWidth;

    function getY(val) {
      return padTop + chartHeight - ((val - minVal) / valRange) * chartHeight;
    }

    function getX(idx) {
      return padLeft + idx * xStep;
    }

    // Grid lines & Y ticks (4-5 ticks)
    const yTicksCount = 5;
    let gridSvg = '';
    for (let i = 0; i <= yTicksCount; i++) {
      const price = Math.round(minVal + (valRange / yTicksCount) * i);
      const y = getY(price);
      gridSvg += `
        <line x1="${padLeft}" y1="${y}" x2="${width - padRight}" y2="${y}" stroke="#e2e8f0" stroke-width="1" stroke-dasharray="4,4" />
        <text x="${padLeft - 12}" y="${y + 4}" text-anchor="end" font-size="12" fill="#64748b" font-family="system-ui, sans-serif">₹${price}</text>
      `;
    }

    // X-axis ticks & labels
    let xTicksSvg = '';
    days.forEach((day, idx) => {
      const x = getX(idx);
      const isToday = day.includes('Today');
      const isEst = day.includes('Est.');
      const labelColor = isToday ? '#1b4332' : isEst ? '#b45309' : '#64748b';
      const fontWeight = isToday ? 'bold' : 'normal';

      xTicksSvg += `
        <line x1="${x}" y1="${padTop + chartHeight}" x2="${x}" y2="${padTop + chartHeight + 6}" stroke="#cbd5e1" stroke-width="1" />
        <text x="${x}" y="${padTop + chartHeight + 22}" text-anchor="middle" font-size="11" fill="${labelColor}" font-weight="${fontWeight}" font-family="system-ui, sans-serif" transform="rotate(-20, ${x}, ${padTop + chartHeight + 22})">${day}</text>
      `;
    });

    // Build historical path
    let histPoints = [];
    historical.forEach((val, idx) => {
      if (val !== null) {
        histPoints.push({ x: getX(idx), y: getY(val), val, day: days[idx], type: 'Historical' });
      }
    });

    let histPathD = '';
    histPoints.forEach((pt, i) => {
      histPathD += (i === 0 ? `M ${pt.x} ${pt.y}` : ` L ${pt.x} ${pt.y}`);
    });

    // Build area fill for historical
    let histAreaD = '';
    if (histPoints.length > 0) {
      const lastHist = histPoints[histPoints.length - 1];
      const firstHist = histPoints[0];
      histAreaD = `${histPathD} L ${lastHist.x} ${padTop + chartHeight} L ${firstHist.x} ${padTop + chartHeight} Z`;
    }

    // Build forecast path
    let forecastPoints = [];
    const todayIdx = historical.length - 1;
    if (todayIdx >= 0 && historical[todayIdx] !== undefined) {
      forecastPoints.push({ x: getX(todayIdx), y: getY(historical[todayIdx]), val: historical[todayIdx], day: days[todayIdx], type: 'Today Baseline' });
    }

    for (let i = todayIdx + 1; i < days.length; i++) {
      if (forecast[i] !== null && forecast[i] !== undefined) {
        forecastPoints.push({ x: getX(i), y: getY(forecast[i]), val: forecast[i], day: days[i], type: 'Forecasted Estimate' });
      }
    }

    let forecastPathD = '';
    forecastPoints.forEach((pt, i) => {
      forecastPathD += (i === 0 ? `M ${pt.x} ${pt.y}` : ` L ${pt.x} ${pt.y}`);
    });

    // Build dots
    let dotsSvg = '';
    histPoints.forEach(pt => {
      dotsSvg += `
        <circle cx="${pt.x}" cy="${pt.y}" r="4.5" fill="#2d6a4f" stroke="#ffffff" stroke-width="2" class="chart-dot" data-day="${pt.day}" data-price="${pt.val}" data-type="${pt.type}" />
      `;
    });

    forecastPoints.slice(1).forEach(pt => {
      dotsSvg += `
        <circle cx="${pt.x}" cy="${pt.y}" r="5" fill="#d97706" stroke="#ffffff" stroke-width="2" stroke-dasharray="2,1" class="chart-dot" data-day="${pt.day}" data-price="${pt.val}" data-type="${pt.type}" />
      `;
    });

    // Today highlight ring
    let todayRingSvg = '';
    if (histPoints.length > 0) {
      const todayPt = histPoints[histPoints.length - 1];
      todayRingSvg = `
        <circle cx="${todayPt.x}" cy="${todayPt.y}" r="8" fill="none" stroke="#2d6a4f" stroke-width="2" opacity="0.5">
          <animate attributeName="r" values="6;10;6" dur="2.4s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.7;0.2;0.7" dur="2.4s" repeatCount="indefinite"/>
        </circle>
        <circle cx="${todayPt.x}" cy="${todayPt.y}" r="5.5" fill="#1b4332" stroke="#ffffff" stroke-width="2" />
      `;
    }

    // Forecast region background shading
    const forecastStartX = getX(todayIdx);
    const forecastWidth = Math.max(0, width - padRight - forecastStartX);
    const forecastShadeSvg = `
      <rect x="${forecastStartX}" y="${padTop}" width="${forecastWidth}" height="${chartHeight}" fill="#fffbeb" opacity="0.6" />
      <line x1="${forecastStartX}" y1="${padTop}" x2="${forecastStartX}" y2="${padTop + chartHeight}" stroke="#d97706" stroke-width="1.5" stroke-dasharray="3,3" />
      <text x="${forecastStartX + 8}" y="${padTop + 16}" font-size="11" font-weight="600" fill="#b45309" font-family="system-ui, sans-serif">PROJECTION WINDOW</text>
    `;

    const svgHtml = `
      <div class="trend-chart-wrapper" style="position: relative; width: 100%;">
        <svg viewBox="0 0 ${width} ${height}" class="price-trends-svg" preserveAspectRatio="xMidYMid meet" style="width: 100%; height: auto; display: block;">
          <defs>
            <linearGradient id="histGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#2d6a4f" stop-opacity="0.22"/>
              <stop offset="100%" stop-color="#2d6a4f" stop-opacity="0.0"/>
            </linearGradient>
          </defs>

          <!-- Forecast Region Highlight -->
          ${forecastShadeSvg}

          <!-- Grid Lines -->
          ${gridSvg}

          <!-- Baseline Axes -->
          <line x1="${padLeft}" y1="${padTop + chartHeight}" x2="${width - padRight}" y2="${padTop + chartHeight}" stroke="#94a3b8" stroke-width="1.5" />
          <line x1="${padLeft}" y1="${padTop}" x2="${padLeft}" y2="${padTop + chartHeight}" stroke="#94a3b8" stroke-width="1.5" />

          <!-- X Ticks -->
          ${xTicksSvg}

          <!-- Historical Area & Path -->
          ${histAreaD ? `<path d="${histAreaD}" fill="url(#histGradient)" />` : ''}
          ${histPathD ? `<path d="${histPathD}" fill="none" stroke="#2d6a4f" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />` : ''}

          <!-- Forecast Projected Path -->
          ${forecastPathD ? `<path d="${forecastPathD}" fill="none" stroke="#d97706" stroke-width="2.5" stroke-dasharray="6,4" stroke-linecap="round" stroke-linejoin="round" />` : ''}

          <!-- Today Indicator -->
          ${todayRingSvg}

          <!-- Data Points -->
          ${dotsSvg}
        </svg>

        <!-- Floating Tooltip Box -->
        <div id="chart-tooltip" style="display: none; position: absolute; background: #0f172a; color: #ffffff; padding: 8px 12px; border-radius: 6px; font-size: 12px; pointer-events: none; z-index: 10; box-shadow: 0 4px 12px rgba(0,0,0,0.15);"></div>
      </div>
    `;

    container.innerHTML = svgHtml;

    // Attach interactive hover tooltips
    const tooltip = container.querySelector('#chart-tooltip');
    const dots = container.querySelectorAll('.chart-dot');

    if (tooltip && dots) {
      dots.forEach(dot => {
        dot.addEventListener('mouseenter', (e) => {
          const day = dot.getAttribute('data-day');
          const price = dot.getAttribute('data-price');
          const type = dot.getAttribute('data-type');

          tooltip.innerHTML = `
            <div style="font-weight: 600; color: #94a3b8; margin-bottom: 2px;">${day}</div>
            <div style="font-size: 14px; font-weight: 700; color: #ffffff;">₹${price} / kg</div>
            <div style="font-size: 11px; color: ${type.includes('Forecast') ? '#fde68a' : '#86efac'}; margin-top: 2px;">● ${type}</div>
          `;
          tooltip.style.display = 'block';
          dot.setAttribute('r', '7');
        });

        dot.addEventListener('mousemove', (e) => {
          const rect = container.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          tooltip.style.left = `${Math.min(x + 12, rect.width - 140)}px`;
          tooltip.style.top = `${Math.max(10, y - 55)}px`;
        });

        dot.addEventListener('mouseleave', () => {
          tooltip.style.display = 'none';
          dot.setAttribute('r', dot.getAttribute('data-type').includes('Forecast') ? '5' : '4.5');
        });
      });
    }

    updateTrendMetrics(trendData);
  }

  function updateTrendMetrics(trendData) {
    if (!trendData) return;
    const currentPriceEl = document.getElementById('trend-metric-current');
    const minPriceEl = document.getElementById('trend-metric-min');
    const maxPriceEl = document.getElementById('trend-metric-max');
    const avgPriceEl = document.getElementById('trend-metric-avg');
    const directionEl = document.getElementById('trend-metric-direction');
    const rationaleEl = document.getElementById('trend-rationale-text');

    if (currentPriceEl && trendData.historical) {
      const todayVal = trendData.historical[trendData.historical.length - 1];
      currentPriceEl.textContent = `₹${todayVal} / kg`;
    }
    if (minPriceEl && trendData.minPrice !== undefined) minPriceEl.textContent = `₹${trendData.minPrice} / kg`;
    if (maxPriceEl && trendData.maxPrice !== undefined) maxPriceEl.textContent = `₹${trendData.maxPrice} / kg`;
    if (avgPriceEl && trendData.avgPrice !== undefined) avgPriceEl.textContent = `₹${trendData.avgPrice} / kg`;
    if (directionEl && trendData.trendDirection) {
      directionEl.textContent = trendData.trendDirection;
      if (trendData.trendDirection.includes('Upward')) {
        directionEl.className = 'trend-badge trend-up';
      } else if (trendData.trendDirection.includes('Downward')) {
        directionEl.className = 'trend-badge trend-down';
      } else {
        directionEl.className = 'trend-badge trend-stable';
      }
    }
    if (rationaleEl && trendData.trendRationale) {
      rationaleEl.textContent = trendData.trendRationale;
    }
  }

  return {
    renderChart
  };
});
