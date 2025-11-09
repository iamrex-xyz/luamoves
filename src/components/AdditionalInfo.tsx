import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Minus, Users, Baby, PawPrint } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AdditionalInfoProps {
  onComplete: () => void;
}

export const AdditionalInfo = ({ onComplete }: AdditionalInfoProps) => {
  const [phone, setPhone] = useState("");
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [pets, setPets] = useState(0);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleIncrement = (setter: (val: number) => void, value: number) => {
    setter(value + 1);
  };

  const handleDecrement = (setter: (val: number) => void, value: number) => {
    if (value > 0) {
      setter(value - 1);
    }
  };

  const handleSubmit = async () => {
    if (!phone.trim()) {
      toast({
        title: "Telefoonnummer vereist",
        description: "Vul je telefoonnummer in om door te gaan",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Geen gebruiker gevonden");
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          phone,
          adults,
          children,
          pets,
        })
        .eq("user_id", user.id);

      if (error) throw error;

      toast({
        title: "Gegevens opgeslagen",
        description: "Je informatie is succesvol opgeslagen",
      });

      onComplete();
    } catch (error: any) {
      toast({
        title: "Fout bij opslaan",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold font-charly tracking-tight">
            Nog een paar gegevens
          </h1>
          <p className="text-lg text-muted-foreground">
            Dit helpt ons je beter te begeleiden
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 space-y-8 shadow-lg">
          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone">Telefoonnummer</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+31 6 12345678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          {/* Adults */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Volwassenen
            </Label>
            <div className="flex items-center justify-between bg-secondary/50 rounded-lg p-4">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => handleDecrement(setAdults, adults)}
                disabled={adults <= 1}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <span className="text-2xl font-semibold min-w-[3rem] text-center">
                {adults}
              </span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => handleIncrement(setAdults, adults)}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Children */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Baby className="w-5 h-5 text-primary" />
              Kinderen
            </Label>
            <div className="flex items-center justify-between bg-secondary/50 rounded-lg p-4">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => handleDecrement(setChildren, children)}
                disabled={children <= 0}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <span className="text-2xl font-semibold min-w-[3rem] text-center">
                {children}
              </span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => handleIncrement(setChildren, children)}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Pets */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <PawPrint className="w-5 h-5 text-primary" />
              Huisdieren
            </Label>
            <div className="flex items-center justify-between bg-secondary/50 rounded-lg p-4">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => handleDecrement(setPets, pets)}
                disabled={pets <= 0}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <span className="text-2xl font-semibold min-w-[3rem] text-center">
                {pets}
              </span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => handleIncrement(setPets, pets)}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={loading}
            size="lg"
            className="w-full"
          >
            {loading ? "Opslaan..." : "Doorgaan"}
          </Button>
        </div>
      </div>
    </div>
  );
};
