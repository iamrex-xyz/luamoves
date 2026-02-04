import { useState, useEffect } from "react";
import {
  MobileModal,
  MobileModalContent,
} from "@/components/ui/mobile-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  Building2, 
  ArrowUp, 
  Check, 
  Sparkles, 
  CheckCircle2, 
  Home, 
  MapPin, 
  CalendarIcon,
  Ruler,
  Layers
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MovingInfo } from "@/pages/Index";
import { IntakeIntroStep } from "@/components/IntakeIntroStep";
import { supabase } from "@/integrations/supabase/client";
import { useProfileSync } from "@/hooks/useProfileSync";
import { format } from "date-fns";
import { nl } from "date-fns/locale";

type MovingQuestionsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  movingInfo: MovingInfo;
  onComplete: (updatedInfo: Partial<MovingInfo>) => void;
  onRedirect: () => void;
  onCompleteTask?: () => void;
};

type Step = 'intro' | 'dates' | 'addresses' | 'details' | 'confirmation';

const woningTypes = [
  { value: "appartement", label: "Appartement" },
  { value: "tussenwoning", label: "Tussenwoning" },
  { value: "hoekwoning", label: "Hoekwoning" },
  { value: "twee_onder_een_kap", label: "2-onder-1-kap" },
  { value: "vrijstaand", label: "Vrijstaande woning" },
];

const floorOptions = [
  { value: 'begane-grond', label: 'Begane grond' },
  { value: '1', label: '1e verdieping' },
  { value: '2', label: '2e verdieping' },
  { value: '3', label: '3e verdieping' },
  { value: '4+', label: '4e of hoger' },
];

const sizeOptions = [
  { value: "10-20", label: "10-20 m³ (studio/1-kamer)" },
  { value: "20-40", label: "20-40 m³ (2-3 kamers)" },
  { value: "40-60", label: "40-60 m³ (4-5 kamers)" },
  { value: "60-80", label: "60-80 m³ (grote woning)" },
  { value: "80+", label: "80+ m³ (zeer groot)" },
];

export const MovingQuestionsDialog = ({
  open,
  onOpenChange,
  movingInfo,
  onComplete,
  onRedirect,
  onCompleteTask,
}: MovingQuestionsDialogProps) => {
  const { saveToProfile } = useProfileSync();
  const [step, setStep] = useState<Step>('intro');
  const [movingDate, setMovingDate] = useState<Date | undefined>(
    movingInfo.movingDate ? new Date(movingInfo.movingDate) : undefined
  );
  const [oldAddress, setOldAddress] = useState(movingInfo.oldAddress || '');
  const [newAddress, setNewAddress] = useState(movingInfo.newAddress || '');
  const [woningType, setWoningType] = useState((movingInfo as any).housingPropertyType || '');
  const [floorLevel, setFloorLevel] = useState(movingInfo.floorLevel || '');
  const [hasElevator, setHasElevator] = useState(movingInfo.hasElevator || '');
  const [movingSize, setMovingSize] = useState((movingInfo as any).movingSize || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setMovingDate(movingInfo.movingDate ? new Date(movingInfo.movingDate) : undefined);
      setOldAddress(movingInfo.oldAddress || '');
      setNewAddress(movingInfo.newAddress || '');
      setWoningType((movingInfo as any).housingPropertyType || '');
      setFloorLevel(movingInfo.floorLevel || '');
      setHasElevator(movingInfo.hasElevator || '');
      setMovingSize((movingInfo as any).movingSize || '');
      setStep('intro');
    }
  }, [open, movingInfo]);

  const handleNext = async () => {
    if (step === 'intro') {
      setStep('dates');
    } else if (step === 'dates') {
      setStep('addresses');
    } else if (step === 'addresses') {
      setStep('details');
    } else if (step === 'details') {
      setIsSubmitting(true);
      try {
        // Save all data using profileSync hook
        const profileData = {
          movingDate: movingDate?.toISOString().split('T')[0] || undefined,
          oldAddress: oldAddress || undefined,
          newAddress: newAddress || undefined,
          housingPropertyType: woningType || undefined,
          floorLevel: floorLevel || undefined,
          hasElevator: hasElevator || undefined,
          homeSizeM2: movingSize || undefined,
        };
        
        await saveToProfile(profileData);

        // Update task status to "in_progress" (offertes aangevraagd)
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const movingTaskIds = [
            'rent-fase2-verhuisbedrijf',
            'buy-fase2-verhuisbedrijf',
          ];
          
          for (const taskId of movingTaskIds) {
            await supabase
              .from('tasks')
              .upsert({
                user_id: user.id,
                task_id: taskId,
                status: 'in_progress',
              }, {
                onConflict: 'user_id,task_id',
              });
          }
        }
        
        onComplete({
          movingDate: movingDate?.toISOString(),
          oldAddress,
          newAddress,
          housingPropertyType: woningType,
          floorLevel,
          hasElevator,
          movingSize,
        } as any);
        
        setStep('confirmation');
      } catch (error) {
        console.error('Error saving moving preferences:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const canProceed = () => {
    switch (step) {
      case 'dates':
        return !!movingDate;
      case 'addresses':
        return oldAddress.trim().length >= 5 && newAddress.trim().length >= 5;
      case 'details':
        return woningType !== '' && floorLevel !== '' && hasElevator !== '' && movingSize !== '';
      default:
        return false;
    }
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <MobileModal open={open} onOpenChange={onOpenChange}>
      <MobileModalContent className="max-h-[90vh]">
        {step === 'intro' ? (
          <IntakeIntroStep 
            taskType="moving"
            onContinue={() => setStep('dates')}
            onCancel={handleClose}
          />
        ) : step === 'confirmation' ? (
          // Confirmation screen
          <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 text-center">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-3">
              Aanvraag ontvangen!
            </h2>
            <p className="text-muted-foreground mb-2 max-w-[280px]">
              We gaan offertes opvragen bij betrouwbare verhuisbedrijven.
            </p>
            <p className="text-sm text-muted-foreground mb-8 max-w-[280px]">
              Je ontvangt binnenkort vergelijkbare offertes in je inbox.
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
                {["dates", "addresses", "details"].map((s, idx) => (
                  <div 
                    key={s}
                    className={cn(
                      "h-1 flex-1 rounded-full transition-colors",
                      idx <= ["dates", "addresses", "details"].indexOf(step)
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
                    {step === "dates" && (
                      <p className="text-foreground">
                        Wanneer ga je verhuizen? 📅
                      </p>
                    )}
                    {step === "addresses" && (
                      <p className="text-foreground">
                        Waar verhuis je vandaan en naartoe? 🏠
                      </p>
                    )}
                    {step === "details" && (
                      <p className="text-foreground">
                        Nog een paar details voor een goede offerte 📦
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Input based on step */}
              <div className="space-y-4">
                {step === "dates" && (
                  <div className="space-y-2">
                    <Label className="text-sm flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                      Verhuisdatum
                    </Label>
                    <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full h-14 justify-start text-left font-normal rounded-xl text-base",
                            !movingDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {movingDate ? format(movingDate, "d MMMM yyyy", { locale: nl }) : "Kies een datum"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 z-50" align="start">
                        <Calendar
                          mode="single"
                          selected={movingDate}
                          onSelect={(date) => {
                            setMovingDate(date);
                            setCalendarOpen(false);
                          }}
                          disabled={(date) => date < new Date()}
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                )}

                {step === "addresses" && (
                  <>
                    <div className="space-y-2">
                      <Label className="text-sm flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        Oud adres (waar je nu woont)
                      </Label>
                      <Input
                        type="text"
                        placeholder="Straatnaam 123, Plaats"
                        value={oldAddress}
                        onChange={(e) => setOldAddress(e.target.value)}
                        className="h-14 rounded-xl text-base"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm flex items-center gap-2">
                        <Home className="w-4 h-4 text-muted-foreground" />
                        Nieuw adres
                      </Label>
                      <Input
                        type="text"
                        placeholder="Straatnaam 123, Plaats"
                        value={newAddress}
                        onChange={(e) => setNewAddress(e.target.value)}
                        className="h-14 rounded-xl text-base"
                      />
                    </div>
                  </>
                )}

                {step === "details" && (
                  <>
                    {/* Woningtype */}
                    <div className="space-y-2">
                      <Label className="text-sm flex items-center gap-2 mb-2">
                        <Building2 className="w-4 h-4 text-muted-foreground" />
                        Type woning
                      </Label>
                      <div className="grid grid-cols-2 gap-2">
                        {woningTypes.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => setWoningType(option.value)}
                            className={cn(
                              "p-3 rounded-xl border-2 transition-all text-sm",
                              woningType === option.value
                                ? "border-primary bg-primary-light text-foreground"
                                : "border-muted hover:border-primary/50 bg-white text-muted-foreground"
                            )}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Grootte */}
                    <div className="space-y-2">
                      <Label className="text-sm flex items-center gap-2 mb-2">
                        <Ruler className="w-4 h-4 text-muted-foreground" />
                        Geschatte grootte
                      </Label>
                      <div className="space-y-2">
                        {sizeOptions.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => setMovingSize(option.value)}
                            className={cn(
                              "w-full p-3 rounded-xl border-2 transition-all flex items-center justify-between text-sm",
                              movingSize === option.value
                                ? "border-primary bg-primary-light"
                                : "border-muted hover:border-primary/50 bg-white"
                            )}
                          >
                            <span className={cn(
                              "font-medium",
                              movingSize === option.value ? "text-foreground" : "text-muted-foreground"
                            )}>
                              {option.label}
                            </span>
                            {movingSize === option.value && (
                              <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                                <Check className="w-3 h-3 text-white" />
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Verdieping */}
                    <div className="space-y-2">
                      <Label className="text-sm flex items-center gap-2 mb-2">
                        <Layers className="w-4 h-4 text-muted-foreground" />
                        Verdieping (nieuwe woning)
                      </Label>
                      <div className="grid grid-cols-3 gap-2">
                        {floorOptions.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => setFloorLevel(option.value)}
                            className={cn(
                              "p-2 rounded-xl border-2 transition-all text-xs",
                              floorLevel === option.value
                                ? "border-primary bg-primary-light text-foreground"
                                : "border-muted hover:border-primary/50 bg-white text-muted-foreground"
                            )}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Lift */}
                    <div className="space-y-2">
                      <Label className="text-sm flex items-center gap-2 mb-2">
                        <ArrowUp className="w-4 h-4 text-muted-foreground" />
                        Is er een lift?
                      </Label>
                      <div className="flex gap-2">
                        {[
                          { value: "ja", label: "Ja" },
                          { value: "nee", label: "Nee" },
                          { value: "nvt", label: "N.v.t." },
                        ].map((option) => (
                          <button
                            key={option.value}
                            onClick={() => setHasElevator(option.value)}
                            className={cn(
                              "flex-1 p-3 rounded-xl border-2 transition-all text-sm font-medium",
                              hasElevator === option.value
                                ? "border-primary bg-primary-light text-foreground"
                                : "border-muted hover:border-primary/50 bg-white text-muted-foreground"
                            )}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
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
                disabled={!canProceed() || isSubmitting} 
                className="flex-1 h-12 rounded-xl"
              >
                {isSubmitting ? "Versturen..." : step === "details" ? "Offertes aanvragen" : "Volgende"}
              </Button>
            </div>
          </>
        )}
      </MobileModalContent>
    </MobileModal>
  );
};
