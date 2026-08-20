'use client';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0d1117',
      color: '#e6edf3',
      gap: '24px',
      padding: '32px',
      fontFamily: 'Inter, sans-serif',
    }}>
      <div style={{
        background: 'rgba(239,68,68,0.08)',
        border: '1.5px solid rgba(239,68,68,0.3)',
        borderRadius: '16px',
        padding: '32px 40px',
        maxWidth: '540px',
        textAlign: 'center',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>⚠️</div>
        <h1 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '8px', color: '#ef4444' }}>
          Dashboard Failed to Load
        </h1>
        <p style={{ fontSize: '0.86rem', color: '#8b949e', marginBottom: '8px', lineHeight: 1.6 }}>
          Something went wrong while loading the dashboard.
        </p>
        {error?.message && (
          <code style={{
            display: 'block',
            background: 'rgba(0,0,0,0.3)',
            borderRadius: '8px',
            padding: '10px 14px',
            fontSize: '0.76rem',
            color: '#f87171',
            marginBottom: '20px',
            wordBreak: 'break-all',
            textAlign: 'left',
          }}>
            {error.message}
          </code>
        )}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button
            type="button"
            onClick={reset}
            style={{
              padding: '10px 24px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.86rem',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            🔄 Try Again
          </button>
          <button
            type="button"
            onClick={() => { window.location.href = '/login'; }}
            style={{
              padding: '10px 24px',
              borderRadius: '8px',
              background: 'rgba(255,255,255,0.05)',
              color: '#e6edf3',
              fontWeight: 700,
              fontSize: '0.86rem',
              border: '1.5px solid rgba(255,255,255,0.1)',
              cursor: 'pointer',
            }}
          >
            ← Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}
