import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { MapPin, Loader2 } from "lucide-react";

type AddressSuggestion = {
  id: string;
  weergavenaam: string;
  straatnaam?: string;
  huisnummer?: string;
  huisletter?: string;
  huisnummertoevoeging?: string;
  postcode?: string;
  woonplaatsnaam?: string;
  centroide_ll?: string; // Format: "POINT(lon lat)"
};

type AddressAutocompleteProps = {
  label: string;
  value: string;
  onChange: (address: string, isComplete?: boolean) => void;
  placeholder?: string;
  requireComplete?: boolean;
  error?: string;
};

export const AddressAutocomplete = ({
  label,
  value,
  onChange,
  placeholder = "Begin met typen...",
  requireComplete = false,
  error,
}: AddressAutocompleteProps) => {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [justSelected, setJustSelected] = useState(false);
  const [selectedValue, setSelectedValue] = useState("");
  const [isCompleteAddress, setIsCompleteAddress] = useState(false);
  const [hasUserTyped, setHasUserTyped] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [locationRequested, setLocationRequested] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<number | null>(null);

  // Get user's location on component mount
  useEffect(() => {
    if (navigator.geolocation && !locationRequested) {
      setLocationRequested(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        (error) => {
          console.log("Locatie toegang geweigerd:", error);
        }
      );
    }
  }, [locationRequested]);

  // Calculate distance between two points using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Parse POINT string to lat/lon
  const parsePoint = (pointStr: string): { lat: number; lon: number } | null => {
    const match = pointStr.match(/POINT\(([^\s]+)\s+([^\)]+)\)/);
    if (match) {
      return { lon: parseFloat(match[1]), lat: parseFloat(match[2]) };
    }
    return null;
  };

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
    // Clear any pending search timeout when dependencies change
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = null;
    }

    const searchAddress = async () => {
      if (query.length < 3 || justSelected || query === selectedValue || !hasUserTyped) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      setIsLoading(true);
      try {
        // Add wildcard to query for better partial matching
        const searchQuery = query.trim() + '*';
        // Remove the type:adres filter to include all address types including floors/additions
        // Increase rows to 50 to show more results
        const apiUrl = `https://api.pdok.nl/bzk/locatieserver/search/v3_1/free?q=${encodeURIComponent(
          searchQuery
        )}&fq=type:(adres)&rows=50`;

        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.response?.docs) {
          let results = data.response.docs;
          
          // Extract house number from query for smart sorting
          const queryMatch = query.match(/(\d+)/);
          const searchedNumber = queryMatch ? parseInt(queryMatch[1]) : null;
          
          // Sort by relevance: prioritize exact matches and close house numbers
          results = results
            .map((doc: AddressSuggestion) => {
              let relevanceScore = 0;
              
              if (doc.huisnummer && searchedNumber) {
                const docNumber = parseInt(doc.huisnummer);
                // Calculate how close the house number is to searched number
                const numberDiff = Math.abs(docNumber - searchedNumber);
                // Lower difference = higher score (inverted)
                relevanceScore = 1000 - numberDiff;
                
                // Boost exact matches
                if (docNumber === searchedNumber) {
                  relevanceScore += 10000;
                }
              }
              
              // Additional boost for matching street name
              if (doc.straatnaam && query.toLowerCase().includes(doc.straatnaam.toLowerCase().substring(0, 5))) {
                relevanceScore += 5000;
              }
              
              return { ...doc, relevanceScore };
            })
            .sort((a: any, b: any) => b.relevanceScore - a.relevanceScore);
          
          setSuggestions(results);
          setShowSuggestions(true);
        }
      } catch (error) {
        console.error("Fout bij ophalen adressen:", error);
      } finally {
        setIsLoading(false);
      }
    };

    searchTimeoutRef.current = window.setTimeout(searchAddress, 300);
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = null;
      }
    };
  }, [query, justSelected, selectedValue, hasUserTyped]);

  const handleSelect = (suggestion: AddressSuggestion) => {
    const fullAddress = suggestion.weergavenaam;
    const hasPostcodeAndNumber = !!(suggestion.postcode && suggestion.huisnummer);
    
    setJustSelected(true);
    setSelectedValue(fullAddress);
    setQuery(fullAddress);
    setIsCompleteAddress(hasPostcodeAndNumber);
    onChange(fullAddress, hasPostcodeAndNumber);
    setShowSuggestions(false);
    setSuggestions([]);
    setHasUserTyped(false);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <label className="block text-sm font-medium mb-2">{label}</label>
      <div className="relative">
        <Input
          value={query}
          onChange={(e) => {
            setJustSelected(false);
            setSelectedValue("");
            setIsCompleteAddress(false);
            setQuery(e.target.value);
            setHasUserTyped(true);
            setShowSuggestions(true);
            // When typing manually, mark as incomplete
            onChange(e.target.value, false);
          }}
          onFocus={() => {
            if (query.length >= 3 && query !== selectedValue && hasUserTyped) {
              setShowSuggestions(true);
            }
          }}
          placeholder={placeholder}
          className={`pr-10 ${error ? 'border-destructive focus-visible:ring-destructive' : ''} ${requireComplete && query && !isCompleteAddress ? 'border-warning' : ''}`}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          ) : (
            <MapPin className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </div>

      {/* Error or hint message */}
      {error && (
        <p className="text-sm text-destructive mt-1">{error}</p>
      )}
      {requireComplete && query && !isCompleteAddress && !error && (
        <p className="text-sm text-muted-foreground mt-1">
          Selecteer een adres uit de lijst met postcode en huisnummer.
        </p>
      )}
      {showSuggestions && query !== selectedValue && suggestions.length > 0 && (
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
                  {suggestion.huisletter && suggestion.huisletter}
                  {suggestion.huisnummertoevoeging && `-${suggestion.huisnummertoevoeging}`}
                </div>
                <div className="text-xs text-muted-foreground">
                  {suggestion.postcode} {suggestion.woonplaatsnaam}
                </div>
              </div>
            </button>
          ))}
        </Card>
      )}

      {showSuggestions && query !== selectedValue && query.length >= 3 && !isLoading && suggestions.length === 0 && (
        <Card className="absolute z-50 w-full mt-2 p-4 bg-card border shadow-lg">
          <p className="text-sm text-muted-foreground text-center">
            Geen adressen gevonden
          </p>
        </Card>
      )}
    </div>
  );
};
