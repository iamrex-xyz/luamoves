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

type HouseholdMember = {
  id: string;
  name: string | null;
  phone: string;
  status: string;
  member_user_id: string | null;
};

type AssignTaskDropdownProps = {
  taskId: string;
  taskTitle?: string;
  currentAssignedTo?: string | null;
  currentAssignedEmail?: string | null;
  onAssignmentChange: () => void;
};

export const AssignTaskDropdown = ({
  taskId,
  taskTitle,
  currentAssignedTo,
  currentAssignedEmail,
  onAssignmentChange,
}: AssignTaskDropdownProps) => {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [householdMembers, setHouseholdMembers] = useState<HouseholdMember[]>([]);
  const [legacyHouseholdNames, setLegacyHouseholdNames] = useState<string[]>([]);
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

      // Load from new household_members table (active members only)
      const { data: members, error: membersError } = await supabase
        .from("household_members")
        .select("*")
        .eq("owner_user_id", user.id)
        .eq("status", "active");

      if (!membersError && members) {
        setHouseholdMembers(members);
      }

      // Also load legacy household_names from profiles as fallback
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("household_names")
        .eq("user_id", user.id)
        .single();

      if (!profileError && profile) {
        const names = (profile.household_names || []).filter((name: string) => name && name.trim() !== "");
        setLegacyHouseholdNames(names);
      }
    } catch (error) {
      console.error("Error loading household members:", error);
    }
  };

  const assignTask = async (userId: string | null, email: string | null) => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Use upsert to handle both new and existing task records
      const { error } = await supabase
        .from("tasks")
        .upsert({
          user_id: user.id,
          task_id: taskId,
          assigned_to: userId,
          assigned_to_email: email,
        }, {
          onConflict: "user_id,task_id",
        });

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

  const assignToHouseholdMember = async (member: HouseholdMember) => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const displayName = member.name || member.phone;

      const { error } = await supabase
        .from("tasks")
        .upsert({
          user_id: user.id,
          task_id: taskId,
          assigned_to: member.member_user_id,
          assigned_to_email: displayName,
        }, {
          onConflict: "user_id,task_id",
        });

      if (error) throw error;

      // Send WhatsApp notification
      if (member.phone && taskTitle) {
        try {
          await supabase.functions.invoke("notify-task-assignment", {
            body: { 
              taskTitle, 
              assignedToPhone: member.phone 
            }
          });
        } catch (notifyError) {
          console.error("Error sending WhatsApp notification:", notifyError);
          // Don't fail the assignment if notification fails
        }
      }

      toast({
        title: "Taak toegewezen",
        description: `Taak toegewezen aan ${displayName}`,
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

  const assignToLegacyMember = async (memberName: string) => {
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
          assigned_to_email: memberName,
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
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 gap-2"
          disabled={isLoading}
          data-vaul-no-drag
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
      <DropdownMenuContent align="end" className="w-64 z-[80]">
        <DropdownMenuLabel>Wijs taak toe aan</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onSelect={handleAssignToSelf}>
          <UserCircle className="w-4 h-4 mr-2" />
          Mezelf
          {currentAssignee === "Ik" && <Check className="w-4 h-4 ml-auto" />}
        </DropdownMenuItem>

        {/* Household Members (from new table) */}
        {householdMembers.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              Huishouden
            </DropdownMenuLabel>
            {householdMembers.map((member) => {
              const displayName = member.name || member.phone;
              return (
                <DropdownMenuItem
                  key={member.id}
                  onSelect={() => assignToHouseholdMember(member)}
                >
                  <UserCircle className="w-4 h-4 mr-2" />
                  <span className="truncate">{displayName}</span>
                  {currentAssignee === displayName && (
                    <Check className="w-4 h-4 ml-auto" />
                  )}
                </DropdownMenuItem>
              );
            })}
          </>
        )}

        {/* Legacy Household Names (from profile) */}
        {legacyHouseholdNames.length > 0 && householdMembers.length === 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              Huishouden
            </DropdownMenuLabel>
            {legacyHouseholdNames.map((name) => (
              <DropdownMenuItem
                key={name}
                onSelect={() => assignToLegacyMember(name)}
              >
                <UserCircle className="w-4 h-4 mr-2" />
                <span className="truncate">{name}</span>
                {currentAssignee === name && (
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
                onSelect={() =>
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
          <DropdownMenuItem onSelect={() => setShowEmailInput(true)}>
            <Mail className="w-4 h-4 mr-2" />
            Ander e-mailadres...
          </DropdownMenuItem>
        )}

        {currentAssignee && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() => assignTask(null, null)}
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