import { useState, useRef } from "react";
import { FileText, Upload, Trash2, Download, FolderOpen, Users } from "lucide-react";
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

type ExtrasProps = {
  onNavigate: (view: "dashboard" | "tasks" | "extras" | "settings" | "chat") => void;
  isGuest?: boolean;
  onSignupClick?: () => void;
};

export const Extras = ({ onNavigate, isGuest, onSignupClick }: ExtrasProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch documents (own + from collaborators) - only for authenticated users
  const { data: documents = [], isLoading } = useQuery({
    queryKey: ["moving-documents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("moving_documents")
        .select("*")
        .order("upload_date", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !isGuest, // Don't fetch for guests
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
      setUploadDialogOpen(false);
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

  // Group documents by category
  const documentsByCategory = documents.reduce((acc, doc) => {
    const category = doc.category || "overig";
    if (!acc[category]) acc[category] = [];
    acc[category].push(doc);
    return acc;
  }, {} as Record<string, typeof documents>);

  const categoryLabels: Record<string, string> = {
    contract: "Contracten",
    meterstand: "Meterstanden",
    checklist: "Checklists",
    factuur: "Facturen",
    overig: "Overig",
  };

  // Guest UI
  if (isGuest) {
    return (
      <div className="min-h-screen pb-20 bg-gradient-to-br from-primary-light via-primary-light/80 to-white">
      <div className="px-4 pt-6 pb-2">
        <span className="text-2xl font-italiana text-foreground tracking-wide">LUA</span>
        <p className="text-sm text-muted-foreground mt-0.5">Documenten</p>
      </div>

        <div className="px-4 py-12">
          <Card className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <FolderOpen className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-medium mb-2">Maak een account aan</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Upload en bewaar belangrijke verhuisdocumenten veilig na het aanmaken van een account.
            </p>
            <Button onClick={onSignupClick} className="rounded-xl">
              Account aanmaken
            </Button>
          </Card>
        </div>

        <BottomNav currentView="extras" onNavigate={onNavigate} />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 bg-gradient-to-br from-primary-light via-primary-light/80 to-white">
      {/* Header */}
      <div className="px-4 pt-6 pb-2">
        <span className="text-2xl font-italiana text-foreground tracking-wide">LUA</span>
        <p className="text-sm text-muted-foreground mt-0.5">Documenten</p>
      </div>

      <div className="px-4">
        {/* Info Banner */}
        <div className="p-4 mb-4 rounded-2xl bg-primary/5 border border-primary/10 flex items-start gap-3">
          <Users className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground">
            Documenten zijn zichtbaar voor iedereen in je verhuisomgeving, inclusief uitgenodigde huisgenoten.
          </p>
        </div>

        {/* Upload Button */}
        <Dialog open={uploadDialogOpen} onOpenChange={(open) => {
          setUploadDialogOpen(open);
          if (!open) setSelectedFile(null);
        }}>
          <DialogTrigger asChild>
            <Button className="w-full h-12 rounded-xl gap-2 mb-6">
              <Upload className="h-4 w-4" />
              Document uploaden
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-2xl">
            <DialogHeader>
              <DialogTitle>Document uploaden</DialogTitle>
              <DialogDescription>Upload een document (max 20MB). Het wordt gedeeld met je verhuispartners.</DialogDescription>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const category = formData.get("category") as string;
                const description = formData.get("description") as string;

                if (selectedFile && category) {
                  uploadDocument.mutate({ file: selectedFile, category, description });
                  setSelectedFile(null);
                }
              }}
              className="space-y-4"
            >
              <div>
                <Label className="text-sm font-medium mb-2 block">Bestand</Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  name="file"
                  required
                  className="hidden"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-24 rounded-xl border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 hover:bg-primary/5 transition-colors flex flex-col items-center justify-center gap-2"
                >
                  {selectedFile ? (
                    <>
                      <FileText className="h-6 w-6 text-primary" />
                      <span className="text-sm font-medium text-foreground truncate max-w-[200px]">{selectedFile.name}</span>
                      <span className="text-xs text-muted-foreground">Klik om te wijzigen</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-6 w-6 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Klik om een bestand te kiezen</span>
                    </>
                  )}
                </button>
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
                <Textarea id="description" name="description" className="rounded-xl" placeholder="Bijv. Huurcontract nieuwe woning" />
              </div>
              <Button type="submit" className="w-full rounded-xl" disabled={uploadDocument.isPending}>
                {uploadDocument.isPending ? "Uploaden..." : "Uploaden"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Documents List */}
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : documents.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
              <FolderOpen className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-medium mb-1">Nog geen documenten</h3>
            <p className="text-sm text-muted-foreground">
              Upload contracten, meterstanden of andere belangrijke documenten.
            </p>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(documentsByCategory).map(([category, docs]) => (
              <div key={category}>
                <h3 className="text-sm font-medium text-muted-foreground mb-2 px-1">
                  {categoryLabels[category] || category} ({docs.length})
                </h3>
                <div className="space-y-2">
                  {docs.map((doc) => (
                    <Card 
                      key={doc.id} 
                      className="group p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                            <FileText className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{doc.file_name}</p>
                            {doc.description && (
                              <p className="text-xs text-muted-foreground truncate mt-0.5">{doc.description}</p>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">
                              {format(new Date(doc.upload_date), "d MMM yyyy", { locale: nl })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
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
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav currentView="extras" onNavigate={onNavigate} />
    </div>
  );
};
