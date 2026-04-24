import React from 'react';
import { SituationId, getSituationsForAgeGroup } from '../../types/situation';
import { useAgeGroup } from '../../hooks/useAgeGroup';

interface HomeCTAProps {
  situation: SituationId | null;
  duration: 5 | 15 | 30 | null;
  onSituationChange: (s: SituationId) => void;
  onDurationChange: (d: 5 | 15 | 30) => void;
  onQuickStart: () => void;
}

const DURATIONS: Array<{ value: 5 | 15 | 30; label: string }> = [
  { value: 5, label: '5分' },
  { value: 15, label: '15分' },
  { value: 30, label: '30分' },
];

/**
 * HomeCTA — 呼吸する大きな丸ボタン1つで気晴らしを始められるホーム画面。
 * 状況・時間は任意で下部のクワイエットな帯で選べる。
 */
const HomeCTA: React.FC<HomeCTAProps> = ({
  situation,
  duration,
  onSituationChange,
  onDurationChange,
  onQuickStart,
}) => {
  const { currentAgeGroup } = useAgeGroup();
  const situations = getSituationsForAgeGroup(currentAgeGroup);

  return (
    <div
      className="relative w-full max-w-xl mx-auto"
      style={{ color: 'var(--kb-ink)', overflow: 'hidden' }}
    >
      {/* soft aurora blobs */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', top: -80, left: -60, width: 380, height: 380, borderRadius: '50%',
          filter: 'blur(64px)', opacity: 0.55, pointerEvents: 'none',
          background: 'radial-gradient(circle, var(--kb-aurora-1) 0%, transparent 65%)',
          animation: 'kb-aurora-drift 24s cubic-bezier(0.4,0,0.2,1) infinite',
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', top: 60, right: -80, width: 380, height: 380, borderRadius: '50%',
          filter: 'blur(64px)', opacity: 0.55, pointerEvents: 'none',
          background: 'radial-gradient(circle, var(--kb-aurora-2) 0%, transparent 65%)',
          animation: 'kb-aurora-drift 30s cubic-bezier(0.4,0,0.2,1) infinite reverse',
        }}
      />

      <div className="relative px-4 pt-4">
        <div style={{ fontSize: 'var(--kb-fs-sm)', color: 'var(--kb-ink-2)', letterSpacing: 0.5 }}>
          こんにちは
        </div>
        <h1
          style={{
            fontSize: 'var(--kb-fs-xxl)', fontWeight: 700, lineHeight: 1.3,
            letterSpacing: 0.2, margin: '10px 0 12px',
          }}
        >
          ちょっとだけ、<br />息をつきましょう。
        </h1>
        <p
          style={{
            fontSize: 'var(--kb-fs-md)', color: 'var(--kb-ink-2)',
            margin: '0 0 32px', lineHeight: 1.7,
          }}
        >
          {duration ?? 5}分の気晴らしを用意しました。<br />気が向いたら、押してみてください。
        </p>
      </div>

      {/* Breathing CTA */}
      <div className="relative flex justify-center" style={{ marginTop: 16 }}>
        <button
          type="button"
          onClick={onQuickStart}
          style={{
            width: 220, height: 220, borderRadius: '50%',
            background: 'radial-gradient(circle at 30% 30%, color-mix(in oklab, var(--kb-accent) 70%, white), var(--kb-accent))',
            color: '#fff',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 4,
            boxShadow: '0 20px 60px color-mix(in oklab, var(--kb-accent) 35%, transparent), 0 6px 20px color-mix(in oklab, var(--kb-accent) 20%, transparent)',
            animation: 'kb-breathe 5.5s cubic-bezier(0.4,0,0.2,1) infinite',
            fontFamily: 'var(--kb-font-ui)',
            letterSpacing: 0.4,
            cursor: 'pointer',
            border: 0,
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 500, opacity: 0.92 }}>今すぐ</span>
          <span style={{ fontSize: 22, fontWeight: 700 }}>気晴らし</span>
          <span style={{ fontSize: 13, fontWeight: 500, opacity: 0.92 }}>を受け取る</span>
        </button>
      </div>

      {/* Quiet context strip */}
      <div className="relative px-5" style={{ marginTop: 40 }}>
        <div
          style={{
            fontSize: 'var(--kb-fs-xs)', color: 'var(--kb-ink-3)',
            marginBottom: 10, fontWeight: 500, letterSpacing: 0.5,
          }}
        >
          今の状況（任意）
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {situations.map((s) => {
            const on = situation === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => onSituationChange(s.id)}
                style={{
                  flex: '1 1 0', minWidth: 80, padding: '14px 10px', borderRadius: 16,
                  background: on ? 'var(--kb-accent-soft)' : 'var(--kb-surface)',
                  border: `1px solid ${on ? 'var(--kb-accent)' : 'var(--kb-line)'}`,
                  color: on ? 'var(--kb-accent-ink)' : 'var(--kb-ink)',
                  fontSize: 'var(--kb-fs-sm)', fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {s.label}
              </button>
            );
          })}
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          {DURATIONS.map((d) => {
            const on = duration === d.value;
            return (
              <button
                key={d.value}
                type="button"
                onClick={() => onDurationChange(d.value)}
                style={{
                  flex: 1, padding: '12px 10px', borderRadius: 14,
                  background: on ? 'var(--kb-accent-soft)' : 'var(--kb-surface)',
                  border: `1px solid ${on ? 'var(--kb-accent)' : 'var(--kb-line)'}`,
                  color: on ? 'var(--kb-accent-ink)' : 'var(--kb-ink-2)',
                  fontSize: 'var(--kb-fs-sm)', fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                {d.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HomeCTA;
