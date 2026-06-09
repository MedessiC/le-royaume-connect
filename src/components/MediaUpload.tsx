import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, Loader2, Mic, CircleStop } from "lucide-react";

type Props = {
  value: string | null;
  onChange: (url: string | null) => void;
  accept: "image" | "video" | "audio";
  label?: string;
};

const MediaUpload = ({ value, onChange, accept, label }: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recordedChunksRef = useRef<BlobPart[]>([]);
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [recording, setRecording] = useState(false);

  const canRecordAudio = accept === "audio" && typeof window !== "undefined" && !!navigator.mediaDevices?.getUserMedia && typeof MediaRecorder !== "undefined";

  const handleFile = async (file: File) => {
    const maxSize = accept === "image" ? 5 * 1024 * 1024 : accept === "audio" ? 30 * 1024 * 1024 : 50 * 1024 * 1024;
    if (file.size > maxSize) {
      return toast({
        title: "Fichier trop volumineux",
        description: `Maximum ${accept === "image" ? "5 Mo" : accept === "audio" ? "30 Mo" : "50 Mo"}`,
        variant: "destructive",
      });
    }
    setUploading(true);
    const ext = file.name.split(".").pop() || (accept === "audio" ? "webm" : "bin");
    const path = `${accept}s/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("teaching-media").upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });
    if (error) {
      setUploading(false);
      return toast({ title: "Erreur d'upload", description: error.message, variant: "destructive" });
    }
    const { data } = supabase.storage.from("teaching-media").getPublicUrl(path);
    onChange(data.publicUrl);
    setUploading(false);
    toast({ title: "Fichier téléversé" });
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

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  return (
    <div className="space-y-2">
      <div className="flex gap-2 flex-wrap">
        <Input
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value || null)}
          placeholder={label ?? "URL ou téléverser"}
          className="flex-1 min-w-[220px]"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
          disabled={uploading || recording}
        >
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          Téléverser
        </Button>
        {accept === "audio" && canRecordAudio && (
          <Button
            type="button"
            variant={recording ? "destructive" : "outline"}
            size="sm"
            onClick={recording ? stopRecording : startRecording}
            disabled={uploading}
          >
            {recording ? <CircleStop className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            {recording ? "Arrêter" : "Enregistrer"}
          </Button>
        )}
        {value && (
          <Button type="button" size="icon" variant="ghost" onClick={() => onChange(null)} aria-label="Retirer">
            <X className="w-4 h-4" />
          </Button>
        )}
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
      {value && accept === "image" && (
        <img src={value} alt="Aperçu" className="rounded-md border border-border max-h-40 object-cover" />
      )}
      {value && accept === "video" && (
        <video src={value} controls className="rounded-md border border-border max-h-40 w-full" />
      )}
      {value && accept === "audio" && (
        <audio controls src={value} className="w-full rounded-md border border-border p-2" />
      )}
    </div>
  );
};

export default MediaUpload;
