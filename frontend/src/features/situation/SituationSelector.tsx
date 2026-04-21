import React from 'react';
import { SituationId, StudentSituationId, getSituationsForAgeGroup, getStudentContextDescription, getJobHuntingContextDescription } from '../../types/situation';
import { useAgeGroup } from '../../hooks/useAgeGroup';
import { lightImpact } from '../../utils/haptics';

interface SituationSelectorProps {
  selected: SituationId | null;
  onSelect: (situation: SituationId) => void;
}

const SituationSelector: React.FC<SituationSelectorProps> = ({ selected, onSelect }) => {
  const { currentAgeGroup } = useAgeGroup();
  const situations = getSituationsForAgeGroup(currentAgeGroup);

  // 年齢層に応じたタイトルとメッセージ
  const getContent = () => {
    switch (currentAgeGroup) {
      case 'student':
        return {
          title: 'どんな状況ですか？ 📚',
          message: 'いまの状況を選んでね'
        };
      case 'middle_school':
        return {
          title: 'どこにいますか？',
          message: '今いる場所を選んでください'
        };
      case 'housewife':
        return {
          title: 'どちらにいらっしゃいますか？',
          message: '現在の場所を選んでください'
        };
      case 'elderly':
        return {
          title: 'どちらにいらっしゃいますか？',
          message: '現在の場所をお選びください'
        };
      case 'job_seeker':
        return {
          title: 'どちらでリフレッシュしますか？ 💼',
          message: '就活の合間に、少し息抜きしましょう'
        };
      case 'career_changer':
        return {
          title: 'どちらでリフレッシュされますか？ 🌟',
          message: '転職活動の合間に、少し気分転換しましょう'
        };
      default: // office_worker
        return {
          title: 'どこにいますか？',
          message: '今いる場所を選んでください'
        };
    }
  };

  const { title, message } = getContent();

  return (
    <div className="w-full">
      <h2 className="text-xl font-bold text-text-primary mb-2 animate-fadeIn">{title}</h2>
      <p className="text-text-secondary mb-6 animate-fadeIn animation-delay-100">{message}</p>
      
      <div className={`grid gap-4 ${
        situations.length === 4 ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-1 md:grid-cols-3'
      }`}>
        {situations.map((option, index) => (
          <button
            key={option.id}
            data-testid={`situation-${option.id}`}
            onClick={() => {
              lightImpact();
              onSelect(option.id);
            }}
            className={`
              relative p-4 md:p-6 min-h-[100px] md:min-h-[120px] w-full
              afford-card border-2 animate-slideIn focus-ring
              ${
                selected === option.id
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-primary-200 bg-surface-primary hover:border-primary-400 hover:bg-primary-50'
              }
            `}
            style={{
              animationDelay: `${index * 100}ms`,
              ...(selected === option.id
                ? { borderColor: 'var(--kb-accent)', background: 'var(--kb-accent-soft)' }
                : {}),
            }}
            aria-pressed={selected === option.id}
            aria-describedby={`situation-${option.id}-desc`}
          >
            <div
              className={`
              flex flex-col items-center space-y-2 transition-colors duration-200
              ${selected === option.id ? 'text-primary-600' : 'text-text-secondary'}
            `}
              style={selected === option.id ? { color: 'var(--kb-accent-ink)' } : undefined}
            >
              <div className={`transition-transform duration-200 ${
                selected === option.id ? 'scale-110' : 'scale-100'
              }`}>
                {option.icon}
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-base md:text-lg">{option.label}</h3>
                <p id={`situation-${option.id}-desc`} className="text-xs md:text-sm opacity-80">{option.description}</p>
                
                {/* 学生向けの詳細説明 */}
                {currentAgeGroup === 'student' && option.id !== 'home' && (
                  <p className="text-xs text-primary-600 mt-1 opacity-90">
                    {getStudentContextDescription(option.id as StudentSituationId)}
                  </p>
                )}
                
                {/* 就職・転職活動者向けの詳細説明 */}
                {(currentAgeGroup === 'job_seeker' || currentAgeGroup === 'career_changer') && (
                  <p className="text-xs text-primary-600 mt-1 opacity-90">
                    {getJobHuntingContextDescription(option.id, currentAgeGroup)}
                  </p>
                )}
              </div>
            </div>
            
            {selected === option.id && (
              <div className="absolute top-2 md:top-3 right-2 md:right-3 animate-scaleIn">
                <div
                  className="w-5 h-5 md:w-6 md:h-6 bg-primary-500 rounded-full flex items-center justify-center"
                  style={{ background: 'var(--kb-accent)' }}
                >
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

export default SituationSelector;