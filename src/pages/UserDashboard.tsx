import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { Dashboard } from "@/components/Dashboard";
import { TaskList } from "@/components/TaskList";
import { Extras } from "@/components/Extras";
import { Settings } from "@/components/Settings";
import { ChatHome } from "@/components/ChatHome";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { LuaLogo } from "@/components/LuaLogo";
import { supabase } from "@/integrations/supabase/client";
import { MovingInfo, AppView } from "@/types/moving";

const UserDashboard = () => {
  const { token } = useParams<{ token: string }>();
  const [movingInfo, setMovingInfo] = useState<MovingInfo | null>(null);
  const [currentView, setCurrentView] = useState<AppView>("dashboard");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    if (!token) {
      setError("Geen token gevonden.");
      setLoading(false);
      return;
    }

    try {
      const { data: profile, error: fetchError } = await supabase
        .from("profiles")
        .select("*")
        .eq("dashboard_token" as any, token)
        .single();

      if (fetchError || !profile) {
        setError("Deze link is niet geldig of verlopen.");
        setLoading(false);
        return;
      }

      const info: MovingInfo = {
        oldAddress: (profile as any).old_address || "",
        newAddress: (profile as any).new_address || "",
        movingDate: (profile as any).moving_date,
        keyHandoverDate: (profile as any).key_handover_date || undefined,
        type: ((profile as any).moving_type as "buy" | "rent") || "rent",
        renovationType: ((profile as any).renovation_type as "none" | "small" | "large") || "none",
        needsContractorHelp: (profile as any).needs_contractor_help || false,
        propertyType: ((profile as any).housing_property_type as "apartment" | "house" | "studio") || undefined,
        hasGarden: (profile as any).has_garden || false,
        hasParking: (profile as any).has_parking || false,
        isVve: (profile as any).is_vve || false,
        currentSituation: ((profile as any).current_housing_situation as "rent" | "buy" | "parents" | "other") || undefined,
        hasJob: (profile as any).has_job !== false,
        children: (profile as any).children || 0,
        pets: (profile as any).pets || 0,
        movingBudget: (profile as any).moving_budget || undefined,
      };

      setMovingInfo(info);
      setLoading(false);
    } catch (err) {
      console.error("Error loading profile:", err);
      setError("Er ging iets mis bij het laden van je dashboard.");
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleUpdateMovingInfo = async (data: Partial<MovingInfo>) => {
    if (!movingInfo) return;
    const updatedInfo = { ...movingInfo, ...data };
    setMovingInfo(updatedInfo);
    // Persist updates back to Supabase via token
    // (future: update profile where dashboard_token = token)
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-light via-primary-light/80 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-muted-foreground">Je dashboard laden...</p>
        </div>
      </div>
    );
  }

  if (error || !movingInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-light via-primary-light/80 to-white flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <LuaLogo size="md" />
          <h1 className="text-2xl font-bold text-foreground mt-6 mb-3">Oeps!</h1>
          <p className="text-muted-foreground mb-6">{error || "Dashboard niet gevonden."}</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 h-11 px-6 rounded-full bg-primary hover:bg-primary/90 text-white font-semibold transition-colors"
          >
            Terug naar Lua
          </Link>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-primary-light via-primary-light/80 to-white">
        {currentView === "dashboard" && (
          <Dashboard
            movingInfo={movingInfo}
            onNavigate={setCurrentView}
            onUpdateMovingInfo={handleUpdateMovingInfo}
          />
        )}
        {currentView === "tasks" && (
          <TaskList
            movingInfo={movingInfo}
            onNavigate={setCurrentView}
            onUpdateMovingInfo={handleUpdateMovingInfo}
            isGuest={true}
          />
        )}
        {currentView === "extras" && (
          <Extras
            onNavigate={setCurrentView}
            isGuest={true}
          />
        )}
        {currentView === "settings" && (
          <Settings
            movingInfo={movingInfo}
            onNavigate={setCurrentView}
            onLogout={() => setCurrentView("dashboard")}
            onUpdate={setMovingInfo}
            isGuest={true}
            user={null}
          />
        )}
        {currentView === "chat" && (
          <ChatHome
            movingInfo={movingInfo}
            onNavigate={setCurrentView}
            isGuest={true}
          />
        )}
      </div>
    </ErrorBoundary>
  );
};

export default UserDashboard;
