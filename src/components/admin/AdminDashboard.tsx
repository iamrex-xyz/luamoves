import { useState } from "react";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { useAdminProfiles, AdminProfile } from "@/hooks/useAdminProfiles";
import { AdminProfileCard } from "./AdminProfileCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Shield, 
  Search, 
  Users, 
  AlertCircle,
  ArrowLeft,
  Loader2,
  RefreshCw
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type AdminDashboardProps = {
  onBack: () => void;
};

export const AdminDashboard = ({ onBack }: AdminDashboardProps) => {
  const { isAdmin, isLoading: isCheckingAdmin, userEmail } = useAdminCheck();
  const { profiles, isLoading: isLoadingProfiles, error, refetch, updateProfile } = useAdminProfiles(isAdmin);
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const handleUpdateProfile = (profile: AdminProfile) => {
    updateProfile(profile);
  };

  // Filter profiles based on search
  const filteredProfiles = profiles.filter((profile) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      profile.phone?.toLowerCase().includes(query) ||
      profile.old_address?.toLowerCase().includes(query) ||
      profile.new_address?.toLowerCase().includes(query) ||
      profile.municipality?.toLowerCase().includes(query)
    );
  });

  if (isCheckingAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Geen toegang</AlertTitle>
          <AlertDescription>
            Je hebt geen admin rechten om deze pagina te bekijken.
            {userEmail && (
              <span className="block mt-2 text-xs opacity-70">
                Ingelogd als: {userEmail}
              </span>
            )}
          </AlertDescription>
          <Button 
            variant="outline" 
            className="mt-4 w-full"
            onClick={onBack}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Terug naar app
          </Button>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="container max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={onBack}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                <h1 className="text-lg font-semibold">Admin Dashboard</h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>{profiles.length} gebruikers</span>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw className={`w-4 h-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
                Ververs
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Search */}
      <div className="container max-w-4xl mx-auto px-4 py-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Zoek op telefoon, adres, gemeente..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Content */}
      <main className="container max-w-4xl mx-auto px-4 pb-8">
        {isLoadingProfiles ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Fout</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : filteredProfiles.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {searchQuery ? (
              <p>Geen resultaten voor "{searchQuery}"</p>
            ) : (
              <p>Nog geen gebruikersprofielen gevonden</p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProfiles.map((profile) => (
              <AdminProfileCard 
                key={profile.id} 
                profile={profile} 
                onUpdate={handleUpdateProfile}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
