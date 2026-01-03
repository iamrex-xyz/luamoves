import { useState } from "react";
import {
  MobileModal,
  MobileModalContent,
} from "@/components/ui/mobile-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Users, 
  Phone, 
  Plus, 
  X, 
  Loader2, 
  CheckCircle2,
  Send,
  UserPlus,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";

type InviteHouseholdDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInvitesSent?: () => void;
};

type InviteEntry = {
  id: string;
  phone: string;
  name: string;
  status: "pending" | "sending" | "sent" | "error";
  error?: string;
};

const validatePhone = (phone: string): boolean => {
  const cleaned = phone.replace(/[^\d+]/g, "");
  return cleaned.replace(/\D/g, "").length >= 10;
};

const formatPhoneDisplay = (phone: string): string => {
  const cleaned = phone.replace(/[^\d+]/g, "");
  if (cleaned.startsWith("+31")) {
    const number = cleaned.slice(3);
    if (number.length === 9) {
      return `+31 6 ${number.slice(1, 3)} ${number.slice(3, 5)} ${number.slice(5, 7)} ${number.slice(7)}`;
    }
  }
  return cleaned;
};

export const InviteHouseholdDialog = ({
  open,
  onOpenChange,
  onInvitesSent,
}: InviteHouseholdDialogProps) => {
  const { toast } = useToast();
  const [entries, setEntries] = useState<InviteEntry[]>([
    { id: crypto.randomUUID(), phone: "", name: "", status: "pending" }
  ]);
  const [isSending, setIsSending] = useState(false);
  const [allSent, setAllSent] = useState(false);

  const addEntry = () => {
    setEntries(prev => [
      ...prev,
      { id: crypto.randomUUID(), phone: "", name: "", status: "pending" }
    ]);
  };

  const removeEntry = (id: string) => {
    if (entries.length <= 1) return;
    setEntries(prev => prev.filter(e => e.id !== id));
  };

  const updateEntry = (id: string, field: "phone" | "name", value: string) => {
    setEntries(prev => prev.map(e => 
      e.id === id ? { ...e, [field]: value, status: "pending", error: undefined } : e
    ));
  };

  const handleSendInvites = async () => {
    // Validate all entries
    const validEntries = entries.filter(e => e.phone.trim() !== "");
    
    if (validEntries.length === 0) {
      toast({
        title: "Vul minimaal één telefoonnummer in",
        variant: "destructive",
      });
      return;
    }

    const invalidEntries = validEntries.filter(e => !validatePhone(e.phone));
    if (invalidEntries.length > 0) {
      setEntries(prev => prev.map(e => 
        invalidEntries.find(ie => ie.id === e.id) 
          ? { ...e, status: "error" as const, error: "Ongeldig telefoonnummer" }
          : e
      ));
      return;
    }

    setIsSending(true);
    trackEvent("household_invite_started", { count: validEntries.length });

    // Send invites one by one
    for (const entry of validEntries) {
      setEntries(prev => prev.map(e => 
        e.id === entry.id ? { ...e, status: "sending" } : e
      ));

      try {
        const { data, error } = await supabase.functions.invoke("send-household-invite", {
          body: { phone: entry.phone, name: entry.name || undefined }
        });

        if (error) throw error;
        if (data?.error) throw new Error(data.error);

        setEntries(prev => prev.map(e => 
          e.id === entry.id ? { ...e, status: "sent" } : e
        ));

        trackEvent("household_invite_sent", { 
          whatsappSent: data?.whatsappSent 
        });

      } catch (error: any) {
        console.error("Error sending invite:", error);
        setEntries(prev => prev.map(e => 
          e.id === entry.id ? { 
            ...e, 
            status: "error", 
            error: error.message || "Kon uitnodiging niet versturen" 
          } : e
        ));
      }
    }

    setIsSending(false);

    // Check if all sent successfully
    const allSuccess = validEntries.every(e => 
      entries.find(curr => curr.id === e.id)?.status === "sent"
    );

    // Re-check after state updates
    setTimeout(() => {
      setEntries(prev => {
        const sentCount = prev.filter(e => e.status === "sent").length;
        if (sentCount === validEntries.length) {
          setAllSent(true);
          toast({
            title: "Uitnodigingen verstuurd! 🎉",
            description: `${sentCount} ${sentCount === 1 ? "uitnodiging" : "uitnodigingen"} verstuurd via WhatsApp.`,
          });
          onInvitesSent?.();
        }
        return prev;
      });
    }, 100);
  };

  const handleClose = () => {
    setEntries([{ id: crypto.randomUUID(), phone: "", name: "", status: "pending" }]);
    setAllSent(false);
    onOpenChange(false);
  };

  const canSend = entries.some(e => e.phone.trim() !== "" && e.status !== "sent");
  const sentCount = entries.filter(e => e.status === "sent").length;

  return (
    <MobileModal open={open} onOpenChange={handleClose}>
      <MobileModalContent className="max-h-[85vh]">
        <div className="px-5 py-4">
          {/* Header */}
          <div className="text-center mb-4">
            <div className="mx-auto w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mb-3">
              <Users className="w-6 h-6 text-primary-foreground" />
            </div>
            <h2 className="text-xl font-bold">Mede-verhuizers uitnodigen</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Nodig mede-verhuizers uit om samen de verhuizing te regelen.
            </p>
          </div>

          {/* Invite entries */}
          <div className="space-y-3 max-h-[40vh] overflow-y-auto">
            {entries.map((entry, index) => (
              <div 
                key={entry.id} 
                className={cn(
                  "p-3 rounded-xl border transition-colors",
                  entry.status === "sent" && "bg-green-50 border-green-200",
                  entry.status === "error" && "bg-destructive/5 border-destructive/20",
                  entry.status === "sending" && "bg-primary/5 border-primary/20",
                  entry.status === "pending" && "bg-muted/30 border-border"
                )}
              >
                <div className="flex items-start gap-2">
                  <div className="flex-1 space-y-2">
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Label className="text-xs text-muted-foreground">Telefoonnummer</Label>
                        <div className="relative">
                          <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            type="tel"
                            placeholder="06 12 34 56 78"
                            value={entry.phone}
                            onChange={(e) => updateEntry(entry.id, "phone", e.target.value)}
                            disabled={entry.status === "sent" || entry.status === "sending"}
                            className={cn(
                              "pl-9 h-10",
                              entry.status === "error" && "border-destructive"
                            )}
                          />
                        </div>
                      </div>
                      <div className="flex-1">
                        <Label className="text-xs text-muted-foreground">Naam (optioneel)</Label>
                        <Input
                          type="text"
                          placeholder="Voornaam"
                          value={entry.name}
                          onChange={(e) => updateEntry(entry.id, "name", e.target.value)}
                          disabled={entry.status === "sent" || entry.status === "sending"}
                          className="h-10"
                        />
                      </div>
                    </div>
                    {entry.error && (
                      <p className="text-xs text-destructive">{entry.error}</p>
                    )}
                  </div>

                  {/* Status/Remove button */}
                  <div className="pt-5">
                    {entry.status === "sent" ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : entry.status === "sending" ? (
                      <Loader2 className="w-5 h-5 text-primary animate-spin" />
                    ) : entries.length > 1 ? (
                      <button
                        type="button"
                        onClick={() => removeEntry(entry.id)}
                        className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add more button */}
          {!allSent && (
            <Button
              variant="ghost"
              size="sm"
              onClick={addEntry}
              className="w-full mt-3 text-primary"
              disabled={isSending}
            >
              <Plus className="w-4 h-4 mr-1" />
              Nog iemand toevoegen
            </Button>
          )}

          {/* Actions */}
          <div className="mt-4 space-y-2">
            {allSent ? (
              <Button
                onClick={handleClose}
                className="w-full h-11 rounded-xl"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Klaar
              </Button>
            ) : (
              <>
                <Button
                  onClick={handleSendInvites}
                  disabled={!canSend || isSending}
                  className="w-full h-11 rounded-xl"
                >
                  {isSending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Versturen...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Verstuur uitnodiging{entries.filter(e => e.phone.trim()).length > 1 ? "en" : ""} via WhatsApp
                    </>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleClose}
                  disabled={isSending}
                  className="w-full h-9 text-muted-foreground"
                >
                  Later
                </Button>
              </>
            )}
          </div>

          {/* Info text */}
          <p className="text-xs text-center text-muted-foreground mt-3">
            Ze ontvangen een WhatsApp met uitleg en een link om een account aan te maken.
          </p>
        </div>
      </MobileModalContent>
    </MobileModal>
  );
};
