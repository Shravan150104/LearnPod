import { useState } from 'react';

export interface EditorSettings {
  speakerStyle: 'casual' | 'formal' | 'educational';
  tone: 'excited' | 'neutral' | 'calm' | 'professional' | 'energetic';
  episodeLength: 'short' | 'medium' | 'long';
  outputVoice: 'aether' | 'nova' | 'echo';
  maxTokens: number;
}

export function useSettings() {
  const [settings, setSettings] = useState<EditorSettings>({
    speakerStyle: 'educational',
    tone: 'calm',
    episodeLength: 'short',
    outputVoice: 'aether',
    maxTokens: 2000
  });

  const updateSetting = <K extends keyof EditorSettings>(key: K, value: EditorSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    // TODO: Send settings update to backend or save in local storage
  };

  const saveSettings = async () => {
    // TODO: POST configuration to API backend
    console.log('Saved settings:', settings);
  };

  return {
    settings,
    updateSetting,
    saveSettings
  };
}
