import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TeachingCard from "@/components/TeachingCard";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { BookOpen } from "lucide-react";
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

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16">
        {/* Hero */}
        <section className="bg-gradient-hero text-primary-foreground py-10">
          <div className="container mx-auto px-4 text-center max-w-3xl">
            <h1 className="font-display text-3xl md:text-5xl font-bold mb-3 leading-tight">
              Fil d'<span className="text-gradient-gold">enseignements</span>
            </h1>
            <p className="mx-auto max-w-2xl text-sm md:text-base text-primary-foreground/85 font-body">
              Découvre rapidement des enseignements structurés, accessibles et organisés pour le voyage spirituel moderne.
            </p>
          </div>
        </section>

        <div className="container mx-auto px-4 py-8 max-w-6xl">
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

          {/* Results */}
          {loading ? (
            <p className="text-center text-muted-foreground py-12">Chargement…</p>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground font-body">
                {teachings.length === 0
                  ? "Aucun enseignement publié pour le moment."
                  : "Aucun résultat pour ces filtres."}
              </p>
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
              </div>

              <div className="flex justify-center mt-6">
                {hasMore && (
                  <button
                    type="button"
                    onClick={() => setPage((p) => p + 1)}
                    className="bg-primary text-primary-foreground px-4 py-2 rounded-full hover:opacity-95"
                  >
                    {loadingMore ? "Chargement…" : "Charger plus"}
                  </button>
                )}
              </div>

              <div ref={(el) => (observerRef.current = el)} className="h-1" />
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Feed;
