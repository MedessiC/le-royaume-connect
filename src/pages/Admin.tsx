import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import RichTextEditor from "@/components/RichTextEditor";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Shield, ShieldOff, Pencil, X, Award } from "lucide-react";
import MediaUpload from "@/components/MediaUpload";
import GoldBadge from "@/components/GoldBadge";
import CountrySelect from "@/components/CountrySelect";
import TestimonialsAdmin from "@/components/admin/TestimonialsAdmin";
import StoriesAdmin from "@/components/admin/StoriesAdmin";

type Category = { id: string; name: string; slug: string; description: string | null };
type Teaching = {
  id: string; title: string; excerpt: string | null; content: string;
  cover_image_url: string | null; video_url: string | null; audio_url: string | null; country: string | null;
  category_id: string | null; published: boolean; created_at: string;
  author_id: string | null;
};
type TeachingComment = {
  id: string;
  content: string;
  created_at: string;
  parent_id: string | null;
  teaching_id: string;
  user_id: string;
};
type UserRow = { id: string; full_name: string | null; country: string | null; has_gold_badge: boolean };
type HomeSettings = Database["public"]["Tables"]["home_settings"]["Row"];
type HomeSettingsForm = {
  youtube_url: string;
  youtube_duration_days: number;
  active: boolean;
  tiktok_url: string;
  youtube_channel_url: string;
  whatsapp_url: string;
  facebook_url: string;
  live_enabled: boolean;
  live_url: string;
  marquee_text: string;
  marquee_speed: number;
  carousel_images: string[];
};

const slugify = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const emptyForm = {
  title: "", excerpt: "", content: "",
  cover: null as string | null, video: null as string | null, audio: null as string | null,
  country: "", catId: "", published: true,
};

const Admin = () => {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [categories, setCategories] = useState<Category[]>([]);
  const [teachings, setTeachings] = useState<Teaching[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [adminIds, setAdminIds] = useState<Set<string>>(new Set());
  const [badgeIds, setBadgeIds] = useState<Set<string>>(new Set());

  const [catName, setCatName] = useState("");
  const [catDesc, setCatDesc] = useState("");

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [homeSettings, setHomeSettings] = useState<HomeSettings | null>(null);
  const [homeForm, setHomeForm] = useState<HomeSettingsForm>({
    youtube_url: "",
    youtube_duration_days: 10,
    active: true,
    tiktok_url: "",
    youtube_channel_url: "",
    whatsapp_url: "",
    facebook_url: "",
    live_enabled: false,
    live_url: "",
    marquee_text: "",
    marquee_speed: 45,
    carousel_images: [],
  });
  const [publicationQuery, setPublicationQuery] = useState("");
  const [publicationStatusFilter, setPublicationStatusFilter] = useState<"all" | "published" | "draft">("all");
  const [publicationCategoryFilter, setPublicationCategoryFilter] = useState("all");
  const [publicationAuthorFilter, setPublicationAuthorFilter] = useState("all");
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});
  const [selectedTeaching, setSelectedTeaching] = useState<Teaching | null>(null);
  const [selectedTeachingComments, setSelectedTeachingComments] = useState<TeachingComment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [userQuery, setUserQuery] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
    if (!loading && user && !isAdmin) navigate("/feed");
  }, [user, isAdmin, loading, navigate]);

  const refresh = async () => {
    const [cats, teach, profs, roles, settings, commentRows] = await Promise.all([
      supabase.from("categories").select("*").order("name"),
      supabase.from("teachings").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("id, full_name, country, has_gold_badge").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("user_id").eq("role", "admin"),
      supabase.from<HomeSettings>("home_settings").select("*").maybeSingle(),
      supabase.from("teaching_comments").select("teaching_id"),
    ]);
    if (cats.data) setCategories(cats.data);
    if (teach.data) setTeachings(teach.data);
    if (profs.data) {
      setUsers(profs.data);
      setBadgeIds(new Set(profs.data.filter((p: UserRow) => p.has_gold_badge).map((p: UserRow) => p.id)));
    }
    if (roles.data) setAdminIds(new Set(roles.data.map((r: any) => r.user_id)));
    if (commentRows.data) {
      setCommentCounts(commentRows.data.reduce((acc, row) => {
        acc[row.teaching_id] = (acc[row.teaching_id] ?? 0) + 1;
        return acc;
      }, {} as Record<string, number>));
    }
    if (settings.data) {
      setHomeSettings(settings.data);
      setHomeForm({
        youtube_url: settings.data.youtube_url ?? "",
        youtube_duration_days: settings.data.youtube_duration_days ?? 10,
        active: settings.data.active,
        tiktok_url: settings.data.tiktok_url ?? "",
        youtube_channel_url: settings.data.youtube_channel_url ?? "",
        whatsapp_url: settings.data.whatsapp_url ?? "",
        facebook_url: settings.data.facebook_url ?? "",
        live_enabled: settings.data.live_enabled ?? false,
        live_url: settings.data.live_url ?? "",
        marquee_text: settings.data.marquee_text ?? "",
        marquee_speed: settings.data.marquee_speed ?? 45,
        carousel_images: settings.data.carousel_images ?? [],
      });
    }
  };

  useEffect(() => {
    if (isAdmin) {
      document.title = "Administration – MILLENIUM";
      refresh();
    }
  }, [isAdmin]);

  const createCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;
    const { error } = await supabase.from("categories").insert({
      name: catName.trim(),
      slug: slugify(catName),
      description: catDesc.trim() || null,
    });
    if (error) return toast({ title: "Erreur", description: error.message, variant: "destructive" });
    setCatName(""); setCatDesc("");
    toast({ title: "Catégorie créée" });
    refresh();
  };

  const saveHomeSettings = async (e: React.FormEvent) => {
    e.preventDefault();

    const expiresAt = homeForm.youtube_duration_days
      ? new Date(Date.now() + homeForm.youtube_duration_days * 24 * 60 * 60 * 1000).toISOString()
      : null;

    const payload = {
      youtube_url: homeForm.youtube_url.trim() || null,
      youtube_duration_days: homeForm.youtube_duration_days,
      youtube_expires_at: expiresAt,
      active: homeForm.active,
      tiktok_url: homeForm.tiktok_url.trim() || null,
      youtube_channel_url: homeForm.youtube_channel_url.trim() || null,
      whatsapp_url: homeForm.whatsapp_url.trim() || null,
      facebook_url: homeForm.facebook_url.trim() || null,
      live_enabled: homeForm.live_enabled,
      live_url: homeForm.live_url.trim() || null,
      marquee_text: homeForm.marquee_text.trim() || null,
      marquee_speed: homeForm.marquee_speed,
      carousel_images: homeForm.carousel_images.filter(Boolean),
    };

    const response = homeSettings?.id
      ? await supabase.from("home_settings").update(payload).eq("id", homeSettings.id)
      : await supabase.from("home_settings").insert(payload);

    if (response.error) {
      return toast({ title: "Erreur", description: response.error.message, variant: "destructive" });
    }

    toast({ title: "Paramètres d’accueil enregistrés" });
    refresh();
  };

  const deleteCategory = async (id: string) => {
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) return toast({ title: "Erreur", description: error.message, variant: "destructive" });
    refresh();
  };

  const loadTeachingComments = async (teaching: Teaching) => {
    setSelectedTeaching(teaching);
    setLoadingComments(true);
    const { data, error } = await supabase
      .from<TeachingComment>("teaching_comments")
      .select("*")
      .eq("teaching_id", teaching.id)
      .order("created_at", { ascending: true });
    setLoadingComments(false);
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      return;
    }
    setSelectedTeachingComments(data ?? []);
  };

  const deleteTeachingComment = async (commentId: string) => {
    if (!confirm("Supprimer ce commentaire ?")) return;
    const { error } = await supabase.from("teaching_comments").delete().eq("id", commentId);
    if (error) return toast({ title: "Erreur", description: error.message, variant: "destructive" });
    toast({ title: "Commentaire supprimé" });
    if (selectedTeaching) {
      loadTeachingComments(selectedTeaching);
      refresh();
    }
  };

  const startEdit = (t: Teaching) => {
    setEditingId(t.id);
    setForm({
      title: t.title,
      excerpt: t.excerpt ?? "",
      content: t.content,
      cover: t.cover_image_url,
      video: t.video_url,
      audio: t.audio_url,
      country: t.country ?? "",
      catId: t.category_id ?? "",
      published: t.published,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const filteredPublications = teachings.filter((t) => {
    const query = publicationQuery.trim().toLowerCase();
    const matchesQuery =
      !query ||
      [t.title, t.excerpt, t.content]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(query));
    const matchesStatus =
      publicationStatusFilter === "all" ||
      (publicationStatusFilter === "published" ? t.published : !t.published);
    const matchesCategory = publicationCategoryFilter === "all" || t.category_id === publicationCategoryFilter;
    const matchesAuthor = publicationAuthorFilter === "all" || t.author_id === publicationAuthorFilter;
    return matchesQuery && matchesStatus && matchesCategory && matchesAuthor;
  });

  const getAuthorName = (authorId: string | null) => {
    if (!authorId) return "Auteur inconnu";
    return users.find((u) => u.id === authorId)?.full_name || "Auteur inconnu";
  };

  const filteredUsers = users.filter((u) => {
    const query = userQuery.trim().toLowerCase();
    return (
      !query ||
      (u.full_name?.toLowerCase().includes(query) ?? false) ||
      u.id.toLowerCase().includes(query)
    );
  });

  const selectedUser = selectedUserId ? users.find((u) => u.id === selectedUserId) ?? null : null;

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const submitTeaching = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    // Validation
    const titleTrimmed = form.title.trim();
    const contentTrimmed = form.content.trim();

    if (!titleTrimmed) {
      toast({ title: "Validation", description: "Le titre est obligatoire", variant: "destructive" });
      setSubmitting(false);
      return;
    }

    if (!contentTrimmed) {
      toast({ title: "Validation", description: "Le contenu est obligatoire", variant: "destructive" });
      setSubmitting(false);
      return;
    }

    const payload = {
      title: titleTrimmed,
      excerpt: form.excerpt.trim() || null,
      content: contentTrimmed,
      cover_image_url: form.cover,
      video_url: form.video,
      audio_url: form.audio,
      country: form.country.trim() || null,
      category_id: form.catId || null,
      published: form.published,
    };

    try {
      if (editingId) {
        const { error } = await supabase.from("teachings").update(payload).eq("id", editingId);
        if (error) {
          toast({ title: "Erreur", description: error.message, variant: "destructive" });
          setSubmitting(false);
          return;
        }
        toast({ title: "Succès", description: "Enseignement mis à jour" });
      } else {
        const { error } = await supabase.from("teachings").insert({ ...payload, author_id: user!.id });
        if (error) {
          toast({ title: "Erreur", description: error.message, variant: "destructive" });
          setSubmitting(false);
          return;
        }
        toast({ title: "Succès", description: "Enseignement publié" });
      }
      setSubmitting(false);
      cancelEdit();
      refresh();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Une erreur est survenue";
      toast({ title: "Erreur", description: errorMsg, variant: "destructive" });
      setSubmitting(false);
    }
  };

  const togglePublished = async (t: Teaching) => {
    await supabase.from("teachings").update({ published: !t.published }).eq("id", t.id);
    refresh();
  };

  const deleteTeaching = async (id: string) => {
    if (!confirm("Supprimer cet enseignement ?")) return;
    await supabase.from("teachings").delete().eq("id", id);
    if (editingId === id) cancelEdit();
    refresh();
  };

  const setCarouselImage = (index: number, url: string | null) => {
    const images = [...homeForm.carousel_images];
    images[index] = url ?? "";
    setHomeForm({ ...homeForm, carousel_images: images });
  };

  const removeCarouselImage = (index: number) => {
    const images = homeForm.carousel_images.filter((_, idx) => idx !== index);
    setHomeForm({ ...homeForm, carousel_images: images });
  };

  const addCarouselImage = () => {
    if (homeForm.carousel_images.length >= 5) return;
    setHomeForm({ ...homeForm, carousel_images: [...homeForm.carousel_images, ""] });
  };

  const toggleAdmin = async (userId: string, makeAdmin: boolean) => {
    if (makeAdmin) {
      const { error } = await supabase.from("user_roles").insert({ user_id: userId, role: "admin" });
      if (error) return toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      const { error } = await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", "admin");
      if (error) return toast({ title: "Erreur", description: error.message, variant: "destructive" });
    }
    refresh();
  };

  const toggleGoldBadge = async (userId: string, enable: boolean) => {
    const { error } = await supabase.rpc("update_user_gold_badge", {
      target_user_id: userId,
      should_have_badge: enable,
    });
    if (error) {
      console.error("Failed to update gold badge", error);
      return toast({ title: "Erreur", description: error.message, variant: "destructive" });
    }
    toast({ title: "Succès", description: enable ? "Badge doré ajouté" : "Badge doré retiré" });
    refresh();
  };

  if (loading || !isAdmin) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Chargement…</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 pt-24 pb-16 max-w-6xl">
        <header className="mb-8">
          <h1 className="font-display text-4xl font-bold text-foreground">Panel d'administration</h1>
          <p className="text-muted-foreground font-body">Gérez le contenu et les permissions du site.</p>
        </header>

        <Tabs defaultValue="teachings">
          <TabsList>
            <TabsTrigger value="home">Accueil</TabsTrigger>
            <TabsTrigger value="publications">Publications</TabsTrigger>
            <TabsTrigger value="teachings">Enseignements</TabsTrigger>
            <TabsTrigger value="categories">Catégories</TabsTrigger>
            <TabsTrigger value="testimonials">Témoignages</TabsTrigger>
            <TabsTrigger value="stories">Histoires</TabsTrigger>
            <TabsTrigger value="users">Utilisateurs</TabsTrigger>
          </TabsList>

          <TabsContent value="home" className="space-y-6">
            <Card className="border-gold/20">
              <CardHeader>
                <CardTitle>Contenu d’accueil</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={saveHomeSettings} className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <Label>URL YouTube</Label>
                      <Input
                        value={homeForm.youtube_url}
                        onChange={(e) => setHomeForm({ ...homeForm, youtube_url: e.target.value })}
                        placeholder="https://youtu.be/..."
                      />
                    </div>
                    <div>
                      <Label>Durée d’affichage (jours)</Label>
                      <Input
                        type="number"
                        min={1}
                        value={homeForm.youtube_duration_days}
                        onChange={(e) => setHomeForm({ ...homeForm, youtube_duration_days: Number(e.target.value) || 1 })}
                      />
                    </div>
                    <div className="flex items-end gap-2">
                      <Switch
                        checked={homeForm.active}
                        onCheckedChange={(active) => setHomeForm({ ...homeForm, active })}
                        id="home-active"
                      />
                      <Label htmlFor="home-active">Activer la vidéo</Label>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label>Link TikTok</Label>
                      <Input
                        value={homeForm.tiktok_url}
                        onChange={(e) => setHomeForm({ ...homeForm, tiktok_url: e.target.value })}
                        placeholder="https://www.tiktok.com/..."
                      />
                    </div>
                    <div>
                      <Label>Link YouTube</Label>
                      <Input
                        value={homeForm.youtube_channel_url}
                        onChange={(e) => setHomeForm({ ...homeForm, youtube_channel_url: e.target.value })}
                        placeholder="https://www.youtube.com/channel/..."
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-[1.7fr_1fr]">
                    <div>
                      <Label>Communiqué défilant</Label>
                      <Textarea
                        value={homeForm.marquee_text}
                        onChange={(e) => setHomeForm({ ...homeForm, marquee_text: e.target.value })}
                        placeholder="Entrez le texte qui défilera en haut de l’accueil"
                        rows={3}
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        Le texte s’affichera en bandeau défilant en haut de la page d’accueil.
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="marquee-speed">Vitesse de défilement</Label>
                      <div className="space-y-3 mt-2">
                        <div className="flex items-center gap-3">
                          <Input
                            id="marquee-speed"
                            type="number"
                            min={8}
                            max={60}
                            step={1}
                            value={homeForm.marquee_speed}
                            onChange={(e) => setHomeForm({ ...homeForm, marquee_speed: Number(e.target.value) || 45 })}
                            placeholder="45"
                            className="w-20"
                          />
                          <span className="text-sm text-muted-foreground">secondes</span>
                        </div>
                        <input
                          type="range"
                          id="marquee-range"
                          min={8}
                          max={60}
                          step={1}
                          value={homeForm.marquee_speed}
                          onChange={(e) => setHomeForm({ ...homeForm, marquee_speed: Number(e.target.value) || 45 })}
                          className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer accent-gold"
                        />
                        <p className="text-xs text-muted-foreground">
                          Plus bas = plus rapide. 8-30 sec recommandé.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label>Link WhatsApp</Label>
                      <Input
                        value={homeForm.whatsapp_url}
                        onChange={(e) => setHomeForm({ ...homeForm, whatsapp_url: e.target.value })}
                        placeholder="https://wa.me/..."
                      />
                    </div>
                    <div>
                      <Label>Link Facebook</Label>
                      <Input
                        value={homeForm.facebook_url}
                        onChange={(e) => setHomeForm({ ...homeForm, facebook_url: e.target.value })}
                        placeholder="https://www.facebook.com/..."
                      />
                    </div>
                  </div>

                  <div className="border-t border-border pt-6">
                    <h3 className="font-semibold text-foreground mb-4">Bouton « En direct »</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="flex items-end gap-2">
                        <Switch
                          checked={homeForm.live_enabled}
                          onCheckedChange={(live_enabled) => setHomeForm({ ...homeForm, live_enabled })}
                          id="live-enabled"
                        />
                        <Label htmlFor="live-enabled">Activer le bouton en direct</Label>
                      </div>
                      <div>
                        <Label>URL du direct (YouTube, TikTok, etc.)</Label>
                        <Input
                          value={homeForm.live_url}
                          onChange={(e) => setHomeForm({ ...homeForm, live_url: e.target.value })}
                          placeholder="https://www.youtube.com/watch?v=... ou https://www.tiktok.com/@..."
                          disabled={!homeForm.live_enabled}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-border pt-6">
                    <h3 className="font-semibold text-foreground mb-4">Carrousel d’images</h3>
                    <div className="space-y-4">
                      {homeForm.carousel_images.map((image, index) => (
                        <div key={index} className="grid gap-4 md:grid-cols-[1fr,auto] items-end">
                          <MediaUpload
                            value={image}
                            onChange={(url) => setCarouselImage(index, url)}
                            accept="image"
                            label={`Image ${index + 1}`}
                          />
                          <Button type="button" variant="destructive" size="sm" onClick={() => removeCarouselImage(index)} className="h-fit">
                            <Trash2 className="w-4 h-4" /> Supprimer
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addCarouselImage}
                        disabled={homeForm.carousel_images.length >= 5}
                      >
                        Ajouter une image
                      </Button>
                    </div>
                  </div>

                  <Button type="submit" variant="hero">Enregistrer l’accueil</Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="publications" className="space-y-6">
            <Card className="border-gold/20">
              <CardHeader>
                <CardTitle>Gestion des publications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 lg:grid-cols-4">
                  <div className="lg:col-span-2">
                    <Label>Recherche</Label>
                    <Input
                      value={publicationQuery}
                      onChange={(e) => setPublicationQuery(e.target.value)}
                      placeholder="Rechercher un titre, un extrait ou un passage..."
                    />
                  </div>
                  <div>
                    <Label>Statut</Label>
                    <Select value={publicationStatusFilter} onValueChange={(value) => setPublicationStatusFilter(value as "all" | "published" | "draft") }>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous</SelectItem>
                        <SelectItem value="published">Publiés</SelectItem>
                        <SelectItem value="draft">Brouillons</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Catégorie</Label>
                    <Select value={publicationCategoryFilter} onValueChange={setPublicationCategoryFilter}>
                      <SelectTrigger><SelectValue placeholder="Toutes" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Toutes</SelectItem>
                        {categories.map((c) => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Auteur</Label>
                    <Select value={publicationAuthorFilter} onValueChange={setPublicationAuthorFilter}>
                      <SelectTrigger><SelectValue placeholder="Tous" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous</SelectItem>
                        {users.map((u) => (
                          <SelectItem key={u.id} value={u.id}>{u.full_name || "(sans nom)"}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              {filteredPublications.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center text-muted-foreground">
                    Aucune publication ne correspond à vos filtres.
                  </CardContent>
                </Card>
              ) : (
                filteredPublications.map((t) => (
                  <Card key={t.id}>
                    <CardContent className="space-y-4 p-4">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0">
                          <h3 className="font-display text-lg font-semibold truncate">{t.title}</h3>
                          <p className="text-sm text-muted-foreground truncate">{t.excerpt ?? "Pas de description"}</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          {t.published ? <Badge>Publié</Badge> : <Badge variant="secondary">Brouillon</Badge>}
                          {commentCounts[t.id] ? <Badge variant="outline">{commentCounts[t.id]} commentaire{commentCounts[t.id] === 1 ? "" : "s"}</Badge> : <Badge variant="outline">0 commentaire</Badge>}
                          {t.category_id && <Badge variant="outline">{categories.find((c) => c.id === t.category_id)?.name ?? "Catégorie inconnue"}</Badge>}
                        </div>
                      </div>

                      <div className="grid gap-2 md:grid-cols-3 text-xs text-muted-foreground">
                        <span>Auteur : {getAuthorName(t.author_id)}</span>
                        <span>Créé le : {new Date(t.created_at).toLocaleDateString("fr-FR")}</span>
                        <span>Pays : {t.country || "—"}</span>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" variant="outline" onClick={() => startEdit(t)}>Modifier</Button>
                        <Button size="sm" variant="outline" onClick={() => loadTeachingComments(t)}>Voir les commentaires</Button>
                        <Button size="sm" variant="ghost" onClick={() => togglePublished(t)}>
                          {t.published ? "Dépublier" : "Publier"}
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => deleteTeaching(t.id)}>Supprimer</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {selectedTeaching && (
              <Card className="border-gold/20">
                <CardHeader>
                  <CardTitle>Commentaires de la publication</CardTitle>
                  <p className="text-sm text-muted-foreground">{selectedTeaching.title}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="text-sm text-muted-foreground">
                      {selectedTeachingComments.length} commentaire{selectedTeachingComments.length === 1 ? "" : "s"}
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedTeaching(null)}>
                      Fermer
                    </Button>
                  </div>

                  {loadingComments ? (
                    <div className="p-4 text-center text-muted-foreground">Chargement des commentaires…</div>
                  ) : selectedTeachingComments.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">Aucun commentaire pour cette publication.</div>
                  ) : (
                    <div className="space-y-3">
                      {selectedTeachingComments.map((comment) => {
                        const author = users.find((u) => u.id === comment.user_id)?.full_name || "Membre";
                        return (
                          <div key={comment.id} className="rounded-3xl border border-border p-4">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                              <div>
                                <p className="font-semibold">{author}</p>
                                <p className="text-xs text-muted-foreground">{new Date(comment.created_at).toLocaleString("fr-FR")}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                {comment.parent_id && <Badge variant="outline">Réponse</Badge>}
                                <Button size="sm" variant="ghost" onClick={() => deleteTeachingComment(comment.id)}>Supprimer</Button>
                              </div>
                            </div>
                            <p className="mt-3 text-sm text-foreground">{comment.content}</p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* TEACHINGS */}
          <TabsContent value="teachings" className="space-y-6">
            <Card className="border-gold/20">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {editingId ? "Modifier l'enseignement" : "Nouvel enseignement"}
                  {editingId && (
                    <Button size="sm" variant="ghost" onClick={cancelEdit}>
                      <X className="w-4 h-4" /> Annuler
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={submitTeaching} className="space-y-4">
                  <div>
                    <Label>Titre</Label>
                    <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required maxLength={200} />
                  </div>
                  <div>
                    <Label>Extrait</Label>
                    <Input value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} maxLength={300} />
                  </div>
                  <div>
                    <Label>Contenu</Label>
                    <RichTextEditor
                      value={form.content}
                      onChange={(content) => setForm({ ...form, content })}
                      placeholder="Écrivez le contenu de l'enseignement ici..."
                    />
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label>Image de couverture</Label>
                      <MediaUpload value={form.cover} onChange={(v) => setForm({ ...form, cover: v })} accept="image" />
                    </div>
                    <div>
                      <Label>Vidéo (optionnel)</Label>
                      <MediaUpload value={form.video} onChange={(v) => setForm({ ...form, video: v })} accept="video" />
                    </div>
                    <div>
                      <Label>Audio (optionnel)</Label>
                      <MediaUpload value={form.audio} onChange={(v) => setForm({ ...form, audio: v })} accept="audio" />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Pays</Label>
                      <CountrySelect value={form.country} onChange={(v) => setForm({ ...form, country: v })} placeholder="Sélectionner un pays..." />
                    </div>
                    <div>
                      <Label>Catégorie</Label>
                      <Select value={form.catId} onValueChange={(v) => setForm({ ...form, catId: v })}>
                        <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                        <SelectContent>
                          {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={form.published} onCheckedChange={(v) => setForm({ ...form, published: v })} id="pub" />
                    <Label htmlFor="pub">Publié</Label>
                  </div>
                  <Button type="submit" variant="hero" disabled={submitting}>
                    {submitting ? "Traitement en cours..." : editingId ? "Enregistrer" : "Publier"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div className="space-y-3">
              {teachings.map((t) => (
                <Card key={t.id} className={editingId === t.id ? "border-gold" : ""}>
                  <CardContent className="p-4 flex items-center gap-4">
                    {t.cover_image_url && (
                      <img src={t.cover_image_url} alt="" className="w-20 h-14 object-cover rounded shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-display font-semibold truncate">{t.title}</h3>
                        {t.published ? <Badge>Publié</Badge> : <Badge variant="secondary">Brouillon</Badge>}
                        {t.video_url && <Badge variant="outline">Vidéo</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{t.excerpt}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Switch checked={t.published} onCheckedChange={() => togglePublished(t)} />
                      <Button size="icon" variant="ghost" onClick={() => startEdit(t)} aria-label="Modifier">
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => deleteTeaching(t.id)} aria-label="Supprimer">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* CATEGORIES */}
          <TabsContent value="categories" className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Nouvelle catégorie</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={createCategory} className="space-y-3">
                  <div><Label>Nom</Label><Input value={catName} onChange={(e) => setCatName(e.target.value)} required maxLength={50} /></div>
                  <div><Label>Description</Label><Input value={catDesc} onChange={(e) => setCatDesc(e.target.value)} maxLength={200} /></div>
                  <Button type="submit" variant="hero">Créer</Button>
                </form>
              </CardContent>
            </Card>

            <div className="grid gap-3">
              {categories.map((c) => (
                <Card key={c.id}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{c.name}</h3>
                      <p className="text-xs text-muted-foreground">{c.description}</p>
                    </div>
                    <Button size="icon" variant="ghost" onClick={() => deleteCategory(c.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* USERS */}
          <TabsContent value="users" className="space-y-4">
            <Card className="border-gold/20">
              <CardHeader>
                <CardTitle>Utilisateurs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>Rechercher un utilisateur</Label>
                    <Input
                      value={userQuery}
                      onChange={(e) => setUserQuery(e.target.value)}
                      placeholder="Nom, prénom ou ID"
                    />
                  </div>
                  <div className="flex items-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setUserQuery("")}>Effacer</Button>
                    <Button type="button" variant="hero" onClick={() => setSelectedUserId(null)}>Voir tous</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {selectedUser && (
              <Card className="border-gold/20">
                <CardHeader>
                  <CardTitle>Utilisateur sélectionné</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Nom</p>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-foreground">{selectedUser.full_name || "(sans nom)"}</p>
                        <GoldBadge hasGoldBadge={badgeIds.has(selectedUser.id)} />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Pays</p>
                      <p className="font-semibold text-foreground">{selectedUser.country || "—"}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {adminIds.has(selectedUser.id) ? (
                        <Badge>Admin</Badge>
                      ) : (
                        <Badge variant="secondary">Membre</Badge>
                      )}
                      {badgeIds.has(selectedUser.id) ? (
                        <Badge className="bg-gold text-gold-foreground">Badge doré</Badge>
                      ) : null}
                      <Button size="sm" variant="ghost" onClick={() => setSelectedUserId(null)}>Désélectionner</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="space-y-3">
              {filteredUsers.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center text-muted-foreground">
                    Aucun utilisateur trouvé.
                  </CardContent>
                </Card>
              ) : (
                filteredUsers.map((u) => {
                  const isUserAdmin = adminIds.has(u.id);
                  const hasGoldBadge = badgeIds.has(u.id);
                  return (
                    <Card key={u.id} className={selectedUserId === u.id ? "border-gold" : ""}>
                      <CardContent className="p-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{u.full_name || "(sans nom)"}</h3>
                            <GoldBadge hasGoldBadge={hasGoldBadge} />
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-xs text-muted-foreground">{u.country || "—"}</p>
                            {isUserAdmin && <Badge className="ml-1">Admin</Badge>}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button size="sm" variant="outline" onClick={() => setSelectedUserId(u.id)}>
                            Voir
                          </Button>
                          {u.id === user!.id ? (
                            <span className="text-xs text-muted-foreground">vous</span>
                          ) : (
                            <>
                              {isUserAdmin ? (
                                <Button size="sm" variant="outline" onClick={() => toggleAdmin(u.id, false)}>
                                  <ShieldOff className="w-4 h-4" /> Retirer admin
                                </Button>
                              ) : (
                                <Button size="sm" variant="outline" onClick={() => toggleAdmin(u.id, true)}>
                                  <Shield className="w-4 h-4" /> Promouvoir admin
                                </Button>
                              )}
                              {hasGoldBadge ? (
                                <Button size="sm" variant="outline" onClick={() => toggleGoldBadge(u.id, false)}>
                                  <Award className="w-4 h-4" /> Retirer badge
                                </Button>
                              ) : (
                                <Button size="sm" variant="outline" onClick={() => toggleGoldBadge(u.id, true)}>
                                  <Award className="w-4 h-4" /> Ajouter badge
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>

          <TabsContent value="testimonials" className="space-y-6">
            <TestimonialsAdmin />
          </TabsContent>

          <TabsContent value="stories" className="space-y-6">
            <StoriesAdmin />
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default Admin;
