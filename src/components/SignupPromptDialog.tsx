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
import { Eye, EyeOff, Loader2, ArrowRight, ArrowLeft, Users, Home, Phone, Mail, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { trackEvent, AnalyticsEvents } from "@/lib/analytics";
import { z } from "zod";

const emailSchema = z.string().trim().email("Voer een geldig e-mailadres in");
const passwordSchema = z.string().min(6, "Wachtwoord moet minimaal 6 tekens bevatten");
const phoneSchema = z.string().optional();

type SignupPromptDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSignupComplete: () => void;
  onSkip: () => void;
  isHardBlock?: boolean;
};

type Step = "info" | "account";

export const SignupPromptDialog = ({
  open,
  onOpenChange,
  onSignupComplete,
  onSkip,
  isHardBlock = false,
}: SignupPromptDialogProps) => {
  const { toast } = useToast();
  const [step, setStep] = useState<Step>("info");
  
  // Account fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // Profile fields
  const [phone, setPhone] = useState("");
  const [oldAddress, setOldAddress] = useState("");
  const [adults, setAdults] = useState("1");
  const [children, setChildren] = useState("0");
  const [pets, setPets] = useState("0");
  
  const [isLoading, setIsLoading] = useState(false);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setStep("info");
      trackEvent(
        isHardBlock 
          ? AnalyticsEvents.ACCOUNT_MODAL_SHOWN_AT_TASK_6 
          : AnalyticsEvents.ACCOUNT_MODAL_SHOWN_AT_TASK_2
      );
    }
  }, [open, isHardBlock]);

  const handleNext = () => {
    // Validate phone if provided
    if (phone && !/^[0-9+\-\s()]{6,20}$/.test(phone)) {
      toast({
        title: "Ongeldige invoer",
        description: "Voer een geldig telefoonnummer in",
        variant: "destructive",
      });
      return;
    }
    setStep("account");
  };

  const handleBack = () => {
    setStep("info");
  };

  const handleSignup = async () => {
    const emailValidation = emailSchema.safeParse(email);
    const passwordValidation = passwordSchema.safeParse(password);

    if (!emailValidation.success) {
      toast({
        title: "Ongeldige invoer",
        description: emailValidation.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    if (!passwordValidation.success) {
      toast({
        title: "Ongeldige invoer",
        description: passwordValidation.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/`;
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) throw error;

      if (data.user) {
        // Update profile with additional info
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            phone: phone || null,
            old_address: oldAddress || null,
            adults: parseInt(adults) || 1,
            children: parseInt(children) || 0,
            pets: parseInt(pets) || 0,
          })
          .eq('user_id', data.user.id);

        if (profileError) {
          console.error('Error updating profile:', profileError);
        }

        trackEvent(AnalyticsEvents.ACCOUNT_CREATED_FROM_MODAL);
        toast({
          title: "Voortgang opgeslagen 🎉",
          description: "Lekker bezig! Je account is aangemaakt.",
        });
        onSignupComplete();
      }
    } catch (error: any) {
      // Handle specific error cases
      if (error.message?.includes('already registered')) {
        toast({
          title: "E-mailadres al in gebruik",
          description: "Dit e-mailadres is al geregistreerd. Probeer in te loggen.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Fout bij aanmaken account",
          description: error.message,
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    trackEvent(AnalyticsEvents.ACCOUNT_MODAL_LATER_CLICKED);
    onSkip();
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && open) {
      if (isHardBlock) {
        return;
      }
      handleSkip();
      return;
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent 
        className="sm:max-w-md animate-in fade-in-0 zoom-in-95 duration-200"
        onPointerDownOutside={(e) => isHardBlock && e.preventDefault()}
        onEscapeKeyDown={(e) => isHardBlock && e.preventDefault()}
      >
        {step === "info" ? (
          <>
            <DialogHeader className="text-center space-y-2">
              <DialogTitle className="text-2xl font-bold">
                {isHardBlock ? "Nog één stap!" : "Je bent al lekker bezig!"}
              </DialogTitle>
              <DialogDescription className="text-base text-muted-foreground">
                Vul je gegevens aan zodat we je beter kunnen helpen
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  Telefoonnummer
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="06 12345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-12 rounded-xl"
                />
              </div>

              {/* Old Address */}
              <div className="space-y-2">
                <Label htmlFor="old-address" className="flex items-center gap-2">
                  <Home className="w-4 h-4 text-muted-foreground" />
                  Huidig adres
                </Label>
                <Input
                  id="old-address"
                  type="text"
                  placeholder="Straatnaam 123, Stad"
                  value={oldAddress}
                  onChange={(e) => setOldAddress(e.target.value)}
                  className="h-12 rounded-xl"
                />
              </div>

              {/* Household composition */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  Samenstelling huishouden
                </Label>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="adults" className="text-xs text-muted-foreground">Volwassenen</Label>
                    <Input
                      id="adults"
                      type="number"
                      min="1"
                      max="10"
                      value={adults}
                      onChange={(e) => setAdults(e.target.value)}
                      className="h-10 rounded-xl text-center"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="children" className="text-xs text-muted-foreground">Kinderen</Label>
                    <Input
                      id="children"
                      type="number"
                      min="0"
                      max="10"
                      value={children}
                      onChange={(e) => setChildren(e.target.value)}
                      className="h-10 rounded-xl text-center"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="pets" className="text-xs text-muted-foreground">Huisdieren</Label>
                    <Input
                      id="pets"
                      type="number"
                      min="0"
                      max="10"
                      value={pets}
                      onChange={(e) => setPets(e.target.value)}
                      className="h-10 rounded-xl text-center"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <Button onClick={handleNext} className="h-12 rounded-xl text-base font-semibold">
                Volgende
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              {!isHardBlock && (
                <Button variant="ghost" onClick={handleSkip} className="text-muted-foreground h-11">
                  Later verder
                </Button>
              )}
            </div>
          </>
        ) : (
          <>
            <DialogHeader className="text-center space-y-2">
              <DialogTitle className="text-2xl font-bold">
                Maak je account aan
              </DialogTitle>
              <DialogDescription className="text-base text-muted-foreground">
                Hiermee bewaar je je voortgang veilig
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="signup-email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  E-mailadres
                </Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="jouw@email.nl"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password" className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-muted-foreground" />
                  Wachtwoord
                </Label>
                <div className="relative">
                  <Input
                    id="signup-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Minimaal 6 tekens"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 rounded-xl pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <Button onClick={handleSignup} disabled={isLoading} className="h-12 rounded-xl text-base font-semibold">
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Bezig...
                  </>
                ) : (
                  "Account aanmaken"
                )}
              </Button>
              <Button variant="ghost" onClick={handleBack} disabled={isLoading} className="text-muted-foreground h-11">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Terug
              </Button>
            </div>

            <p className="text-xs text-center text-muted-foreground pt-1">
              Door je account te maken ga je akkoord met onze{" "}
              <a href="/voorwaarden" className="underline hover:text-foreground">voorwaarden</a>
              {" "}en{" "}
              <a href="/privacy" className="underline hover:text-foreground">privacyverklaring</a>.
            </p>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
