import { useState, useEffect, useRef } from "react";
import {
  MobileModal,
  MobileModalContent,
} from "@/components/ui/mobile-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Loader2, 
  Phone, 
  Sparkles,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { trackEvent } from "@/lib/analytics";
import { validatePhone, cleanPhone } from "@/lib/validation";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

type PhoneOTPDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVerified: (userId: string, isNewUser: boolean) => void;
  onDismiss?: () => void;
  anonymousUserId?: string | null;
  isHardBlock?: boolean;
};

type Step = "phone" | "otp" | "success";

export const PhoneOTPDialog = ({
  open,
  onOpenChange,
  onVerified,
  onDismiss,
  anonymousUserId,
  isHardBlock = false,
}: PhoneOTPDialogProps) => {
  const { toast } = useToast();
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Reset when dialog opens
  useEffect(() => {
    if (open) {
      trackEvent("phone_otp_dialog_shown");
      setStep("phone");
      setPhone("");
      setPhoneError("");
      setOtp(["", "", "", "", "", ""]);
      setResendCooldown(0);
    }
  }, [open]);

  // Countdown timer for resend
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

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

  const handleSendOTP = async () => {
    if (!handleValidatePhone()) return;

    setIsLoading(true);

    try {
      const cleaned = cleanPhone(phone);
      
      const { data, error } = await supabase.functions.invoke("send-otp", {
        body: { 
          phone: cleaned,
          anonymousUserId,
        },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      trackEvent("phone_saved", { method: "skip_otp" });
      
      setStep("success");
      
      toast({
        title: "Telefoonnummer opgeslagen! 🎉",
        description: "Je voortgang is bewaard.",
      });

      // Small delay for success animation, then complete
      setTimeout(() => {
        onVerified(anonymousUserId || "phone-user", false);
      }, 1000);

    } catch (error: any) {
      toast({
        title: "Kon code niet versturen",
        description: error.message || "Probeer het opnieuw.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when complete
    if (value && index === 5 && newOtp.every(d => d)) {
      handleVerifyOTP(newOtp.join(""));
    }
  };

  const handleOTPKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOTPPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pastedData.length === 6) {
      const newOtp = pastedData.split("");
      setOtp(newOtp);
      handleVerifyOTP(pastedData);
    }
  };

  const handleVerifyOTP = async (code?: string) => {
    const otpCode = code || otp.join("");
    if (otpCode.length !== 6) return;

    setIsLoading(true);

    try {
      const cleaned = cleanPhone(phone);
      
      const { data, error } = await supabase.functions.invoke("verify-otp", {
        body: { 
          phone: cleaned,
          code: otpCode,
          anonymousUserId,
        },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      trackEvent("otp_verified", { isNewUser: data.isNewUser });

      // If we got a redirect URL, use it to complete sign-in
      if (data.redirectUrl) {
        // The redirect URL contains the magic link token
        // We can extract and use it to complete auth
        window.location.href = data.redirectUrl;
        return;
      }

      setStep("success");
      
      toast({
        title: data.isNewUser ? "Welkom bij Lua! 🎉" : "Welkom terug! 🎉",
        description: "Je bent succesvol ingelogd.",
      });

      // Small delay for success animation
      setTimeout(() => {
        onVerified(data.userId, data.isNewUser);
      }, 1000);

    } catch (error: any) {
      toast({
        title: "Verificatie mislukt",
        description: error.message || "Ongeldige of verlopen code.",
        variant: "destructive",
      });
      // Clear OTP on error
      setOtp(["", "", "", "", "", ""]);
      otpInputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;
    await handleSendOTP();
  };

  const handleLater = () => {
    if (isHardBlock) return;
    trackEvent("phone_otp_dismissed");
    if (onDismiss) {
      onDismiss();
    } else {
      onOpenChange(false);
    }
  };

  const handleBack = () => {
    setStep("phone");
    setOtp(["", "", "", "", "", ""]);
  };

  return (
    <MobileModal open={open} onOpenChange={() => {}}>
      <MobileModalContent 
        showCloseButton={!isHardBlock && step === "phone"}
        onCloseClick={handleLater}
        onPointerDownOutside={(e) => (isHardBlock || step !== "phone") && e.preventDefault()}
        onEscapeKeyDown={(e) => (isHardBlock || step !== "phone") && e.preventDefault()}
      >
        {/* Phone Input Step */}
        {step === "phone" && (
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="text-center space-y-3 mb-6">
              <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                <Sparkles className="w-7 h-7 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  Goed bezig! 🎉
                </h2>
                <p className="text-muted-foreground mt-2">
                  Voer je telefoonnummer in om je voortgang te bewaren.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone-input" className="flex items-center gap-2 text-base">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  Telefoonnummer
                </Label>
                <Input
                  id="phone-input"
                  type="tel"
                  placeholder="06 12345678"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (phoneError) setPhoneError("");
                  }}
                  className={cn(
                    "h-14 rounded-xl text-base",
                    phoneError && "border-destructive"
                  )}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && isPhoneValid) {
                      handleSendOTP();
                    }
                  }}
                />
                {phoneError && (
                  <p className="text-sm text-destructive">{phoneError}</p>
                )}
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <Button 
                onClick={handleSendOTP} 
                disabled={!isPhoneValid || isLoading} 
                className="w-full h-14 rounded-xl text-lg font-semibold"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Opslaan...
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
                  Nu niet
                </Button>
              )}

              <p className="text-xs text-center text-muted-foreground">
                We gebruiken je nummer alleen om je voortgang te bewaren.
              </p>
            </div>
          </div>
        )}

        {/* OTP Input Step */}
        {step === "otp" && (
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <button
              onClick={handleBack}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Terug
            </button>

            <div className="text-center space-y-3 mb-6">
              <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                <Phone className="w-7 h-7 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  Voer de code in
                </h2>
                <p className="text-muted-foreground mt-2">
                  We hebben een code gestuurd naar<br />
                  <span className="font-medium text-foreground">{phone}</span>
                </p>
              </div>
            </div>

            {/* OTP Input */}
            <div className="flex justify-center gap-2 mb-6" onPaste={handleOTPPaste}>
              {otp.map((digit, index) => (
                <Input
                  key={index}
                  ref={(el) => (otpInputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOTPChange(index, e.target.value)}
                  onKeyDown={(e) => handleOTPKeyDown(index, e)}
                  className="w-12 h-14 text-center text-2xl font-bold rounded-xl"
                  disabled={isLoading}
                />
              ))}
            </div>

            <div className="space-y-3">
              <Button 
                onClick={() => handleVerifyOTP()} 
                disabled={otp.some(d => !d) || isLoading} 
                className="w-full h-14 rounded-xl text-lg font-semibold"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Controleren...
                  </>
                ) : (
                  "Verifiëren"
                )}
              </Button>

              <Button 
                variant="ghost" 
                onClick={handleResendOTP}
                disabled={resendCooldown > 0 || isLoading}
                className="w-full h-12 rounded-xl text-base text-muted-foreground"
              >
                {resendCooldown > 0 
                  ? `Opnieuw versturen (${resendCooldown}s)`
                  : "Nieuwe code versturen"
                }
              </Button>
            </div>
          </div>
        )}

        {/* Success Step */}
        {step === "success" && (
          <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
            <div className="text-center space-y-4">
              <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center animate-in zoom-in duration-300">
                <CheckCircle2 className="w-10 h-10 text-primary" />
              </div>
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
                <h2 className="text-2xl font-bold">
                  Gelukt! 🎉
                </h2>
                <p className="text-muted-foreground mt-2">
                  Je bent ingelogd en je voortgang is bewaard.
                </p>
              </div>
            </div>
          </div>
        )}
      </MobileModalContent>
    </MobileModal>
  );
};
