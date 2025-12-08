import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

type PhotoCardProps = {
  photo: {
    name: string;
    created_at: string;
  };
  onDelete: (filePath: string) => void;
};

export const PhotoCard = ({ photo, onDelete }: PhotoCardProps) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string>("");

  useEffect(() => {
    const loadSignedUrl = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        const filePath = `${user.id}/${photo.name}`;
        const { data, error } = await supabase.storage
          .from("moving_photos")
          .createSignedUrl(filePath, 3600); // 1 hour expiry
        if (data && !error) {
          setPhotoUrl(data.signedUrl);
        }
      }
    };
    loadSignedUrl();
  }, [photo.name]);

  if (!userId || !photoUrl) return null;

  const filePath = `${userId}/${photo.name}`;

  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-square">
        <img
          src={photoUrl}
          alt={photo.name}
          className="w-full h-full object-cover"
        />
        <Button
          variant="destructive"
          size="sm"
          className="absolute top-2 right-2"
          onClick={() => onDelete(filePath)}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
      <CardContent className="p-2">
        <p className="text-xs text-muted-foreground truncate">
          {format(new Date(photo.created_at), "d MMM yyyy HH:mm", { locale: nl })}
        </p>
      </CardContent>
    </Card>
  );
};
