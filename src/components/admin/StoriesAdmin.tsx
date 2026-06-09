import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Pencil, X } from "lucide-react";
import MediaUpload from "@/components/MediaUpload";

type Story = {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  link_url: string | null;
  link_text: string;
  is_active: boolean;
  order_index: number;
};

const StoriesAdmin = () => {
  const { toast } = useToast();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    image_url: "",
    link_url: "",
    link_text: "En savoir plus",
    is_active: true,
    order_index: 0,
  });

  const loadStories = async () => {
    const { data, error } = await supabase
      .from("stories")
      .select("*")
      .order("order_index", { ascending: true });

    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      return;
    }

    setStories(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    loadStories();
  }, []);

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      image_url: "",
      link_url: "",
      link_text: "En savoir plus",
      is_active: true,
      order_index: 0,
    });
    setEditing(null);
  };

  const handleEdit = (story: Story) => {
    setForm({
      title: story.title,
      description: story.description || "",
      image_url: story.image_url,
      link_url: story.link_url || "",
      link_text: story.link_text,
      is_active: story.is_active,
      order_index: story.order_index,
    });
    setEditing(story.id);
  };

  const handleImageUpload = (url: string) => {
    setForm({ ...form, image_url: url });
    toast({ title: "Image uploadée" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.image_url.trim()) {
      toast({ title: "Erreur", description: "Titre et image requis", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      image_url: form.image_url.trim(),
      link_url: form.link_url.trim() || null,
      link_text: form.link_text.trim(),
      is_active: form.is_active,
      order_index: form.order_index,
    };

    const response = editing
      ? await supabase.from("stories").update(payload).eq("id", editing)
      : await supabase.from("stories").insert(payload);

    if (response.error) {
      toast({ title: "Erreur", description: response.error.message, variant: "destructive" });
    } else {
      toast({ title: editing ? "Histoire modifiée" : "Histoire créée" });
      resetForm();
      loadStories();
    }

    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Confirmer la suppression ?")) return;

    const { error } = await supabase.from("stories").delete().eq("id", id);

    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Histoire supprimée" });
      loadStories();
    }
  };

  if (loading) {
    return <div className="text-center py-8">Chargement...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>{editing ? "Modifier l'histoire" : "Ajouter une histoire"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Titre *</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Titre de l'histoire"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Décrivez brièvement l'histoire..."
                rows={3}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {form.description.length}/500 caractères
              </p>
            </div>

            <div>
              <Label>Image d'en-tête *</Label>
              <MediaUpload
                onUpload={handleImageUpload}
                bucket="public"
              />
              {form.image_url && (
                <div className="mt-3 rounded-lg overflow-hidden border">
                  <img src={form.image_url} alt="Aperçu" className="w-full h-40 object-cover" />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="link_url">URL du lien</Label>
                <Input
                  id="link_url"
                  type="url"
                  value={form.link_url}
                  onChange={(e) => setForm({ ...form, link_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div>
                <Label htmlFor="link_text">Texte du lien</Label>
                <Input
                  id="link_text"
                  value={form.link_text}
                  onChange={(e) => setForm({ ...form, link_text: e.target.value })}
                  placeholder="En savoir plus"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={form.is_active}
                  onCheckedChange={(checked) => setForm({ ...form, is_active: checked })}
                />
                <Label htmlFor="is_active" className="cursor-pointer">
                  Afficher
                </Label>
              </div>
              <div>
                <Label htmlFor="order_index">Ordre d'affichage</Label>
                <Input
                  id="order_index"
                  type="number"
                  value={form.order_index}
                  onChange={(e) => setForm({ ...form, order_index: parseInt(e.target.value) || 0 })}
                  min="0"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={submitting}>
                {submitting ? "Enregistrement..." : editing ? "Modifier" : "Créer"}
              </Button>
              {editing && (
                <Button type="button" variant="outline" onClick={resetForm}>
                  Annuler
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* List */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Histoires ({stories.length})</h3>
        <div className="grid gap-3">
          {stories.map((story) => (
            <Card key={story.id}>
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <img
                    src={story.image_url}
                    alt={story.title}
                    className="w-20 h-20 rounded object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold truncate">{story.title}</h4>
                      {story.is_active ? <Badge>Visible</Badge> : <Badge variant="secondary">Caché</Badge>}
                    </div>
                    {story.description && (
                      <p className="text-sm text-muted-foreground line-clamp-1 mb-2">{story.description}</p>
                    )}
                    {story.link_url && (
                      <p className="text-xs text-blue-500 truncate">{story.link_text}</p>
                    )}
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(story)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(story.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StoriesAdmin;
