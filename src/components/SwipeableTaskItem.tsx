import { useState, useRef, ReactNode } from "react";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Haptics, ImpactStyle } from "@capacitor/haptics";

type SwipeableTaskItemProps = {
  children: ReactNode;
  onSwipeComplete: () => void;
  disabled?: boolean;
  className?: string;
};

const SWIPE_THRESHOLD = 100; // pixels to trigger complete
const RESISTANCE = 0.5; // resistance factor for overscroll

// Haptic feedback helper with web fallback
const triggerHaptic = async (style: "light" | "medium" | "heavy" = "medium") => {
  try {
    const impactStyle = style === "light" ? ImpactStyle.Light 
      : style === "heavy" ? ImpactStyle.Heavy 
      : ImpactStyle.Medium;
    await Haptics.impact({ style: impactStyle });
  } catch {
    // Fallback to web Vibration API
    if (navigator.vibrate) {
      navigator.vibrate(style === "light" ? 10 : style === "heavy" ? 30 : 20);
    }
  }
};

export const SwipeableTaskItem = ({
  children,
  onSwipeComplete,
  disabled = false,
  className,
}: SwipeableTaskItemProps) => {
  const [translateX, setTranslateX] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);
  const startXRef = useRef(0);
  const currentXRef = useRef(0);
  const isDraggingRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasReachedThresholdRef = useRef(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled) return;
    startXRef.current = e.touches[0].clientX;
    currentXRef.current = e.touches[0].clientX;
    isDraggingRef.current = true;
    hasReachedThresholdRef.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current || disabled) return;
    
    currentXRef.current = e.touches[0].clientX;
    let diff = currentXRef.current - startXRef.current;
    
    // Only allow swipe right (positive direction)
    if (diff < 0) {
      diff = 0;
    }
    
    // Trigger haptic when reaching threshold
    if (diff >= SWIPE_THRESHOLD && !hasReachedThresholdRef.current) {
      hasReachedThresholdRef.current = true;
      triggerHaptic("light");
    } else if (diff < SWIPE_THRESHOLD && hasReachedThresholdRef.current) {
      hasReachedThresholdRef.current = false;
    }
    
    // Add resistance after threshold
    if (diff > SWIPE_THRESHOLD) {
      diff = SWIPE_THRESHOLD + (diff - SWIPE_THRESHOLD) * RESISTANCE;
    }
    
    setTranslateX(diff);
  };

  const handleTouchEnd = () => {
    if (!isDraggingRef.current || disabled) return;
    isDraggingRef.current = false;
    
    const diff = currentXRef.current - startXRef.current;
    
    if (diff >= SWIPE_THRESHOLD) {
      // Trigger success haptic
      triggerHaptic("heavy");
      
      // Trigger complete animation
      setIsCompleting(true);
      setTranslateX(window.innerWidth); // Slide out completely
      
      // Wait for animation, then trigger callback
      setTimeout(() => {
        onSwipeComplete();
        // Reset after callback
        setTimeout(() => {
          setTranslateX(0);
          setIsCompleting(false);
        }, 100);
      }, 300);
    } else {
      // Snap back
      setTranslateX(0);
    }
  };

  const progress = Math.min(translateX / SWIPE_THRESHOLD, 1);
  const showCheckmark = progress > 0.3;

  return (
    <div className={cn("relative overflow-hidden rounded-2xl", className)} ref={containerRef}>
      {/* Background layer with checkmark */}
      <div 
        className={cn(
          "absolute inset-0 flex items-center pl-6 rounded-2xl transition-colors",
          progress >= 1 ? "bg-green-500" : "bg-green-400/80"
        )}
        style={{ opacity: Math.min(progress * 1.5, 1) }}
      >
        <div 
          className={cn(
            "flex items-center gap-3 text-white transition-all duration-200",
            showCheckmark ? "opacity-100 scale-100" : "opacity-0 scale-75"
          )}
        >
          <CheckCircle2 
            className={cn(
              "w-6 h-6 transition-transform duration-200",
              progress >= 1 && "scale-110"
            )} 
          />
          <span className="font-medium text-sm">Voltooid!</span>
        </div>
      </div>
      
      {/* Foreground draggable content */}
      <div
        className={cn(
          "relative bg-background transition-transform touch-pan-y",
          isCompleting ? "duration-300 ease-out" : translateX === 0 ? "duration-200 ease-out" : "duration-0"
        )}
        style={{ 
          transform: `translateX(${translateX}px)`,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  );
};
