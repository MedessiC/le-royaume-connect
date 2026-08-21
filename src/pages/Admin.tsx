import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import RichTextEditor from "@/components/RichTextEditor";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";
import {
  Trash2, Shield, ShieldOff, Pencil, X,
  Menu, LayoutGrid, Home as HomeIcon, BookOpen, Tags,
  Quote, ScrollText, MessageSquareText, Users as UsersIcon,
  Eye, EyeOff, Clock, Mail, Search, Plus, Check, FileDown,
  ArrowLeft, RefreshCw, Image as ImageIcon, Video, Music,
  Send, Layers, CornerDownRight, CheckCircle2, Save, RotateCcw
} from "lucide-react";
import MediaUpload from "@/components/MediaUpload";
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
/* Navigation sections                                                */
/* ------------------------------------------------------------------ */
type SectionKey =
  | "overview" | "teachings" | "home"
  | "categories" | "testimonials" | "stories" | "popups" | "users" | "newsletter";

const NAV: { key: SectionKey; label: string; icon: typeof LayoutGrid }[] = [
  { key: "overview", label: "Aperçu & Stats", icon: LayoutGrid },
  { key: "teachings", label: "Enseignements", icon: BookOpen },
  { key: "home", label: "Page d'Accueil", icon: HomeIcon },
  { key: "categories", label: "Catégories", icon: Tags },
  { key: "testimonials", label: "Témoignages", icon: Quote },
  { key: "stories", label: "Histoires", icon: ScrollText },
  { key: "popups", label: "Pop-ups & Annonces", icon: MessageSquareText },
  { key: "newsletter", label: "Newsletter", icon: Mail },
  { key: "users", label: "Membres & Rôles", icon: UsersIcon },
];

function StatCard({
  label, value, icon: Icon,
}: { label: string; value: number; icon: typeof LayoutGrid }) {
  return (
    <Card className="border-gold/20 bg-card/60 backdrop-blur-sm">
      <CardContent className="p-4 md:p-5 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-display text-2xl md:text-3xl font-bold leading-none tabular-nums text-foreground">
            {value.toLocaleString("fr-FR")}
          </div>
          <div className="text-xs text-muted-foreground mt-1.5 font-medium">{label}</div>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold/10 text-gold border border-gold/20">
          <Icon className="w-5 h-5" />
        </div>
      </CardContent>
    </Card>
  );
}

function PublishBadge({ published }: { published: boolean }) {
  return published ? (
    <Badge className="gap-1 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20">
      <Eye className="w-3 h-3" /> Publié
    </Badge>
  ) : (
    <Badge variant="secondary" className="gap-1 bg-amber-500/15 text-amber-400 border border-amber-500/30">
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
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const DRAFT_KEY = "admin_teaching_draft_v1";
  const [draftSavedAt, setDraftSavedAt] = useState<string | null>(null);
  const [draftDetected, setDraftDetected] = useState<any | null>(null);

  // Sauvegarde automatique du brouillon dans localStorage
  useEffect(() => {
    if (!isEditorOpen) return;
    const hasValue = Boolean(
      form.title.trim() ||
      form.excerpt.trim() ||
      form.content.trim() ||
      form.cover ||
      form.video ||
      form.audio
    );

    if (hasValue) {
      const now = new Date().toISOString();
      const payload = {
        form,
        editingId,
        savedAt: now,
      };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(payload));
      setDraftSavedAt(now);
    }
  }, [form, editingId, isEditorOpen]);

  // Alerte si tentative de fermer/recharger la page en pleine rédaction
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isEditorOpen && (form.title.trim() || form.content.trim())) {
        e.preventDefault();
        e.returnValue = "Un enseignement est en cours de rédaction. Voulez-vous vraiment quitter ?";
        return e.returnValue;
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isEditorOpen, form.title, form.content]);

  const checkForDraft = () => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.form && (parsed.form.title || parsed.form.content || parsed.form.excerpt)) {
          setDraftDetected(parsed);
          return true;
        }
      }
    } catch {}
    setDraftDetected(null);
    return false;
  };

  const restoreDraft = () => {
    if (draftDetected?.form) {
      setForm(draftDetected.form);
      setEditingId(draftDetected.editingId || null);
      toast({ title: "Brouillon restauré ✓", description: "Votre rédaction a été récupérée avec succès." });
    }
    setDraftDetected(null);
  };

  const discardDraft = () => {
    localStorage.removeItem(DRAFT_KEY);
    setDraftDetected(null);
    setDraftSavedAt(null);
    toast({ title: "Brouillon effacé" });
  };

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
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});
  const [selectedTeaching, setSelectedTeaching] = useState<Teaching | null>(null);
  const [selectedTeachingComments, setSelectedTeachingComments] = useState<TeachingComment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [userQuery, setUserQuery] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [displayedUsersCount, setDisplayedUsersCount] = useState(10);

  // Shell state
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
    if (profs.data) setUsers(profs.data);
    if (roles.data) setAdminIds(new Set(roles.data.map((r) => r.user_id)));
    if (profs.data) setBadgeIds(new Set(profs.data.filter((u) => u.has_gold_badge).map((u) => u.id)));
    if (settings.data) {
      setHomeSettings(settings.data);
      const parsedSlides = Array.isArray(settings.data.carousel_slides)
        ? (settings.data.carousel_slides as { image_url?: string; pretitle?: string; title?: string; description?: string }[])
        : [];
      setHomeForm({
        youtube_url: settings.data.youtube_url ?? "",
        youtube_duration_days: settings.data.youtube_duration_days ?? 10,
        active: settings.data.active ?? true,
        tiktok_url: settings.data.tiktok_url ?? "",
        youtube_channel_url: settings.data.youtube_channel_url ?? "",
        whatsapp_url: settings.data.whatsapp_url ?? "",
        facebook_url: settings.data.facebook_url ?? "",
        live_enabled: settings.data.live_enabled ?? false,
        live_url: settings.data.live_url ?? "",
        marquee_text: settings.data.marquee_text ?? "",
        marquee_speed: settings.data.marquee_speed ?? 45,
        carousel_images: settings.data.carousel_images ?? [],
        carousel_slides: parsedSlides,
      });
    }
    if (commentRows.data) {
      const counts: Record<string, number> = {};
      commentRows.data.forEach((row) => {
        counts[row.teaching_id] = (counts[row.teaching_id] || 0) + 1;
      });
      setCommentCounts(counts);
    }
  };

  useEffect(() => {
    if (isAdmin) refresh();
  }, [isAdmin]);

  const publishedCount = useMemo(() => teachings.filter((t) => t.published).length, [teachings]);
  const draftCount = useMemo(() => teachings.filter((t) => !t.published).length, [teachings]);
  const totalComments = useMemo(() => Object.values(commentCounts).reduce((acc, c) => acc + c, 0), [commentCounts]);

  const authorsMap = useMemo(() => {
    const map = new Map<string, string>();
    users.forEach((u) => {
      if (u.full_name) map.set(u.id, u.full_name);
    });
    return map;
  }, [users]);

  const getAuthorName = (authorId: string | null) => {
    if (!authorId) return "Anonyme";
    return authorsMap.get(authorId) || "Administrateur";
  };

  const filteredTeachings = useMemo(() => {
    return teachings.filter((t) => {
      const query = publicationQuery.trim().toLowerCase();
      const matchesQuery =
        !query ||
        t.title.toLowerCase().includes(query) ||
        (t.excerpt && t.excerpt.toLowerCase().includes(query)) ||
        (t.country && t.country.toLowerCase().includes(query));

      const matchesStatus =
        publicationStatusFilter === "all" ||
        (publicationStatusFilter === "published" ? t.published : !t.published);

      const matchesCategory =
        publicationCategoryFilter === "all" || t.category_id === publicationCategoryFilter;

      return matchesQuery && matchesStatus && matchesCategory;
    });
  }, [teachings, publicationQuery, publicationStatusFilter, publicationCategoryFilter]);

  const toggleAdminRole = async (userId: string) => {
    const isCurrentlyAdmin = adminIds.has(userId);
    if (isCurrentlyAdmin) {
      await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", "admin");
    } else {
      await supabase.from("user_roles").insert({ user_id: userId, role: "admin" });
    }
    refresh();
  };

  const toggleGoldBadge = async (userId: string) => {
    const next = !badgeIds.has(userId);
    await supabase.from("profiles").update({ has_gold_badge: next }).eq("id", userId);
    refresh();
  };

  const saveHomeSettings = async () => {
    const payload = {
      youtube_url: homeForm.youtube_url || null,
      youtube_duration_days: homeForm.youtube_duration_days,
      active: homeForm.active,
      tiktok_url: homeForm.tiktok_url || null,
      youtube_channel_url: homeForm.youtube_channel_url || null,
      whatsapp_url: homeForm.whatsapp_url || null,
      facebook_url: homeForm.facebook_url || null,
      live_enabled: homeForm.live_enabled,
      live_url: homeForm.live_url || null,
      marquee_text: homeForm.marquee_text || null,
      marquee_speed: homeForm.marquee_speed,
      carousel_images: homeForm.carousel_images.filter(Boolean),
      carousel_slides: (homeForm.carousel_slides || []).filter((s) => s.image_url),
    };
    if (homeSettings) {
      await supabase.from("home_settings").update(payload).eq("id", homeSettings.id);
    } else {
      await supabase.from("home_settings").insert(payload);
    }
    toast({ title: "Paramètres enregistrés ✓" });
    refresh();
  };

  const submitCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;
    const slug = slugify(catName);
    const { error } = await supabase
      .from("categories")
      .insert({ name: catName.trim(), slug, description: catDesc.trim() || null });
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Catégorie ajoutée ✓" });
      setCatName("");
      setCatDesc("");
      refresh();
    }
  };

  const deleteCategory = async (id: string) => {
    if (!confirm("Supprimer cette catégorie ?")) return;
    await supabase.from("categories").delete().eq("id", id);
    refresh();
  };

  const startCreateTeaching = () => {
    setEditingId(null);
    setForm(emptyForm);
    setIsEditorOpen(true);
    checkForDraft();
  };

  const startEditTeaching = (t: Teaching) => {
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
    setIsEditorOpen(true);
    checkForDraft();
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
    setIsEditorOpen(false);
    setDraftDetected(null);
  };

  const submitTeaching = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const titleTrimmed = form.title.trim();
    const contentTrimmed = form.content.trim();

    if (!titleTrimmed) {
      toast({ title: "Champ obligatoire", description: "Le titre est requis.", variant: "destructive" });
      setSubmitting(false);
      return;
    }

    if (!contentTrimmed) {
      toast({ title: "Champ obligatoire", description: "Le contenu de l'enseignement est requis.", variant: "destructive" });
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
        if (error) throw error;
        toast({ title: "Enseignement mis à jour ✓" });
      } else {
        const { error } = await supabase.from("teachings").insert({ ...payload, author_id: user!.id });
        if (error) throw error;
        toast({ title: "Enseignement publié ✓" });
      }
      localStorage.removeItem(DRAFT_KEY);
      setDraftSavedAt(null);
      setDraftDetected(null);
      setSubmitting(false);
      cancelEdit();
      refresh();
    } catch (err: any) {
      toast({ title: "Erreur lors de la sauvegarde", description: err.message, variant: "destructive" });
      setSubmitting(false);
    }
  };

  const togglePublished = async (t: Teaching) => {
    await supabase.from("teachings").update({ published: !t.published }).eq("id", t.id);
    refresh();
  };

  const deleteTeaching = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer cet enseignement ?")) return;
    await supabase.from("teachings").delete().eq("id", id);
    if (editingId === id) cancelEdit();
    refresh();
  };

  const handleSendNewsletter = async (teachingId: string) => {
    if (!confirm("Envoyer la newsletter pour cet enseignement à tous les membres et abonnés ?")) return;
    toast({ title: "Newsletter", description: "Envoi des e-mails en cours via Zoho Mail..." });

    try {
      const { data, error } = await supabase.functions.invoke("send-teaching-newsletter", {
        body: { teaching_id: teachingId },
      });

      if (error) throw error;

      if (data?.success === false) {
        toast({
          title: "Erreur d'envoi",
          description: `${data.error || "Impossible d'envoyer."} ${data.details || ""}`,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Newsletter envoyée ! ✉️",
        description: data?.message || "Les abonnés ont reçu l'e-mail.",
      });
    } catch (err: any) {
      toast({
        title: "Erreur d'envoi",
        description: err?.message || "Impossible d'envoyer la newsletter.",
        variant: "destructive",
      });
    }
  };

  const loadTeachingComments = async (teaching: Teaching) => {
    setSelectedTeaching(teaching);
    setLoadingComments(true);
    const { data } = await supabase
      .from("teaching_comments")
      .select("*")
      .eq("teaching_id", teaching.id)
      .order("created_at", { ascending: false });
    setSelectedTeachingComments(data || []);
    setLoadingComments(false);
  };

  const deleteComment = async (commentId: string) => {
    if (!confirm("Supprimer ce commentaire ?")) return;
    await supabase.from("teaching_comments").delete().eq("id", commentId);
    if (selectedTeaching) loadTeachingComments(selectedTeaching);
    refresh();
  };

  const filteredUsers = useMemo(() => {
    const query = userQuery.trim().toLowerCase();
    if (!query) return users;
    return users.filter(
      (u) =>
        (u.full_name && u.full_name.toLowerCase().includes(query)) ||
        (u.country && u.country.toLowerCase().includes(query)) ||
        u.id.toLowerCase().includes(query)
    );
  }, [users, userQuery]);

  const activeLabel = NAV.find((n) => n.key === activeSection)?.label ?? "Administration";

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <RefreshCw className="w-8 h-8 text-gold animate-spin" />
            <p className="text-sm text-muted-foreground font-medium">Chargement du panel d'administration...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <div className="flex-1 flex text-foreground">
        {/* -------------------- SIDEBAR -------------------- */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-border/80 bg-card/95 backdrop-blur-xl p-5 transition-transform duration-300 md:static md:translate-x-0 flex flex-col gap-6 ${
            mobileNavOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center gap-3 px-2 pt-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/15 text-gold border border-gold/30">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="font-display text-sm font-bold tracking-wider text-foreground">MILLENIUM</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Administration</div>
            </div>
            <Button
              variant="ghost" size="icon" className="ml-auto md:hidden h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={() => setMobileNavOpen(false)} aria-label="Fermer"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <nav className="flex flex-col gap-1 flex-1 overflow-y-auto pr-1">
            {NAV.map((n) => {
              const Icon = n.icon;
              const isActive = activeSection === n.key;
              return (
                <button
                  key={n.key}
                  onClick={() => {
                    setActiveSection(n.key);
                    setMobileNavOpen(false);
                  }}
                  className={`group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-bold text-left transition-all ${
                    isActive
                      ? "bg-gold/15 text-gold border border-gold/30 shadow-sm"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground border border-transparent"
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 transition-transform ${isActive ? "scale-110" : "group-hover:scale-105"}`} />
                  <span className="truncate">{n.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="pt-4 border-t border-border/60 flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-xl bg-gold/15 text-gold flex items-center justify-center text-xs font-extrabold border border-gold/25 shrink-0">
              {(user?.email?.[0] ?? "A").toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold truncate text-foreground">{user?.email}</div>
              <div className="text-[10px] text-muted-foreground font-medium">Administrateur Général</div>
            </div>
          </div>
        </aside>

        {mobileNavOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden"
            onClick={() => setMobileNavOpen(false)}
          />
        )}

        {/* -------------------- MAIN CONTENT COLUMN -------------------- */}
        <main className="flex-1 min-w-0 flex flex-col">
          {/* Header Bar */}
          <div className="sticky top-16 md:top-20 z-20 flex items-center justify-between border-b border-border/80 bg-background/90 backdrop-blur px-4 md:px-8 py-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost" size="icon" className="md:hidden h-9 w-9 border border-border"
                onClick={() => setMobileNavOpen(true)} aria-label="Ouvrir le menu"
              >
                <Menu className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="font-display text-lg md:text-xl font-bold text-foreground">{activeLabel}</h1>
                <p className="text-[11px] text-muted-foreground hidden sm:block">
                  Gestion éditoriale et contenu du Ministère
                </p>
              </div>
            </div>

            {activeSection === "teachings" && !isEditorOpen && (
              <Button variant="hero" size="sm" onClick={startCreateTeaching} className="gap-2 text-xs font-bold">
                <Plus className="w-4 h-4" />
                Nouveau Enseignement
              </Button>
            )}
          </div>

          <div className="flex-1 px-4 md:px-8 py-6 max-w-6xl w-full mx-auto space-y-6">

            {/* -------------------- OVERVIEW -------------------- */}
            {activeSection === "overview" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
                  <div>
                    <h2 className="font-display text-xl font-bold text-foreground">Tableau de bord</h2>
                    <p className="text-xs text-muted-foreground">Indicateurs clés et activités récents</p>
                  </div>
                  <Button variant="hero" size="sm" onClick={() => { setActiveSection("teachings"); startCreateTeaching(); }}>
                    <Plus className="w-4 h-4 mr-1.5" /> Rédaction rapide
                  </Button>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard label="Publications publiées" value={publishedCount} icon={BookOpen} />
                  <StatCard label="Brouillons d'enseignement" value={draftCount} icon={Pencil} />
                  <StatCard label="Membres inscrits" value={users.length} icon={UsersIcon} />
                  <StatCard label="Commentaires reçus" value={totalComments} icon={MessageSquareText} />
                </div>

                <Card className="border-gold/20 bg-card/60">
                  <CardHeader>
                    <CardTitle className="text-base font-bold">Dernières Publications</CardTitle>
                    <CardDescription>Aperçu des 4 plus récents enseignements rédigés</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid gap-3 sm:grid-cols-2">
                      {teachings.slice(0, 4).map((t) => (
                        <div key={t.id} className="flex items-start gap-3 p-3.5 rounded-2xl border border-border/70 bg-background/60">
                          {t.cover_image_url ? (
                            <img src={t.cover_image_url} alt="" className="w-16 h-12 object-cover rounded-xl shrink-0 border border-border" />
                          ) : (
                            <div className="w-16 h-12 rounded-xl bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                              <BookOpen className="w-5 h-5" />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="font-bold text-xs text-foreground truncate">{t.title}</div>
                            <div className="text-[11px] text-muted-foreground mt-0.5">{new Date(t.created_at).toLocaleDateString("fr-FR")}</div>
                            <div className="mt-1.5 flex items-center gap-2">
                              <PublishBadge published={t.published} />
                              <button
                                type="button"
                                onClick={() => { setActiveSection("teachings"); startEditTeaching(t); }}
                                className="text-[11px] font-bold text-gold hover:underline ml-auto"
                              >
                                Éditer
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* -------------------- TEACHINGS & EDITOR -------------------- */}
            {activeSection === "teachings" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                {isEditorOpen ? (
                  /* ── Formulaire d'édition / création d'enseignement ── */
                  <form onSubmit={submitTeaching} className="space-y-6">
                    {/* Bannière de récupération de brouillon automatique */}
                    {draftDetected && (
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl border border-amber-500/40 bg-amber-500/10 text-amber-200 animate-in fade-in slide-in-from-top-2">
                        <div className="flex items-center gap-2.5">
                          <Save className="w-5 h-5 text-amber-400 shrink-0" />
                          <div>
                            <div className="font-bold text-xs">Un brouillon précédent a été sauvegardé automatiquement !</div>
                            <div className="text-[11px] opacity-80">
                              Dernière modification : {new Date(draftDetected.savedAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <Button type="button" size="sm" variant="hero" onClick={restoreDraft} className="text-xs h-8 flex-1 sm:flex-none">
                            <RotateCcw className="w-3.5 h-3.5 mr-1" /> Restaurer le brouillon
                          </Button>
                          <Button type="button" size="sm" variant="ghost" onClick={discardDraft} className="text-xs h-8 text-amber-300 hover:text-amber-100 flex-1 sm:flex-none">
                            Ignorer
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Barre d'action collante (Sticky Header) */}
                    <div className="sticky top-16 md:top-20 z-30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border border-gold/30 bg-background/95 backdrop-blur-xl shadow-xl">
                      <div className="flex items-center justify-between sm:justify-start gap-3 w-full sm:w-auto">
                        <Button type="button" variant="ghost" size="sm" onClick={cancelEdit} className="gap-2 shrink-0">
                          <ArrowLeft className="w-4 h-4" /> Retour
                        </Button>
                        <div className="min-w-0">
                          <h2 className="font-display text-sm sm:text-base font-bold truncate">
                            {editingId ? "Édition d'enseignement" : "Nouvel enseignement"}
                          </h2>
                          {draftSavedAt && (
                            <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                              <Save className="w-3 h-3" /> Sauvegardé à {new Date(draftSavedAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 pt-3 sm:pt-0 border-border/60">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="pub-switch" className="text-xs font-bold cursor-pointer shrink-0">
                            {form.published ? "Public (Publié)" : "Brouillon"}
                          </Label>
                          <Switch
                            id="pub-switch"
                            checked={form.published}
                            onCheckedChange={(val) => setForm({ ...form, published: val })}
                          />
                        </div>
                        <Button type="submit" variant="hero" disabled={submitting} size="sm" className="gap-2 font-bold shrink-0">
                          <CheckCircle2 className="w-4 h-4" />
                          {submitting ? "Sauvegarde..." : editingId ? "Mettre à jour" : "Publier"}
                        </Button>
                      </div>
                    </div>

                    {/* Section 1: Métadonnées principales */}
                    <Card className="border-border/80">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-bold uppercase tracking-wider text-gold">
                          1. Informations & SEO
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label className="text-xs font-bold mb-1.5 block">Titre de l'enseignement *</Label>
                          <Input
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                            placeholder="Ex: Le Règne Millénaire: principes bibliques et révélations"
                            className="h-11 font-medium text-sm"
                          />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <Label className="text-xs font-bold mb-1.5 block">Catégorie</Label>
                            <Select value={form.catId} onValueChange={(val) => setForm({ ...form, catId: val })}>
                              <SelectTrigger className="h-11">
                                <SelectValue placeholder="Sélectionner une catégorie" />
                              </SelectTrigger>
                              <SelectContent>
                                {categories.map((c) => (
                                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-xs font-bold mb-1.5 block">Pays concerné</Label>
                            <CountrySelect
                              value={form.country}
                              onChange={(countryName) => setForm({ ...form, country: countryName })}
                            />
                          </div>
                        </div>

                        <div>
                          <Label className="text-xs font-bold mb-1.5 block">Résumé / Extrait (SEO & Aperçus)</Label>
                          <Textarea
                            value={form.excerpt}
                            onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                            placeholder="Brève description résumant l'enseignement..."
                            rows={3}
                          />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Section 2: Médias (Couverture, Vidéo, Miniature vidéo, Audio) */}
                    <Card className="border-border/80">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-bold uppercase tracking-wider text-gold">
                          2. Médias & Fichiers
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
                          {/* Image de couverture principale */}
                          <div>
                            <Label className="text-xs font-bold mb-2 block flex items-center gap-1.5">
                              <ImageIcon className="w-4 h-4 text-gold" /> Image de couverture
                            </Label>
                            <MediaUpload
                              accept="image"
                              value={form.cover}
                              onChange={(url) => setForm({ ...form, cover: url })}
                              label="Téléverser image de couverture"
                            />
                          </div>

                          {/* Vidéo */}
                          <div>
                            <Label className="text-xs font-bold mb-2 block flex items-center gap-1.5">
                              <Video className="w-4 h-4 text-gold" /> Vidéo d'enseignement
                            </Label>
                            <MediaUpload
                              accept="video"
                              value={form.video}
                              onChange={(url) => setForm({ ...form, video: url })}
                              label="Téléverser vidéo d'enseignement"
                            />
                          </div>

                          {/* Miniature de la vidéo */}
                          <div>
                            <Label className="text-xs font-bold mb-2 block flex items-center gap-1.5">
                              <ImageIcon className="w-4 h-4 text-gold" /> Miniature de la vidéo
                            </Label>
                            <MediaUpload
                              accept="image"
                              value={form.videoThumbnail}
                              onChange={(url) => setForm({ ...form, videoThumbnail: url })}
                              label="Téléverser la miniature vidéo"
                            />
                          </div>

                          {/* Audio */}
                          <div>
                            <Label className="text-xs font-bold mb-2 block flex items-center gap-1.5">
                              <Music className="w-4 h-4 text-gold" /> Audio MP3 / Prêche vocal
                            </Label>
                            <MediaUpload
                              accept="audio"
                              value={form.audio}
                              onChange={(url) => setForm({ ...form, audio: url })}
                              label="Téléverser prêche audio"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Section 3: Éditeur du corps de l'enseignement */}
                    <Card className="border-border/80">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-bold uppercase tracking-wider text-gold">
                          3. Corps de l'enseignement (Éditeur Riches)
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <RichTextEditor
                          value={form.content}
                          onChange={(html) => setForm({ ...form, content: html })}
                          placeholder="Rédigez l'enseignement ici..."
                        />
                      </CardContent>
                    </Card>
                  </form>
                ) : (
                  /* ── Liste des enseignements avec filtres ── */
                  <div className="space-y-4">
                    {/* Barre de recherche et filtres */}
                    <Card className="border-border/70 p-4">
                      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
                        <div className="relative flex-1">
                          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            value={publicationQuery}
                            onChange={(e) => setPublicationQuery(e.target.value)}
                            placeholder="Rechercher par titre, extrait, pays..."
                            className="pl-9 h-10"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Select
                            value={publicationStatusFilter}
                            onValueChange={(val) => setPublicationStatusFilter(val as "all" | "published" | "draft")}
                          >
                            <SelectTrigger className="w-[140px] h-10 text-xs">
                              <SelectValue placeholder="Statut" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Tous les statuts</SelectItem>
                              <SelectItem value="published">Publiés</SelectItem>
                              <SelectItem value="draft">Brouillons</SelectItem>
                            </SelectContent>
                          </Select>

                          <Select
                            value={publicationCategoryFilter}
                            onValueChange={(val) => setPublicationCategoryFilter(val)}
                          >
                            <SelectTrigger className="w-[160px] h-10 text-xs">
                              <SelectValue placeholder="Catégorie" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Toutes catégories</SelectItem>
                              {categories.map((c) => (
                                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </Card>

                    {/* Liste sous forme de cartes propre */}
                    <div className="grid gap-4">
                      {filteredTeachings.length === 0 ? (
                        <Card className="p-8 text-center border-dashed">
                          <BookOpen className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                          <p className="text-sm font-bold text-foreground">Aucun enseignement trouvé</p>
                          <p className="text-xs text-muted-foreground mt-1">Modifiez vos filtres ou créez une nouvelle publication.</p>
                        </Card>
                      ) : (
                        filteredTeachings.map((t) => (
                          <Card key={t.id} className="border-border/80 hover:border-gold/30 transition-all">
                            <CardContent className="p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                              <div className="flex items-start gap-4 min-w-0 flex-1">
                                {t.cover_image_url ? (
                                  <img src={t.cover_image_url} alt="" className="w-24 h-16 object-cover rounded-xl shrink-0 border border-border" />
                                ) : (
                                  <div className="w-24 h-16 rounded-xl bg-muted flex items-center justify-center text-muted-foreground shrink-0 border border-border">
                                    <BookOpen className="w-6 h-6" />
                                  </div>
                                )}
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2 flex-wrap mb-1">
                                    <PublishBadge published={t.published} />
                                    <span className="text-[11px] text-muted-foreground">
                                      {new Date(t.created_at).toLocaleDateString("fr-FR")}
                                    </span>
                                    {t.country && (
                                      <span className="text-[11px] font-medium text-gold bg-gold/10 px-2 py-0.5 rounded-full border border-gold/20">
                                        {t.country}
                                      </span>
                                    )}
                                  </div>
                                  <h3 className="font-bold text-sm text-foreground truncate">{t.title}</h3>
                                  <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                                    {t.excerpt || t.content.replace(/<[^>]*>?/gm, "").substring(0, 100)}
                                  </p>
                                </div>
                              </div>

                              <div className="flex flex-wrap items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-border/50">
                                <Button size="sm" variant="outline" onClick={() => startEditTeaching(t)} className="text-xs">
                                  <Pencil className="w-3.5 h-3.5 mr-1" /> Modifier
                                </Button>
                                {t.published && (
                                  <Button size="sm" variant="outline" onClick={() => handleSendNewsletter(t.id)} className="text-xs border-gold/30 text-gold hover:bg-gold/10">
                                    <Mail className="w-3.5 h-3.5 mr-1" /> Newsletter
                                  </Button>
                                )}
                                <Button size="sm" variant="ghost" onClick={() => togglePublished(t)} className="text-xs">
                                  {t.published ? "Dépublier" : "Publier"}
                                </Button>
                                <Button size="sm" variant="destructive" onClick={() => deleteTeaching(t.id)} className="text-xs">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* -------------------- HOME CONTENT SETTINGS -------------------- */}
            {activeSection === "home" && (
              <Card className="border-border/80 space-y-6 p-6 animate-in fade-in duration-300">
                <CardHeader className="p-0">
                  <CardTitle className="text-lg font-bold">Paramètres de la page d'accueil</CardTitle>
                  <CardDescription>Bannières, annonces défilantes, directs et vidéos à la une</CardDescription>
                </CardHeader>

                <div className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label className="text-xs font-bold mb-1 block">Texte défilant (Marquee)</Label>
                      <Input
                        value={homeForm.marquee_text}
                        onChange={(e) => setHomeForm({ ...homeForm, marquee_text: e.target.value })}
                        placeholder="Ex: Bienvenue sur Le Règne Millénaire..."
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-bold mb-1 block">Lien direct (Live Video URL)</Label>
                      <Input
                        value={homeForm.live_url}
                        onChange={(e) => setHomeForm({ ...homeForm, live_url: e.target.value })}
                        placeholder="https://..."
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <Label className="text-xs font-bold">Activer l'annonce Live en direct</Label>
                    <Switch
                      checked={homeForm.live_enabled}
                      onCheckedChange={(val) => setHomeForm({ ...homeForm, live_enabled: val })}
                    />
                  </div>

                  <div className="pt-4 border-t border-border flex justify-end">
                    <Button variant="hero" onClick={saveHomeSettings} className="font-bold">
                      Enregistrer les modifications
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* -------------------- CATEGORIES -------------------- */}
            {activeSection === "categories" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <Card className="border-border/80">
                  <CardHeader>
                    <CardTitle className="text-base font-bold">Ajouter une catégorie</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={submitCategory} className="space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <Label className="text-xs font-bold mb-1 block">Nom de la catégorie *</Label>
                          <Input
                            value={catName}
                            onChange={(e) => setCatName(e.target.value)}
                            placeholder="Ex: Foi & Révélations"
                          />
                        </div>
                        <div>
                          <Label className="text-xs font-bold mb-1 block">Description</Label>
                          <Input
                            value={catDesc}
                            onChange={(e) => setCatDesc(e.target.value)}
                            placeholder="Description courte..."
                          />
                        </div>
                      </div>
                      <Button type="submit" variant="hero" size="sm" className="font-bold">
                        <Plus className="w-4 h-4 mr-1" /> Créer la catégorie
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                <div className="grid gap-3 sm:grid-cols-2">
                  {categories.map((c) => (
                    <Card key={c.id} className="border-border/70 p-4 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-sm text-foreground">{c.name}</div>
                        <div className="text-xs text-muted-foreground">{c.description || "Aucune description"}</div>
                      </div>
                      <Button size="sm" variant="destructive" onClick={() => deleteCategory(c.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* -------------------- TESTIMONIALS -------------------- */}
            {activeSection === "testimonials" && (
              <div className="animate-in fade-in duration-300">
                <TestimonialsAdmin />
              </div>
            )}

            {/* -------------------- STORIES -------------------- */}
            {activeSection === "stories" && (
              <div className="animate-in fade-in duration-300">
                <StoriesAdmin />
              </div>
            )}

            {/* -------------------- POPUPS -------------------- */}
            {activeSection === "popups" && (
              <div className="animate-in fade-in duration-300">
                <PopupsAdmin />
              </div>
            )}

            {/* -------------------- NEWSLETTER -------------------- */}
            {activeSection === "newsletter" && (
              <div className="animate-in fade-in duration-300">
                <NewsletterCampaigns />
              </div>
            )}

            {/* -------------------- USERS & ROLES -------------------- */}
            {activeSection === "users" && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <Card className="border-border/80 p-4">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={userQuery}
                      onChange={(e) => setUserQuery(e.target.value)}
                      placeholder="Rechercher un membre par nom, pays, ID..."
                      className="pl-9"
                    />
                  </div>
                </Card>

                <div className="grid gap-3">
                  {filteredUsers.slice(0, displayedUsersCount).map((u) => {
                    const isUserAdmin = adminIds.has(u.id);
                    const hasGold = badgeIds.has(u.id);
                    return (
                      <Card key={u.id} className="border-border/70 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gold/15 text-gold font-bold flex items-center justify-center border border-gold/30">
                            {(u.full_name?.[0] ?? "U").toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-sm flex items-center gap-2">
                              {u.full_name || "Nom non renseigné"}
                              {hasGold && <GoldBadge size="sm" />}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {u.country || "Pays non spécifié"} · ID: {u.id.substring(0, 8)}...
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant={hasGold ? "hero" : "outline"}
                            onClick={() => toggleGoldBadge(u.id)}
                            className="text-xs"
                          >
                            Badge Gold
                          </Button>

                          <Button
                            size="sm"
                            variant={isUserAdmin ? "destructive" : "outline"}
                            onClick={() => toggleAdminRole(u.id)}
                            className="text-xs"
                          >
                            {isUserAdmin ? <ShieldOff className="w-3.5 h-3.5 mr-1" /> : <Shield className="w-3.5 h-3.5 mr-1" />}
                            {isUserAdmin ? "Retirer Admin" : "Nommer Admin"}
                          </Button>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default Admin;