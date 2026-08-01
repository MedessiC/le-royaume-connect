import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface UserAvatarProps {
  src?: string | null;
  name: string;
  className?: string;
}

const UserAvatar = ({ src, name, className = "" }: UserAvatarProps) => {
  const avatarSrc = src || (name === "Le Règne Millénaire" || name === "@leregnemillenaire" ? "/android-chrome-512x512.png" : null);

  const initials = name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Avatar className={className}>
      {avatarSrc ? <AvatarImage src={avatarSrc} alt={name} className="object-cover" /> : null}
      <AvatarFallback className="bg-gradient-to-br from-gold via-gold-dark to-midnight-deep text-slate-900 dark:text-white font-bold border border-gold/30">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
};

export default UserAvatar;
