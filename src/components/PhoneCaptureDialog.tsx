import { useState, useEffect } from "react";
import {
  MobileModal,
  MobileModalContent,
} from "@/components/ui/mobile-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Phone, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { trackEvent } from "@/lib/analytics";
import { validatePhone, cleanPhone } from "@/lib/validation";

type PhoneCaptureDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPhoneSubmit: (phone: string) => void;
  onDismiss?: () => void;
  isHardBlock?: boolean;
};

export const PhoneCaptureDialog = ({
  open,
  onOpenChange,
  onPhoneSubmit,
  onDismiss,
  isHardBlock = false,
}: PhoneCaptureDialogProps) => {
  const { toast } = useToast();
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      trackEvent("phone_modal_shown");
      setPhone("");
      setPhoneError("");
    }
  }, [open]);

  const handleValidatePhone = (): boolean => {
    const result = validatePhone(phone);
    if (!result.isValid) {
      setPhoneError(result.error || "Ongeldig telefoonnummer");
      return false;
    }
    setPhoneError("");
    return true;
  };

  const isPhoneValid = phone.trim().length >= 10 && validatePhone(phone).isValid;

  const handleSubmit = async () => {
    if (!handleValidatePhone()) {
      return;
    }

    setIsLoading(true);

    try {
      const cleaned = cleanPhone(phone);
      trackEvent("phone_submitted");
      onPhoneSubmit(cleaned);
      toast({
        title: "Opgeslagen!",
        description: "Je telefoonnummer is bewaard.",
      });
    } catch (error: any) {
      toast({
        title: "Er ging iets mis",
        description: "Probeer het opnieuw.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLater = () => {
    trackEvent("phone_modal_skipped");
    if (onDismiss) {
      onDismiss();
    } else {
      onOpenChange(false);
    }
  };

  return (
    <MobileModal open={open} onOpenChange={() => {}}>
      <MobileModalContent 
        showCloseButton={!isHardBlock}
        onCloseClick={handleLater}
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {/* Header */}
          <div className="text-center space-y-3 mb-6">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">
                Goed bezig! 🎉
              </h2>
              <p className="text-muted-foreground mt-2">
                Wil je dat ik je voortgang bewaar? Dan kan ik je ook tips sturen.
              </p>
            </div>
          </div>

          {/* Form - phone only */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="capture-phone" className="flex items-center gap-2 text-base">
                <Phone className="w-4 h-4 text-muted-foreground" />
                Telefoonnummer
              </Label>
              <Input
                id="capture-phone"
                type="tel"
                placeholder="06 12345678"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (phoneError) setPhoneError("");
                }}
                className={`h-14 rounded-xl text-base ${phoneError ? 'border-destructive' : ''}`}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && isPhoneValid) {
                    handleSubmit();
                  }
                }}
              />
              {phoneError && (
                <p className="text-sm text-destructive">{phoneError}</p>
              )}
            </div>
          </div>
        </div>

        {/* Fixed bottom CTA */}
        <div className="p-6 pt-4 border-t bg-background space-y-3">
          <Button 
            onClick={handleSubmit} 
            disabled={!isPhoneValid || isLoading} 
            className="w-full h-14 rounded-xl text-lg font-semibold"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Bezig...
              </>
            ) : (
              "Opslaan & doorgaan"
            )}
          </Button>

          {!isHardBlock && (
            <Button 
              variant="ghost" 
              onClick={handleLater}
              className="w-full h-12 rounded-xl text-base text-muted-foreground"
            >
              Nu niet
            </Button>
          )}

          <p className="text-xs text-center text-muted-foreground">
            Alleen voor je verhuizing. Geen spam, beloofd.
          </p>
        </div>
      </MobileModalContent>
    </MobileModal>
  );
};