import { useState, useCallback } from 'react';

export type PipelineStep = 'idle' | 'uploading' | 'extracting' | 'cleaning' | 'script' | 'audio' | 'merging' | 'success' | 'error';

const API_BASE = 'http://localhost:8000';

// Map backend stage names to our UI step names
function mapStage(stage: string): PipelineStep {
  const stageMap: Record<string, PipelineStep> = {
    upload: 'uploading',
    extract: 'extracting',
    chunk: 'cleaning',
    llm: 'script',
    tts: 'audio',
    merge: 'merging',
    done: 'success',
    error: 'error',
  };
  return stageMap[stage] || 'extracting';
}

export function usePodcastPipeline() {
  const [currentStep, setCurrentStep] = useState<PipelineStep>('idle');
  const [progress] = useState(0);
  const [detail, setDetail] = useState('');
  const [fileDetails, setFileDetails] = useState<{ name: string; size: number } | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [scriptUrl, setScriptUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 1. Upload the file
  const uploadFile = useCallback(async (file: File) => {
    setCurrentStep('uploading');
    setFileDetails({ name: file.name, size: file.size });
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`${API_BASE}/api/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Upload failed');
      }

      const data = await res.json();
      setJobId(data.job_id);
      setCurrentStep('extracting');
      return data.job_id as string;
    } catch (e: unknown) {
      setCurrentStep('error');
      setError(e instanceof Error ? e.message : 'Upload failed');
      return null;
    }
  }, []);

  // 2. Start the pipeline
  const startPipeline = useCallback(async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/generate/${id}`, { method: 'POST' });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Failed to start pipeline');
      }
      // Start polling for progress
      pollStatus(id);
    } catch (e: unknown) {
      setCurrentStep('error');
      setError(e instanceof Error ? e.message : 'Pipeline start failed');
    }
  }, []);

  // 3. Poll for job status
  const pollStatus = useCallback((id: string) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE}/api/status/${id}`);
        if (!res.ok) return;

        const data = await res.json();
        const step = mapStage(data.stage);
        setCurrentStep(step);
        setDetail(data.detail);

        if (data.status === 'done') {
          clearInterval(interval);
          setCurrentStep('success');
          setAudioUrl(data.mp3_path ? `${API_BASE}${data.mp3_path}` : null);
          setScriptUrl(data.script_path ? `${API_BASE}${data.script_path}` : null);
        } else if (data.status === 'error') {
          clearInterval(interval);
          setCurrentStep('error');
          setError(data.error || 'Pipeline failed');
        }
      } catch {
        // Network error, keep polling
      }
    }, 2000); // poll every 2 seconds
  }, []);

  // Combined: upload + start pipeline
  const uploadAndGenerate = useCallback(async (file: File) => {
    const id = await uploadFile(file);
    if (id) {
      await startPipeline(id);
    }
  }, [uploadFile, startPipeline]);

  // Allow external callers (e.g. episode history) to set audio for playback
  const setExternalAudio = useCallback((url: string, title: string) => {
    setAudioUrl(url);
    setFileDetails({ name: title, size: 0 });
    setCurrentStep('success');
  }, []);

  return {
    currentStep,
    progress,
    detail,
    fileDetails,
    jobId,
    audioUrl,
    scriptUrl,
    error,
    uploadFile,
    startPipeline,
    uploadAndGenerate,
    setExternalAudio,
    resetPipeline: () => {
      setCurrentStep('idle');
      setJobId(null);
      setAudioUrl(null);
      setScriptUrl(null);
      setError(null);
      setDetail('');
      setFileDetails(null);
    },
  };
}
