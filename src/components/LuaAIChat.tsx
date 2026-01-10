import { useRef, useEffect, useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Sparkles, Loader2, Trash2 } from "lucide-react";
import { MovingInfo } from "@/pages/Index";
import { trackEvent } from "@/lib/analytics";
import { toast } from "sonner";
import { useChatHistory } from "@/hooks/useChatHistory";
import { useTasks } from "@/hooks/useTasks";
import { differenceInDays } from "date-fns";

type LuaAIChatProps = {
  movingInfo: MovingInfo;
};

type TaskSummary = {
  total: number;
  completed: number;
  percentage: number;
  urgentTasks: Array<{ title: string; deadline: string; category: string }>;
  openByCategory: Record<string, number>;
};

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/lua-chat`;

export const LuaAIChat = ({ movingInfo }: LuaAIChatProps) => {
  const { messages, setMessages, addMessage, updateLastMessage, clearHistory } = useChatHistory();
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Fetch tasks for context
  const { tasks } = useTasks(movingInfo);
  
  // Build task summary for AI context
  const taskSummary: TaskSummary = useMemo(() => {
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const completed = tasks.filter(t => t.status === "done").length;
    const total = tasks.length;
    
    // Find urgent tasks (deadline within 7 days, not done)
    const urgentTasks = tasks
      .filter(t => {
        if (t.status === "done") return false;
        const deadline = new Date(t.deadline);
        return deadline <= sevenDaysFromNow && deadline >= now;
      })
      .map(t => ({
        title: t.title,
        deadline: t.deadlineLabel,
        category: t.category
      }))
      .slice(0, 5); // Limit to 5 urgent tasks
    
    // Count open tasks by category
    const openByCategory: Record<string, number> = {};
    tasks.filter(t => t.status !== "done").forEach(t => {
      openByCategory[t.category] = (openByCategory[t.category] || 0) + 1;
    });
    
    return {
      total,
      completed,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
      urgentTasks,
      openByCategory
    };
  }, [tasks]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: "user" as const, content: input.trim() };
    addMessage(userMessage);
    setInput("");
    setIsLoading(true);

    trackEvent("chat_lua_sent_message");

    let assistantContent = "";

    try {
      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          movingInfo,
          taskSummary,
        }),
      });

      if (response.status === 429) {
        toast.error("Te veel berichten. Probeer het straks nog eens.");
        setIsLoading(false);
        return;
      }

      if (response.status === 402) {
        toast.error("AI credits op. Neem contact op met de beheerder.");
        setIsLoading(false);
        return;
      }

      if (!response.ok || !response.body) {
        throw new Error("Failed to start stream");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";

      // Add empty assistant message that we'll update
      addMessage({ role: "assistant", content: "" });

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              updateLastMessage(assistantContent);
            }
          } catch {
            // Incomplete JSON, put back and wait for more data
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Final flush
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split("\n")) {
          if (!raw) continue;
          if (raw.endsWith("\r")) raw = raw.slice(0, -1);
          if (raw.startsWith(":") || raw.trim() === "") continue;
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              updateLastMessage(assistantContent);
            }
          } catch {
            /* ignore partial leftovers */
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      toast.error("Er ging iets mis. Probeer het opnieuw.");
      // Remove the empty assistant message if there was an error
      if (!assistantContent) {
        setMessages((prev) => prev.slice(0, -1));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Card className="flex flex-col h-[calc(100vh-220px)] sm:h-[calc(100vh-200px)] min-h-[350px]">
      <div className="p-4 border-b bg-gradient-to-r from-primary/5 to-primary/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Lua</h3>
              <p className="text-xs text-muted-foreground">Altijd klaar om je te helpen</p>
            </div>
          </div>
          {messages.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                clearHistory();
                toast.success("Chat geschiedenis gewist");
              }}
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              title="Wis chat geschiedenis"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      <ScrollArea ref={scrollRef} className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-muted rounded-bl-md"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
              </div>
            </div>
          ))}
          {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Stel je vraag aan Lua..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button 
            onClick={sendMessage} 
            size="icon" 
            disabled={!input.trim() || isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
};
