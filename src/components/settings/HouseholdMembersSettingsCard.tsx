import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useHouseholdMembers, HouseholdMember } from "@/hooks/useHouseholdMembers";
import { Users, Phone, Check, Trash2, Edit2, X, Save } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export const HouseholdMembersSettingsCard = () => {
  const { toast } = useToast();
  const { members, isLoading, removeMember, updateMemberName } = useHouseholdMembers();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const handleStartEdit = (member: HouseholdMember) => {
    setEditingId(member.id);
    setEditName(member.name || "");
  };

  const handleSaveEdit = async (memberId: string) => {
    if (!editName.trim()) {
      toast({ title: "Vul een naam in", variant: "destructive" });
      return;
    }

    const result = await updateMemberName(memberId, editName.trim());
    if (result.success) {
      toast({ title: "Naam bijgewerkt" });
      setEditingId(null);
      setEditName("");
    } else {
      toast({ title: "Kon naam niet bijwerken", variant: "destructive" });
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName("");
  };

  const handleRemove = async (memberId: string) => {
    const result = await removeMember(memberId);
    if (result.success) {
      toast({ title: "Medeverhuizer verwijderd" });
    } else {
      toast({ title: "Kon medeverhuizer niet verwijderen", variant: "destructive" });
    }
  };

  const getDisplayName = (member: HouseholdMember) => {
    return member.name || member.phone;
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl bg-card border-0 shadow-soft overflow-hidden">
        <div className="p-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-28" />
            </div>
          </div>
        </div>
        <div className="p-4 space-y-3">
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (members.length === 0) {
    return null; // Don't show card if no household members
  }

  return (
    <div className="rounded-2xl bg-card border-0 shadow-soft overflow-hidden">
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">Medeverhuizers</h2>
            <p className="text-xs text-muted-foreground">Uitgenodigd via WhatsApp</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {members.map((member) => (
          <div key={member.id} className="flex items-center justify-between p-3 rounded-xl bg-secondary/50">
            {editingId === member.id ? (
              <div className="flex-1 flex items-center gap-2">
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Naam"
                  className="flex-1 h-9 rounded-lg"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveEdit(member.id);
                    if (e.key === "Escape") handleCancelEdit();
                  }}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full text-success hover:text-success hover:bg-success/10"
                  onClick={() => handleSaveEdit(member.id)}
                >
                  <Save className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={handleCancelEdit}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{getDisplayName(member)}</p>
                    {member.name && (
                      <p className="text-xs text-muted-foreground">{member.phone}</p>
                    )}
                    <div className="flex items-center gap-1 mt-0.5">
                      {member.status === "active" || member.accepted_at ? (
                        <Badge variant="secondary" className="text-xs bg-success/10 text-success">
                          <Check className="w-3 h-3 mr-1" />
                          Geaccepteerd
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs bg-warning/10 text-warning">
                          Uitgenodigd
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
                    onClick={() => handleStartEdit(member)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => handleRemove(member.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
