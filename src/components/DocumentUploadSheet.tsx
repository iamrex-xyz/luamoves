import { useState, useRef } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Camera, Upload, FileText, CheckCircle2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Task } from "@/lib/taskGenerator";

type DocumentUploadSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
};

export const DocumentUploadSheet = ({
  open,
  onOpenChange,
  task,
}: DocumentUploadSheetProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !task) return;

    setIsUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Niet ingelogd",
          description: "Log in om documenten te bewaren.",
          variant: "destructive",
        });
        return;
      }

      for (const file of Array.from(files)) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${task.id}_${Date.now()}.${fileExt}`;
        const filePath = `${user.id}/${task.category}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('moving_documents')
          .upload(filePath, file);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          throw uploadError;
        }

        // Save document reference to database
        await supabase.from('moving_documents').insert({
          user_id: user.id,
          file_name: file.name,
          file_path: filePath,
          file_type: file.type,
          category: task.category,
          description: task.title,
        });
      }

      setUploadSuccess(true);
      
      setTimeout(() => {
        setUploadSuccess(false);
        onOpenChange(false);
        toast({
          title: "Bewaard",
          description: "Ik bewaar dit voor je, dan heb je het later bij de hand.",
        });
      }, 1500);

    } catch (error) {
      console.error('Upload failed:', error);
      toast({
        title: "Upload mislukt",
        description: "Probeer het opnieuw.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Reset file inputs
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (cameraInputRef.current) cameraInputRef.current.value = '';
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const triggerCameraUpload = () => {
    cameraInputRef.current?.click();
  };

  if (!task) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl pb-8">
        <SheetHeader className="text-left mb-6">
          <SheetTitle className="text-lg font-semibold">
            {task.title}
          </SheetTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Ik bewaar dit voor je, dan heb je het later bij de hand.
          </p>
        </SheetHeader>

        {uploadSuccess ? (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-primary" />
            </div>
            <p className="text-sm font-medium text-foreground">Bewaard!</p>
          </div>
        ) : isUploading ? (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">Even geduld...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="h-24 flex-col gap-2 hover:bg-secondary hover:border-primary/20"
              onClick={triggerCameraUpload}
            >
              <Camera className="w-6 h-6 text-primary" />
              <span className="text-sm font-medium">Maak foto</span>
            </Button>
            
            <Button
              variant="outline"
              className="h-24 flex-col gap-2 hover:bg-secondary hover:border-primary/20"
              onClick={triggerFileUpload}
            >
              <Upload className="w-6 h-6 text-primary" />
              <span className="text-sm font-medium">Kies bestand</span>
            </Button>
          </div>
        )}

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
      </SheetContent>
    </Sheet>
  );
};
