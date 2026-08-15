import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, Trash2, Loader2 } from "lucide-react";
import UserAvatar from "@/components/UserAvatar";
import { useToast } from "@/hooks/use-toast";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { uploadToOracleStorage, isOracleStorageConfigured } from "@/lib/oracleStorage";

interface AvatarUploadProps {
  currentAvatarUrl?: string | null;
  userName: string;
  userId: string;
  onAvatarChange?: (newUrl: string) => void;
  onAvatarDelete?: () => void;
}

/**
 * Reusable Avatar Upload Component
 * Provides file upload, validation, and deletion for user avatars
 */
const AvatarUpload: React.FC<AvatarUploadProps> = ({
  currentAvatarUrl,
  userName,
  userId,
  onAvatarChange,
  onAvatarDelete,
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;

    const file = e.target.files[0];

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Fichier trop volumineux",
        description: "Max 5MB",
        variant: "destructive",
      });
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Type de fichier invalide",
        description: "Veuillez sélectionner une image",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      let url: string;
      try {
        url = await uploadToCloudinary(file, `le-royaume/avatars/${userId}`);
      } catch (err: any) {
        if (isOracleStorageConfigured) {
          url = await uploadToOracleStorage(file, `le-royaume/avatars/${userId}`);
        } else {
          throw err;
        }
      }

      if (onAvatarChange) {
        onAvatarChange(url);
      }

      toast({ title: "Photo de profil mise à jour ✓" });
    } catch (error: any) {
      toast({
        title: "Erreur lors de l'upload",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDelete = async () => {
    if (!currentAvatarUrl) return;

    setIsLoading(true);

    try {
      if (onAvatarDelete) {
        onAvatarDelete();
      }

      toast({ title: "Photo supprimée" });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la photo",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="border-2 border-dashed border-gold/30 rounded-xl p-8 transition-all hover:border-gold/60 hover:bg-gold/5">
      <div className="flex flex-col md:flex-row items-center gap-8">
        {/* Avatar Preview */}
        <div className="flex-shrink-0">
          <div className="relative group">
            <UserAvatar
              src={currentAvatarUrl}
              name={userName}
              className="w-24 h-24 md:w-32 md:h-32 border-4 border-gold/30 group-hover:border-gold/60 transition-all"
            />
            {currentAvatarUrl && (
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 rounded-full flex items-center justify-center transition-all">
                <span className="text-white text-sm font-semibold">Modifier</span>
              </div>
            )}
          </div>
        </div>

        {/* Upload Controls */}
        <div className="flex-1">
          <Label className="mb-3 block font-semibold text-lg">Photo de profil</Label>
          <p className="text-sm text-muted-foreground mb-4">
            Téléchargez une photo carrée (JPG, PNG, WebP ou GIF - max 5MB)
          </p>

          <div className="flex flex-col gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleAvatarChange}
              disabled={isLoading}
              hidden
            />

            <Button
              type="button"
              variant="hero"
              disabled={isLoading}
              onClick={() => fileInputRef.current?.click()}
              className="gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Upload en cours...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Télécharger une photo
                </>
              )}
            </Button>

            {currentAvatarUrl && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={isLoading}
                className="gap-2"
              >
                <Trash2 className="w-4 h-4" /> Supprimer la photo
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvatarUpload;
