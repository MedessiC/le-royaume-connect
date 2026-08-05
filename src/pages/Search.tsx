import { useEffect, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, BookOpen, Users, Search } from "lucide-react";
import UserAvatar from "@/components/UserAvatar";
import SEO from "@/components/SEO";
import { getTeachingPath } from "@/lib/teachingUrl";

type Teaching = {
  id: string;
  slug: string | null;
  title: string;
  excerpt: string | null;
  cover_image_url: string | null;
  author?: { full_name?: string } | null;
};

type Profile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
};

const normalizeSearchTerm = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const getSearchVariants = (value: string) => {
  const normalized = normalizeSearchTerm(value);
  const variants = new Set([value.toLowerCase().trim(), normalized]);
  const aliases: Record<string, string[]> = {
    milenium: ["millenium", "millénium", "mouvement spirituel"],
    millenium: ["milenium", "millénium", "mouvement spirituel"],
    millénium: ["milenium", "millenium", "mouvement spirituel"],
    regne: ["règne", "royaume", "millénaire"],
    royaume: ["règne", "regne", "millénaire"],
    enseignement: ["enseignements", "prédication", "sermon"],
    enseignements: ["enseignement", "prédication", "sermon"],
    predication: ["prédication", "enseignement", "sermon"],
    zoviso: ["zovizo"],
    zovizo: ["zoviso"],
    banikoira: ["banikoara"],
    banikoara: ["banikoira"],
  };

  for (const [key, values] of Object.entries(aliases)) {
    if (normalized.includes(key)) values.forEach((variant) => variants.add(variant));
  }

  return [...variants].filter((term) => term.length >= 2);
};

const escapeSearchTerm = (term: string) => term.replace(/[,%()]/g, " ").trim();

const SearchResults = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [searchInput, setSearchInput] = useState(query);
  const [teachings, setTeachings] = useState<Teaching[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.trim().length < 2) {
      setTeachings([]);
      setProfiles([]);
      return;
    }

    performSearch();
  }, [query]);

  const performSearch = async () => {
    setLoading(true);
    const searchTerms = getSearchVariants(query).map(escapeSearchTerm);
    const teachingFilters = searchTerms.flatMap((term) => [
      `title.ilike.%${term}%`,
      `content.ilike.%${term}%`,
      `excerpt.ilike.%${term}%`,
    ]);
    const profileFilters = searchTerms.flatMap((term) => [
      `full_name.ilike.%${term}%`,
      `bio.ilike.%${term}%`,
    ]);

    try {
      // Search teachings
      const { data: teachingsData } = await supabase
        .from("teachings")
        .select(
          `
          id,
          slug,
          title,
          excerpt,
          cover_image_url,
          author:author_id(id, full_name)
        `
        )
        .eq("published", true)
        .or(teachingFilters.join(","))
        .limit(12);

      // Search profiles
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, bio")
        .or(profileFilters.join(","))
        .limit(12);

      setTeachings((teachingsData || []) as Teaching[]);
      setProfiles((profilesData || []) as Profile[]);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim().length < 2) return;
    setSearchParams({ q: searchInput.trim() });
  };

  const totalResults = teachings.length + profiles.length;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO
        title="Recherche d’enseignements et membres | MILLENIUM"
        description="Recherchez parmi les enseignements et membres de la communauté MILLENIUM. Trouvez les messages de ZOVIZO et du Règne Millénaire."
        path="/search"
        keywords={["recherche MILLENIUM", "milenium", "millénium", "trouver enseignement ZOVIZO", "chercher Règne Millénaire", "prédication Bénin", "zoviso"]}
      />
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8 md:py-12">
        {/* Header */}
        <div className="mb-8 space-y-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-gold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Retour
          </Link>

          <div>
            <h1 className="text-4xl md:text-5xl font-display text-gold mb-4">
              Résultats de recherche
            </h1>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                type="text"
                placeholder="Rechercher enseignements, utilisateurs..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" variant="hero" className="gap-2">
                <Search className="w-4 h-4" /> Chercher
              </Button>
            </form>
          </div>

          {query && (
            <p className="text-sm text-muted-foreground">
              {loading ? (
                "Recherche en cours..."
              ) : totalResults === 0 ? (
                `Aucun résultat pour "${query}"`
              ) : (
                <>{totalResults} résultat{totalResults > 1 ? "s" : ""} trouvé{totalResults > 1 ? "s" : ""} pour "{query}"</>
              )}
            </p>
          )}
        </div>

        {/* Results */}
        {query && !loading && (
          <>
            {/* Teachings */}
            {teachings.length > 0 && (
              <section className="mb-12">
                <div className="flex items-center gap-2 mb-6">
                  <BookOpen className="w-5 h-5 text-gold" />
                  <h2 className="text-2xl font-bold text-foreground">
                    Enseignements ({teachings.length})
                  </h2>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {teachings.map((teaching) => (
                    <Link
                      key={teaching.id}
                      to={getTeachingPath(teaching)}
                      className="group"
                    >
                      <Card className="border-gold/20 overflow-hidden hover:border-gold/40 transition-all">
                        {teaching.cover_image_url && (
                          <div className="relative h-40 overflow-hidden bg-muted">
                            <img
                              src={teaching.cover_image_url}
                              alt={teaching.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          </div>
                        )}
                        <CardContent className="p-4">
                          <h3 className="font-semibold text-foreground group-hover:text-gold line-clamp-2 mb-2">
                            {teaching.title}
                          </h3>
                          {teaching.excerpt && (
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                              {teaching.excerpt}
                            </p>
                          )}
                          {teaching.author && (
                            <p className="text-xs text-muted-foreground">
                              Par {teaching.author.full_name || "Auteur"}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Profiles */}
            {profiles.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-6">
                  <Users className="w-5 h-5 text-gold" />
                  <h2 className="text-2xl font-bold text-foreground">
                    Utilisateurs ({profiles.length})
                  </h2>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {profiles.map((profile) => (
                    <Link
                      key={profile.id}
                      to={`/profile/${profile.id}`}
                      className="group"
                    >
                      <Card className="border-gold/20 p-4 hover:border-gold/40 transition-all">
                        <div className="flex items-center gap-4">
                          <UserAvatar
                            src={profile.avatar_url}
                            name={profile.full_name || "Utilisateur"}
                            className="w-16 h-16"
                          />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-foreground group-hover:text-gold line-clamp-1">
                              {profile.full_name || "Utilisateur"}
                            </h3>
                            {profile.bio && (
                              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                {profile.bio}
                              </p>
                            )}
                          </div>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {totalResults === 0 && (
              <Card className="border-gold/20 text-center p-12">
                <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h2 className="text-lg font-semibold text-foreground mb-2">
                  Aucun résultat trouvé
                </h2>
                <p className="text-muted-foreground">
                  Essayez avec d'autres mots-clés
                </p>
              </Card>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default SearchResults;
