import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const MobileModal = DialogPrimitive.Root;

const MobileModalTrigger = DialogPrimitive.Trigger;

const MobileModalPortal = DialogPrimitive.Portal;

const MobileModalClose = DialogPrimitive.Close;

const MobileModalOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px]",
      "data-[state=open]:animate-in data-[state=closed]:animate-out",
      "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      "duration-200",
      className
    )}
    {...props}
  />
));
MobileModalOverlay.displayName = "MobileModalOverlay";

const MobileModalContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    showCloseButton?: boolean;
    onCloseClick?: () => void;
  }
>(({ className, children, showCloseButton = false, onCloseClick, ...props }, ref) => (
  <MobileModalPortal>
    <MobileModalOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        // Positioning - centered with max dimensions
        "fixed left-[50%] bottom-0 z-50 translate-x-[-50%]",
        "w-[calc(100%-2rem)] max-w-md",
        "max-h-[80vh]",
        // Styling
        "bg-background border border-border",
        "rounded-t-3xl rounded-b-none sm:rounded-3xl",
        "shadow-2xl shadow-black/20",
        // Layout
        "flex flex-col overflow-hidden",
        // Slide-up animation
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        "data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
        "data-[state=closed]:duration-300 data-[state=open]:duration-400",
        // Desktop: center vertically
        "sm:bottom-auto sm:top-[50%] sm:translate-y-[-50%]",
        "sm:data-[state=closed]:slide-out-to-bottom-[48%] sm:data-[state=open]:slide-in-from-bottom-[48%]",
        className
      )}
      {...props}
    >
      {/* Drag handle for mobile feel */}
      <div className="flex justify-center pt-3 pb-1 sm:hidden">
        <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
      </div>
      
      {children}
      
      {showCloseButton && (
        <DialogPrimitive.Close 
          className="absolute right-4 top-4 rounded-full p-1.5 opacity-70 ring-offset-background transition-all hover:opacity-100 hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
          onClick={onCloseClick}
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Sluiten</span>
        </DialogPrimitive.Close>
      )}
    </DialogPrimitive.Content>
  </MobileModalPortal>
));
MobileModalContent.displayName = "MobileModalContent";

const MobileModalHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex flex-col space-y-1.5 text-center px-6 pt-4", className)}
    {...props}
  />
);
MobileModalHeader.displayName = "MobileModalHeader";

const MobileModalFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col gap-3 p-6 pt-4 border-t bg-background mt-auto",
      className
    )}
    {...props}
  />
);
MobileModalFooter.displayName = "MobileModalFooter";

const MobileModalTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("text-2xl font-bold leading-tight tracking-tight", className)}
    {...props}
  />
));
MobileModalTitle.displayName = "MobileModalTitle";

const MobileModalDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-base text-muted-foreground", className)}
    {...props}
  />
));
MobileModalDescription.displayName = "MobileModalDescription";

export {
  MobileModal,
  MobileModalPortal,
  MobileModalOverlay,
  MobileModalClose,
  MobileModalTrigger,
  MobileModalContent,
  MobileModalHeader,
  MobileModalFooter,
  MobileModalTitle,
  MobileModalDescription,
};
