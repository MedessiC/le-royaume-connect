import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Bookmark, BookOpen, Trash2 } from "lucide-react";

type Collection = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
};

type TeachingSummary = {
  id: string;
  title: string;
  excerpt: string | null;
  cover_image_url: string | null;
  country: string | null;
  author_id: string | null;
  category_id: string | null;
  created_at: string;
};

type CollectionItemsMap = Record<string, TeachingSummary[]>;

const Collections = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [collectionItems, setCollectionItems] = useState<CollectionItemsMap>({});
  const [loadingCollections, setLoadingCollections] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
      return;
    }

    if (!user) return;

    const loadCollections = async () => {
      setLoadingCollections(true);
      const { data: collectionsData, error: collectionsError } = await supabase
        .from("teaching_collections")
        .select("id, name, description, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (collectionsError) {
        console.error("Failed to load collections", collectionsError);
        toast({ title: "Erreur", description: collectionsError.message, variant: "destructive" });
        setLoadingCollections(false);
        return;
      }

      const collectionsList = collectionsData ?? [];
      setCollections(collectionsList);

      if (!collectionsList.length) {
        setCollectionItems({});
        setLoadingCollections(false);
        return;
      }

      const { data: itemsData, error: itemsError } = await supabase
        .from("teaching_collection_items")
        .select("collection_id, teaching_id")
        .in("collection_id", collectionsList.map((collection) => collection.id));

      if (itemsError) {
        console.error("Failed to load collection items", itemsError);
        toast({ title: "Erreur", description: itemsError.message, variant: "destructive" });
        setCollectionItems({});
        setLoadingCollections(false);
        return;
      }

      const teachingIds = Array.from(new Set((itemsData ?? []).map((item) => item.teaching_id)));
      if (!teachingIds.length) {
        setCollectionItems({});
        setLoadingCollections(false);
        return;
      }

      const { data: teachingsData, error: teachingsError } = await supabase
        .from("teachings")
        .select("id, title, excerpt, cover_image_url, country, author_id, category_id, created_at")
        .in("id", teachingIds);

      if (teachingsError) {
        console.error("Failed to load teachings for collections", teachingsError);
        toast({ title: "Erreur", description: teachingsError.message, variant: "destructive" });
        setCollectionItems({});
        setLoadingCollections(false);
        return;
      }

      const teachingsById = Object.fromEntries((teachingsData ?? []).map((teaching) => [teaching.id, teaching]));
      const itemsMap: CollectionItemsMap = {};
      (itemsData ?? []).forEach((item) => {
        const teaching = teachingsById[item.teaching_id];
        if (!teaching) return;
        itemsMap[item.collection_id] = itemsMap[item.collection_id] ?? [];
        itemsMap[item.collection_id].push(teaching);
      });

      setCollectionItems(itemsMap);
      setLoadingCollections(false);
    };

    loadCollections();
  }, [user, loading, navigate, toast]);

  const handleRemoveTeaching = async (collectionId: string, teachingId: string) => {
    if (!user) return;
    const { error } = await supabase
      .from("teaching_collection_items")
      .delete()
      .eq("collection_id", collectionId)
      .eq("teaching_id", teachingId);

    if (error) {
      console.error("Failed to remove teaching from collection", error);
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      return;
    }

    setCollectionItems((current) => {
      const next = { ...current };
      next[collectionId] = (next[collectionId] ?? []).filter((item) => item.id !== teachingId);
      return next;
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-10">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="font-display text-4xl font-bold text-foreground mb-2">Mes collections</h1>
            <p className="text-muted-foreground max-w-2xl">Retrouvez ici vos enseignements enregistrés et organisez vos favoris.</p>
          </div>
          <Button asChild variant="hero" size="sm">
            <Link to="/account">
              <ArrowLeft className="w-4 h-4" /> Retour au compte
            </Link>
          </Button>
        </div>

        {loadingCollections ? (
          <div className="rounded-[2rem] border border-border bg-card p-10 text-center text-foreground">Chargement de vos collections…</div>
        ) : collections.length === 0 ? (
          <div className="rounded-[2rem] border border-border bg-card p-10 text-center">
            <Bookmark className="mx-auto mb-4 h-12 w-12 text-gold" />
            <h2 className="text-2xl font-semibold text-foreground mb-2">Vous n'avez encore aucune collection</h2>
            <p className="text-sm text-muted-foreground mb-6">Créez une collection depuis une page d'enseignement et enregistrez vos favoris.</p>
            <Button asChild>
              <Link to="/feed">Voir les enseignements</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {collections.map((collection) => {
              const items = collectionItems[collection.id] ?? [];
              return (
                <section key={collection.id} className="rounded-[2rem] border border-border bg-card p-6 shadow-royal">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-semibold text-foreground">{collection.name}</h2>
                      {collection.description ? <p className="text-sm text-muted-foreground mt-1">{collection.description}</p> : null}
                    </div>
                    <Badge variant="secondary" className="text-sm py-2 px-3">
                      {items.length} enseignement{items.length > 1 ? "s" : ""}
                    </Badge>
                  </div>

                  {items.length === 0 ? (
                    <div className="rounded-3xl border border-border bg-background p-5 text-sm text-muted-foreground">
                      Cette collection est vide. Enregistrez des enseignements depuis leur page de détail.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {items.map((teaching) => (
                        <div key={teaching.id} className="flex flex-col gap-4 rounded-3xl border border-border bg-background p-4 md:flex-row md:items-center md:justify-between">
                          <div className="space-y-2">
                            <Link to={`/teachings/${teaching.id}`} className="text-lg font-semibold text-foreground hover:text-gold transition-colors">
                              {teaching.title}
                            </Link>
                            {teaching.excerpt ? <p className="text-sm text-muted-foreground line-clamp-2">{teaching.excerpt}</p> : null}
                          </div>
                          <Button variant="outline" size="sm" onClick={() => handleRemoveTeaching(collection.id, teaching.id)}>
                            <Trash2 className="w-4 h-4" /> Retirer
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Collections;
