import "@livekit/components-styles";

import { LiveKitRoom, RoomAudioRenderer, VideoConference } from "@livekit/components-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type LiveKitSessionDialogProps = {
  open: boolean;
  title: string;
  token: string | null;
  serverUrl: string | null;
  onOpenChange: (open: boolean) => void;
};

const LiveKitSessionDialog = ({
  open,
  title,
  token,
  serverUrl,
  onOpenChange,
}: LiveKitSessionDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="h-[92vh] w-[96vw] max-w-6xl overflow-hidden p-0">
      <DialogHeader className="border-b border-border px-4 py-3">
        <DialogTitle>{title}</DialogTitle>
      </DialogHeader>

      <div className="h-[calc(92vh-4.25rem)] bg-[#111]">
        {token && serverUrl ? (
          <LiveKitRoom
            token={token}
            serverUrl={serverUrl}
            connect
            audio
            video
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

export default LiveKitSessionDialog;
