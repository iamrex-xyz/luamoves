import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Shield, Ruler, Wallet, Check, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { MovingInfo } from "@/pages/Index";
import { supabase } from "@/integrations/supabase/client";

type InsuranceQuestionsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  movingInfo: MovingInfo;
  onComplete: (updatedInfo: Partial<MovingInfo>) => void;
  onRedirect: () => void;
};

type Step = 'size' | 'value';

const stepExplanations: Record<Step, string> = {
  size: "De grootte van je woning bepaalt vaak de basispremie van je verzekering.",
  value: "Dit bepaalt het verzekerd bedrag. Zo ben je niet onder- of oververzekerd.",
};

const sizeOptions = [
  { value: '0-50', label: 'Tot 50 m²' },
  { value: '50-75', label: '50-75 m²' },
  { value: '75-100', label: '75-100 m²' },
  { value: '100-150', label: '100-150 m²' },
  { value: '150+', label: 'Meer dan 150 m²' },
];

const valueOptions = [
  { value: 'low', label: 'Tot €25.000' },
  { value: 'medium', label: '€25.000 - €75.000' },
  { value: 'high', label: 'Meer dan €75.000' },
];

export const InsuranceQuestionsDialog = ({
  open,
  onOpenChange,
  movingInfo,
  onComplete,
  onRedirect,
}: InsuranceQuestionsDialogProps) => {
  const [step, setStep] = useState<Step>('size');
  const [homeSizeM2, setHomeSizeM2] = useState(movingInfo.homeSizeM2 || '');
  const [insuranceValue, setInsuranceValue] = useState(movingInfo.insuranceValue || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const steps: Step[] = useMemo(() => {
    const s: Step[] = [];
    if (!movingInfo.homeSizeM2) s.push('size');
    if (!movingInfo.insuranceValue) s.push('value');
    return s;
  }, [movingInfo]);

  const currentStepIndex = steps.indexOf(step);
  const isLastStep = currentStepIndex === steps.length - 1;

  const handleNext = async () => {
    if (isLastStep) {
      setIsSubmitting(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase
            .from('profiles')
            .update({
              home_size_m2: homeSizeM2 || movingInfo.homeSizeM2 || null,
              insurance_value: insuranceValue || movingInfo.insuranceValue || null,
            })
            .eq('user_id', user.id);
        }
        
        onComplete({
          homeSizeM2: homeSizeM2 || movingInfo.homeSizeM2,
          insuranceValue: (insuranceValue || movingInfo.insuranceValue) as "low" | "medium" | "high" | undefined,
        });
        onRedirect();
        onOpenChange(false);
      } catch (error) {
        console.error('Error saving insurance preferences:', error);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setStep(steps[currentStepIndex + 1]);
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setStep(steps[currentStepIndex - 1]);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 'size': return !!homeSizeM2;
      case 'value': return !!insuranceValue;
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

  const renderStep = () => {
    switch (step) {
      case 'size':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-foreground">Hoeveel m² is je woning?</h3>
            </div>
            <div className="flex items-start gap-2 px-2 py-2 bg-blue-50 rounded-lg border border-blue-100">
              <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-blue-700">{stepExplanations.size}</p>
            </div>
            <div className="space-y-2">
              {sizeOptions.map((option) => (
                <OptionButton
                  key={option.value}
                  selected={homeSizeM2 === option.value}
                  onClick={() => setHomeSizeM2(option.value)}
                  icon={Ruler}
                  label={option.label}
                />
              ))}
            </div>
          </div>
        );

      case 'value':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-foreground">Wat is de geschatte waarde van je inboedel?</h3>
            </div>
            <div className="flex items-start gap-2 px-2 py-2 bg-blue-50 rounded-lg border border-blue-100">
              <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-blue-700">{stepExplanations.value}</p>
            </div>
            <p className="text-muted-foreground text-sm">Denk aan meubels, elektronica, kleding, etc.</p>
            <div className="space-y-2">
              {valueOptions.map((option) => (
                <OptionButton
                  key={option.value}
                  selected={insuranceValue === option.value}
                  onClick={() => setInsuranceValue(option.value)}
                  icon={Wallet}
                  label={option.label}
                />
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Verzekering details
          </DialogTitle>
        </DialogHeader>

        {/* Progress indicator */}
        <div className="flex gap-1 mb-4">
          {steps.map((_, idx) => (
            <div 
              key={idx} 
              className={cn(
                "h-1 flex-1 rounded-full transition-all",
                idx <= currentStepIndex ? "bg-primary" : "bg-muted"
              )} 
            />
          ))}
        </div>

        {renderStep()}

        <div className="flex justify-between mt-6">
          {currentStepIndex > 0 ? (
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
            {isSubmitting ? "Opslaan..." : isLastStep ? "Bekijk aanbiedingen" : "Volgende"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
