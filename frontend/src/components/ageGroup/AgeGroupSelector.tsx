/**
 * 年齢層選択コンポーネント
 * Phase A: 年齢層別展開戦略
 */

import React, { useState } from 'react';
import { AgeGroup, AGE_GROUPS } from '../../types/ageGroup';
import { useAgeGroup } from '../../hooks/useAgeGroup';
import { useMetrics } from '../../hooks/useABTest';
import { motion, AnimatePresence } from 'framer-motion';

interface AgeGroupSelectorProps {
  onSelect?: (ageGroup: AgeGroup) => void;
  showOnlyAvailable?: boolean;
  className?: string;
}

export const AgeGroupSelector: React.FC<AgeGroupSelectorProps> = ({
  onSelect,
  showOnlyAvailable = true,
  className = ''
}) => {
  const { currentAgeGroup, updateAgeGroup, isFirstTimeUser } = useAgeGroup();
  const { trackAgeGroupSelection, trackCustomEvent } = useMetrics();
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<AgeGroup | null>(null);

  const handleSelect = (ageGroup: AgeGroup) => {
    setSelectedGroup(ageGroup);
    
    // A/Bテストメトリクス: 年齢層選択のトラッキング
    trackAgeGroupSelection(ageGroup, isFirstTimeUser);
    
    // 追加の詳細トラッキング
    trackCustomEvent('age_group_selector_interaction', {
      selectedAgeGroup: ageGroup,
      previousAgeGroup: currentAgeGroup,
      isExpansion: currentAgeGroup !== ageGroup,
      interactionTime: Date.now()
    });
    
    setTimeout(() => {
      if (onSelect) {
        // 外部からonSelectが提供されている場合は、それを使用
        onSelect(ageGroup);
      } else {
        // デフォルトの動作：直接更新
        updateAgeGroup(ageGroup);
      }
      setIsExpanded(false);
      setSelectedGroup(null);
    }, 300);
  };

  const ageGroups = Object.values(AGE_GROUPS).filter(
    group => !showOnlyAvailable || group.isAvailable
  );

  const currentGroupInfo = AGE_GROUPS[currentAgeGroup];

  return (
    <div className={`relative ${className}`}>
      {/* 現在の選択を表示するボタン */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`
          w-full px-4 py-3 rounded-lg border-2 transition-all duration-200
          flex items-center justify-between gap-3
          ${isExpanded 
            ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20' 
            : 'border-gray-300 dark:border-gray-600 hover:border-primary-400'
          }
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
        `}
        aria-expanded={isExpanded}
        aria-haspopup="listbox"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl" role="img" aria-label={currentGroupInfo.label}>
            {currentGroupInfo.emoji}
          </span>
          <div className="text-left">
            <div className="font-medium text-gray-900 dark:text-gray-100">
              {currentGroupInfo.label}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {currentGroupInfo.ageRange}
            </div>
          </div>
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
            isExpanded ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* 選択肢のドロップダウン */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
            role="listbox"
          >
            {ageGroups.map((group) => {
              const isSelected = group.id === currentAgeGroup;
              const isSelecting = group.id === selectedGroup;

              return (
                <button
                  key={group.id}
                  onClick={() => handleSelect(group.id)}
                  disabled={!group.isAvailable}
                  className={`
                    w-full px-4 py-3 text-left transition-all duration-200
                    flex items-center gap-3 relative
                    ${!group.isAvailable 
                      ? 'opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-900' 
                      : 'hover:bg-primary-50 dark:hover:bg-primary-900/20 cursor-pointer'
                    }
                    ${isSelected ? 'bg-primary-100 dark:bg-primary-900/30' : ''}
                    ${isSelecting ? 'scale-95 bg-primary-200 dark:bg-primary-800/40' : ''}
                  `}
                  role="option"
                  aria-selected={isSelected}
                  aria-disabled={!group.isAvailable}
                >
                  <span className="text-2xl" role="img" aria-label={group.label}>
                    {group.emoji}
                  </span>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                      {group.label}
                      {isSelected && (
                        <span className="text-xs bg-primary-200 dark:bg-primary-700 text-primary-800 dark:text-primary-200 px-2 py-0.5 rounded-full">
                          現在選択中
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {group.description}
                    </div>
                    {!group.isAvailable && group.releasePhase && (
                      <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {group.releasePhase}で提供予定
                      </div>
                    )}
                  </div>
                  {group.isAvailable && (
                    <svg
                      className={`w-5 h-5 transition-opacity duration-200 ${
                        isSelected ? 'opacity-100 text-primary-600' : 'opacity-0'
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* オーバーレイ */}
      {isExpanded && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsExpanded(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
};

/**
 * 初回ユーザー向けの年齢層選択モーダル
 */
interface AgeGroupOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AgeGroupOnboardingModal: React.FC<AgeGroupOnboardingModalProps> = ({
  isOpen,
  onClose
}) => {
  const { updateAgeGroup } = useAgeGroup();
  const [selectedGroup, setSelectedGroup] = useState<AgeGroup | null>(null);

  const handleSelect = (ageGroup: AgeGroup) => {
    setSelectedGroup(ageGroup);
    setTimeout(() => {
      updateAgeGroup(ageGroup);
      onClose();
    }, 500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            あなたに合った気晴らしを提供します
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            年齢層を選択することで、より適切な気晴らし方法をご提案できます。
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            {Object.values(AGE_GROUPS)
              .filter(group => group.isAvailable)
              .map((group) => (
                <button
                  key={group.id}
                  onClick={() => handleSelect(group.id)}
                  className={`
                    p-4 rounded-lg border-2 transition-all duration-300
                    ${selectedGroup === group.id
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 scale-95'
                      : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
                    }
                  `}
                >
                  <div className="text-3xl mb-2">{group.emoji}</div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    {group.label}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {group.ageRange}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                    {group.description}
                  </div>
                </button>
              ))}
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={onClose}
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              後で選択する
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};