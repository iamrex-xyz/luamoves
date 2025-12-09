import { useState, useEffect } from "react";
import {
  MobileModal,
  MobileModalContent,
} from "@/components/ui/mobile-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Mail, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { trackEvent } from "@/lib/analytics";
import { z } from "zod";

const emailSchema = z.string().trim().email("Voer een geldig e-mailadres in");

type EmailCaptureDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEmailSubmit: (email: string) => void;
  isHardBlock?: boolean;
};

export const EmailCaptureDialog = ({
  open,
  onOpenChange,
  onEmailSubmit,
  isHardBlock = false,
}: EmailCaptureDialogProps) => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      trackEvent("email_modal_shown");
      setEmail("");
      setEmailError("");
    }
  }, [open]);

  const validateEmail = (): boolean => {
    const result = emailSchema.safeParse(email);
    if (!result.success) {
      setEmailError(result.error.errors[0].message);
      return false;
    }
    setEmailError("");
    return true;
  };

  const handleSubmit = async () => {
    if (!validateEmail()) {
      return;
    }

    setIsLoading(true);

    try {
      trackEvent("email_submitted");
      onEmailSubmit(email);
      toast({
        title: "Top!",
        description: isHardBlock ? "Nu nog even je account afronden." : "We bewaren je voortgang.",
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
    trackEvent("email_modal_skipped");
    onOpenChange(false);
  };

  // Check if email is valid for button state
  const isEmailValid = emailSchema.safeParse(email).success;

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
                {isHardBlock ? "Je bent lekker op dreef!" : "Topstart!"}
              </h2>
              <p className="text-muted-foreground mt-2">
{isHardBlock 
                  ? "Vul je e-mail in zodat we je voortgang veilig kunnen bewaren."
                  : "Laat je e-mail achter, dan bewaren we je voortgang."
                }
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-2">
            <Label htmlFor="capture-email" className="flex items-center gap-2 text-base">
              <Mail className="w-4 h-4 text-muted-foreground" />
              E-mailadres
            </Label>
            <Input
              id="capture-email"
              type="email"
              placeholder="jouw@email.nl"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) setEmailError("");
              }}
              className={`h-14 rounded-xl text-base ${emailError ? 'border-destructive' : ''}`}
              onKeyDown={(e) => {
                if (e.key === "Enter" && isEmailValid) {
                  handleSubmit();
                }
              }}
            />
            {emailError && (
              <p className="text-sm text-destructive">{emailError}</p>
            )}
          </div>
        </div>

        {/* Fixed bottom CTA */}
        <div className="p-6 pt-4 border-t bg-background space-y-3">
          <Button 
            onClick={handleSubmit} 
            disabled={!isEmailValid || isLoading} 
            className="w-full h-14 rounded-xl text-lg font-semibold"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Bezig...
              </>
            ) : (
              "Opslaan"
            )}
          </Button>

          {!isHardBlock && (
            <Button 
              variant="ghost" 
              onClick={handleLater}
              className="w-full h-12 rounded-xl text-base text-muted-foreground"
            >
              Later
            </Button>
          )}

          <p className="text-xs text-center text-muted-foreground">
            We gebruiken je e-mail alleen voor je verhuizing. Geen spam.
          </p>
        </div>
      </MobileModalContent>
    </MobileModal>
  );
};
