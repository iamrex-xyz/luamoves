import { useCallback, useRef, useState } from "react";

type SaveStatus = "idle" | "saving" | "saved" | "error";

export const useAutosave = (saveFunction: () => Promise<void>, debounceMs = 1000) => {
  const [status, setStatus] = useState<SaveStatus>("idle");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerSave = useCallback(() => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (savedTimeoutRef.current) {
      clearTimeout(savedTimeoutRef.current);
    }

    // Set debounce timeout
    timeoutRef.current = setTimeout(async () => {
      setStatus("saving");
      try {
        await saveFunction();
        setStatus("saved");
        // Reset to idle after 2 seconds
        savedTimeoutRef.current = setTimeout(() => {
          setStatus("idle");
        }, 2000);
      } catch (error) {
        console.error("Autosave error:", error);
        setStatus("error");
        // Reset to idle after 3 seconds
        savedTimeoutRef.current = setTimeout(() => {
          setStatus("idle");
        }, 3000);
      }
    }, debounceMs);
  }, [saveFunction, debounceMs]);

  const cancelSave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (savedTimeoutRef.current) {
      clearTimeout(savedTimeoutRef.current);
    }
  }, []);

  return { triggerSave, cancelSave, status };
};
