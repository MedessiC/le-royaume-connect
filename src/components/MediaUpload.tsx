import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, Loader2, Mic, CircleStop, Check } from "lucide-react";
import {
  uploadToBunnyStream,
  isBunnyStreamConfigured,
} from "@/lib/bunny";
import { uploadToCloudinary } from "@/lib/cloudinary";
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

  const handleFile = async (file: File) => {
    if (accept === "video" && !isBunnyStreamConfigured) {
      return toast({
        title: "Configuration vidéo requise",
        description: "Le service de téléversement vidéo doit être configuré.",
        variant: "destructive",
      });
    }

    const isLargeVideo = accept === "video" && file.size > 100 * 1024 * 1024;
    if (isLargeVideo) {
      toast({
        title: "Fichier volumineux",
        description: "Le traitement de la vidéo est en cours...",
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
        try {
          url = await uploadToCloudinary(file, `le-royaume/${accept}s`);
        } catch (err: any) {
          if (isOracleStorageConfigured) {
            url = await uploadToOracleStorage(file, `le-royaume/${accept}s`);
          } else {
            throw err;
          }
        }
      }

      onChange?.(url);
      onUpload?.(url);
      toast({ title: "Fichier téléversé ✓" });
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
      toast({ title: "Erreur d'enregistrement", description: "Accès au microphone refusé.", variant: "destructive" });
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

  const triggerFileSelect = () => {
    if (!uploading && !recording) {
      inputRef.current?.click();
    }
  };

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
    };
  }, [localPreviewUrl]);

  return (
    <div className="w-full min-w-0 space-y-2">
      {/* Cadre de téléversement entièrement cliquable */}
      <div
        onClick={triggerFileSelect}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`group relative flex flex-col justify-between w-full min-h-[140px] cursor-pointer rounded-2xl border-2 border-dashed p-4 transition-all duration-200 ${
          dragActive
            ? "border-gold bg-gold/10 shadow-lg scale-[1.01]"
            : resolvedValue
            ? "border-emerald-500/40 bg-card/80 hover:border-gold/50 hover:bg-card/90"
            : "border-border/80 bg-card/50 hover:border-gold/50 hover:bg-card/80"
        }`}
      >
        {/* En-tête statut */}
        <div className="flex items-center justify-between gap-2 mb-2 w-full">
          <span className="text-xs font-bold text-foreground truncate">
            {label ?? "Téléverser un fichier"}
          </span>
          <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
            {uploading ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-gold/15 px-2.5 py-0.5 text-[10px] font-extrabold text-gold border border-gold/30">
                <Loader2 className="h-3 w-3 animate-spin" />
                {uploadProgress > 0 ? `${uploadProgress}%` : "En cours..."}
              </span>
            ) : recording ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-red-500/15 px-2.5 py-0.5 text-[10px] font-extrabold text-red-400 border border-red-500/30 animate-pulse">
                <CircleStop className="h-3 w-3" /> Enregistrement...
              </span>
            ) : resolvedValue ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-400 border border-emerald-500/30">
                <Check className="h-3 w-3" /> Prêt
              </span>
            ) : (
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                {accept}
              </span>
            )}
          </div>
        </div>

        {/* Zone centrale & Aperçu */}
        {resolvedValue && accept === "image" ? (
          <div className="relative my-1 overflow-hidden rounded-xl border border-border/80 group/img">
            <img src={resolvedValue} alt="Aperçu" className="h-28 w-full object-cover rounded-xl" />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                clearLocalPreview();
                onChange?.(null);
                onUpload?.(null);
              }}
              className="absolute top-1.5 right-1.5 rounded-full bg-black/70 p-1.5 text-white hover:bg-red-600 transition-colors shadow-md"
              aria-label="Supprimer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : hasVideoPreview ? (
          <div className="relative my-1 overflow-hidden rounded-xl border border-border/80 bg-black" onClick={(e) => e.stopPropagation()}>
            {localPreviewUrl ? (
              <div className="relative w-full aspect-video min-h-[7rem]">
                <video src={localPreviewUrl} controls playsInline className="h-full w-full object-contain" />
              </div>
            ) : resolvedValue ? (
              <VideoPlayer src={resolvedValue} title="Aperçu vidéo" variant="compact" lazy={false} framed={false} />
            ) : null}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                clearLocalPreview();
                onChange?.(null);
                onUpload?.(null);
              }}
              className="absolute top-1.5 right-1.5 z-10 rounded-full bg-black/70 p-1.5 text-white hover:bg-red-600 transition-colors shadow-md"
              aria-label="Supprimer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : resolvedValue && accept === "audio" ? (
          <div className="relative my-1 p-2 rounded-xl border border-border/80 bg-background/80 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <audio controls src={resolvedValue} className="w-full h-8" />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                clearLocalPreview();
                onChange?.(null);
                onUpload?.(null);
              }}
              className="rounded-full p-1.5 text-muted-foreground hover:text-red-400 transition-colors shrink-0"
              aria-label="Supprimer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          /* Emplacement vierge d'upload */
          <div className="flex flex-col items-center justify-center my-2 text-center py-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/10 text-gold group-hover:scale-110 group-hover:bg-gold/20 transition-all mb-2 border border-gold/20">
              {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
            </div>
            <p className="text-xs font-bold text-foreground">
              {uploading ? "Téléversement en cours..." : "Cliquez ou glissez un fichier ici"}
            </p>
          </div>
        )}

        {/* Boutons d'actions bien positionnés dans le cadre */}
        <div className="flex flex-wrap items-center gap-2 mt-2 pt-2 border-t border-border/50" onClick={(e) => e.stopPropagation()}>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={triggerFileSelect}
            disabled={uploading || recording}
            className="h-8 text-xs font-bold gap-1.5 flex-1 border-gold/30 hover:bg-gold/15 hover:border-gold/50"
          >
            {uploading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-gold" />
            ) : (
              <Upload className="h-3.5 w-3.5 text-gold" />
            )}
            <span>{uploading ? "Téléversement..." : resolvedValue ? "Changer le fichier" : "Choisir un fichier"}</span>
          </Button>

          {accept === "audio" && canRecordAudio && (
            <Button
              type="button"
              variant={recording ? "destructive" : "outline"}
              size="sm"
              onClick={recording ? stopRecording : startRecording}
              disabled={uploading}
              className="h-8 text-xs font-bold gap-1.5 shrink-0"
            >
              {recording ? <CircleStop className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5 text-gold" />}
              <span>{recording ? "Arrêter" : "Enregistrer"}</span>
            </Button>
          )}
        </div>

        {/* Input d'URL directe */}
        <div className="mt-2" onClick={(e) => e.stopPropagation()}>
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
            placeholder="Ou coller une URL directe (https://...)"
            className="h-7 text-[11px] rounded-lg border-border/60 bg-background/70"
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
    </div>
  );
};

export default MediaUpload;
