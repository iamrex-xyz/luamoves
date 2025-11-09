import { useState } from "react";
import { Onboarding } from "@/components/Onboarding";
import { Auth } from "@/components/Auth";
import { AdditionalInfo } from "@/components/AdditionalInfo";
import { Dashboard } from "@/components/Dashboard";
import { TaskList } from "@/components/TaskList";
import { Timeline } from "@/components/Timeline";
import { User } from "@supabase/supabase-js";

export type MovingInfo = {
  oldAddress: string;
  newAddress: string;
  movingDate: string;
  type: "buy" | "rent";
};

const Index = () => {
  const [movingInfo, setMovingInfo] = useState<MovingInfo | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<
    "onboarding" | "auth" | "additionalInfo" | "dashboard" | "tasks" | "timeline"
  >("onboarding");

  const handleOnboardingComplete = (info: MovingInfo) => {
    setMovingInfo(info);
    setCurrentView("auth");
  };

  const handleAuthComplete = (authenticatedUser: User) => {
    setUser(authenticatedUser);
    setCurrentView("additionalInfo");
  };

  const handleAdditionalInfoComplete = () => {
    setCurrentView("dashboard");
  };

  if (currentView === "onboarding") {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  if (currentView === "auth") {
    return <Auth onComplete={handleAuthComplete} />;
  }

  if (currentView === "additionalInfo") {
    return <AdditionalInfo onComplete={handleAdditionalInfoComplete} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30">
      {currentView === "dashboard" && movingInfo && (
        <Dashboard 
          movingInfo={movingInfo} 
          onNavigate={setCurrentView}
        />
      )}
      {currentView === "tasks" && movingInfo && (
        <TaskList 
          movingInfo={movingInfo}
          onNavigate={setCurrentView}
        />
      )}
      {currentView === "timeline" && movingInfo && (
        <Timeline 
          movingInfo={movingInfo}
          onNavigate={setCurrentView}
        />
      )}
    </div>
  );
};

export default Index;
