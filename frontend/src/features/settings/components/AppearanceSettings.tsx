import React from 'react';
import type { Appearance, FontSize, HomeVariant, Mood } from '../../../hooks/useAppearance';

interface AppearanceSettingsProps {
  appearance: Appearance;
  onChange: <K extends keyof Appearance>(key: K, value: Appearance[K]) => void;
}

const MOODS: Array<{ id: Mood; label: string; swatch: string }> = [
  { id: 'mist', label: 'mist', swatch: '#5B7A99' },
  { id: 'paper', label: 'paper', swatch: '#8A6A4A' },
  { id: 'sage', label: 'sage', swatch: '#6B8566' },
];

const HOME_VARIANTS: Array<{ id: HomeVariant; label: string }> = [
  { id: 'cta', label: 'CTA型' },
  { id: 'steps', label: 'ステップ' },
  { id: 'mood', label: '気分型' },
];

const FONT_SIZES: Array<{ id: FontSize; label: string }> = [
  { id: 'md', label: '標準' },
  { id: 'lg', label: '大きめ' },
];

export const AppearanceSettings: React.FC<AppearanceSettingsProps> = ({ appearance, onChange }) => {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">外観</h3>

      <div className="space-y-5">
        {/* カラーテーマ */}
        <div>
          <div className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">カラーテーマ</div>
          <div className="flex gap-2">
            {MOODS.map((m) => (
              <button
                key={m.id}
                type="button"
                aria-pressed={appearance.mood === m.id}
                onClick={() => onChange('mood', m.id)}
                className={`flex-1 h-11 rounded-lg text-xs font-semibold text-white transition-all ${
                  appearance.mood === m.id ? 'ring-2 ring-offset-2 ring-gray-800 dark:ring-gray-200 dark:ring-offset-gray-800' : 'opacity-80 hover:opacity-100'
                }`}
                style={{ background: m.swatch }}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* ホーム構成 */}
        <Segmented
          label="ホーム構成"
          value={appearance.homeVariant}
          options={HOME_VARIANTS}
          onChange={(v) => onChange('homeVariant', v)}
        />

        {/* タイポグラフィ */}
        <Segmented
          label="タイポグラフィ"
          value={appearance.serif ? 'serif' : 'sans'}
          options={[
            { id: 'sans', label: 'ゴシック' },
            { id: 'serif', label: '明朝' },
          ]}
          onChange={(v) => onChange('serif', v === 'serif')}
        />

        {/* 文字サイズ */}
        <Segmented
          label="文字サイズ"
          value={appearance.fontSize}
          options={FONT_SIZES}
          onChange={(v) => onChange('fontSize', v)}
        />

        {/* ダークモード */}
        <Segmented
          label="ダークモード"
          value={appearance.dark ? 'dark' : 'light'}
          options={[
            { id: 'light', label: 'ライト' },
            { id: 'dark', label: 'ダーク' },
          ]}
          onChange={(v) => onChange('dark', v === 'dark')}
        />
      </div>
    </div>
  );
};

interface SegmentedProps<T extends string> {
  label: string;
  value: T;
  options: Array<{ id: T; label: string }>;
  onChange: (value: T) => void;
}

function Segmented<T extends string>({ label, value, options, onChange }: SegmentedProps<T>) {
  return (
    <div>
      <div className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">{label}</div>
      <div className="flex rounded-full bg-gray-100 dark:bg-gray-700 p-1 gap-1">
        {options.map((o) => (
          <button
            key={o.id}
            type="button"
            aria-pressed={value === o.id}
            onClick={() => onChange(o.id)}
            className={`flex-1 py-2 rounded-full text-sm font-medium transition-all ${
              value === o.id
                ? 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100'
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
