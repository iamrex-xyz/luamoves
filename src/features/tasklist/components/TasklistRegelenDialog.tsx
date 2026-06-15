// The "Regel dit voor mij" info popup. Simple, informational — affiliate
// booking actually happens in the WhatsApp conversation with Lua, so this just
// explains what Lua can arrange and points the user back to the chat.

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, MessageCircle } from "lucide-react";
import type { AffiliateKey } from "../types";
import { AFFILIATE_INFO } from "../affiliate";

type Props = {
  affiliateKey: AffiliateKey | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const TasklistRegelenDialog = ({ affiliateKey, open, onOpenChange }: Props) => {
  const info = affiliateKey ? AFFILIATE_INFO[affiliateKey] : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl max-w-sm">
        <DialogHeader>
          <div className="mx-auto h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-2">
            <Sparkles className="h-7 w-7 text-primary" aria-hidden />
          </div>
          <DialogTitle className="text-center text-lg font-semibold">
            {info?.title ?? "Lua regelt dit voor je"}
          </DialogTitle>
          <DialogDescription className="text-center text-sm text-muted-foreground">
            {info?.description ??
              "Lua helpt je dit gratis te regelen via je WhatsApp-gesprek."}
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-2xl bg-primary-light/60 p-4 flex items-start gap-3">
          <MessageCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" aria-hidden />
          <p className="text-sm text-foreground/80">
            Stuur Lua een berichtje in WhatsApp en zij regelt dit verder met je —
            helemaal kosteloos.
          </p>
        </div>

        <DialogFooter>
          <Button
            className="w-full h-12 rounded-2xl"
            onClick={() => onOpenChange(false)}
          >
            Begrepen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
