import React, { createContext, useContext, useEffect, useRef, useState } from "react";

export type AudioTrack = {
  id: string;
  slug?: string | null;
  title: string;
  authorName?: string;
  audioUrl: string;
  coverUrl?: string | null;
  country?: string | null;
};

type AudioPlayerContextType = {
  currentTrack: AudioTrack | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isMinimized: boolean;
  playTrack: (track: AudioTrack) => void;
  pause: () => void;
  resume: () => void;
  togglePlay: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleMinimize: () => void;
  closePlayer: () => void;
};

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(undefined);

export const AudioPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState<AudioTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration || 0);
    const handleEnded = () => setIsPlaying(false);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.pause();
    };
  }, []);

  const playTrack = (track: AudioTrack) => {
    if (!audioRef.current) return;

    if (currentTrack?.id === track.id) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(console.error);
      }
      return;
    }

    setCurrentTrack(track);
    setIsMinimized(false);
    audioRef.current.src = track.audioUrl;
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(console.error);
  };

  const pause = () => {
    audioRef.current?.pause();
  };

  const resume = () => {
    audioRef.current?.play().catch(console.error);
  };

  const togglePlay = () => {
    if (!audioRef.current || !currentTrack) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(console.error);
    }
  };

  const seek = (time: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const setVolume = (vol: number) => {
    if (!audioRef.current) return;
    audioRef.current.volume = vol;
    setVolumeState(vol);
    setIsMuted(vol === 0);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    if (isMuted) {
      audioRef.current.muted = false;
      setIsMuted(false);
    } else {
      audioRef.current.muted = true;
      setIsMuted(true);
    }
  };

  const toggleMinimize = () => {
    setIsMinimized((prev) => !prev);
  };

  const closePlayer = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
    setCurrentTrack(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  };

  return (
    <AudioPlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        currentTime,
        duration,
        volume,
        isMuted,
        isMinimized,
        playTrack,
        pause,
        resume,
        togglePlay,
        seek,
        setVolume,
        toggleMute,
        toggleMinimize,
        closePlayer,
      }}
    >
      {children}
    </AudioPlayerContext.Provider>
  );
};

export const useAudioPlayer = () => {
  const context = useContext(AudioPlayerContext);
  if (!context) {
    throw new Error("useAudioPlayer must be used within an AudioPlayerProvider");
  }
  return context;
};
