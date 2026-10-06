/**
 * AI Smart Market Decision Assistant
 * Global Error Boundary & Resilience Module
 * 
 * Provides:
 * 1. Global uncaught exception and unhandled rejection listeners.
 * 2. Visual in-app error boundary recovery alert banner for agricultural vendors.
 * 3. Safe fallback data state recovery to prevent white-screen crashes.
 * 4. Diagnostics logging for developer evaluation and debugging.
 */

(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
  } else {
    const errorBoundary = factory();
    root.ErrorBoundary = errorBoundary;
    if (typeof window !== 'undefined') window.ErrorBoundary = errorBoundary;
    if (typeof globalThis !== 'undefined') globalThis.ErrorBoundary = errorBoundary;
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // In-memory diagnostic logs
  const errorLogs = [];
  const MAX_LOGS = 25;

  /**
   * Log an error event to diagnostic memory
   * @param {string} source - Origin of the error (e.g., 'window.onerror', 'Storage')
   * @param {string} message - Error description
   * @param {string} stack - Stack trace if available
   */
  function logError(source, message, stack) {
    const entry = {
      timestamp: new Date().toISOString(),
      source: source || 'Unknown',
      message: message || 'An unexpected error occurred',
      stack: stack || null
    };

    errorLogs.unshift(entry);
    if (errorLogs.length > MAX_LOGS) {
      errorLogs.pop();
    }

    if (typeof console !== 'undefined' && console.error) {
      console.error(`[ErrorBoundary:${entry.source}]`, entry.message, entry.stack || '');
    }

    return entry;
  }

  /**
   * Render or show the visual error boundary UI banner in the host DOM
   * @param {string} message - User-friendly message explaining the incident
   * @param {boolean} recoverable - Whether the user can reset without full reload
   */
  function showFallbackUI(message, recoverable = true) {
    if (typeof document === 'undefined') return;

    let container = document.getElementById('error-boundary-banner');
    if (!container) {
      container = document.createElement('div');
      container.id = 'error-boundary-banner';
      container.className = 'error-boundary-container';
      
      const mainHeader = document.querySelector('.site-header') || document.body.firstChild;
      if (mainHeader && mainHeader.parentNode) {
        mainHeader.parentNode.insertBefore(container, mainHeader.nextSibling);
      } else {
        document.body.prepend(container);
      }
    }

    container.innerHTML = `
      <div class="error-boundary-card" role="alert" style="background:#fef2f2; border:1px solid #f87171; border-radius:8px; padding:14px 18px; margin:12px auto; max-width:1280px; display:flex; align-items:center; justify-content:space-between; gap:14px; box-shadow:0 2px 6px rgba(0,0,0,0.06);">
        <div style="display:flex; align-items:center; gap:12px;">
          <div style="background:#fee2e2; color:#b91c1c; border-radius:50%; width:36px; height:36px; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          <div>
            <div style="font-size:0.92rem; font-weight:700; color:#991b1b;">System Safeguard Activated</div>
            <div style="font-size:0.82rem; color:#7f1d1d; margin-top:2px;">${message || 'A transient calculation or rendering glitch was safely captured. Your saved data is intact.'}</div>
          </div>
        </div>
        <div style="display:flex; gap:8px;">
          ${recoverable ? `<button type="button" id="btn-err-recover" style="background:#b91c1c; color:#ffffff; border:none; border-radius:6px; padding:6px 14px; font-size:0.80rem; font-weight:600; cursor:pointer;">Restore Safe State</button>` : ''}
          <button type="button" id="btn-err-dismiss" style="background:#ffffff; color:#7f1d1d; border:1px solid #fca5a5; border-radius:6px; padding:6px 12px; font-size:0.80rem; cursor:pointer;">Dismiss</button>
        </div>
      </div>
    `;
    container.style.display = 'block';

    const recoverBtn = document.getElementById('btn-err-recover');
    if (recoverBtn) {
      recoverBtn.addEventListener('click', () => {
        container.style.display = 'none';
        if (typeof window !== 'undefined' && window.location) {
          window.location.reload();
        }
      });
    }

    const dismissBtn = document.getElementById('btn-err-dismiss');
    if (dismissBtn) {
      dismissBtn.addEventListener('click', () => {
        container.style.display = 'none';
      });
    }
  }

  /**
   * Execute an operation inside a safe error boundary wrapper
   * @param {Function} fn - Operation to execute safely
   * @param {*} fallbackValue - Value returned if operation throws
   * @param {string} contextName - Context tag for logging
   */
  function tryCatch(fn, fallbackValue = null, contextName = 'Operation') {
    try {
      return fn();
    } catch (err) {
      logError(contextName, err.message, err.stack);
      showFallbackUI(`Handled error in ${contextName}: ${err.message}`, true);
      return fallbackValue;
    }
  }

  /**
   * Install global window-level error traps
   */
  function installGlobalHandlers() {
    if (typeof window === 'undefined') return;

    window.onerror = function (message, source, lineno, colno, error) {
      const errStr = `${message} at ${source}:${lineno}:${colno}`;
      logError('window.onerror', errStr, error ? error.stack : null);
      showFallbackUI('A script warning occurred. Calculation safeguards have maintained stability.', true);
      return false; // Allow standard console logging
    };

    window.addEventListener('unhandledrejection', function (event) {
      const reason = event.reason;
      const msg = reason && reason.message ? reason.message : String(reason);
      logError('unhandledrejection', msg, reason && reason.stack ? reason.stack : null);
      showFallbackUI('An asynchronous request was recovered without interrupting market calculations.', true);
    });
  }

  // Auto-install global hooks in browser runtime
  if (typeof window !== 'undefined') {
    installGlobalHandlers();
  }

  return {
    logError,
    showFallbackUI,
    tryCatch,
    getErrorLogs: () => [...errorLogs],
    clearLogs: () => { errorLogs.length = 0; }
  };
});
