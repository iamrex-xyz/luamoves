import { useState, useEffect, useMemo } from "react";
import {
  MobileModal,
  MobileModalContent,
} from "@/components/ui/mobile-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AddressAutocomplete } from "@/components/AddressAutocomplete";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Eye, 
  EyeOff, 
  Loader2, 
  Users, 
  Home, 
  Phone, 
  Lock,
  Calendar,
  HardHat,
  Check,
  ArrowRight,
  Cake,
  MapPin,
  Shield
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
  
  // Step tracking
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  
  // Step 1: Password - kept in React state for security (not sessionStorage)
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSet, setPasswordSet] = useState(false);
  const [storedPassword, setStoredPassword] = useState("");
  
  // Step 2: Profile fields
  const [phone, setPhone] = useState("");
  const [oldAddress, setOldAddress] = useState("");
  const [keyHandoverDate, setKeyHandoverDate] = useState<Date | undefined>(undefined);
  const [renovationType, setRenovationType] = useState<"none" | "small" | "large">("none");
  const [adults, setAdults] = useState("1");
  const [children, setChildren] = useState("0");
  const [pets, setPets] = useState("0");
  const [birthDate, setBirthDate] = useState<Date | undefined>(undefined);
  const [birthCalendarMonth, setBirthCalendarMonth] = useState<Date>(new Date(1990, 0, 1));
  
  const [isLoading, setIsLoading] = useState(false);
  const [step2Errors, setStep2Errors] = useState<Record<string, string>>({});
  const [keyHandoverCalendarOpen, setKeyHandoverCalendarOpen] = useState(false);
  const [birthDateCalendarOpen, setBirthDateCalendarOpen] = useState(false);
  
  // Get onboarding data from sessionStorage for validation
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

  // Pre-fill old address from onboarding data on mount
  useEffect(() => {
    const onboardingData = getOnboardingData();
    if (onboardingData?.oldAddress && !oldAddress) {
      setOldAddress(onboardingData.oldAddress);
    }
  }, []);

  // Check if old address matches new address from onboarding
  const isSameAsNewAddress = useMemo(() => {
    const onboardingData = getOnboardingData();
    if (!onboardingData?.newAddress || !oldAddress.trim()) {
      return false;
    }
    
    const newAddressLower = onboardingData.newAddress.toLowerCase().replace(/\s+/g, '');
    const oldAddressLower = oldAddress.toLowerCase().replace(/\s+/g, '');
    
    // Check if addresses are substantially similar
    return newAddressLower === oldAddressLower || 
           newAddressLower.includes(oldAddressLower) ||
           oldAddressLower.includes(newAddressLower);
  }, [oldAddress]);

  // Check if key handover date is after moving date
  const isKeyHandoverAfterMovingDate = useMemo(() => {
    const onboardingData = getOnboardingData();
    if (!onboardingData?.movingDate || !keyHandoverDate) {
      return false;
    }
    const movingDate = new Date(onboardingData.movingDate);
    return keyHandoverDate > movingDate;
  }, [keyHandoverDate]);

  // Calculate fields completed for progress indicator
  const filledFieldsCount = useMemo(() => {
    let count = 0;
    if (oldAddress.trim()) count++;
    if (keyHandoverDate) count++;
    if (phone.trim()) count++;
    if (birthDate) count++;
    // renovationType always has a value so count it as done
    count++;
    return count;
  }, [oldAddress, keyHandoverDate, phone, birthDate]);

  const totalFields = 5;

  // Generate year options (from 1920 to current year)
  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: currentYear - 1920 + 1 }, (_, i) => (currentYear - i).toString());
  }, []);

  const monthOptions = [
    { value: "0", label: "Januari" },
    { value: "1", label: "Februari" },
    { value: "2", label: "Maart" },
    { value: "3", label: "April" },
    { value: "4", label: "Mei" },
    { value: "5", label: "Juni" },
    { value: "6", label: "Juli" },
    { value: "7", label: "Augustus" },
    { value: "8", label: "September" },
    { value: "9", label: "Oktober" },
    { value: "10", label: "November" },
    { value: "11", label: "December" },
  ];

  const handleBirthMonthChange = (month: string) => {
    const newDate = new Date(birthCalendarMonth);
    newDate.setMonth(parseInt(month));
    setBirthCalendarMonth(newDate);
  };

  const handleBirthYearChange = (year: string) => {
    const newDate = new Date(birthCalendarMonth);
    newDate.setFullYear(parseInt(year));
    setBirthCalendarMonth(newDate);
  };

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      // Check if password was already set in this session (via React state)
      if (passwordSet && storedPassword) {
        setCurrentStep(2);
        trackEvent("account_modal_triggered_task3_safeguard");
      } else {
        setCurrentStep(1);
        trackEvent("account_modal_shown_after_task_2");
      }
      setPassword("");
      setPasswordError("");
    }
  }, [open]);

  const validatePassword = (): boolean => {
    const result = passwordSchema.safeParse(password);
    if (!result.success) {
      setPasswordError(result.error.errors[0].message);
      return false;
    }
    setPasswordError("");
    return true;
  };

  // Check if password meets requirements
  const isPasswordValid = useMemo(() => {
    return passwordSchema.safeParse(password).success;
  }, [password]);

  const handleStep1Next = () => {
    if (!validatePassword()) {
      return;
    }
    
    // Store password in React state (secure - not in sessionStorage)
    setStoredPassword(password);
    setPasswordSet(true);
    
    trackEvent("password_set");
    toast({
      title: "Wachtwoord opgeslagen ✅",
      description: "Vul nu je gegevens in.",
    });
    
    setCurrentStep(2);
  };

  const validateStep2 = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!oldAddress.trim()) {
      errors.oldAddress = "Oud adres is verplicht";
    }
    
    // Check if old address is same as new address
    if (isSameAsNewAddress) {
      errors.oldAddress = "Dit lijkt op je nieuwe adres. Vul je huidige (oude) adres in.";
    }
    
    if (!keyHandoverDate) {
      errors.keyHandoverDate = "Sleuteloverdracht datum is verplicht";
    }
    
    // Check if key handover is after moving date
    if (isKeyHandoverAfterMovingDate) {
      errors.keyHandoverDate = "De sleutels krijg je toch vóór je verhuist? Pas de datum aan.";
    }
    
    if (!phone.trim()) {
      errors.phone = "Telefoonnummer is verplicht";
    }
    if (!birthDate) {
      errors.birthDate = "Geboortedatum is verplicht";
    }
    
    setStep2Errors(errors);
    
    if (Object.keys(errors).length > 0) {
      const hasSameAddressError = isSameAsNewAddress;
      const hasKeyHandoverError = isKeyHandoverAfterMovingDate;
      
      if (hasSameAddressError) {
        toast({
          title: "Oeps, dat klopt niet helemaal",
          description: "Dit adres is hetzelfde als je nieuwe adres. Vul je huidige (oude) adres in.",
          variant: "destructive",
        });
      } else if (hasKeyHandoverError) {
        toast({
          title: "Hm, dat kan niet kloppen",
          description: "Je sleuteloverdracht kan niet ná je verhuisdatum liggen. Check even je data!",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Vul alle velden in",
          description: `Nog ${totalFields - filledFieldsCount} velden te gaan.`,
          variant: "destructive",
        });
      }
      return false;
    }
    
    return true;
  };

  // Check if all step 2 fields are filled
  const isStep2Complete = useMemo(() => {
    return oldAddress.trim() && keyHandoverDate && phone.trim() && birthDate;
  }, [oldAddress, keyHandoverDate, phone, birthDate]);

  const handleSignup = async () => {
    if (!capturedEmail) {
      toast({
        title: "E-mail ontbreekt",
        description: "Voer eerst je e-mailadres in.",
        variant: "destructive",
      });
      return;
    }

    if (!validateStep2()) {
      return;
    }

    // Use password from React state
    const passwordToUse = storedPassword || password;
    
    if (!passwordToUse) {
      toast({
        title: "Wachtwoord ontbreekt",
        description: "Er is iets misgegaan. Probeer opnieuw.",
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
        // Use the full old address
        const oldAddressValue = oldAddress.trim() || null;
        
        // Also update sessionStorage so the address syncs properly
        if (oldAddressValue) {
          try {
            const storedData = sessionStorage.getItem("lua_moving_info");
            if (storedData) {
              const movingInfo = JSON.parse(storedData);
              movingInfo.oldAddress = oldAddressValue;
              // Also sync key handover date and renovation type
              if (keyHandoverDate) {
                movingInfo.keyHandoverDate = format(keyHandoverDate, "yyyy-MM-dd");
              }
              movingInfo.renovationType = renovationType;
              sessionStorage.setItem("lua_moving_info", JSON.stringify(movingInfo));
            }
          } catch (e) {
            console.error("Error updating sessionStorage:", e);
          }
        }
        
        // Update profile with additional info
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            phone: phone || null,
            old_address: oldAddressValue,
            key_handover_date: keyHandoverDate ? format(keyHandoverDate, "yyyy-MM-dd") : null,
            renovation_type: renovationType,
            adults: parseInt(adults) || 1,
            children: parseInt(children) || 0,
            pets: parseInt(pets) || 0,
            birth_date: birthDate ? format(birthDate, "yyyy-MM-dd") : null,
          })
          .eq('user_id', data.user.id);

        if (profileError) {
          console.error('Error updating profile:', profileError);
        }

        // Track completion
        trackEvent("account_fully_completed");
        
        // Clear password from state for security
        setStoredPassword("");
        setPassword("");
        
        toast({
          title: "Account aangemaakt! 🎉",
          description: "Lua onthoudt nu alles voor je.",
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

  // Track field completion
  const trackFieldComplete = (fieldName: string) => {
    trackEvent("account_field_completed", { field: fieldName });
  };

  return (
    <MobileModal open={open} onOpenChange={() => {}}>
      <MobileModalContent 
        className="max-h-[85vh]"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        {currentStep === 1 ? (
          <>
            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {/* Header */}
              <div className="text-center space-y-3 mb-6">
                <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                  <Shield className="w-7 h-7 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Beveilig je account</h2>
                  <p className="text-muted-foreground mt-1">
                    Kies een wachtwoord zodat wij je voortgang veilig kunnen opslaan.
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
                  <p className="text-sm text-muted-foreground">
                    Lua onthoudt alles voor je, zodat jij je kunt focussen op verhuizen.
                  </p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="p-6 pt-4 border-t bg-background">
              <Button 
                onClick={handleStep1Next} 
                disabled={!isPasswordValid || isLoading} 
                className="w-full h-14 rounded-xl text-lg font-semibold"
              >
                Volgende
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </>
        ) : (
          <>
            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {/* Header */}
              <div className="text-center space-y-3 mb-4">
                <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                  <Home className="w-7 h-7 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Je bent lekker op dreef!</h2>
                  <p className="text-muted-foreground mt-1">
                    Maak je account compleet, dan kunnen wij jouw verhuizing slim organiseren en alles bijhouden.
                  </p>
                </div>
              </div>

              {/* Progress indicator */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{filledFieldsCount}/{totalFields} velden ingevuld</span>
                  <span className="text-sm text-muted-foreground">{Math.round((filledFieldsCount / totalFields) * 100)}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-300 ease-out rounded-full"
                    style={{ width: `${(filledFieldsCount / totalFields) * 100}%` }}
                  />
                </div>
              </div>

              {/* Success indicator for step 1 */}
              {passwordSet && (
                <div className="p-3 rounded-xl bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 flex items-center gap-2 mb-4">
                  <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <p className="text-sm text-green-700 dark:text-green-300">Wachtwoord opgeslagen</p>
                </div>
              )}

              <div className="space-y-4">
                {/* Old Address - Full address with autocomplete */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    Oud adres <span className="text-destructive">*</span>
                  </Label>
                  <AddressAutocomplete
                    label=""
                    placeholder="Begin met typen..."
                    value={oldAddress}
                    onChange={(address) => {
                      setOldAddress(address);
                      if (address.trim() && !oldAddress.trim()) trackFieldComplete("oldAddress");
                      if (step2Errors.oldAddress) {
                        setStep2Errors(prev => ({ ...prev, oldAddress: "" }));
                      }
                    }}
                  />
                  {step2Errors.oldAddress && (
                    <p className="text-xs text-destructive mt-1">{step2Errors.oldAddress}</p>
                  )}
                  {isSameAsNewAddress && !step2Errors.oldAddress && (
                    <p className="text-xs text-destructive mt-1">
                      Hé, dit lijkt op je nieuwe adres! Vul hier je huidige (oude) adres in.
                    </p>
                  )}
                </div>

                {/* Key Handover Date */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    Datum sleuteloverdracht <span className="text-destructive">*</span>
                  </Label>
                  <Popover open={keyHandoverCalendarOpen} onOpenChange={setKeyHandoverCalendarOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full h-12 rounded-xl justify-between text-left font-normal",
                          !keyHandoverDate && "text-muted-foreground",
                          (step2Errors.keyHandoverDate || isKeyHandoverAfterMovingDate) && "border-destructive"
                        )}
                      >
                        <span>{keyHandoverDate ? format(keyHandoverDate, "dd MMMM yyyy", { locale: nl }) : "Selecteer datum"}</span>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-background z-[60]" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={keyHandoverDate}
                        onSelect={(date) => {
                          if (date && !keyHandoverDate) trackFieldComplete("keyHandoverDate");
                          setKeyHandoverDate(date);
                          if (step2Errors.keyHandoverDate) {
                            setStep2Errors(prev => ({ ...prev, keyHandoverDate: "" }));
                          }
                          // Close popover after date selection
                          setKeyHandoverCalendarOpen(false);
                        }}
                        initialFocus
                        className="pointer-events-auto"
                        locale={nl}
                        disabled={(date) => {
                          const onboardingData = getOnboardingData();
                          if (onboardingData?.movingDate) {
                            const movingDate = new Date(onboardingData.movingDate);
                            return date > movingDate;
                          }
                          return false;
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                  {step2Errors.keyHandoverDate && (
                    <p className="text-xs text-destructive">{step2Errors.keyHandoverDate}</p>
                  )}
                  {isKeyHandoverAfterMovingDate && !step2Errors.keyHandoverDate && (
                    <p className="text-xs text-destructive">
                      De sleutels krijg je toch vóór je verhuist? Pas de datum aan.
                    </p>
                  )}
                </div>

                {/* Renovation Type */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <HardHat className="w-4 h-4 text-muted-foreground" />
                    Mate van verbouwing
                  </Label>
                  <RadioGroup 
                    value={renovationType} 
                    onValueChange={(val: "none" | "small" | "large") => setRenovationType(val)}
                    className="grid grid-cols-3 gap-2"
                  >
                    <Label
                      htmlFor="reno-none-signup"
                      className={cn(
                        "flex flex-col items-center gap-1 p-3 rounded-xl border-2 cursor-pointer transition-all",
                        renovationType === "none" 
                          ? "border-primary bg-primary/5" 
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <RadioGroupItem value="none" id="reno-none-signup" className="sr-only" />
                      <span className="text-sm font-medium">Niets</span>
                    </Label>
                    <Label
                      htmlFor="reno-small-signup"
                      className={cn(
                        "flex flex-col items-center gap-1 p-3 rounded-xl border-2 cursor-pointer transition-all",
                        renovationType === "small" 
                          ? "border-primary bg-primary/5" 
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <RadioGroupItem value="small" id="reno-small-signup" className="sr-only" />
                      <span className="text-sm font-medium">Klein</span>
                    </Label>
                    <Label
                      htmlFor="reno-large-signup"
                      className={cn(
                        "flex flex-col items-center gap-1 p-3 rounded-xl border-2 cursor-pointer transition-all",
                        renovationType === "large" 
                          ? "border-primary bg-primary/5" 
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <RadioGroupItem value="large" id="reno-large-signup" className="sr-only" />
                      <span className="text-sm font-medium">Groot</span>
                    </Label>
                  </RadioGroup>
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
                        className="h-11 rounded-xl text-center"
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
                        className="h-11 rounded-xl text-center"
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
                        className="h-11 rounded-xl text-center"
                      />
                    </div>
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    Telefoonnummer <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="06 12345678"
                    value={phone}
                    onChange={(e) => {
                      if (e.target.value.trim() && !phone.trim()) trackFieldComplete("phone");
                      setPhone(e.target.value);
                      if (step2Errors.phone) {
                        setStep2Errors(prev => ({ ...prev, phone: "" }));
                      }
                    }}
                    className={cn("h-12 rounded-xl", step2Errors.phone && "border-destructive")}
                  />
                  {step2Errors.phone && (
                    <p className="text-xs text-destructive">{step2Errors.phone}</p>
                  )}
                </div>

                {/* Birth Date */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Cake className="w-4 h-4 text-muted-foreground" />
                    Geboortedatum <span className="text-destructive">*</span>
                  </Label>
                  <Popover open={birthDateCalendarOpen} onOpenChange={setBirthDateCalendarOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full h-12 rounded-xl justify-between text-left font-normal",
                          !birthDate && "text-muted-foreground",
                          step2Errors.birthDate && "border-destructive"
                        )}
                      >
                        <span>{birthDate ? format(birthDate, "dd MMMM yyyy", { locale: nl }) : "Selecteer datum"}</span>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-background z-[60]" align="start">
                      <div className="p-3 space-y-3">
                        {/* Month and Year selectors */}
                        <div className="flex gap-2">
                          <Select 
                            value={birthCalendarMonth.getMonth().toString()} 
                            onValueChange={handleBirthMonthChange}
                          >
                            <SelectTrigger className="flex-1 h-9 rounded-lg text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-background z-[70]">
                              {monthOptions.map((month) => (
                                <SelectItem key={month.value} value={month.value}>
                                  {month.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Select 
                            value={birthCalendarMonth.getFullYear().toString()} 
                            onValueChange={handleBirthYearChange}
                          >
                            <SelectTrigger className="w-24 h-9 rounded-lg text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-background z-[70] max-h-[200px]">
                              {yearOptions.map((year) => (
                                <SelectItem key={year} value={year}>
                                  {year}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <CalendarComponent
                        mode="single"
                        selected={birthDate}
                        onSelect={(date) => {
                          if (date && !birthDate) trackFieldComplete("birthDate");
                          setBirthDate(date);
                          if (step2Errors.birthDate) {
                            setStep2Errors(prev => ({ ...prev, birthDate: "" }));
                          }
                          // Close popover after date selection
                          setBirthDateCalendarOpen(false);
                        }}
                        month={birthCalendarMonth}
                        onMonthChange={setBirthCalendarMonth}
                        className="pointer-events-auto"
                        locale={nl}
                        disabled={(date) => date > new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                  {step2Errors.birthDate && (
                    <p className="text-xs text-destructive">{step2Errors.birthDate}</p>
                  )}
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="p-6 pt-4 border-t bg-background space-y-3">
              <Button 
                onClick={handleSignup} 
                disabled={!isStep2Complete || isLoading} 
                className="w-full h-14 rounded-xl text-lg font-semibold"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Bezig...
                  </>
                ) : (
                  "Account afronden"
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Door je account te maken ga je akkoord met onze{" "}
                <a href="/voorwaarden" className="underline hover:text-foreground">voorwaarden</a>
                {" "}en{" "}
                <a href="/privacy" className="underline hover:text-foreground">privacyverklaring</a>.
              </p>
            </div>
          </>
        )}
      </MobileModalContent>
    </MobileModal>
  );
};
