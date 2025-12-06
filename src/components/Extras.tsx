import { useState } from "react";
import { FileText, Upload, Trash2, Download, LogOut, MessageCircle, FolderOpen, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { BottomNav } from "./BottomNav";
import { ChatAccessGate } from "./ChatAccessGate";

type ExtrasProps = {
  onNavigate: (view: "dashboard" | "tasks" | "extras" | "settings") => void;
  onLogout: () => void;
};

export const Extras = ({ onNavigate, onLogout }: ExtrasProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeSection, setActiveSection] = useState<"documents" | "chat">("documents");

  // Fetch documents
  const { data: documents = [] } = useQuery({
    queryKey: ["moving-documents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("moving_documents")
        .select("*")
        .order("upload_date", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Upload document mutation
  const uploadDocument = useMutation({
    mutationFn: async (formData: { file: File; category: string; description: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Niet ingelogd");

      const fileExt = formData.file.name.split('.').pop();
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("moving_documents")
        .upload(filePath, formData.file);

      if (uploadError) throw uploadError;

      const { error: dbError } = await supabase.from("moving_documents").insert({
        user_id: user.id,
        file_name: formData.file.name,
        file_path: filePath,
        file_type: formData.file.type,
        category: formData.category,
        description: formData.description,
      });

      if (dbError) throw dbError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["moving-documents"] });
      toast({ title: "Document geüpload" });
    },
    onError: () => {
      toast({ title: "Fout bij uploaden document", variant: "destructive" });
    },
  });

  // Delete document mutation
  const deleteDocument = useMutation({
    mutationFn: async (doc: { id: string; file_path: string }) => {
      const { error: storageError } = await supabase.storage
        .from("moving_documents")
        .remove([doc.file_path]);

      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from("moving_documents")
        .delete()
        .eq("id", doc.id);

      if (dbError) throw dbError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["moving-documents"] });
      toast({ title: "Document verwijderd" });
    },
  });

  // Download document
  const downloadDocument = async (filePath: string, fileName: string) => {
    const { data, error } = await supabase.storage
      .from("moving_documents")
      .download(filePath);

    if (error) {
      toast({ title: "Fout bij downloaden", variant: "destructive" });
      return;
    }

    const url = URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen pb-24 bg-gradient-to-br from-primary-light via-primary-light/80 to-white">
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-italiana text-foreground tracking-wide">LUA</span>
            <p className="text-sm text-muted-foreground mt-0.5">Documenten & chat</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onLogout}
            className="h-10 w-10 rounded-full hover:bg-secondary"
          >
            <LogOut className="w-5 h-5 text-muted-foreground" />
          </Button>
        </div>
      </div>

      {/* Section Navigation */}
      <div className="px-6 mb-6">
        <div className="flex gap-2 p-1 bg-secondary/50 rounded-2xl">
          <Button
            variant="ghost"
            onClick={() => setActiveSection("documents")}
            className={`flex-1 h-12 rounded-xl gap-2 transition-all ${
              activeSection === "documents" 
                ? "bg-card shadow-soft text-foreground" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <FolderOpen className="h-4 w-4" />
            Documenten
          </Button>
          <Button
            variant="ghost"
            onClick={() => setActiveSection("chat")}
            className={`flex-1 h-12 rounded-xl gap-2 transition-all ${
              activeSection === "chat" 
                ? "bg-card shadow-soft text-foreground" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <MessageCircle className="h-4 w-4" />
            Chat
          </Button>
        </div>
      </div>

      <div className="px-6">
        {/* Info Banner */}
        <div className="p-4 mb-6 rounded-2xl bg-primary/5 border border-primary/10">
          <p className="text-sm text-muted-foreground">
            Alles onder "Extra" is zichtbaar voor iedereen in je verhuisomgeving.
          </p>
        </div>

        {/* Documents Section */}
        {activeSection === "documents" && (
          <div className="space-y-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full h-12 rounded-xl gap-2">
                  <Upload className="h-4 w-4" />
                  Document uploaden
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-2xl">
                <DialogHeader>
                  <DialogTitle>Document uploaden</DialogTitle>
                  <DialogDescription>Upload een document (max 20MB)</DialogDescription>
                </DialogHeader>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const file = formData.get("file") as File;
                    const category = formData.get("category") as string;
                    const description = formData.get("description") as string;

                    if (file) {
                      uploadDocument.mutate({ file, category, description });
                      e.currentTarget.reset();
                    }
                  }}
                  className="space-y-4"
                >
                  <div>
                    <Label htmlFor="file">Bestand</Label>
                    <Input id="file" name="file" type="file" required className="rounded-xl" />
                  </div>
                  <div>
                    <Label htmlFor="category">Categorie</Label>
                    <Select name="category" required>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Kies categorie" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="contract">Contract</SelectItem>
                        <SelectItem value="meterstand">Meterstand</SelectItem>
                        <SelectItem value="checklist">Checklist</SelectItem>
                        <SelectItem value="factuur">Factuur</SelectItem>
                        <SelectItem value="overig">Overig</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="description">Beschrijving (optioneel)</Label>
                    <Textarea id="description" name="description" className="rounded-xl" />
                  </div>
                  <Button type="submit" className="w-full rounded-xl">Uploaden</Button>
                </form>
              </DialogContent>
            </Dialog>

            {documents.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-secondary/30">
                <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">Nog geen documenten geüpload</p>
              </div>
            ) : (
              <div className="space-y-2">
                {documents.map((doc) => (
                  <div 
                    key={doc.id} 
                    className="group p-4 rounded-2xl bg-secondary/50 hover:bg-secondary transition-colors"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate text-foreground">{doc.file_name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs bg-muted/50">{doc.category}</Badge>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(doc.upload_date), "d MMM yyyy", { locale: nl })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 rounded-xl"
                          onClick={() => downloadDocument(doc.file_path, doc.file_name)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 rounded-xl text-destructive hover:text-destructive"
                          onClick={() => deleteDocument.mutate({ id: doc.id, file_path: doc.file_path })}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Chat Section */}
        {activeSection === "chat" && (
          <ChatAccessGate 
            onLogin={() => onNavigate("settings")} 
            onAddPartner={() => onNavigate("settings")} 
          />
        )}
      </div>

      <BottomNav currentView="extras" onNavigate={onNavigate} />
    </div>
  );
};
