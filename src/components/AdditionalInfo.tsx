import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Plus, Minus, Users, Baby, PawPrint, LogOut, Heart, Home } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js";

interface AdditionalInfoProps {
  onComplete: (adults: number, children: number, pets: number, phone: string) => void;
  user: User | null;
}

export const AdditionalInfo = ({ onComplete, user }: AdditionalInfoProps) => {
  const [phone, setPhone] = useState("");
  const [householdType, setHouseholdType] = useState<"partner" | "housemates">("partner");
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [pets, setPets] = useState(0);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Uitgelogd",
      description: "Je bent succesvol uitgelogd.",
    });
  };

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        setHouseholdType((profile.household_type as "partner" | "housemates") || "partner");
        setAdults(profile.adults || 1);
        setChildren(profile.children || 0);
        setPets(profile.pets || 0);
        setPhone(profile.phone || "");
      }
      setLoading(false);
    };

    loadProfile();
  }, [user]);

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

    onComplete(adults, children, pets, phone);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30 flex items-center justify-center p-5 md:p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Laden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30 flex items-center justify-center p-4 md:p-6">
      <div className="w-full max-w-2xl space-y-6 md:space-y-8">
        <div className="text-center space-y-2 relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="absolute right-0 top-0 h-10 w-10"
            title="Uitloggen"
          >
            <LogOut className="w-5 h-5" />
          </Button>
          <h1 className="text-3xl md:text-4xl font-bold font-charly tracking-tight">
            Nog een paar gegevens
          </h1>
          <p className="text-base md:text-lg text-muted-foreground">
            Dit helpt ons je beter te begeleiden
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 md:p-8 space-y-6 md:space-y-8 shadow-lg">
          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-base">Telefoonnummer</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+31 6 12345678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-12 text-base"
            />
          </div>

          {/* Household Type */}
          <div className="space-y-3">
            <Label className="text-base">Type huishouden</Label>
            <RadioGroup value={householdType} onValueChange={(value) => setHouseholdType(value as "partner" | "housemates")}>
              <div className="flex items-center space-x-2 bg-secondary/50 rounded-lg p-4">
                <RadioGroupItem value="partner" id="partner" />
                <Label htmlFor="partner" className="flex items-center gap-2 cursor-pointer flex-1">
                  <Heart className="w-4 h-4 text-primary" />
                  Partner
                </Label>
              </div>
              <div className="flex items-center space-x-2 bg-secondary/50 rounded-lg p-4">
                <RadioGroupItem value="housemates" id="housemates" />
                <Label htmlFor="housemates" className="flex items-center gap-2 cursor-pointer flex-1">
                  <Home className="w-4 h-4 text-primary" />
                  Huisgenoten
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Adults */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-base">
              <Users className="w-5 h-5 text-primary" />
              Volwassenen
            </Label>
            <div className="flex items-center justify-between bg-secondary/50 rounded-lg p-5">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => handleDecrement(setAdults, adults)}
                disabled={adults <= 1}
                className="h-12 w-12 md:h-10 md:w-10"
              >
                <Minus className="w-5 h-5 md:w-4 md:h-4" />
              </Button>
              <span className="text-3xl md:text-2xl font-semibold min-w-[4rem] text-center">
                {adults}
              </span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => handleIncrement(setAdults, adults)}
                className="h-12 w-12 md:h-10 md:w-10"
              >
                <Plus className="w-5 h-5 md:w-4 md:h-4" />
              </Button>
            </div>
          </div>

          {/* Children */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-base">
              <Baby className="w-5 h-5 text-primary" />
              Kinderen
            </Label>
            <div className="flex items-center justify-between bg-secondary/50 rounded-lg p-5">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => handleDecrement(setChildren, children)}
                disabled={children <= 0}
                className="h-12 w-12 md:h-10 md:w-10"
              >
                <Minus className="w-5 h-5 md:w-4 md:h-4" />
              </Button>
              <span className="text-3xl md:text-2xl font-semibold min-w-[4rem] text-center">
                {children}
              </span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => handleIncrement(setChildren, children)}
                className="h-12 w-12 md:h-10 md:w-10"
              >
                <Plus className="w-5 h-5 md:w-4 md:h-4" />
              </Button>
            </div>
          </div>

          {/* Pets */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-base">
              <PawPrint className="w-5 h-5 text-primary" />
              Huisdieren
            </Label>
            <div className="flex items-center justify-between bg-secondary/50 rounded-lg p-5">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => handleDecrement(setPets, pets)}
                disabled={pets <= 0}
                className="h-12 w-12 md:h-10 md:w-10"
              >
                <Minus className="w-5 h-5 md:w-4 md:h-4" />
              </Button>
              <span className="text-3xl md:text-2xl font-semibold min-w-[4rem] text-center">
                {pets}
              </span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => handleIncrement(setPets, pets)}
                className="h-12 w-12 md:h-10 md:w-10"
              >
                <Plus className="w-5 h-5 md:w-4 md:h-4" />
              </Button>
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={loading}
            size="lg"
            className="w-full min-h-[52px] text-base"
          >
            {loading ? "Opslaan..." : "Doorgaan"}
          </Button>
        </div>
      </div>
    </div>
  );
};
