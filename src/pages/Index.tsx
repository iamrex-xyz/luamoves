import { useState } from "react";
import { Onboarding } from "@/components/Onboarding";
import { Dashboard } from "@/components/Dashboard";
import { TaskList } from "@/components/TaskList";
import { Timeline } from "@/components/Timeline";

export type MovingInfo = {
  oldAddress: string;
  newAddress: string;
  movingDate: string;
  type: "buy" | "rent";
};

const Index = () => {
  const [movingInfo, setMovingInfo] = useState<MovingInfo | null>(null);
  const [currentView, setCurrentView] = useState<"onboarding" | "dashboard" | "tasks" | "timeline">("onboarding");

  const handleComplete = (info: MovingInfo) => {
    setMovingInfo(info);
    setCurrentView("dashboard");
  };

  if (currentView === "onboarding") {
    return <Onboarding onComplete={handleComplete} />;
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
