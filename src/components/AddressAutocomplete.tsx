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
  centroide_ll?: string; // Format: "POINT(lon lat)"
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
  const [justSelected, setJustSelected] = useState(false);
  const [selectedValue, setSelectedValue] = useState("");
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
      if (query.length < 3 || justSelected || query === selectedValue) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      setIsLoading(true);
      try {
        const apiUrl = `https://api.pdok.nl/bzk/locatieserver/search/v3_1/free?q=${encodeURIComponent(
          query
        )}&fq=type:adres&rows=10`;

        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.response?.docs) {
          let results = data.response.docs;
          
          // Sort by distance if user location is available
          if (userLocation) {
            results = results
              .map((doc: AddressSuggestion) => {
                if (doc.centroide_ll) {
                  const point = parsePoint(doc.centroide_ll);
                  if (point) {
                    const distance = calculateDistance(
                      userLocation.lat,
                      userLocation.lon,
                      point.lat,
                      point.lon
                    );
                    return { ...doc, distance };
                  }
                }
                return { ...doc, distance: Infinity };
              })
              .sort((a: any, b: any) => a.distance - b.distance);
          }
          
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
  }, [query, justSelected, selectedValue, userLocation]);

  const handleSelect = (suggestion: AddressSuggestion) => {
    const fullAddress = suggestion.weergavenaam;
    setJustSelected(true);
    setSelectedValue(fullAddress);
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
            setJustSelected(false);
            setSelectedValue("");
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
