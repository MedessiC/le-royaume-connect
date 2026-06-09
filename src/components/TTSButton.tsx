import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Music, Pause, Play, CircleStop, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

type TTSButtonProps = {
  text: string;
  lang?: string;
  size?: "sm" | "md" | "lg";
  rate?: number;
};

const TTSButton = ({ text, lang = "fr-FR", size = "sm", rate = 1 }: TTSButtonProps) => {
  const { toast } = useToast();
  const [status, setStatus] = useState<"idle" | "playing" | "paused" | "loading">("idle");
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);
  const voicesRef = useRef<SpeechSynthesisVoice[] | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState<string | null>(null);
  const [rateState, setRateState] = useState<number>(Math.round((rate ?? 0.95) * 100));
  const [pitchState, setPitchState] = useState<number>(100);

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const loadVoices = () => {
      const v = window.speechSynthesis.getVoices() || [];
      voicesRef.current = v;
      setVoices(v);
      // pick default voice from localStorage or heuristic
      const saved = window.localStorage.getItem("tts:voice");
      const savedRate = window.localStorage.getItem("tts:rate");
      const savedPitch = window.localStorage.getItem("tts:pitch");
      if (saved) setSelectedVoiceName(saved);
      if (savedRate) setRateState(Number(savedRate));
      if (savedPitch) setPitchState(Number(savedPitch));
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => {
      try {
        window.speechSynthesis.onvoiceschanged = null;
      } catch {}
    };
  }, []);

  const speak = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      toast({ description: "Synthèse vocale non disponible dans ce navigateur.", duration: 4000 });
      return;
    }

    if (!text || !text.trim()) {
      toast({ description: "Aucun texte à lire.", duration: 2000 });
      return;
    }

    try {
      setStatus("loading");
      // Cancel any existing speech
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = lang;
      utter.rate = rate;

      // use selected voice if available (ignore "default" sentinel)
      const voices = voicesRef.current || window.speechSynthesis.getVoices();
      let voice: SpeechSynthesisVoice | undefined;
      if (selectedVoiceName && selectedVoiceName !== "default") {
        voice = voices.find((v) => v.name === selectedVoiceName || `${v.name} (${v.lang})` === selectedVoiceName);
      }

      if (!voice) {
        // try to pick a more natural-sounding voice matching the lang
        const langPrefix = lang.slice(0, 2).toLowerCase();
        const preferredNames = ["google", "neural", "standard", "enhanced", "microsoft", "amélie", "amelie", "marie", "mathieu", "claire", "sophie", "benoit", "thomas", "celine", "céline", "alice", "luc", "helene", "hélène"];

        // filter candidates matching language
        const langCandidates = voices.filter((v) => v.lang && v.lang.toLowerCase().startsWith(langPrefix));
        if (langCandidates.length) {
          voice = langCandidates.find((v) => preferredNames.some((n) => v.name.toLowerCase().includes(n)));
          if (!voice) voice = langCandidates[0];
        } else {
          voice = voices.find((v) => preferredNames.some((n) => v.name.toLowerCase().includes(n)));
          if (!voice) voice = voices[0];
        }
      }

      if (voice) utter.voice = voice;

      // apply rate/pitch from UI state
      utter.rate = (rateState || Math.round((rate ?? 0.95) * 100)) / 100;
      utter.pitch = (pitchState || 100) / 100;

      utter.onend = () => {
        setStatus("idle");
        utterRef.current = null;
      };
      utter.onerror = () => {
        setStatus("idle");
        utterRef.current = null;
        toast({ description: "Erreur de lecture audio.", duration: 3000 });
      };

      utterRef.current = utter;
      window.speechSynthesis.speak(utter);
      setStatus("playing");
    } catch (err) {
      console.error(err);
      setStatus("idle");
      toast({ description: "Impossible de démarrer la synthèse vocale.", duration: 3000 });
    }
  };

  const pause = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause();
      setStatus("paused");
    }
  };

  const resume = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setStatus("playing");
    }
  };

  const stop = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    utterRef.current = null;
    setStatus("idle");
  };

  const buttonSize = {
    sm: "p-2",
    md: "py-2 px-3",
    lg: "py-3 px-4",
  }[size];

  const iconSize = {
    sm: "w-4 h-4",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  }[size];

  const saveSettings = () => {
    try {
      if (selectedVoiceName && selectedVoiceName !== "default") {
        window.localStorage.setItem("tts:voice", selectedVoiceName);
      } else {
        window.localStorage.removeItem("tts:voice");
      }
      window.localStorage.setItem("tts:rate", String(rateState));
      window.localStorage.setItem("tts:pitch", String(pitchState));
      toast({ description: "Préférences TTS sauvegardées", duration: 1500 });
    } catch {}
  };

  const resetSettings = () => {
    try {
      window.localStorage.removeItem("tts:voice");
      window.localStorage.removeItem("tts:rate");
      window.localStorage.removeItem("tts:pitch");
      setSelectedVoiceName(null);
      setRateState(Math.round((rate ?? 0.95) * 100));
      setPitchState(100);
      toast({ description: "Préférences TTS réinitialisées", duration: 1500 });
    } catch {}
  };

  return (
    <div className="inline-flex items-center">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" className={`${buttonSize} text-muted-foreground hover:text-gold hover:bg-muted rounded-lg`} title="Paramètres TTS">
            <Settings className={iconSize} />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72">
          <div className="space-y-3">
            <div>
              <p className="text-sm font-semibold">Voix</p>
              <Select value={selectedVoiceName ?? "default"} onValueChange={(v) => setSelectedVoiceName(v === "default" ? null : v)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={voices.length ? "Choisir une voix" : "Aucune voix détectée"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Automatique</SelectItem>
                  {voices.map((v) => (
                    <SelectItem key={`${v.name}-${v.lang}`} value={`${v.name}`}>
                      {v.name} — {v.lang}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <p className="text-sm font-semibold">Vitesse: {((rateState || 95) / 100).toFixed(2)}x</p>
              <Slider value={[rateState || Math.round((rate ?? 0.95) * 100)]} onValueChange={(v) => setRateState(v[0])} min={50} max={150} step={5} />
            </div>

            <div>
              <p className="text-sm font-semibold">Pitch: {((pitchState || 100) / 100).toFixed(2)}</p>
              <Slider value={[pitchState || 100]} onValueChange={(v) => setPitchState(v[0])} min={50} max={200} step={5} />
            </div>

            <div className="flex items-center justify-between">
              <Button variant="outline" size="sm" onClick={resetSettings}>Réinitialiser</Button>
              <Button size="sm" onClick={saveSettings}>Enregistrer</Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {status === "idle" && (
        <Button variant="ghost" className={`${buttonSize} text-muted-foreground hover:text-gold hover:bg-muted rounded-lg`} onClick={speak} title="Écouter">
          <Music className={iconSize} />
        </Button>
      )}

      {status === "loading" && (
        <Button variant="ghost" className={`${buttonSize} text-muted-foreground rounded-lg`} disabled>
          <Music className={iconSize} />
        </Button>
      )}

      {status === "playing" && (
        <div className="inline-flex items-center gap-1">
          <Button variant="ghost" className={`${buttonSize} text-muted-foreground hover:text-gold rounded-lg`} onClick={pause} title="Pause">
            <Pause className={iconSize} />
          </Button>
          <Button variant="ghost" className={`${buttonSize} text-muted-foreground hover:text-gold rounded-lg`} onClick={stop} title="Stop">
            <CircleStop className={iconSize} />
          </Button>
        </div>
      )}

      {status === "paused" && (
        <div className="inline-flex items-center gap-1">
          <Button variant="ghost" className={`${buttonSize} text-muted-foreground hover:text-gold rounded-lg`} onClick={resume} title="Reprendre">
            <Play className={iconSize} />
          </Button>
          <Button variant="ghost" className={`${buttonSize} text-muted-foreground hover:text-gold rounded-lg`} onClick={stop} title="Stop">
            <CircleStop className={iconSize} />
          </Button>
        </div>
      )}
    </div>
  );
};

export default TTSButton;
