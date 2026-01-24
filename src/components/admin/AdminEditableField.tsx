import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, X, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

type AdminEditableFieldProps = {
  label: string;
  value: string | null | undefined;
  fieldKey: string;
  onSave: (key: string, value: string) => Promise<void>;
  type?: "text" | "number" | "date";
};

export const AdminEditableField = ({
  label,
  value,
  fieldKey,
  onSave,
  type = "text",
}: AdminEditableFieldProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(fieldKey, editValue);
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving field:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditValue(value || "");
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <div className="flex items-center justify-between group py-1">
        <div className="text-sm">
          <span className="text-muted-foreground">{label}:</span>{" "}
          <span className={cn("font-medium", !value && "text-muted-foreground italic")}>
            {value || "Niet ingevuld"}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => setIsEditing(true)}
        >
          <Pencil className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 py-1">
      <span className="text-sm text-muted-foreground shrink-0">{label}:</span>
      <Input
        type={type}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        className="h-7 text-sm flex-1"
        autoFocus
      />
      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={handleSave}
          disabled={isSaving}
        >
          <Check className="h-3 w-3 text-green-600" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={handleCancel}
          disabled={isSaving}
        >
          <X className="h-3 w-3 text-red-600" />
        </Button>
      </div>
    </div>
  );
};
