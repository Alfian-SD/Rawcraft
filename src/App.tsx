import { useCallback, useEffect, useState } from 'react';
import { LauncherState, Profile, ProgressData, ActiveView, LoaderType } from './types/launcher';
import { launcherApi } from './services/launcherApi';
import { LOADERS_CONFIG, getLoaderBySlug } from './config/loaders';
import { validateRam } from './utils/buildCommand';
import { NavigationRail } from './components/NavigationRail';
import { TopHeader } from './components/TopHeader';
import { HeroStage } from './components/HeroStage';
import { LoaderViewTab } from './components/LoaderViewTab';
import { GlassDrawerModal } from './components/GlassDrawerModal';
import { CommandPalette } from './components/CommandPalette';
import { MaintenanceScreen } from './components/MaintenanceScreen';
import { useMaintenance } from './hooks/useMaintenance';
import { isAppLocked, isViewLocked } from './utils/maintenance';

const DEFAULT_FALLBACK_PROFILE: Profile = {
  id: 'prof-rawcraft-262',
  name: 'RAWCRAFT CLIENT // 26.2',
  gameVersion: '26.2',
  loader: 'RAWCRAFT',
  loaderVersion: '1.0.0',
  maxRamMb: 4096,
  jvmFlags: '-XX:+UseG1GC -XX:+ParallelRefProcEnabled',
  gameDir: '/instances/prof-2665',
  mods: [{ fileName: 'rawcraft-client.jar', enabled: true }],
  rawcraftClient: true,
};

/** Views that render as a right-side drawer over the hero stage. */
const RIGHT_DRAWER_VIEWS: ActiveView[] = ['PROFILES', 'SETTINGS', 'CONSOLE', 'MODS'];

export default function App() {
  const [state, setState] = useState<LauncherState>(() => launcherApi.getLauncherState());
  const [activeView, setActiveView] = useState<ActiveView>('HERO');
  const [activeLoaderId, setActiveLoaderId] = useState<LoaderType | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  // ponytail: progress still tracked from SSE for future HUD, currently unrendered
  const [, setProgress] = useState<ProgressData | null>(null);
  const [assetsWarning, setAssetsWarning] = useState<string | null>(null);
  const [isRepairing, setIsRepairing] = useState(false);
  const maintenance = useMaintenance();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [logs, setLogs] = useState<string[]>([
    `[${new Date().toLocaleTimeString()}] [RawCraft/Misty]: System initialized. Welcome to Minecraft launcher.`,
  ]);

  // Sync state changes to storage via launcher adapter
  useEffect(() => {
    launcherApi.saveLauncherState(state);
  }, [state]);

  const activeProfile =
    (state.profiles && state.profiles.find((p) => p.id === state.activeProfileId)) ||
    (state.profiles && state.profiles[0]) ||
    DEFAULT_FALLBACK_PROFILE;

  const currentLoaderConfig = activeLoaderId
    ? LOADERS_CONFIG.find((l) => l.id === activeLoaderId) || null
    : null;

  // URL Hash Sync for bookmarkable routes (e.g., #/loader/fabric, #/settings)
  useEffect(() => {
    const syncFromHash = () => {
      const hash = window.location.hash.replace(/^#\/?/, '').trim().toLowerCase();
      if (!hash) {
        setActiveView('HERO');
        setActiveLoaderId(null);
        return;
      }

      if (hash.startsWith('loader/')) {
        const slug = hash.replace('loader/', '').trim();
        const matched = getLoaderBySlug(slug);
        if (matched) {
          setActiveView('LOADER');
          setActiveLoaderId(matched.id);
          return;
        }
      }

      const upper = hash.toUpperCase();
      if (['SETTINGS', 'PROFILES', 'STORE', 'CONSOLE', 'CONFIGURE', 'MODS'].includes(upper)) {
        setActiveView(upper as ActiveView);
        setActiveLoaderId(null);
      }
    };

    syncFromHash();
    window.addEventListener('hashchange', syncFromHash);
    return () => window.removeEventListener('hashchange', syncFromHash);
  }, []);

  // SSE Stream for launch progress, console stdout and status
  useEffect(() => {
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/events');

      eventSource.addEventListener('mc-console', (e) => {
        const text = JSON.parse(e.data);
        setLogs((prev) => [...prev.slice(-999), `[${new Date().toLocaleTimeString()}] ${text}`]);
      });

      eventSource.addEventListener('mc-progress', (e) => {
        const data = JSON.parse(e.data) as ProgressData;
        setProgress(data);
      });

      eventSource.addEventListener('mc-status', (e) => {
        const data = JSON.parse(e.data);
        if (data.status === 'RUNNING') {
          setIsRunning(true);
        } else if (data.status === 'IDLE') {
          setIsRunning(false);
          setProgress(null);
        } else if (data.status === 'INSTALLING') {
          setIsRunning(true);
        }
      });

      eventSource.addEventListener('mc-warning', (e) => {
        const data = JSON.parse(e.data);
        if (data.type === 'ASSETS_BROKEN') {
          setAssetsWarning(data.message || 'Game assets are broken. Click Repair assets.');
        }
      });
    } catch {
      // EventSource fallback
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, []);

  const handleNavigateView = (view: ActiveView) => {
    setActiveView(view);
    if (view !== 'LOADER' && view !== 'STORE') {
      setActiveLoaderId(null);
    }
    if (view === 'HERO') {
      if (window.location.hash && window.location.hash !== '#/') {
        window.history.pushState(null, '', '#/');
      }
    } else if (view !== 'LOADER') {
      window.location.hash = `#/${view.toLowerCase()}`;
    }
  };

  const handleCloseDrawer = useCallback(() => {
    handleNavigateView(activeLoaderId ? 'LOADER' : 'HERO');
  }, [activeLoaderId]);

  const handleSelectLoader = (loaderId: LoaderType) => {    const config = LOADERS_CONFIG.find((l) => l.id === loaderId);
    setActiveView('LOADER');
    setActiveLoaderId(loaderId);
    if (config) {
      window.location.hash = `#/loader/${config.slug}`;
    }
  };

  const handleSelectProfile = (id: string) => {
    setState((prev) => ({ ...prev, activeProfileId: id }));
  };

  const handleAddProfile = () => {
    const newId = `prof-${Date.now().toString().slice(-4)}`;
    const newProfile: Profile = {
      id: newId,
      name: `CLASSIC // ${newId}`,
      gameVersion: '1.21.4',
      loader: 'FABRIC',
      loaderVersion: '0.16.10',
      maxRamMb: 4096,
      jvmFlags: '-XX:+UseG1GC',
      gameDir: `/instances/${newId}`,
      mods: [],
      lastPlayed: Date.now(),
    };

    setState((prev) => ({
      ...prev,
      activeProfileId: newId,
      profiles: [...prev.profiles, newProfile],
    }));
  };

  const handleAddProfileWithConfig = (newProfile: Profile) => {
    setState((prev) => ({
      ...prev,
      activeProfileId: newProfile.id,
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

  const handleLaunch = async (profileToLaunch?: Profile | unknown) => {
    const isProfile = (p: any): p is Profile =>
      Boolean(p && typeof p === 'object' && typeof p.id === 'string' && typeof p.loader === 'string' && !('nativeEvent' in p));

    let target = isProfile(profileToLaunch) ? profileToLaunch : activeProfile;
    if (isRunning || isLaunching) return;

    // Self-healing: if target has invalid/undefined maxRamMb, auto-heal to 4096 MB
    if (!validateRam(target.maxRamMb)) {
      const parsed = typeof target.maxRamMb === 'number' ? target.maxRamMb : parseInt(String(target.maxRamMb), 10);
      const healedRam = Number.isInteger(parsed) && parsed >= 1024 && parsed <= 32768 ? parsed : 4096;
      target = { ...target, maxRamMb: healedRam };
      handleUpdateProfile(target);
    }

    setIsLaunching(true);
    setIsRunning(true);
    setLogs((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] [RawCraft/INIT]: Launch sequence dispatched for ${target.name} (${target.gameVersion})...`,
    ]);

    // Update last played timestamp
    handleUpdateProfile({
      ...target,
      lastPlayed: Date.now(),
    });

    try {
      await launcherApi.launchInstance({
        instanceId: target.id,
        gameVersion: target.gameVersion,
        loader: target.loader,
        loaderVersion: target.loaderVersion,
        username: state.globalSettings.username || 'deadbound',
        maxRamMb: target.maxRamMb,
        jvmFlags: target.jvmFlags,
        javaPath: target.javaPath || state.globalSettings.javaPath,
        rawcraftClient: target.rawcraftClient !== false,
      });
    } catch (err: any) {
      setLogs((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] [RawCraft/ERROR]: Failed to start: ${err?.message || err}`,
      ]);
      setIsRunning(false);
      handleNavigateView('CONSOLE');
    } finally {
      setIsLaunching(false);
    }
  };

  const handleTerminate = async () => {
    setLogs((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] [RawCraft/WARN]: Terminating active process...`,
    ]);
    await launcherApi.terminateProcess();
    setIsRunning(false);
    setProgress(null);
  };

  const handleRepairAssets = async () => {
    if (isRepairing) return;
    setIsRepairing(true);
    setLogs((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] [RawCraft/REPAIR]: Initiating asset verification and repair for ${activeProfile.id}...`,
    ]);
    try {
      await launcherApi.repairAssets(activeProfile.id, {
        gameVersion: activeProfile.gameVersion,
        loader: activeProfile.loader,
        loaderVersion: activeProfile.loaderVersion,
      });
      setAssetsWarning(null);
      setLogs((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] [RawCraft/REPAIR]: Asset repair complete. All files verified.`,
      ]);
    } catch (err: any) {
      setLogs((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] [RawCraft/ERROR]: Asset repair failed: ${err.message}`,
      ]);
    } finally {
      setIsRepairing(false);
    }
  };

  const appLocked = isAppLocked(maintenance);
  const viewLocked = isViewLocked(maintenance, activeView);

  if (appLocked) {
    return <MaintenanceScreen mode="app" config={maintenance} />;
  }

  return (
    <div
      data-animations={state.globalSettings.animationsEnabled !== false ? 'true' : 'false'}
      data-loader={activeProfile.loader}
      style={{
        display: 'flex',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        backgroundColor: 'var(--color-bg)',
      }}
    >
      {/* 1. Left Vertical Navigation Rail with Data-Driven Loader Tabs */}
      <NavigationRail
        activeView={activeView}
        activeLoaderId={activeLoaderId}
        onSelectView={handleNavigateView}
        onSelectLoader={handleSelectLoader}
        isRunning={isRunning}
        lockedViews={maintenance.lockedViews}
        open={sidebarOpen}
      />

      {/* 2. Main Stage with Header, Main Content View, and Bottom Controls */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Warning Banner for Broken Assets */}
        {assetsWarning && (
          <div
            role="alert"
            style={{
              zIndex: 30,
              padding: '10px 40px',
              backgroundColor: '#FEF2F2',
              borderBottom: '1px solid #FECACA',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--error)' }}>
                {assetsWarning}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                type="button"
                className="btn-destructive btn-sm"
                disabled={isRepairing}
                onClick={handleRepairAssets}
              >
                {isRepairing ? 'MEMPERBAIKI...' : 'PERBAIKI ASET'}
              </button>
              <button
                type="button"
                className="btn-ghost btn-sm"
                onClick={() => setAssetsWarning(null)}
              >
                TUTUP
              </button>
            </div>
          </div>
        )}

        <TopHeader
          settings={state.globalSettings}
          onOpenSettings={() => handleNavigateView('SETTINGS')}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen((v) => !v)}
        />

        {/* Primary Content Slot: Loader Full Page or Hero Stage */}
        {viewLocked ? (
          <MaintenanceScreen
            mode="tab"
            config={maintenance}
            view={activeView}
            onDismissTab={() => handleNavigateView('HERO')}
          />
        ) : activeView === 'LOADER' && currentLoaderConfig ? (
          <LoaderViewTab
            key={currentLoaderConfig.id}
            loader={currentLoaderConfig}
            profiles={state.profiles}
            activeProfile={activeProfile}
            onSelectProfile={handleSelectProfile}
            onAddProfile={handleAddProfileWithConfig}
            onUpdateProfile={handleUpdateProfile}
            onDeleteProfile={handleDeleteProfile}
            onLaunch={handleLaunch}
            onOpenConfigure={(id) => {
              handleSelectProfile(id);
              handleNavigateView('CONFIGURE');
            }}
            onOpenStore={() => handleNavigateView('STORE')}
            isRunning={isRunning}
          />
        ) : (
          <HeroStage
            profile={activeProfile}
            isRunning={isRunning}
            onLaunch={handleLaunch}
            onTerminate={handleTerminate}
            onOpenConfigure={() => handleNavigateView('CONFIGURE')}
            onOpenMods={() => handleNavigateView('MODS')}
            onOpenConsole={() => handleNavigateView('CONSOLE')}
            drawerOpen={RIGHT_DRAWER_VIEWS.includes(activeView)}
          />
        )}

        {/* 3. Slide-over Glass Drawer / Modal for Config, Mods, Store & Logs (Cleaned of loader code) */}
        {!viewLocked && (
          <GlassDrawerModal
            activeView={activeView}
            onClose={handleCloseDrawer}
            profile={activeProfile}
            profiles={state.profiles}
            activeProfileId={state.activeProfileId}
            onSelectProfile={handleSelectProfile}
            onAddProfile={handleAddProfile}
            onDeleteProfile={handleDeleteProfile}
            onUpdateProfile={handleUpdateProfile}
            onOpenConfigure={(id) => {
              handleSelectProfile(id);
              handleNavigateView('CONFIGURE');
            }}
            settings={state.globalSettings}
            onUpdateSettings={handleUpdateSettings}
            isRunning={isRunning}
            logs={logs}
            onClearLogs={() => setLogs([])}
            onTerminate={handleTerminate}
          />
        )}

        {/* 4. Global Command Palette (Ctrl+K) */}
        <CommandPalette
          isOpen={isCommandPaletteOpen}
          onClose={() => setIsCommandPaletteOpen(false)}
          profiles={state.profiles}
          activeProfileId={state.activeProfileId}
          onSelectProfile={handleSelectProfile}
          onSelectView={handleNavigateView}
          onSelectLoader={handleSelectLoader}
          onLaunch={handleLaunch}
          isRunning={isRunning}
          onToggleAnimations={() =>
            handleUpdateSettings({
              ...state.globalSettings,
              animationsEnabled: state.globalSettings.animationsEnabled === false ? true : false,
            })
          }
          animationsEnabled={state.globalSettings.animationsEnabled !== false}
          isModLoaderContext={Boolean(activeLoaderId || activeView === 'LOADER' || (activeProfile && activeProfile.loader !== 'VANILLA'))}
        />
      </main>
    </div>
  );
}
