import { useState, useEffect, useMemo } from "react";
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
  Flame,
  HardHat,
  Check,
  ArrowRight,
  Cake,
  MapPin
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { trackEvent, AnalyticsEvents } from "@/lib/analytics";
import { z } from "zod";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { cn } from "@/lib/utils";

// Password must be min 8 chars, at least 1 letter and 1 number
const passwordSchema = z.string()
  .min(8, "Wachtwoord moet minimaal 8 tekens bevatten")
  .regex(/[a-zA-Z]/, "Wachtwoord moet minimaal 1 letter bevatten")
  .regex(/[0-9]/, "Wachtwoord moet minimaal 1 cijfer bevatten");

type SignupPromptDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSignupComplete: () => void;
  onSkip: () => void;
  isHardBlock?: boolean;
  capturedEmail?: string;
};

export const SignupPromptDialog = ({
  open,
  onOpenChange,
  onSignupComplete,
  onSkip,
  isHardBlock = false,
  capturedEmail = "",
}: SignupPromptDialogProps) => {
  const { toast } = useToast();
  
  // Step tracking
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  
  // Step 1: Password
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  
  // Step 2: Profile fields
  const [phone, setPhone] = useState("");
  const [postcode, setPostcode] = useState("");
  const [houseNumber, setHouseNumber] = useState("");
  const [keyHandoverDate, setKeyHandoverDate] = useState<Date | undefined>(undefined);
  const [renovationType, setRenovationType] = useState<"none" | "small" | "large">("none");
  const [adults, setAdults] = useState("1");
  const [children, setChildren] = useState("0");
  const [pets, setPets] = useState("0");
  const [birthDate, setBirthDate] = useState<Date | undefined>(undefined);
  const [birthCalendarMonth, setBirthCalendarMonth] = useState<Date>(new Date(1990, 0, 1));
  
  const [isLoading, setIsLoading] = useState(false);

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
      setCurrentStep(1);
      setPassword("");
      setPasswordError("");
      trackEvent("account_modal_step1_shown");
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

  const handleStep1Next = () => {
    if (!validatePassword()) {
      return;
    }
    
    trackEvent("password_set");
    toast({
      title: "Wachtwoord opgeslagen ✅",
      description: "Klaar voor de volgende stap!",
    });
    
    trackEvent("account_modal_step2_shown");
    setCurrentStep(2);
  };

  const handleSignup = async () => {
    if (!capturedEmail) {
      toast({
        title: "E-mail ontbreekt",
        description: "Voer eerst je e-mailadres in.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/`;
      const { data, error } = await supabase.auth.signUp({
        email: capturedEmail,
        password,
        options: {
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) throw error;

      if (data.user) {
        // Combine postcode and house number for old_address
        const oldAddress = postcode && houseNumber ? `${postcode} ${houseNumber}` : null;
        
        // Update profile with additional info
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            phone: phone || null,
            old_address: oldAddress,
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

        trackEvent("account_created_from_step2");
        toast({
          title: "Account aangemaakt! 🎉",
          description: "Je voortgang is veilig opgeslagen.",
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

  const handleSkip = () => {
    if (currentStep === 1) {
      trackEvent("step1_skipped");
    } else {
      trackEvent("step2_skipped");
    }
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
        className="sm:max-w-lg max-h-[90vh] overflow-y-auto animate-in fade-in-0 slide-in-from-bottom-4 duration-300"
        onPointerDownOutside={(e) => isHardBlock && e.preventDefault()}
        onEscapeKeyDown={(e) => {
          if (isHardBlock) {
            e.preventDefault();
          }
        }}
      >
        {currentStep === 1 ? (
          <>
            <DialogHeader className="text-center space-y-2">
              <div className="mx-auto w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mb-2">
                <Flame className="w-6 h-6 text-white" />
              </div>
              <DialogTitle className="text-2xl font-bold">
                Je bent lekker op dreef!
              </DialogTitle>
              <DialogDescription className="text-base text-muted-foreground">
                Maak eerst een wachtwoord aan, zodat we je voortgang veilig kunnen bewaren.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* E-mail display */}
              <div className="p-3 rounded-xl bg-primary/5 border border-primary/10">
                <p className="text-sm text-muted-foreground">E-mailadres</p>
                <p className="font-medium">{capturedEmail}</p>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="signup-password" className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-muted-foreground" />
                  Wachtwoord
                </Label>
                <div className="relative">
                  <Input
                    id="signup-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Minimaal 8 tekens, 1 letter en 1 cijfer"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (passwordError) setPasswordError("");
                    }}
                    className={`h-12 rounded-xl pr-10 ${passwordError ? 'border-destructive focus-visible:ring-destructive' : ''}`}
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
                {passwordError && (
                  <p className="text-sm text-destructive">{passwordError}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Kies iets dat je makkelijk onthoudt, wij houden alles veilig voor je.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <Button 
                onClick={handleStep1Next} 
                disabled={!password || isLoading} 
                className="h-12 rounded-xl text-base font-semibold"
              >
                Volgende
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              {!isHardBlock && (
                <Button 
                  variant="ghost" 
                  onClick={handleSkip} 
                  disabled={isLoading} 
                  className="text-muted-foreground h-11"
                >
                  Later verder
                </Button>
              )}
            </div>
          </>
        ) : (
          <>
            <DialogHeader className="text-center space-y-2">
              <div className="mx-auto w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mb-2">
                <Home className="w-6 h-6 text-white" />
              </div>
              <DialogTitle className="text-2xl font-bold">
                Je account compleet maken
              </DialogTitle>
              <DialogDescription className="text-base text-muted-foreground">
                Vul je gegevens in zodat Lua je verhuizing helemaal kan regelen.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Success indicator for step 1 */}
              <div className="p-3 rounded-xl bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                <p className="text-sm text-green-700 dark:text-green-300">Wachtwoord opgeslagen</p>
              </div>

              {/* Old Address - Postcode + House Number */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  Oud adres
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    type="text"
                    placeholder="Postcode"
                    value={postcode}
                    onChange={(e) => setPostcode(e.target.value.toUpperCase())}
                    className="h-12 rounded-xl"
                    maxLength={7}
                  />
                  <Input
                    type="text"
                    placeholder="Huisnummer"
                    value={houseNumber}
                    onChange={(e) => setHouseNumber(e.target.value)}
                    className="h-12 rounded-xl"
                  />
                </div>
              </div>

              {/* Key Handover Date - with date picker */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  Datum sleuteloverdracht
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full h-12 rounded-xl justify-between text-left font-normal",
                        !keyHandoverDate && "text-muted-foreground"
                      )}
                    >
                      <span>{keyHandoverDate ? format(keyHandoverDate, "dd-MM-yy") : "dd-mm-jj"}</span>
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-background z-50" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={keyHandoverDate}
                      onSelect={setKeyHandoverDate}
                      initialFocus
                      className="pointer-events-auto"
                      locale={nl}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Renovation Type - matching Settings options */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <HardHat className="w-4 h-4 text-muted-foreground" />
                  Hoeveel moet er nog gebeuren?
                </Label>
                <RadioGroup 
                  value={renovationType} 
                  onValueChange={(val: "none" | "small" | "large") => setRenovationType(val)}
                  className="grid grid-cols-3 gap-2"
                >
                  <Label
                    htmlFor="reno-none-signup"
                    className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      renovationType === "none" 
                        ? "border-primary bg-primary/5" 
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <RadioGroupItem value="none" id="reno-none-signup" className="sr-only" />
                    <span className="text-sm font-medium">Geen</span>
                  </Label>
                  <Label
                    htmlFor="reno-small-signup"
                    className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      renovationType === "small" 
                        ? "border-primary bg-primary/5" 
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <RadioGroupItem value="small" id="reno-small-signup" className="sr-only" />
                    <span className="text-sm font-medium">Klein</span>
                  </Label>
                  <Label
                    htmlFor="reno-large-signup"
                    className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      renovationType === "large" 
                        ? "border-primary bg-primary/5" 
                        : "border-border hover:border-primary/50"
                    }`}
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

              {/* Birth Date - with calendar and month/year dropdowns */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Cake className="w-4 h-4 text-muted-foreground" />
                  Geboortedatum
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full h-12 rounded-xl justify-between text-left font-normal",
                        !birthDate && "text-muted-foreground"
                      )}
                    >
                      <span>{birthDate ? format(birthDate, "dd-MM-yy") : "dd-mm-jj"}</span>
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-background z-50" align="start">
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
                          <SelectContent className="bg-background z-[60]">
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
                          <SelectContent className="bg-background z-[60] max-h-[200px]">
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
                      onSelect={setBirthDate}
                      month={birthCalendarMonth}
                      onMonthChange={setBirthCalendarMonth}
                      className="pointer-events-auto"
                      locale={nl}
                      disabled={(date) => date > new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <Button 
                onClick={handleSignup} 
                disabled={isLoading} 
                className="h-12 rounded-xl text-base font-semibold"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Bezig...
                  </>
                ) : (
                  "Account afronden"
                )}
              </Button>
              {!isHardBlock && (
                <Button 
                  variant="ghost" 
                  onClick={handleSkip} 
                  disabled={isLoading} 
                  className="text-muted-foreground h-11"
                >
                  Later verder
                </Button>
              )}
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
