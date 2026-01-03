import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageCircle, Send, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

type Message = {
  id: string;
  user_id: string;
  message: string;
  created_at: string;
};

type Collaborator = {
  id: string;
  name: string;
  type: 'email' | 'phone';
};

const messageSchema = z.object({
  message: z.string()
    .trim()
    .min(1, "Bericht mag niet leeg zijn")
    .max(1000, "Bericht mag maximaal 1000 tekens bevatten")
});

export const CollaboratorChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();
    loadCollaborators();
    setupRealtimeSubscription();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  const loadCollaborators = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const allCollaborators: Collaborator[] = [];

      // Load email-based collaborators
      const { data: emailCollabs } = await supabase
        .from("moving_collaborators")
        .select("id, collaborator_email")
        .or(`owner_user_id.eq.${user.id},collaborator_user_id.eq.${user.id}`);

      if (emailCollabs) {
        emailCollabs.forEach((c) => {
          allCollaborators.push({
            id: c.id,
            name: c.collaborator_email.split('@')[0],
            type: 'email'
          });
        });
      }

      // Load phone-based household members
      const { data: householdMembers } = await supabase
        .from("household_members")
        .select("id, name, phone")
        .or(`owner_user_id.eq.${user.id},member_user_id.eq.${user.id}`);

      if (householdMembers) {
        householdMembers.forEach((m) => {
          allCollaborators.push({
            id: m.id,
            name: m.name || m.phone,
            type: 'phone'
          });
        });
      }

      setCollaborators(allCollaborators);
    } catch (error) {
      console.error("Error loading collaborators:", error);
    }
  };

  const loadMessages = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setCurrentUserId(user.id);

      const { data, error } = await supabase
        .from("collaborator_messages")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error("Error loading messages:", error);
      toast.error("Kon berichten niet laden");
    } finally {
      setIsLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel("collaborator_messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "collaborator_messages",
        },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages((current) => [...current, newMsg]);
          
          // Show toast if message is from another user
          if (newMsg.user_id !== currentUserId) {
            toast.success("Nieuw bericht ontvangen", {
              description: newMsg.message.substring(0, 50) + (newMsg.message.length > 50 ? "..." : ""),
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async () => {
    if (!currentUserId) return;

    const validation = messageSchema.safeParse({ message: newMessage });
    
    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }

    const messageToSend = validation.data.message;

    try {
      const { error } = await supabase
        .from("collaborator_messages")
        .insert({
          user_id: currentUserId,
          message: messageToSend,
        });

      if (error) throw error;
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Kon bericht niet versturen");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <p className="text-center text-muted-foreground">Berichten laden...</p>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col h-[500px]">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Chat met medeverhuizers</h3>
          </div>
          {collaborators.length > 0 && (
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4 text-muted-foreground" />
              <div className="flex -space-x-2">
                {collaborators.slice(0, 3).map((collab) => (
                  <Avatar key={collab.id} className="w-6 h-6 border-2 border-background">
                    <AvatarFallback className="text-xs bg-primary/10 text-primary">
                      {collab.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {collaborators.length > 3 && (
                  <Avatar className="w-6 h-6 border-2 border-background">
                    <AvatarFallback className="text-xs bg-muted text-muted-foreground">
                      +{collaborators.length - 3}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
              <span className="text-xs text-muted-foreground ml-1">
                {collaborators.length} {collaborators.length === 1 ? 'persoon' : 'personen'}
              </span>
            </div>
          )}
        </div>
        {collaborators.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {collaborators.map((collab) => (
              <span 
                key={collab.id} 
                className="inline-flex items-center gap-1 text-xs bg-secondary px-2 py-1 rounded-full text-muted-foreground"
              >
                {collab.name}
              </span>
            ))}
          </div>
        )}
      </div>

      <ScrollArea ref={scrollRef} className="flex-1 p-4">
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Nog geen berichten</p>
            <p className="text-sm">Start een gesprek met je medeverhuizers</p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.user_id === currentUserId ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    msg.user_id === currentUserId
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                  <p
                    className={`text-xs mt-1 ${
                      msg.user_id === currentUserId
                        ? "text-primary-foreground/70"
                        : "text-muted-foreground"
                    }`}
                  >
                    {new Date(msg.created_at).toLocaleTimeString("nl-NL", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Typ een bericht..."
            className="flex-1"
          />
          <Button onClick={sendMessage} size="icon" disabled={!newMessage.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};
