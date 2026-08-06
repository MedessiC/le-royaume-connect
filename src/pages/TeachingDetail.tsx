import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import CommentsSection from "@/components/CommentsSection";
import RelatedTeachingCard from "@/components/RelatedTeachingCard";
import GoldBadge from "@/components/GoldBadge";
import TeachingSEO from "@/components/TeachingSEO";
import ShareButton from "@/components/ShareButton";
import SaveButton from "@/components/SaveButton";
import TTSButton from "@/components/TTSButton";
import SocialFollowCTA from "@/components/SocialFollowCTA";
import { getTeachingPath } from "@/lib/teachingUrl";
import TeachingContent from "@/components/TeachingContent";
import VideoPlayer from "@/components/VideoPlayer";
import UserAvatar from "@/components/UserAvatar";
import TeachingCoverFallback from "@/components/TeachingCoverFallback";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useAudioPlayer } from "@/context/AudioPlayerContext";
import { Calendar, MapPin, ArrowLeft, BookOpen, Heart, Bookmark, Plus, Check, Music, Play, Pause, FileDown, Printer } from "lucide-react";

type Profile = { id: string; full_name: string | null; avatar_url?: string | null; has_gold_badge?: boolean };

type TeachingComment = {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  parent_id?: string | null;
  author?: Profile | null;
  likes_count?: number;
  liked_by_me?: boolean;
};

type ReplyTo = { id: string; name: string } | null;

type Teaching = {
  id: string;
  slug: string | null;
  title: string;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  video_url: string | null;
  audio_url: string | null;
  country: string | null;
  author_id: string | null;
  author?: Profile | null;
  isAuthorAdmin?: boolean;
  created_at: string;
  categories?: { name: string; slug: string } | null;
};

const renderTeachingContent = (content: string) => (
  <TeachingContent
    content={content}
    className="break-words overflow-hidden [word-break:break-word] [overflow-wrap:anywhere]"
  />
);

const TeachingDetail = () => {
  const { id: slugOrId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { playTrack, currentTrack, isPlaying } = useAudioPlayer();
  const [teaching, setTeaching] = useState<Teaching | null>(null);
  const [loading, setLoading] = useState(true);
  const [related, setRelated] = useState<Array<{
    id: string;
    slug: string | null;
    title: string;
    excerpt: string | null;
    cover_image_url: string | null;
    country: string | null;
    author_id: string | null;
    created_at: string;
    author?: Profile | null;
    category_name?: string;
    is_admin?: boolean;
  }>>([]);
  const [likesCount, setLikesCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [comments, setComments] = useState<TeachingComment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [replyTo, setReplyTo] = useState<ReplyTo>(null);
  const [replyText, setReplyText] = useState("");
  const [showFullContent, setShowFullContent] = useState(false);
  const [collections, setCollections] = useState<Array<{ id: string; name: string }>>([]);
  const [savedCollectionIds, setSavedCollectionIds] = useState<string[]>([]);
  const [collectionName, setCollectionName] = useState("");
  const [collectionSaving, setCollectionSaving] = useState(false);

  useEffect(() => {
    if (!slugOrId) return;
    setLoading(true);

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugOrId);
    let query = supabase
      .from("teachings")
      .select("id, slug, title, excerpt, content, cover_image_url, video_url, audio_url, country, author_id, created_at, category_id");

    if (isUuid) {
      query = query.or(`id.eq.${slugOrId},slug.eq.${slugOrId}`);
    } else {
      query = query.eq("slug", slugOrId);
    }

    query
      .eq("published", true)
      .maybeSingle()
      .then(async ({ data, error }) => {
        if (!data) {
          setTeaching(null);
          setLoading(false);
          return;
        }

        if (data.slug && data.slug !== slugOrId) {
          navigate(`${getTeachingPath(data)}${window.location.hash}`, { replace: true });
        }

        const categoryRes = data.category_id
          ? await supabase.from("categories").select("name, slug").eq("id", data.category_id).maybeSingle()
          : { data: null };

        const [authorRes, roleRes, commentsRes, likesRes] = await Promise.all([
          data.author_id
            ? supabase.from("profiles").select("id, full_name, avatar_url, has_gold_badge").eq("id", data.author_id).maybeSingle()
            : Promise.resolve({ data: null }),
          data.author_id
            ? supabase.from("user_roles").select("user_id").eq("role", "admin").eq("user_id", data.author_id).maybeSingle()
            : Promise.resolve({ data: null }),
          supabase
            .from("teaching_comments")
            .select("id, content, created_at, user_id, parent_id")
            .eq("teaching_id", data.id)
            .order("created_at", { ascending: true }),
          supabase
            .from("teaching_likes")
            .select("user_id")
            .eq("teaching_id", data.id),
        ]);

        if (commentsRes.error) {
          console.error("Failed to load teaching comments", commentsRes.error);
        }
        if (likesRes.error) {
          console.error("Failed to load teaching likes", likesRes.error);
        }

        const commentAuthors: Record<string, Profile> = {};
        if (commentsRes.data?.length) {
          const authorIds = Array.from(new Set(commentsRes.data.map((comment) => comment.user_id)));
          const profilesRes = await supabase.from("profiles").select("id, full_name, avatar_url, has_gold_badge").in("id", authorIds);
          if (profilesRes.data) {
            profilesRes.data.forEach((profile) => {
              commentAuthors[profile.id] = profile;
            });
          }
        }

        const commentIds = commentsRes.data?.map((comment) => comment.id) ?? [];
        const commentLikesRes = commentIds.length
          ? await supabase
              .from("teaching_comment_likes")
              .select("comment_id, user_id")
              .in("comment_id", commentIds)
          : { data: [] };

        const commentLikeCounts = new Map<string, number>();
        const commentLikedByMe = new Set<string>();
        if (commentLikesRes.data) {
          commentLikesRes.data.forEach((like) => {
            commentLikeCounts.set(like.comment_id, (commentLikeCounts.get(like.comment_id) ?? 0) + 1);
            if (user?.id && like.user_id === user.id) {
              commentLikedByMe.add(like.comment_id);
            }
          });
        }

        setTeaching({
          ...data,
          author: authorRes.data || null,
          isAuthorAdmin: !!roleRes.data,
          categories: categoryRes.data ? { name: categoryRes.data.name, slug: categoryRes.data.slug } : null,
        });

        setComments(
          (commentsRes.data ?? []).map((comment) => ({
            ...comment,
            author: commentAuthors[comment.user_id] ?? null,
            likes_count: commentLikeCounts.get(comment.id) ?? 0,
            liked_by_me: commentLikedByMe.has(comment.id),
          })),
        );
        setLikesCount(likesRes.data?.length ?? 0);
        setIsLiked(!!likesRes.data?.find((like) => like.user_id === user?.id));
        setLoading(false);

        document.title = `${data.title} – MILLENIUM`;
        supabase
          .from("teachings")
          .select("id, slug, title, excerpt, cover_image_url, country, author_id, created_at, category_id")
          .eq("published", true)
          .neq("id", data.id)
          .order("created_at", { ascending: false })
          .limit(3)
          .then(async ({ data: rel }) => {
            if (!rel) return;

            const authorIds = Array.from(new Set(rel.map((r: any) => r.author_id).filter(Boolean)));
            const categoryIds = Array.from(new Set(rel.map((r: any) => r.category_id).filter(Boolean)));

            let authorMap: Record<string, Profile> = {};
            let adminIds = new Set<string>();
            let categoryMap: Record<string, string> = {};

            if (authorIds.length) {
              const [profilesRes, rolesRes] = await Promise.all([
                supabase.from("profiles").select("id, full_name, avatar_url").in("id", authorIds),
                supabase.from("user_roles").select("user_id").eq("role", "admin").in("user_id", authorIds),
              ]);

              if (profilesRes.data) {
                authorMap = Object.fromEntries(profilesRes.data.map((p) => [p.id, p]));
              }
              if (rolesRes.data) {
                rolesRes.data.forEach((role) => adminIds.add(role.user_id));
              }
            }

            if (categoryIds.length) {
              const categoriesRes = await supabase.from("categories").select("id, name").in("id", categoryIds);
              if (categoriesRes.data) {
                categoryMap = Object.fromEntries(categoriesRes.data.map((c) => [c.id, c.name]));
              }
            }

            const enrichedRel = rel.map((r: any) => ({
              ...r,
              author: authorMap[r.author_id] || null,
              category_name: categoryMap[r.category_id] || undefined,
              is_admin: adminIds.has(r.author_id),
            }));

            setRelated(enrichedRel);
          });
      });
  }, [slugOrId, user]);

  useEffect(() => {
    const loadCollections = async () => {
      if (!user || !teaching?.id) {
        setCollections([]);
        setSavedCollectionIds([]);
        return;
      }

      const { data: collectionsData, error: collectionsError } = await supabase
        .from("teaching_collections")
        .select("id, name")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (collectionsError) {
        console.error("Failed to load collections", collectionsError);
        return;
      }

      setCollections(collectionsData ?? []);
      if (!collectionsData?.length) {
        setSavedCollectionIds([]);
        return;
      }

      const { data: itemData, error: itemError } = await supabase
        .from("teaching_collection_items")
        .select("collection_id")
        .eq("teaching_id", teaching.id)
        .in("collection_id", collectionsData.map((collection) => collection.id));

      if (itemError) {
        console.error("Failed to load saved teaching collections", itemError);
        setSavedCollectionIds([]);
        return;
      }

      setSavedCollectionIds(itemData?.map((item) => item.collection_id) ?? []);
    };

    loadCollections();
  }, [user, teaching?.id]);

  const handleToggleCollection = async (collectionId: string) => {
    if (!user || !teaching) return;

    const alreadySaved = savedCollectionIds.includes(collectionId);
    if (alreadySaved) {
      const { error } = await supabase
        .from("teaching_collection_items")
        .delete()
        .eq("collection_id", collectionId)
        .eq("teaching_id", teaching.id);
      if (!error) {
        setSavedCollectionIds((current) => current.filter((id) => id !== collectionId));
      }
      return;
    }

    const { error } = await supabase
      .from("teaching_collection_items")
      .insert({ collection_id: collectionId, teaching_id: teaching.id });
    if (!error) {
      setSavedCollectionIds((current) => [...current, collectionId]);
    }
  };

  const handleCreateCollection = async () => {
    if (!user || !teaching || !collectionName.trim()) return;

    setCollectionSaving(true);
    const { data, error } = await supabase
      .from("teaching_collections")
      .insert({ user_id: user.id, name: collectionName.trim() })
      .select("id, name")
      .single();
    setCollectionSaving(false);

    if (error) {
      console.error("Failed to create collection", error);
      return;
    }

    if (data) {
      setCollections((current) => [data, ...current]);
      setCollectionName("");
      await handleToggleCollection(data.id);
    }
  };

  const handleToggleLike = async () => {
    if (!user || !teaching) return;

    if (isLiked) {
      const { error } = await supabase
        .from("teaching_likes")
        .delete()
        .eq("teaching_id", teaching.id)
        .eq("user_id", user.id);
      if (!error) {
        setIsLiked(false);
        setLikesCount((count) => Math.max(count - 1, 0));
      }
      return;
    }

    const { error } = await supabase.from("teaching_likes").insert({ teaching_id: teaching.id, user_id: user.id });
    if (!error) {
      setIsLiked(true);
      setLikesCount((count) => count + 1);
    }
  };

  useEffect(() => {
    if (!teaching || window.location.hash !== "#comments") return;

    const timer = window.setTimeout(() => {
      document.getElementById("comments")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);

    return () => window.clearTimeout(timer);
  }, [teaching]);

  const handleSendComment = async () => {
    if (!user || !teaching || !commentText.trim()) return;

    const content = commentText.trim();
    const { data, error } = await supabase
      .from("teaching_comments")
      .insert({
        teaching_id: teaching.id,
        user_id: user.id,
        content,
      })
      .select("id, content, created_at, user_id, parent_id")
      .single();

    if (!error && data) {
      setComments((current) => [
        ...current,
        {
          ...data,
          author: {
            id: user.id,
            full_name: profile?.full_name ?? user.user_metadata?.full_name ?? null,
            avatar_url: profile?.avatar_url ?? null,
          },
          likes_count: 0,
          liked_by_me: false,
        },
      ]);
      setCommentText("");
      setLikesCount((count) => count);
    }
  };

  const handleSendReply = async () => {
    if (!user || !teaching || !replyTo || !replyText.trim()) return;

    const content = replyText.trim();
    const { data, error } = await supabase
      .from("teaching_comments")
      .insert({
        teaching_id: teaching.id,
        user_id: user.id,
        content,
        parent_id: replyTo.id,
      })
      .select("id, content, created_at, user_id, parent_id")
      .single();

    if (!error && data) {
      setComments((current) => [
        ...current,
        {
          ...data,
          author: {
            id: user.id,
            full_name: profile?.full_name ?? user.user_metadata?.full_name ?? null,
            avatar_url: profile?.avatar_url ?? null,
          },
          likes_count: 0,
          liked_by_me: false,
        },
      ]);
      setReplyText("");
      setReplyTo(null);
    }
  };

  const handleToggleCommentLike = async (commentId: string) => {
    if (!user) return;

    const comment = comments.find((c) => c.id === commentId);
    if (!comment) return;

    if (comment.liked_by_me) {
      const { error } = await supabase
        .from("teaching_comment_likes")
        .delete()
        .eq("comment_id", commentId)
        .eq("user_id", user.id);
      if (!error) {
        setComments((current) =>
          current.map((c) =>
            c.id === commentId
              ? {
                  ...c,
                  liked_by_me: false,
                  likes_count: Math.max((c.likes_count ?? 1) - 1, 0),
                }
              : c,
          ),
        );
      }
      return;
    }

    const { error } = await supabase
      .from("teaching_comment_likes")
      .insert({ comment_id: commentId, user_id: user.id });
    if (!error) {
      setComments((current) =>
        current.map((c) =>
          c.id === commentId
            ? {
                ...c,
                liked_by_me: true,
                likes_count: (c.likes_count ?? 0) + 1,
              }
            : c,
        ),
      );
    }
  };

  // ── Loading state ─────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-950">
        <Navbar />
        <main className="relative flex flex-1 items-center justify-center overflow-hidden">
          <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(hsl(0_0%_100%_/_0.08)_1px,transparent_1px),linear-gradient(90deg,hsl(0_0%_100%_/_0.08)_1px,transparent_1px)] [background-size:48px_48px]" />
          <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/10 blur-3xl" />

          <div className="relative flex flex-col items-center">
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-gold/30 bg-white/5 shadow-[0_0_60px_hsl(43_92%_50%_/_0.18)]">
              <span className="absolute inset-0 rounded-full border-2 border-transparent border-t-gold border-r-gold/30 animate-spin" />
              <img
                src="/android-chrome-512x512.png"
                alt="Logo du Règne Millénaire"
                className="h-16 w-16 object-contain animate-pulse"
              />
            </div>
            <p className="mt-6 font-display text-xs font-bold uppercase tracking-[0.28em] text-white">MILLENIUM</p>
            <p className="mt-2 text-xs text-white/55">Préparation de l'enseignement</p>
            <div className="mt-5 h-1 w-40 overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-1/2 rounded-full bg-gradient-to-r from-transparent via-gold to-transparent animate-[loader-sweep_0.9s_ease-in-out_infinite]" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ── Not found ─────────────────────────────────────────────────────
  if (!teaching) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 pt-24 pb-16 text-center">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h1 className="font-display text-2xl font-bold text-foreground mb-3">Enseignement introuvable</h1>
          <Link to="/feed">
            <Button>
              <ArrowLeft className="w-4 h-4" /> Retour au fil
            </Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  // ── Reading time estimate ─────────────────────────────────────────
  const readingTime = Math.max(1, Math.ceil(teaching.content.replace(/<[^>]+>/g, "").split(/\s+/).length / 200));

  // ── PDF Export ────────────────────────────────────────────────────
  const handleExportPdf = () => {
    const printStyle = document.createElement("style");
    printStyle.id = "pdf-print-style";
    printStyle.textContent = `
      @media print {
        body > *:not(#pdf-print-content) { display: none !important; }
        #pdf-print-content { display: block !important; }
        @page { margin: 2cm; }
      }
      #pdf-print-content {
        display: none;
        font-family: 'Georgia', serif;
        line-height: 1.8;
        color: #1e293b;
        max-width: 800px;
        margin: 0 auto;
      }
      #pdf-print-content h1 { font-size: 2em; font-weight: 800; margin-bottom: 0.5em; color: #0f172a; }
      #pdf-print-content .pdf-meta { font-size: 0.85em; color: #64748b; border-bottom: 2px solid #d4af37; padding-bottom: 0.75em; margin-bottom: 1.5em; }
      #pdf-print-content .pdf-excerpt { font-style: italic; border-left: 4px solid #d4af37; padding-left: 1em; color: #475569; margin-bottom: 1.5em; font-size: 1.05em; }
      #pdf-print-content p { margin-bottom: 1em; }
      #pdf-print-content h2, #pdf-print-content h3 { font-weight: 700; margin: 1.5em 0 0.5em; color: #0f172a; }
      #pdf-print-content .pdf-footer { margin-top: 2em; padding-top: 1em; border-top: 1px solid #e2e8f0; font-size: 0.8em; color: #94a3b8; text-align: center; }
    `;
    document.head.appendChild(printStyle);

    let printDiv = document.getElementById("pdf-print-content");
    if (!printDiv) {
      printDiv = document.createElement("div");
      printDiv.id = "pdf-print-content";
      document.body.appendChild(printDiv);
    }
    const date = new Date(teaching.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
    printDiv.innerHTML = `
      <h1>${teaching.title}</h1>
      <div class="pdf-meta">
        <strong>@leregnemillenaire</strong> &nbsp;·&nbsp; ${teaching.categories?.name ?? "Enseignement"} &nbsp;·&nbsp; ${date} &nbsp;·&nbsp; ${readingTime} min de lecture
      </div>
      ${teaching.excerpt ? `<div class="pdf-excerpt">${teaching.excerpt}</div>` : ""}
      <div class="pdf-body">${teaching.content}</div>
      <div class="pdf-footer">Fiche d'Enseignement — Le Règne Millénaire · leregnemillenaire.com</div>
    `;

    window.print();

    setTimeout(() => {
      document.head.removeChild(printStyle);
      if (printDiv && printDiv.parentNode) {
        printDiv.parentNode.removeChild(printDiv);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <TeachingSEO
        title={teaching.title}
        description={teaching.excerpt || teaching.content.substring(0, 160)}
        path={getTeachingPath(teaching)}
        image={teaching.cover_image_url || undefined}
        keywords={[teaching.categories?.name, teaching.country].filter(Boolean) as string[]}
        author={{ name: "Le Règne Millénaire", id: "official" }}
        publishedDate={teaching.created_at}
        modifiedDate={teaching.created_at}
        content={teaching.content}
        categoryName={teaching.categories?.name}
        country={teaching.country || undefined}
        videoUrl={teaching.video_url || undefined}
      />
      <Navbar />

      {/* ── Reading Progress Bar ── */}
      <ReadingProgress />

      <main className="flex-1 pt-16">
        {/* ── HERO cover image ── */}
        {teaching.cover_image_url ? (
          <div className="relative w-full aspect-[21/9] max-h-[520px] overflow-hidden bg-muted">
            <img
              src={teaching.cover_image_url}
              alt={teaching.title}
              className="w-full h-full object-cover"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
          </div>
        ) : (
          <TeachingCoverFallback
            title={teaching.title}
            className="w-full aspect-[21/9] max-h-[520px] overflow-hidden"
          />
        )}

        <div className="container mx-auto px-4 max-w-3xl">
          {/* ── Back link ── */}
          <div className="flex items-center pt-6">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-gold transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              Retour
            </button>
          </div>

          {/* ── Meta chips ── */}
          <div className="flex flex-wrap items-center gap-2 mt-6">
            {teaching.categories?.name && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gold/10 border border-gold/25 text-gold text-[11px] font-bold tracking-[0.14em] uppercase">
                {teaching.categories.name}
              </span>
            )}
            {teaching.country && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary border border-border text-[11px] font-medium text-muted-foreground">
                <MapPin className="w-3 h-3" />
                {teaching.country}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary border border-border text-[11px] font-medium text-muted-foreground">
              <BookOpen className="w-3 h-3" />
              {readingTime} min de lecture
            </span>
          </div>

          {/* ── Title Block — redesigned ── */}
          <div className="mt-6 mb-6">
            {/* Decorative golden rule */}
            <div className="flex items-center gap-3 mb-4">
              <div className="h-[3px] w-10 rounded-full bg-gradient-to-r from-gold to-amber-400" />
              <div className="h-[3px] w-4 rounded-full bg-gold/40" />
              <div className="h-[3px] w-2 rounded-full bg-gold/20" />
            </div>

            <h1 className="font-display text-[1.85rem] sm:text-4xl md:text-5xl font-extrabold leading-[1.12] tracking-tight mb-0">
              <span className="bg-gradient-to-br from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
                {teaching.title}
              </span>
            </h1>

            {/* Bottom decorative accent */}
            <div className="mt-4 flex items-center gap-2">
              <div className="h-px flex-1 bg-gradient-to-r from-gold/50 to-transparent" />
              <div className="w-1.5 h-1.5 rounded-full bg-gold" />
            </div>
          </div>

          {/* ── Excerpt / Lead ── */}
          {teaching.excerpt && (
            <div className="relative mb-8 pl-5 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px] before:rounded-full before:bg-gradient-to-b before:from-gold before:to-amber-300">
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed italic font-serif">
                {teaching.excerpt}
              </p>
            </div>
          )}

          {/* ── Publisher + Action bar ── */}
          <div className="flex items-center justify-between gap-4 py-4 border-y border-border mb-8">
            <div className="flex items-center gap-3">
              <UserAvatar src="/android-chrome-512x512.png" name="Le Règne Millénaire" className="h-10 w-10 border-2 border-gold/40" />
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-bold text-sm text-foreground">@leregnemillenaire</span>
                  <GoldBadge hasGoldBadge={true} />
                  <Badge variant="secondary" className="bg-gold/20 text-gold border-gold/30 text-[10px] font-bold tracking-wide ml-1">
                    Officiel
                  </Badge>
                </div>
                <span className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <Calendar className="w-3 h-3" />
                  {new Date(teaching.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                </span>
              </div>
            </div>

            {/* Actions — desktop */}
            <div className="hidden sm:flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleToggleLike}
                aria-pressed={isLiked}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  isLiked
                    ? "bg-destructive/10 border-destructive/30 text-destructive"
                    : "bg-secondary border-border text-muted-foreground hover:border-destructive/40 hover:text-destructive"
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${isLiked ? "fill-current" : ""}`} />
                {likesCount > 0 && <span>{likesCount}</span>}
              </button>

              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                      savedCollectionIds.length > 0
                        ? "bg-gold/10 border-gold/40 text-gold"
                        : "bg-secondary border-border text-muted-foreground hover:border-gold/40 hover:text-gold"
                    }`}
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    {savedCollectionIds.length > 0 ? "Enregistré" : "Sauvegarder"}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold">Collections</p>
                      <span className="text-xs text-muted-foreground">{savedCollectionIds.length} enregistré(s)</span>
                    </div>
                    {collections.length > 0 ? (
                      <div className="space-y-2">
                        {collections.map((collection) => {
                          const isSaved = savedCollectionIds.includes(collection.id);
                          return (
                            <button
                              key={collection.id}
                              type="button"
                              onClick={() => handleToggleCollection(collection.id)}
                              className={`w-full rounded-2xl border px-3 py-2 text-left text-sm transition ${
                                isSaved ? "border-gold bg-gold/10 text-gold" : "border-border bg-card text-foreground hover:border-gold/30"
                              }`}
                            >
                              <div className="flex items-center justify-between gap-3">
                                <span>{collection.name}</span>
                                {isSaved ? <Check className="w-4 h-4 text-gold" /> : null}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Aucune collection encore. Créez-en une !</p>
                    )}
                    <div className="pt-3 border-t border-border">
                      <Label htmlFor="collection-name-detail" className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                        Nouvelle collection
                      </Label>
                      <div className="mt-2 flex gap-2">
                        <Input
                          id="collection-name-detail"
                          value={collectionName}
                          onChange={(event) => setCollectionName(event.target.value)}
                          placeholder="Mon enseignement préféré"
                        />
                        <Button size="sm" type="button" onClick={handleCreateCollection} disabled={!collectionName.trim() || collectionSaving}>
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              <TTSButton text={teaching.content} lang="fr-FR" size="md" />
              <ShareButton
                title={teaching.title}
                description={teaching.excerpt || teaching.content.substring(0, 160)}
                url={getTeachingPath(teaching)}
                size="md"
                variant="outline"
              />
              {/* PDF Export */}
              <button
                type="button"
                onClick={handleExportPdf}
                title="Exporter en PDF"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border bg-secondary border-border text-muted-foreground hover:border-gold/40 hover:text-gold transition-all"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>Fiche PDF</span>
              </button>
            </div>
          </div>

          {/* ── Audio Player (inline, premium) ── */}
          {teaching.audio_url && (
            <div className="mb-8 rounded-2xl overflow-hidden border border-gold/30 bg-gradient-to-r from-slate-900 via-royal/80 to-slate-900 shadow-royal">
              <div className="flex items-center gap-4 p-4">
                <div className="relative flex-shrink-0">
                  {teaching.cover_image_url ? (
                    <img src={teaching.cover_image_url} alt={teaching.title} className="w-14 h-14 rounded-xl object-cover" />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-gold/20 flex items-center justify-center">
                      <Music className="w-7 h-7 text-gold" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-white truncate">{teaching.title}</p>
                  <p className="text-xs text-white/60 mt-0.5">@leregnemillenaire · Audio</p>
                </div>
                <Button
                  onClick={() =>
                    playTrack({
                      id: teaching.id,
                      title: teaching.title,
                      authorName: "@leregnemillenaire",
                      audioUrl: teaching.audio_url!,
                      coverUrl: teaching.cover_image_url,
                      country: teaching.country,
                    })
                  }
                  className="flex-shrink-0 bg-gold hover:bg-gold/90 text-slate-950 font-bold rounded-full w-11 h-11 p-0 flex items-center justify-center shadow-gold"
                >
                  {currentTrack?.id === teaching.id && isPlaying ? (
                    <Pause className="w-5 h-5 fill-current" />
                  ) : (
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  )}
                </Button>
              </div>
              <div className="px-4 pb-3">
                <p className="text-[11px] text-white/40 text-center">
                  Écoute continue · Le lecteur continue même si vous naviguez vers d'autres pages
                </p>
              </div>
            </div>
          )}

          {/* ── Video ── */}
          {teaching.video_url && (
            <VideoPlayer
              src={teaching.video_url}
              title={teaching.title}
              poster={teaching.cover_image_url}
              showLabel
              className="mb-8"
            />
          )}

          {/* ── Article Content ── */}
          <div className={`prose prose-lg max-w-none mb-8
            text-foreground font-body leading-[1.95] tracking-[0.01em]
            prose-headings:font-display prose-headings:leading-tight prose-headings:font-bold prose-headings:relative
            prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4 prose-h2:pb-2 prose-h2:border-b prose-h2:border-gold/25 prose-h2:text-foreground
            prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3 prose-h3:text-foreground prose-h3:pl-3 prose-h3:border-l-2 prose-h3:border-gold
            prose-p:text-foreground prose-p:leading-[1.95] prose-p:mb-5 prose-p:text-[0.975rem] sm:prose-p:text-[1rem]
            prose-a:text-gold prose-a:no-underline prose-a:font-semibold hover:prose-a:underline
            prose-strong:text-foreground prose-strong:font-bold
            prose-ul:list-disc prose-ul:pl-5 prose-li:text-foreground prose-li:mb-1.5 prose-li:marker:text-gold
            prose-ol:pl-5 prose-ol:list-decimal prose-ol:marker:text-gold prose-ol:marker:font-bold
            prose-blockquote:border-l-4 prose-blockquote:border-gold prose-blockquote:bg-gold/5 prose-blockquote:rounded-r-xl prose-blockquote:pl-5 prose-blockquote:py-3 prose-blockquote:pr-4 prose-blockquote:italic prose-blockquote:text-muted-foreground prose-blockquote:not-italic
            prose-code:text-gold prose-code:bg-gold/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:before:content-none prose-code:after:content-none
            dark:prose-invert dark:prose-p:text-foreground dark:prose-headings:text-foreground dark:prose-strong:text-foreground dark:prose-li:text-foreground
          `}>
            {/* Drop cap style injection for text-only teachings */}
            {!teaching.video_url && !teaching.audio_url && (
              <style>{`
                .teaching-prose > div > p:first-child::first-letter {
                  float: left;
                  font-size: 3.8em;
                  line-height: 0.75;
                  margin: 0.06em 0.08em 0 0;
                  font-family: var(--font-display, serif);
                  font-weight: 800;
                  color: #d4af37;
                }
              `}</style>
            )}
            <div className="teaching-prose">
              {!teaching.video_url && !teaching.audio_url && !showFullContent ? (
                <>
                  <div className="line-clamp-[12]">
                    {renderTeachingContent(teaching.content)}
                  </div>
                  <div className="not-prose mt-8 rounded-2xl border border-gold/30 bg-gradient-to-br from-gold/5 to-amber-500/5 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold text-foreground mb-0.5">Lire l'intégralité de cet enseignement</p>
                      <p className="text-xs text-muted-foreground">Environ {readingTime} min de lecture · Cours d'étude biblique</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => setShowFullContent(true)}
                        className="inline-flex items-center gap-2 rounded-xl border border-gold bg-gold text-slate-950 px-5 py-2.5 text-sm font-bold transition hover:bg-gold/90 shadow-gold"
                      >
                        <BookOpen className="w-4 h-4" />
                        Lire l'intégralité
                      </button>
                      <button
                        type="button"
                        onClick={handleExportPdf}
                        className="inline-flex items-center gap-2 rounded-xl border border-border bg-secondary text-muted-foreground px-4 py-2.5 text-sm font-semibold transition hover:border-gold/40 hover:text-gold"
                      >
                        <FileDown className="w-4 h-4" />
                        PDF
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {renderTeachingContent(teaching.content)}
                  {!teaching.video_url && !teaching.audio_url && showFullContent && (
                    <div className="not-prose mt-10 flex items-center justify-between gap-4 pt-6 border-t border-border">
                      <button
                        type="button"
                        onClick={() => setShowFullContent(false)}
                        className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-5 py-2 text-sm font-medium text-muted-foreground transition hover:border-gold/30 hover:text-gold"
                      >
                        Réduire
                      </button>
                      <button
                        type="button"
                        onClick={handleExportPdf}
                        className="inline-flex items-center gap-2 rounded-xl border border-gold/40 bg-gold/10 text-gold px-5 py-2 text-sm font-bold transition hover:bg-gold/20"
                      >
                        <FileDown className="w-4 h-4" />
                        Exporter en PDF
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* ── Mobile Action Bar (sticky) ── */}
          <div className="sm:hidden sticky bottom-4 z-40 flex items-center justify-center pb-2">
            <div className="flex items-center gap-1.5 bg-card/95 backdrop-blur-md border border-border rounded-full px-3 py-2 shadow-lg">
              <button
                type="button"
                onClick={handleToggleLike}
                aria-pressed={isLiked}
                className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  isLiked ? "text-destructive" : "text-muted-foreground"
                }`}
              >
                <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
                {likesCount > 0 && <span>{likesCount}</span>}
              </button>
              <div className="w-px h-4 bg-border" />
              <TTSButton text={teaching.content} lang="fr-FR" size="sm" />
              <div className="w-px h-4 bg-border" />
              <SaveButton
                teachingId={teaching.id}
                teachingTitle={teaching.title}
                size="sm"
                isSaved={savedCollectionIds.length > 0}
                savedCollectionIds={savedCollectionIds}
                collections={collections}
                onToggleCollection={handleToggleCollection}
              />
              <div className="w-px h-4 bg-border" />
              <ShareButton
                title={teaching.title}
                description={teaching.excerpt || teaching.content.substring(0, 160)}
                url={getTeachingPath(teaching)}
                size="sm"
              />
              <div className="w-px h-4 bg-border" />
              <button
                type="button"
                onClick={handleExportPdf}
                title="Exporter fiche PDF"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-semibold text-muted-foreground hover:text-gold transition-all"
              >
                <FileDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ── Social Follow CTA ── */}
          <SocialFollowCTA />

          {/* ── Comments ── */}
          <div id="comments" className="mt-4 mb-16 scroll-mt-24">
            <CommentsSection
              comments={comments}
              commentText={commentText}
              onCommentChange={setCommentText}
              onPublishComment={handleSendComment}
              isPublishingComment={false}
              user={user}
              likesCount={likesCount}
              isLiked={isLiked}
              onToggleLike={handleToggleLike}
              onReply={(commentId, authorName) => {
                setReplyTo({ id: commentId, name: authorName });
                setReplyText("");
              }}
              onToggleCommentLike={handleToggleCommentLike}
              replyingTo={replyTo}
              replyText={replyText}
              onReplyChange={setReplyText}
              onPublishReply={handleSendReply}
              isPublishingReply={false}
              onCancelReply={() => {
                setReplyTo(null);
                setReplyText("");
              }}
            />
          </div>
        </div>

        {/* ── Related Teachings ── */}
        {related.length > 0 && (
          <section className="border-t border-border/60 bg-gradient-to-b from-secondary/40 to-background py-16">
            <div className="container mx-auto px-4 max-w-6xl">
              <div className="flex items-center gap-3 mb-8">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent to-gold/30" />
                <div className="flex items-center gap-2 text-xs font-bold text-gold uppercase tracking-[0.2em]">
                  <BookOpen className="w-4 h-4" />
                  À lire également
                </div>
                <div className="h-px flex-1 bg-gradient-to-l from-transparent to-gold/30" />
              </div>

              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5 mb-10">
                {related.map((rel) => (
                  <RelatedTeachingCard
                    key={rel.id}
                    id={rel.id}
                    title={rel.title}
                    excerpt={rel.excerpt}
                    cover_image_url={rel.cover_image_url}
                    author={rel.author}
                    author_id={rel.author_id}
                    created_at={rel.created_at}
                    country={rel.country}
                    category_name={rel.category_name}
                    is_admin={rel.is_admin}
                  />
                ))}
              </div>

              <div className="text-center">
                <Link
                  to="/feed"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-gold text-slate-950 font-bold text-sm hover:bg-gold/90 transition-all shadow-gold hover:shadow-xl hover:scale-105 active:scale-95"
                >
                  <BookOpen className="w-4 h-4" />
                  Voir tous les enseignements
                </Link>
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
};

// ── Reading Progress Bar ──────────────────────────────────────────────
function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0);
    };
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <div className="fixed top-16 left-0 right-0 z-50 h-[2px] bg-transparent pointer-events-none">
      <div
        className="h-full bg-gradient-to-r from-gold via-gold/80 to-gold transition-[width] duration-75 ease-linear"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

export default TeachingDetail;