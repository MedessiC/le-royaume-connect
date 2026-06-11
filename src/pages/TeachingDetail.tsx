import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import CommentsSection from "@/components/CommentsSection";
import RelatedTeachingCard from "@/components/RelatedTeachingCard";
import GoldBadge from "@/components/GoldBadge";
import TeachingSEO from "@/components/TeachingSEO";
import ShareButton from "@/components/ShareButton";
import SaveButton from "@/components/SaveButton";
import TTSButton from "@/components/TTSButton";
import UserAvatar from "@/components/UserAvatar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Calendar, MapPin, ArrowLeft, BookOpen, Heart, MessageSquare, Sparkles, Bookmark, Plus, Check } from "lucide-react";

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

const sanitizeHtml = (html: string) =>
  html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/on\w+="[^"]*"/gi, "");

const renderTeachingContent = (content: string) => {
  if (/<[a-z][\s\S]*>/i.test(content)) {
    return <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }} />;
  }
  return <div className="whitespace-pre-wrap">{content}</div>;
};

const getYoutubeEmbedUrl = (url: string) => {
  const patterns = [
    /(?:youtu\.be\/)([A-Za-z0-9_-]{11})/,
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{11})/,
    /([A-Za-z0-9_-]{11})$/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) return `https://www.youtube.com/embed/${match[1]}?rel=0&modestbranding=1`;
  }

  return null;
};

const TeachingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [teaching, setTeaching] = useState<Teaching | null>(null);
  const [loading, setLoading] = useState(true);
  const [related, setRelated] = useState<Array<{
    id: string;
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
    if (!id) return;
    setLoading(true);
    supabase
      .from("teachings")
      .select("id, title, excerpt, content, cover_image_url, video_url, audio_url, country, author_id, created_at, category_id")
      .eq("id", id)
      .eq("published", true)
      .maybeSingle()
      .then(async ({ data }) => {
        if (!data) {
          setTeaching(null);
          setLoading(false);
          return;
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
          .select("id, title, excerpt, cover_image_url, country, author_id, created_at, category_id")
          .eq("published", true)
          .neq("id", data.id)
          .order("created_at", { ascending: false })
          .limit(3)
          .then(async ({ data: rel }) => {
            if (!rel) return;
            
            // Load author data and categories
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
  }, [id, user]);

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
      setLikesCount((count) => count); // keep likes unchanged
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

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center text-muted-foreground">Chargement…</main>
        <Footer />
      </div>
    );
  }

  if (!teaching) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 pt-24 pb-16 text-center">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h1 className="font-display text-2xl font-bold text-foreground mb-3">Enseignement introuvable</h1>
          <Link to="/feed"><Button variant="hero"><ArrowLeft className="w-4 h-4" /> Retour au fil</Button></Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <TeachingSEO
        title={teaching.title}
        description={teaching.excerpt || teaching.content.substring(0, 160)}
        path={`/teachings/${id}`}
        image={teaching.cover_image_url || undefined}
        keywords={[teaching.categories?.name, teaching.country].filter(Boolean) as string[]}
        author={teaching.author ? { name: teaching.author.full_name || "Auteur", id: teaching.author_id || "" } : undefined}
        publishedDate={teaching.created_at}
        modifiedDate={teaching.created_at}
        content={teaching.content}
        categoryName={teaching.categories?.name}
        country={teaching.country || undefined}
      />
      <Navbar />
      <main className="flex-1 pt-16">
        <article className="container mx-auto px-4 max-w-3xl py-10">
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-muted-foreground hover:text-gold inline-flex items-center gap-1 mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> Retour
          </button>

          <div className="flex flex-col gap-4 mb-6">
            <div className="flex flex-wrap items-center gap-2">
              {teaching.categories?.name && (
                <Badge variant="secondary" className="text-[11px] py-1 px-2 rounded-full tracking-[0.16em] uppercase">
                  {teaching.categories.name}
                </Badge>
              )}
              {teaching.country && (
                <Badge variant="outline" className="text-[11px] py-1 px-2 rounded-full tracking-[0.16em] uppercase gap-1">
                  <MapPin className="w-3 h-3" /> {teaching.country}
                </Badge>
              )}
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <UserAvatar src={teaching.author?.avatar_url} name={teaching.author?.full_name || "Auteur"} className="h-11 w-11 flex-shrink-0" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    Publié par{' '}
                    {teaching.author?.id ? (
                      <Link to={`/profile/${teaching.author.id}`} className="text-foreground font-medium hover:text-gold transition-colors flex items-center gap-1 inline-flex">
                        {teaching.isAuthorAdmin ? "@leregnemillenaire" : teaching.author.full_name || "un membre"}
                        <GoldBadge hasGoldBadge={teaching.author.has_gold_badge ?? false} />
                      </Link>
                    ) : (
                      <span className="text-foreground font-medium flex items-center gap-1 inline-flex">{teaching.isAuthorAdmin ? "@leregnemillenaire" : teaching.author?.full_name ?? "un membre"}</span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(teaching.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                </div>
              </div>
              {teaching.isAuthorAdmin && (
                <Badge variant="secondary" className="bg-blue-500 text-white">Admin</Badge>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 mb-6">
            <Button variant="outline" size="sm" onClick={handleToggleLike}>
              <Heart className="w-4 h-4" /> {isLiked ? "J’aime" : "Aimer"} ({likesCount})
            </Button>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Bookmark className="w-4 h-4" />
                  {savedCollectionIds.length > 0 ? `Enregistré (${savedCollectionIds.length})` : "Enregistrer"}
                </Button>
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
                    <p className="text-sm text-muted-foreground">Aucune collection encore. Créez-en une pour organiser vos enseignements.</p>
                  )}

                  <div className="pt-3 border-t border-border">
                    <Label htmlFor="collection-name" className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                      Nouvelle collection
                    </Label>
                    <div className="mt-2 flex gap-2">
                      <Input
                        id="collection-name"
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

            <TTSButton
              text={teaching.content}
              lang={"fr-FR"}
              size="md"
            />
            <ShareButton
              title={teaching.title}
              description={teaching.excerpt || teaching.content.substring(0, 160)}
              url={`/teachings/${id}`}
              size="md"
              variant="outline"
            />
          </div>

          <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground leading-tight mb-4">
            {teaching.title}
          </h1>

          {teaching.excerpt && (
            <p className="text-lg text-muted-foreground font-body italic border-l-4 border-gold pl-4 mb-6">
              {teaching.excerpt}
            </p>
          )}

          {teaching.cover_image_url ? (
            <>
              <div className="prose prose-lg max-w-none text-foreground font-body leading-relaxed mb-6">
                {renderTeachingContent(teaching.content)}
              </div>

              {teaching.video_url && (
                <div className="mb-6 overflow-hidden rounded-3xl border border-border bg-secondary">
                  {getYoutubeEmbedUrl(teaching.video_url) ? (
                    <div className="aspect-video w-full">
                      <iframe
                        className="h-full w-full"
                        src={getYoutubeEmbedUrl(teaching.video_url)}
                        title={teaching.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <video controls src={teaching.video_url} className="w-full rounded-3xl" />
                  )}
                </div>
              )}

              <div className="w-full bg-muted mb-6 rounded-3xl overflow-hidden border border-border shadow-royal">
                <img
                  src={teaching.cover_image_url}
                  alt={teaching.title}
                  className="w-full h-auto object-contain"
                  loading="lazy"
                />
              </div>

              {teaching.audio_url && (
                <div className="mb-6 rounded-3xl border border-border bg-secondary p-4">
                  <audio controls src={teaching.audio_url} className="w-full" />
                </div>
              )}
            </>
          ) : teaching.video_url || teaching.audio_url ? (
            <>
              {teaching.video_url && (
                <div className="mb-6 overflow-hidden rounded-3xl border border-border bg-secondary">
                  {getYoutubeEmbedUrl(teaching.video_url) ? (
                    <div className="aspect-video w-full">
                      <iframe
                        className="h-full w-full"
                        src={getYoutubeEmbedUrl(teaching.video_url)}
                        title={teaching.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <video controls src={teaching.video_url} className="w-full rounded-3xl" />
                  )}
                </div>
              )}

              {teaching.audio_url && (
                <div className="mb-6 rounded-3xl border border-border bg-secondary p-4">
                  <audio controls src={teaching.audio_url} className="w-full" />
                </div>
              )}

              <div className="prose prose-lg max-w-none text-foreground font-body leading-relaxed mb-6">
                {renderTeachingContent(teaching.content)}
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className={`prose prose-lg max-w-none text-foreground font-body leading-relaxed ${!showFullContent ? "line-clamp-6" : ""}`}>
                {renderTeachingContent(teaching.content)}
              </div>
              {!showFullContent && (
                <button
                  type="button"
                  onClick={() => setShowFullContent(true)}
                  className="inline-flex items-center gap-2 rounded-full border border-gold bg-gold/10 px-4 py-2 text-sm font-medium text-gold transition hover:bg-gold/20"
                >
                  Voir plus...
                </button>
              )}
              {showFullContent && (
                <button
                  type="button"
                  onClick={() => setShowFullContent(false)}
                  className="inline-flex items-center gap-2 rounded-full border border-gold bg-gold/10 px-4 py-2 text-sm font-medium text-gold transition hover:bg-gold/20"
                >
                  Voir moins
                </button>
              )}
            </div>
          )}

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
        </article>

        {/* Related Teachings */}
        {related.length > 0 && (
          <section className="relative bg-gradient-to-b from-background via-gold/3 to-gold/8 py-20 border-t border-gold/20 overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute inset-0 opacity-30 pointer-events-none">
              <div className="absolute top-10 left-5% w-72 h-72 bg-gold/5 rounded-full blur-3xl" />
              <div className="absolute bottom-10 right-5% w-96 h-96 bg-royal/5 rounded-full blur-3xl" />
            </div>

            <div className="container mx-auto px-4 max-w-6xl relative z-10">
              {/* Section Header */}
              <div className="mb-16 text-center">
                {/* Top Label */}
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="h-px w-8 md:w-12 bg-gradient-to-r from-gold/0 to-gold/60" />
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-gold animate-pulse" />
                    <span className="text-xs md:text-sm font-semibold text-gold uppercase tracking-widest letter-spacing-2">
                      Continuer votre lecture
                    </span>
                    <Sparkles className="w-5 h-5 text-gold animate-pulse" />
                  </div>
                  <div className="h-px w-8 md:w-12 bg-gradient-to-l from-gold/0 to-gold/60" />
                </div>

                {/* Main Title */}
                <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 leading-tight">
                  À lire également
                </h2>

                {/* Subtitle */}
                <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                  Découvrez d'autres enseignements pour approfondir votre compréhension spirituelle
                </p>

                {/* Decorative line below subtitle */}
                <div className="flex items-center justify-center gap-2 mt-6">
                  <div className="h-px w-6 bg-gold/30" />
                  <BookOpen className="w-4 h-4 text-gold/50" />
                  <div className="h-px w-6 bg-gold/30" />
                </div>
              </div>

              {/* Related Cards Grid */}
              <div className="grid md:grid-cols-3 gap-6 lg:gap-8 mb-16">
                {related.map((teaching) => (
                  <RelatedTeachingCard
                    key={teaching.id}
                    id={teaching.id}
                    title={teaching.title}
                    excerpt={teaching.excerpt}
                    cover_image_url={teaching.cover_image_url}
                    author={teaching.author}
                    author_id={teaching.author_id}
                    created_at={teaching.created_at}
                    country={teaching.country}
                    category_name={teaching.category_name}
                    is_admin={teaching.is_admin}
                  />
                ))}
              </div>

              {/* CTA Section */}
              <div className="mt-12 text-center">
                <p className="text-sm text-muted-foreground mb-6">Vous cherchez plus d'enseignements inspirants ?</p>
                <Link
                  to="/feed"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-gold to-gold/80 hover:from-gold/95 hover:to-gold/70 text-background font-semibold transition-all duration-300 hover:shadow-xl hover:shadow-gold/40 hover:scale-105 active:scale-95"
                >
                  <BookOpen className="w-5 h-5" />
                  Voir tous les enseignements
                  <ArrowLeft className="w-4 h-4 rotate-180" />
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

export default TeachingDetail;
