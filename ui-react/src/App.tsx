import { useState } from 'react';
import { Layout } from './components/Layout';
import { CreateDashboard } from './components/CreateDashboard';
import { Studio } from './components/Studio';
import { Settings } from './components/Settings';
import { AudioPlayer } from './components/AudioPlayer';
import { usePodcastPipeline } from './hooks/usePodcastPipeline';

function App() {
  const [activeTab, setActiveTab] = useState('create');
  const pipeline = usePodcastPipeline();

  return (
    <Layout activeTab={activeTab} onTabSelect={setActiveTab}>
      {activeTab === 'create' && <CreateDashboard pipeline={pipeline} />}
      {activeTab === 'studio' && <Studio />}
      {activeTab === 'settings' && <Settings />}

      {/* Global Audio Player — shows on Create page when pipeline finishes */}
      {activeTab === 'create' && pipeline.audioUrl && (
        <AudioPlayer
          src={pipeline.audioUrl}
          title={pipeline.fileDetails?.name || 'LearnPod Episode'}
        />
      )}
    </Layout>
  );
}

export default App;
