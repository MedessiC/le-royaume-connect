import { useState } from "react";
import { Heart, MessageSquare } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import UserAvatar from "@/components/UserAvatar";
import GoldBadge from "./GoldBadge";

type Profile = { id: string; full_name: string | null; avatar_url?: string | null; has_gold_badge?: boolean };

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

interface CommentThreadProps {
  comment: Comment;
  replies: Comment[];
  onReply: (commentId: string, authorName: string) => void;
  onToggleLike: (commentId: string) => void;
  replyingTo?: { id: string; name: string } | null;
  replyText?: string;
  onReplyTextChange?: (text: string) => void;
  onPublishReply?: () => void;
  currentUser?: { id: string; email?: string } | null;
}

const getInitials = (name: string | null | undefined, email?: string) => {
  if (name) return name.split(/\s+/).map(n => n[0]).join("").toUpperCase().slice(0, 2);
  if (email) return email.split("@")[0].substring(0, 2).toUpperCase();
  return "?";
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "À l'instant";
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}j`;
  
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: diffDays > 365 ? "numeric" : undefined });
};

export const CommentItem = ({
  comment,
  replies,
  onReply,
  onToggleLike,
  replyingTo,
  replyText = "",
  onReplyTextChange,
  onPublishReply,
  currentUser,
}: CommentThreadProps) => {
  const [showAllReplies, setShowAllReplies] = useState(replies.length <= 2);

  const isLiked = comment.liked_by_me ?? false;
  const likesCount = comment.likes_count ?? 0;
  const hasReplies = replies && replies.length > 0;
  const authorName = comment.author?.full_name ?? "Membre";
  const authorInitials = getInitials(comment.author?.full_name, currentUser?.email);
  const isReplyingToThis = replyingTo?.id === comment.id;

  return (
    <div className="space-y-3">
      {/* Main Comment */}
      <div className="flex gap-3">
        <UserAvatar src={comment.author?.avatar_url} name={comment.author?.full_name || "Membre"} className="h-10 w-10 flex-shrink-0" />

        <div className="flex-1 space-y-2">
          {/* Comment Card */}
          <div className="bg-muted/50 hover:bg-muted/70 rounded-2xl px-4 py-2 transition-colors">
            <div className="flex items-baseline justify-between gap-2 mb-1">
              <div className="flex items-center gap-1">
                <span className="font-semibold text-sm text-foreground">{authorName}</span>
                <GoldBadge hasGoldBadge={comment.author?.has_gold_badge ?? false} />
              </div>
              <span className="text-xs text-muted-foreground">{formatDate(comment.created_at)}</span>
            </div>
            <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap break-words">
              {comment.content}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-4 px-2">
            <button
              type="button"
              onClick={() => onToggleLike(comment.id)}
              className={`flex items-center gap-1 text-xs font-medium transition-colors ${
                isLiked
                  ? "text-red-500"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
              {likesCount > 0 && <span>{likesCount}</span>}
            </button>

            {currentUser && (
              <button
                type="button"
                onClick={() => onReply(comment.id, authorName)}
                className={`flex items-center gap-1 text-xs font-medium transition-colors ${
                  isReplyingToThis
                    ? "text-gold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                Répondre
              </button>
            )}
          </div>

          {/* Reply Box */}
          {isReplyingToThis && currentUser && (
            <div className="mt-3 space-y-2">
              <div className="text-xs text-muted-foreground px-2 font-medium">
                Réponse à <span className="text-foreground">{replyingTo.name}</span>
              </div>
              <Textarea
                value={replyText}
                onChange={(e) => onReplyTextChange?.(e.target.value)}
                placeholder={`Répondre à ${replyingTo.name}...`}
                className="min-h-[80px] rounded-2xl resize-none"
              />
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => onReply(comment.id, authorName)}
                  className="text-xs px-3 py-1.5 rounded-full text-muted-foreground hover:bg-muted transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={onPublishReply}
                  disabled={!replyText.trim()}
                  className="text-xs px-4 py-1.5 rounded-full bg-gold text-background font-medium hover:bg-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Répondre
                </button>
              </div>
            </div>
          )}

          {/* Replies Section */}
          {hasReplies && (
            <div className="mt-4 space-y-3">
              {/* Show Replies Toggle */}
              {replies.length > 2 && !showAllReplies && (
                <button
                  type="button"
                  onClick={() => setShowAllReplies(true)}
                  className="text-xs text-gold font-medium hover:underline"
                >
                  Voir {replies.length} réponses
                </button>
              )}

              {/* Replies List */}
              <div className="space-y-3 border-l-2 border-muted pl-4 ml-2">
                {(showAllReplies ? replies : replies.slice(-2)).map((reply) => (
                  <div key={reply.id} className="flex gap-3">
                    <UserAvatar src={reply.author?.avatar_url} name={reply.author?.full_name || "Membre"} className="h-9 w-9 flex-shrink-0" />

                    <div className="flex-1 space-y-1.5">
                      {/* Reply Card */}
                      <div className="bg-muted/30 hover:bg-muted/50 rounded-2xl px-3 py-1.5 transition-colors">
                        <div className="flex items-baseline justify-between gap-2 mb-0.5">
                          <div className="flex items-center gap-1">
                            <span className="font-semibold text-xs text-foreground">
                              {reply.author?.full_name ?? "Membre"}
                            </span>
                            <GoldBadge hasGoldBadge={reply.author?.has_gold_badge ?? false} className="w-3 h-3" />
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(reply.created_at)}
                          </span>
                        </div>
                        <p className="text-xs leading-relaxed text-foreground/90 whitespace-pre-wrap break-words">
                          {reply.content}
                        </p>
                      </div>

                      {/* Reply Action Buttons */}
                      <div className="flex items-center gap-4 px-2">
                        <button
                          type="button"
                          onClick={() => onToggleLike(reply.id)}
                          className={`flex items-center gap-1 text-xs font-medium transition-colors ${
                            reply.liked_by_me
                              ? "text-red-500"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <Heart className={`w-3.5 h-3.5 ${reply.liked_by_me ? "fill-current" : ""}`} />
                          {(reply.likes_count ?? 0) > 0 && <span>{reply.likes_count}</span>}
                        </button>

                        {currentUser && (
                          <button
                            type="button"
                            onClick={() => onReply(reply.id, reply.author?.full_name ?? "Membre")}
                            className={`flex items-center gap-1 text-xs font-medium transition-colors ${
                              replyingTo?.id === reply.id
                                ? "text-gold"
                                : "text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            Répondre
                          </button>
                        )}
                      </div>

                      {/* Nested Reply Box */}
                      {isReplyingToThis && replyingTo?.id === reply.id && currentUser && (
                        <div className="mt-2 space-y-2">
                          <div className="text-xs text-muted-foreground px-2 font-medium">
                            Réponse à <span className="text-foreground">{replyingTo.name}</span>
                          </div>
                          <Textarea
                            value={replyText}
                            onChange={(e) => onReplyTextChange?.(e.target.value)}
                            placeholder={`Répondre à ${replyingTo.name}...`}
                            className="min-h-[70px] rounded-2xl resize-none text-xs"
                          />
                          <div className="flex gap-2 justify-end">
                            <button
                              type="button"
                              onClick={() => onReply(reply.id, reply.author?.full_name ?? "Membre")}
                              className="text-xs px-3 py-1 rounded-full text-muted-foreground hover:bg-muted transition-colors"
                            >
                              Annuler
                            </button>
                            <button
                              type="button"
                              onClick={onPublishReply}
                              disabled={!replyText.trim()}
                              className="text-xs px-4 py-1 rounded-full bg-gold text-background font-medium hover:bg-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Répondre
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentItem;
