import React from 'react';

interface AuroraBackgroundProps {
  paused?: boolean;
  /**
   * When true, renders as a fixed-position background (whole screen).
   * When false, renders as absolute (fills parent).
   */
  fixed?: boolean;
  className?: string;
  /**
   * Opacity of the overlay veil that softens the Aurora and matches the page bg.
   * 0 = fully see-through, 0.55 = default soft.
   */
  veil?: number;
}

/**
 * Slowly drifting aurora-like gradient background.
 * Uses --kb-aurora-{1,2,3} from tokens.css so it responds to mood/dark changes.
 */
export const AuroraBackground: React.FC<AuroraBackgroundProps> = ({
  paused = false,
  fixed = false,
  className,
  veil = 0.55,
}) => {
  const anim = paused ? 'paused' : 'running';
  const pos: React.CSSProperties = fixed
    ? { position: 'fixed', inset: 0, zIndex: 0 }
    : { position: 'absolute', inset: 0, zIndex: 0 };

  return (
    <div
      aria-hidden="true"
      className={className}
      style={{ ...pos, overflow: 'hidden', pointerEvents: 'none' }}
    >
      <div style={{ position: 'absolute', inset: 0, background: 'var(--kb-bg)' }} />
      <div
        style={{
          position: 'absolute',
          top: '-20%',
          left: '-10%',
          width: '90%',
          height: '70%',
          borderRadius: '50%',
          filter: 'blur(80px)',
          background: 'radial-gradient(circle, var(--kb-aurora-1) 0%, transparent 60%)',
          animation: 'kb-aurora-drift 32s ease-in-out infinite',
          animationPlayState: anim,
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '20%',
          right: '-20%',
          width: '90%',
          height: '70%',
          borderRadius: '50%',
          filter: 'blur(90px)',
          background: 'radial-gradient(circle, var(--kb-aurora-2) 0%, transparent 60%)',
          animation: 'kb-aurora-drift 40s ease-in-out infinite reverse',
          animationPlayState: anim,
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-25%',
          left: '10%',
          width: '85%',
          height: '65%',
          borderRadius: '50%',
          filter: 'blur(100px)',
          background: 'radial-gradient(circle, var(--kb-aurora-3) 0%, transparent 60%)',
          animation: 'kb-aurora-drift 48s ease-in-out infinite',
          animationPlayState: anim,
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `color-mix(in oklab, var(--kb-bg) ${Math.round(veil * 100)}%, transparent)`,
        }}
      />
    </div>
  );
};

export default AuroraBackground;
