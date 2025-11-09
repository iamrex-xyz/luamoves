import { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { UserCircle, Mail, Check, Loader2 } from "lucide-react";

type Collaborator = {
  id: string;
  collaborator_email: string;
  collaborator_user_id: string | null;
};

type AssignTaskDropdownProps = {
  taskId: string;
  currentAssignedTo?: string | null;
  currentAssignedEmail?: string | null;
  onAssignmentChange: () => void;
};

export const AssignTaskDropdown = ({
  taskId,
  currentAssignedTo,
  currentAssignedEmail,
  onAssignmentChange,
}: AssignTaskDropdownProps) => {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [customEmail, setCustomEmail] = useState("");
  const [showEmailInput, setShowEmailInput] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadCollaborators();
  }, []);

  const loadCollaborators = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("moving_collaborators")
        .select("*")
        .eq("owner_user_id", user.id);

      if (error) throw error;
      setCollaborators(data || []);
    } catch (error) {
      console.error("Error loading collaborators:", error);
    }
  };

  const assignTask = async (userId: string | null, email: string | null) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("tasks")
        .update({
          assigned_to: userId,
          assigned_to_email: email,
        })
        .eq("task_id", taskId);

      if (error) throw error;

      toast({
        title: "Taak toegewezen",
        description: email 
          ? `Toegewezen aan ${email}` 
          : userId 
          ? "Toegewezen aan collaborator"
          : "Toewijzing verwijderd",
      });

      onAssignmentChange();
    } catch (error) {
      console.error("Error assigning task:", error);
      toast({
        title: "Fout bij toewijzen",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomEmailAssign = async () => {
    if (!customEmail.trim()) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customEmail)) {
      toast({
        title: "Ongeldig e-mailadres",
        variant: "destructive",
      });
      return;
    }

    await assignTask(null, customEmail.toLowerCase());
    setCustomEmail("");
    setShowEmailInput(false);
  };

  const handleAssignToSelf = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await assignTask(user.id, null);
  };

  const getCurrentAssignee = () => {
    if (currentAssignedEmail) {
      return currentAssignedEmail;
    }
    return null;
  };

  const currentAssignee = getCurrentAssignee();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 gap-2"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <UserCircle className="w-4 h-4" />
          )}
          {currentAssignee ? (
            <span className="text-xs max-w-[120px] truncate">
              {currentAssignee}
            </span>
          ) : (
            <span className="text-xs">Toewijzen</span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Wijs taak toe aan</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleAssignToSelf}>
          <UserCircle className="w-4 h-4 mr-2" />
          Mezelf
          {!currentAssignee && <Check className="w-4 h-4 ml-auto" />}
        </DropdownMenuItem>

        {collaborators.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Collaborators
            </DropdownMenuLabel>
            {collaborators.map((collab) => (
              <DropdownMenuItem
                key={collab.id}
                onClick={() =>
                  assignTask(collab.collaborator_user_id, collab.collaborator_email)
                }
              >
                <Mail className="w-4 h-4 mr-2" />
                <span className="truncate">{collab.collaborator_email}</span>
                {currentAssignee === collab.collaborator_email && (
                  <Check className="w-4 h-4 ml-auto" />
                )}
              </DropdownMenuItem>
            ))}
          </>
        )}

        <DropdownMenuSeparator />
        
        {showEmailInput ? (
          <div className="p-2 space-y-2">
            <Input
              type="email"
              placeholder="naam@voorbeeld.nl"
              value={customEmail}
              onChange={(e) => setCustomEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleCustomEmailAssign();
                }
              }}
              maxLength={255}
              autoFocus
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                className="flex-1"
                onClick={handleCustomEmailAssign}
              >
                Toewijzen
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setShowEmailInput(false);
                  setCustomEmail("");
                }}
              >
                Annuleer
              </Button>
            </div>
          </div>
        ) : (
          <DropdownMenuItem onClick={() => setShowEmailInput(true)}>
            <Mail className="w-4 h-4 mr-2" />
            Ander e-mailadres...
          </DropdownMenuItem>
        )}

        {currentAssignee && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => assignTask(null, null)}
              className="text-destructive"
            >
              Toewijzing verwijderen
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};