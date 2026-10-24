import React from 'react';
import { ActiveView } from '../types/launcher';
import { MaintenanceConfig, viewLabel } from '../utils/maintenance';

interface MaintenanceScreenProps {
  mode: 'app' | 'tab';
  config: MaintenanceConfig;
  view?: ActiveView;
  onDismissTab?: () => void;
}

const formatEta = (iso: string | null): string | null => {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const MaintenanceScreen: React.FC<MaintenanceScreenProps> = ({
  mode,
  config,
  view,
  onDismissTab,
}) => {
  const isApp = mode === 'app';
  const targetLabel = view ? viewLabel(view) : null;
  const etaFormatted = formatEta(config.eta);

  return (
    <div
      className={`mnt ${isApp ? 'mnt-app' : 'mnt-tab'}`}
      role={isApp ? 'dialog' : 'region'}
      aria-modal={isApp ? 'true' : undefined}
      aria-labelledby="mnt-title"
    >
      <div className="mnt-backdrop" aria-hidden="true" />
      <div className="mnt-glow" aria-hidden="true" />

      <div className="mnt-card">
        {/* Voxel Caution Barrier Icon */}
        <div className="mnt-icon" aria-hidden="true">
          <svg width="40" height="40" viewBox="0 0 48 48" fill="none">
            {/* Voxel caution sign */}
            <rect x="6" y="8" width="36" height="32" rx="6" fill="#151926" stroke="#3A4260" strokeWidth="2" />
            {/* Caution stripes */}
            <path d="M12 34 L32 14" stroke="#FFBD69" strokeWidth="3" strokeLinecap="round" />
            <path d="M20 34 L36 18" stroke="#FFBD69" strokeWidth="3" strokeLinecap="round" />
            {/* Center Lock / Wrench mark */}
            <rect x="20" y="22" width="8" height="10" rx="2" fill="#B7F34A" />
            <path d="M21 22 V18 A3 3 0 0 1 27 18 V22" stroke="#B7F34A" strokeWidth="2" fill="none" />
          </svg>
        </div>

        <div className="mnt-status-row">
          <span className="mnt-badge">
            <span className="mnt-dot" aria-hidden="true" />
            UNDER MAINTENANCE
          </span>
          {targetLabel && <span className="mnt-chip">TAB // {targetLabel.toUpperCase()}</span>}
        </div>

        <h2 id="mnt-title" className="mnt-title">
          {isApp ? config.title : `${targetLabel || 'Fitur'} Sedang Dalam Perawatan`}
        </h2>

        <p className="mnt-message">
          {config.message ||
            (isApp
              ? 'Layanan RawCraft sedang ditingkatkan untuk sementara waktu.'
              : `Tab ${targetLabel || 'ini'} sementara dikunci untuk perbaikan berkala.`)}
        </p>

        {etaFormatted && (
          <div className="mnt-eta-box">
            <span className="mnt-eta-label">ESTIMASI SELESAI</span>
            <span className="mnt-eta-val">{etaFormatted} WIB</span>
          </div>
        )}

        <div className="mnt-actions">
          <button
            type="button"
            className="mnt-btn-retry"
            onClick={() => window.location.reload()}
          >
            Muat Ulang Halaman
          </button>
          {!isApp && onDismissTab && (
            <button
              type="button"
              className="mnt-btn-back"
              onClick={onDismissTab}
            >
              Kembali ke Beranda
            </button>
          )}
        </div>

        <div className="mnt-foot">
          <span>RAWCRAFT ENGINE // STATUS MONITOR</span>
          <span className="mnt-code">ERR_SVC_MAINTENANCE</span>
        </div>
      </div>
    </div>
  );
};
