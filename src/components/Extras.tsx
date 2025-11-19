import { useState } from "react";
import { FileText, Camera, Wallet, Lightbulb, Upload, Plus, Trash2, Download, LogOut, MessageCircle, Home as HomeIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { PhotoCard } from "./PhotoCard";
import { BottomNav } from "./BottomNav";
import { CollaboratorChat } from "./CollaboratorChat";

type ExtrasProps = {
  onNavigate: (view: "dashboard" | "tasks" | "extras" | "settings") => void;
  onLogout: () => void;
};

export const Extras = ({ onNavigate, onLogout }: ExtrasProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeSection, setActiveSection] = useState<"documents" | "photos" | "budget" | "tips" | "chat">("documents");

  // Fetch moving tips
  const { data: tips = [] } = useQuery({
    queryKey: ["moving-tips"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("moving_tips")
        .select("*")
        .order("phase", { ascending: true })
        .order("order_index", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  // Fetch expenses
  const { data: expenses = [] } = useQuery({
    queryKey: ["moving-expenses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("moving_expenses")
        .select("*")
        .order("expense_date", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

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

  // Fetch photos
  const { data: photos = [] } = useQuery({
    queryKey: ["moving-photos"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase.storage
        .from("moving_photos")
        .list(user.id, {
          limit: 100,
          offset: 0,
          sortBy: { column: "created_at", order: "desc" },
        });

      if (error) throw error;
      return data || [];
    },
  });

  // Add expense mutation
  const addExpense = useMutation({
    mutationFn: async (expense: {
      category: string;
      description: string;
      amount: number;
      expense_date: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Niet ingelogd");

      const { error } = await supabase.from("moving_expenses").insert({
        ...expense,
        user_id: user.id,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["moving-expenses"] });
      toast({ title: "Uitgave toegevoegd" });
    },
    onError: () => {
      toast({ title: "Fout bij toevoegen uitgave", variant: "destructive" });
    },
  });

  // Delete expense mutation
  const deleteExpense = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("moving_expenses").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["moving-expenses"] });
      toast({ title: "Uitgave verwijderd" });
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

  // Upload photo mutation
  const uploadPhoto = useMutation({
    mutationFn: async (formData: { file: File }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Niet ingelogd");

      const fileExt = formData.file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("moving_photos")
        .upload(filePath, formData.file);

      if (uploadError) throw uploadError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["moving-photos"] });
      toast({ title: "Foto geüpload" });
    },
    onError: () => {
      toast({ title: "Fout bij uploaden foto", variant: "destructive" });
    },
  });

  // Delete photo mutation
  const deletePhoto = useMutation({
    mutationFn: async (filePath: string) => {
      const { error } = await supabase.storage
        .from("moving_photos")
        .remove([filePath]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["moving-photos"] });
      toast({ title: "Foto verwijderd" });
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

  // Group tips by phase
  const tipsByPhase = tips.reduce((acc, tip) => {
    if (!acc[tip.phase]) acc[tip.phase] = [];
    acc[tip.phase].push(tip);
    return acc;
  }, {} as Record<string, typeof tips>);

  // Calculate total expenses
  const totalExpenses = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Unified Header */}
      <header className="bg-primary text-white sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-lg backdrop-blur">
                <HomeIcon className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-semibold">Extra</h1>
                <p className="text-white/80 text-xs">Documenten, budget & meer</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onLogout} className="text-white hover:bg-white/10 h-10 w-10">
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-4">
        {/* Section Navigation */}
        <div className="grid grid-cols-5 gap-2">
          <Button
            variant={activeSection === "documents" ? "default" : "outline"}
            onClick={() => setActiveSection("documents")}
            className="flex flex-col h-auto py-3 gap-1"
          >
            <FileText className="h-4 w-4" />
            <span className="text-xs">Documenten</span>
          </Button>
          <Button
            variant={activeSection === "photos" ? "default" : "outline"}
            onClick={() => setActiveSection("photos")}
            className="flex flex-col h-auto py-3 gap-1"
          >
            <Camera className="h-4 w-4" />
            <span className="text-xs">Foto's</span>
          </Button>
          <Button
            variant={activeSection === "budget" ? "default" : "outline"}
            onClick={() => setActiveSection("budget")}
            className="flex flex-col h-auto py-3 gap-1"
          >
            <Wallet className="h-4 w-4" />
            <span className="text-xs">Budget</span>
          </Button>
          <Button
            variant={activeSection === "tips" ? "default" : "outline"}
            onClick={() => setActiveSection("tips")}
            className="flex flex-col h-auto py-3 gap-1"
          >
            <Lightbulb className="h-4 w-4" />
            <span className="text-xs">Tips</span>
          </Button>
          <Button
            variant={activeSection === "chat" ? "default" : "outline"}
            onClick={() => setActiveSection("chat")}
            className="flex flex-col h-auto py-3 gap-1"
          >
            <MessageCircle className="h-4 w-4" />
            <span className="text-xs">Chat</span>
          </Button>
        </div>

        {/* Documents Section */}
        {activeSection === "documents" && (
          <div className="space-y-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full">
                  <Upload className="mr-2 h-4 w-4" />
                  Document uploaden
                </Button>
              </DialogTrigger>
              <DialogContent>
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
                    <Input id="file" name="file" type="file" required />
                  </div>
                  <div>
                    <Label htmlFor="category">Categorie</Label>
                    <Select name="category" required>
                      <SelectTrigger>
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
                    <Textarea id="description" name="description" />
                  </div>
                  <Button type="submit" className="w-full">Uploaden</Button>
                </form>
              </DialogContent>
            </Dialog>

            {documents.length === 0 ? (
              <Card className="p-8 text-center">
                <FileText className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Nog geen documenten geüpload</p>
              </Card>
            ) : (
              <div className="space-y-2">
                {documents.map((doc) => (
                  <Card key={doc.id} className="p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <FileText className="h-5 w-5 text-primary flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{doc.file_name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">{doc.category}</Badge>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(doc.upload_date), "d MMM yyyy", { locale: nl })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => downloadDocument(doc.file_path, doc.file_name)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteDocument.mutate({ id: doc.id, file_path: doc.file_path })}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Photos Section */}
        {activeSection === "photos" && (
          <div className="space-y-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full">
                  <Camera className="mr-2 h-4 w-4" />
                  Foto uploaden
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Foto uploaden</DialogTitle>
                  <DialogDescription>Upload een foto (max 10MB)</DialogDescription>
                </DialogHeader>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const file = formData.get("file") as File;

                    if (file) {
                      uploadPhoto.mutate({ file });
                      e.currentTarget.reset();
                    }
                  }}
                  className="space-y-4"
                >
                  <div>
                    <Label htmlFor="photo-file">Foto</Label>
                    <Input 
                      id="photo-file" 
                      name="file" 
                      type="file" 
                      accept="image/*"
                      capture="environment"
                      required 
                    />
                  </div>
                  <Button type="submit" className="w-full">Uploaden</Button>
                </form>
              </DialogContent>
            </Dialog>

            {photos.length === 0 ? (
              <Card className="p-8 text-center">
                <Camera className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Nog geen foto's geüpload</p>
              </Card>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {photos.map((photo) => (
                  <PhotoCard 
                    key={photo.name} 
                    photo={photo}
                    onDelete={(path) => deletePhoto.mutate(path)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Budget Section */}
        {activeSection === "budget" && (
          <div className="space-y-4">
            <Card className="p-4 bg-primary/5 border-primary/20">
              <p className="text-sm text-muted-foreground mb-1">Totale uitgaven</p>
              <p className="text-3xl font-bold">€ {totalExpenses.toFixed(2)}</p>
            </Card>

            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Uitgave toevoegen
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Uitgave toevoegen</DialogTitle>
                </DialogHeader>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    addExpense.mutate({
                      category: formData.get("category") as string,
                      description: formData.get("description") as string,
                      amount: Number(formData.get("amount")),
                      expense_date: formData.get("expense_date") as string,
                    });
                    e.currentTarget.reset();
                  }}
                  className="space-y-4"
                >
                  <div>
                    <Label htmlFor="category">Categorie</Label>
                    <Select name="category" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Kies categorie" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="verhuisbedrijf">Verhuisbedrijf</SelectItem>
                        <SelectItem value="verpakking">Verpakkingsmateriaal</SelectItem>
                        <SelectItem value="klusjesman">Klusjesman</SelectItem>
                        <SelectItem value="schoonmaak">Schoonmaak</SelectItem>
                        <SelectItem value="transport">Transport</SelectItem>
                        <SelectItem value="overig">Overig</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="description">Beschrijving</Label>
                    <Input id="description" name="description" required />
                  </div>
                  <div>
                    <Label htmlFor="amount">Bedrag (€)</Label>
                    <Input id="amount" name="amount" type="number" step="0.01" required />
                  </div>
                  <div>
                    <Label htmlFor="expense_date">Datum</Label>
                    <Input id="expense_date" name="expense_date" type="date" required />
                  </div>
                  <Button type="submit" className="w-full">Toevoegen</Button>
                </form>
              </DialogContent>
            </Dialog>

            {expenses.length === 0 ? (
              <Card className="p-8 text-center">
                <Wallet className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Nog geen uitgaven toegevoegd</p>
              </Card>
            ) : (
              <div className="space-y-2">
                {expenses.map((expense) => (
                  <Card key={expense.id} className="p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{expense.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">{expense.category}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(expense.expense_date), "d MMM yyyy", { locale: nl })}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <p className="font-bold text-lg">€ {Number(expense.amount).toFixed(2)}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteExpense.mutate(expense.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tips Section */}
        {activeSection === "tips" && (
          <div className="space-y-3">
            {Object.entries(tipsByPhase).map(([phase, phaseTips]) => (
              <Card key={phase} className="overflow-hidden">
                <Accordion type="single" collapsible>
                  <AccordionItem value={phase} className="border-0">
                    <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/50">
                      <div className="flex items-center gap-2">
                        <Lightbulb className="h-4 w-4 text-primary" />
                        <span className="font-medium">{phase}</span>
                        <Badge variant="secondary" className="ml-2">{phaseTips.length}</Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-3">
                      <div className="space-y-3 pt-2">
                        {phaseTips.map((tip) => (
                          <div key={tip.id} className="border-l-2 border-primary/30 pl-3">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="text-xs">{tip.category}</Badge>
                            </div>
                            <h4 className="font-medium text-sm mb-1">{tip.title}</h4>
                            <p className="text-sm text-muted-foreground">{tip.content}</p>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </Card>
            ))}
          </div>
        )}

        {/* Chat Section */}
        {activeSection === "chat" && <CollaboratorChat />}
      </main>

      <BottomNav currentView="extras" onNavigate={onNavigate} />
    </div>
  );
};
