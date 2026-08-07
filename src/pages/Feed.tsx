import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useNavigate, Link, useParams, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TeachingCard from "@/components/TeachingCard";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { BookOpen, Loader2, X, Grid, List, Filter, Calendar, MapPin, AudioLines, Video, ChevronRight, Layers, LayoutGrid, ArrowUp } from "lucide-react";
import SearchBar from "@/components/SearchBar";
import SEO from "@/components/SEO";
import TeachingCoverFallback from "@/components/TeachingCoverFallback";
import { getTeachingPath } from "@/lib/teachingUrl";
import VideoPlayer from "@/components/VideoPlayer";

type Profile = { id: string; full_name: string | null; has_gold_badge?: boolean };
type Category = { id: string; name: string; slug: string };
type Teaching = {
  id: string;
  slug: string | null;
  title: string;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  video_url: string | null;
  video_thumbnail_url: string | null;
  audio_url: string | null;
  country: string | null;
  category_id: string | null;
  author_id: string | null;
  author?: Profile | null;
  created_at: string;
  categories?: { name: string } | null;
};

const TeachingCardSkeleton = ({ viewMode }: { viewMode: "grid" | "list" }) => (
  <div
    className={`overflow-hidden rounded-2xl border border-border bg-card animate-pulse shadow-sm ${
      viewMode === "list" ? "flex flex-col md:flex-row gap-4 p-4" : "flex flex-col"
    }`}
    aria-hidden="true"
  >
    <div className={`bg-muted flex-shrink-0 ${viewMode === "list" ? "w-full md:w-48 aspect-video rounded-xl" : "aspect-video w-full"}`} />
    <div className="flex-1 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <div className="h-3 w-16 rounded bg-muted" />
        <div className="h-3 w-12 rounded bg-muted" />
      </div>
      <div className="h-5 w-4/5 rounded bg-muted" />
      <div className="h-3 w-full rounded bg-muted" />
      <div className="h-3 w-2/3 rounded bg-muted" />
      <div className="pt-2 flex gap-3">
        <div className="h-8 w-16 rounded-full bg-muted" />
        <div className="h-8 w-16 rounded-full bg-muted" />
      </div>
    </div>
  </div>
);

const Feed = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { slug } = useParams<{ slug?: string }>();
  const [searchParams] = useSearchParams();
  const [teachings, setTeachings] = useState<Teaching[]>([]);
  const [page, setPage] = useState(0);
  const pageSize = 24; // Increased page size to get enough elements for category grouping
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
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [layoutMode, setLayoutMode] = useState<"timeline" | "categories">("timeline");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const observerRef = useRef<HTMLDivElement | null>(null);
  const loadingMoreRef = useRef(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // Debounce search
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(id);
  }, [search]);

  // Load categories & page settings
  useEffect(() => {
    supabase.from("categories").select("id, name, slug").order("name").then(({ data: cats }) => {
      if (cats) {
        setCategories(cats);
        const categoryParam = slug || searchParams.get("category");
        if (categoryParam && categoryParam !== "all") {
          const category = cats.find((item) => item.slug === categoryParam || item.id === categoryParam);
          if (category) setCategoryId(category.id);
        }
      }
    });
    document.title = "Bibliothèque des enseignements – MILLENIUM";
  }, [searchParams, slug]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
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
        .select("id, slug, title, excerpt, content, cover_image_url, video_url, video_thumbnail_url, audio_url, country, category_id, author_id, created_at")
        .eq("published", true);

      if (categoryId !== "all") query = query.eq("category_id", categoryId);
      if (country !== "all") query = query.eq("country", country);
      if (debouncedSearch) {
        const like = `%${debouncedSearch.replace(/%/g, "\\%")}%`;

        // Chercher d'abord les auteurs qui correspondent au nom recherché
        const { data: matchingProfiles } = await supabase
          .from("profiles")
          .select("id")
          .ilike("full_name", like);

        const matchingAuthorIds = matchingProfiles?.map((p) => p.id) ?? [];

        if (matchingAuthorIds.length > 0) {
          query = query.or(`title.ilike.${like},excerpt.ilike.${like},author_id.in.(${matchingAuthorIds.join(",")})`);
        } else {
          query = query.or(`title.ilike.${like},excerpt.ilike.${like}`);
        }
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

      // fetch related details
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

  // Reset filter triggers
  useEffect(() => {
    resetAndLoad();
    fetchPage(0);
  }, [categoryId, country, debouncedSearch, resetAndLoad, fetchPage]);

  // Infinite Scroll page increments
  useEffect(() => {
    if (page === 0) return;
    fetchPage(page);
  }, [page, fetchPage]);

  // Observer callback (only active in timeline layout)
  useEffect(() => {
    if (!hasMore || layoutMode !== "timeline") return;
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
  }, [hasMore, layoutMode]);

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

  // Group teachings by category for the shelves view
  const categorizedTeachings = useMemo(() => {
    const groups: Record<string, { categoryName: string; list: Teaching[] }> = {};
    
    filtered.forEach((t) => {
      const catName = t.categories?.name || "Non classé";
      if (!groups[catName]) {
        groups[catName] = { categoryName: catName, list: [] };
      }
      groups[catName].list.push(t);
    });

    return Object.values(groups).sort((a, b) => a.categoryName.localeCompare(b.categoryName));
  }, [filtered]);

  // Featured teaching: the most recent item when no filters are set
  const featuredTeaching = useMemo(() => {
    if (categoryId !== "all" || country !== "all" || debouncedSearch) return null;
    return teachings[0] || null;
  }, [teachings, categoryId, country, debouncedSearch]);

  const cardsList = useMemo(() => {
    if (featuredTeaching) {
      return filtered.filter((t) => t.id !== featuredTeaching.id);
    }
    return filtered;
  }, [filtered, featuredTeaching]);

  const hasActiveFilters = categoryId !== "all" || country !== "all" || debouncedSearch !== "";

  const resetFilters = () => {
    setSearch("");
    setCategoryId("all");
    setCountry("all");
  };

  const isInitialLoading = loading && teachings.length === 0;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <SEO
        title="Enseignements — Bibliothèque spirituelle | MILLENIUM"
        description="Accédez à tous les enseignements de MILLENIUM. Audios, vidéos et articles du mouvement spirituel mondial fondé par ZOVIZO."
        path="/feed"
        keywords={["enseignements MILLENIUM", "ZOVIZO enseignement", "enseignement biblique", "Le Règne Millénaire", "sermons"]}
      />
      <Navbar />

      <main className="flex-1 pt-16">
        {/* ── Header Hero banner ── */}
        <section className="relative overflow-hidden bg-gradient-hero text-primary-foreground py-16 md:py-24">
          <img
            src="https://images.unsplash.com/photo-1523805009345-7448845a9e53?auto=format&fit=crop&w=1800&q=85"
            alt="Jeunes Africains réunis pour apprendre et échanger"
            loading="eager"
            className="absolute inset-0 z-0 h-full w-full object-cover opacity-60"
          />
          <div className="absolute inset-0 z-0 bg-slate-950/40" />
          <div className="absolute inset-0 hero-grid-overlay opacity-10 pointer-events-none" />
          <div className="absolute top-1/2 left-1/4 w-72 h-72 rounded-full bg-gold/5 blur-[90px] pointer-events-none" />
          
          <div className="container mx-auto px-4 text-center max-w-3xl relative z-10 space-y-4">
            <div className="hero-badge mx-auto">
              <span className="hero-badge-dot" />
              <span className="hero-badge-text">Bibliothèque Divine</span>
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-extrabold tracking-tight text-white">
              Parcourir les <span className="text-gradient-gold">enseignements</span>
            </h1>
            <div className="hero-divider">
              <span className="hero-divider-line" />
              <span className="hero-divider-emblem">✦</span>
              <span className="hero-divider-line" />
            </div>
            <p className="mx-auto max-w-xl text-sm md:text-base text-white/70 font-body leading-relaxed">
              Explorez les messages, études de foi et révélations partagés pour grandir ensemble dans la vision divine.
            </p>
          </div>
        </section>

        <div className="container mx-auto px-4 py-8 max-w-6xl">
          
          {/* ── View & Layout Toggles ── */}
          <div className="relative -mx-4 px-4 py-4 mb-8 bg-background/90 backdrop-blur-md border-b border-border/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1">
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

            {/* Layout switch tabs + Grid/List buttons */}
            <div className="flex flex-wrap items-center gap-3 self-end md:self-auto">
              
              {/* Organized vs List/Timeline Toggle */}
              <div className="flex bg-secondary/80 rounded-xl p-0.5 border border-border/40 text-xs">
                <button
                  type="button"
                  onClick={() => setLayoutMode("categories")}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold transition-all ${
                    layoutMode === "categories" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Par Catégories</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLayoutMode("timeline")}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold transition-all ${
                    layoutMode === "timeline" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Fil Récent</span>
                </button>
              </div>

              {/* Grid/List toggler (only for chronological feed) */}
              {layoutMode === "timeline" && (
                <div className="flex bg-secondary/80 rounded-xl p-0.5 border border-border/40">
                  <button
                    type="button"
                    onClick={() => setViewMode("grid")}
                    aria-label="Mode Grille"
                    className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("list")}
                    aria-label="Mode Liste"
                    className={`p-2 rounded-lg transition-all ${viewMode === "list" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ── Active Quick Filters bar ── */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mr-1">
                <Filter className="w-3 h-3" /> Filtres actifs :
              </span>
              {categoryId !== "all" && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/10 border border-gold/20 text-gold text-xs font-medium">
                  Catégorie : {categories.find((c) => c.id === categoryId)?.name}
                  <button type="button" onClick={() => setCategoryId("all")} className="hover:text-white"><X className="w-3 h-3" /></button>
                </span>
              )}
              {country !== "all" && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary border border-border text-xs font-medium text-foreground">
                  Pays : {country}
                  <button type="button" onClick={() => setCountry("all")} className="hover:text-gold"><X className="w-3 h-3" /></button>
                </span>
              )}
              {debouncedSearch && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary border border-border text-xs font-medium text-foreground">
                  Recherche : "{search}"
                  <button type="button" onClick={() => setSearch("")} className="hover:text-gold"><X className="w-3 h-3" /></button>
                </span>
              )}
              <button
                type="button"
                onClick={resetFilters}
                className="text-xs font-bold text-gold hover:underline ml-2"
              >
                Tout effacer
              </button>
            </div>
          )}

          {/* ── Loading / Empty States ── */}
          {isInitialLoading ? (
            <div className={`grid gap-6 ${viewMode === "list" ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"}`}>
              {Array.from({ length: 6 }).map((_, i) => (
                <TeachingCardSkeleton key={i} viewMode={viewMode} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 border border-border/40 rounded-3xl bg-secondary/20">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gold/10 text-gold mb-4">
                <BookOpen className="w-8 h-8" />
              </div>
              <h3 className="font-display text-lg font-bold text-foreground mb-2">
                Aucun résultat trouvé
              </h3>
              <p className="text-muted-foreground text-sm font-body max-w-sm mx-auto mb-6">
                Essayez de modifier vos filtres, de chercher un autre mot-clé ou de réinitialiser la recherche.
              </p>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="px-5 py-2 rounded-xl bg-gold text-slate-950 text-xs font-bold hover:bg-gold/90 transition-all shadow-gold"
                >
                  Réinitialiser les filtres
                </button>
              )}
            </div>
          ) : (
            <>
              {/* ── LAYOUT 1: Grouped By Category shelves (Netflix/PWA Style, highly optimized for mobile swipe) ── */}
              {layoutMode === "categories" && (
                <div className="space-y-12">
                  {/* Top Shelf: Recent & New Teachings */}
                  {filtered.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between pb-2 border-b border-border/50">
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-6 bg-red-600 rounded-full" />
                          <h3 className="font-display text-lg sm:text-xl font-bold text-foreground tracking-tight">
                            Récents & Nouveautés
                          </h3>
                          <span className="text-xs text-muted-foreground font-body bg-secondary px-2.5 py-0.5 rounded-full">
                            Nouveau
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setLayoutMode("timeline")}
                          className="inline-flex items-center gap-1 text-xs font-bold text-gold hover:underline"
                        >
                          Voir tout en fil
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="relative -mx-4 px-4 md:mx-0 md:px-0">
                        <div className="flex gap-5 overflow-x-auto snap-x scrollbar-none pb-4 scroll-smooth">
                          {filtered.slice(0, 6).map((t) => (
                            <div
                              key={`recent-${t.id}`}
                              className="w-[280px] sm:w-[320px] flex-shrink-0 snap-start motion-safe:hover:scale-[1.01] transition-transform duration-300"
                            >
                              <TeachingCard
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
                                viewMode="grid"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {categorizedTeachings.map((group) => (
                    <div key={group.categoryName} className="space-y-4">
                      {/* Category Title Shelf Header */}
                      <div className="flex items-center justify-between pb-2 border-b border-border/50">
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-6 bg-gold rounded-full" />
                          <h3 className="font-display text-lg sm:text-xl font-bold text-foreground tracking-tight">
                            {group.categoryName}
                          </h3>
                          <span className="text-xs text-muted-foreground font-body bg-secondary px-2 py-0.5 rounded-full">
                            {group.list.length}
                          </span>
                        </div>

                        {/* Quick filter shortcut */}
                        {group.list.length > 0 && group.categoryName !== "Non classé" && (
                          <button
                            type="button"
                            onClick={() => {
                              const found = categories.find((c) => c.name === group.categoryName);
                              if (found) {
                                setCategoryId(found.id);
                                setLayoutMode("timeline");
                              }
                            }}
                            className="inline-flex items-center gap-1 text-xs font-bold text-gold hover:underline"
                          >
                            Voir tout
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Horizontal Swipe Shelf Container (optimized mobile snap scrolling) */}
                      <div className="relative -mx-4 px-4 md:mx-0 md:px-0">
                        <div className="flex gap-5 overflow-x-auto snap-x scrollbar-none pb-4 scroll-smooth">
                          {group.list.map((t) => (
                            <div
                              key={t.id}
                              className="w-[280px] sm:w-[320px] flex-shrink-0 snap-start motion-safe:hover:scale-[1.01] transition-transform duration-300"
                            >
                              <TeachingCard
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
                                viewMode="grid"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ── LAYOUT 2: Chronological Timeline Feed (Standard Grid/List) ── */}
              {layoutMode === "timeline" && (
                <div className="space-y-10">
                  {/* Large Featured Teaching (only in chronological, unfiltered mode) */}
                  {featuredTeaching && (
                    <div className="group relative rounded-3xl overflow-hidden border border-border/80 bg-card shadow-md hover:shadow-lg transition-all duration-300">
                      <div className="flex flex-col lg:flex-row gap-6">
                        <div className="w-full lg:w-[55%] aspect-video lg:aspect-auto min-h-[300px] bg-muted relative overflow-hidden flex-shrink-0">
                          {featuredTeaching.video_url ? (
                            <VideoPlayer
                              src={featuredTeaching.video_url}
                              title={featuredTeaching.title}
                              poster={featuredTeaching.video_thumbnail_url ?? undefined}
                              framed={false}
                              lazy={false}
                              className="h-full w-full"
                            />
                          ) : featuredTeaching.cover_image_url ? (
                            <img
                              src={featuredTeaching.cover_image_url}
                              alt={featuredTeaching.title}
                              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                            />
                          ) : (
                            <TeachingCoverFallback
                              title={featuredTeaching.title}
                              className="w-full h-full"
                            />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none lg:hidden" />
                          <span className="absolute top-4 left-4 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gold text-slate-950 text-[10px] font-bold uppercase tracking-wider shadow-gold z-10 pointer-events-none">
                            À la Une
                          </span>
                        </div>

                        <div className="flex-1 p-6 md:p-8 flex flex-col justify-between">
                          <div className="space-y-4">
                            <div className="flex flex-wrap items-center gap-2.5">
                              {featuredTeaching.categories?.name && (
                                <span className="text-[10px] font-bold tracking-widest text-gold uppercase bg-gold/10 border border-gold/25 px-2.5 py-0.5 rounded-full">
                                  {featuredTeaching.categories.name}
                                </span>
                              )}
                              {featuredTeaching.country && (
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <MapPin className="w-3.5 h-3.5" /> {featuredTeaching.country}
                                </span>
                              )}
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                {new Date(featuredTeaching.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}
                              </span>
                            </div>

                            <h2 className="font-display text-2xl md:text-3xl font-extrabold text-foreground group-hover:text-gold transition-colors leading-tight">
                              <Link to={getTeachingPath(featuredTeaching)}>{featuredTeaching.title}</Link>
                            </h2>

                            {featuredTeaching.excerpt && (
                              <p className="text-sm text-muted-foreground font-body leading-relaxed line-clamp-3">
                                {featuredTeaching.excerpt}
                              </p>
                            )}

                            <div className="flex items-center gap-3 pt-2">
                              {featuredTeaching.audio_url && (
                                <span className="inline-flex items-center gap-1 text-xs text-gold/90 bg-gold/5 border border-gold/10 px-2 py-1 rounded-lg">
                                  <AudioLines className="w-3.5 h-3.5" /> Audio
                                </span>
                              )}
                              {featuredTeaching.video_url && (
                                <span className="inline-flex items-center gap-1 text-xs text-primary bg-primary/5 border border-primary/10 px-2 py-1 rounded-lg">
                                  <Video className="w-3.5 h-3.5" /> Vidéo
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="pt-6 border-t border-border/40 mt-6 flex items-center justify-between">
                            <span className="text-xs text-muted-foreground font-body">
                              Publié par <span className="font-bold text-foreground">@leregnemillenaire</span>
                            </span>
                            
                            <Link
                              to={getTeachingPath(featuredTeaching)}
                              className="inline-flex items-center gap-1.5 text-xs font-bold text-gold hover:underline group/btn"
                            >
                              Lire l'enseignement
                              <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Main Grid/List */}
                  <div
                    className={`grid gap-6 ${
                      viewMode === "list" ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                    }`}
                  >
                    {cardsList.map((t) => (
                      <TeachingCard
                        key={t.id}
                        id={t.id}
                        title={t.title}
                        excerpt={t.excerpt}
                        cover_image_url={t.cover_image_url}
                        video_url={t.video_url}
                        video_thumbnail_url={t.video_thumbnail_url}
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
                        viewMode={viewMode}
                      />
                    ))}
                    
                    {loadingMore &&
                      Array.from({ length: 3 }).map((_, i) => (
                        <TeachingCardSkeleton key={`more-${i}`} viewMode={viewMode} />
                      ))}
                  </div>

                  {/* Infinite Scroll trigger */}
                  <div className="flex justify-center mt-12">
                    {hasMore && (
                      <button
                        type="button"
                        onClick={() => setPage((p) => p + 1)}
                        disabled={loadingMore}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gold hover:bg-gold/90 text-slate-950 font-bold text-xs tracking-wider uppercase transition-all shadow-gold disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {loadingMore && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                        {loadingMore ? "Chargement…" : "Charger plus d'enseignements"}
                      </button>
                    )}
                  </div>

                  <div ref={setObserverRef} className="h-1" />
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {showScrollTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Retour en haut"
          className="fixed bottom-5 right-5 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-border/70 bg-background/95 text-foreground shadow-lg backdrop-blur transition hover:scale-105"
        >
          <ArrowUp className="h-4 w-4" />
        </button>
      )}

      <Footer />
    </div>
  );
};

export default Feed;