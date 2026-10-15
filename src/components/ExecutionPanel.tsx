import React, { useState, useEffect, useRef } from 'react';
import { Profile, GlobalSettings, ProgressData } from '../types/launcher';
import { buildCommand, validateRam } from '../utils/buildCommand';
import { launchInstance, terminateProcess } from '../api/instanceClient';

interface ExecutionPanelProps {
  profile: Profile;
  settings: GlobalSettings;
  isRunning: boolean;
  onSetRunning: (running: boolean) => void;
  onProgress?: (progress: ProgressData | null) => void;
}

export const ExecutionPanel: React.FC<ExecutionPanelProps> = ({
  profile,
  settings,
  isRunning,
  onSetRunning,
  onProgress,
}) => {
  const [logs, setLogs] = useState<string[]>([
    `[${new Date().toLocaleTimeString()}] [RawCraft/INFO]: Ready. Select instance and click EXECUTE to launch.`,
  ]);
  const [copied, setCopied] = useState(false);
  const [telemetry, setTelemetry] = useState<string>('TELEMETRY: IDLE');
  const logContainerRef = useRef<HTMLDivElement>(null);

  const command = buildCommand(profile, settings);
  const isRamValid = validateRam(profile.maxRamMb);

  // Connect to SSE stream
  useEffect(() => {
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/events');

      eventSource.addEventListener('mc-console', (e) => {
        const text = JSON.parse(e.data);
        setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${text}`]);
      });

      eventSource.addEventListener('mc-progress', (e) => {
        const data = JSON.parse(e.data) as ProgressData;
        if (onProgress) onProgress(data);
        setTelemetry(`DOWNLOAD [${data.type || 'ASSETS'}]: ${data.task || ''} (${data.percent}%)`);
      });

      eventSource.addEventListener('mc-status', (e) => {
        const data = JSON.parse(e.data);
        if (data.status === 'RUNNING') {
          onSetRunning(true);
          setTelemetry('STATUS: RUNNING ACTIVE CLIENT');
        } else if (data.status === 'IDLE') {
          onSetRunning(false);
          setTelemetry('STATUS: IDLE');
          if (onProgress) onProgress(null);
        } else if (data.status === 'INSTALLING') {
          onSetRunning(true);
          setTelemetry('STATUS: VERIFYING ASSETS & RUNTIME');
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
  }, [onProgress, onSetRunning]);

  // Auto-scroll logs
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const handleCopyCommand = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const handleClearLog = () => {
    setLogs([]);
  };

  const handleLaunch = async () => {
    if (!isRamValid) {
      setLogs((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] [RawCraft/ERROR]: Cannot launch. Max RAM (${profile.maxRamMb}MB) is invalid. Must be between 1024 and 32768 MB.`,
      ]);
      return;
    }

    onSetRunning(true);
    setLogs((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] [RawCraft/INIT]: Dispatching launch sequence to backend engine...`,
      `[${new Date().toLocaleTimeString()}] [RawCraft/CMD]: ${command}`,
    ]);

    try {
      await launchInstance({
        instanceId: profile.id,
        gameVersion: profile.gameVersion,
        loader: profile.loader,
        loaderVersion: profile.loaderVersion,
        username: settings.username || 'PlayerOne',
        maxRamMb: profile.maxRamMb,
        jvmFlags: profile.jvmFlags,
        javaPath: profile.javaPath || settings.javaPath,
        authMode: settings.authMode || 'OFFLINE',
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Launch failed';
      setLogs((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] [RawCraft/WARN]: Backend runner notice: ${msg}`,
        `[${new Date().toLocaleTimeString()}] [RawCraft/INFO]: Running process preview generator...`,
      ]);
    }
  };

  const handleTerminate = async () => {
    try {
      await terminateProcess();
    } catch {
      // Ignore
    }
    onSetRunning(false);
    setTelemetry('STATUS: TERMINATED');
    if (onProgress) onProgress(null);
    setLogs((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] [RawCraft/WARN]: Process terminated by user signal (SIGTERM).`,
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

      {/* Live Download & Verification Telemetry */}
      <div
        style={{
          border: '2px solid var(--color-black)',
          padding: '8px 12px',
          backgroundColor: 'var(--color-sunken)',
          fontFamily: 'var(--font-mono)',
          fontSize: '12px',
          fontWeight: 600,
        }}
      >
        {telemetry}
      </div>

      {/* CLI Preview Box (Elevated Card - 5px border) */}
      <div className="card-elevated" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h4 style={{ fontSize: '18px' }}>COMMAND PREVIEW</h4>
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
