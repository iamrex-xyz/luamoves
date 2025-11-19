import { useState, useEffect } from "react";
import { FileText, Camera, Wallet, Lightbulb, Upload, Plus, Trash2, Eye, Download } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { PhotoCard } from "./PhotoCard";

type ExtrasProps = {
  onNavigate: (view: "dashboard" | "tasks" | "extras" | "settings") => void;
  onLogout: () => void;
};

export const Extras = ({ onNavigate, onLogout }: ExtrasProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("documents");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setCurrentUserId(user.id);
    });
  }, []);

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
    mutationFn: async (formData: { file: File; category: string; description: string }) => {
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

  // Get photo URL
  const getPhotoUrl = (filePath: string) => {
    const { data } = supabase.storage
      .from("moving_photos")
      .getPublicUrl(filePath);
    return data.publicUrl;
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
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">Extra</h1>
          <Button variant="ghost" onClick={onLogout}>Uitloggen</Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="documents" className="flex flex-col gap-1">
              <FileText className="h-4 w-4" />
              <span className="text-xs">Documenten</span>
            </TabsTrigger>
            <TabsTrigger value="photos" className="flex flex-col gap-1">
              <Camera className="h-4 w-4" />
              <span className="text-xs">Foto's</span>
            </TabsTrigger>
            <TabsTrigger value="budget" className="flex flex-col gap-1">
              <Wallet className="h-4 w-4" />
              <span className="text-xs">Budget</span>
            </TabsTrigger>
            <TabsTrigger value="tips" className="flex flex-col gap-1">
              <Lightbulb className="h-4 w-4" />
              <span className="text-xs">Tips</span>
            </TabsTrigger>
          </TabsList>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Documenten</CardTitle>
                <CardDescription>Bewaar belangrijke verhuisdocumenten hier</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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

                <div className="space-y-2">
                  {documents.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      Nog geen documenten geüpload
                    </p>
                  ) : (
                    documents.map((doc) => (
                      <Card key={doc.id}>
                        <CardContent className="p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-primary" />
                            <div className="flex-1">
                              <p className="font-medium">{doc.file_name}</p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Badge variant="outline">{doc.category}</Badge>
                                <span>{format(new Date(doc.upload_date), "d MMM yyyy", { locale: nl })}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
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
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Photos Tab */}
          <TabsContent value="photos" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Foto's</CardTitle>
                <CardDescription>Bewaar foto's van meterstanden, schade, etc.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
                        const category = formData.get("category") as string;
                        const description = formData.get("description") as string;

                        if (file) {
                          uploadPhoto.mutate({ file, category, description });
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
                      <div>
                        <Label htmlFor="photo-category">Categorie</Label>
                        <Select name="category" required>
                          <SelectTrigger>
                            <SelectValue placeholder="Kies categorie" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="meterstand">Meterstand</SelectItem>
                            <SelectItem value="schade">Schade</SelectItem>
                            <SelectItem value="voor">Voor verhuizing</SelectItem>
                            <SelectItem value="na">Na verhuizing</SelectItem>
                            <SelectItem value="overig">Overig</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="photo-description">Beschrijving (optioneel)</Label>
                        <Textarea id="photo-description" name="description" />
                      </div>
                      <Button type="submit" className="w-full">Uploaden</Button>
                    </form>
                  </DialogContent>
                </Dialog>

                {photos.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Nog geen foto's geüpload
                  </p>
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
              </CardContent>
            </Card>
          </TabsContent>

          {/* Budget Tab */}
          <TabsContent value="budget" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Budget overzicht</CardTitle>
                <CardDescription>Houd je verhuiskosten bij</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-primary/10 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">Totale uitgaven</p>
                  <p className="text-3xl font-bold text-primary">€ {totalExpenses.toFixed(2)}</p>
                </div>

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

                <div className="space-y-2">
                  {expenses.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      Nog geen uitgaven toegevoegd
                    </p>
                  ) : (
                    expenses.map((expense) => (
                      <Card key={expense.id}>
                        <CardContent className="p-4 flex items-center justify-between">
                          <div>
                            <p className="font-medium">{expense.description}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Badge variant="outline">{expense.category}</Badge>
                              <span>{format(new Date(expense.expense_date), "d MMM yyyy", { locale: nl })}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-lg">€ {Number(expense.amount).toFixed(2)}</p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteExpense.mutate(expense.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tips Tab */}
          <TabsContent value="tips" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Tips & Advies</CardTitle>
                <CardDescription>Handige tips voor je verhuizing</CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {Object.entries(tipsByPhase).map(([phase, phaseTips]) => (
                    <AccordionItem key={phase} value={phase}>
                      <AccordionTrigger className="text-left">
                        <div className="flex items-center gap-2">
                          <Lightbulb className="h-4 w-4 text-primary" />
                          <span>{phase}</span>
                          <Badge variant="secondary">{phaseTips.length}</Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-3">
                          {phaseTips.map((tip) => (
                            <Card key={tip.id}>
                              <CardContent className="p-4">
                                <div className="flex items-start gap-2">
                                  <Badge variant="outline">{tip.category}</Badge>
                                </div>
                                <h4 className="font-semibold mt-2">{tip.title}</h4>
                                <p className="text-sm text-muted-foreground mt-1">{tip.content}</p>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};
