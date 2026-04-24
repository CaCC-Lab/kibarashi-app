import React from 'react';

export type MoodId = 'tired' | 'foggy' | 'anxious' | 'bored';

interface HomeMoodProps {
  selected: MoodId | null;
  onSelect: (mood: MoodId | null) => void;
}

const MOODS: Array<{ id: MoodId; label: string; hint: string }> = [
  { id: 'tired', label: 'つかれた', hint: '回復寄りの提案' },
  { id: 'foggy', label: 'モヤモヤ', hint: '頭を整える提案' },
  { id: 'anxious', label: 'そわそわ', hint: '呼吸を整える提案' },
  { id: 'bored', label: 'なんとなく', hint: '軽い気分転換' },
];

/**
 * HomeMood — 気分から気晴らしを選ぶホーム画面。
 * 4つのムードタイル + 「おまかせ」オプション。選ぶと提案画面へ遷移。
 */
const HomeMood: React.FC<HomeMoodProps> = ({ selected, onSelect }) => {
  return (
    <div
      className="relative w-full max-w-xl mx-auto"
      style={{ color: 'var(--kb-ink)', overflow: 'hidden' }}
    >
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', top: -100, right: -80, width: 380, height: 380, borderRadius: '50%',
          filter: 'blur(64px)', opacity: 0.55, pointerEvents: 'none',
          background: 'radial-gradient(circle, var(--kb-aurora-1) 0%, transparent 65%)',
        }}
      />
      <div className="relative px-5 pt-4">
        <div style={{ fontSize: 'var(--kb-fs-sm)', color: 'var(--kb-ink-2)', letterSpacing: 0.5 }}>
          おつかれさまです
        </div>
        <h1
          style={{
            fontSize: 'var(--kb-fs-xxl)', fontWeight: 700, lineHeight: 1.3,
            letterSpacing: 0.2, margin: '10px 0 8px',
          }}
        >
          いま、どんな<br />気分ですか？
        </h1>
        <p
          style={{
            fontSize: 'var(--kb-fs-sm)', color: 'var(--kb-ink-2)',
            margin: '0 0 28px',
          }}
        >
          それに合わせた気晴らしを提案します
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {MOODS.map((m, i) => {
            const on = selected === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => onSelect(m.id)}
                style={{
                  padding: '28px 20px', borderRadius: 'var(--kb-r-lg)',
                  background: on ? 'var(--kb-accent-soft)' : 'var(--kb-surface)',
                  border: `1px solid ${on ? 'var(--kb-accent)' : 'var(--kb-line)'}`,
                  color: 'var(--kb-ink)',
                  textAlign: 'left',
                  minHeight: 128,
                  display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                  position: 'relative', overflow: 'hidden',
                  cursor: 'pointer',
                }}
              >
                <div
                  aria-hidden="true"
                  style={{
                    position: 'absolute', top: 12, right: 12,
                    width: 36, height: 36, borderRadius: '50%',
                    background: `color-mix(in oklab, var(--kb-aurora-${(i % 3) + 1}) 80%, transparent)`,
                    filter: 'blur(6px)',
                  }}
                />
                <div style={{ position: 'relative' }}>
                  <div
                    style={{
                      fontSize: 'var(--kb-fs-lg)', fontWeight: 700,
                      color: on ? 'var(--kb-accent-ink)' : 'var(--kb-ink)',
                    }}
                  >
                    {m.label}
                  </div>
                  <div style={{ fontSize: 'var(--kb-fs-xs)', color: 'var(--kb-ink-3)', marginTop: 4 }}>
                    {m.hint}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div
          style={{
            marginTop: 28, padding: '16px', borderRadius: 16,
            background: 'var(--kb-surface-soft)',
            display: 'flex', alignItems: 'center', gap: 12,
          }}
        >
          <div style={{ color: 'var(--kb-ink-3)', flexShrink: 0 }} aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3Z" />
            </svg>
          </div>
          <div style={{ fontSize: 'var(--kb-fs-xs)', color: 'var(--kb-ink-2)', lineHeight: 1.5, flex: 1 }}>
            選ばずに <strong style={{ color: 'var(--kb-ink)', fontWeight: 600 }}>ランダム</strong> で受け取る
          </div>
          <button
            type="button"
            onClick={() => onSelect(null)}
            style={{
              padding: '8px 14px', borderRadius: 999,
              background: 'var(--kb-surface)', border: '1px solid var(--kb-line)',
              fontSize: 'var(--kb-fs-xs)', fontWeight: 600, color: 'var(--kb-ink-2)',
              cursor: 'pointer',
            }}
          >
            おまかせ
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomeMood;
