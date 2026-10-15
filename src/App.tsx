import { useState, useEffect } from 'react';
import { LauncherState, Profile, ProgressData } from './types/launcher';
import { loadLauncherState, saveLauncherState } from './utils/storage';
import { Header } from './components/Header';
import { ProfileSidebar } from './components/ProfileSidebar';
import { ProfileConfig } from './components/ProfileConfig';
import { ExecutionPanel } from './components/ExecutionPanel';

export default function App() {
  const [state, setState] = useState<LauncherState>(() => loadLauncherState());
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState<ProgressData | null>(null);

  // Sync state changes to storage
  useEffect(() => {
    saveLauncherState(state);
  }, [state]);

  const activeProfile =
    state.profiles.find((p) => p.id === state.activeProfileId) || state.profiles[0];

  const handleSelectProfile = (id: string) => {
    setState((prev) => ({ ...prev, activeProfileId: id }));
  };

  const handleAddProfile = () => {
    const newId = `prof-${Date.now().toString().slice(-4)}`;
    const newProfile: Profile = {
      id: newId,
      name: `NEW INSTANCE // ${newId}`,
      gameVersion: '1.21.4',
      loader: 'FABRIC',
      loaderVersion: '0.16.9',
      maxRamMb: 4096,
      jvmFlags: '-XX:+UseG1GC',
      gameDir: `/instances/${newId}`,
      mods: [],
    };

    setState((prev) => ({
      ...prev,
      activeProfileId: newId,
      profiles: [...prev.profiles, newProfile],
    }));
  };

  const handleDeleteProfile = (id: string) => {
    if (state.profiles.length <= 1) return;
    const remaining = state.profiles.filter((p) => p.id !== id);
    setState((prev) => ({
      ...prev,
      activeProfileId: remaining[0].id,
      profiles: remaining,
    }));
  };

  const handleUpdateSettings = (settings: LauncherState['globalSettings']) => {
    setState((prev) => ({ ...prev, globalSettings: settings }));
  };

  const handleUpdateProfile = (updated: Profile) => {
    setState((prev) => ({
      ...prev,
      profiles: prev.profiles.map((p) => (p.id === updated.id ? updated : p)),
    }));
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        backgroundColor: 'var(--color-white)',
      }}
    >
      <Header
        settings={state.globalSettings}
        onUpdateSettings={handleUpdateSettings}
        isRunning={isRunning}
        progress={progress}
      />

      <main
        style={{
          display: 'grid',
          gridTemplateColumns: '320px 1.2fr 1.2fr',
          flex: 1,
          overflow: 'hidden',
        }}
      >
        {/* Left Column: 01 // PROFILES */}
        <ProfileSidebar
          profiles={state.profiles}
          activeProfileId={state.activeProfileId}
          onSelectProfile={handleSelectProfile}
          onAddProfile={handleAddProfile}
          onDeleteProfile={handleDeleteProfile}
          isRunning={isRunning}
        />

        {/* Center Column: 02 // CONFIGURATION & MODULES */}
        <ProfileConfig
          profile={activeProfile}
          onUpdateProfile={handleUpdateProfile}
          isRunning={isRunning}
        />

        {/* Right Column: 03 // EXECUTION & STDOUT */}
        <ExecutionPanel
          profile={activeProfile}
          settings={state.globalSettings}
          isRunning={isRunning}
          onSetRunning={setIsRunning}
          onProgress={setProgress}
        />
      </main>
    </div>
  );
}
