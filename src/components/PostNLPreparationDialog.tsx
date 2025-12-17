import { useState } from "react";
import { Copy, Check, ExternalLink, MapPin, Calendar, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { nl } from "date-fns/locale";

interface MovingInfo {
  oldAddress?: string;
  newAddress?: string;
  movingDate?: Date;
}

interface PostNLPreparationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  movingInfo: MovingInfo;
}

interface CopyFieldProps {
  label: string;
  value: string | undefined;
  icon: React.ReactNode;
  placeholder?: string;
}

const CopyField = ({ label, value, icon, placeholder = "Niet ingevuld" }: CopyFieldProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!value) return;
    
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast({
        title: "Gekopieerd!",
        description: `${label} is gekopieerd naar je klembord`,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Kopiëren mislukt",
        description: "Probeer het handmatig te kopiëren",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-xl">
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-muted-foreground mb-1">{label}</p>
        <p className={`text-base font-medium ${value ? "text-foreground" : "text-muted-foreground/60 italic"}`}>
          {value || placeholder}
        </p>
      </div>
      {value && (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleCopy}
          className="flex-shrink-0 h-10 w-10 rounded-full hover:bg-primary/10"
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      )}
    </div>
  );
};

export const PostNLPreparationDialog = ({
  open,
  onOpenChange,
  movingInfo,
}: PostNLPreparationDialogProps) => {
  const [allCopied, setAllCopied] = useState(false);

  const formattedDate = movingInfo.movingDate
    ? format(movingInfo.movingDate, "d MMMM yyyy", { locale: nl })
    : undefined;

  const handleCopyAll = async () => {
    const parts = [];
    if (movingInfo.oldAddress) parts.push(`Oud adres: ${movingInfo.oldAddress}`);
    if (movingInfo.newAddress) parts.push(`Nieuw adres: ${movingInfo.newAddress}`);
    if (formattedDate) parts.push(`Verhuisdatum: ${formattedDate}`);

    if (parts.length === 0) {
      toast({
        title: "Geen gegevens",
        description: "Er zijn geen gegevens om te kopiëren",
        variant: "destructive",
      });
      return;
    }

    try {
      await navigator.clipboard.writeText(parts.join("\n"));
      setAllCopied(true);
      toast({
        title: "Alles gekopieerd!",
        description: "Alle gegevens zijn gekopieerd naar je klembord",
      });
      setTimeout(() => setAllCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Kopiëren mislukt",
        description: "Probeer het handmatig te kopiëren",
        variant: "destructive",
      });
    }
  };

  const handleGoToPostNL = () => {
    window.open("https://doorzenden.postnl.nl/van-naar#/van-naar", "_blank");
    onOpenChange(false);
  };

  const hasAnyData = movingInfo.oldAddress || movingInfo.newAddress || movingInfo.movingDate;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">📮</span>
            Post doorsturen via PostNL
          </DialogTitle>
          <DialogDescription>
            Hieronder staan je gegevens. Kopieer ze en vul ze in op de PostNL website.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 my-4">
          <CopyField
            label="Oud adres"
            value={movingInfo.oldAddress}
            icon={<Home className="h-5 w-5" />}
            placeholder="Voeg je oude adres toe in instellingen"
          />
          <CopyField
            label="Nieuw adres"
            value={movingInfo.newAddress}
            icon={<MapPin className="h-5 w-5" />}
            placeholder="Voeg je nieuwe adres toe in instellingen"
          />
          <CopyField
            label="Verhuisdatum"
            value={formattedDate}
            icon={<Calendar className="h-5 w-5" />}
            placeholder="Voeg je verhuisdatum toe"
          />
        </div>

        <div className="flex flex-col gap-2">
          {hasAnyData && (
            <Button
              variant="outline"
              onClick={handleCopyAll}
              className="w-full"
            >
              {allCopied ? (
                <>
                  <Check className="h-4 w-4 mr-2 text-green-500" />
                  Alles gekopieerd!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Kopieer alle gegevens
                </>
              )}
            </Button>
          )}
          <Button onClick={handleGoToPostNL} className="w-full">
            Ga naar PostNL
            <ExternalLink className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
