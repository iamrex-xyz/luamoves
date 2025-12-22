import { useState, useRef } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Camera, Upload, CheckCircle2, Loader2, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Task } from "@/lib/taskGenerator";

type DocumentUploadSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
  onSignupClick?: () => void;
};

type UploadStep = "upload" | "uploading" | "askAccount" | "enterEmail" | "success";

// Store pending uploads in memory for guests
const pendingGuestUploads: { file: File; task: Task }[] = [];

export const DocumentUploadSheet = ({
  open,
  onOpenChange,
  task,
  onSignupClick,
}: DocumentUploadSheetProps) => {
  const [step, setStep] = useState<UploadStep>("upload");
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const resetState = () => {
    setStep("upload");
    setPendingFiles([]);
    setEmail("");
    setIsSubmitting(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetState();
    }
    onOpenChange(newOpen);
  };

  const uploadFilesForUser = async (userId: string, files: File[]) => {
    if (!task) return;

    for (const file of files) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${task.id}_${Date.now()}.${fileExt}`;
      const filePath = `${userId}/${task.category}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('moving_documents')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      await supabase.from('moving_documents').insert({
        user_id: userId,
        file_name: file.name,
        file_path: filePath,
        file_type: file.type,
        category: task.category,
        description: task.title,
      });
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !task) return;

    const fileArray = Array.from(files);
    setStep("uploading");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // User is logged in - upload directly
        await uploadFilesForUser(user.id, fileArray);
        setStep("success");
        
        setTimeout(() => {
          handleOpenChange(false);
          toast({
            title: "Bewaard",
            description: "Ik bewaar dit voor je, dan heb je het later bij de hand.",
          });
        }, 1500);
      } else {
        // Guest user - store files and ask for account
        setPendingFiles(fileArray);
        setStep("askAccount");
      }
    } catch (error) {
      console.error('Upload failed:', error);
      toast({
        title: "Upload mislukt",
        description: "Probeer het opnieuw.",
        variant: "destructive",
      });
      setStep("upload");
    }
  };

  const handleCreateAccount = async () => {
    if (!email || !task) return;
    
    setIsSubmitting(true);

    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password: crypto.randomUUID(), // Generate a random password - user can reset later
        options: {
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) {
        if (error.message.includes('already registered')) {
          toast({
            title: "Dit e-mailadres is al in gebruik",
            description: "Log in om je documenten te bewaren.",
          });
          onSignupClick?.();
          handleOpenChange(false);
          return;
        }
        throw error;
      }

      if (data.user) {
        // Upload the pending files for the new user
        await uploadFilesForUser(data.user.id, pendingFiles);
        
        setStep("success");
        
        setTimeout(() => {
          handleOpenChange(false);
          toast({
            title: "Bewaard!",
            description: "Je document is veilig opgeslagen. Check je e-mail om je account te bevestigen.",
          });
        }, 1500);
      }
    } catch (error) {
      console.error('Signup failed:', error);
      toast({
        title: "Er ging iets mis",
        description: "Probeer het opnieuw.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkipAccount = () => {
    // Store in localStorage for later
    const guestDocs = JSON.parse(localStorage.getItem('lua_guest_documents') || '[]');
    pendingFiles.forEach(file => {
      guestDocs.push({
        fileName: file.name,
        fileType: file.type,
        taskId: task?.id,
        taskTitle: task?.title,
        category: task?.category,
        timestamp: Date.now(),
      });
    });
    localStorage.setItem('lua_guest_documents', JSON.stringify(guestDocs));
    
    handleOpenChange(false);
    toast({
      title: "Tijdelijk opgeslagen",
      description: "Maak een account aan om je documenten veilig te bewaren.",
    });
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const triggerCameraUpload = () => {
    cameraInputRef.current?.click();
  };

  if (!task) return null;

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl pb-8">
        {step === "upload" && (
          <>
            <SheetHeader className="text-left mb-6">
              <SheetTitle className="text-lg font-semibold">
                {task.title}
              </SheetTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Ik bewaar dit voor je, dan heb je het later bij de hand.
              </p>
            </SheetHeader>

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
          </>
        )}

        {step === "uploading" && (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">Even geduld...</p>
          </div>
        )}

        {step === "askAccount" && (
          <div className="py-4">
            <SheetHeader className="text-left mb-6">
              <SheetTitle className="text-lg font-semibold">
                Zal ik dit voor je bewaren?
              </SheetTitle>
              <p className="text-sm text-muted-foreground mt-2">
                Dan maak ik een account voor je aan. Zo raak je niks kwijt en kun je later verder waar je gebleven was.
              </p>
            </SheetHeader>

            <div className="space-y-3">
              <Button 
                className="w-full"
                onClick={() => setStep("enterEmail")}
              >
                Ja, bewaar voor mij
              </Button>
              <Button 
                variant="ghost" 
                className="w-full text-muted-foreground"
                onClick={handleSkipAccount}
              >
                Nee, later misschien
              </Button>
            </div>
          </div>
        )}

        {step === "enterEmail" && (
          <div className="py-4">
            <SheetHeader className="text-left mb-6">
              <SheetTitle className="text-lg font-semibold">
                Wat is je e-mailadres?
              </SheetTitle>
              <p className="text-sm text-muted-foreground mt-2">
                Hier stuur ik je een bevestiging naartoe.
              </p>
            </SheetHeader>

            <div className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="je@email.nl"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  autoFocus
                />
              </div>
              
              <Button 
                className="w-full"
                onClick={handleCreateAccount}
                disabled={!email || isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                Bewaren
              </Button>
              
              <Button 
                variant="ghost" 
                className="w-full text-muted-foreground"
                onClick={() => setStep("askAccount")}
              >
                Terug
              </Button>
            </div>
          </div>
        )}

        {step === "success" && (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-primary" />
            </div>
            <p className="text-sm font-medium text-foreground">Bewaard!</p>
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
