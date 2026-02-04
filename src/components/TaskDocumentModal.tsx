import { useState, useRef, useEffect } from "react";
import { Upload, Camera, FileText, Trash2, Eye, Loader2, Image, File, X, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  MobileModal,
  MobileModalContent,
  MobileModalHeader,
  MobileModalTitle,
  MobileModalDescription,
  MobileModalFooter,
} from "@/components/ui/mobile-modal";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { Task } from "@/lib/taskGenerator";

type TaskDocumentModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
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
  task_id: string | null;
};

export const TaskDocumentModal = ({
  open,
  onOpenChange,
  task,
  onSignupClick,
}: TaskDocumentModalProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);
  const [viewingDoc, setViewingDoc] = useState<Document | null>(null);
  const [viewingUrl, setViewingUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Fetch documents for this task
  const { data: documents = [], isLoading } = useQuery({
    queryKey: ["task-documents", task?.id],
    queryFn: async () => {
      if (!task) return [];
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("moving_documents")
        .select("*")
        .eq("task_id", task.id)
        .order("upload_date", { ascending: false });

      if (error) throw error;
      return data as Document[];
    },
    enabled: open && !!task,
  });

  // Upload document mutation
  const uploadDocument = useMutation({
    mutationFn: async (file: File) => {
      if (!task) throw new Error("Geen taak geselecteerd");
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // Guest user - trigger signup
        onSignupClick?.();
        throw new Error("Niet ingelogd");
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${task.id}_${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${task.category}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("moving_documents")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { error: dbError } = await supabase.from("moving_documents").insert({
        user_id: user.id,
        file_name: file.name,
        file_path: filePath,
        file_type: file.type,
        category: task.category,
        description: task.title,
        task_id: task.id,
      });

      if (dbError) throw dbError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task-documents", task?.id] });
      queryClient.invalidateQueries({ queryKey: ["moving-documents"] });
      toast({
        title: "Document toegevoegd",
        description: "Je document is gekoppeld aan deze taak.",
      });
    },
    onError: (error) => {
      if (error.message !== "Niet ingelogd") {
        toast({
          title: "Upload mislukt",
          description: "Probeer het opnieuw.",
          variant: "destructive",
        });
      }
    },
  });

  // Delete document mutation
  const deleteDocument = useMutation({
    mutationFn: async (doc: Document) => {
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
      queryClient.invalidateQueries({ queryKey: ["task-documents", task?.id] });
      queryClient.invalidateQueries({ queryKey: ["moving-documents"] });
      toast({ title: "Document verwijderd" });
    },
    onError: () => {
      toast({
        title: "Verwijderen mislukt",
        variant: "destructive",
      });
    },
  });

  // View document
  const openDocument = async (doc: Document) => {
    try {
      const { data } = await supabase.storage
        .from("moving_documents")
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

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    
    try {
      for (const file of Array.from(files)) {
        await uploadDocument.mutateAsync(file);
      }
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (cameraInputRef.current) cameraInputRef.current.value = '';
    }
  };

  // Check file types
  const isImage = (fileType: string) => fileType.startsWith('image/');
  const isPdf = (fileType: string) => fileType === 'application/pdf';
  
  const getDocumentIcon = (fileType: string) => {
    if (isImage(fileType)) return Image;
    if (isPdf(fileType)) return FileText;
    return File;
  };

  if (!task) return null;

  // Document viewer overlay
  if (viewingDoc && viewingUrl) {
    return (
      <MobileModal open={open} onOpenChange={onOpenChange}>
        <MobileModalContent className="max-h-[95vh]">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-medium truncate pr-4">
              {viewingDoc.file_name}
            </h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setViewingDoc(null);
                setViewingUrl(null);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex-1 overflow-auto p-4">
            {isImage(viewingDoc.file_type) ? (
              <img
                src={viewingUrl}
                alt={viewingDoc.file_name}
                className="w-full h-auto rounded-lg"
              />
            ) : isPdf(viewingDoc.file_type) ? (
              <iframe
                src={viewingUrl}
                className="w-full h-[60vh] rounded-lg border"
                title={viewingDoc.file_name}
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-12 gap-4">
                <File className="w-16 h-16 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Preview niet beschikbaar</p>
                <Button
                  variant="outline"
                  onClick={() => window.open(viewingUrl, '_blank')}
                >
                  Openen in browser
                </Button>
              </div>
            )}
          </div>
          <MobileModalFooter>
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => {
                deleteDocument.mutate(viewingDoc);
                setViewingDoc(null);
                setViewingUrl(null);
              }}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Verwijderen
            </Button>
          </MobileModalFooter>
        </MobileModalContent>
      </MobileModal>
    );
  }

  return (
    <MobileModal open={open} onOpenChange={onOpenChange}>
      <MobileModalContent showCloseButton>
        <MobileModalHeader>
          <MobileModalTitle>Documenten</MobileModalTitle>
          <MobileModalDescription>
            Koppel documenten aan deze taak
          </MobileModalDescription>
        </MobileModalHeader>

        <div className="flex-1 overflow-auto px-6 py-4">
          {/* Upload buttons */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <Button
              variant="outline"
              className="h-20 flex-col gap-2 hover:bg-secondary hover:border-primary/20 rounded-xl"
              onClick={() => cameraInputRef.current?.click()}
              disabled={isUploading}
            >
              <Camera className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">Maak foto</span>
            </Button>
            
            <Button
              variant="outline"
              className="h-20 flex-col gap-2 hover:bg-secondary hover:border-primary/20 rounded-xl"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              <Upload className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">Kies bestand</span>
            </Button>
          </div>

          {isUploading && (
            <div className="flex items-center justify-center gap-2 py-4 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Uploaden...</span>
            </div>
          )}

          {/* Documents list */}
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-3">
                <FolderOpen className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                Nog geen documenten toegevoegd
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                Gekoppelde documenten
              </p>
              {documents.map((doc) => {
                const Icon = getDocumentIcon(doc.file_type);
                const fileType = doc.file_name.split('.').pop()?.toUpperCase() || 'FILE';
                
                return (
                  <div
                    key={doc.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center shrink-0">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {doc.file_name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground">{fileType}</span>
                        {doc.upload_date && (
                          <>
                            <span className="text-muted-foreground/40">•</span>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(doc.upload_date), "d MMM", { locale: nl })}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openDocument(doc)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => deleteDocument.mutate(doc)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Hidden file inputs */}
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*,.pdf,.doc,.docx"
          multiple
          onChange={handleFileSelect}
        />
        <input
          ref={cameraInputRef}
          type="file"
          className="hidden"
          accept="image/*"
          capture="environment"
          onChange={handleFileSelect}
        />
      </MobileModalContent>
    </MobileModal>
  );
};
