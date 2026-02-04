import { useState, useEffect } from "react";
import { X, Trash2, File, FileText, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  MobileModal,
  MobileModalContent,
  MobileModalFooter,
} from "@/components/ui/mobile-modal";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { TaskDocument } from "@/hooks/useTaskDocuments";

type DocumentViewerModalProps = {
  document: TaskDocument | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const DocumentViewerModal = ({
  document,
  open,
  onOpenChange,
}: DocumentViewerModalProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [viewingUrl, setViewingUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load signed URL when document changes
  useEffect(() => {
    const loadUrl = async () => {
      if (!document || !open) {
        setViewingUrl(null);
        return;
      }

      setIsLoading(true);
      try {
        const { data } = await supabase.storage
          .from("moving_documents")
          .createSignedUrl(document.file_path, 3600);

        if (data?.signedUrl) {
          setViewingUrl(data.signedUrl);
        }
      } catch (error) {
        toast({
          title: "Kon document niet openen",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadUrl();
  }, [document, open, toast]);

  // Delete document mutation
  const deleteDocument = useMutation({
    mutationFn: async (doc: TaskDocument) => {
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
      queryClient.invalidateQueries({ queryKey: ["task-documents-all"] });
      queryClient.invalidateQueries({ queryKey: ["task-documents"] });
      queryClient.invalidateQueries({ queryKey: ["moving-documents"] });
      toast({ title: "Document verwijderd" });
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: "Verwijderen mislukt",
        variant: "destructive",
      });
    },
  });

  const isImage = (fileType: string) => fileType.startsWith('image/');
  const isPdf = (fileType: string) => fileType === 'application/pdf';

  if (!document) return null;

  return (
    <MobileModal open={open} onOpenChange={onOpenChange}>
      <MobileModalContent className="max-h-[95vh]">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-medium truncate pr-4">
            {document.file_name}
          </h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 overflow-auto p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : viewingUrl ? (
            isImage(document.file_type) ? (
              <img
                src={viewingUrl}
                alt={document.file_name}
                className="w-full h-auto rounded-lg"
              />
            ) : isPdf(document.file_type) ? (
              <iframe
                src={viewingUrl}
                className="w-full h-[60vh] rounded-lg border"
                title={document.file_name}
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
            )
          ) : (
            <div className="flex items-center justify-center py-12">
              <p className="text-sm text-muted-foreground">Kon document niet laden</p>
            </div>
          )}
        </div>
        <MobileModalFooter>
          <Button
            variant="destructive"
            className="w-full"
            onClick={() => deleteDocument.mutate(document)}
            disabled={deleteDocument.isPending}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Verwijderen
          </Button>
        </MobileModalFooter>
      </MobileModalContent>
    </MobileModal>
  );
};
