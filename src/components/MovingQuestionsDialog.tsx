import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Building2, ArrowUp, DoorOpen, Package, Check, Piano, Refrigerator, PackageOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { MovingInfo } from "@/pages/Index";
import { supabase } from "@/integrations/supabase/client";

type MovingQuestionsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  movingInfo: MovingInfo;
  onComplete: (updatedInfo: Partial<MovingInfo>) => void;
  onRedirect: () => void;
};

type Step = 'floor' | 'elevator' | 'rooms' | 'items';

const floorOptions = [
  { value: 'begane-grond', label: 'Begane grond' },
  { value: '1', label: '1e verdieping' },
  { value: '2', label: '2e verdieping' },
  { value: '3', label: '3e verdieping' },
  { value: '4+', label: '4e of hoger' },
];

const roomOptions = [
  { value: '1-2', label: '1-2 kamers' },
  { value: '3-4', label: '3-4 kamers' },
  { value: '5-6', label: '5-6 kamers' },
  { value: '7+', label: '7 of meer' },
];

const specialItemOptions = [
  { value: 'piano', label: 'Piano/Vleugel', icon: Piano },
  { value: 'witgoed', label: 'Witgoed', icon: Refrigerator },
  { value: 'inpakservice', label: 'Inpakservice nodig', icon: PackageOpen },
];

export const MovingQuestionsDialog = ({
  open,
  onOpenChange,
  movingInfo,
  onComplete,
  onRedirect,
}: MovingQuestionsDialogProps) => {
  const [step, setStep] = useState<Step>('floor');
  const [floorLevel, setFloorLevel] = useState(movingInfo.floorLevel || '');
  const [hasElevator, setHasElevator] = useState(movingInfo.hasElevator || '');
  const [numberOfRooms, setNumberOfRooms] = useState(movingInfo.numberOfRooms || '');
  const [specialItems, setSpecialItems] = useState<string[]>(movingInfo.specialItems || []);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const steps: Step[] = [];
  if (!movingInfo.floorLevel) steps.push('floor');
  if (!movingInfo.hasElevator) steps.push('elevator');
  if (!movingInfo.numberOfRooms) steps.push('rooms');
  if (!movingInfo.specialItems || movingInfo.specialItems.length === 0) steps.push('items');

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
              floor_level: floorLevel || null,
              has_elevator: hasElevator || null,
              number_of_rooms: numberOfRooms || null,
              special_items: specialItems.length > 0 ? specialItems : [],
            })
            .eq('user_id', user.id);
        }
        
        onComplete({
          floorLevel,
          hasElevator,
          numberOfRooms,
          specialItems,
        });
        onRedirect();
        onOpenChange(false);
      } catch (error) {
        console.error('Error saving moving preferences:', error);
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

  const toggleSpecialItem = (item: string) => {
    setSpecialItems(prev => 
      prev.includes(item) 
        ? prev.filter(i => i !== item)
        : [...prev, item]
    );
  };

  const canProceed = () => {
    switch (step) {
      case 'floor': return !!floorLevel;
      case 'elevator': return !!hasElevator;
      case 'rooms': return !!numberOfRooms;
      case 'items': return true; // Optional step
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
      case 'floor':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-foreground">Op welke verdieping woon je?</h3>
              <p className="text-muted-foreground text-sm">Dit helpt bij het inschatten van de verhuiskosten.</p>
            </div>
            <div className="space-y-2">
              {floorOptions.map((option) => (
                <OptionButton
                  key={option.value}
                  selected={floorLevel === option.value}
                  onClick={() => setFloorLevel(option.value)}
                  icon={Building2}
                  label={option.label}
                />
              ))}
            </div>
          </div>
        );

      case 'elevator':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-foreground">Is er een lift aanwezig?</h3>
              <p className="text-muted-foreground text-sm">Belangrijk voor het plannen van de verhuizing.</p>
            </div>
            <div className="space-y-2">
              <OptionButton
                selected={hasElevator === 'ja'}
                onClick={() => setHasElevator('ja')}
                icon={ArrowUp}
                label="Ja, er is een lift"
              />
              <OptionButton
                selected={hasElevator === 'nee'}
                onClick={() => setHasElevator('nee')}
                icon={Building2}
                label="Nee, geen lift"
              />
              <OptionButton
                selected={hasElevator === 'nvt'}
                onClick={() => setHasElevator('nvt')}
                icon={DoorOpen}
                label="Niet van toepassing"
              />
            </div>
          </div>
        );

      case 'rooms':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-foreground">Hoeveel kamers verhuis je?</h3>
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

      case 'items':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-foreground">Zijn er speciale items?</h3>
              <p className="text-muted-foreground text-sm">Selecteer wat van toepassing is (optioneel).</p>
            </div>
            <div className="space-y-2">
              {specialItemOptions.map((option) => (
                <OptionButton
                  key={option.value}
                  selected={specialItems.includes(option.value)}
                  onClick={() => toggleSpecialItem(option.value)}
                  icon={option.icon}
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
            <Package className="w-5 h-5 text-primary" />
            Verhuisdetails
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
