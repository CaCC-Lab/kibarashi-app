import React from 'react';

interface DurationOption {
  id: 5 | 15 | 30;
  label: string;
  description: string;
  color: string;
  examples: string;
}

interface DurationSelectorProps {
  selected: 5 | 15 | 30 | null;
  onSelect: (duration: 5 | 15 | 30) => void;
}

const durations: DurationOption[] = [
  {
    id: 5,
    label: '5分',
    description: 'ちょっとした気分転換に',
    color: 'from-accent-400 to-accent-600',
    examples: '深呼吸、軽いストレッチ',
  },
  {
    id: 15,
    label: '15分',
    description: 'しっかりリフレッシュ',
    color: 'from-primary-400 to-primary-600',
    examples: '瞑想、散歩、読書',
  },
  {
    id: 30,
    label: '30分',
    description: 'じっくり気晴らし',
    color: 'from-secondary-400 to-secondary-600',
    examples: '運動、料理、創作活動',
  },
];

const DurationSelector: React.FC<DurationSelectorProps> = ({ selected, onSelect }) => {
  return (
    <div className="w-full">
      <h2 className="text-xl font-bold text-text-primary mb-2 animate-fadeIn">どのくらい時間がありますか？</h2>
      <p className="text-text-secondary mb-6 animate-fadeIn animation-delay-100">気晴らしに使える時間を選んでください</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {durations.map((option, index) => (
          <button
            key={option.id}
            onClick={() => {
              if ('vibrate' in navigator && typeof navigator.vibrate === 'function') {
                navigator.vibrate(30);
              }
              onSelect(option.id);
            }}
            className={`
              relative overflow-hidden rounded-xl border-2 transition-all duration-200
              animate-slideIn hover-lift focus-ring min-h-[180px] md:min-h-[200px]
              ${
                selected === option.id
                  ? 'border-primary-500 shadow-lg transform scale-105'
                  : 'border-primary-200 hover:border-primary-400 hover:shadow-md hover:scale-[1.02]'
              }
            `}
            style={{ animationDelay: `${index * 100}ms` }}
            aria-pressed={selected === option.id}
            aria-describedby={`duration-${option.id}-desc`}
          >
            <div className={`
              absolute inset-0 opacity-10 bg-gradient-to-br ${option.color}
              ${selected === option.id ? 'opacity-20' : ''}
            `} />
            
            <div className="relative p-6 bg-surface-primary bg-opacity-95">
              <div className="flex flex-col items-center space-y-3">
                <div className="relative w-16 h-16">
                  <svg className="transform -rotate-90 w-16 h-16">
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      stroke="hsl(from var(--color-primary-200) h s l)"
                      strokeWidth="4"
                      fill="none"
                    />
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      stroke={selected === option.id ? 'hsl(from var(--color-primary-500) h s l)' : 'hsl(from var(--color-text-muted) h s l)'}
                      strokeWidth="4"
                      fill="none"
                      strokeDasharray={`${(option.id / 30) * 176} 176`}
                      className="transition-all duration-300"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-xl font-bold transition-colors duration-200 ${
                      selected === option.id ? 'text-primary-600' : 'text-text-primary'
                    }`}>{option.id}</span>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className={`
                    text-lg font-semibold mb-1 transition-colors duration-200
                    ${selected === option.id ? 'text-primary-600' : 'text-text-primary'}
                  `}>
                    {option.label}
                  </div>
                  <p id={`duration-${option.id}-desc`} className="text-sm text-text-secondary">{option.description}</p>
                  <p className="text-xs text-text-muted mt-1">{option.examples}</p>
                </div>
              </div>
            </div>
            
            {selected === option.id && (
              <div className="absolute top-3 right-3 animate-scaleIn">
                <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default DurationSelector;