import "@livekit/components-styles";

import { LiveKitRoom, RoomAudioRenderer, VideoConference } from "@livekit/components-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type LiveKitSessionDialogProps = {
  open: boolean;
  title: string;
  token: string | null;
  serverUrl: string | null;
  mode?: "call" | "live-host" | "viewer";
  onOpenChange: (open: boolean) => void;
};

const LiveKitSessionDialog = ({
  open,
  title,
  token,
  serverUrl,
  mode = "call",
  onOpenChange,
}: LiveKitSessionDialogProps) => {
  const canPublish = mode !== "viewer";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="h-[100dvh] w-screen max-w-none overflow-hidden border-0 p-0 sm:h-[92dvh] sm:w-[96vw] sm:max-w-6xl sm:rounded-lg sm:border">
        <DialogHeader className="border-b border-border px-3 py-2.5 sm:px-4 sm:py-3">
          <DialogTitle className="truncate pr-8 text-base sm:text-lg">{title}</DialogTitle>
        </DialogHeader>

        <div className="h-[calc(100dvh-3.75rem)] bg-[#111] sm:h-[calc(92dvh-4.25rem)]">
          {token && serverUrl ? (
            <LiveKitRoom
              token={token}
              serverUrl={serverUrl}
              connect
              audio={canPublish}
              video={canPublish}
              onDisconnected={() => onOpenChange(false)}
              className="h-full"
            >
              <VideoConference />
              <RoomAudioRenderer />
            </LiveKitRoom>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-white/80">
              Connexion au salon...
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LiveKitSessionDialog;
