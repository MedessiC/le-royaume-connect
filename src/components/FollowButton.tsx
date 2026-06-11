import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, UserCheck, Loader2 } from "lucide-react";

interface FollowButtonProps {
  userId: string;
  userName?: string;
  size?: "default" | "sm" | "lg";
  onFollowChange?: (isFollowing: boolean) => void;
}

const FollowButton: React.FC<FollowButtonProps> = ({
  userId,
  userName,
  size = "default",
  onFollowChange,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check if current user is following this user
  useEffect(() => {
    if (!user || user.id === userId) return;

    const checkFollow = async () => {
      const { data } = await supabase
        .from("follows")
        .select("id")
        .eq("follower_id", user.id)
        .eq("following_id", userId)
        .maybeSingle();

      setIsFollowing(!!data);
    };

    checkFollow();
  }, [user, userId]);

  const handleFollowToggle = async () => {
    if (!user || user.id === userId) return;

    setIsLoading(true);

    try {
      if (isFollowing) {
        // Unfollow
        await supabase
          .from("follows")
          .delete()
          .eq("follower_id", user.id)
          .eq("following_id", userId);

        setIsFollowing(false);
        toast({ title: `Vous ne suivez plus ${userName || "cet utilisateur"}` });
        onFollowChange?.(false);
      } else {
        // Follow
        await supabase.from("follows").insert({
          follower_id: user.id,
          following_id: userId,
        });

        setIsFollowing(true);
        toast({ title: `Vous suivez maintenant ${userName || "cet utilisateur"}` });
        onFollowChange?.(true);

        // Create notification for followed user
        await supabase.from("notifications").insert({
          user_id: userId,
          actor_id: user.id,
          type: "follow",
          title: `${user.user_metadata?.full_name || "Un utilisateur"} vous suit`,
          message: "Découvrez son profil",
          href: `/profile/${user.id}`,
        });
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user || user.id === userId) {
    return null;
  }

  return (
    <Button
      onClick={handleFollowToggle}
      disabled={isLoading}
      variant={isFollowing ? "outline" : "hero"}
      size={size}
      className="gap-2"
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : isFollowing ? (
        <>
          <UserCheck className="w-4 h-4" /> Suivi
        </>
      ) : (
        <>
          <UserPlus className="w-4 h-4" /> Suivre
        </>
      )}
    </Button>
  );
};

export default FollowButton;
