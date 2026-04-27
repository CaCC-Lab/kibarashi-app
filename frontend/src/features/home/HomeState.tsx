import React, { useState } from 'react';
import type { Mood as DbMood, EnergyLevel, SocialContext, TimePressure } from '../../utils/contextAxes';

// HomeMood の MoodId を維持しつつ、3軸（energy/social/time）を追加した state survey 画面
// 仕様: docs/specs/suggestion-axes-extension.md (Phase 5 案A)

export type MoodId = 'tired' | 'foggy' | 'anxious' | 'bored';

export interface HomeStateAnswers {
  mood: MoodId | null;
  energyLevel: EnergyLevel | null;
  socialContext: SocialContext | null;
  timePressure: TimePressure | null;
}

interface HomeStateProps {
  selected: HomeStateAnswers;
  onSubmit: (answers: HomeStateAnswers) => void;
  onSkip: () => void; // 全部スキップ → おまかせ
}

const MOODS: Array<{ id: MoodId; label: string; hint: string }> = [
  { id: 'tired', label: 'つかれた', hint: '回復寄り' },
  { id: 'foggy', label: 'モヤモヤ', hint: '頭を整える' },
  { id: 'anxious', label: 'そわそわ', hint: '呼吸を整える' },
  { id: 'bored', label: 'なんとなく', hint: '軽い気分転換' },
];

const ENERGIES: Array<{ id: EnergyLevel; label: string }> = [
  { id: 'low', label: '😪 低い' },
  { id: 'medium', label: '😐 ふつう' },
  { id: 'high', label: '😄 高い' },
];

const SOCIALS: Array<{ id: SocialContext; label: string }> = [
  { id: 'alone', label: '🙂 一人' },
  { id: 'with_others', label: '👥 誰かと' },
];

const TIME_PRESSURES: Array<{ id: TimePressure; label: string }> = [
  { id: 'relaxed', label: '😌 余裕' },
  { id: 'pressed', label: '⏰ ギリギリ' },
];

// Mapping helper for mood: HomeMood の MoodId のうち DB に対応するものをそのまま、
// 'foggy' は 'tired' にマップ（DB enum に無い）。送信先は親の判断に任せる。
// （contextAxes.ts の mapHomeMoodToAxis と同じロジックだがUI側で完結させない）

const HomeState: React.FC<HomeStateProps> = ({ selected, onSubmit, onSkip }) => {
  const [draft, setDraft] = useState<HomeStateAnswers>(selected);

  const update = <K extends keyof HomeStateAnswers>(key: K, value: HomeStateAnswers[K]) => {
    // 同じ値を再タップしたら解除
    setDraft((prev) => ({ ...prev, [key]: prev[key] === value ? null : value }));
  };

  const buttonStyle = (isOn: boolean) => ({
    flex: 1,
    padding: '14px 12px',
    borderRadius: 14,
    background: isOn ? 'var(--kb-accent-soft)' : 'var(--kb-surface)',
    border: `1px solid ${isOn ? 'var(--kb-accent)' : 'var(--kb-line)'}`,
    color: isOn ? 'var(--kb-accent-ink)' : 'var(--kb-ink)',
    fontSize: 'var(--kb-fs-sm)',
    fontWeight: 600 as const,
    cursor: 'pointer' as const,
  });

  return (
    <div className="relative w-full max-w-xl mx-auto" style={{ color: 'var(--kb-ink)', overflow: 'hidden' }}>
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', top: -100, right: -80, width: 380, height: 380, borderRadius: '50%',
          filter: 'blur(64px)', opacity: 0.55, pointerEvents: 'none',
          background: 'radial-gradient(circle, var(--kb-aurora-1) 0%, transparent 65%)',
        }}
      />

      <div className="relative px-5 pt-4 pb-6">
        <div style={{ fontSize: 'var(--kb-fs-sm)', color: 'var(--kb-ink-2)', letterSpacing: 0.5 }}>
          おつかれさまです
        </div>
        <h1 style={{ fontSize: 'var(--kb-fs-xxl)', fontWeight: 700, lineHeight: 1.3, margin: '10px 0 6px' }}>
          いま、<br />どんな状態ですか？
        </h1>
        <p style={{ fontSize: 'var(--kb-fs-sm)', color: 'var(--kb-ink-2)', margin: '0 0 22px' }}>
          答えた分だけ、提案がフィットしやすくなります（全部スキップでも OK）
        </p>

        {/* 気分 (mood) */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 'var(--kb-fs-xs)', color: 'var(--kb-ink-3)', marginBottom: 8, letterSpacing: 0.3 }}>
            気分
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {MOODS.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => update('mood', m.id)}
                style={buttonStyle(draft.mood === m.id)}
              >
                <div>{m.label}</div>
                <div style={{ fontSize: 'var(--kb-fs-xs)', fontWeight: 400, opacity: 0.7, marginTop: 2 }}>{m.hint}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 元気度 (energyLevel) */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 'var(--kb-fs-xs)', color: 'var(--kb-ink-3)', marginBottom: 8, letterSpacing: 0.3 }}>
            元気度
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {ENERGIES.map((e) => (
              <button key={e.id} type="button" onClick={() => update('energyLevel', e.id)} style={buttonStyle(draft.energyLevel === e.id)}>
                {e.label}
              </button>
            ))}
          </div>
        </div>

        {/* 状況 (socialContext) */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 'var(--kb-fs-xs)', color: 'var(--kb-ink-3)', marginBottom: 8, letterSpacing: 0.3 }}>
            まわり
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {SOCIALS.map((s) => (
              <button key={s.id} type="button" onClick={() => update('socialContext', s.id)} style={buttonStyle(draft.socialContext === s.id)}>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* 時間 (timePressure) */}
        <div style={{ marginBottom: 22 }}>
          <div style={{ fontSize: 'var(--kb-fs-xs)', color: 'var(--kb-ink-3)', marginBottom: 8, letterSpacing: 0.3 }}>
            時間
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {TIME_PRESSURES.map((t) => (
              <button key={t.id} type="button" onClick={() => update('timePressure', t.id)} style={buttonStyle(draft.timePressure === t.id)}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* アクションボタン */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            onClick={() => onSubmit(draft)}
            style={{
              flex: 1, padding: '16px 18px', borderRadius: 999,
              background: 'var(--kb-accent)', color: '#fff',
              border: 0, fontSize: 'var(--kb-fs-md)', fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 12px 28px color-mix(in oklab, var(--kb-accent) 30%, transparent)',
            }}
          >
            これで提案を見る
          </button>
          <button
            type="button"
            onClick={onSkip}
            style={{
              padding: '16px 18px', borderRadius: 999,
              background: 'var(--kb-surface)',
              border: '1px solid var(--kb-line)',
              fontSize: 'var(--kb-fs-sm)', fontWeight: 600,
              color: 'var(--kb-ink-2)',
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

// 既存の MoodId と DB の Mood enum を区別するため
export type { DbMood };
export default HomeState;
