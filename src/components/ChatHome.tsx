import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BottomNav } from "@/components/BottomNav";
import { CollaboratorChat } from "@/components/CollaboratorChat";
import { LuaAIChat } from "@/components/LuaAIChat";
import { SignupPromptDialog } from "@/components/SignupPromptDialog";
import { InvitePartnerDialog } from "@/components/InvitePartnerDialog";
import { Users, Sparkles, UserPlus, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { MovingInfo } from "@/pages/Index";
import { trackEvent } from "@/lib/analytics";

type ChatHomeProps = {
  movingInfo: MovingInfo;
  onNavigate: (view: "dashboard" | "tasks" | "extras" | "settings" | "chat") => void;
  isGuest?: boolean;
  onSignupClick?: () => void;
};

export const ChatHome = ({ movingInfo, onNavigate, isGuest, onSignupClick }: ChatHomeProps) => {
  const [activeTab, setActiveTab] = useState<"partner" | "lua">("lua");
  const [hasPartner, setHasPartner] = useState(false);
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);
  const [showPartnerInvite, setShowPartnerInvite] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkPartnerStatus();
    trackEvent("chat_home_viewed");
  }, []);

  const checkPartnerStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Check if user has any collaborators
      const { data: collaborators } = await supabase
        .from("moving_collaborators")
        .select("*")
        .or(`owner_user_id.eq.${user.id},collaborator_user_id.eq.${user.id}`)
        .not("accepted_at", "is", null);

      setHasPartner((collaborators?.length || 0) > 0);
    } catch (error) {
      console.error("Error checking partner status:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value as "partner" | "lua");
    if (value === "lua") {
      trackEvent("chat_lua_opened");
    } else {
      trackEvent("chat_partner_opened");
    }
  };

  const handlePartnerTabClick = () => {
    if (isGuest) {
      if (onSignupClick) {
        onSignupClick();
      } else {
        setShowSignupPrompt(true);
      }
      return;
    }
    setActiveTab("partner");
    trackEvent("chat_partner_opened");
  };

  const handleAddPartner = () => {
    onNavigate("settings");
  };

  if (loading) {
    return (
      <div className="min-h-screen pb-20 bg-gradient-to-br from-primary-light via-primary-light/80 to-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 bg-gradient-to-br from-primary-light via-primary-light/80 to-white">
      {/* Header */}
      <div className="px-4 pt-4 pb-2 flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onNavigate("dashboard")}
          className="shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <span className="text-2xl font-italiana text-foreground tracking-wide">Chat</span>
      </div>

      {/* Tabs */}
      <div className="px-4">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger 
              value="lua" 
              className="flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Lua
            </TabsTrigger>
            <TabsTrigger 
              value="partner" 
              onClick={(e) => {
                if (isGuest) {
                  e.preventDefault();
                  handlePartnerTabClick();
                }
              }}
              className="flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              Partner(s)
            </TabsTrigger>
          </TabsList>

          <TabsContent value="lua" className="mt-0">
            <LuaAIChat movingInfo={movingInfo} />
          </TabsContent>

          <TabsContent value="partner" className="mt-0">
            {!hasPartner ? (
              <Card className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Samen verhuizen?</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Nodig iemand uit om samen jullie verhuizing te regelen. Alles op één plek, nooit gedoe.
                </p>
                <Button onClick={() => setShowPartnerInvite(true)} className="gap-2">
                  <UserPlus className="w-4 h-4" />
                  Huisgenoot toevoegen
                </Button>
              </Card>
            ) : (
              <CollaboratorChat />
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Signup prompt for guests */}
      <SignupPromptDialog
        open={showSignupPrompt}
        onOpenChange={setShowSignupPrompt}
        onSignupComplete={() => {
          setShowSignupPrompt(false);
          window.location.reload();
        }}
        capturedEmail=""
      />

      {/* Partner invite dialog */}
      <InvitePartnerDialog
        open={showPartnerInvite}
        onOpenChange={setShowPartnerInvite}
        onInviteSent={() => {
          setShowPartnerInvite(false);
          checkPartnerStatus();
        }}
      />

      <BottomNav currentView="chat" onNavigate={onNavigate} />
    </div>
  );
};
