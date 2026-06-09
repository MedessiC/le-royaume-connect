import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface GoldBadgeProps {
  hasGoldBadge: boolean;
  className?: string;
}

const GoldBadge = ({ hasGoldBadge, className = "" }: GoldBadgeProps) => {
  if (!hasGoldBadge) return null;
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <svg
            className={`w-4 h-4 cursor-help ${className}`}
            viewBox="0 0 24 24"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Gold circle background */}
            <circle cx="12" cy="12" r="11" fill="#d4af37" stroke="#b8860b" strokeWidth="1" />
            
            {/* White checkmark */}
            <path
              d="M7 12.5L10 15.5L17 8"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-semibold">Compte vérifié</p>
          <p className="text-xs">Certifié par l'organisation du Règne Millénaire</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default GoldBadge;
