import { ReactNode } from "react";

type SkipToContentProps = {
  targetId?: string;
  children?: ReactNode;
};

export const SkipToContent = ({ 
  targetId = "main-content", 
  children = "Ga naar hoofdinhoud" 
}: SkipToContentProps) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      target.focus();
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const target = document.getElementById(targetId);
      if (target) {
        target.focus();
        target.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <a
      href={`#${targetId}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all"
    >
      {children}
    </a>
  );
};

// Screen reader only announcer regions
export const ScreenReaderAnnouncer = () => {
  return (
    <>
      {/* Polite announcements - read when user is idle */}
      <div
        id="sr-announcer-polite"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />
      {/* Assertive announcements - interrupt user immediately */}
      <div
        id="sr-announcer-assertive"
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      />
    </>
  );
};

// Visually hidden but accessible heading for sections
type VisuallyHiddenHeadingProps = {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  children: ReactNode;
};

export const VisuallyHiddenHeading = ({ 
  level = 2, 
  children 
}: VisuallyHiddenHeadingProps) => {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  return <Tag className="sr-only">{children}</Tag>;
};

// Loading indicator with screen reader announcement
type LoadingAnnouncerProps = {
  isLoading: boolean;
  loadingMessage?: string;
  loadedMessage?: string;
};

export const LoadingAnnouncer = ({
  isLoading,
  loadingMessage = "Laden...",
  loadedMessage = "Inhoud geladen",
}: LoadingAnnouncerProps) => {
  return (
    <div role="status" aria-live="polite" className="sr-only">
      {isLoading ? loadingMessage : loadedMessage}
    </div>
  );
};
