import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type ConfettiPiece = {
  id: number;
  x: number;
  color: string;
  delay: number;
  duration: number;
  size: number;
};

type ConfettiCelebrationProps = {
  trigger: boolean;
  onComplete?: () => void;
};

const COLORS = [
  "hsl(var(--primary))",
  "hsl(35, 92%, 60%)", // Orange
  "hsl(142, 76%, 50%)", // Green
  "hsl(280, 87%, 65%)", // Purple
  "hsl(199, 89%, 60%)", // Blue
  "hsl(340, 82%, 60%)", // Pink
];

export const ConfettiCelebration = ({ trigger, onComplete }: ConfettiCelebrationProps) => {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (trigger && !isAnimating) {
      setIsAnimating(true);
      
      // Generate confetti pieces
      const newPieces: ConfettiPiece[] = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        delay: Math.random() * 0.5,
        duration: 2 + Math.random() * 2,
        size: 6 + Math.random() * 8,
      }));
      
      setPieces(newPieces);
      
      // Clean up after animation
      const timeout = setTimeout(() => {
        setPieces([]);
        setIsAnimating(false);
        onComplete?.();
      }, 4000);
      
      return () => clearTimeout(timeout);
    }
  }, [trigger, isAnimating, onComplete]);

  if (pieces.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className="absolute animate-confetti-fall"
          style={{
            left: `${piece.x}%`,
            top: "-20px",
            width: piece.size,
            height: piece.size,
            backgroundColor: piece.color,
            borderRadius: Math.random() > 0.5 ? "50%" : "2px",
            animationDelay: `${piece.delay}s`,
            animationDuration: `${piece.duration}s`,
            transform: `rotate(${Math.random() * 360}deg)`,
          }}
        />
      ))}
    </div>
  );
};
