// Simple analytics tracking (non-identifiable)
// In production, this would send to an analytics service

export const trackEvent = (eventName: string, properties?: Record<string, unknown>) => {
  // Log to console in development
  if (import.meta.env.DEV) {
    console.log(`[Analytics] ${eventName}`, properties || {});
  }
  
  // Store in localStorage for debugging (non-identifiable)
  try {
    const events = JSON.parse(localStorage.getItem("charly_analytics") || "[]");
    events.push({
      event: eventName,
      timestamp: new Date().toISOString(),
      ...properties,
    });
    // Keep only last 50 events
    localStorage.setItem("charly_analytics", JSON.stringify(events.slice(-50)));
  } catch {
    // Ignore storage errors
  }
};

// Predefined event names
export const AnalyticsEvents = {
  PARTNER_CONSENT_CHANGED: "partnerConsentChanged",
  PARTNER_DEAL_CLICKED: "partnerDealClicked",
  PARTNER_DEAL_VIEWED: "partnerDealViewed",
  PRIVACY_MODAL_OPENED: "privacyModalOpened",
} as const;
