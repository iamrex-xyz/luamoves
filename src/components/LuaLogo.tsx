import { cn } from "@/lib/utils";

interface LuaLogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  showText?: boolean;
}

export const LuaLogo = ({ size = "md", className, showText = true }: LuaLogoProps) => {
  const sizeClasses = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-4xl",
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <span 
        className={cn(
          "font-light tracking-wide text-foreground",
          sizeClasses[size]
        )}
        style={{ fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif" }}
      >
        {showText ? "lua" : "l"}
      </span>
    </div>
  );
};
