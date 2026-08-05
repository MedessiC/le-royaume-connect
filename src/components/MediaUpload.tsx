import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, Loader2, Mic, CircleStop } from "lucide-react";
import {
  uploadToBunnyStream,
  isBunnyStreamConfigured,
} from "@/lib/bunny";
import { uploadToOracleStorage, isOracleStorageConfigured } from "@/lib/oracleStorage";
import VideoPlayer from "@/components/VideoPlayer";
import { isEmbedVideoUrl, isPlayableVideoUrl } from "@/lib/video";

type Props = {
  value?: string | null;
  onChange?: (url: string | null) => void;
  onUpload?: (url: string | null) => void;
  currentUrl?: string | null;
  bucket?: string;
  accept?: "image" | "video" | "audio";
  label?: string;
};

const MediaUpload = ({ value, onChange, onUpload, currentUrl, accept = "image", label }: Props) => {
  const resolvedValue = value ?? currentUrl ?? null;
  const inputRef = useRef<HTMLInputElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recordedChunksRef = useRef<BlobPart[]>([]);
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);

  const clearLocalPreview = () => {
    setLocalPreviewUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return null;
    });
  };

  const hasVideoPreview = accept === "video" && Boolean(localPreviewUrl || (resolvedValue && isPlayableVideoUrl(resolvedValue)));

  const canRecordAudio = accept === "audio" && typeof window !== "undefined" && !!navigator.mediaDevices?.getUserMedia && typeof MediaRecorder !== "undefined";
  const acceptLabel = accept === "image" ? "Image" : accept === "video" ? "Vidéo" : "Audio";
  const maxSizeLabel = accept === "image" ? "5 Mo" : accept === "audio" ? "30 Mo" : "Aucune limite";

  const handleFile = async (file: File) => {
    const maxSize = accept === "image" ? 5 * 1024 * 1024 : accept === "audio" ? 30 * 1024 * 1024 : Infinity;
    if (file.size > maxSize) {
      return toast({
        title: "Fichier trop volumineux",
        description: `Maximum ${accept === "image" ? "5 Mo" : accept === "audio" ? "30 Mo" : "Aucune limite"}`,
        variant: "destructive",
      });
    }

    if (!isOracleStorageConfigured && accept !== "video") {
      return toast({
        title: "Configuration manquante",
        description: "Ajoutez la configuration de téléversement pour les fichiers.",
        variant: "destructive",
      });
    }

    if (accept === "video" && !isBunnyStreamConfigured) {
      return toast({
        title: "Configuration vidéo manquante",
        description: "Ajoutez la configuration Bunny Stream pour téléverser des vidéos.",
        variant: "destructive",
      });
    }

    const isLargeVideo = accept === "video" && file.size > 100 * 1024 * 1024;
    if (isLargeVideo) {
      toast({
        title: "Vidéo volumineuse détectée",
        description: "Le fichier sera téléversé via Bunny Stream.",
      });
    }

    setUploading(true);
    setUploadProgress(0);

    if (accept === "video") {
      clearLocalPreview();
      setLocalPreviewUrl(URL.createObjectURL(file));
    }

    try {
      let url: string;

      if (accept === "video") {
        const result = await uploadToBunnyStream(file, (percent) => setUploadProgress(percent));
        url = result.embedUrl;
      } else {
        url = await uploadToOracleStorage(file, `le-royaume/${accept}s`);
      }

      onChange?.(url);
      onUpload?.(url);
      toast({ title: "Fichier téléversé" });
    } catch (error: any) {
      toast({ title: "Erreur d'upload", description: error.message, variant: "destructive" });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const uploadBlob = async (blob: Blob, extension = "webm") => {
    const file = new File([blob], `audio-recording.${extension}`, { type: blob.type });
    await handleFile(file);
  };

  const startRecording = async () => {
    if (!canRecordAudio) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      recordedChunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const blob = new Blob(recordedChunksRef.current, { type: "audio/webm" });
        setRecording(false);
        await uploadBlob(blob, "webm");
        streamRef.current?.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        recorderRef.current = null;
        recordedChunksRef.current = [];
      };

      recorder.start();
      setRecording(true);
    } catch (error) {
      toast({ title: "Erreur d'enregistrement", description: "Impossible d'accéder au microphone.", variant: "destructive" });
    }
  };

  const stopRecording = () => {
    recorderRef.current?.stop();
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(false);
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(false);
    const file = event.dataTransfer.files?.[0];
    if (file) {
      await handleFile(file);
    }
  };

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
    };
  }, [localPreviewUrl]);

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-border/70 bg-gradient-to-br from-background via-background/95 to-muted/30 p-3 shadow-sm transition-all">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-primary">
                {acceptLabel}
              </span>
              <span className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                Max {maxSizeLabel}
              </span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {label ?? "Ajoutez un fichier ou collez une URL directe"}
            </p>
          </div>
          <div className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-700">
            {uploading ? `Chargement${uploadProgress ? ` • ${uploadProgress}%` : "…"}` : recording ? "Enregistrement…" : "Prêt"}
          </div>
        </div>

        <div
          className={`mt-3 rounded-2xl border border-dashed p-3 transition-all ${dragActive ? "border-primary bg-primary/5 shadow-[0_0_0_1px_rgba(99,102,241,0.12)]" : "border-border/70 bg-background/80"}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
              </div>
              <div>
                <p className="font-medium text-foreground">
                  {resolvedValue || localPreviewUrl ? "Fichier prêt à être utilisé" : "Glissez-déposez ou choisissez un fichier"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Formats optimisés pour la lecture directe dans l’interface.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => inputRef.current?.click()}
                disabled={uploading || recording}
              >
                {uploading ? "Téléversement…" : "Téléverser"}
              </Button>
              {accept === "audio" && canRecordAudio && (
                <Button
                  type="button"
                  variant={recording ? "destructive" : "outline"}
                  size="sm"
                  onClick={recording ? stopRecording : startRecording}
                  disabled={uploading}
                >
                  {recording ? <CircleStop className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  {recording ? "Arrêter" : "Enregistrer"}
                </Button>
              )}
              {(resolvedValue || localPreviewUrl) && (
                <Button type="button" size="sm" variant="ghost" onClick={() => {
                  clearLocalPreview();
                  onChange?.(null);
                  onUpload?.(null);
                }} aria-label="Retirer">
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="mt-3">
          <Input
            value={resolvedValue ?? ""}
            onChange={(e) => {
              const nextValue = e.target.value || null;
              if (nextValue !== resolvedValue) {
                clearLocalPreview();
              }
              onChange?.(nextValue);
              onUpload?.(nextValue);
            }}
            placeholder={label ?? "URL ou téléverser"}
            className="h-10 rounded-xl border-border/70 bg-background/80"
          />
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept === "image" ? "image/*" : accept === "video" ? "video/mp4,video/webm,video/ogg" : "audio/*"}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />

      {resolvedValue && accept === "image" && (
        <div className="overflow-hidden rounded-2xl border border-border/70 bg-background/80">
          <img src={resolvedValue!} alt="Aperçu" className="h-48 w-full object-cover" />
        </div>
      )}
      {hasVideoPreview && (
        <div className="space-y-2">
          <div className="overflow-hidden rounded-2xl border border-border/70 bg-black">
            {localPreviewUrl ? (
              <div className="relative w-full aspect-video min-h-[12rem]">
                <video
                  src={localPreviewUrl}
                  controls
                  playsInline
                  preload="metadata"
                  className="absolute inset-0 h-full w-full object-contain"
                />
                {uploading && (
                  <div className="absolute inset-x-0 bottom-0 bg-black/75 px-3 py-2 text-xs font-medium text-white">
                    Téléversement en cours…{uploadProgress > 0 ? ` ${uploadProgress}%` : ""}
                  </div>
                )}
              </div>
            ) : resolvedValue ? (
              <VideoPlayer
                src={resolvedValue}
                title="Aperçu vidéo"
                variant="compact"
                lazy={false}
                framed={false}
              />
            ) : null}
          </div>
          {resolvedValue && isEmbedVideoUrl(resolvedValue) && !uploading && (
            <p className="px-1 text-xs text-muted-foreground">
              Vidéo enregistrée sur Bunny Stream. Le lecteur en ligne peut mettre 1 à 2 minutes à être disponible après l’upload.
            </p>
          )}
        </div>
      )}
      {resolvedValue && accept === "audio" && (
        <div className="rounded-2xl border border-border/70 bg-background/80 p-3">
          <audio controls src={resolvedValue!} className="w-full" />
        </div>
      )}
    </div>
  );
};

export default MediaUpload;
