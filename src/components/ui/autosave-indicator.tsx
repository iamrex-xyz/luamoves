import { Check, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type AutosaveIndicatorProps = {
  status: "idle" | "saving" | "saved" | "error";
  className?: string;
};

export const AutosaveIndicator = ({ status, className }: AutosaveIndicatorProps) => {
  if (status === "idle") return null;

  return (
    <div className={cn("flex items-center gap-1.5 text-xs", className)}>
      {status === "saving" && (
        <>
          <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
          <span className="text-muted-foreground">Opslaan...</span>
        </>
      )}
      {status === "saved" && (
        <>
          <Check className="w-3 h-3 text-success" />
          <span className="text-success">Opgeslagen</span>
        </>
      )}
      {status === "error" && (
        <>
          <AlertCircle className="w-3 h-3 text-destructive" />
          <span className="text-destructive">Fout bij opslaan</span>
        </>
      )}
    </div>
  );
};
