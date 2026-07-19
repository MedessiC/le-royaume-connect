import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TeachingCard from "@/components/TeachingCard";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { BookOpen, Loader2, X } from "lucide-react";
import SearchBar from "@/components/SearchBar";

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

type Profile = { id: string; full_name: string | null; has_gold_badge?: boolean };
type Category = { id: string; name: string; slug: string };
type Teaching = {
  id: string;
  title: string;
  excerpt: string | null;
  cover_image_url: string | null;
  video_url: string | null;
  audio_url: string | null;
  country: string | null;
  category_id: string | null;
  author_id: string | null;
  author?: Profile | null;
  created_at: string;
  categories?: { name: string } | null;
};

// Skeleton that mirrors TeachingCard's real proportions — header, title
// block, media aspect-video, footer — so the layout doesn't jump when
// real cards arrive.
const TeachingCardSkeleton = () => (
  <div className="overflow-hidden rounded-2xl border border-border bg-card animate-pulse" aria-hidden="true">
    <div className="flex items-center gap-3 border-b border-border px-4 py-3">
      <div className="h-10 w-10 rounded-full bg-muted flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-1/3 rounded bg-muted" />
        <div className="h-2 w-1/5 rounded bg-muted" />
      </div>
    </div>
    <div className="px-4 pt-4 pb-3 space-y-2">
      <div className="h-2 w-1/4 rounded bg-muted" />
      <div className="h-4 w-4/5 rounded bg-muted" />
      <div className="h-3 w-full rounded bg-muted" />
      <div className="h-3 w-2/3 rounded bg-muted" />
    </div>
    <div className="aspect-video w-full bg-muted" />
    <div className="border-t border-border px-4 py-2.5 space-y-2.5">
      <div className="h-3 w-1/3 rounded bg-muted" />
      <div className="h-8 w-full rounded-lg bg-muted" />
    </div>
  </div>
);

const Feed = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [teachings, setTeachings] = useState<Teaching[]>([]);
  const [page, setPage] = useState(0);
  const pageSize = 12;
  const [hasMore, setHasMore] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [adminAuthorIds, setAdminAuthorIds] = useState<Set<string>>(new Set());
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});
  const [userLikes, setUserLikes] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categoryId, setCategoryId] = useState<string>("all");
  const [country, setCountry] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const observerRef = useRef<HTMLDivElement | null>(null);
  const loadingMoreRef = useRef(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // Debounce search input to avoid firing many requests
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(id);
  }, [search]);

  // Load categories once
  useEffect(() => {
    supabase.from("categories").select("id, name, slug").order("name").then(({ data: cats }) => {
      if (cats) setCategories(cats);
    });
    document.title = "Fil d'enseignements – MILLENIUM";
  }, []);

  const resetAndLoad = useCallback(() => {
    setTeachings([]);
    setPage(0);
    setHasMore(true);
  }, []);

  // Fetch a page with current filters
  const fetchPage = useCallback(
    async (pageIndex: number) => {
      if (!hasMore && pageIndex !== 0) return;
      loadingMoreRef.current = true;
      setLoading(true);
      setLoadingMore(true);

      const start = pageIndex * pageSize;
      const end = start + pageSize - 1;

      let query = supabase
        .from("teachings")
        .select("id, title, excerpt, cover_image_url, video_url, audio_url, country, category_id, author_id, created_at")
        .eq("published", true);

      if (categoryId !== "all") query = query.eq("category_id", categoryId);
      if (country !== "all") query = query.eq("country", country);
      if (debouncedSearch) {
        const like = `%${debouncedSearch.replace(/%/g, "\\%")}%`;
        query = query.or(`title.ilike.${like},excerpt.ilike.${like}`);
      }

      query = query.order("created_at", { ascending: false }).range(start, end);
      const { data: pageData, error } = await query;
      if (error) {
        console.error("Failed to load teachings page", error);
        setLoading(false);
        loadingMoreRef.current = false;
        return;
      }

      const items = (pageData ?? []) as Teaching[];

      // fetch related data for this batch
      const authorIds = Array.from(new Set(items.map((t) => t.author_id).filter(Boolean)));
      const categoryIds = Array.from(new Set(items.map((t) => t.category_id).filter(Boolean)));

      let categoryMap: Record<string, string> = {};
      if (categoryIds.length) {
        const categoriesRes = await supabase.from("categories").select("id, name").in("id", categoryIds);
        if (categoriesRes.data) {
          categoryMap = Object.fromEntries(categoriesRes.data.map((category) => [category.id, category.name]));
        }
      }

      let profileMap: Record<string, Profile> = {};
      let adminIds = new Set<string>();
      if (authorIds.length) {
        const [profilesRes, rolesRes] = await Promise.all([
          supabase.from("profiles").select("id, full_name, avatar_url, has_gold_badge").in("id", authorIds),
          supabase.from("user_roles").select("user_id").eq("role", "admin").in("user_id", authorIds),
        ]);
        if (profilesRes.data) profileMap = Object.fromEntries(profilesRes.data.map((p) => [p.id, p]));
        if (rolesRes.data) rolesRes.data.forEach((r: any) => adminIds.add(r.user_id));
      }

      const teachingIds = items.map((t) => t.id);
      const likeCountMap: Record<string, number> = {};
      const commentCountMap: Record<string, number> = {};
      const likedSet = new Set<string>();

      if (teachingIds.length) {
        const [likesResult, commentsResult] = await Promise.all([
          supabase.from("teaching_likes").select("teaching_id, user_id").in("teaching_id", teachingIds),
          supabase.from("teaching_comments").select("teaching_id").in("teaching_id", teachingIds),
        ]);

        likesResult.data?.forEach((like) => {
          likeCountMap[like.teaching_id] = (likeCountMap[like.teaching_id] ?? 0) + 1;
          if (user && like.user_id === user.id) likedSet.add(like.teaching_id);
        });
        commentsResult.data?.forEach((comment) => {
          commentCountMap[comment.teaching_id] = (commentCountMap[comment.teaching_id] ?? 0) + 1;
        });
      }

      // merge into state
      setAdminAuthorIds((current) => new Set([...Array.from(current), ...Array.from(adminIds)]));
      setLikeCounts((current) => ({ ...current, ...likeCountMap }));
      setCommentCounts((current) => ({ ...current, ...commentCountMap }));
      setUserLikes((current) => {
        const next = new Set(current);
        likedSet.forEach((id) => next.add(id));
        return next;
      });

      const enriched = items.map((t) => ({
        ...t,
        author: t.author_id ? profileMap[t.author_id] ?? null : null,
        categories: t.category_id && categoryMap[t.category_id] ? { name: categoryMap[t.category_id] } : null,
      }));

      setTeachings((prev) => (pageIndex === 0 ? enriched : [...prev, ...enriched]));

      setHasMore(items.length === pageSize);
      setLoading(false);
      setLoadingMore(false);
      loadingMoreRef.current = false;
    },
    [categoryId, country, debouncedSearch, pageSize, user],
  );

  // Reset when filters change
  useEffect(() => {
    resetAndLoad();
    fetchPage(0);
  }, [categoryId, country, debouncedSearch, resetAndLoad, fetchPage]);

  // Load more when page increments
  useEffect(() => {
    if (page === 0) return;
    fetchPage(page);
  }, [page, fetchPage]);

  // IntersectionObserver to trigger loading next page
  useEffect(() => {
    if (!hasMore) return;
    const el = observerRef.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !loadingMoreRef.current) {
          setPage((p) => p + 1);
        }
      });
    });
    io.observe(el);
    return () => io.disconnect();
  }, [hasMore]);

  const setObserverRef = useCallback((el: HTMLDivElement | null) => {
    observerRef.current = el;
  }, []);

  const handleToggleLike = async (teachingId: string) => {
    if (!user) {
      navigate("/auth");
      return;
    }

    const isLiked = userLikes.has(teachingId);
    if (isLiked) {
      const { error } = await supabase
        .from("teaching_likes")
        .delete()
        .eq("teaching_id", teachingId)
        .eq("user_id", user.id);
      if (!error) {
        setUserLikes((current) => {
          const next = new Set(current);
          next.delete(teachingId);
          return next;
        });
        setLikeCounts((current) => ({ ...current, [teachingId]: Math.max((current[teachingId] ?? 1) - 1, 0) }));
      }
      return;
    }

    const { error } = await supabase.from("teaching_likes").insert({ teaching_id: teachingId, user_id: user.id });
    if (!error) {
      setUserLikes((current) => new Set(current).add(teachingId));
      setLikeCounts((current) => ({ ...current, [teachingId]: (current[teachingId] ?? 0) + 1 }));
    }
  };

  const countries = useMemo(() => {
    const set = new Set<string>();
    teachings.forEach((t) => t.country && set.add(t.country));
    return Array.from(set).sort();
  }, [teachings]);

  const filtered = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    return teachings.filter((t) => {
      if (categoryId !== "all" && t.category_id !== categoryId) return false;
      if (country !== "all" && t.country !== country) return false;
      if (q && !t.title.toLowerCase().includes(q) && !(t.excerpt?.toLowerCase().includes(q))) return false;
      return true;
    });
  }, [teachings, debouncedSearch, categoryId, country]);

  const hasActiveFilters = categoryId !== "all" || country !== "all" || debouncedSearch !== "";

  const resetFilters = () => {
    setSearch("");
    setCategoryId("all");
    setCountry("all");
  };

  const isInitialLoading = loading && teachings.length === 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16">
        {/* Hero */}
        <section className="bg-gradient-hero text-primary-foreground py-14 md:py-20">
          <div className="container mx-auto px-4 text-center max-w-3xl">
            <p className="text-xs md:text-sm font-semibold tracking-[0.25em] uppercase text-gold-light mb-4">
              Bibliothèque du mouvement
            </p>
            <h1 className="font-display text-3xl md:text-5xl font-bold mb-4 leading-tight">
              Fil d'<span className="text-gradient-gold">enseignements</span>
            </h1>
            <span className="inline-block w-14 h-px bg-gold-light/60 mb-5" />
            <p className="mx-auto max-w-2xl text-sm md:text-base text-primary-foreground/80 font-body">
              Des enseignements structurés, accessibles et organisés pour le voyage spirituel moderne.
            </p>
          </div>
        </section>

        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="sticky top-16 z-10 -mx-4 px-4 py-3 mb-6 bg-background/80 backdrop-blur-md border-b border-border/60">
            <SearchBar
              search={search}
              setSearch={setSearch}
              categoryId={categoryId}
              setCategoryId={setCategoryId}
              country={country}
              setCountry={setCountry}
              categories={categories}
              countries={countries}
            />
          </div>

          {/* Results */}
          {isInitialLoading ? (
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-live="polite">
              {Array.from({ length: 6 }).map((_, i) => (
                <TeachingCardSkeleton key={i} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 md:py-24">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-muted mb-5">
                <BookOpen className="w-6 h-6 text-muted-foreground" aria-hidden="true" />
              </div>
              <h2 className="font-display text-lg font-bold text-foreground mb-2">
                {teachings.length === 0 ? "Aucun enseignement publié pour le moment" : "Aucun résultat pour ces filtres"}
              </h2>
              <p className="text-muted-foreground font-body text-sm max-w-sm mx-auto mb-6">
                {teachings.length === 0
                  ? "Revenez bientôt : de nouveaux enseignements sont ajoutés régulièrement."
                  : "Essayez d'élargir votre recherche ou de réinitialiser les filtres."}
              </p>
              {hasActiveFilters && teachings.length > 0 && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-gold-dark dark:text-gold-light hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded"
                >
                  <X className="w-3.5 h-3.5" aria-hidden="true" />
                  Réinitialiser les filtres
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {filtered.map((t) => (
                  <TeachingCard
                    key={t.id}
                    id={t.id}
                    title={t.title}
                    excerpt={t.excerpt}
                    cover_image_url={t.cover_image_url}
                    video_url={t.video_url}
                    audio_url={t.audio_url}
                    country={t.country}
                    author={t.author}
                    author_id={t.author_id}
                    created_at={t.created_at}
                    category_name={t.categories?.name}
                    likes_count={likeCounts[t.id] ?? 0}
                    comments_count={commentCounts[t.id] ?? 0}
                    is_liked={userLikes.has(t.id)}
                    is_admin={adminAuthorIds.has(t.author_id ?? "")}
                    onToggleLike={() => handleToggleLike(t.id)}
                    collections={[]}
                    savedCollectionIds={[]}
                    onToggleCollection={() => {}}
                  />
                ))}
                {loadingMore &&
                  Array.from({ length: 3 }).map((_, i) => <TeachingCardSkeleton key={`more-${i}`} />)}
              </div>

              <div className="flex justify-center mt-8">
                {hasMore && (
                  <button
                    type="button"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={loadingMore}
                    className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-full font-medium hover:opacity-95 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    {loadingMore && <Loader2 className="w-4 h-4 motion-safe:animate-spin" aria-hidden="true" />}
                    {loadingMore ? "Chargement…" : "Charger plus"}
                  </button>
                )}
              </div>

              <div ref={setObserverRef} className="h-1" />
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Feed;