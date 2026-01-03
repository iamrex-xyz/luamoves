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
import { UserCircle, Mail, Check, Loader2, Users } from "lucide-react";

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
  const [householdMembers, setHouseholdMembers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [customEmail, setCustomEmail] = useState("");
  const [showEmailInput, setShowEmailInput] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadCollaborators();
    loadHouseholdMembers();
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

  const loadHouseholdMembers = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("household_names")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      
      // Filter out empty names
      const members = (data?.household_names || []).filter((name: string) => name && name.trim() !== "");
      setHouseholdMembers(members);
    } catch (error) {
      console.error("Error loading household members:", error);
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
          ? `Taak toegewezen aan ${email}` 
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

  const assignToHouseholdMember = async (memberName: string) => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("tasks")
        .upsert({
          user_id: user.id,
          task_id: taskId,
          assigned_to: null,
          assigned_to_email: memberName, // Store household member name as "email" for display
        }, {
          onConflict: "user_id,task_id",
        });

      if (error) throw error;

      toast({
        title: "Taak toegewezen",
        description: `Taak toegewezen aan ${memberName}`,
      });

      onAssignmentChange();
    } catch (error) {
      console.error("Error assigning task to household member:", error);
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

    await assignTask(user.id, "Ik");
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
          {currentAssignee === "Ik" && <Check className="w-4 h-4 ml-auto" />}
        </DropdownMenuItem>

        {/* Household Members */}
        {householdMembers.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              Huishouden
            </DropdownMenuLabel>
            {householdMembers.map((member) => (
              <DropdownMenuItem
                key={member}
                onClick={() => assignToHouseholdMember(member)}
              >
                <UserCircle className="w-4 h-4 mr-2" />
                <span className="truncate">{member}</span>
                {currentAssignee === member && (
                  <Check className="w-4 h-4 ml-auto" />
                )}
              </DropdownMenuItem>
            ))}
          </>
        )}

        {/* Collaborators (invited via email) */}
        {collaborators.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Uitgenodigde collaborators
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