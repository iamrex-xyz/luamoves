import { useState, useEffect, useMemo } from "react";
import {
  MobileModal,
  MobileModalContent,
} from "@/components/ui/mobile-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { 
  Eye, 
  EyeOff, 
  Loader2, 
  Users, 
  Phone, 
  Lock,
  Calendar,
  Check,
  ArrowRight,
  Shield,
  Sparkles,
  MapPin
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { trackEvent } from "@/lib/analytics";
import { z } from "zod";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { cn } from "@/lib/utils";

// Password must be min 8 chars, at least 1 number
const passwordSchema = z.string()
  .min(8, "Wachtwoord moet minimaal 8 tekens bevatten")
  .regex(/[0-9]/, "Wachtwoord moet minimaal 1 cijfer bevatten");

type SignupPromptDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSignupComplete: () => void;
  capturedEmail?: string;
};

export const SignupPromptDialog = ({
  open,
  onOpenChange,
  onSignupComplete,
  capturedEmail = "",
}: SignupPromptDialogProps) => {
  const { toast } = useToast();
  
  // Step tracking - simplified to just 2 steps
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  
  // Step 1: Password
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [storedPassword, setStoredPassword] = useState("");
  
  // Step 2: Essential profile fields - postcode + huisnummer like onboarding
  const [oldPostcode, setOldPostcode] = useState("");
  const [oldHouseNumber, setOldHouseNumber] = useState("");
  const [oldStreetName, setOldStreetName] = useState("");
  const [oldCityName, setOldCityName] = useState("");
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [keyHandoverDate, setKeyHandoverDate] = useState<Date | undefined>(undefined);
  const [householdType, setHouseholdType] = useState<"alleen" | "samen" | "">(""); 
  const [phone, setPhone] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const [keyHandoverCalendarOpen, setKeyHandoverCalendarOpen] = useState(false);
  
  // Get onboarding data from sessionStorage
  const getOnboardingData = () => {
    try {
      const storedData = sessionStorage.getItem("lua_moving_info");
      if (storedData) {
        return JSON.parse(storedData);
      }
    } catch (e) {
      console.error("Error parsing onboarding data:", e);
    }
    return null;
  };

  // Address lookup effect - same as onboarding
  useEffect(() => {
    const lookupAddress = async () => {
      const cleanPostcode = oldPostcode.replace(/\s/g, "");
      if (cleanPostcode.length >= 6 && oldHouseNumber.length > 0) {
        setIsLoadingAddress(true);
        try {
          const searchQuery = `${cleanPostcode} ${oldHouseNumber}`;
          const apiUrl = `https://api.pdok.nl/bzk/locatieserver/search/v3_1/free?q=${encodeURIComponent(searchQuery)}&fq=type:(adres)&rows=1`;
          const response = await fetch(apiUrl);
          const data = await response.json();
          if (data.response?.docs?.[0]) {
            const result = data.response.docs[0];
            setOldStreetName(result.straatnaam || "");
            setOldCityName(result.woonplaatsnaam || "");
          } else {
            setOldStreetName("");
            setOldCityName("");
          }
        } catch (error) {
          console.error("Fout bij ophalen adres:", error);
          setOldStreetName("");
          setOldCityName("");
        } finally {
          setIsLoadingAddress(false);
        }
      } else {
        setOldStreetName("");
        setOldCityName("");
      }
    };
    const timeoutId = setTimeout(lookupAddress, 500);
    return () => clearTimeout(timeoutId);
  }, [oldPostcode, oldHouseNumber]);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      // Check if we already have a stored password (from previous step)
      if (storedPassword) {
        setCurrentStep(2);
      } else {
        setCurrentStep(1);
      }
      setPassword("");
      setPasswordError("");
      trackEvent("signup_prompt_shown");
    }
  }, [open, storedPassword]);

  const validatePassword = (): boolean => {
    const result = passwordSchema.safeParse(password);
    if (!result.success) {
      setPasswordError(result.error.errors[0].message);
      return false;
    }
    setPasswordError("");
    return true;
  };

  const isPasswordValid = useMemo(() => {
    return passwordSchema.safeParse(password).success;
  }, [password]);

  const handleStep1Next = () => {
    if (!validatePassword()) {
      return;
    }
    
    setStoredPassword(password);
    trackEvent("password_set");
    
    toast({
      title: "Wachtwoord opgeslagen ✅",
      description: "Nog een paar vragen...",
    });
    
    setCurrentStep(2);
  };

  // Check if step 2 is complete - need postcode (6 chars) + huisnummer
  const isAddressComplete = useMemo(() => {
    const cleanPostcode = oldPostcode.replace(/\s/g, "");
    return cleanPostcode.length >= 6 && oldHouseNumber.trim().length > 0;
  }, [oldPostcode, oldHouseNumber]);

  const canSubmit = useMemo(() => {
    return isAddressComplete;
  }, [isAddressComplete]);

  // Build full address string
  const getFullOldAddress = () => {
    if (oldStreetName && oldCityName) {
      return `${oldStreetName} ${oldHouseNumber}, ${oldPostcode} ${oldCityName}`;
    }
    return `${oldPostcode} ${oldHouseNumber}`.trim();
  };

  const handleSignup = async () => {
    if (!capturedEmail) {
      toast({
        title: "E-mail ontbreekt",
        description: "Er is iets misgegaan. Probeer opnieuw.",
        variant: "destructive",
      });
      return;
    }

    const passwordToUse = storedPassword || password;
    
    if (!passwordToUse) {
      toast({
        title: "Wachtwoord ontbreekt",
        description: "Er is iets misgegaan. Probeer opnieuw.",
        variant: "destructive",
      });
      return;
    }

    if (!isAddressComplete) {
      toast({
        title: "Volledig adres nodig",
        description: "Vul je postcode en huisnummer in.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/`;
      const { data, error } = await supabase.auth.signUp({
        email: capturedEmail,
        password: passwordToUse,
        options: {
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) throw error;

      if (data.user) {
        // Update sessionStorage with the data
        try {
          const storedData = sessionStorage.getItem("lua_moving_info");
          if (storedData) {
            const movingInfo = JSON.parse(storedData);
            movingInfo.oldAddress = getFullOldAddress();
            if (keyHandoverDate) {
              movingInfo.keyHandoverDate = format(keyHandoverDate, "yyyy-MM-dd");
            }
            sessionStorage.setItem("lua_moving_info", JSON.stringify(movingInfo));
          }
        } catch (e) {
          console.error("Error updating sessionStorage:", e);
        }
        
        // Update profile with the data
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            old_address: getFullOldAddress(),
            key_handover_date: keyHandoverDate ? format(keyHandoverDate, "yyyy-MM-dd") : null,
            household_type: householdType || null,
            phone: phone.trim() || null,
          })
          .eq('user_id', data.user.id);

        if (profileError) {
          console.error('Error updating profile:', profileError);
        }

        trackEvent("account_completed");
        
        // Clear password from state for security
        setStoredPassword("");
        setPassword("");
        
        toast({
          title: "Account aangemaakt! 🎉",
          description: "Ik onthou nu alles voor je.",
        });
        onSignupComplete();
      }
    } catch (error: any) {
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

  const handleLater = () => {
    trackEvent("signup_prompt_skipped");
    onOpenChange(false);
  };

  return (
    <MobileModal open={open} onOpenChange={onOpenChange}>
      <MobileModalContent 
        className="max-h-[85vh]"
        showCloseButton={true}
        onCloseClick={handleLater}
      >
        {currentStep === 1 ? (
          <>
            {/* Step 1: Password */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="text-center space-y-3 mb-6">
                <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                  <Shield className="w-7 h-7 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Dan maak ik je account compleet</h2>
                  <p className="text-muted-foreground mt-1">
                    Kies een wachtwoord zodat je altijd kunt inloggen.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                {/* E-mail display */}
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                  <p className="text-sm text-muted-foreground">E-mailadres</p>
                  <p className="font-medium">{capturedEmail}</p>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="flex items-center gap-2 text-base">
                    <Lock className="w-4 h-4 text-muted-foreground" />
                    Wachtwoord
                  </Label>
                  <div className="relative">
                    <Input
                      id="signup-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Minimaal 8 tekens met 1 cijfer"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (passwordError) setPasswordError("");
                      }}
                      className={cn(
                        "h-14 rounded-xl pr-12 text-base",
                        passwordError && "border-destructive focus-visible:ring-destructive"
                      )}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && isPasswordValid) {
                          handleStep1Next();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {passwordError && (
                    <p className="text-sm text-destructive">{passwordError}</p>
                  )}
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="p-6 pt-4 border-t bg-background">
              <Button 
                onClick={handleStep1Next}
                disabled={!isPasswordValid}
                className="w-full h-14 rounded-xl text-lg font-semibold"
              >
                Verder
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </>
        ) : (
          <>
            {/* Step 2: Essential profile info */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="text-center space-y-3 mb-6">
                <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                  <Sparkles className="w-7 h-7 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Nog een paar dingen</h2>
                  <p className="text-muted-foreground mt-1">
                    Dan kan ik alles voor je blijven bijhouden.
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                {/* Old Address - postcode + huisnummer like onboarding */}
                <div className="space-y-3">
                  <Label className="flex items-center gap-2 text-base">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    Waar woon je nu?
                  </Label>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <Input
                        placeholder="Postcode"
                        value={oldPostcode}
                        onChange={(e) => setOldPostcode(e.target.value.toUpperCase())}
                        className="h-14 rounded-xl text-base"
                        maxLength={7}
                      />
                    </div>
                    <div className="w-24">
                      <Input
                        placeholder="Nr."
                        value={oldHouseNumber}
                        onChange={(e) => setOldHouseNumber(e.target.value)}
                        className="h-14 rounded-xl text-base"
                      />
                    </div>
                  </div>
                  
                  {/* Show looked-up address */}
                  {isLoadingAddress && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Adres opzoeken...
                    </div>
                  )}
                  {!isLoadingAddress && oldStreetName && oldCityName && (
                    <div className="flex items-center gap-2 text-sm text-primary">
                      <Check className="w-4 h-4" />
                      {oldStreetName} {oldHouseNumber}, {oldCityName}
                    </div>
                  )}
                  {!isLoadingAddress && isAddressComplete && !oldStreetName && (
                    <p className="text-sm text-muted-foreground">
                      Adres niet gevonden, maar je kunt doorgaan.
                    </p>
                  )}
                </div>

                {/* Key Handover Date - optional */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-base">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    Wanneer krijg je de sleutels?
                    <span className="text-muted-foreground text-sm font-normal">(optioneel)</span>
                  </Label>
                  <Popover open={keyHandoverCalendarOpen} onOpenChange={setKeyHandoverCalendarOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full h-14 rounded-xl justify-start text-left font-normal text-base",
                          !keyHandoverDate && "text-muted-foreground"
                        )}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {keyHandoverDate ? format(keyHandoverDate, "d MMMM yyyy", { locale: nl }) : "Selecteer datum"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={keyHandoverDate}
                        onSelect={(date) => {
                          setKeyHandoverDate(date);
                          setKeyHandoverCalendarOpen(false);
                        }}
                        locale={nl}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Household Type - optional */}
                <div className="space-y-3">
                  <Label className="flex items-center gap-2 text-base">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    Verhuis je alleen of samen?
                    <span className="text-muted-foreground text-sm font-normal">(optioneel)</span>
                  </Label>
                  <RadioGroup
                    value={householdType}
                    onValueChange={(value) => setHouseholdType(value as "alleen" | "samen")}
                    className="flex gap-3"
                  >
                    <div className="flex-1">
                      <RadioGroupItem value="alleen" id="alleen" className="peer sr-only" />
                      <Label
                        htmlFor="alleen"
                        className={cn(
                          "flex items-center justify-center gap-2 rounded-xl border-2 p-4 cursor-pointer transition-all",
                          householdType === "alleen" 
                            ? "border-primary bg-primary/5" 
                            : "border-muted hover:border-primary/50"
                        )}
                      >
                        {householdType === "alleen" && <Check className="w-4 h-4 text-primary" />}
                        Alleen
                      </Label>
                    </div>
                    <div className="flex-1">
                      <RadioGroupItem value="samen" id="samen" className="peer sr-only" />
                      <Label
                        htmlFor="samen"
                        className={cn(
                          "flex items-center justify-center gap-2 rounded-xl border-2 p-4 cursor-pointer transition-all",
                          householdType === "samen" 
                            ? "border-primary bg-primary/5" 
                            : "border-muted hover:border-primary/50"
                        )}
                      >
                        {householdType === "samen" && <Check className="w-4 h-4 text-primary" />}
                        Samen
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Phone - optional */}
                <div className="space-y-2">
                  <Label htmlFor="signup-phone" className="flex items-center gap-2 text-base">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    Telefoonnummer
                    <span className="text-muted-foreground text-sm font-normal">(optioneel)</span>
                  </Label>
                  <Input
                    id="signup-phone"
                    type="tel"
                    placeholder="06 12345678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="h-14 rounded-xl text-base"
                  />
                  <p className="text-xs text-muted-foreground">
                    Handig als partners contact met je willen opnemen.
                  </p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="p-6 pt-4 border-t bg-background">
              <Button 
                onClick={handleSignup}
                disabled={!canSubmit || isLoading}
                className="w-full h-14 rounded-xl text-lg font-semibold"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Bezig...
                  </>
                ) : (
                  "Account aanmaken"
                )}
              </Button>
              
              <p className="text-xs text-center text-muted-foreground mt-3">
                Je kunt dit later altijd nog aanpassen.
              </p>
            </div>
          </>
        )}
      </MobileModalContent>
    </MobileModal>
  );
};
