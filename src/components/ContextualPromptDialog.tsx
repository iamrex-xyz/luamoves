import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Key, Building2 } from "lucide-react";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { MovingInfo } from "@/pages/Index";
import { isSameAddress } from "@/lib/validation";

export type PromptType = "oldAddress" | "movingType" | "keyHandoverDate";

type ContextualPromptDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  promptType: PromptType;
  onComplete: (data: Partial<MovingInfo>) => void;
  taskTitle?: string;
  movingInfo?: MovingInfo;
};

const promptConfig: Record<PromptType, { title: string; description: string }> = {
  oldAddress: {
    title: "Wat is je huidige adres?",
    description: "Dit hebben we nodig om je adreswijziging te regelen.",
  },
  movingType: {
    title: "Ga je huren of kopen?",
    description: "Dit helpt ons de juiste taken voor je te selecteren.",
  },
  keyHandoverDate: {
    title: "Wanneer krijg je de sleutel?",
    description: "Zo kunnen we je taken beter plannen.",
  },
};

export const ContextualPromptDialog = ({
  open,
  onOpenChange,
  promptType,
  onComplete,
  taskTitle,
  movingInfo,
}: ContextualPromptDialogProps) => {
  const [oldAddress, setOldAddress] = useState(movingInfo?.oldAddress || "");
  const [movingType, setMovingType] = useState<"rent" | "buy" | "">(movingInfo?.type || "");
  const [keyDate, setKeyDate] = useState<Date | undefined>(
    movingInfo?.keyHandoverDate ? new Date(movingInfo.keyHandoverDate) : undefined
  );

  // Prefill from movingInfo when dialog opens
  useEffect(() => {
    if (open) {
      setOldAddress(movingInfo?.oldAddress || "");
      setMovingType(movingInfo?.type || "");
      setKeyDate(movingInfo?.keyHandoverDate ? new Date(movingInfo.keyHandoverDate) : undefined);
    }
  }, [open, movingInfo?.oldAddress, movingInfo?.type, movingInfo?.keyHandoverDate]);

  const config = promptConfig[promptType];

  // Check if old address matches new address
  const isAddressSame = promptType === "oldAddress" && movingInfo?.newAddress 
    ? isSameAddress(oldAddress, movingInfo.newAddress)
    : false;

  const handleSubmit = () => {
    switch (promptType) {
      case "oldAddress":
        if (oldAddress.trim()) {
          onComplete({ oldAddress: oldAddress.trim() });
        }
        break;
      case "movingType":
        if (movingType) {
          onComplete({ type: movingType });
        }
        break;
      case "keyHandoverDate":
        if (keyDate) {
          onComplete({ keyHandoverDate: format(keyDate, "yyyy-MM-dd") });
        }
        break;
    }
    onOpenChange(false);
  };

  const isValid = () => {
    switch (promptType) {
      case "oldAddress":
        return oldAddress.trim().length > 0 && !isAddressSame;
      case "movingType":
        return movingType !== "";
      case "keyHandoverDate":
        return !!keyDate;
      default:
        return false;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg">{config.title}</DialogTitle>
          <DialogDescription className="text-sm">
            {taskTitle && <span className="font-medium text-foreground">Voor: {taskTitle}</span>}
            <br />
            {config.description}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {promptType === "oldAddress" && (
            <div className="space-y-2">
              <Label htmlFor="old-address">Huidig adres</Label>
              <Input
                id="old-address"
                placeholder="Straat, huisnummer, postcode"
                value={oldAddress}
                onChange={(e) => setOldAddress(e.target.value)}
                autoFocus
              />
              {isAddressSame && (
                <p className="text-xs text-amber-600">
                  Dit adres is hetzelfde als je nieuwe adres. Misschien per ongeluk verkeerd ingevuld?
                </p>
              )}
            </div>
          )}

          {promptType === "movingType" && (
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setMovingType("rent")}
                className={cn(
                  "p-6 rounded-lg border-2 transition-all",
                  movingType === "rent"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                )}
              >
                <Key className="w-8 h-8 mx-auto mb-2 text-primary" />
                <p className="font-semibold">Huren</p>
              </button>
              <button
                onClick={() => setMovingType("buy")}
                className={cn(
                  "p-6 rounded-lg border-2 transition-all",
                  movingType === "buy"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                )}
              >
                <Building2 className="w-8 h-8 mx-auto mb-2 text-primary" />
                <p className="font-semibold">Kopen</p>
              </button>
            </div>
          )}

          {promptType === "keyHandoverDate" && (
            <div className="flex justify-center">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full max-w-xs justify-start text-left font-normal h-12",
                      !keyDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {keyDate ? format(keyDate, "d MMMM yyyy", { locale: nl }) : "Kies een datum"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="center">
                  <Calendar
                    mode="single"
                    selected={keyDate}
                    onSelect={setKeyDate}
                    initialFocus
                    locale={nl}
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
            Later
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid()} className="flex-1">
            Opslaan
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Helper to determine what prompt a task needs
export const getRequiredPromptForTask = (
  taskId: string,
  taskTitle: string,
  movingInfo: MovingInfo
): PromptType | null => {
  const titleLower = taskTitle.toLowerCase();
  
  // Tasks that need old address
  if (
    (titleLower.includes("adreswijziging") ||
      titleLower.includes("doorsturen") ||
      titleLower.includes("opzeggen") ||
      titleLower.includes("afmelden")) &&
    !movingInfo.oldAddress
  ) {
    return "oldAddress";
  }

  // Tasks that need moving type
  if (
    (titleLower.includes("notaris") ||
      titleLower.includes("hypotheek") ||
      titleLower.includes("huurcontract") ||
      titleLower.includes("koopakte") ||
      titleLower.includes("overdracht")) &&
    !movingInfo.type
  ) {
    return "movingType";
  }

  // Tasks that need key handover date
  if (
    (titleLower.includes("sleutel") ||
      titleLower.includes("overdracht") ||
      titleLower.includes("inspectie")) &&
    !movingInfo.keyHandoverDate
  ) {
    return "keyHandoverDate";
  }

  return null;
};
