import React, { useState } from 'react';

interface SuggestionCardProps {
  id: string;
  title: string;
  description: string;
  duration: number;
  category: '認知的' | '行動的';
  steps?: string[];
  onStart?: () => void;
}

const SuggestionCard: React.FC<SuggestionCardProps> = ({
  title,
  description,
  duration,
  category,
  steps,
  onStart,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const categoryStyles = {
    認知的: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-700',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
    },
    行動的: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-700',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
  };

  const style = categoryStyles[category];

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg hover-lift animate-slideIn h-full flex flex-col">
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
            <p className="text-gray-600 text-sm">{description}</p>
          </div>
          <div className={`ml-4 px-3 py-1 rounded-full ${style.bg} ${style.border} border`}>
            <div className={`flex items-center space-x-1 ${style.text}`}>
              {style.icon}
              <span className="text-sm font-medium">{category}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{duration}分</span>
            </div>
            {steps && (
              <div className="flex items-center space-x-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span>{steps.length}ステップ</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1">
          {steps && steps.length > 0 && (
            <div className="mb-4">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="group flex items-center gap-2 text-sm transition-colors"
                aria-expanded={isExpanded}
                aria-controls={`steps-${title.replace(/\s+/g, '-').toLowerCase()}`}
              >
                <div className={`
                  p-1 rounded-full transition-colors
                  ${isExpanded ? 'bg-primary-100' : 'bg-gray-100 group-hover:bg-gray-200'}
                `}>
                  <svg 
                    className={`w-4 h-4 transform transition-transform ${
                      isExpanded ? 'rotate-180 text-primary-600' : 'text-gray-600'
                    }`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                <span className={`font-medium ${isExpanded ? 'text-primary-700' : 'text-gray-700'}`}>
                  {isExpanded ? '手順を隠す' : `${steps.length}つの手順を見る`}
                </span>
              </button>
              
              {isExpanded && (
                <ol id={`steps-${title.replace(/\s+/g, '-').toLowerCase()}`} className="mt-3 space-y-2 animate-fadeIn">
                  {steps.map((step, index) => (
                    <li key={index} className="flex items-start space-x-3 text-sm text-gray-600 animate-slideIn" style={{ animationDelay: `${index * 50}ms` }}>
                      <span className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-medium">
                        {index + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          )}
        </div>

        <button
          onClick={onStart}
          className="w-full bg-primary-500 hover:bg-primary-600 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 hover-scale focus-ring"
          aria-label={`${title}の気晴らしを開始`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>この気晴らしを始める</span>
        </button>
      </div>
    </div>
  );
};

export default SuggestionCard;