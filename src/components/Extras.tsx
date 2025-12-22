import { useState, useRef, useEffect } from "react";
import { FileText, Upload, Trash2, Download, FolderOpen, Users, X, Image, File, Eye } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { BottomNav } from "./BottomNav";
import { LuaLogo } from "@/components/LuaLogo";

type ExtrasProps = {
  onNavigate: (view: "dashboard" | "tasks" | "extras" | "settings" | "chat") => void;
  isGuest?: boolean;
  onSignupClick?: () => void;
};

type Document = {
  id: string;
  user_id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  category: string;
  description: string | null;
  upload_date: string | null;
  created_at: string | null;
};

export const Extras = ({ onNavigate, isGuest, onSignupClick }: ExtrasProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [viewingDoc, setViewingDoc] = useState<Document | null>(null);
  const [viewingUrl, setViewingUrl] = useState<string | null>(null);
  const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({});
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
      return data as Document[];
    },
    enabled: !isGuest,
  });

  // Generate preview URLs for images
  useEffect(() => {
    const loadPreviews = async () => {
      const urls: Record<string, string> = {};
      
      for (const doc of documents) {
        if (doc.file_type.startsWith('image/')) {
          try {
            const { data } = await supabase.storage
              .from('moving_documents')
              .createSignedUrl(doc.file_path, 3600); // 1 hour
            
            if (data?.signedUrl) {
              urls[doc.id] = data.signedUrl;
            }
          } catch (error) {
            console.error('Error loading preview:', error);
          }
        }
      }
      
      setPreviewUrls(urls);
    };

    if (documents.length > 0) {
      loadPreviews();
    }
  }, [documents]);

  // Load document for viewing
  const openDocument = async (doc: Document) => {
    try {
      const { data } = await supabase.storage
        .from('moving_documents')
        .createSignedUrl(doc.file_path, 3600);

      if (data?.signedUrl) {
        setViewingUrl(data.signedUrl);
        setViewingDoc(doc);
      }
    } catch (error) {
      toast({
        title: "Kon document niet openen",
        variant: "destructive",
      });
    }
  };

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
      toast({ 
        title: "Bewaard!", 
        description: "Ik bewaar dit voor je, dan heb je het later bij de hand." 
      });
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

  // Check if file is an image
  const isImage = (fileType: string) => fileType.startsWith('image/');
  const isPdf = (fileType: string) => fileType === 'application/pdf';

  // Get document icon
  const getDocumentIcon = (fileType: string) => {
    if (isImage(fileType)) return Image;
    if (isPdf(fileType)) return FileText;
    return File;
  };

  // Group documents by category
  const documentsByCategory = documents.reduce((acc, doc) => {
    const category = doc.category || "overig";
    if (!acc[category]) acc[category] = [];
    acc[category].push(doc);
    return acc;
  }, {} as Record<string, Document[]>);

  const categoryLabels: Record<string, string> = {
    contract: "Contracten",
    meterstand: "Meterstanden",
    checklist: "Checklists",
    factuur: "Facturen",
    "Even landen": "Even landen",
    "Slim vooruit regelen": "Slim vooruit regelen",
    "Papier & zekerheid": "Papier & zekerheid",
    "De praktische puzzel": "De praktische puzzel",
    "Bijna daar": "Bijna daar",
    "Verhuisdag": "Verhuisdag",
    "Welkom thuis": "Welkom thuis",
    overig: "Overig",
  };

  // Guest UI
  if (isGuest) {
    return (
      <div className="min-h-screen pb-20 bg-gradient-to-br from-primary-light via-primary-light/80 to-white">
        <div className="px-4 pt-4 pb-2">
          <LuaLogo size="md" />
        </div>

        <div className="px-4 py-8">
          <Card className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <FolderOpen className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-medium mb-2">Bewaar je documenten veilig</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Maak gratis een account aan en upload contracten, meterstanden en andere belangrijke bestanden.
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
      <div className="px-4 pt-4 pb-2">
        <LuaLogo size="md" />
      </div>

      <div className="px-4">
        <div className="p-4 mb-4 rounded-2xl bg-primary/5 border border-primary/10 flex items-start gap-3">
          <Users className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground">
            Zo zie je meteen wat dit ook alweer was. Even kijken?
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
              <DialogDescription>Ik bewaar dit voor je, dan heb je het later bij de hand.</DialogDescription>
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
                  accept="image/*,.pdf,.doc,.docx"
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
              Hier bewaar je straks je contracten, meterstanden en andere belangrijke bestanden.
            </p>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(documentsByCategory).map(([category, docs]) => (
              <div key={category}>
                <h3 className="text-sm font-medium text-muted-foreground mb-3 px-1">
                  {categoryLabels[category] || category} ({docs.length})
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {docs.map((doc) => {
                    const Icon = getDocumentIcon(doc.file_type);
                    const hasPreview = isImage(doc.file_type) && previewUrls[doc.id];
                    
                    return (
                      <Card 
                        key={doc.id} 
                        className="group overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => openDocument(doc)}
                      >
                        {/* Preview area */}
                        <div className="aspect-[4/3] bg-muted/30 flex items-center justify-center relative overflow-hidden">
                          {hasPreview ? (
                            <img 
                              src={previewUrls[doc.id]} 
                              alt={doc.description || doc.file_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="flex flex-col items-center gap-2">
                              <Icon className="h-8 w-8 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground uppercase">
                                {doc.file_name.split('.').pop()}
                              </span>
                            </div>
                          )}
                          
                          {/* Hover overlay */}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Eye className="h-6 w-6 text-white" />
                          </div>
                        </div>
                        
                        {/* Info area */}
                        <div className="p-3">
                          <p className="font-medium text-sm truncate">
                            {doc.description || doc.file_name}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {doc.upload_date && format(new Date(doc.upload_date), "d MMM", { locale: nl })}
                          </p>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Document Viewer Sheet */}
      <Sheet open={!!viewingDoc} onOpenChange={(open) => {
        if (!open) {
          setViewingDoc(null);
          setViewingUrl(null);
        }
      }}>
        <SheetContent side="bottom" className="h-[90vh] rounded-t-2xl p-0">
          {viewingDoc && viewingUrl && (
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex-1 min-w-0 pr-4">
                  <h3 className="font-medium truncate">
                    {viewingDoc.description || viewingDoc.file_name}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {viewingDoc.upload_date && format(new Date(viewingDoc.upload_date), "d MMMM yyyy", { locale: nl })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-xl"
                    onClick={() => downloadDocument(viewingDoc.file_path, viewingDoc.file_name)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-xl text-destructive"
                    onClick={() => {
                      deleteDocument.mutate({ id: viewingDoc.id, file_path: viewingDoc.file_path });
                      setViewingDoc(null);
                      setViewingUrl(null);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-xl"
                    onClick={() => {
                      setViewingDoc(null);
                      setViewingUrl(null);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {/* Content */}
              <div className="flex-1 overflow-auto bg-muted/20">
                {isImage(viewingDoc.file_type) ? (
                  <img 
                    src={viewingUrl} 
                    alt={viewingDoc.description || viewingDoc.file_name}
                    className="w-full h-auto"
                  />
                ) : isPdf(viewingDoc.file_type) ? (
                  <iframe 
                    src={viewingUrl}
                    className="w-full h-full"
                    title={viewingDoc.file_name}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full gap-4 p-8">
                    <File className="h-16 w-16 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground text-center">
                      Dit bestandstype kan niet worden weergegeven. Download het bestand om te bekijken.
                    </p>
                    <Button 
                      onClick={() => downloadDocument(viewingDoc.file_path, viewingDoc.file_name)}
                      className="rounded-xl"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <BottomNav currentView="extras" onNavigate={onNavigate} />
    </div>
  );
};
