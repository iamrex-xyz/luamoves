import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { MovingInfo } from "@/pages/Index";
import { cn } from "@/lib/utils";

type SimpleOnboardingProps = {
  onComplete: (info: MovingInfo) => void;
  onLogin: () => void;
};

export const SimpleOnboarding = ({ onComplete, onLogin }: SimpleOnboardingProps) => {
  const [step, setStep] = useState(1);
  const [movingDate, setMovingDate] = useState<Date | undefined>(undefined);
  const [postcode, setPostcode] = useState("");
  const [houseNumber, setHouseNumber] = useState("");

  const totalSteps = 3; // Welcome, date, address

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleComplete = () => {
    onComplete({
      oldAddress: "",
      newAddress: `${postcode} ${houseNumber}`.trim(),
      movingDate: movingDate ? format(movingDate, "yyyy-MM-dd") : "",
      type: "rent", // Default, will be asked later in context
      renovationType: "none",
      needsContractorHelp: false,
    });
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return true;
      case 2:
        return !!movingDate;
      case 3:
        return postcode.length >= 4 && houseNumber.length > 0;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-6 bg-gradient-to-br from-background via-secondary/20 to-primary/5">
      <Card 
        className={`w-full max-w-lg shadow-lg ${step === 1 ? 'cursor-pointer p-8 md:p-10' : 'p-6 md:p-8'}`}
        onClick={step === 1 ? handleNext : undefined}
      >
        {step > 1 && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              {Array.from({ length: 2 }, (_, i) => i + 1).map((num) => (
                <div
                  key={num}
                  className={`flex-1 h-2 mx-1 rounded-full transition-all ${
                    num <= (step - 1) ? "bg-primary" : "bg-muted"
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Vraag {step - 1} van 2
            </p>
          </div>
        )}

        <div className="space-y-6">
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300 text-center space-y-6">
              <h2 className="text-xl md:text-2xl font-bold text-primary leading-tight">
                Wat leuk dat je gaat verhuizen!
              </h2>
              <p className="text-muted-foreground">
                Ik ben Charly, jouw persoonlijke verhuisconcierge.
              </p>
              <Button
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  onLogin();
                }}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Heb je al een account? Log in
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-xl md:text-2xl font-semibold text-center mb-6">
                Wanneer ga je verhuizen?
              </h2>
              <div className="flex justify-center">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full max-w-xs justify-start text-left font-normal h-12",
                        !movingDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {movingDate ? format(movingDate, "d MMMM yyyy", { locale: nl }) : "Kies een datum"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="center">
                    <Calendar
                      mode="single"
                      selected={movingDate}
                      onSelect={setMovingDate}
                      initialFocus
                      locale={nl}
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-xl md:text-2xl font-semibold text-center mb-6">
                Wat is je nieuwe adres?
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="postcode">Postcode</Label>
                  <Input
                    id="postcode"
                    placeholder="1234 AB"
                    value={postcode}
                    onChange={(e) => setPostcode(e.target.value.toUpperCase())}
                    maxLength={7}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="houseNumber">Huisnummer</Label>
                  <Input
                    id="houseNumber"
                    placeholder="12"
                    value={houseNumber}
                    onChange={(e) => setHouseNumber(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          {step === 2 && (
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
                className="flex-1"
              >
                Terug
              </Button>
              <Button
                onClick={handleNext}
                disabled={!isStepValid()}
                className="flex-1"
              >
                Volgende
              </Button>
            </div>
          )}

          {step === 3 && (
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
                className="flex-1"
              >
                Terug
              </Button>
              <Button
                onClick={handleComplete}
                disabled={!isStepValid()}
                className="flex-1"
              >
                Bekijk mijn taken
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
