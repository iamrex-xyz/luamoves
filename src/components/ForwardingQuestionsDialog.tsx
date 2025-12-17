import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";

interface ForwardingQuestionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (data: {
    forwardingStartDate: string;
    forwardingDuration: string;
    householdNames: string[];
  }) => void;
  onRedirect: () => void;
  existingData?: {
    forwardingStartDate?: string;
    forwardingDuration?: string;
    householdNames?: string[];
  };
}

export function ForwardingQuestionsDialog({
  open,
  onOpenChange,
  onComplete,
  onRedirect,
  existingData
}: ForwardingQuestionsDialogProps) {
  const [step, setStep] = useState(1);
  const [forwardingStartDate, setForwardingStartDate] = useState("");
  const [forwardingDuration, setForwardingDuration] = useState("");
  const [householdNames, setHouseholdNames] = useState<string[]>([]);
  const [newName, setNewName] = useState("");

  // Initialize values when dialog opens
  useEffect(() => {
    if (open) {
      setForwardingStartDate(existingData?.forwardingStartDate || "");
      setForwardingDuration(existingData?.forwardingDuration || "");
      setHouseholdNames(existingData?.householdNames || []);
      
      // Calculate which step to start from based on existing data
      if (!existingData?.forwardingStartDate) {
        setStep(1);
      } else if (!existingData?.forwardingDuration) {
        setStep(2);
      } else if (!existingData?.householdNames?.length) {
        setStep(3);
      } else {
        setStep(1);
      }
    }
  }, [open, existingData]);

  const handleNext = () => {
    if (step === 1 && forwardingStartDate) {
      if (existingData?.forwardingDuration) {
        if (existingData?.householdNames?.length) {
          handleComplete();
        } else {
          setStep(3);
        }
      } else {
        setStep(2);
      }
    } else if (step === 2 && forwardingDuration) {
      if (existingData?.householdNames?.length) {
        handleComplete();
      } else {
        setStep(3);
      }
    } else if (step === 3 && householdNames.length > 0) {
      handleComplete();
    }
  };

  const handleComplete = () => {
    onComplete({
      forwardingStartDate,
      forwardingDuration,
      householdNames
    });
    onOpenChange(false);
    onRedirect();
  };

  const addName = () => {
    if (newName.trim() && !householdNames.includes(newName.trim())) {
      setHouseholdNames([...householdNames, newName.trim()]);
      setNewName("");
    }
  };

  const removeName = (name: string) => {
    setHouseholdNames(householdNames.filter(n => n !== name));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addName();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>PostNL Doorstuurservice</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {step === 1 && (
            <div className="space-y-4">
              <Label>Wanneer moet de post doorgestuurd worden?</Label>
              <Input
                type="date"
                value={forwardingStartDate}
                onChange={(e) => setForwardingStartDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
              <Button 
                onClick={handleNext} 
                disabled={!forwardingStartDate}
                className="w-full"
              >
                Volgende
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <Label>Hoe lang wil je de post laten doorsturen?</Label>
              <RadioGroup value={forwardingDuration} onValueChange={setForwardingDuration}>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value="3" id="3months" />
                  <Label htmlFor="3months" className="flex-1 cursor-pointer">3 maanden</Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value="6" id="6months" />
                  <Label htmlFor="6months" className="flex-1 cursor-pointer">6 maanden</Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value="12" id="12months" />
                  <Label htmlFor="12months" className="flex-1 cursor-pointer">12 maanden</Label>
                </div>
              </RadioGroup>
              <Button 
                onClick={handleNext} 
                disabled={!forwardingDuration}
                className="w-full"
              >
                Volgende
              </Button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <Label>Voor welke namen moet de post doorgestuurd worden?</Label>
              
              <div className="flex gap-2">
                <Input
                  placeholder="Voer een naam in"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <Button onClick={addName} variant="outline" size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {householdNames.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {householdNames.map((name) => (
                    <Badge key={name} variant="secondary" className="px-3 py-1">
                      {name}
                      <button
                        onClick={() => removeName(name)}
                        className="ml-2 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}

              <Button 
                onClick={handleComplete} 
                disabled={householdNames.length === 0}
                className="w-full"
              >
                Naar PostNL
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
