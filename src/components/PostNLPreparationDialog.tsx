import { useState } from "react";
import { Copy, Check, ExternalLink, MapPin, Calendar, Home, Pencil, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { AddressAutocomplete } from "@/components/AddressAutocomplete";

interface MovingInfo {
  oldAddress?: string;
  newAddress?: string;
  movingDate?: Date;
}

interface PostNLPreparationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  movingInfo: MovingInfo;
  onUpdateMovingInfo?: (data: Partial<{ oldAddress: string; newAddress: string; movingDate: Date }>) => void;
}

interface EditableFieldProps {
  label: string;
  value: string | undefined;
  icon: React.ReactNode;
  placeholder?: string;
  isEditing: boolean;
  onStartEdit: () => void;
  onSave: (value: string) => void;
  onCancel: () => void;
  editValue: string;
  onEditValueChange: (value: string) => void;
  fieldType: "text" | "address";
}

const EditableField = ({ 
  label, 
  value, 
  icon, 
  placeholder = "Niet ingevuld",
  isEditing,
  onStartEdit,
  onSave,
  onCancel,
  editValue,
  onEditValueChange,
  fieldType
}: EditableFieldProps) => {
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

  if (isEditing) {
    return (
      <div className="flex flex-col gap-2 p-4 bg-primary/5 rounded-xl border-2 border-primary/20">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        {fieldType === "address" ? (
          <AddressAutocomplete
            label=""
            value={editValue}
            onChange={onEditValueChange}
            placeholder={`Voer ${label.toLowerCase()} in...`}
          />
        ) : (
          <Input
            value={editValue}
            onChange={(e) => onEditValueChange(e.target.value)}
            placeholder={`Voer ${label.toLowerCase()} in...`}
            autoFocus
          />
        )}
        <div className="flex gap-2 mt-1">
          <Button size="sm" onClick={() => onSave(editValue)} disabled={!editValue.trim()}>
            <Save className="h-3 w-3 mr-1" />
            Opslaan
          </Button>
          <Button size="sm" variant="ghost" onClick={onCancel}>
            Annuleren
          </Button>
        </div>
      </div>
    );
  }

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
      <div className="flex gap-1">
        {value ? (
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
        ) : (
          <Button
            variant="ghost"
            size="icon"
            onClick={onStartEdit}
            className="flex-shrink-0 h-10 w-10 rounded-full hover:bg-primary/10"
          >
            <Pencil className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

interface DateFieldProps {
  label: string;
  value: Date | undefined;
  icon: React.ReactNode;
  placeholder?: string;
  onUpdate?: (date: Date) => void;
}

const DateField = ({ label, value, icon, placeholder = "Niet ingevuld", onUpdate }: DateFieldProps) => {
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const formattedDate = value ? format(value, "d MMMM yyyy", { locale: nl }) : undefined;

  const handleCopy = async () => {
    if (!formattedDate) return;
    
    try {
      await navigator.clipboard.writeText(formattedDate);
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

  const handleDateSelect = (date: Date | undefined) => {
    if (date && onUpdate) {
      onUpdate(date);
      setIsOpen(false);
      toast({
        title: "Verhuisdatum opgeslagen",
        description: `Je verhuisdatum is ingesteld op ${format(date, "d MMMM yyyy", { locale: nl })}`,
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
        <p className={`text-base font-medium ${formattedDate ? "text-foreground" : "text-muted-foreground/60 italic"}`}>
          {formattedDate || placeholder}
        </p>
      </div>
      <div className="flex gap-1">
        {formattedDate ? (
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
        ) : onUpdate ? (
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="flex-shrink-0 h-10 w-10 rounded-full hover:bg-primary/10"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <CalendarComponent
                mode="single"
                selected={value}
                onSelect={handleDateSelect}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        ) : null}
      </div>
    </div>
  );
};

export const PostNLPreparationDialog = ({
  open,
  onOpenChange,
  movingInfo,
  onUpdateMovingInfo,
}: PostNLPreparationDialogProps) => {
  const [allCopied, setAllCopied] = useState(false);
  const [editingField, setEditingField] = useState<"oldAddress" | "newAddress" | null>(null);
  const [editValue, setEditValue] = useState("");

  const formattedDate = movingInfo.movingDate
    ? format(movingInfo.movingDate, "d MMMM yyyy", { locale: nl })
    : undefined;

  const handleStartEdit = (field: "oldAddress" | "newAddress") => {
    setEditingField(field);
    setEditValue(movingInfo[field] || "");
  };

  const handleSave = (field: "oldAddress" | "newAddress", value: string) => {
    if (onUpdateMovingInfo && value.trim()) {
      onUpdateMovingInfo({ [field]: value.trim() });
      toast({
        title: "Opgeslagen!",
        description: `Je ${field === "oldAddress" ? "oude adres" : "nieuwe adres"} is opgeslagen`,
      });
    }
    setEditingField(null);
    setEditValue("");
  };

  const handleCancel = () => {
    setEditingField(null);
    setEditValue("");
  };

  const handleDateUpdate = (date: Date) => {
    if (onUpdateMovingInfo) {
      onUpdateMovingInfo({ movingDate: date });
    }
  };

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
          <EditableField
            label="Oud adres"
            value={movingInfo.oldAddress}
            icon={<Home className="h-5 w-5" />}
            placeholder="Tik op potlood om toe te voegen"
            isEditing={editingField === "oldAddress"}
            onStartEdit={() => handleStartEdit("oldAddress")}
            onSave={(value) => handleSave("oldAddress", value)}
            onCancel={handleCancel}
            editValue={editValue}
            onEditValueChange={setEditValue}
            fieldType="address"
          />
          <EditableField
            label="Nieuw adres"
            value={movingInfo.newAddress}
            icon={<MapPin className="h-5 w-5" />}
            placeholder="Tik op potlood om toe te voegen"
            isEditing={editingField === "newAddress"}
            onStartEdit={() => handleStartEdit("newAddress")}
            onSave={(value) => handleSave("newAddress", value)}
            onCancel={handleCancel}
            editValue={editValue}
            onEditValueChange={setEditValue}
            fieldType="address"
          />
          <DateField
            label="Verhuisdatum"
            value={movingInfo.movingDate}
            icon={<Calendar className="h-5 w-5" />}
            placeholder="Tik op potlood om toe te voegen"
            onUpdate={onUpdateMovingInfo ? handleDateUpdate : undefined}
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
