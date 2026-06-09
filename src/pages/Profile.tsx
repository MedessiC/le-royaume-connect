import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import UserAvatar from "@/components/UserAvatar";
import { Button } from "@/components/ui/button";
import GoldBadge from "@/components/GoldBadge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, BookOpen, MapPin } from "lucide-react";

type PublicProfile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  country: string | null;
  phone: string | null;
  bio: string | null;
  created_at: string | null;
  has_gold_badge?: boolean;
};

type Teaching = {
  id: string;
  title: string;
  excerpt: string | null;
  cover_image_url: string | null;
  created_at: string;
};

const Profile = () => {
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [teachings, setTeachings] = useState<Teaching[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);

    const load = async () => {
      const [{ data: profileData }, { data: teachingsData }] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, full_name, avatar_url, country, phone, bio, created_at, has_gold_badge")
          .eq("id", id)
          .maybeSingle(),
        supabase
          .from("teachings")
          .select("id, title, excerpt, cover_image_url, created_at")
          .eq("published", true)
          .eq("author_id", id)
          .order("created_at", { ascending: false })
          .limit(6),
      ]);

      let profileRecord = profileData ?? null;

      if (!profileRecord && user?.id === id) {
        const fullName = user.user_metadata?.full_name ?? user.user_metadata?.name ?? "";
        const avatarUrl = user.user_metadata?.avatar_url ?? null;
        const insertResult = await supabase.from("profiles").insert({
          id,
          full_name: fullName || null,
          avatar_url: avatarUrl,
          phone: user.user_metadata?.phone_number ?? null,
        }).select("id, full_name, avatar_url, country, phone, bio, created_at, has_gold_badge").maybeSingle();

        profileRecord = insertResult.data ?? null;
      }

      setProfile(profileRecord);
      setTeachings((teachingsData ?? []) as Teaching[]);
      setLoading(false);
    };

    load();
  }, [id, user]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center text-muted-foreground">Chargement…</main>
        <Footer />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 pt-24 pb-16 text-center">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h1 className="font-display text-3xl font-bold text-foreground mb-3">Profil introuvable</h1>
          <p className="text-muted-foreground mb-6">L'utilisateur recherché n'existe pas ou n'a pas encore de profil public. Si c'est votre profil, mettez-le à jour depuis votre compte.</p>
          <Link to="/feed">
            <Button variant="hero">
              <ArrowLeft className="w-4 h-4" /> Retour au fil
            </Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const initials = (profile.full_name || "Utilisateur").split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-10">
        <div className="mb-6">
          <Link to="/feed" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-gold transition-colors">
            <ArrowLeft className="w-4 h-4" /> Retour au fil
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <Card className="border-gold/20 bg-gradient-to-b from-gold/5 to-background overflow-hidden">
            <CardContent className="space-y-6 pt-6">
              {/* Avatar Section */}
              <div className="flex flex-col items-center text-center gap-4">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-gold/20 to-royal/20 rounded-full blur-2xl -z-10" />
                  <UserAvatar
                    src={profile.avatar_url}
                    name={profile.full_name || "Membre"}
                    className="h-32 w-32 border-4 border-gold/30 shadow-lg"
                  />
                </div>

                {/* Profile Info */}
                <div className="space-y-3 w-full">
                  <div className="flex items-center justify-center gap-2">
                    <h1 className="text-2xl font-semibold text-foreground">{profile.full_name || "Membre"}</h1>
                    <GoldBadge hasGoldBadge={profile.has_gold_badge ?? false} />
                  </div>

                  {profile.country && (
                    <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                      <MapPin className="w-4 h-4 text-gold" /> {profile.country}
                    </p>
                  )}

                  {profile.phone && (
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">Téléphone :</span> {profile.phone}
                    </p>
                  )}
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-gold/0 via-gold/30 to-gold/0" />

              {/* Bio Section */}
              <div className="space-y-3">
                {profile.bio ? (
                  <div className="rounded-xl border border-gold/20 bg-gold/5 p-4 space-y-2">
                    <h2 className="font-semibold text-sm text-foreground">À propos</h2>
                    <p className="leading-relaxed text-sm text-foreground">{profile.bio}</p>
                  </div>
                ) : (
                  <div className="rounded-xl border border-border bg-muted/50 p-4 text-sm text-muted-foreground italic">
                    Cette personne n'a pas encore ajouté de biographie publique.
                  </div>
                )}
              </div>

              {/* Meta Info */}
              <div className="text-center space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-widest">Profil public</p>
                <p className="text-xs text-muted-foreground">
                  Membre depuis {profile.created_at ? new Date(profile.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : "Date inconnue"}
                </p>
              </div>
            </CardContent>
          </Card>

          <section className="space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground uppercase tracking-[0.24em]">Enseignements</p>
                <h2 className="text-2xl font-semibold text-foreground">Derniers contenus</h2>
              </div>
              <Link to="/feed" className="text-sm text-gold hover:text-gold/90">Voir tout</Link>
            </div>

            {teachings.length === 0 ? (
              <Card className="border-border bg-muted p-6 text-center text-muted-foreground">
                Aucun enseignement public pour le moment.
              </Card>
            ) : (
              <div className="space-y-4">
                {teachings.map((teaching) => (
                  <Card key={teaching.id} className="border-border hover:shadow-lg transition-shadow">
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-semibold text-lg text-foreground">{teaching.title}</h3>
                        <span className="text-xs text-muted-foreground">{new Date(teaching.created_at).toLocaleDateString("fr-FR")}</span>
                      </div>
                      {teaching.excerpt && <p className="text-sm text-muted-foreground line-clamp-3">{teaching.excerpt}</p>}
                      <Link to={`/teachings/${teaching.id}`} className="inline-flex items-center gap-2 text-sm text-gold hover:text-gold/90">
                        Voir l'enseignement <ArrowLeft className="w-3 h-3 rotate-180" />
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;
