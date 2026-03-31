import { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:8000';

export interface Episode {
  id: string;
  title: string;
  date: string;
  duration: string;
  status: 'completed' | 'processing' | 'failed';
  mp3_url?: string;
  script_url?: string;
}

export function useEpisodeHistory() {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchEpisodes = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/episodes`);
      if (res.ok) {
        const data = await res.json();
        setEpisodes(data.map((ep: Episode) => ({
          ...ep,
          mp3_url: ep.mp3_url ? `${API_BASE}${ep.mp3_url}` : undefined,
          script_url: ep.script_url ? `${API_BASE}${ep.script_url}` : undefined,
        })));
      }
    } catch {
      // Backend not reachable — show empty
      console.warn('Could not reach LearnPod API');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEpisodes();
  }, []);

  return { episodes, isLoading, refetch: fetchEpisodes };
}
