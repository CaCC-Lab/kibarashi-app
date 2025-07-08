import React, { useState } from 'react';

interface Location {
  id: string;
  name: string;
  displayName: string;
  region: string;
}

interface LocationSelectorProps {
  currentLocation: string;
  onLocationChange: (location: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const LOCATIONS: Location[] = [
  { id: 'Tokyo', name: 'Tokyo', displayName: '東京', region: '関東' },
  { id: 'Osaka', name: 'Osaka', displayName: '大阪', region: '関西' },
  { id: 'Kyoto', name: 'Kyoto', displayName: '京都', region: '関西' },
  { id: 'Yokohama', name: 'Yokohama', displayName: '横浜', region: '関東' },
  { id: 'Nagoya', name: 'Nagoya', displayName: '名古屋', region: '中部' },
  { id: 'Sapporo', name: 'Sapporo', displayName: '札幌', region: '北海道' },
  { id: 'Fukuoka', name: 'Fukuoka', displayName: '福岡', region: '九州' },
  { id: 'Sendai', name: 'Sendai', displayName: '仙台', region: '東北' },
  { id: 'Hiroshima', name: 'Hiroshima', displayName: '広島', region: '中国' },
  { id: 'Kobe', name: 'Kobe', displayName: '神戸', region: '関西' },
];

const LocationSelector: React.FC<LocationSelectorProps> = ({
  currentLocation,
  onLocationChange,
  isOpen,
  onClose
}) => {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  
  const currentLocationData = LOCATIONS.find(loc => loc.name === currentLocation);
  const regions = [...new Set(LOCATIONS.map(loc => loc.region))];
  
  const filteredLocations = selectedRegion 
    ? LOCATIONS.filter(loc => loc.region === selectedRegion)
    : LOCATIONS;

  const handleLocationSelect = (location: Location) => {
    onLocationChange(location.name);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-text-primary dark:text-text-inverse">
            📍 場所を選択
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-surface-secondary dark:hover:bg-gray-700 text-text-secondary hover:text-text-primary transition-all duration-200"
            aria-label="閉じる"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 現在の場所 */}
        <div className="mb-4 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
          <p className="text-sm text-text-secondary dark:text-gray-300 mb-1">現在の設定</p>
          <p className="text-text-primary dark:text-text-inverse font-medium">
            📍 {currentLocationData?.displayName || currentLocation}
            {currentLocationData?.region && (
              <span className="text-sm text-text-secondary ml-2">({currentLocationData.region})</span>
            )}
          </p>
        </div>

        {/* 地域フィルター */}
        <div className="mb-4">
          <p className="text-sm text-text-secondary dark:text-gray-300 mb-2">地域で絞り込み</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedRegion(null)}
              className={`px-3 py-1 rounded-full text-sm transition-all duration-200 ${
                selectedRegion === null
                  ? 'bg-primary-500 text-white'
                  : 'bg-surface-secondary dark:bg-gray-700 text-text-secondary hover:bg-primary-100 dark:hover:bg-primary-900/20'
              }`}
            >
              すべて
            </button>
            {regions.map(region => (
              <button
                key={region}
                onClick={() => setSelectedRegion(region)}
                className={`px-3 py-1 rounded-full text-sm transition-all duration-200 ${
                  selectedRegion === region
                    ? 'bg-primary-500 text-white'
                    : 'bg-surface-secondary dark:bg-gray-700 text-text-secondary hover:bg-primary-100 dark:hover:bg-primary-900/20'
                }`}
              >
                {region}
              </button>
            ))}
          </div>
        </div>

        {/* 都市一覧 */}
        <div className="space-y-2">
          <p className="text-sm text-text-secondary dark:text-gray-300 mb-2">
            都市を選択（{filteredLocations.length}件）
          </p>
          {filteredLocations.map(location => {
            const isSelected = location.name === currentLocation;
            return (
              <button
                key={location.id}
                onClick={() => handleLocationSelect(location)}
                className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                  isSelected
                    ? 'bg-primary-100 dark:bg-primary-900/30 border-2 border-primary-500'
                    : 'bg-surface-secondary dark:bg-gray-700 hover:bg-primary-50 dark:hover:bg-primary-900/10 border-2 border-transparent'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-text-primary dark:text-text-inverse">
                      {location.displayName}
                    </p>
                    <p className="text-sm text-text-secondary dark:text-gray-300">
                      {location.region}地方
                    </p>
                  </div>
                  {isSelected && (
                    <div className="text-primary-500">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* フッター説明 */}
        <div className="mt-4 p-3 bg-surface-secondary dark:bg-gray-700 rounded-lg">
          <p className="text-sm text-text-secondary dark:text-gray-300">
            💡 場所を変更すると、その地域の天候や特徴に応じた気晴らし提案が生成されます
          </p>
        </div>
      </div>
    </div>
  );
};

export default LocationSelector;