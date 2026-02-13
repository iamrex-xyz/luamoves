import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Package, DoorOpen, Wine, Check, Sparkles, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { MovingInfo } from "@/pages/Index";
import { useProfileSync } from "@/hooks/useProfileSync";

type BoxesQuestionsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  movingInfo: MovingInfo;
  onComplete: (updatedInfo: Partial<MovingInfo>) => void;
  onRedirect: () => void;
  onCompleteTask?: () => void;
};

type Step = 'rooms' | 'fragile' | 'advice' | 'confirmation';

const roomOptions = [
  { value: '1-2', label: '1-2 kamers', boxes: 15 },
  { value: '3-4', label: '3-4 kamers', boxes: 30 },
  { value: '5-6', label: '5-6 kamers', boxes: 50 },
  { value: '7+', label: '7 of meer', boxes: 70 },
];

export const BoxesQuestionsDialog = ({
  open,
  onOpenChange,
  movingInfo,
  onComplete,
  onRedirect,
  onCompleteTask,
}: BoxesQuestionsDialogProps) => {
  const { saveToProfile } = useProfileSync();
  const [step, setStep] = useState<Step>('rooms');
  const [numberOfRooms, setNumberOfRooms] = useState(movingInfo.numberOfRooms || '');
  const [hasFragileItems, setHasFragileItems] = useState(movingInfo.hasFragileItems || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate which steps are needed
  const steps: Step[] = useMemo(() => {
    const s: Step[] = [];
    if (!movingInfo.numberOfRooms) s.push('rooms');
    if (!movingInfo.hasFragileItems) s.push('fragile');
    s.push('advice'); // Always show advice at the end
    return s;
  }, [movingInfo]);

  const currentStepIndex = steps.indexOf(step);
  const isLastStep = step === 'advice';

  // Calculate box recommendation
  const boxRecommendation = useMemo(() => {
    const rooms = numberOfRooms || movingInfo.numberOfRooms;
    const roomData = roomOptions.find(r => r.value === rooms);
    let baseBoxes = roomData?.boxes || 30;
    
    const fragile = hasFragileItems || movingInfo.hasFragileItems;
    if (fragile === 'yes') {
      baseBoxes = Math.round(baseBoxes * 1.2); // 20% more for fragile items
    }
    
    return baseBoxes;
  }, [numberOfRooms, hasFragileItems, movingInfo]);

  const handleNext = async () => {
    if (step === 'advice') {
      setIsSubmitting(true);
      try {
        const data = {
          numberOfRooms: numberOfRooms || movingInfo.numberOfRooms,
          hasFragileItems: hasFragileItems || movingInfo.hasFragileItems,
        };
        
        // Save using profileSync hook
        await saveToProfile(data);
        
        onComplete(data);
        // Show confirmation screen instead of redirecting
        setStep('confirmation');
      } catch (error) {
        console.error('Error saving boxes preferences:', error);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      const nextIndex = currentStepIndex + 1;
      if (nextIndex < steps.length) {
        setStep(steps[nextIndex]);
      }
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setStep(steps[currentStepIndex - 1]);
    }
  };

  const handleClose = () => {
    setStep('rooms');
    setNumberOfRooms(movingInfo.numberOfRooms || '');
    setHasFragileItems(movingInfo.hasFragileItems || '');
    onOpenChange(false);
  };

  const handleGoToDeals = () => {
    onRedirect();
    handleClose();
  };

  const canProceed = () => {
    switch (step) {
      case 'rooms': return !!numberOfRooms;
      case 'fragile': return !!hasFragileItems;
      case 'advice': return true;
      default: return false;
    }
  };

  const OptionButton = ({ 
    selected, 
    onClick, 
    icon: Icon, 
    label 
  }: { 
    selected: boolean; 
    onClick: () => void; 
    icon: any; 
    label: string;
  }) => (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 p-4 rounded-2xl border-2 transition-all w-full text-left",
        selected 
          ? "border-primary bg-primary-light" 
          : "border-muted bg-white hover:border-primary/50"
      )}
    >
      <div className={cn(
        "w-10 h-10 rounded-xl flex items-center justify-center transition-colors shrink-0",
        selected ? "bg-gradient-to-br from-primary to-primary/80" : "bg-muted"
      )}>
        <Icon className={cn("w-5 h-5", selected ? "text-white" : "text-muted-foreground")} />
      </div>
      <span className={cn("font-medium", selected ? "text-foreground" : "text-muted-foreground")}>
        {label}
      </span>
      {selected && (
        <div className="ml-auto w-6 h-6 bg-primary rounded-full flex items-center justify-center shrink-0">
          <Check className="w-3 h-3 text-white" />
        </div>
      )}
    </button>
  );

  // Confirmation screen
  if (step === 'confirmation') {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-center">
              Wordt geregeld!
            </h2>
            <p className="text-muted-foreground text-center text-sm">
              Je advies: ~{boxRecommendation} verhuisdozen
            </p>
            <div className="w-full space-y-2 mt-4">
              <Button 
                onClick={handleGoToDeals}
                className="w-full"
              >
                Bekijk aanbiedingen
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  onCompleteTask?.();
                  handleClose();
                }}
                className="w-full"
              >
                <Check className="w-4 h-4 mr-2" />
                Taak afronden
              </Button>
              <Button 
                variant="ghost"
                onClick={handleClose}
                className="w-full text-muted-foreground"
              >
                Sluiten
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const renderStep = () => {
    switch (step) {
      case 'rooms':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-foreground">Hoeveel kamers heeft je woning?</h3>
              <p className="text-muted-foreground text-sm">Inclusief woonkamer en slaapkamers.</p>
            </div>
            <div className="space-y-2">
              {roomOptions.map((option) => (
                <OptionButton
                  key={option.value}
                  selected={numberOfRooms === option.value}
                  onClick={() => setNumberOfRooms(option.value)}
                  icon={DoorOpen}
                  label={option.label}
                />
              ))}
            </div>
          </div>
        );

      case 'fragile':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-foreground">Heb je veel breekbare spullen?</h3>
              <p className="text-muted-foreground text-sm">Denk aan glaswerk, servies, kunst, etc.</p>
            </div>
            <div className="space-y-2">
              <OptionButton
                selected={hasFragileItems === 'yes'}
                onClick={() => setHasFragileItems('yes')}
                icon={Wine}
                label="Ja, ik heb veel breekbare spullen"
              />
              <OptionButton
                selected={hasFragileItems === 'no'}
                onClick={() => setHasFragileItems('no')}
                icon={Package}
                label="Nee, niet bijzonder veel"
              />
            </div>
          </div>
        );

      case 'advice':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-foreground">Ons advies</h3>
              <p className="text-muted-foreground text-sm">Op basis van je gegevens.</p>
            </div>
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-6 text-center">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <p className="text-2xl font-bold text-foreground mb-2">
                ~{boxRecommendation} verhuisdozen
              </p>
              <p className="text-muted-foreground text-sm">
                {(hasFragileItems || movingInfo.hasFragileItems) === 'yes' 
                  ? "Inclusief extra dozen voor breekbare spullen"
                  : "Standaard schatting voor je woning"
                }
              </p>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Tip: Bestel iets meer dan je denkt nodig te hebben. Je kunt altijd retourneren!
            </p>
          </div>
        );
    }
  };

  // Calculate progress (excluding advice step from progress bar)
  const progressSteps = steps.filter((s): s is 'rooms' | 'fragile' => s !== 'advice');
  const progressIndex = step !== 'advice' ? progressSteps.indexOf(step as 'rooms' | 'fragile') : -1;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            Verhuisdozen advies
          </DialogTitle>
        </DialogHeader>

        {/* Progress indicator - only show for question steps */}
        {step !== 'advice' && progressSteps.length > 0 && (
          <div className="flex gap-1 mb-4">
            {progressSteps.map((_, idx) => (
              <div 
                key={idx} 
                className={cn(
                  "h-1 flex-1 rounded-full transition-all",
                  idx <= progressIndex ? "bg-primary" : "bg-muted"
                )} 
              />
            ))}
          </div>
        )}

        {renderStep()}

        <div className="flex justify-between mt-6">
          {currentStepIndex > 0 && step !== 'advice' ? (
            <Button variant="ghost" onClick={handleBack}>
              Terug
            </Button>
          ) : (
            <div />
          )}
          <Button 
            onClick={handleNext} 
            disabled={!canProceed() || isSubmitting}
          >
            {isSubmitting ? "Opslaan..." : step === 'advice' ? "Opslaan" : "Volgende"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
