import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  copied: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    copied: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null, copied: false };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[RawCraft/CRASH]: Uncaught component error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleCopyCrash = async () => {
    const { error, errorInfo } = this.state;
    const report = [
      '=== RAWCRAFT CRASH REPORT ===',
      `Timestamp: ${new Date().toISOString()}`,
      `Error: ${error?.name || 'Error'}: ${error?.message || 'Unknown error'}`,
      `Stack:\n${error?.stack || 'No stack trace available'}`,
      `Component Stack:\n${errorInfo?.componentStack || 'No component stack available'}`,
    ].join('\n\n');

    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(report);
      }
    } catch {
      // Fallback if clipboard API restricted
    }
    this.setState({ copied: true });
    setTimeout(() => this.setState({ copied: false }), 2500);
  };

  private handleResetStorage = () => {
    if (typeof window !== 'undefined' && window.confirm('Atur ulang preferensi peluncur dan cache instance untuk pemulihan?')) {
      localStorage.removeItem('rawcraft_state_v1');
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      const { error } = this.state;
      return (
        <div
          role="alert"
          aria-live="assertive"
          style={{
            height: '100vh',
            width: '100vw',
            backgroundColor: 'var(--bg)',
            color: 'var(--text)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            fontFamily: 'var(--font-sans)',
            overflow: 'auto',
          }}
        >
          <div
            style={{
              maxWidth: '680px',
              width: '100%',
              backgroundColor: 'var(--bg)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '36px',
              boxShadow: 'none',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            {/* Header Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span
                style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  color: 'var(--error)',
                  padding: '3px 10px',
                  borderRadius: 'var(--radius-pill)',
                  fontSize: '11px',
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}
              >
                EKSEPSI UI KRITIS
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Perisai Pemulihan Aktif
              </span>
            </div>

            {/* Title & Explanation */}
            <div>
              <h1
                style={{
                  fontSize: '28px',
                  fontWeight: 600,
                  color: 'var(--text)',
                  letterSpacing: '-0.02em',
                  marginBottom: '8px',
                }}
              >
                Peluncur Mengalami Kesalahan Tak Terduga
              </h1>
              <p
                style={{
                  fontSize: '13px',
                  color: 'var(--text-muted)',
                  lineHeight: 1.6,
                }}
              >
                Antarmuka RawCraft mencegat penghentian komponen tanpa kehilangan data game Minecraft lokal Anda.
                Anda dapat memuat ulang peluncur, menyalin laporan diagnostik, atau mengatur ulang penyimpanan jika terjadi kerusakan data.
              </p>
            </div>

            {/* Error Message Details */}
            <div
              style={{
                backgroundColor: 'var(--bg-subtle)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                padding: '14px',
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                color: 'var(--error)',
                maxHeight: '180px',
                overflowY: 'auto',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
              }}
            >
              {error?.name}: {error?.message}
              {error?.stack && `\n\n${error.stack}`}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', marginTop: '8px' }}>
              <button
                type="button"
                className="btn-primary"
                onClick={() => window.location.reload()}
                style={{ padding: '10px 22px', fontSize: '13px' }}
              >
                MUAT ULANG PELUNCUR
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={this.handleCopyCrash}
                style={{ padding: '10px 20px', fontSize: '13px' }}
              >
                {this.state.copied ? '✓ LAPORAN TERSALIN' : 'SALIN LAPORAN KERUSAKAN'}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={this.handleResetStorage}
                style={{ padding: '10px 20px', fontSize: '13px', color: 'var(--error)' }}
              >
                RESET PENYIMPANAN
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
