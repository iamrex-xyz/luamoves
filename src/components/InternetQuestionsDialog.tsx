import { useState, useEffect } from "react";
import {
  MobileModal,
  MobileModalContent,
} from "@/components/ui/mobile-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, Sparkles, CheckCircle2, Wifi, Home, Monitor, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";
import { MovingInfo } from "@/pages/Index";
import { useProfileSync } from "@/hooks/useProfileSync";

type InternetQuestionsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  movingInfo: MovingInfo;
  onComplete: (data: Partial<MovingInfo> & Record<string, any>) => void;
  onRedirect: () => void;
  onCompleteTask?: () => void;
};

type Step = "address" | "speed" | "bundle" | "confirmation";

export const InternetQuestionsDialog = ({
  open,
  onOpenChange,
  movingInfo,
  onComplete,
  onRedirect,
  onCompleteTask,
}: InternetQuestionsDialogProps) => {
  const { saveToProfile } = useProfileSync();
  const [currentStep, setCurrentStep] = useState<Step>("address");
  const [address, setAddress] = useState<string>("");
  const [speedPreference, setSpeedPreference] = useState<string>("");
  const [bundle, setBundle] = useState<string>("");
  const [worksFromHome, setWorksFromHome] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setAddress(movingInfo.newAddress || "");
      setSpeedPreference(movingInfo.internetSpeedPreference || "");
      setBundle(movingInfo.internetBundle || "");
      setWorksFromHome((movingInfo as any).worksFromHome || "");
      setCurrentStep("address");
    }
  }, [open, movingInfo]);

  const handleNext = async () => {
    if (currentStep === "address") {
      setCurrentStep("speed");
    } else if (currentStep === "speed") {
      setCurrentStep("bundle");
    } else if (currentStep === "bundle") {
      // Save all data and show confirmation
      setIsSaving(true);
      
      const data: Record<string, any> = {
        newAddress: address,
        internetSpeedPreference: speedPreference,
        internetBundle: bundle,
        worksFromHome: worksFromHome,
      };
      
      // Map to profile column names
      const profileData: Record<string, any> = {
        new_address: address,
        internet_speed_preference: speedPreference,
        internet_bundle: bundle,
        works_from_home: worksFromHome,
      };
      
      await saveToProfile(profileData);
      onComplete(data);
      
      setIsSaving(false);
      setCurrentStep("confirmation");
    }
  };

  const isCurrentStepValid = () => {
    switch (currentStep) {
      case "address":
        return address.trim().length >= 5;
      case "speed":
        return speedPreference !== "" && worksFromHome !== "";
      case "bundle":
        return bundle !== "";
      case "confirmation":
        return true;
    }
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <MobileModal open={open} onOpenChange={onOpenChange}>
      <MobileModalContent className="max-h-[85vh]">
        {currentStep === "confirmation" ? (
          // Confirmation screen
          <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 text-center">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-3">
              Gegevens ontvangen!
            </h2>
            <p className="text-muted-foreground mb-8 max-w-[280px]">
              We zijn op zoek naar de beste internetdeal voor jouw situatie.
            </p>
            <div className="w-full max-w-[280px] space-y-2">
              <Button 
                onClick={() => {
                  onCompleteTask?.();
                  handleClose();
                }}
                className="w-full h-12 rounded-xl"
              >
                <Check className="w-4 h-4 mr-2" />
                Taak afronden
              </Button>
              <Button 
                variant="ghost"
                onClick={handleClose}
                className="w-full h-10 text-muted-foreground"
              >
                Sluiten
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {/* Progress indicator */}
              <div className="flex gap-1 mb-6">
                {["address", "speed", "bundle"].map((step, idx) => (
                  <div 
                    key={step}
                    className={cn(
                      "h-1 flex-1 rounded-full transition-colors",
                      idx <= ["address", "speed", "bundle"].indexOf(currentStep)
                        ? "bg-primary"
                        : "bg-muted"
                    )}
                  />
                ))}
              </div>

              {/* Lua avatar + message */}
              <div className="flex gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground mb-1">Lua</p>
                  <div className="bg-muted/50 rounded-2xl rounded-tl-md px-4 py-3">
                    {currentStep === "address" && (
                      <p className="text-foreground">
                        Op welk adres wil je internet aansluiten? 🏠
                      </p>
                    )}
                    {currentStep === "speed" && (
                      <p className="text-foreground">
                        Welke internetsnelheid past bij jou? 🚀
                      </p>
                    )}
                    {currentStep === "bundle" && (
                      <p className="text-foreground">
                        Wat wil je allemaal afsluiten? 📺
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Input based on step */}
              <div className="space-y-4">
                {currentStep === "address" && (
                  <div className="space-y-2">
                    <Label className="text-sm flex items-center gap-2">
                      <Home className="w-4 h-4 text-muted-foreground" />
                      Adres nieuwe woning
                    </Label>
                    <Input
                      type="text"
                      placeholder="Straatnaam 123, Plaats"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="h-14 rounded-xl text-base"
                    />
                    <p className="text-xs text-muted-foreground">
                      Vul je volledige adres in inclusief huisnummer en plaats
                    </p>
                  </div>
                )}

                {currentStep === "speed" && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm flex items-center gap-2 mb-3">
                        <Wifi className="w-4 h-4 text-muted-foreground" />
                        Gewenste snelheid
                      </Label>
                      {[
                        { value: "basic", label: "Basis (tot 100 Mbps)", description: "Mail & browsen" },
                        { value: "medium", label: "Gemiddeld (100-500 Mbps)", description: "Streamen & videobellen" },
                        { value: "high", label: "Snel (500+ Mbps)", description: "Thuiswerken, gamen, 4K streamen" },
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setSpeedPreference(option.value)}
                          className={cn(
                            "w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between",
                            speedPreference === option.value
                              ? "border-primary bg-primary-light"
                              : "border-muted hover:border-primary/50 bg-white"
                          )}
                        >
                          <div className="text-left">
                            <span className={cn(
                              "font-medium block",
                              speedPreference === option.value ? "text-foreground" : "text-muted-foreground"
                            )}>
                              {option.label}
                            </span>
                            <span className="text-xs text-muted-foreground">{option.description}</span>
                          </div>
                          {speedPreference === option.value && (
                            <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                    
                    <div className="space-y-2 pt-2">
                      <Label className="text-sm flex items-center gap-2 mb-3">
                        <Monitor className="w-4 h-4 text-muted-foreground" />
                        Werk je thuis?
                      </Label>
                      {[
                        { value: "yes", label: "Ja, regelmatig" },
                        { value: "sometimes", label: "Soms" },
                        { value: "no", label: "Nee" },
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setWorksFromHome(option.value)}
                          className={cn(
                            "w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between",
                            worksFromHome === option.value
                              ? "border-primary bg-primary-light"
                              : "border-muted hover:border-primary/50 bg-white"
                          )}
                        >
                          <span className={cn(
                            "font-medium",
                            worksFromHome === option.value ? "text-foreground" : "text-muted-foreground"
                          )}>
                            {option.label}
                          </span>
                          {worksFromHome === option.value && (
                            <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {currentStep === "bundle" && (
                  <div className="space-y-2">
                    <Label className="text-sm flex items-center gap-2 mb-3">
                      <Smartphone className="w-4 h-4 text-muted-foreground" />
                      Wat wil je afsluiten?
                    </Label>
                    {[
                      { value: "internet_only", label: "Alleen internet", icon: "📡" },
                      { value: "internet_tv", label: "Internet + tv", icon: "📺" },
                      { value: "internet_tv_mobile", label: "Internet + tv + mobiel", icon: "📱" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setBundle(option.value)}
                        className={cn(
                          "w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between",
                          bundle === option.value
                            ? "border-primary bg-primary-light"
                            : "border-muted hover:border-primary/50 bg-white"
                        )}
                      >
                        <span className={cn(
                          "font-medium flex items-center gap-2",
                          bundle === option.value ? "text-foreground" : "text-muted-foreground"
                        )}>
                          <span>{option.icon}</span>
                          {option.label}
                        </span>
                        {bundle === option.value && (
                          <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* CTA */}
            <div className="p-6 pt-4 border-t bg-background flex gap-3">
              <Button 
                variant="outline" 
                onClick={handleClose} 
                className="flex-1 h-12 rounded-xl"
              >
                Later
              </Button>
              <Button 
                onClick={handleNext} 
                disabled={!isCurrentStepValid() || isSaving} 
                className="flex-1 h-12 rounded-xl"
              >
                {isSaving ? "Opslaan..." : currentStep === "bundle" ? "Versturen" : "Volgende"}
              </Button>
            </div>
          </>
        )}
      </MobileModalContent>
    </MobileModal>
  );
};
