import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Minus, Users, Baby, PawPrint, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js";

interface AdditionalInfoProps {
  onComplete: (adults: number, children: number, pets: number, phone: string) => void;
  user: User | null;
}

export const AdditionalInfo = ({ onComplete, user }: AdditionalInfoProps) => {
  const [countryCode, setCountryCode] = useState("+31");
  const [phone, setPhone] = useState("");
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [pets, setPets] = useState(0);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const countryCodes = [
    { code: "+31", country: "Nederland", flag: "🇳🇱", abbr: "NL", digits: 9 },
    { code: "+32", country: "België", flag: "🇧🇪", abbr: "BE", digits: 9 },
    { code: "+49", country: "Duitsland", flag: "🇩🇪", abbr: "DE", digits: 10 },
    { code: "+33", country: "Frankrijk", flag: "🇫🇷", abbr: "FR", digits: 9 },
    { code: "+34", country: "Spanje", flag: "🇪🇸", abbr: "ES", digits: 9 },
    { code: "+39", country: "Italië", flag: "🇮🇹", abbr: "IT", digits: 10 },
    { code: "+41", country: "Zwitserland", flag: "🇨🇭", abbr: "CH", digits: 9 },
    { code: "+43", country: "Oostenrijk", flag: "🇦🇹", abbr: "AT", digits: 10 },
    { code: "+44", country: "Verenigd Koninkrijk", flag: "🇬🇧", abbr: "GB", digits: 10 },
    { code: "+45", country: "Denemarken", flag: "🇩🇰", abbr: "DK", digits: 8 },
    { code: "+46", country: "Zweden", flag: "🇸🇪", abbr: "SE", digits: 9 },
    { code: "+47", country: "Noorwegen", flag: "🇳🇴", abbr: "NO", digits: 8 },
    { code: "+48", country: "Polen", flag: "🇵🇱", abbr: "PL", digits: 9 },
    { code: "+351", country: "Portugal", flag: "🇵🇹", abbr: "PT", digits: 9 },
    { code: "+352", country: "Luxemburg", flag: "🇱🇺", abbr: "LU", digits: 9 },
    { code: "+353", country: "Ierland", flag: "🇮🇪", abbr: "IE", digits: 9 },
    { code: "+358", country: "Finland", flag: "🇫🇮", abbr: "FI", digits: 9 },
    { code: "+30", country: "Griekenland", flag: "🇬🇷", abbr: "GR", digits: 10 },
    { code: "+1", country: "Verenigde Staten", flag: "🇺🇸", abbr: "US", digits: 10 },
    { code: "+1", country: "Canada", flag: "🇨🇦", abbr: "CA", digits: 10 },
    { code: "+61", country: "Australië", flag: "🇦🇺", abbr: "AU", digits: 9 },
    { code: "+64", country: "Nieuw-Zeeland", flag: "🇳🇿", abbr: "NZ", digits: 9 },
    { code: "+81", country: "Japan", flag: "🇯🇵", abbr: "JP", digits: 10 },
    { code: "+86", country: "China", flag: "🇨🇳", abbr: "CN", digits: 11 },
    { code: "+91", country: "India", flag: "🇮🇳", abbr: "IN", digits: 10 },
    { code: "+7", country: "Rusland", flag: "🇷🇺", abbr: "RU", digits: 10 },
    { code: "+27", country: "Zuid-Afrika", flag: "🇿🇦", abbr: "ZA", digits: 9 },
    { code: "+55", country: "Brazilië", flag: "🇧🇷", abbr: "BR", digits: 11 },
    { code: "+52", country: "Mexico", flag: "🇲🇽", abbr: "MX", digits: 10 },
    { code: "+20", country: "Egypte", flag: "🇪🇬", abbr: "EG", digits: 10 },
    { code: "+90", country: "Turkije", flag: "🇹🇷", abbr: "TR", digits: 10 },
    { code: "+966", country: "Saoedi-Arabië", flag: "🇸🇦", abbr: "SA", digits: 9 },
    { code: "+971", country: "VAE", flag: "🇦🇪", abbr: "AE", digits: 9 },
    { code: "+65", country: "Singapore", flag: "🇸🇬", abbr: "SG", digits: 8 },
    { code: "+60", country: "Maleisië", flag: "🇲🇾", abbr: "MY", digits: 9 },
    { code: "+66", country: "Thailand", flag: "🇹🇭", abbr: "TH", digits: 9 },
    { code: "+84", country: "Vietnam", flag: "🇻🇳", abbr: "VN", digits: 9 },
    { code: "+62", country: "Indonesië", flag: "🇮🇩", abbr: "ID", digits: 10 },
    { code: "+63", country: "Filipijnen", flag: "🇵🇭", abbr: "PH", digits: 10 },
    { code: "+82", country: "Zuid-Korea", flag: "🇰🇷", abbr: "KR", digits: 10 },
    { code: "+597", country: "Suriname", flag: "🇸🇷", abbr: "SR", digits: 7 },
    { code: "+599", country: "Curaçao", flag: "🇨🇼", abbr: "CW", digits: 7 },
    { code: "+297", country: "Aruba", flag: "🇦🇼", abbr: "AW", digits: 7 },
  ];

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
        setAdults(profile.adults || 1);
        setChildren(profile.children || 0);
        setPets(profile.pets || 0);
        if (profile.phone) {
          // Try to extract country code from phone number
          const phoneStr = profile.phone;
          const matchedCountry = countryCodes.find(c => phoneStr.startsWith(c.code));
          if (matchedCountry) {
            setCountryCode(matchedCountry.code);
            setPhone(phoneStr.substring(matchedCountry.code.length).trim());
          } else {
            setPhone(phoneStr);
          }
        }
      }
      setLoading(false);
    };

    loadProfile();
  }, [user]);

  const handleIncrement = (setter: (val: number) => void, value: number) => {
    setter(value + 1);
  };

  const handleDecrement = (setter: (val: number) => void, value: number, minimum: number = 0) => {
    if (value > minimum) {
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

    // Validate phone number length based on country code
    const selectedCountry = countryCodes.find(c => c.code === countryCode);
    const cleanPhone = phone.replace(/\s/g, '');
    
    if (selectedCountry && cleanPhone.length !== selectedCountry.digits) {
      toast({
        title: "Ongeldig telefoonnummer",
        description: `Een ${selectedCountry.country} telefoonnummer moet ${selectedCountry.digits} cijfers hebben`,
        variant: "destructive",
      });
      return;
    }

    const fullPhone = `${countryCode} ${phone}`;
    onComplete(adults, children, pets, fullPhone);
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
          <h1 className="text-2xl md:text-4xl font-bold font-charly tracking-tight">
            Nog een paar gegevens
          </h1>
          <p className="text-sm md:text-lg text-muted-foreground">
            Dit helpt ons je beter te begeleiden
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 md:p-8 space-y-6 md:space-y-8 shadow-lg">
          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-base">Telefoonnummer</Label>
            <div className="flex gap-2">
              <Select value={countryCode} onValueChange={setCountryCode}>
                <SelectTrigger className="h-12 w-[180px]">
                  <SelectValue>
                    {countryCodes.find(c => c.code === countryCode)?.flag} {countryCodes.find(c => c.code === countryCode)?.abbr} {countryCode}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {countryCodes.map((country, index) => (
                    <SelectItem key={`${country.code}-${index}`} value={country.code}>
                      {country.flag} {country.abbr} - {country.country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                id="phone"
                type="tel"
                placeholder={countryCodes.find(c => c.code === countryCode)?.digits === 9 ? "612345678" : "1234567890"}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                className="h-12 text-base flex-1"
                maxLength={countryCodes.find(c => c.code === countryCode)?.digits || 10}
              />
            </div>
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
                onClick={() => handleDecrement(setAdults, adults, 1)}
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
