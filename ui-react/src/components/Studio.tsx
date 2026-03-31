import { useState, useEffect } from 'react';
import { useEpisodeHistory } from '../hooks/useEpisodeHistory';
import type { Episode } from '../hooks/useEpisodeHistory';
import { AudioPlayer } from './AudioPlayer';

const API_BASE = 'http://localhost:8000';

interface DialogueLine {
  speaker: string;
  text: string;
}

function parseScript(raw: string): DialogueLine[] {
  const lines: DialogueLine[] = [];
  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const match = trimmed.match(/^(Alex|Jordan)\s*:\s*(.+)/i);
    if (match) {
      lines.push({ speaker: match[1], text: match[2] });
    }
  }
  return lines;
}

export function Studio() {
  const { episodes, isLoading, refetch } = useEpisodeHistory();
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
  const [script, setScript] = useState<DialogueLine[]>([]);
  const [scriptLoading, setScriptLoading] = useState(false);
  const [localAudioUrl, setLocalAudioUrl] = useState<string | null>(null);

  // Refetch episodes when Studio mounts
  useEffect(() => { refetch(); }, []);

  const selectEpisode = async (ep: Episode) => {
    setSelectedEpisode(ep);
    setLocalAudioUrl(ep.mp3_url || null);

    // Fetch script text
    setScriptLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/script/${ep.id}`);
      if (res.ok) {
        const data = await res.json();
        setScript(parseScript(data.script));
      } else {
        setScript([]);
      }
    } catch {
      setScript([]);
    } finally {
      setScriptLoading(false);
    }
  };

  // Empty state — no episodes yet
  if (!isLoading && episodes.length === 0) {
    return (
      <main className="pl-64 pt-20 h-screen overflow-y-auto bg-surface-dim">
        <div className="max-w-[1400px] mx-auto p-10 flex flex-col items-center justify-center h-[calc(100vh-10rem)]">
          <div className="w-32 h-32 rounded-full bg-surface-container-lowest flex items-center justify-center mb-8">
            <span className="material-symbols-outlined text-6xl text-primary-container">podcasts</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tighter text-on-surface mb-3">No Episodes Yet</h2>
          <p className="text-on-surface-variant text-center max-w-md">
            Upload a document on the Create page to generate your first podcast episode. It will appear here for playback.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="pl-64 pt-20 h-screen flex bg-surface-dim">
      {/* Left: Episode List */}
      <div className="w-80 border-r border-outline-variant/10 overflow-y-auto custom-scrollbar flex-shrink-0">
        <div className="p-6 border-b border-outline-variant/10">
          <span className="text-xs font-bold tracking-[0.2em] text-secondary-container uppercase">Library</span>
          <h2 className="text-2xl font-extrabold tracking-tighter text-on-surface mt-1">Episodes</h2>
          <p className="text-xs text-on-surface-variant mt-1">{episodes.length} episode{episodes.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="py-2">
          {episodes.map((ep) => (
            <button
              key={ep.id}
              onClick={() => selectEpisode(ep)}
              className={`w-full text-left px-6 py-4 flex items-center gap-4 transition-all hover:bg-surface-container group ${
                selectedEpisode?.id === ep.id ? 'bg-surface-container border-l-4 border-secondary-container' : 'border-l-4 border-transparent'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                selectedEpisode?.id === ep.id ? 'gradient-button' : 'bg-surface-container-highest'
              }`}>
                <span className="material-symbols-outlined text-white text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {selectedEpisode?.id === ep.id ? 'graphic_eq' : 'podcasts'}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className={`text-sm font-bold truncate ${selectedEpisode?.id === ep.id ? 'text-secondary' : 'text-on-surface'}`}>{ep.title}</p>
                <p className="text-[10px] text-on-surface-variant mt-0.5">{ep.date}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right: Script + Player */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {!selectedEpisode ? (
          /* No episode selected prompt */
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <span className="material-symbols-outlined text-5xl text-outline-variant">arrow_back</span>
            <p className="text-on-surface-variant text-lg">Select an episode to view its script and play audio</p>
          </div>
        ) : (
          <>
            {/* Episode Header */}
            <div className="py-6 px-10 border-b border-outline-variant/10 flex justify-between items-end flex-shrink-0">
              <div className="space-y-2 min-w-0 flex-1">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-full bg-tertiary-container text-on-tertiary-container text-[10px] font-bold uppercase tracking-widest">Completed</span>
                  <span className="text-on-surface-variant text-xs flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">schedule</span> {selectedEpisode.date}
                  </span>
                </div>
                <h2 className="text-3xl font-extrabold tracking-tight text-on-surface truncate">{selectedEpisode.title}</h2>
              </div>
              <div className="flex gap-3 flex-shrink-0">
                {selectedEpisode.mp3_url && (
                  <a
                    href={selectedEpisode.mp3_url}
                    download
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container transition-all text-sm font-semibold"
                  >
                    <span className="material-symbols-outlined text-lg">download</span>
                    Export MP3
                  </a>
                )}
                {selectedEpisode.script_url && (
                  <a
                    href={selectedEpisode.script_url}
                    download
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container transition-all text-sm font-semibold"
                  >
                    <span className="material-symbols-outlined text-lg">description</span>
                    Export Script
                  </a>
                )}
              </div>
            </div>

            {/* Script Area */}
            <div className="flex-1 overflow-y-auto px-10 py-8 custom-scrollbar" style={{ paddingBottom: localAudioUrl ? '8rem' : '2rem' }}>
              {scriptLoading ? (
                <div className="flex items-center justify-center h-64 gap-3">
                  <div className="w-6 h-6 border-2 border-secondary-container border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-on-surface-variant">Loading script...</span>
                </div>
              ) : script.length > 0 ? (
                <div className="max-w-3xl mx-auto space-y-8">
                  {script.map((line, idx) => {
                    const isAlex = line.speaker.toLowerCase() === 'alex';
                    return (
                      <div key={idx} className={`group flex gap-5 ${isAlex ? '' : 'flex-row-reverse'}`}>
                        <div className="flex-shrink-0">
                          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-black ${
                            isAlex ? 'bg-primary-container text-on-primary-container' : 'bg-secondary-container/20 text-secondary'
                          }`}>
                            {isAlex ? 'A' : 'J'}
                          </div>
                        </div>
                        <div className="flex-1 space-y-1.5 min-w-0">
                          <div className={`flex items-center gap-2 ${isAlex ? '' : 'flex-row-reverse'}`}>
                            <span className={`text-xs font-bold uppercase tracking-widest ${isAlex ? 'text-primary' : 'text-secondary'}`}>{line.speaker}</span>
                          </div>
                          <div className={`p-5 rounded-2xl shadow-lg ${
                            isAlex
                              ? 'rounded-tl-none bg-surface-container-low border-l-4 border-primary-container'
                              : 'rounded-tr-none bg-transparent border-2 border-secondary/20'
                          }`}>
                            <p className={`text-base leading-relaxed ${isAlex ? 'text-on-surface' : 'text-secondary-fixed-dim italic'}`}>{line.text}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-on-surface-variant gap-3">
                  <span className="material-symbols-outlined text-4xl text-outline-variant">draft</span>
                  <p>No script available for this episode</p>
                </div>
              )}
            </div>

            {/* Audio Player for selected episode */}
            {localAudioUrl && (
              <AudioPlayer src={localAudioUrl} title={selectedEpisode.title} />
            )}
          </>
        )}
      </div>
    </main>
  );
}
