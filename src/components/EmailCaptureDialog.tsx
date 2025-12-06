import { useState, useEffect } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
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

  // Check if email is valid for button state
  const isEmailValid = emailSchema.safeParse(email).success;

  return (
    <Sheet open={open} onOpenChange={() => {}}>
      <SheetContent 
        side="bottom" 
        className="h-[100dvh] p-0 flex flex-col"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <div className="flex-1 overflow-y-auto p-6 flex flex-col justify-center">
          {/* Header */}
          <div className="text-center space-y-3 mb-8">
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
                  : "Laat je e-mail achter zodat we je voortgang kunnen bewaren en je niets vergeet."
                }
              </p>
            </div>
          </div>

          <div className="flex-1 space-y-6">
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
              <p className="text-sm text-muted-foreground">
                Lua onthoudt alles voor je, zodat jij je kunt focussen op verhuizen.
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="pt-4 mt-auto space-y-3">
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
                isHardBlock ? "Volgende" : "Opslaan"
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              We gebruiken je e-mail alleen voor je verhuizing. Geen spam, beloofd.
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
