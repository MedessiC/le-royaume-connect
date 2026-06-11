import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Flag, Loader2 } from "lucide-react";

interface ReportDialogProps {
  contentType: "teaching" | "comment" | "user" | "profile";
  contentId: string;
  contentTitle?: string;
  trigger?: React.ReactNode;
}

const ReportDialog: React.FC<ReportDialogProps> = ({
  contentType,
  contentId,
  contentTitle,
  trigger,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const reasons = [
    { value: "spam", label: "Spam ou contenu dupliqué" },
    { value: "inappropriate", label: "Contenu inapproprié" },
    { value: "harassment", label: "Harcèlement ou menace" },
    { value: "misinformation", label: "Désinformation" },
    { value: "copyright", label: "Violation des droits d'auteur" },
    { value: "other", label: "Autre" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !reason.trim()) {
      toast({ title: "Erreur", description: "Veuillez sélectionner une raison", variant: "destructive" });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.from("reports").insert({
        reporter_id: user.id,
        content_type: contentType,
        content_id: contentId,
        reason,
        description: description.trim() || null,
      });

      if (error) throw error;

      toast({
        title: "Signalement envoyé",
        description: "Merci de nous aider à maintenir une communauté saine. Notre équipe examinera votre signalement.",
      });

      setOpen(false);
      setReason("");
      setDescription("");
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {trigger || (
            <Button variant="ghost" size="sm" className="gap-2 text-destructive hover:text-destructive">
              <Flag className="w-4 h-4" /> Signaler
            </Button>
          )}
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connectez-vous pour signaler</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">Vous devez être connecté pour signaler un contenu.</p>
          <Button asChild variant="hero">
            <a href="/auth">Se connecter</a>
          </Button>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className="gap-2 text-destructive hover:text-destructive">
            <Flag className="w-4 h-4" /> Signaler
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Signaler un contenu</DialogTitle>
          <DialogDescription>
            Aidez-nous à maintenir une communauté saine et sécurisée
            {contentTitle && ` – ${contentTitle}`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Raison du signalement *</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger id="reason">
                <SelectValue placeholder="Sélectionnez une raison..." />
              </SelectTrigger>
              <SelectContent>
                {reasons.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (optionnel)</Label>
            <Textarea
              id="description"
              placeholder="Donnez-nous plus de détails pour nous aider..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              className="resize-none h-24"
            />
            <p className="text-xs text-muted-foreground">
              {description.length}/500
            </p>
          </div>

          {/* Privacy Notice */}
          <p className="text-xs text-muted-foreground">
            Votre signalement est confidentiel et sera examiné par notre équipe de modération.
          </p>

          {/* Actions */}
          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={isLoading || !reason.trim()}
              className="gap-2"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Flag className="w-4 h-4" />
              )}
              {isLoading ? "Envoi..." : "Signaler"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ReportDialog;
