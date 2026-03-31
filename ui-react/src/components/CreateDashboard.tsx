import { useRef, useState } from 'react';
import type { PipelineStep } from '../hooks/usePodcastPipeline';
import type { usePodcastPipeline } from '../hooks/usePodcastPipeline';

type PipelineReturn = ReturnType<typeof usePodcastPipeline>;

interface CreateDashboardProps {
  pipeline: PipelineReturn;
}

export function CreateDashboard({ pipeline }: CreateDashboardProps) {
  const { currentStep, detail, error, uploadAndGenerate, fileDetails } = pipeline;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file: File) => {
    uploadAndGenerate(file);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const steps: PipelineStep[] = ['extracting', 'cleaning', 'script', 'audio', 'success'];
  const currentIndex = steps.indexOf(currentStep);

  return (
    <main className="pl-64 pt-6 h-screen overflow-y-auto bg-surface-dim flex flex-col">
      <div className="max-w-[1400px] mx-auto w-full px-10 pb-6 flex-1 flex flex-col gap-6 relative">
        {/* Hero Header */}
        <section className="flex justify-between items-end flex-shrink-0">
          <div className="space-y-1">
            <span className="text-[10px] font-bold tracking-[0.2em] text-secondary-container uppercase">Studio Workspace</span>
            <h2 className="text-4xl font-extrabold tracking-tighter text-on-surface">Create Episode</h2>
          </div>
          <div className="flex items-center gap-2 text-on-surface-variant text-xs font-semibold bg-surface-container-low px-4 py-2 rounded-full">
            <span className="w-2 h-2 rounded-full bg-secondary-container animate-pulse"></span>
            AI Engine Online
          </div>
        </section>

        {/* Creation Grid */}
        <div className="grid grid-cols-12 gap-6 flex-1 min-h-0">
          {/* Left: Upload Zone */}
          <div className="col-span-8 group flex flex-col h-full" onClick={handleUploadClick} onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave}>
            <input ref={fileInputRef} type="file" accept=".pdf,.docx,.epub,.txt" className="hidden" onChange={handleFileChange} />
            <div className={`relative flex-1 w-full rounded-3xl border-2 border-dashed ${isDragging ? 'border-secondary-container bg-surface-container' : 'border-outline-variant/30 bg-surface-container-low'} hover:bg-surface-container transition-all duration-500 overflow-hidden flex flex-col items-center justify-center gap-4 cursor-pointer`}>
              <div className="w-20 h-20 rounded-full bg-surface-container-lowest flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-inner border border-outline-variant/20">
                <span className="material-symbols-outlined text-3xl text-secondary-container">cloud_upload</span>
              </div>
              <div className="text-center space-y-1 z-10">
                <h3 className="text-xl font-bold text-on-surface">{isDragging ? 'Drop your file here' : 'Drag & Drop Source Media'}</h3>
                <p className="text-on-surface-variant text-sm max-w-xs mx-auto">Upload PDF transcripts, raw audio, or text documents to begin the AI synthesis.</p>
              </div>
              <div className="flex gap-4 z-10 mt-2">
                <span className="px-4 py-1 rounded-full bg-surface-container-lowest text-[10px] font-bold text-outline border border-outline-variant/20 uppercase tracking-widest">PDF</span>
                <span className="px-4 py-1 rounded-full bg-surface-container-lowest text-[10px] font-bold text-outline border border-outline-variant/20 uppercase tracking-widest">DOCX</span>
                <span className="px-4 py-1 rounded-full bg-surface-container-lowest text-[10px] font-bold text-outline border border-outline-variant/20 uppercase tracking-widest">EPUB / TXT</span>
              </div>
            </div>
          </div>

          {/* Right: Details Panel */}
          <div className="col-span-4 h-full">
            <div className="glass-panel p-6 rounded-3xl shadow-2xl border border-outline-variant/10 flex flex-col h-full">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-base font-bold">Document Details</h4>
                <span className="material-symbols-outlined text-outline text-sm">info</span>
              </div>
              <div className="space-y-4 flex-1 flex flex-col">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-outline uppercase tracking-widest">File Name</label>
                  <p className="text-on-surface font-medium text-sm truncate">{fileDetails?.name || '--'}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-outline uppercase tracking-widest">Size</label>
                  <p className="text-on-surface font-medium text-sm">{fileDetails ? `${(fileDetails.size / 1024).toFixed(1)} KB` : '--'}</p>
                </div>
                <div className="space-y-1 mb-2">
                  <label className="text-[10px] font-bold text-outline uppercase tracking-widest">Status</label>
                  <div className="flex items-center gap-2">
                    {error ? (
                      <span className="text-error text-xs font-semibold">{error}</span>
                    ) : (
                      <span className="text-outline text-xs font-semibold">{currentStep === 'idle' ? 'Awaiting upload...' : detail || `Processing: ${currentStep}`}</span>
                    )}
                  </div>
                </div>
                
                <div className="mt-auto">
                  <div className="bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant/10">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="material-symbols-outlined text-tertiary-fixed-dim text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                      <span className="text-[10px] font-bold text-tertiary-fixed-dim uppercase tracking-wider">AI Estimate</span>
                    </div>
                    <p className="text-xs text-on-surface-variant leading-relaxed italic">"Once uploaded, our neural engine will generate a comprehensive podcast script based on this context."</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pipeline Progress Section */}
        <section className="space-y-4 flex-shrink-0">
          <div className="flex items-center justify-between pl-2">
            <h3 className="text-xl font-bold tracking-tight">Pipeline Progress</h3>
            <div className="flex gap-2">
              <span className="px-3 py-1 rounded-full bg-tertiary-container/20 text-tertiary-fixed-dim text-[9px] font-bold uppercase tracking-widest border border-tertiary-container/30">Auto-Optimization Enabled</span>
            </div>
          </div>
          <div className="bg-surface-container-low px-8 py-6 rounded-3xl border border-outline-variant/5">
            <div className="relative flex justify-between items-start">
              {/* Progress Line */}
              <div className="absolute top-7 left-0 w-full h-0.5 bg-outline-variant/20 -z-0">
                <div className="h-full bg-gradient-to-r from-primary-container to-secondary-container" style={{ width: currentStep === 'idle' ? '15%' : `${Math.max(15, ((currentIndex + 1) / 5) * 100)}%`, transition: 'width 0.5s ease' }}></div>
              </div>

              {/* Step 1: Text extraction */}
              <div className={`relative z-10 flex flex-col items-center gap-4 text-center group ${currentIndex >= 0 ? '' : 'opacity-40'}`}>
                <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 ${currentIndex >= 0 ? 'gradient-button shadow-[0_0_20px_rgba(93,33,223,0.4)]' : 'bg-surface-container-highest border border-outline-variant/20'}`}>
                  <span className={`material-symbols-outlined ${currentIndex >= 0 ? 'text-white' : 'text-on-surface-variant'}`} style={currentIndex >= 0 ? { fontVariationSettings: "'FILL' 1" } : {}}>article</span>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-on-surface">Text extraction</p>
                  <p className={`text-[10px] font-bold uppercase ${currentIndex >= 0 ? 'text-secondary-container' : 'text-outline'}`}>{currentIndex >= 0 ? 'Processing' : 'Waiting'}</p>
                </div>
              </div>

              {/* Step 2: Cleanup */}
              <div className={`relative z-10 flex flex-col items-center gap-4 text-center ${currentIndex >= 1 ? '' : 'opacity-40'}`}>
                <div className={`w-14 h-14 rounded-full flex items-center justify-center ${currentIndex >= 1 ? 'gradient-button shadow-[0_0_20px_rgba(93,33,223,0.4)]' : 'bg-surface-container-highest border border-outline-variant/20'}`}>
                  <span className={`material-symbols-outlined ${currentIndex >= 1 ? 'text-white' : 'text-on-surface-variant'}`}>auto_fix_high</span>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-on-surface">Cleanup</p>
                  <p className={`text-[10px] font-bold uppercase ${currentIndex >= 1 ? 'text-secondary-container' : 'text-outline'}`}>{currentIndex >= 1 ? 'Processing' : 'Waiting'}</p>
                </div>
              </div>

              {/* Step 3: Script generation */}
              <div className={`relative z-10 flex flex-col items-center gap-4 text-center ${currentIndex >= 2 ? '' : 'opacity-40'}`}>
                <div className={`w-14 h-14 rounded-full flex items-center justify-center ${currentIndex >= 2 ? 'gradient-button shadow-[0_0_20px_rgba(93,33,223,0.4)]' : 'bg-surface-container-highest border border-outline-variant/20'}`}>
                  <span className={`material-symbols-outlined ${currentIndex >= 2 ? 'text-white' : 'text-on-surface-variant'}`}>psychology</span>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-on-surface">Script generation</p>
                  <p className={`text-[10px] font-bold uppercase ${currentIndex >= 2 ? 'text-secondary-container' : 'text-outline'}`}>{currentIndex >= 2 ? 'Processing' : 'Waiting'}</p>
                </div>
              </div>

              {/* Step 4: Speaker formatting */}
              <div className={`relative z-10 flex flex-col items-center gap-4 text-center ${currentIndex >= 3 ? '' : 'opacity-40'}`}>
                <div className={`w-14 h-14 rounded-full flex items-center justify-center ${currentIndex >= 3 ? 'gradient-button shadow-[0_0_20px_rgba(93,33,223,0.4)]' : 'bg-surface-container-highest border border-outline-variant/20'}`}>
                  <span className={`material-symbols-outlined ${currentIndex >= 3 ? 'text-white' : 'text-on-surface-variant'}`}>interpreter_mode</span>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-on-surface">Speaker formatting</p>
                  <p className={`text-[10px] font-bold uppercase ${currentIndex >= 3 ? 'text-secondary-container' : 'text-outline'}`}>{currentIndex >= 3 ? 'Processing' : 'Waiting'}</p>
                </div>
              </div>

              {/* Step 5: Audio generation */}
              <div className={`relative z-10 flex flex-col items-center gap-4 text-center ${currentIndex >= 4 ? '' : 'opacity-40'}`}>
                <div className={`w-14 h-14 rounded-full flex items-center justify-center ${currentIndex >= 4 ? 'gradient-button shadow-[0_0_20px_rgba(93,33,223,0.4)]' : 'bg-surface-container-highest border border-outline-variant/20'}`}>
                  <span className={`material-symbols-outlined ${currentIndex >= 4 ? 'text-white' : 'text-on-surface-variant'}`}>surround_sound</span>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-on-surface">Audio generation</p>
                  <p className={`text-[10px] font-bold uppercase ${currentIndex >= 4 ? 'text-secondary-container' : 'text-outline'}`}>{currentIndex >= 4 ? 'Processing' : 'Waiting'}</p>
                </div>
              </div>
            </div>
          </div>
        </section>


      </div>
    </main>
  );
}
