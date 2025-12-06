// Simple analytics tracking (non-identifiable)
// In production, this would send to an analytics service

export const trackEvent = (eventName: string, properties?: Record<string, unknown>) => {
  // Log to console in development
  if (import.meta.env.DEV) {
    console.log(`[Analytics] ${eventName}`, properties || {});
  }
  
  // Store in localStorage for debugging (non-identifiable)
  try {
    const events = JSON.parse(localStorage.getItem("lua_analytics") || "[]");
    events.push({
      event: eventName,
      timestamp: new Date().toISOString(),
      ...properties,
    });
    // Keep only last 50 events
    localStorage.setItem("lua_analytics", JSON.stringify(events.slice(-50)));
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
  // Reminder events
  REMINDER_SCHEDULED: "reminderScheduled",
  REMINDER_DELIVERED: "reminderDelivered",
  REMINDER_CLICKED: "reminderClicked",
  NOTIFICATION_PERMISSION_DENIED: "notificationPermissionDenied",
  // Account modal events
  ACCOUNT_MODAL_SHOWN_AT_TASK_2: "account_modal_shown_at_task_2",
  ACCOUNT_MODAL_SHOWN_AT_TASK_6: "account_modal_shown_at_task_6",
  ACCOUNT_CREATED_FROM_MODAL: "account_created_from_modal",
  ACCOUNT_MODAL_LATER_CLICKED: "account_modal_later_clicked",
} as const;
