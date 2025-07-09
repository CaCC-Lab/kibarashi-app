import React, { useState } from 'react';
import { PREFECTURES, REGIONS_ORDER, Prefecture } from '../../data/prefectures';

interface LocationSelectorProps {
  currentLocation: string;
  onLocationChange: (location: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({
  currentLocation,
  onLocationChange,
  isOpen,
  onClose
}) => {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const currentLocationData = PREFECTURES.find(loc => loc.name === currentLocation || loc.displayName === currentLocation);
  
  // 検索フィルター
  const searchFilteredPrefectures = searchTerm 
    ? PREFECTURES.filter(pref => 
        pref.displayName.includes(searchTerm) || 
        pref.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (pref.capital && pref.capital.includes(searchTerm))
      )
    : PREFECTURES;
  
  // 地域フィルター
  const filteredPrefectures = selectedRegion 
    ? searchFilteredPrefectures.filter(pref => pref.region === selectedRegion)
    : searchFilteredPrefectures;

  const handleLocationSelect = (prefecture: Prefecture) => {
    onLocationChange(prefecture.name);
    onClose();
    setSearchTerm('');
    setSelectedRegion(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-text-primary dark:text-text-inverse">
            📍 都道府県を選択
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
              <span className="text-sm text-text-secondary ml-2">({currentLocationData.region}地方)</span>
            )}
          </p>
        </div>

        {/* 検索ボックス */}
        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="都道府県名で検索..."
              className="w-full px-4 py-2 pl-10 bg-surface-secondary dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-text-primary dark:text-text-inverse"
            />
            <svg className="absolute left-3 top-2.5 w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
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
            {REGIONS_ORDER.map(region => (
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

        {/* 都道府県一覧 */}
        <div className="space-y-2">
          <p className="text-sm text-text-secondary dark:text-gray-300 mb-2">
            都道府県を選択（{filteredPrefectures.length}件）
          </p>
          {filteredPrefectures.length === 0 ? (
            <div className="text-center py-8 text-text-secondary">
              <p>該当する都道府県が見つかりません</p>
            </div>
          ) : (
            filteredPrefectures.map(prefecture => {
              const isSelected = prefecture.name === currentLocation || prefecture.displayName === currentLocation;
              return (
                <button
                  key={prefecture.id}
                  data-testid={`location-${prefecture.id}`}
                  onClick={() => handleLocationSelect(prefecture)}
                  className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                    isSelected
                      ? 'bg-primary-100 dark:bg-primary-900/30 border-2 border-primary-500'
                      : 'bg-surface-secondary dark:bg-gray-700 hover:bg-primary-50 dark:hover:bg-primary-900/10 border-2 border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-text-primary dark:text-text-inverse">
                        {prefecture.displayName}
                      </p>
                      <p className="text-sm text-text-secondary dark:text-gray-300">
                        {prefecture.region}地方
                        {prefecture.capital && ` • ${prefecture.capital}`}
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
            })
          )}
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