import { useState, useRef, ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Haptics, ImpactStyle } from "@capacitor/haptics";

type PullToRefreshProps = {
  children: ReactNode;
  onRefresh: () => Promise<void>;
  className?: string;
};

const PULL_THRESHOLD = 80;
const RESISTANCE = 0.4;

const triggerHaptic = async () => {
  try {
    await Haptics.impact({ style: ImpactStyle.Medium });
  } catch {
    if (navigator.vibrate) {
      navigator.vibrate(15);
    }
  }
};

export const PullToRefresh = ({
  children,
  onRefresh,
  className,
}: PullToRefreshProps) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startYRef = useRef(0);
  const currentYRef = useRef(0);
  const isPullingRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasReachedThresholdRef = useRef(false);

  const isAtTop = () => {
    if (!containerRef.current) return true;
    return containerRef.current.scrollTop <= 0;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isRefreshing) return;
    if (!isAtTop()) return;
    
    startYRef.current = e.touches[0].clientY;
    currentYRef.current = e.touches[0].clientY;
    isPullingRef.current = true;
    hasReachedThresholdRef.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPullingRef.current || isRefreshing) return;
    if (!isAtTop()) {
      isPullingRef.current = false;
      setPullDistance(0);
      return;
    }

    currentYRef.current = e.touches[0].clientY;
    let diff = currentYRef.current - startYRef.current;

    // Only allow pull down
    if (diff < 0) {
      diff = 0;
      isPullingRef.current = false;
    }

    // Apply resistance
    const resistedDiff = diff * RESISTANCE;

    // Trigger haptic when reaching threshold
    if (resistedDiff >= PULL_THRESHOLD && !hasReachedThresholdRef.current) {
      hasReachedThresholdRef.current = true;
      triggerHaptic();
    } else if (resistedDiff < PULL_THRESHOLD && hasReachedThresholdRef.current) {
      hasReachedThresholdRef.current = false;
    }

    setPullDistance(resistedDiff);
  };

  const handleTouchEnd = async () => {
    if (!isPullingRef.current || isRefreshing) return;
    isPullingRef.current = false;

    if (pullDistance >= PULL_THRESHOLD) {
      setIsRefreshing(true);
      setPullDistance(PULL_THRESHOLD);
      
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
  };

  const progress = Math.min(pullDistance / PULL_THRESHOLD, 1);
  const rotation = progress * 360;

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-auto", className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      <div
        className={cn(
          "absolute left-1/2 -translate-x-1/2 flex items-center justify-center transition-opacity z-10",
          pullDistance > 10 || isRefreshing ? "opacity-100" : "opacity-0"
        )}
        style={{
          top: Math.min(pullDistance - 40, PULL_THRESHOLD - 20),
        }}
      >
        <div
          className={cn(
            "w-10 h-10 rounded-full bg-background border border-border shadow-lg flex items-center justify-center",
            isRefreshing && "animate-pulse"
          )}
        >
          <Loader2
            className={cn(
              "w-5 h-5 text-primary transition-transform",
              isRefreshing && "animate-spin"
            )}
            style={{
              transform: isRefreshing ? undefined : `rotate(${rotation}deg)`,
            }}
          />
        </div>
      </div>

      {/* Content with pull offset */}
      <div
        className="transition-transform"
        style={{
          transform: `translateY(${pullDistance}px)`,
          transitionDuration: isPullingRef.current ? "0ms" : "200ms",
        }}
      >
        {children}
      </div>
    </div>
  );
};
