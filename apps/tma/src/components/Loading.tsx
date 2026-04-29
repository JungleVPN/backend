/**
 * Minimal loading spinner for the TMA app.
 * Does not depend on @heroui/react — keeps Phase 1 bundle lean.
 * Phase 4 (theming) can replace this with the HeroUI Spinner if desired.
 */
export function Loading() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          border: '3px solid rgba(128,128,128,0.2)',
          borderTopColor: 'var(--tg-theme-button-color, #2563EB)',
          borderRadius: '50%',
          animation: 'tma-spin 0.7s linear infinite',
        }}
      />
      <style>{`@keyframes tma-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
