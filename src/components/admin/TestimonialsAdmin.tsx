import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import CountrySelect from "@/components/CountrySelect";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Pencil, X } from "lucide-react";

type Testimonial = {
  id: string;
  author_name: string;
  author_role: string | null;
  author_avatar_url: string | null;
  content: string;
  rating: number;
  country: string | null;
  is_featured: boolean;
  order_index: number;
};

const TestimonialsAdmin = () => {
  const { toast } = useToast();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    author_name: "",
    author_role: "",
    author_avatar_url: "",
    content: "",
    rating: 5,
    country: "",
    is_featured: true,
    order_index: 0,
  });

  const loadTestimonials = async () => {
    const { data, error } = await supabase
      .from("testimonials")
      .select("*")
      .order("order_index", { ascending: true });

    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      return;
    }

    setTestimonials(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    loadTestimonials();
  }, []);

  const resetForm = () => {
    setForm({
      author_name: "",
      author_role: "",
      author_avatar_url: "",
      content: "",
      rating: 5,
      country: "",
      is_featured: true,
      order_index: 0,
    });
    setEditing(null);
  };

  const handleEdit = (testimonial: Testimonial) => {
    setForm({
      author_name: testimonial.author_name,
      author_role: testimonial.author_role || "",
      author_avatar_url: testimonial.author_avatar_url || "",
      content: testimonial.content,
      rating: testimonial.rating,
      country: testimonial.country || "",
      is_featured: testimonial.is_featured,
      order_index: testimonial.order_index,
    });
    setEditing(testimonial.id);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.author_name.trim() || !form.content.trim()) {
      toast({ title: "Erreur", description: "Nom et contenu requis", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    const payload = {
      author_name: form.author_name.trim(),
      author_role: form.author_role.trim() || null,
      author_avatar_url: form.author_avatar_url.trim() || null,
      content: form.content.trim(),
      rating: form.rating,
      country: form.country.trim() || null,
      is_featured: form.is_featured,
      order_index: form.order_index,
    };

    const response = editing
      ? await supabase.from("testimonials").update(payload).eq("id", editing)
      : await supabase.from("testimonials").insert(payload);

    if (response.error) {
      toast({ title: "Erreur", description: response.error.message, variant: "destructive" });
    } else {
      toast({ title: editing ? "Témoignage modifié" : "Témoignage créé" });
      resetForm();
      loadTestimonials();
    }

    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Confirmer la suppression ?")) return;

    const { error } = await supabase.from("testimonials").delete().eq("id", id);

    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Témoignage supprimé" });
      loadTestimonials();
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
          <CardTitle>{editing ? "Modifier le témoignage" : "Ajouter un témoignage"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="author_name">Nom de l'auteur *</Label>
                <Input
                  id="author_name"
                  value={form.author_name}
                  onChange={(e) => setForm({ ...form, author_name: e.target.value })}
                  placeholder="Ex: Jean Dupont"
                />
              </div>
              <div>
                <Label htmlFor="author_role">Rôle/Position</Label>
                <Input
                  id="author_role"
                  value={form.author_role}
                  onChange={(e) => setForm({ ...form, author_role: e.target.value })}
                  placeholder="Ex: Pasteur, Leader communautaire"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="country">Pays</Label>
                <CountrySelect
                  value={form.country}
                  onChange={(v) => setForm({ ...form, country: v })}
                  placeholder="Sélectionner un pays..."
                />
              </div>
              <div>
                <Label htmlFor="rating">Note (1-5)</Label>
                <Select value={form.rating.toString()} onValueChange={(v) => setForm({ ...form, rating: parseInt(v) })}>
                  <SelectTrigger id="rating">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 ⭐</SelectItem>
                    <SelectItem value="2">2 ⭐</SelectItem>
                    <SelectItem value="3">3 ⭐</SelectItem>
                    <SelectItem value="4">4 ⭐</SelectItem>
                    <SelectItem value="5">5 ⭐</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="author_avatar_url">URL de l'avatar</Label>
              <Input
                id="author_avatar_url"
                type="url"
                value={form.author_avatar_url}
                onChange={(e) => setForm({ ...form, author_avatar_url: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div>
              <Label htmlFor="content">Contenu du témoignage *</Label>
              <Textarea
                id="content"
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="Écrivez le témoignage..."
                rows={4}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {form.content.length}/500 caractères
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_featured"
                  checked={form.is_featured}
                  onCheckedChange={(checked) => setForm({ ...form, is_featured: checked })}
                />
                <Label htmlFor="is_featured" className="cursor-pointer">
                  Afficher sur l'accueil
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
        <h3 className="text-lg font-semibold mb-4">Témoignages ({testimonials.length})</h3>
        <div className="space-y-3">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold truncate">{testimonial.author_name}</h4>
                      {testimonial.is_featured && <Badge>Accueil</Badge>}
                      <Badge variant="outline">{testimonial.rating}⭐</Badge>
                    </div>
                    {testimonial.author_role && (
                      <p className="text-sm text-muted-foreground">{testimonial.author_role}</p>
                    )}
                    <p className="text-sm mt-2 line-clamp-2">{testimonial.content}</p>
                    {testimonial.country && (
                      <p className="text-xs text-muted-foreground mt-1">{testimonial.country}</p>
                    )}
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(testimonial)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(testimonial.id)}
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

export default TestimonialsAdmin;
