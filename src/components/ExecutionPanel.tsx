import React, { useState, useEffect, useRef } from 'react';
import { Profile, GlobalSettings } from '../types/launcher';
import { buildCommand, validateRam } from '../utils/buildCommand';

interface ExecutionPanelProps {
  profile: Profile;
  settings: GlobalSettings;
  isRunning: boolean;
  onSetRunning: (running: boolean) => void;
}

export const ExecutionPanel: React.FC<ExecutionPanelProps> = ({
  profile,
  settings,
  isRunning,
  onSetRunning,
}) => {
  const [logs, setLogs] = useState<string[]>([
    `[${new Date().toLocaleTimeString()}] [RawCraft/INFO]: Ready. Select instance and click EXECUTE to launch.`,
  ]);
  const [copied, setCopied] = useState(false);
  const logContainerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number | null>(null);

  const command = buildCommand(profile, settings);
  const isRamValid = validateRam(profile.maxRamMb);

  // Auto-scroll logs to bottom
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const handleCopyCommand = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const handleClearLog = () => {
    setLogs([]);
  };

  const handleLaunch = () => {
    if (!isRamValid) {
      setLogs((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] [RawCraft/ERROR]: Cannot launch. Max RAM (${profile.maxRamMb}MB) is invalid. Must be between 1024 and 32768 MB.`,
      ]);
      return;
    }

    onSetRunning(true);

    const activeMods = profile.mods.filter((m) => m.enabled);
    const simulatedSteps = [
      `[RawCraft/INFO]: Spawning runtime with command: ${command.slice(0, 70)}...`,
      `[JVM/INFO]: OpenJDK 64-Bit Server VM (build 21.0.2+13-LTS, mixed mode)`,
      `[JVM/INFO]: Allocating -Xmx${profile.maxRamMb}M heap with flags: ${profile.jvmFlags || 'NONE'}`,
      `[Minecraft/Main/INFO]: Setting user: ${settings.username || 'PlayerOne'} (dev-mode UUID)`,
      `[ModLoader/INFO]: Initializing ${profile.loader} ${profile.loaderVersion || 'engine'}...`,
      ...(profile.loader === 'VANILLA'
        ? [`[ModLoader/INFO]: Vanilla loader mode - mod scanning bypassed.`]
        : activeMods.length > 0
        ? activeMods.map((m) => `[ModLoader/INFO]: Loaded mod .jar: ${m.fileName}`)
        : [`[ModLoader/INFO]: No external .jar mods loaded.`]),
      `[Render thread/INFO]: Backend library: LWJGL version 3.3.3-snapshot`,
      `[Render thread/INFO]: OpenAL initialized sound subsystem.`,
      `[Render thread/INFO]: Created: 1024x512x4 minecraft:textures/atlas/blocks.png-atlas`,
      `[Render thread/INFO]: Window handle created. Resolution: 1920x1080.`,
      `[Render thread/INFO]: Game initialized successfully. Ready for gameplay.`,
    ];

    let currentStep = 0;
    const intervalId = window.setInterval(() => {
      if (currentStep < simulatedSteps.length) {
        const text = simulatedSteps[currentStep];
        setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${text}`]);
        currentStep++;
      } else {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      }
    }, 450);

    timerRef.current = intervalId;
  };

  const handleTerminate = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    onSetRunning(false);
    setLogs((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] [RawCraft/WARN]: Process terminated by user signal (SIGTERM / Kill code 130).`,
      `[${new Date().toLocaleTimeString()}] [RawCraft/INFO]: Process exited. Workspace unlocked.`,
    ]);
  };

  return (
    <section
      style={{
        padding: '24px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        backgroundColor: 'var(--color-white)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>03 // EXECUTION & STDOUT</h3>
        <span
          className={`chip-status ${isRunning ? 'active' : isRamValid ? 'default' : 'error'}`}
        >
          {isRunning ? 'RUNNING' : isRamValid ? 'READY' : 'INVALID CFG'}
        </span>
      </div>

      {/* CLI Preview Box (Elevated Card - 5px border) */}
      <div className="card-elevated" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h4 style={{ fontSize: '18px' }}>COMMAND PREVIEW (DRY-RUN)</h4>
          <button
            type="button"
            className="btn-secondary btn-sm"
            onClick={handleCopyCommand}
          >
            {copied ? '✓ COPIED' : 'COPY CMD'}
          </button>
        </div>

        <div
          style={{
            backgroundColor: 'var(--color-sunken)',
            border: '3px solid var(--color-black)',
            padding: '12px',
            fontFamily: 'var(--font-mono)',
            fontSize: '13px',
            lineHeight: '1.6',
            wordBreak: 'break-all',
            userSelect: 'all',
          }}
        >
          {command}
        </div>
      </div>

      {/* STDOUT Terminal Log */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h4>STDOUT // PROCESS CONSOLE</h4>
          <button
            type="button"
            className="btn-ghost"
            style={{ fontSize: '12px', padding: '2px 6px' }}
            onClick={handleClearLog}
          >
            CLEAR LOG
          </button>
        </div>

        <div
          ref={logContainerRef}
          style={{
            backgroundColor: 'var(--color-sunken)',
            border: '3px solid var(--color-black)',
            padding: '14px',
            fontFamily: 'var(--font-mono)',
            fontSize: '13px',
            height: '320px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {logs.map((log, i) => {
            const isError = log.includes('/ERROR');
            const isWarn = log.includes('/WARN');
            return (
              <div
                key={i}
                style={{
                  color: isError
                    ? 'var(--color-error)'
                    : isWarn
                    ? 'var(--color-warning)'
                    : 'var(--color-black)',
                  fontWeight: isError || isWarn ? 600 : 400,
                }}
              >
                {log}
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Bar */}
      <div>
        {!isRunning ? (
          <button
            type="button"
            className="btn-primary btn-lg"
            style={{ width: '100%' }}
            onClick={handleLaunch}
            disabled={!isRamValid}
          >
            EXECUTE // LAUNCH
          </button>
        ) : (
          <button
            type="button"
            className="btn-destructive btn-lg"
            style={{ width: '100%' }}
            onClick={handleTerminate}
          >
            TERMINATE PROCESS
          </button>
        )}
      </div>
    </section>
  );
};
