import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import RichTextEditor from "@/components/RichTextEditor";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";
import {
  Trash2, Shield, ShieldOff, Pencil, X, Award,
  Menu, LayoutGrid, Home as HomeIcon, Newspaper, BookOpen, Tags,
  Quote, Sparkles, MessageSquareText, Users as UsersIcon,
  Crown, Eye, EyeOff, Clock,
  Mail,
  FileText, Clock4, Hash, AlignLeft, Save, SendHorizonal, BookMarked,
} from "lucide-react";
import MediaUpload from "@/components/MediaUpload";
import VideoPlayer from "@/components/VideoPlayer";
import { isPlayableVideoUrl } from "@/lib/video";
import GoldBadge from "@/components/GoldBadge";
import CountrySelect from "@/components/CountrySelect";
import TestimonialsAdmin from "@/components/admin/TestimonialsAdmin";
import StoriesAdmin from "@/components/admin/StoriesAdmin";
import PopupsAdmin from "@/components/admin/PopupsAdmin";
import NewsletterCampaigns from "@/components/admin/NewsletterCampaigns";

type Category = { id: string; name: string; slug: string; description: string | null };
type Teaching = {
  id: string; title: string; excerpt: string | null; content: string;
  cover_image_url: string | null; video_url: string | null; video_thumbnail_url: string | null; audio_url: string | null; country: string | null;
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
  carousel_slides?: { image_url?: string; pretitle?: string; title?: string; description?: string }[];
};

const slugify = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const emptyForm = {
  title: "", excerpt: "", content: "",
  cover: null as string | null, video: null as string | null, videoThumbnail: null as string | null, audio: null as string | null,
  country: "", catId: "", published: true,
};

/* ------------------------------------------------------------------ */
/* Admin navigation — drives the sidebar and the active section       */
/* ------------------------------------------------------------------ */
type SectionKey =
  | "overview" | "home" | "publications" | "teachings"
  | "categories" | "testimonials" | "stories" | "popups" | "users" | "newsletter";

const NAV: { key: SectionKey; label: string; icon: typeof LayoutGrid }[] = [
  { key: "overview", label: "Aperçu", icon: LayoutGrid },
  { key: "home", label: "Contenu d'accueil", icon: HomeIcon },
  { key: "publications", label: "Publications", icon: Newspaper },
  { key: "teachings", label: "Enseignements", icon: BookOpen },
  { key: "categories", label: "Catégories", icon: Tags },
  { key: "testimonials", label: "Témoignages", icon: Quote },
  { key: "stories", label: "Histoires", icon: Sparkles },
  { key: "popups", label: "Pop-ups", icon: MessageSquareText },
  { key: "newsletter", label: "Campagnes", icon: Mail },
  { key: "users", label: "Utilisateurs", icon: UsersIcon },
];

/* ------------------------------------------------------------------ */
/* Small presentational helpers                                       */
/* ------------------------------------------------------------------ */
function StatCard({
  label, value, icon: Icon,
}: { label: string; value: number; icon: typeof LayoutGrid }) {
  return (
    <Card className="border-gold/15 hover:border-gold/30 transition-colors">
      <CardContent className="p-4 md:p-5 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-display text-2xl md:text-[26px] leading-none tabular-nums">
            {value.toLocaleString("fr-FR")}
          </div>
          <div className="text-xs text-muted-foreground mt-1.5">{label}</div>
        </div>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gold/10 text-gold">
          <Icon className="w-4 h-4" />
        </div>
      </CardContent>
    </Card>
  );
}

function PublishBadge({ published }: { published: boolean }) {
  return published ? (
    <Badge className="gap-1 bg-gold/15 text-gold border border-gold/25 hover:bg-gold/15">
      <Eye className="w-3 h-3" /> Publié
    </Badge>
  ) : (
    <Badge variant="secondary" className="gap-1">
      <EyeOff className="w-3 h-3" /> Brouillon
    </Badge>
  );
}

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
    carousel_slides: [],
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
  const [usersPerPage] = useState(10);
  const [displayedUsersCount, setDisplayedUsersCount] = useState(10);

  // --- sidebar shell state ---
  const [activeSection, setActiveSection] = useState<SectionKey>("overview");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

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
        carousel_slides: settings.data.carousel_slides ?? [],
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
      carousel_slides: (homeForm.carousel_slides || []).map((s, idx) => ({
        image_url: s?.image_url || homeForm.carousel_images[idx] || null,
        pretitle: s?.pretitle || null,
        title: s?.title || null,
        description: s?.description || null,
      })),
    };

    const response = homeSettings?.id
      ? await supabase.from("home_settings").update(payload).eq("id", homeSettings.id)
      : await supabase.from("home_settings").insert(payload);

    if (response.error) {
      return toast({ title: "Erreur", description: response.error.message, variant: "destructive" });
    }

    toast({ title: "Paramètres d'accueil enregistrés" });
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
    setActiveSection("teachings");
    setEditingId(t.id);
    setForm({
      title: t.title,
      excerpt: t.excerpt ?? "",
      content: t.content,
      cover: t.cover_image_url,
      video: t.video_url,
      videoThumbnail: t.video_thumbnail_url,
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
      video_thumbnail_url: form.videoThumbnail,
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

  const handleSendNewsletter = async (teachingId: string) => {
    if (!confirm("Envoyer la newsletter pour cet enseignement à tous les membres et abonnés ?")) return;
    toast({ title: "Newsletter", description: "Envoi des emails en cours via Zoho Mail..." });

    try {
      const { data, error } = await supabase.functions.invoke("send-teaching-newsletter", {
        body: { teaching_id: teachingId },
      });

      if (error) throw error;

      toast({
        title: "Newsletter envoyée ! ✉️",
        description: data?.message || "Les abonnés ont reçu l'email.",
      });
    } catch (err: any) {
      toast({
        title: "Erreur d'envoi",
        description: err?.message || "Impossible d'envoyer la newsletter.",
        variant: "destructive",
      });
    }
  };

  const setCarouselImage = (index: number, url: string | null) => {
    const images = [...homeForm.carousel_images];
    images[index] = url ?? "";
    setHomeForm({ ...homeForm, carousel_images: images });
  };

  const setCarouselSlideField = (index: number, field: string, value: string | null) => {
    const slides = (homeForm.carousel_slides || []).slice();
    while (slides.length < homeForm.carousel_images.length) slides.push({});
    slides[index] = { ...(slides[index] || {}), [field]: value ?? undefined, image_url: homeForm.carousel_images[index] || undefined };
    setHomeForm({ ...homeForm, carousel_slides: slides });
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

  // --- derived stats for the Overview section ---
  const publishedCount = useMemo(() => teachings.filter((t) => t.published).length, [teachings]);
  const draftCount = useMemo(() => teachings.filter((t) => !t.published).length, [teachings]);
  const totalComments = useMemo(() => Object.values(commentCounts).reduce((a, b) => a + b, 0), [commentCounts]);

  if (loading || !isAdmin) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Chargement…</div>;
  }

  const activeLabel = NAV.find((n) => n.key === activeSection)?.label ?? "";

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 flex flex-col md:flex-row pt-16 md:pt-20">
        {/* -------------------- SIDEBAR -------------------- */}
        <aside
          className={`fixed md:sticky top-0 md:top-20 left-0 z-40 h-screen md:h-[calc(100vh-5rem)] w-72 md:w-64 shrink-0
            border-r border-gold/15 bg-gradient-to-b from-background to-muted/10
            pt-20 md:pt-6 px-4 pb-6 flex flex-col
            transition-transform duration-300 ease-out
            ${mobileNavOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
        >
          <div className="flex items-center gap-3 px-2 pb-5 mb-2 border-b border-gold/10">
            <div className="relative w-9 h-9 rounded-lg bg-gradient-to-br from-gold to-gold/50 flex items-center justify-center shrink-0 overflow-hidden">
              <Crown className="w-4.5 h-4.5 text-background relative z-10" strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <div className="font-display text-sm tracking-wide leading-tight truncate">MILLENIUM</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Panel administrateur</div>
            </div>
            <Button
              variant="ghost" size="icon" className="ml-auto md:hidden h-8 w-8 bg-card/60 border border-border/60 shadow-sm"
              onClick={() => setMobileNavOpen(false)} aria-label="Fermer le menu"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <nav className="flex flex-col gap-1 flex-1 overflow-y-auto">
            {NAV.map((n) => {
              const Icon = n.icon;
              const isActive = activeSection === n.key;
              return (
                <button
                  key={n.key}
                  onClick={() => { setActiveSection(n.key); setMobileNavOpen(false); }}
                  className={`relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-left transition-colors
                    ${isActive
                      ? "bg-gold/10 text-gold border border-gold/25"
                      : "border border-transparent text-muted-foreground hover:bg-muted/60 hover:text-foreground"}`}
                >
                  {isActive && <span className="absolute -left-4 top-1/2 -translate-y-1/2 h-4 w-[3px] rounded-full bg-gold" />}
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{n.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="mt-4 pt-4 border-t border-gold/10 flex items-center gap-2 px-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold/30 to-muted flex items-center justify-center text-[11px] font-semibold text-gold border border-gold/20 shrink-0">
              {(user?.email?.[0] ?? "A").toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-medium truncate">{user?.email}</div>
              <div className="text-[10px] text-muted-foreground">Administrateur</div>
            </div>
          </div>
        </aside>

        {mobileNavOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/60 md:hidden"
            onClick={() => setMobileNavOpen(false)}
          />
        )}

        {/* -------------------- MAIN COLUMN -------------------- */}
        <main className="flex-1 min-w-0 flex flex-col">
          <div className="sticky top-16 md:top-20 z-20 flex items-center gap-3 border-b border-border/60 bg-background/85 backdrop-blur px-4 md:px-8 py-3">
            <Button
              variant="ghost" size="icon" className="md:hidden h-9 w-9 bg-card/60 border border-border/60 shadow-sm shrink-0"
              onClick={() => setMobileNavOpen(true)} aria-label="Ouvrir le menu"
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div className="min-w-0">
              <h1 className="font-display text-lg md:text-xl font-bold text-foreground truncate">{activeLabel}</h1>
              <p className="hidden sm:flex text-[11px] text-muted-foreground items-center gap-1 mt-0.5">
                <Clock className="w-3 h-3" /> Panel de gestion MILLENIUM
              </p>
            </div>
          </div>

          <div className="flex-1 px-4 md:px-8 py-6 md:py-8 max-w-6xl w-full mx-auto">

            {/* -------------------- OVERVIEW -------------------- */}
            {activeSection === "overview" && (
              <div className="space-y-6">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <h2 className="font-display text-xl font-semibold">Vue d'ensemble</h2>
                    <p className="text-sm text-muted-foreground mt-1">Résumé de l'activité de la plateforme</p>
                  </div>
                  <Button variant="hero" onClick={() => { setActiveSection("teachings"); cancelEdit(); }}>
                    Nouvel enseignement
                  </Button>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                  <StatCard label="Enseignements publiés" value={publishedCount} icon={BookOpen} />
                  <StatCard label="Brouillons en attente" value={draftCount} icon={Pencil} />
                  <StatCard label="Utilisateurs inscrits" value={users.length} icon={UsersIcon} />
                  <StatCard label="Commentaires" value={totalComments} icon={MessageSquareText} />
                </div>

                <div>
                  <h3 className="font-display text-base font-semibold mb-3">Dernières publications</h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {teachings.slice(0, 4).map((t) => (
                      <Card
                        key={t.id}
                        className="border-gold/15 hover:border-gold/30 transition-colors"
                      >
                        <CardContent className="p-4 flex items-start gap-3">
                          {t.cover_image_url ? (
                            <img src={t.cover_image_url} alt="" className="w-14 h-14 rounded-md object-cover shrink-0" />
                          ) : (
                            <div className="w-14 h-14 rounded-md bg-gradient-to-br from-gold/20 to-muted shrink-0" />
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-sm font-semibold truncate">{t.title}</h4>
                              <PublishBadge published={t.published} />
                            </div>
                            <p className="text-xs text-muted-foreground truncate mt-1">{t.excerpt || "Pas de description"}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {teachings.length === 0 && (
                      <p className="text-sm text-muted-foreground">Aucun enseignement pour le moment.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* -------------------- HOME (site homepage settings) -------------------- */}
            {activeSection === "home" && (
              <Card className="border-gold/20">
                <CardHeader>
                  <CardTitle>Contenu d'accueil</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={saveHomeSettings} className="space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      <div>
                        <Label>URL vidéo (YouTube ou Bunny)</Label>
                        <Input
                          value={homeForm.youtube_url}
                          onChange={(e) => setHomeForm({ ...homeForm, youtube_url: e.target.value })}
                          placeholder="https://youtu.be/... ou https://iframe.mediadelivery.net/embed/..."
                        />
                      </div>
                      <div>
                        <Label>Durée d'affichage (jours)</Label>
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

                    {isPlayableVideoUrl(homeForm.youtube_url) && (
                      <div className="space-y-2">
                        <Label>Aperçu de la vidéo à la Une</Label>
                        <VideoPlayer
                          src={homeForm.youtube_url.trim()}
                          title="Vidéo à la Une"
                          lazy={false}
                        />
                      </div>
                    )}

                    <div className="grid gap-4 sm:grid-cols-2">
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
                          placeholder="Entrez le texte qui défilera en haut de l'accueil"
                          rows={3}
                        />
                        <p className="text-xs text-muted-foreground mt-2">
                          Le texte s'affichera en bandeau défilant en haut de la page d'accueil.
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
                      <h3 className="font-semibold text-foreground mb-4">Carrousel d'images</h3>
                      <div className="space-y-4">
                        {homeForm.carousel_images.map((image, index) => (
                          <div key={index} className="p-3 border rounded-lg grid gap-4 md:grid-cols-[1fr,auto] items-start">
                            <div>
                              <Label>Image {index + 1}</Label>
                              <MediaUpload
                                value={image}
                                onChange={(url) => {
                                  setCarouselImage(index, url);
                                  setCarouselSlideField(index, 'image_url', url);
                                }}
                                accept="image"
                              />

                              <div className="mt-3 grid gap-2">
                                <div>
                                  <Label>Pré-titre</Label>
                                  <Input
                                    value={homeForm.carousel_slides?.[index]?.pretitle || ''}
                                    onChange={(e) => setCarouselSlideField(index, 'pretitle', e.target.value)}
                                  />
                                </div>
                                <div>
                                  <Label>Titre</Label>
                                  <Input
                                    value={homeForm.carousel_slides?.[index]?.title || ''}
                                    onChange={(e) => setCarouselSlideField(index, 'title', e.target.value)}
                                  />
                                </div>
                                <div>
                                  <Label>Description</Label>
                                  <Textarea
                                    rows={2}
                                    value={homeForm.carousel_slides?.[index]?.description || ''}
                                    onChange={(e) => setCarouselSlideField(index, 'description', e.target.value)}
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="flex md:flex-col items-end gap-2">
                              <Button type="button" variant="destructive" size="sm" onClick={() => removeCarouselImage(index)} className="h-fit">
                                <Trash2 className="w-4 h-4" /> Supprimer
                              </Button>
                            </div>
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

                    <Button type="submit" variant="hero">Enregistrer l'accueil</Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* -------------------- PUBLICATIONS -------------------- */}
            {activeSection === "publications" && (
              <div className="space-y-6">
                <Card className="border-gold/20">
                  <CardHeader>
                    <CardTitle>Gestion des publications</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

                <div className="space-y-3">
                  {filteredPublications.length === 0 ? (
                    <Card>
                      <CardContent className="p-6 text-center text-muted-foreground">
                        Aucune publication ne correspond à vos filtres.
                      </CardContent>
                    </Card>
                  ) : (
                    filteredPublications.map((t) => (
                      <Card
                        key={t.id}
                        className="border-gold/10 hover:border-gold/25 transition-colors"
                      >
                        <CardContent className="space-y-4 p-4">
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div className="min-w-0">
                              <h3 className="font-display text-lg font-semibold truncate">{t.title}</h3>
                              <p className="text-sm text-muted-foreground truncate">{t.excerpt ?? "Pas de description"}</p>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                              <PublishBadge published={t.published} />
                              {commentCounts[t.id] ? <Badge variant="outline">{commentCounts[t.id]} commentaire{commentCounts[t.id] === 1 ? "" : "s"}</Badge> : <Badge variant="outline">0 commentaire</Badge>}
                              {t.category_id && <Badge variant="outline">{categories.find((c) => c.id === t.category_id)?.name ?? "Catégorie inconnue"}</Badge>}
                            </div>
                          </div>

                          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 text-xs text-muted-foreground">
                            <span>Auteur : {getAuthorName(t.author_id)}</span>
                            <span>Créé le : {new Date(t.created_at).toLocaleDateString("fr-FR")}</span>
                            <span>Pays : {t.country || "—"}</span>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <Button size="sm" variant="outline" onClick={() => startEdit(t)} className="text-xs">Modifier</Button>
                            <Button size="sm" variant="outline" onClick={() => loadTeachingComments(t)} className="text-xs">Voir commentaires</Button>
                            {t.published && (
                              <Button size="sm" variant="outline" onClick={() => handleSendNewsletter(t.id)} className="text-xs border-gold/40 text-gold hover:bg-gold/10">
                                ✉️ Envoyer Newsletter
                              </Button>
                            )}
                            <Button size="sm" variant="ghost" onClick={() => togglePublished(t)} className="text-xs">
                              {t.published ? "Dépublier" : "Publier"}
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => deleteTeaching(t.id)} className="text-xs">Supprimer</Button>
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
                              <div key={comment.id} className="rounded-2xl border border-border p-4">
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
              </div>
            )}

            {/* -------------------- TEACHINGS -------------------- */}
            {activeSection === "teachings" && (
              <div className="space-y-6">

                {/* ── Editor card ── */}
                <div className="rounded-2xl border border-gold/20 bg-card shadow-sm overflow-hidden">

                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 bg-gradient-to-r from-gold/5 via-background to-background px-5 py-4">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold/15 shrink-0">
                        <BookMarked className="h-4 w-4 text-gold" />
                      </div>
                      <div className="min-w-0">
                        <h2 className="font-display font-semibold text-sm">
                          {editingId ? "Modifier l'enseignement" : "Nouvel enseignement"}
                        </h2>
                        <p className="text-[11px] text-muted-foreground">
                          {editingId ? "Mettez à jour le contenu et les métadonnées" : "Rédigez et publiez un nouvel enseignement"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {editingId && (
                        <Button size="sm" variant="ghost" onClick={cancelEdit} className="h-8 gap-1.5">
                          <X className="w-3.5 h-3.5" /> Annuler
                        </Button>
                      )}
                      <Button
                        type="button"
                        variant="hero"
                        size="sm"
                        disabled={submitting}
                        onClick={(e) => submitTeaching(e as unknown as React.FormEvent)}
                        className="h-8 gap-1.5"
                      >
                        {submitting ? (
                          <><Clock4 className="w-3.5 h-3.5 animate-spin" /> Traitement…</>
                        ) : editingId ? (
                          <><Save className="w-3.5 h-3.5" /> Enregistrer</>
                        ) : (
                          <><SendHorizonal className="w-3.5 h-3.5" /> Publier</>
                        )}
                      </Button>
                    </div>
                  </div>

                  <form onSubmit={submitTeaching}>
                    <div className="grid lg:grid-cols-[1fr_300px] divide-y lg:divide-y-0 lg:divide-x divide-border/60">

                      {/* ── LEFT: content ── */}
                      <div className="flex flex-col gap-5 p-5">

                        {/* Title */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <Label className="flex items-center gap-1.5 text-sm font-semibold">
                              <FileText className="w-3.5 h-3.5 text-gold" /> Titre *
                            </Label>
                            <span className={`text-[11px] tabular-nums ${
                              form.title.length > 180 ? "text-red-400" : "text-muted-foreground"
                            }`}>{form.title.length}/200</span>
                          </div>
                          <input
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                            required
                            maxLength={200}
                            placeholder="Titre de l'enseignement…"
                            className="w-full bg-transparent border-0 border-b border-border/60 py-2 px-0 text-xl font-display font-bold placeholder:text-muted-foreground/40 focus:outline-none focus:border-gold transition-colors"
                          />
                        </div>

                        {/* Excerpt */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <Label className="flex items-center gap-1.5 text-sm font-medium">
                              <AlignLeft className="w-3.5 h-3.5 text-muted-foreground" /> Extrait / Résumé
                            </Label>
                            <span className={`text-[11px] tabular-nums ${
                              form.excerpt.length > 270 ? "text-amber-400" : "text-muted-foreground"
                            }`}>{form.excerpt.length}/300</span>
                          </div>
                          <textarea
                            value={form.excerpt}
                            onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                            maxLength={300}
                            rows={2}
                            placeholder="Courte description affichée dans les listes et aperçus…"
                            className="w-full resize-none rounded-xl border border-border/60 bg-muted/30 px-3 py-2 text-sm placeholder:text-muted-foreground/40 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all"
                          />
                        </div>

                        {/* Rich text editor */}
                        <div className="space-y-1.5">
                          <Label className="flex items-center gap-1.5 text-sm font-semibold">
                            <Hash className="w-3.5 h-3.5 text-gold" /> Contenu *
                          </Label>
                          <RichTextEditor
                            value={form.content}
                            onChange={(content) => setForm({ ...form, content })}
                            placeholder="Commencez à rédiger votre enseignement ici…"
                          />
                        </div>
                      </div>

                      {/* ── RIGHT: metadata sidebar ── */}
                      <div className="flex flex-col gap-0 divide-y divide-border/40">

                        {/* Status */}
                        <div className="p-4 space-y-3">
                          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Statut</p>
                          <div className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/20 px-3 py-2.5">
                            <div className="flex items-center gap-2">
                              {form.published ? (
                                <Eye className="w-4 h-4 text-gold" />
                              ) : (
                                <EyeOff className="w-4 h-4 text-muted-foreground" />
                              )}
                              <span className="text-sm font-medium">
                                {form.published ? "Publié" : "Brouillon"}
                              </span>
                            </div>
                            <Switch
                              checked={form.published}
                              onCheckedChange={(v) => setForm({ ...form, published: v })}
                              id="pub-sidebar"
                            />
                          </div>
                        </div>

                        {/* Category */}
                        <div className="p-4 space-y-2">
                          <Label className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Catégorie</Label>
                          <Select value={form.catId} onValueChange={(v) => setForm({ ...form, catId: v })}>
                            <SelectTrigger className="h-9 text-sm">
                              <SelectValue placeholder="Sans catégorie" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((c) => (
                                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Country */}
                        <div className="p-4 space-y-2">
                          <Label className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Pays</Label>
                          <CountrySelect
                            value={form.country}
                            onChange={(v) => setForm({ ...form, country: v })}
                            placeholder="Sélectionner…"
                          />
                        </div>

                        {/* Cover image */}
                        <div className="p-4 space-y-2">
                          <Label className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Image de couverture</Label>
                          <MediaUpload
                            value={form.cover}
                            onChange={(v) => setForm({ ...form, cover: v })}
                            accept="image"
                          />
                        </div>

                        {/* Video */}
                        <div className="p-4 space-y-2">
                          <Label className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Vidéo (optionnel)</Label>
                          <MediaUpload
                            value={form.video}
                            onChange={(v) => setForm({ ...form, video: v })}
                            accept="video"
                          />
                        </div>

                        {/* Video thumbnail */}
                        <div className="p-4 space-y-2">
                          <Label className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Miniature vidéo (optionnel)</Label>
                          <MediaUpload
                            value={form.videoThumbnail}
                            onChange={(v) => setForm({ ...form, videoThumbnail: v })}
                            accept="image"
                            label="Image de rendu pour l’aperçu de la vidéo"
                          />
                        </div>

                        {/* Audio */}
                        <div className="p-4 space-y-2">
                          <Label className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Audio (optionnel)</Label>
                          <MediaUpload
                            value={form.audio}
                            onChange={(v) => setForm({ ...form, audio: v })}
                            accept="audio"
                          />
                        </div>

                        {/* Author info */}
                        <div className="mt-auto p-4 bg-muted/10">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span>Auteur : {user?.email?.split("@")[0]}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>

                {/* ── Teaching list ── */}
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground px-1">
                    Tous les enseignements ({teachings.length})
                  </h3>
                  {teachings.map((t) => (
                    <Card
                      key={t.id}
                      className={`${
                        editingId === t.id ? "border-gold ring-1 ring-gold/30" : "border-gold/10"
                      } hover:border-gold/25 transition-colors`}
                    >
                      <CardContent className="p-3 md:p-4">
                        <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr_auto] gap-3 md:gap-4 items-start">
                          {t.cover_image_url && (
                            <img src={t.cover_image_url} alt="" className="w-20 h-14 object-cover rounded-lg shrink-0 sm:order-1" />
                          )}
                          <div className="flex-1 min-w-0 sm:order-2">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <h3 className="font-display font-semibold truncate text-sm">{t.title}</h3>
                              <PublishBadge published={t.published} />
                              {t.video_url && <Badge variant="outline" className="text-xs">Vidéo</Badge>}
                              {t.audio_url && <Badge variant="outline" className="text-xs">Audio</Badge>}
                            </div>
                            <p className="text-xs text-muted-foreground truncate">{t.excerpt}</p>
                            {commentCounts[t.id] > 0 && (
                              <p className="text-[11px] text-muted-foreground/70 mt-0.5">
                                {commentCounts[t.id]} commentaire{commentCounts[t.id] > 1 ? "s" : ""}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-1 shrink-0 sm:order-3">
                            <Switch checked={t.published} onCheckedChange={() => togglePublished(t)} className="scale-75" />
                            <Button size="icon" variant="ghost" onClick={() => startEdit(t)} aria-label="Modifier" className="h-8 w-8">
                              <Pencil className="w-3 h-3" />
                            </Button>
                            <Button size="icon" variant="ghost" onClick={() => loadTeachingComments(t)} aria-label="Commentaires" className="h-8 w-8">
                              <MessageSquareText className="w-3 h-3" />
                            </Button>
                            <Button size="icon" variant="ghost" onClick={() => deleteTeaching(t.id)} aria-label="Supprimer" className="h-8 w-8 text-destructive/70 hover:text-destructive">
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* -------------------- CATEGORIES -------------------- */}
            {activeSection === "categories" && (
              <div className="space-y-6">
                <Card className="border-gold/20">
                  <CardHeader><CardTitle>Nouvelle catégorie</CardTitle></CardHeader>
                  <CardContent>
                    <form onSubmit={createCategory} className="space-y-3">
                      <div><Label>Nom</Label><Input value={catName} onChange={(e) => setCatName(e.target.value)} required maxLength={50} /></div>
                      <div><Label>Description</Label><Input value={catDesc} onChange={(e) => setCatDesc(e.target.value)} maxLength={200} /></div>
                      <Button type="submit" variant="hero">Créer</Button>
                    </form>
                  </CardContent>
                </Card>

                <div className="space-y-3">
                  {categories.map((c) => (
                    <Card
                      key={c.id}
                      className="border-gold/10 hover:border-gold/25 transition-colors"
                    >
                      <CardContent className="p-3 md:p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="font-semibold truncate">{c.name}</h3>
                          <p className="text-xs text-muted-foreground">{c.description}</p>
                        </div>
                        <Button size="icon" variant="ghost" onClick={() => deleteCategory(c.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* -------------------- NEWSLETTER -------------------- */}
            {activeSection === "newsletter" && (
              <NewsletterCampaigns />
            )}

            {/* -------------------- USERS -------------------- */}
            {activeSection === "users" && (
              <div className="space-y-4">
                <Card className="border-gold/20">
                  <CardHeader>
                    <CardTitle className="text-lg md:text-2xl">Utilisateurs inscrits</CardTitle>
                    <p className="text-sm text-muted-foreground mt-2">Total : {filteredUsers.length} utilisateur{filteredUsers.length !== 1 ? "s" : ""}</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      <div className="md:col-span-2 lg:col-span-2">
                        <Label>Rechercher un utilisateur</Label>
                        <Input
                          value={userQuery}
                          onChange={(e) => {
                            setUserQuery(e.target.value);
                            setDisplayedUsersCount(10);
                          }}
                          placeholder="Nom, prénom ou ID"
                          className="rounded-full"
                        />
                      </div>
                      <div className="flex gap-2 items-end">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setUserQuery("");
                            setDisplayedUsersCount(10);
                          }}
                          className="flex-1"
                        >
                          Effacer
                        </Button>
                        <Button
                          type="button"
                          variant="hero"
                          onClick={() => setSelectedUserId(null)}
                          className="flex-1"
                        >
                          Tous
                        </Button>
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
                          <div className="flex items-center gap-2 flex-wrap">
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

                <div className="space-y-2">
                  {filteredUsers.length === 0 ? (
                    <Card>
                      <CardContent className="p-6 text-center text-muted-foreground">
                        Aucun utilisateur trouvé.
                      </CardContent>
                    </Card>
                  ) : (
                    <>
                      {filteredUsers.slice(0, displayedUsersCount).map((u) => {
                        const isUserAdmin = adminIds.has(u.id);
                        const hasGoldBadge = badgeIds.has(u.id);
                        return (
                          <Card
                            key={u.id}
                            className={`${selectedUserId === u.id ? "border-gold" : "border-gold/10"} hover:border-gold/25 transition-colors`}
                          >
                            <CardContent className="p-3 md:p-4">
                              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 md:gap-4">
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="font-semibold truncate">{u.full_name || "(sans nom)"}</h3>
                                    <GoldBadge hasGoldBadge={hasGoldBadge} />
                                  </div>
                                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                                    <p className="text-xs text-muted-foreground">{u.country || "—"}</p>
                                    {isUserAdmin && <Badge className="text-xs">Admin</Badge>}
                                  </div>
                                </div>
                                <div className="flex flex-wrap gap-2 justify-start md:justify-end">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setSelectedUserId(u.id)}
                                    className="text-xs"
                                  >
                                    Voir
                                  </Button>
                                  {u.id === user!.id ? (
                                    <span className="text-xs text-muted-foreground flex items-center">vous</span>
                                  ) : (
                                    <>
                                      {isUserAdmin ? (
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => toggleAdmin(u.id, false)}
                                          className="text-xs"
                                        >
                                          <ShieldOff className="w-3 h-3" /> Retirer
                                        </Button>
                                      ) : (
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => toggleAdmin(u.id, true)}
                                          className="text-xs"
                                        >
                                          <Shield className="w-3 h-3" /> Promouvoir
                                        </Button>
                                      )}
                                      {hasGoldBadge ? (
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => toggleGoldBadge(u.id, false)}
                                          className="text-xs"
                                        >
                                          <Award className="w-3 h-3" /> Retirer
                                        </Button>
                                      ) : (
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => toggleGoldBadge(u.id, true)}
                                          className="text-xs"
                                        >
                                          <Award className="w-3 h-3" /> Ajouter
                                        </Button>
                                      )}
                                    </>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}

                      {displayedUsersCount < filteredUsers.length && (
                        <div className="flex justify-center pt-4">
                          <Button
                            variant="outline"
                            onClick={() => setDisplayedUsersCount(displayedUsersCount + usersPerPage)}
                            className="w-full md:w-auto"
                          >
                            Charger plus ({displayedUsersCount} / {filteredUsers.length})
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {activeSection === "testimonials" && <TestimonialsAdmin />}
            {activeSection === "stories" && <StoriesAdmin />}
            {activeSection === "popups" && <PopupsAdmin />}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default Admin;