import { Share2, Copy, Check } from "lucide-react";
import { FaWhatsapp, FaFacebookF, FaTwitter, FaEnvelope, FaLink } from "react-icons/fa";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";

type ShareButtonProps = {
  title: string;
  description?: string;
  url: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "outline" | "ghost";
};

export const ShareButton = ({
  title,
  description,
  url,
  size = "sm",
  variant = "ghost",
}: ShareButtonProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const ogProxyUrl = import.meta.env.VITE_OG_PROXY_URL?.replace(/\/$/, "");
  const fullUrl = ogProxyUrl ? `${ogProxyUrl}${url}` : `${window.location.origin}${url}`;
  const shareText = description || title;

  const shareOptions = [
    {
      name: "WhatsApp",
      icon: <FaWhatsapp className="w-5 h-5" />,
      action: () => {
        const text = `${title}\n\n${shareText}\n\n${fullUrl}`;
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
        window.open(whatsappUrl, "_blank");
      },
    },
    {
      name: "Facebook",
      icon: <FaFacebookF className="w-5 h-5" />,
      action: () => {
        const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}&quote=${encodeURIComponent(title)}`;
        window.open(fbUrl, "_blank", "width=600,height=400");
      },
    },
    {
      name: "Twitter/X",
      icon: <FaTwitter className="w-5 h-5" />,
      action: () => {
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(fullUrl)}`;
        window.open(twitterUrl, "_blank", "width=600,height=300");
      },
    },
    {
      name: "Email",
      icon: <FaEnvelope className="w-5 h-5" />,
      action: () => {
        const subject = encodeURIComponent(title);
        const body = encodeURIComponent(`${shareText}\n\n${fullUrl}`);
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
      },
    },
    {
      name: "Copier",
      icon: <FaLink className="w-5 h-5" />,
      action: () => {
        navigator.clipboard.writeText(fullUrl);
        setCopied(true);
        toast({
          description: "Lien copié",
          duration: 2000,
        });
        setTimeout(() => setCopied(false), 2000);
      },
    },
  ];

  const buttonSize = {
    sm: "p-2",
    md: "py-2 px-3",
    lg: "py-3 px-4",
  }[size];

  const buttonClass = {
    sm: "w-4 h-4",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  }[size];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={variant}
          className={`${buttonSize} text-muted-foreground hover:text-gold hover:bg-muted transition-colors rounded-lg flex items-center justify-center gap-2`}
          title="Partager"
        >
          <Share2 className={buttonClass} />
          <span className={size === "sm" ? "hidden" : "text-sm font-medium"}>
            {size !== "sm" ? "Partager" : ""}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2" align="end">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-foreground px-2 py-1">Partager</p>
          {shareOptions.map((option) => (
            <button
              key={option.name}
              onClick={option.action}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-sm text-foreground"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-foreground">
                {option.icon}
              </span>
              <span className="flex-1 text-left">
                {option.name === "Copier" && copied ? "✓ Copié!" : option.name}
              </span>
              {option.name === "Copier" && copied && (
                <Check className="w-4 h-4 text-green-500" />
              )}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ShareButton;
