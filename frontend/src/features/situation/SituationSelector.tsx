import React from 'react';

interface SituationOption {
  id: 'workplace' | 'home' | 'outside';
  label: string;
  icon: React.ReactNode;
  description: string;
}

interface SituationSelectorProps {
  selected: 'workplace' | 'home' | 'outside' | null;
  onSelect: (situation: 'workplace' | 'home' | 'outside') => void;
}

const situations: SituationOption[] = [
  {
    id: 'workplace',
    label: '職場',
    description: 'オフィスや仕事場で',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    id: 'home',
    label: '家',
    description: '自宅でリラックス',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    id: 'outside',
    label: '外出先',
    description: '外出中や移動中に',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

const SituationSelector: React.FC<SituationSelectorProps> = ({ selected, onSelect }) => {
  return (
    <div className="w-full">
      <h2 className="text-xl font-bold text-gray-800 mb-2">どこにいますか？</h2>
      <p className="text-gray-600 mb-6">今いる場所を選んでください</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {situations.map((option) => (
          <button
            key={option.id}
            onClick={() => onSelect(option.id)}
            className={`
              relative p-6 rounded-xl border-2 transition-all duration-200
              ${
                selected === option.id
                  ? 'border-primary-500 bg-primary-50 shadow-lg transform scale-105'
                  : 'border-gray-200 bg-white hover:border-primary-300 hover:shadow-md'
              }
            `}
          >
            <div className={`
              flex flex-col items-center space-y-3
              ${selected === option.id ? 'text-primary-600' : 'text-gray-600'}
            `}>
              {option.icon}
              <div className="text-center">
                <h3 className="font-semibold text-lg">{option.label}</h3>
                <p className="text-sm opacity-80">{option.description}</p>
              </div>
            </div>
            
            {selected === option.id && (
              <div className="absolute top-3 right-3">
                <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
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