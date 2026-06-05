import { useEffect, useRef, useState } from "react";
import { CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export type ChatMessage = {
  from: "lua" | "user";
  text: string;
  time?: string;
};

interface WhatsAppChatProps {
  messages: ChatMessage[];
  subtitle?: string;
  className?: string;
  /** Reveal messages one by one with a typing indicator. */
  animated?: boolean;
}

const TypingDots = () => (
  <div className="flex items-center gap-1 px-1 py-1">
    {[0, 1, 2].map((i) => (
      <span
        key={i}
        className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50"
        style={{ animation: `wa-typing 1.2s ${i * 0.2}s infinite ease-in-out` }}
      />
    ))}
  </div>
);

/**
 * A WhatsApp-style conversation mockup, used to show how Lua communicates
 * with movers entirely through WhatsApp. Optionally animates messages in
 * one by one with a typing indicator.
 */
export const WhatsAppChat = ({ messages, subtitle = "online", className, animated = false }: WhatsAppChatProps) => {
  const [visibleCount, setVisibleCount] = useState(animated ? 0 : messages.length);
  const [typing, setTyping] = useState(animated);
  const containerRef = useRef<HTMLDivElement>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!animated) return;
    const node = containerRef.current;
    if (!node) return;

    const timers: ReturnType<typeof setTimeout>[] = [];

    const run = () => {
      if (startedRef.current) return;
      startedRef.current = true;

      messages.forEach((_, i) => {
        timers.push(setTimeout(() => setTyping(true), i * 1400));
        timers.push(
          setTimeout(() => {
            setTyping(false);
            setVisibleCount(i + 1);
          }, i * 1400 + 700)
        );
      });
      timers.push(setTimeout(() => setTyping(false), messages.length * 1400));
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          run();
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(node);

    return () => {
      observer.disconnect();
      timers.forEach(clearTimeout);
    };
  }, [animated, messages]);

  const shown = messages.slice(0, visibleCount);

  return (
    <div
      ref={containerRef}
      className={cn(
        "rounded-[28px] overflow-hidden shadow-2xl shadow-primary/15 bg-white border border-border/60 w-full max-w-sm",
        className
      )}
    >
      {/* WhatsApp header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-[#075E54] text-white">
        <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shrink-0">
          <span className="font-italiana text-base text-[#075E54] leading-none">L</span>
        </div>
        <div className="flex flex-col leading-tight">
          <span className="font-semibold text-sm">Lua</span>
          <span className="text-[11px] text-white/80">{typing ? "typt…" : subtitle}</span>
        </div>
        <div className="ml-auto flex items-center gap-1.5 text-[10px] font-medium bg-[#25D366] px-2 py-0.5 rounded-full">
          WhatsApp
        </div>
      </div>

      {/* Chat body */}
      <div
        className="flex flex-col gap-2 px-3 py-4 min-h-[140px]"
        style={{ backgroundColor: "#ECE5DD" }}
      >
        {shown.map((msg, i) => {
          const isUser = msg.from === "user";
          return (
            <div
              key={i}
              className={cn(
                "flex animate-in fade-in slide-in-from-bottom-2 duration-300",
                isUser ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-snug shadow-sm",
                  isUser
                    ? "bg-[#DCF8C6] text-[#1f2c1a] rounded-br-md"
                    : "bg-white text-foreground rounded-bl-md"
                )}
              >
                <p className="whitespace-pre-line">{msg.text}</p>
                <div className="flex items-center justify-end gap-1 mt-0.5">
                  <span className="text-[10px] text-muted-foreground/60">{msg.time ?? "09:41"}</span>
                  {isUser && <CheckCheck className="w-3.5 h-3.5 text-[#34B7F1]" />}
                </div>
              </div>
            </div>
          );
        })}

        {animated && typing && (
          <div className="flex justify-start animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl rounded-bl-md px-2 py-1.5 shadow-sm">
              <TypingDots />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
