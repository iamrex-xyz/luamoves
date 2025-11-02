import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "@/lib/utils";

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => {
  // Dynamic color based on progress percentage (neuropsychology-based motivation)
  const getProgressColor = (val: number) => {
    if (val === 100) return "hsl(var(--progress-complete))"; // Green - Achievement!
    if (val >= 75) return "hsl(var(--progress-high))"; // Dark blue - Almost there!
    if (val >= 50) return "hsl(var(--progress-medium))"; // Medium blue - Good progress
    if (val >= 25) return "hsl(var(--progress-low))"; // Light medium - Getting started
    return "hsl(var(--progress-start))"; // Very light - Just started
  };

  const progressValue = value || 0;

  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn("relative h-4 w-full overflow-hidden rounded-full bg-secondary", className)}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className="h-full w-full flex-1 transition-all duration-500 ease-out"
        style={{ 
          transform: `translateX(-${100 - progressValue}%)`,
          backgroundColor: getProgressColor(progressValue)
        }}
      />
    </ProgressPrimitive.Root>
  );
});
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
