import { Bookmark, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

type SaveButtonProps = {
  teachingId: string;
  teachingTitle: string;
  size?: "sm" | "md" | "lg";
  isSaved?: boolean;
  savedCollectionIds?: string[];
  collections?: Array<{ id: string; name: string }>;
  onToggleCollection?: (collectionId: string) => void;
  onCreateCollection?: () => void;
};

export const SaveButton = ({
  teachingId,
  teachingTitle,
  size = "sm",
  isSaved = false,
  savedCollectionIds = [],
  collections = [],
  onToggleCollection,
  onCreateCollection,
}: SaveButtonProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showDialog, setShowDialog] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [open, setOpen] = useState(false);

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) return;

    setIsCreating(true);
    try {
      const { data, error } = await supabase
        .from("teaching_collections")
        .insert({ user_id: user?.id, name: newCollectionName.trim() })
        .select("id, name")
        .single();

      if (error) throw error;

      if (data) {
        toast({
          description: `Collection "${newCollectionName}" créée`,
          duration: 2000,
        });
        setNewCollectionName("");
        setShowDialog(false);
        
        // Add teaching to new collection
        const { error: addError } = await supabase
          .from("teaching_collection_items")
          .insert({ collection_id: data.id, teaching_id: teachingId });
        
        if (!addError) {
          onToggleCollection?.(data.id);
        }
      }
    } catch (error) {
      console.error("Failed to create collection", error);
      toast({
        description: "Erreur lors de la création",
        variant: "destructive",
        duration: 2000,
      });
    } finally {
      setIsCreating(false);
    }
  };

  if (!user) {
    return (
      <Button
        variant="ghost"
        className="p-2 text-muted-foreground hover:text-gold hover:bg-muted transition-colors rounded-lg flex items-center justify-center gap-2"
        title="Connectez-vous pour sauvegarder"
        disabled
      >
        <Bookmark className={size === "sm" ? "w-4 h-4" : "w-5 h-5"} />
      </Button>
    );
  }

  const buttonSize = {
    sm: "p-2",
    md: "py-2 px-3",
    lg: "py-3 px-4",
  }[size];

  const buttonClass = {
    sm: "w-4 h-4",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  }[size];

  if (!collections.length) {
    return (
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            className={`${buttonSize} text-muted-foreground hover:text-gold hover:bg-muted transition-colors rounded-lg flex items-center justify-center gap-2`}
            title="Sauvegarder"
          >
            <Bookmark className={buttonClass} />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer une collection</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="collection-name">Nom de la collection</Label>
              <Input
                id="collection-name"
                placeholder="Ex: Enseignements spirituels"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreateCollection();
                }}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowDialog(false)}>
                Annuler
              </Button>
              <Button onClick={handleCreateCollection} disabled={isCreating || !newCollectionName.trim()}>
                {isCreating ? "Création..." : "Créer"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className={`${buttonSize} transition-colors rounded-lg flex items-center justify-center gap-2 ${
            isSaved
              ? "text-gold bg-gold/10 hover:bg-gold/20"
              : "text-muted-foreground hover:text-gold hover:bg-muted"
          }`}
          title="Sauvegarder"
        >
          <Bookmark className={`${buttonClass} ${isSaved ? "fill-current" : ""}`} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2" align="end">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-foreground px-2 py-1">Sauvegarder dans</p>
          {collections.map((collection) => (
            <button
              key={collection.id}
              onClick={() => onToggleCollection?.(collection.id)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-sm text-foreground"
            >
              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                savedCollectionIds.includes(collection.id)
                  ? "bg-gold border-gold"
                  : "border-muted-foreground"
              }`}>
                {savedCollectionIds.includes(collection.id) && (
                  <Check className="w-3 h-3 text-background" />
                )}
              </div>
              <span className="flex-1 text-left">{collection.name}</span>
            </button>
          ))}
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-sm text-gold border-t border-border mt-2 pt-2">
                <span className="text-lg">+</span>
                <span>Nouvelle collection</span>
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Créer une collection</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="collection-name">Nom de la collection</Label>
                  <Input
                    id="collection-name"
                    placeholder="Ex: Enseignements spirituels"
                    value={newCollectionName}
                    onChange={(e) => setNewCollectionName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleCreateCollection();
                    }}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowDialog(false)}>
                    Annuler
                  </Button>
                  <Button onClick={handleCreateCollection} disabled={isCreating || !newCollectionName.trim()}>
                    {isCreating ? "Création..." : "Créer"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default SaveButton;
