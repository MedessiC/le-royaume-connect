import { Heart, MessageSquare } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import CommentItem from "./CommentThread";
import GoldBadge from "./GoldBadge";

type Profile = { id: string; full_name: string | null; has_gold_badge?: boolean };

type Comment = {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  parent_id?: string | null;
  author?: Profile | null;
  likes_count?: number;
  liked_by_me?: boolean;
};

interface CommentsSectionProps {
  comments: Comment[];
  commentText: string;
  onCommentChange: (text: string) => void;
  onPublishComment: () => void;
  isPublishingComment: boolean;
  user?: { id: string; email?: string } | null;
  likesCount: number;
  isLiked: boolean;
  onToggleLike: () => void;
  onReply: (commentId: string, authorName: string) => void;
  onToggleCommentLike: (commentId: string) => void;
  replyingTo?: { id: string; name: string } | null;
  replyText: string;
  onReplyChange: (text: string) => void;
  onPublishReply: () => void;
  isPublishingReply: boolean;
  onCancelReply: () => void;
}

export const CommentsSection = ({
  comments,
  commentText,
  onCommentChange,
  onPublishComment,
  isPublishingComment,
  user,
  likesCount,
  isLiked,
  onToggleLike,
  onReply,
  onToggleCommentLike,
  replyingTo,
  replyText,
  onReplyChange,
  onPublishReply,
  isPublishingReply,
  onCancelReply,
}: CommentsSectionProps) => {
  return (
    <div className="border-t border-border pt-8">
      {/* Engagement Stats */}
      <div className="flex items-center gap-4 mb-6 pb-4 border-b border-border">
        <div className="flex items-center gap-2 text-sm">
          <div className="flex -space-x-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gold to-gold/60 flex items-center justify-center text-xs text-white font-semibold">
              ♡
            </div>
          </div>
          <span className="text-muted-foreground">
            {likesCount} <span className="text-foreground font-medium">{likesCount === 1 ? "J'aime" : "J'aimes"}</span>
          </span>
        </div>
        <span className="text-sm text-muted-foreground">•</span>
        <span className="text-sm text-muted-foreground">
          {comments.filter(c => !c.parent_id).length} <span className="text-foreground font-medium">commentaire{comments.filter(c => !c.parent_id).length === 1 ? "" : "s"}</span>
        </span>
      </div>

      {/* Comment Input */}
      <div className="mb-8 space-y-4">
        {user ? (
          <div className="space-y-3">
            <Textarea
              value={commentText}
              onChange={(e) => onCommentChange(e.target.value)}
              placeholder="Partager vos pensées, vos questions..."
              className="min-h-[100px] rounded-3xl resize-none placeholder:text-muted-foreground"
            />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Button
                onClick={onPublishComment}
                disabled={!commentText.trim() || isPublishingComment}
                className="rounded-full bg-gold hover:bg-gold/90 text-background font-semibold px-6 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                {isPublishingComment ? "Publication..." : "Publier"}
              </Button>
              <Button
                onClick={onToggleLike}
                variant={isLiked ? "default" : "outline"}
                className={`rounded-full px-6 font-semibold ${
                  isLiked
                    ? "bg-red-100 text-red-600 hover:bg-red-200"
                    : "border-2 border-gold text-gold hover:bg-gold/10"
                }`}
              >
                <Heart className={`w-4 h-4 mr-2 ${isLiked ? "fill-current" : ""}`} />
                {isLiked ? "J'aime" : "Aimer"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="rounded-3xl border-2 border-border bg-muted/50 p-6 text-center space-y-4">
            <p className="text-muted-foreground">
              Connectez-vous pour interagir avec ce contenu
            </p>
            <div className="flex justify-center gap-4">
              <Link
                to="/auth"
                className="inline-flex items-center justify-center rounded-full bg-gold px-6 py-2.5 text-sm font-semibold text-background hover:bg-gold/90 transition"
              >
                Se connecter
              </Link>
              <Link
                to="/auth"
                className="inline-flex items-center justify-center rounded-full border-2 border-gold px-6 py-2.5 text-sm font-semibold text-gold hover:bg-gold/10 transition"
              >
                S'inscrire
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Comments List */}
      <div className="space-y-6">
        {comments.filter(c => !c.parent_id).length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>Aucun commentaire pour le moment. Soyez le premier à commenter!</p>
          </div>
        ) : (
          comments
            .filter(c => !c.parent_id)
            .map(comment => {
              const replies = comments.filter(r => r.parent_id === comment.id);
              return (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  replies={replies}
                  onReply={onReply}
                  onToggleLike={onToggleCommentLike}
                  replyingTo={replyingTo}
                  replyText={replyText}
                  onReplyTextChange={onReplyChange}
                  onPublishReply={onPublishReply}
                  currentUser={user}
                />
              );
            })
        )}
      </div>
    </div>
  );
};

export default CommentsSection;
