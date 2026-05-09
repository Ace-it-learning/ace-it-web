import ReactGA from "react-ga4";

const MEASUREMENT_ID = import.meta.env.VITE_FIREBASE_MEASUREMENT_ID;
const isProd = import.meta.env.PROD;

/**
 * Initialize Google Analytics 4
 * Only initializes if in production and measurement ID is present.
 */
export const initGA = () => {
  if (isProd && MEASUREMENT_ID) {
    ReactGA.initialize(MEASUREMENT_ID);
    console.log("GA4 Initialized");
  } else if (!isProd) {
    console.log("GA4 Initialization skipped (Not in Production)");
  }
};

/**
 * Track a page view
 * @param {string} path - The path of the page viewed
 */
export const trackPageView = (path) => {
  if (isProd && MEASUREMENT_ID) {
    ReactGA.send({ hitType: "pageview", page: path });
  }
};

/**
 * Track a custom event
 * @param {string} category - Event category (e.g., 'User', 'Exam')
 * @param {string} action - Event action (e.g., 'Click', 'Submit')
 * @param {string} label - Event label (optional)
 * @param {number} value - Event value (optional)
 */
export const trackEvent = (category, action, label, value) => {
  if (isProd && MEASUREMENT_ID) {
    ReactGA.event({
      category,
      action,
      label,
      value,
    });
  } else if (!isProd) {
    console.log(`[GA4 Event Skip] Category: ${category}, Action: ${action}, Label: ${label}`);
  }
};

export default {
  initGA,
  trackPageView,
  trackEvent,
};
