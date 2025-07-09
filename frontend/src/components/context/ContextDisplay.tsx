import React from 'react';

export interface WeatherData {
  temperature: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'unknown';
  description: string;
  humidity: number;
  location: string;
  icon: string;
}

export interface SeasonalData {
  season: 'spring' | 'summer' | 'autumn' | 'winter';
  month: number;
  seasonalEvents: string[];
  holidays: string[];
  specialPeriods: string[];
  seasonalTips: string[];
}

interface ContextDisplayProps {
  weather?: WeatherData | null;
  seasonal: SeasonalData;
  className?: string;
}

const ContextDisplay: React.FC<ContextDisplayProps> = ({ 
  weather, 
  seasonal, 
  className = '' 
}) => {
  const getWeatherIcon = (condition: WeatherData['condition']) => {
    const icons = {
      sunny: '☀️',
      cloudy: '☁️',
      rainy: '🌧️',
      snowy: '❄️',
      unknown: '🌤️'
    };
    return icons[condition];
  };

  const getSeasonIcon = (season: SeasonalData['season']) => {
    const icons = {
      spring: '🌸',
      summer: '☀️',
      autumn: '🍂',
      winter: '❄️'
    };
    return icons[season];
  };

  const getSeasonText = (season: SeasonalData['season']) => {
    const seasons = {
      spring: '春',
      summer: '夏',
      autumn: '秋',
      winter: '冬'
    };
    return seasons[season];
  };

  const getSeasonTheme = (season: SeasonalData['season']) => {
    const themes = {
      spring: 'from-pink-50 to-green-50 border-pink-200',
      summer: 'from-blue-50 to-yellow-50 border-blue-200',
      autumn: 'from-orange-50 to-red-50 border-orange-200',
      winter: 'from-cyan-50 to-blue-50 border-cyan-200'
    };
    return themes[season];
  };

  return (
    <div 
      data-testid="weather-info"
      className={`bg-gradient-to-r ${getSeasonTheme(seasonal.season)} border rounded-lg p-4 mb-6 ${className}`}
    >
      <div className="flex flex-wrap items-center gap-4">
        {/* 天候情報 */}
        {weather && (
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{getWeatherIcon(weather.condition)}</span>
            <div className="text-sm">
              <div className="font-medium text-gray-800">
                {weather.temperature}°C {weather.description}
              </div>
              <div className="text-gray-600">
                {weather.location}
              </div>
            </div>
          </div>
        )}

        {/* 季節情報 */}
        <div className="flex items-center space-x-2">
          <span className="text-2xl">{getSeasonIcon(seasonal.season)}</span>
          <div className="text-sm">
            <div className="font-medium text-gray-800">
              {getSeasonText(seasonal.season)} ({seasonal.month}月)
            </div>
            {seasonal.seasonalEvents.length > 0 && (
              <div className="text-gray-600">
                {seasonal.seasonalEvents[0]}
              </div>
            )}
          </div>
        </div>

        {/* 特別な期間・祝日 */}
        {(seasonal.holidays.length > 0 || seasonal.specialPeriods.length > 0) && (
          <div className="flex items-center space-x-2">
            <span className="text-xl">🎌</span>
            <div className="text-sm">
              <div className="font-medium text-gray-800">
                {seasonal.holidays.length > 0 ? seasonal.holidays[0] : seasonal.specialPeriods[0]}
              </div>
              <div className="text-gray-600 text-xs">
                特別な時期
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 季節のヒント（最大2つまで表示） */}
      {seasonal.seasonalTips.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="text-xs text-gray-600 mb-1">今の季節におすすめ</div>
          <div className="flex flex-wrap gap-2">
            {seasonal.seasonalTips.slice(0, 2).map((tip, index) => (
              <span 
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-white/70 text-gray-700 border border-gray-200"
              >
                {tip}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ContextDisplay;