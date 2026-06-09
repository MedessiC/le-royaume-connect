import { Link } from "react-router-dom";
import { Calendar, MapPin, User, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import UserAvatar from "@/components/UserAvatar";

type Profile = { id: string; full_name: string | null; avatar_url?: string | null };

type RelatedTeachingProps = {
  id: string;
  title: string;
  excerpt?: string | null;
  cover_image_url: string | null;
  author?: Profile | null;
  author_id: string | null;
  created_at: string;
  country?: string | null;
  category_name?: string;
  is_admin?: boolean;
};

const getInitials = (name: string | null | undefined) => {
  if (!name) return "?";
  return name
    .split(/\s+/)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: new Date(dateString).getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
  });
};

export const RelatedTeachingCard = ({
  id,
  title,
  excerpt,
  cover_image_url,
  author,
  author_id,
  created_at,
  country,
  category_name,
  is_admin = false,
}: RelatedTeachingProps) => {
  const authorName = author?.full_name ?? "Membre";
  const authorInitials = getInitials(author?.full_name);

  return (
    <Link
      to={`/teachings/${id}`}
      className="group overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:shadow-lg hover:-translate-y-1 flex flex-col h-full"
    >
      {/* Image Container */}
      {cover_image_url ? (
        <div className="relative overflow-hidden bg-muted aspect-video w-full group-hover:opacity-90 transition-opacity">
          <img
            src={cover_image_url}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          {category_name && (
            <div className="absolute top-3 left-3">
              <Badge className="bg-gold/90 text-background text-[10px] rounded-full">
                {category_name}
              </Badge>
            </div>
          )}
          {country && (
            <div className="absolute top-3 right-3">
              <Badge variant="secondary" className="text-[10px] rounded-full bg-background/80 text-foreground">
                <MapPin className="w-3 h-3 mr-1" />
                {country}
              </Badge>
            </div>
          )}
        </div>
      ) : (
        <div className="aspect-video bg-gradient-to-br from-gold/20 to-gold/5 flex items-center justify-center">
          <div className="text-center">
            <div className="text-gold/40 text-3xl mb-2">📖</div>
            <p className="text-xs text-muted-foreground">Sans image</p>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 flex flex-col p-4 space-y-3">
        {/* Title */}
        <h3 className="font-display font-bold text-sm sm:text-base text-foreground line-clamp-2 group-hover:text-gold transition-colors leading-tight">
          {title}
        </h3>

        {/* Excerpt */}
        {excerpt && (
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {excerpt}
          </p>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Footer */}
        <div className="space-y-3 border-t border-border/50 pt-3">
          {/* Author */}
          <div className="flex items-center gap-2">
            <UserAvatar src={author?.avatar_url} name={author?.full_name || "Auteur"} className="h-7 w-7" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground truncate">
                {is_admin ? "@leregnemillenaire" : authorName}
              </p>
              <p className="text-[10px] text-muted-foreground">{formatDate(created_at)}</p>
            </div>
          </div>

          {/* Read More Button */}
          <button
            type="button"
            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold text-gold bg-gold/10 group-hover:bg-gold/20 transition-colors"
          >
            Lire la suite
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </Link>
  );
};

export default RelatedTeachingCard;
