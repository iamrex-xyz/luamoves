import { useState, useEffect } from "react";
import {
  MobileModal,
  MobileModalContent,
} from "@/components/ui/mobile-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Sparkles, Minus, Plus, Check } from "lucide-react";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { MovingInfo } from "@/pages/Index";
import { SmartQuestionType, smartQuestions } from "@/lib/smartQuestions";

type SmartQuestionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  questionType: SmartQuestionType | null;
  onComplete: (data: Partial<MovingInfo> & Record<string, any>) => void;
  taskTitle?: string;
};

export const SmartQuestionDialog = ({
  open,
  onOpenChange,
  questionType,
  onComplete,
  taskTitle,
}: SmartQuestionDialogProps) => {
  const [textValue, setTextValue] = useState("");
  const [dateValue, setDateValue] = useState<Date | undefined>(undefined);
  const [radioValue, setRadioValue] = useState<string>("");
  const [counterValue, setCounterValue] = useState(0);

  // Reset values when question changes
  useEffect(() => {
    if (open && questionType) {
      setTextValue("");
      setDateValue(undefined);
      setRadioValue("");
      setCounterValue(0);
    }
  }, [open, questionType]);

  if (!questionType) return null;

  const question = smartQuestions[questionType];

  const handleSubmit = () => {
    let data: Record<string, any> = {};

    switch (question.inputType) {
      case "text":
        data[question.fieldKey] = textValue.trim();
        break;
      case "date":
        data[question.fieldKey] = dateValue ? format(dateValue, "yyyy-MM-dd") : undefined;
        break;
      case "radio":
      case "select":
        // Convert yes/no to boolean for certain fields
        if (["hasGarden", "hasJob", "needsContractorHelp"].includes(question.fieldKey)) {
          data[question.fieldKey] = radioValue === "yes";
        } else if (question.fieldKey === "renovationType") {
          data[question.fieldKey] = radioValue;
        } else {
          data[question.fieldKey] = radioValue;
        }
        break;
      case "counter":
        data[question.fieldKey] = counterValue;
        break;
    }

    onComplete(data);
    onOpenChange(false);
  };

  const isValid = () => {
    switch (question.inputType) {
      case "text":
        return textValue.trim().length > 0;
      case "date":
        return !!dateValue;
      case "radio":
      case "select":
        return radioValue !== "";
      case "counter":
        return true; // Counter always valid (can be 0)
    }
  };

  return (
    <MobileModal open={open} onOpenChange={onOpenChange}>
      <MobileModalContent className="max-h-[70vh]">
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* Lua avatar + message */}
          <div className="flex gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground mb-1">Lua</p>
              <div className="bg-muted/50 rounded-2xl rounded-tl-md px-4 py-3">
                <p className="text-foreground">{question.luaMessage}</p>
              </div>
            </div>
          </div>

          {/* Task context */}
          {taskTitle && (
            <p className="text-xs text-muted-foreground mb-4 px-2">
              Voor: <span className="font-medium text-foreground">{taskTitle}</span>
            </p>
          )}

          {/* Input based on type */}
          <div className="space-y-3">
            {question.inputType === "text" && (
              <Input
                value={textValue}
                onChange={(e) => setTextValue(e.target.value)}
                placeholder={question.placeholder}
                className="h-14 rounded-xl text-base"
                autoFocus
              />
            )}

            {question.inputType === "date" && (
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    className={cn(
                      "w-full h-14 rounded-xl border-2 border-dashed flex items-center gap-3 px-4 transition-all",
                      dateValue 
                        ? "border-primary bg-primary-light/50" 
                        : "border-muted hover:border-primary/50"
                    )}
                  >
                    <CalendarIcon className={cn("w-5 h-5", dateValue ? "text-primary" : "text-muted-foreground")} />
                    <span className={cn("flex-1 text-left", !dateValue && "text-muted-foreground")}>
                      {dateValue ? format(dateValue, "d MMMM yyyy", { locale: nl }) : "Kies een datum"}
                    </span>
                    {dateValue && (
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="center">
                  <Calendar
                    mode="single"
                    selected={dateValue}
                    onSelect={setDateValue}
                    initialFocus
                    locale={nl}
                  />
                </PopoverContent>
              </Popover>
            )}

            {question.inputType === "radio" && question.options && (
              <div className="space-y-2">
                {question.options.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setRadioValue(option.value)}
                    className={cn(
                      "w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between",
                      radioValue === option.value
                        ? "border-primary bg-primary-light"
                        : "border-muted hover:border-primary/50 bg-white"
                    )}
                  >
                    <span className={cn(
                      "font-medium",
                      radioValue === option.value ? "text-foreground" : "text-muted-foreground"
                    )}>
                      {option.label}
                    </span>
                    {radioValue === option.value && (
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}

            {question.inputType === "counter" && (
              <div className="flex items-center justify-between p-4 bg-white rounded-2xl border-2 border-muted">
                <span className="font-medium text-foreground">Aantal</span>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setCounterValue(Math.max(0, counterValue - 1))}
                    className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
                    disabled={counterValue === 0}
                  >
                    <Minus className="w-5 h-5 text-muted-foreground" />
                  </button>
                  <span className="w-10 text-center font-bold text-xl">{counterValue}</span>
                  <button
                    onClick={() => setCounterValue(counterValue + 1)}
                    className="w-10 h-10 rounded-full bg-primary flex items-center justify-center hover:bg-primary/90 transition-colors"
                  >
                    <Plus className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CTA */}
        <div className="p-6 pt-4 border-t bg-background flex gap-3">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)} 
            className="flex-1 h-12 rounded-xl"
          >
            Later
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!isValid()} 
            className="flex-1 h-12 rounded-xl"
          >
            Opslaan
          </Button>
        </div>
      </MobileModalContent>
    </MobileModal>
  );
};
