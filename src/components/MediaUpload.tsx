import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, Loader2, Mic, CircleStop } from "lucide-react";
import { uploadToCloudinary, isCloudinaryConfigured } from "@/lib/cloudinary";

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

    if (!isCloudinaryConfigured) {
      return toast({
        title: "Configuration manquante",
        description: "Ajoutez votre Cloudinary pour téléverser des fichiers.",
        variant: "destructive",
      });
    }

    setUploading(true);
    try {
      const url = await uploadToCloudinary(file, `le-royaume/${accept}s`);
      onChange?.(url);
      onUpload?.(url);
      toast({ title: "Fichier téléversé" });
    } catch (error: any) {
      toast({ title: "Erreur d'upload", description: error.message, variant: "destructive" });
    } finally {
      setUploading(false);
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
    };
  }, []);

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
            {uploading ? "Chargement…" : recording ? "Enregistrement…" : "Prêt"}
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
                  {value ? "Fichier prêt à être utilisé" : "Glissez-déposez ou choisissez un fichier"}
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
              {value && (
                <Button type="button" size="sm" variant="ghost" onClick={() => {
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
      {resolvedValue && accept === "video" && (
        <div className="overflow-hidden rounded-2xl border border-border/70 bg-background/80 p-2">
          <video src={resolvedValue!} controls className="h-48 w-full rounded-xl object-cover" />
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
