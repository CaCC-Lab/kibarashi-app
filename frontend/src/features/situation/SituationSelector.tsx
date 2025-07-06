import React from 'react';
import { SituationId, getSituationsForAgeGroup, getStudentContextDescription } from '../../types/situation';
import { useAgeGroup } from '../../hooks/useAgeGroup';

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
            onClick={() => {
              if ('vibrate' in navigator && typeof navigator.vibrate === 'function') {
                navigator.vibrate(30);
              }
              onSelect(option.id);
            }}
            className={`
              relative p-4 md:p-6 min-h-[100px] md:min-h-[120px] w-full
              rounded-xl border-2 transition-all duration-200 
              animate-slideIn hover-lift focus-ring
              ${
                selected === option.id
                  ? 'border-primary-500 bg-primary-50 shadow-lg transform scale-105'
                  : 'border-primary-200 bg-surface-primary hover:border-primary-400 hover:bg-primary-50 hover:shadow-md hover:scale-[1.02]'
              }
            `}
            style={{ animationDelay: `${index * 100}ms` }}
            aria-pressed={selected === option.id}
            aria-describedby={`situation-${option.id}-desc`}
          >
            <div className={`
              flex flex-col items-center space-y-2 transition-colors duration-200
              ${selected === option.id ? 'text-primary-600' : 'text-text-secondary'}
            `}>
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
                    {getStudentContextDescription(option.id as any)}
                  </p>
                )}
              </div>
            </div>
            
            {selected === option.id && (
              <div className="absolute top-2 md:top-3 right-2 md:right-3 animate-scaleIn">
                <div className="w-5 h-5 md:w-6 md:h-6 bg-primary-500 rounded-full flex items-center justify-center">
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