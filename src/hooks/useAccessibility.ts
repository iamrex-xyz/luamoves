import { useEffect, useRef } from "react";

// Hook for screen reader announcements
export const useAnnounce = () => {
  const announce = (message: string, priority: "polite" | "assertive" = "polite") => {
    const announcer = document.getElementById(`sr-announcer-${priority}`);
    if (announcer) {
      // Clear and set new message to trigger announcement
      announcer.textContent = "";
      setTimeout(() => {
        announcer.textContent = message;
      }, 100);
    }
  };

  return { announce };
};

// Hook to manage focus on route changes
export const useFocusOnMount = (shouldFocus: boolean = true) => {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (shouldFocus && ref.current) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        ref.current?.focus();
      }, 100);
    }
  }, [shouldFocus]);

  return ref;
};

// Hook to trap focus within a container (useful for modals)
export const useFocusTrap = (isActive: boolean) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener("keydown", handleKeyDown);
    firstElement?.focus();

    return () => {
      container.removeEventListener("keydown", handleKeyDown);
    };
  }, [isActive]);

  return containerRef;
};
