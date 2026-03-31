import { useState, useRef, useEffect, useCallback } from 'react';

interface AudioPlayerProps {
  src: string;
  title?: string;
}

export function AudioPlayer({ src, title = 'Untitled Episode' }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => setDuration(audio.duration);
    const onEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
    };
  }, [src]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    audio.currentTime = ratio * duration;
  };

  const handleVolume = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setVolume(ratio);
    if (audioRef.current) audioRef.current.volume = ratio;
  };

  const skip = (seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, Math.min(duration, audio.currentTime + seconds));
  };

  const formatTime = (t: number) => {
    if (!t || isNaN(t)) return '00:00';
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progress = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed bottom-0 left-0 w-full z-50 h-24 rounded-t-3xl bg-[#1F1F22]/95 backdrop-blur-2xl border-t border-[#494456]/15 shadow-[0_-8px_48px_rgba(0,0,0,0.4)] px-8 flex items-center gap-8">
      <audio ref={audioRef} src={src} preload="metadata" />

      {/* Player Controls */}
      <div className="flex items-center gap-4 w-64">
        <button onClick={() => skip(-10)} className="text-on-surface-variant hover:text-secondary transition-colors">
          <span className="material-symbols-outlined">skip_previous</span>
        </button>
        <button
          onClick={togglePlay}
          className="w-14 h-14 bg-gradient-to-r from-[#5D21DF] to-[#00E3FD] rounded-full text-white flex items-center justify-center shadow-lg shadow-primary-container/30 hover:scale-110 active:scale-90 transition-transform duration-150"
        >
          <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            {isPlaying ? 'pause_circle' : 'play_circle'}
          </span>
        </button>
        <button onClick={() => skip(10)} className="text-on-surface-variant hover:text-secondary transition-colors">
          <span className="material-symbols-outlined">skip_next</span>
        </button>
      </div>

      {/* Seek Bar */}
      <div className="flex-1 flex flex-col gap-2">
        <div
          className="w-full h-2 bg-surface-container-highest rounded-full cursor-pointer group relative"
          onClick={handleSeek}
        >
          <div
            className="h-full bg-gradient-to-r from-[#5D21DF] to-[#00E3FD] rounded-full transition-all relative"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
        <div className="flex justify-between text-[10px] font-mono text-outline font-bold uppercase tracking-widest">
          <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
          <span className="text-secondary truncate max-w-[300px]">{isPlaying ? `Playing: ${title}` : title}</span>
        </div>
      </div>

      {/* Volume */}
      <div className="flex items-center gap-4 w-48 justify-end">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-[#CBC3D9] text-xl">
            {volume === 0 ? 'volume_off' : volume < 0.5 ? 'volume_down' : 'volume_up'}
          </span>
          <div
            className="w-24 h-1.5 bg-surface-container-highest rounded-full overflow-hidden cursor-pointer"
            onClick={handleVolume}
          >
            <div className="h-full bg-[#00E3FD]" style={{ width: `${volume * 100}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}
