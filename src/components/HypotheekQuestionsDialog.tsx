import { useState, useEffect } from "react";
import {
  MobileModal,
  MobileModalContent,
} from "@/components/ui/mobile-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, Sparkles, CheckCircle2, Home, Euro, Calendar, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { MovingInfo } from "@/pages/Index";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProfileSync } from "@/hooks/useProfileSync";

type HypotheekQuestionsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  movingInfo: MovingInfo;
  onComplete: (data: Partial<MovingInfo> & Record<string, any>) => void;
  onCompleteTask?: () => void;
};

const werkSituatieOptions = [
  { value: "loondienst", label: "Loondienst (vast contract)" },
  { value: "loondienst_tijdelijk", label: "Loondienst (tijdelijk contract)" },
  { value: "zzp", label: "ZZP / Freelance" },
  { value: "ondernemer", label: "Ondernemer (BV/VOF)" },
  { value: "uitkering", label: "Uitkering" },
  { value: "pensioen", label: "Pensioen" },
];

const hypotheekDoelOptions = [
  { value: "eerste_woning", label: "Eerste woning kopen" },
  { value: "doorstromer", label: "Doorstromen naar andere woning" },
  { value: "oversluiten", label: "Huidige hypotheek oversluiten" },
  { value: "verbouwen", label: "Verbouwing financieren" },
];

type Step = "address" | "koopsom" | "inkomen" | "doel" | "confirmation";

export const HypotheekQuestionsDialog = ({
  open,
  onOpenChange,
  movingInfo,
  onComplete,
  onCompleteTask,
}: HypotheekQuestionsDialogProps) => {
  const { saveToProfile } = useProfileSync();
  const [currentStep, setCurrentStep] = useState<Step>("address");
  const [address, setAddress] = useState<string>("");
  const [koopsom, setKoopsom] = useState<string>("");
  const [werkSituatie, setWerkSituatie] = useState<string>("");
  const [heeftPartner, setHeeftPartner] = useState<string>("");
  const [hypotheekDoel, setHypotheekDoel] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setAddress(movingInfo.newAddress || "");
      setKoopsom("");
      setWerkSituatie("");
      setHeeftPartner("");
      setHypotheekDoel("");
      setCurrentStep("address");
    }
  }, [open, movingInfo]);

  const handleNext = async () => {
    if (currentStep === "address") {
      setCurrentStep("koopsom");
    } else if (currentStep === "koopsom") {
      setCurrentStep("inkomen");
    } else if (currentStep === "inkomen") {
      setCurrentStep("doel");
    } else if (currentStep === "doel") {
      setIsSaving(true);
      
      const data: Record<string, any> = {
        newAddress: address,
        hypotheekKoopsom: koopsom ? parseInt(koopsom) : null,
        hypotheekWerkSituatie: werkSituatie,
        hypotheekHeeftPartner: heeftPartner,
        hypotheekDoel: hypotheekDoel,
      };
      
      await saveToProfile(data);
      onComplete(data);
      
      setIsSaving(false);
      setCurrentStep("confirmation");
    }
  };

  const isCurrentStepValid = () => {
    switch (currentStep) {
      case "address":
        return address.trim().length >= 5;
      case "koopsom":
        return koopsom !== "" && parseInt(koopsom) > 0;
      case "inkomen":
        return werkSituatie !== "";
      case "doel":
        return hypotheekDoel !== "";
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
          <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 text-center">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-3">
              Wordt geregeld!
            </h2>
            <p className="text-muted-foreground mb-8 max-w-[280px]">
              Lua gaat aan de slag en komt snel terug met de beste hypotheekadviseurs voor jouw situatie.
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
              <div className="flex gap-1 mb-6">
                {["address", "koopsom", "inkomen", "doel"].map((step, idx) => (
                  <div 
                    key={step}
                    className={cn(
                      "h-1 flex-1 rounded-full transition-colors",
                      idx <= ["address", "koopsom", "inkomen", "doel"].indexOf(currentStep)
                        ? "bg-primary"
                        : "bg-muted"
                    )}
                  />
                ))}
              </div>

              <div className="flex gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground mb-1">Lua</p>
                  <div className="bg-muted/50 rounded-2xl rounded-tl-md px-4 py-3">
                    {currentStep === "address" && (
                      <p className="text-foreground">
                        Voor welke woning zoek je een hypotheek? 🏠
                      </p>
                    )}
                    {currentStep === "koopsom" && (
                      <p className="text-foreground">
                        Wat is de koopsom van de woning? 💰
                      </p>
                    )}
                    {currentStep === "inkomen" && (
                      <p className="text-foreground">
                        Vertel me iets over je werksituatie. Dit helpt bij het bepalen van je leencapaciteit. 💼
                      </p>
                    )}
                    {currentStep === "doel" && (
                      <p className="text-foreground">
                        Wat is je doel met de hypotheek? 🎯
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {currentStep === "address" && (
                  <div className="space-y-2">
                    <Label className="text-sm flex items-center gap-2">
                      <Home className="w-4 h-4 text-muted-foreground" />
                      Adres van de woning
                    </Label>
                    <Input
                      type="text"
                      placeholder="Straatnaam 123, Plaats"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="h-14 rounded-xl text-base"
                    />
                  </div>
                )}

                {currentStep === "koopsom" && (
                  <div className="space-y-2">
                    <Label className="text-sm flex items-center gap-2">
                      <Euro className="w-4 h-4 text-muted-foreground" />
                      Koopsom
                    </Label>
                    <Input
                      type="number"
                      placeholder="bijv. 450000"
                      value={koopsom}
                      onChange={(e) => setKoopsom(e.target.value)}
                      className="h-14 rounded-xl text-base"
                    />
                    <p className="text-xs text-muted-foreground">
                      De vraagprijs of het bedrag dat je wilt bieden
                    </p>
                  </div>
                )}

                {currentStep === "inkomen" && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm">Werksituatie</Label>
                      {werkSituatieOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setWerkSituatie(option.value)}
                          className={cn(
                            "w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between",
                            werkSituatie === option.value
                              ? "border-primary bg-primary/5"
                              : "border-muted hover:border-primary/50 bg-white"
                          )}
                        >
                          <span className={cn(
                            "font-medium",
                            werkSituatie === option.value ? "text-foreground" : "text-muted-foreground"
                          )}>
                            {option.label}
                          </span>
                          {werkSituatie === option.value && (
                            <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                    
                    <div className="space-y-2 pt-2">
                      <Label className="text-sm flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        Koop je samen?
                      </Label>
                      <div className="flex gap-3">
                        <button
                          onClick={() => setHeeftPartner("ja")}
                          className={cn(
                            "flex-1 p-4 rounded-xl border-2 transition-all",
                            heeftPartner === "ja"
                              ? "border-primary bg-primary/5"
                              : "border-muted hover:border-primary/50 bg-white"
                          )}
                        >
                          <span className="font-medium">Ja, met partner</span>
                        </button>
                        <button
                          onClick={() => setHeeftPartner("nee")}
                          className={cn(
                            "flex-1 p-4 rounded-xl border-2 transition-all",
                            heeftPartner === "nee"
                              ? "border-primary bg-primary/5"
                              : "border-muted hover:border-primary/50 bg-white"
                          )}
                        >
                          <span className="font-medium">Nee, alleen</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === "doel" && (
                  <div className="space-y-2">
                    {hypotheekDoelOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setHypotheekDoel(option.value)}
                        className={cn(
                          "w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between",
                          hypotheekDoel === option.value
                            ? "border-primary bg-primary/5"
                            : "border-muted hover:border-primary/50 bg-white"
                        )}
                      >
                        <span className={cn(
                          "font-medium",
                          hypotheekDoel === option.value ? "text-foreground" : "text-muted-foreground"
                        )}>
                          {option.label}
                        </span>
                        {hypotheekDoel === option.value && (
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
                {isSaving ? "Opslaan..." : currentStep === "doel" ? "Versturen" : "Volgende"}
              </Button>
            </div>
          </>
        )}
      </MobileModalContent>
    </MobileModal>
  );
};