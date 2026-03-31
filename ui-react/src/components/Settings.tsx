import { useSettings } from '../hooks/useSettings';
import type { EditorSettings } from '../hooks/useSettings';

export function Settings() {
  const { settings, updateSetting } = useSettings();

  return (
    <main className="pl-64 flex h-screen overflow-hidden bg-surface-dim">
      <div className="w-full h-full overflow-y-auto p-10 custom-scrollbar max-w-4xl mx-auto pt-28">
        <div className="mb-12">
          <span className="text-xs font-bold tracking-[0.2em] text-primary uppercase mb-2 block">System Configuration</span>
          <h2 className="text-4xl font-extrabold tracking-tighter text-on-surface">Studio Settings</h2>
          <p className="text-on-surface-variant mt-2 text-sm max-w-lg">
            Configure the default parameters for the LearnPod core pipeline. These settings govern how text is parsed, generation behavior, and synthetic voice output.
          </p>
        </div>

        <div className="space-y-12 pb-20">
          
          {/* Section: Generation Parameters */}
          <section className="space-y-6 bg-surface-container-low p-8 rounded-3xl border border-outline-variant/10 shadow-lg">
            <h3 className="text-xl font-bold text-on-surface flex items-center gap-3 border-b border-outline-variant/10 pb-4">
              <span className="material-symbols-outlined text-primary">psychology</span>
              LLM Generation
            </h3>

            {/* Max Tokens Slider */}
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <div>
                  <label className="text-sm font-bold text-on-surface block mb-1">Maximum Output Tokens</label>
                  <span className="text-xs text-on-surface-variant">The absolute token limit for script generation. Controls final script length padding.</span>
                </div>
                <div className="bg-surface-container-highest px-4 py-2 rounded-xl border border-outline-variant/10 shadow-inner">
                  <span className="text-lg font-mono text-secondary font-bold">{settings.maxTokens}</span>
                  <span className="text-xs text-on-surface-variant ml-1 font-mono">/ 4000</span>
                </div>
              </div>
              <div className="relative pt-6">
                <input
                  type="range"
                  min="500"
                  max="4000"
                  step="100"
                  value={settings.maxTokens}
                  onChange={(e) => updateSetting('maxTokens', parseInt(e.target.value, 10))}
                  className="w-full h-2 bg-surface-container-highest rounded-full appearance-none outline-none cursor-pointer accent-secondary focus:ring-4 focus:ring-secondary/20"
                />
                <div className="flex justify-between mt-2 text-[10px] uppercase font-bold tracking-widest text-outline">
                  <span>500</span>
                  <span>2000 (Default)</span>
                  <span>4000</span>
                </div>
              </div>
            </div>

            {/* Speaker Style */}
            <div className="space-y-4 pt-4">
               <div>
                  <label className="text-sm font-bold text-on-surface block mb-1">Dialogue Style</label>
                  <span className="text-xs text-on-surface-variant">Instruct the script agent on how to write the conversational dynamic between Alex and Jordan.</span>
                </div>
              <div className="relative max-w-md">
                <select
                  value={settings.speakerStyle}
                  onChange={(e) => updateSetting('speakerStyle', e.target.value as 'casual' | 'formal' | 'educational')}
                  className="w-full bg-surface-container-highest/50 text-on-surface font-medium border border-outline-variant/10 rounded-xl py-4 pl-6 pr-12 appearance-none focus:ring-2 focus:ring-primary-container cursor-pointer transition-all hover:bg-surface-container-highest"
                >
                  <option value="casual">Casual (Relaxed, conversational)</option>
                  <option value="formal">Formal (Structured, serious)</option>
                  <option value="educational">Educational (Clear, explanatory)</option>
                </select>
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">expand_more</span>
              </div>
            </div>

            {/* Tone Selector */}
            <div className="space-y-4 pt-4">
               <div>
                  <label className="text-sm font-bold text-on-surface block mb-1">Emotional Output Tone</label>
                  <span className="text-xs text-on-surface-variant">Influences vocabulary and excitement levels injected into the generated dialogue.</span>
                </div>
              <div className="flex flex-wrap gap-3">
                {['professional', 'casual', 'energetic', 'calm', 'neutral'].map((tone) => (
                  <button
                    key={tone}
                    className={`px-6 py-3 rounded-xl transition-all font-semibold border ${
                      settings.tone === tone
                        ? 'bg-primary-container text-on-primary-container border-primary/20 shadow-[0_0_15px_rgba(93,33,223,0.3)]'
                        : 'bg-surface-container-highest/30 hover:bg-surface-container-highest text-on-surface-variant border-outline-variant/5'
                    }`}
                    onClick={() => updateSetting('tone', tone as EditorSettings['tone'])}
                  >
                    {tone.charAt(0).toUpperCase() + tone.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Section: Audio Synthesis */}
          <section className="space-y-6 bg-surface-container-low p-8 rounded-3xl border border-outline-variant/10 shadow-lg">
            <h3 className="text-xl font-bold text-on-surface flex items-center gap-3 border-b border-outline-variant/10 pb-4">
              <span className="material-symbols-outlined text-secondary">record_voice_over</span>
              Audio Synthesis Profile
            </h3>

             <div className="space-y-4">
               <div>
                  <label className="text-sm font-bold text-on-surface block mb-1">Target Duration Preference</label>
                  <span className="text-xs text-on-surface-variant">Hints the LLM regarding the length of conversational tangents to produce.</span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                   {['short', 'medium', 'long'].map((length) => (
                     <button
                        key={length}
                        onClick={() => updateSetting('episodeLength', length as 'short'|'medium'|'long')}
                        className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                          settings.episodeLength === length 
                          ? 'bg-secondary-container text-on-secondary-container border-secondary/30 shadow-[0_0_15px_rgba(0,227,253,0.2)]'
                          : 'bg-surface-container-highest/30 hover:bg-surface-container-highest border-outline-variant/10 text-on-surface-variant'
                        }`}
                     >
                       <span className="material-symbols-outlined text-2xl">{length === 'short' ? 'timer' : length === 'medium' ? 'schedule' : 'hourglass_full'}</span>
                       <span className="text-sm font-bold capitalize">{length}</span>
                       <span className={`text-[10px] ${settings.episodeLength === length ? 'text-on-secondary-container/70' : 'text-outline'}`}>
                         {length === 'short' ? '< 10 mins' : length === 'medium' ? '~25 mins' : '45+ mins'}
                       </span>
                     </button>
                   ))}
                </div>
             </div>

             <div className="pt-6">
                <div className="flex items-center gap-4 bg-tertiary-container/10 border border-tertiary/20 p-5 rounded-xl text-tertiary-fixed">
                  <span className="material-symbols-outlined text-3xl">info</span>
                  <p className="text-sm">
                    <strong>Note:</strong> Advanced synthetic persona mixing (Elias Vance, Sarah K, The Orator) is currently locked for this environment. Edge TTS Guy and Jenny neural voices will be used as defaults for Alex and Jordan.
                  </p>
                </div>
             </div>
          </section>

          <div className="flex justify-end pt-4">
             <button className="px-8 py-4 rounded-xl bg-gradient-to-r from-primary-container to-secondary-container text-white font-black uppercase tracking-[0.2em] shadow-xl shadow-primary-container/20 hover:brightness-110 active:scale-95 transition-all text-sm">
                Save & Apply Settings
             </button>
          </div>
        </div>
      </div>
    </main>
  );
}
