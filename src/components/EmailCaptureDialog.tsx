import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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
};

export const EmailCaptureDialog = ({
  open,
  onOpenChange,
  onEmailSubmit,
}: EmailCaptureDialogProps) => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      trackEvent("email_modal_shown");
    }
  }, [open]);

  const handleSubmit = async () => {
    const emailValidation = emailSchema.safeParse(email);

    if (!emailValidation.success) {
      toast({
        title: "Ongeldige invoer",
        description: emailValidation.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      trackEvent("email_submitted");
      onEmailSubmit(email);
      toast({
        title: "Top!",
        description: "We bewaren je voortgang.",
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

  // Prevent closing without submitting email
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && open) {
      // Don't allow closing - email is required
      return;
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent 
        className="sm:max-w-md animate-in fade-in-0 zoom-in-95 duration-200"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mb-2">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <DialogTitle className="text-2xl font-bold">
            Topstart! 🎉
          </DialogTitle>
          <DialogDescription className="text-base text-muted-foreground">
            Laat je e-mail achter zodat we je voortgang kunnen bewaren en je niets vergeet.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="capture-email" className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-muted-foreground" />
              E-mailadres
            </Label>
            <Input
              id="capture-email"
              type="email"
              placeholder="jouw@email.nl"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 rounded-xl"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSubmit();
                }
              }}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-2">
          <Button 
            onClick={handleSubmit} 
            disabled={isLoading} 
            className="h-12 rounded-xl text-base font-semibold"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Bezig...
              </>
            ) : (
              "Opslaan"
            )}
          </Button>
        </div>

        <p className="text-xs text-center text-muted-foreground pt-1">
          We gebruiken je e-mail alleen voor je verhuizing. Geen spam, beloofd.
        </p>
      </DialogContent>
    </Dialog>
  );
};
