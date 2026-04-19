import React from 'react';

type IconName = 'heart' | 'clock' | 'sparkle' | 'leaf' | 'wind';

interface EmptyStateProps {
  icon: IconName;
  title: string;
  sub?: string;
  /**
   * Optional CTA rendered below the text.
   */
  cta?: React.ReactNode;
}

const ICON_PATHS: Record<IconName, React.ReactNode> = {
  heart: (
    <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10Z" />
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4l2.5 2" />
    </>
  ),
  sparkle: (
    <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3Z" />
  ),
  leaf: (
    <>
      <path d="M5 19c5-1 11-4 14-14-8 1-13 5-14 14Z" />
      <path d="M5 19l7-7" />
    </>
  ),
  wind: (
    <path d="M3 9h10a2.5 2.5 0 1 0-2.5-2.5M3 15h14a2.5 2.5 0 1 1-2.5 2.5M3 12h18" />
  ),
};

/**
 * Kibarashi — Empty state.
 * Quiet, invitational copy + soft circular icon. Used in お気に入り/履歴 etc.
 */
export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, sub, cta }) => {
  return (
    <div style={{ padding: '60px 24px 24px', textAlign: 'center' }}>
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          margin: '0 auto 20px',
          background: 'var(--kb-surface-soft)',
          color: 'var(--kb-ink-3)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        aria-hidden="true"
      >
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.6}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {ICON_PATHS[icon]}
        </svg>
      </div>
      <div
        style={{
          fontSize: 'var(--kb-fs-lg)',
          fontWeight: 600,
          color: 'var(--kb-ink)',
          marginBottom: 8,
        }}
      >
        {title}
      </div>
      {sub && (
        <p
          style={{
            fontSize: 'var(--kb-fs-sm)',
            color: 'var(--kb-ink-2)',
            lineHeight: 1.7,
            margin: 0,
          }}
        >
          {sub}
        </p>
      )}
      {cta && <div style={{ marginTop: 20 }}>{cta}</div>}
    </div>
  );
};

export default EmptyState;
