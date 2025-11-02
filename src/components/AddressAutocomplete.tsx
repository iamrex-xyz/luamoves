import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { MapPin, Loader2 } from "lucide-react";

type AddressSuggestion = {
  id: string;
  weergavenaam: string;
  straatnaam?: string;
  huisnummer?: string;
  postcode?: string;
  woonplaatsnaam?: string;
};

type AddressAutocompleteProps = {
  label: string;
  value: string;
  onChange: (address: string) => void;
  placeholder?: string;
};

export const AddressAutocomplete = ({
  label,
  value,
  onChange,
  placeholder = "Begin met typen...",
}: AddressAutocompleteProps) => {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const searchAddress = async () => {
      if (query.length < 3) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(
          `https://api.pdok.nl/bzk/locatieserver/search/v3_1/free?q=${encodeURIComponent(
            query
          )}&fq=type:adres&rows=10`
        );
        const data = await response.json();

        if (data.response?.docs) {
          setSuggestions(data.response.docs);
          setShowSuggestions(true);
        }
      } catch (error) {
        console.error("Fout bij ophalen adressen:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(searchAddress, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleSelect = (suggestion: AddressSuggestion) => {
    const fullAddress = suggestion.weergavenaam;
    setQuery(fullAddress);
    onChange(fullAddress);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <label className="block text-sm font-medium mb-2">{label}</label>
      <div className="relative">
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowSuggestions(true);
          }}
          placeholder={placeholder}
          className="pr-10"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          ) : (
            <MapPin className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <Card className="absolute z-50 w-full mt-2 max-h-60 overflow-y-auto bg-card border shadow-lg">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.id}
              onClick={() => handleSelect(suggestion)}
              className="w-full text-left px-4 py-3 hover:bg-accent transition-colors border-b border-border last:border-b-0 flex items-start gap-3"
            >
              <MapPin className="w-4 h-4 mt-1 text-primary flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">
                  {suggestion.straatnaam} {suggestion.huisnummer}
                </div>
                <div className="text-xs text-muted-foreground">
                  {suggestion.postcode} {suggestion.woonplaatsnaam}
                </div>
              </div>
            </button>
          ))}
        </Card>
      )}

      {showSuggestions && query.length >= 3 && !isLoading && suggestions.length === 0 && (
        <Card className="absolute z-50 w-full mt-2 p-4 bg-card border shadow-lg">
          <p className="text-sm text-muted-foreground text-center">
            Geen adressen gevonden
          </p>
        </Card>
      )}
    </div>
  );
};
