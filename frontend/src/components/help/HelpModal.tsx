import React, { useState } from 'react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface HelpSection {
  id: string;
  title: string;
  icon: string;
  description: string;
  details: string[];
}

const HELP_SECTIONS: HelpSection[] = [
  {
    id: 'how-to-use',
    title: '使い方',
    icon: '🎯',
    description: '3ステップで簡単に気晴らし提案を取得',
    details: [
      '1. 今いる場所を選択（職場・家・外出先）',
      '2. 利用可能な時間を選択（5分・15分・30分）',
      '3. 年齢層を選択（会社員・学生・転職活動中など）',
      '「提案を見る」ボタンで3つの提案が生成されます'
    ]
  },
  {
    id: 'voice-guide',
    title: '音声ガイド',
    icon: '🔊',
    description: '提案を音声で読み上げ、目を休めながら実践',
    details: [
      '各提案の「音声で聞く」ボタンで再生',
      '自然な日本語音声で読み上げ',
      '目を閉じてリラックスしながら聞けます',
      '音声なしでも十分活用できます'
    ]
  },
  {
    id: 'location-change',
    title: '場所変更',
    icon: '📍',
    description: '全国各地の天候や特色に応じた提案を生成',
    details: [
      'ヘッダーの地名をクリックして変更',
      '東京・大阪・札幌など主要都市に対応',
      'その地域の天候や季節を考慮',
      '出張先や旅行先でも活用できます'
    ]
  },
  {
    id: 'dark-mode',
    title: 'ダークモード',
    icon: '🌙',
    description: '目に優しい暗い画面で夜間や疲れた時にも快適',
    details: [
      'ヘッダーの月アイコンで切り替え',
      'ブルーライトを抑えた配色',
      '設定は自動で保存されます',
      '疲れ目や夜間利用に最適'
    ]
  },
  {
    id: 'pwa',
    title: 'アプリ化',
    icon: '📱',
    description: 'スマホのホーム画面に追加してアプリのように使用',
    details: [
      'ブラウザの「ホーム画面に追加」で設定',
      'オフラインでも基本機能が利用可能',
      'アプリストア不要でインストール',
      'より手軽にアクセスできます'
    ]
  },
  {
    id: 'target-audience',
    title: '対象ユーザー',
    icon: '👥',
    description: '職場の人間関係でストレスを感じる20-40代に最適',
    details: [
      '上司・同僚との関係で疲れた時',
      '仕事の合間のリフレッシュに',
      '通勤時間や休憩時間の活用',
      '転職活動中の気分転換にも'
    ]
  }
];

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  const [activeSection, setActiveSection] = useState<string>('how-to-use');

  if (!isOpen) return null;

  const currentSection = HELP_SECTIONS.find(section => section.id === activeSection);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* ヘッダー */}
        <div className="border-b border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-text-primary dark:text-text-inverse">
                気晴らしアプリの使い方
              </h2>
              <p className="text-text-secondary dark:text-gray-300 mt-1">
                ストレス解消のための機能をご紹介します
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-surface-secondary dark:hover:bg-gray-700 text-text-secondary hover:text-text-primary transition-all duration-200"
              aria-label="閉じる"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex h-full max-h-[calc(90vh-120px)]">
          {/* サイドバー */}
          <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
            <nav className="p-4 space-y-2">
              {HELP_SECTIONS.map(section => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full text-left p-4 rounded-lg transition-all duration-200 ${
                    activeSection === section.id
                      ? 'bg-primary-100 dark:bg-primary-900/30 border-2 border-primary-500'
                      : 'bg-surface-secondary dark:bg-gray-700 hover:bg-primary-50 dark:hover:bg-primary-900/10 border-2 border-transparent'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">{section.icon}</span>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-text-primary dark:text-text-inverse text-sm">
                        {section.title}
                      </h3>
                      <p className="text-xs text-text-secondary dark:text-gray-300 mt-1 line-clamp-2">
                        {section.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </nav>
          </div>

          {/* メインコンテンツ */}
          <div className="flex-1 overflow-y-auto">
            {currentSection && (
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <span className="text-4xl">{currentSection.icon}</span>
                  <div>
                    <h3 className="text-xl font-bold text-text-primary dark:text-text-inverse">
                      {currentSection.title}
                    </h3>
                    <p className="text-text-secondary dark:text-gray-300">
                      {currentSection.description}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {currentSection.details.map((detail, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-surface-secondary dark:bg-gray-700 rounded-lg">
                      <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0 mt-0.5">
                        {detail.startsWith(String(index + 1)) ? String(index + 1) : '•'}
                      </div>
                      <p className="text-text-primary dark:text-text-inverse leading-relaxed">
                        {detail}
                      </p>
                    </div>
                  ))}
                </div>

                {/* 特別なセクションの場合は追加情報 */}
                {currentSection.id === 'how-to-use' && (
                  <div className="mt-6 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                    <h4 className="font-medium text-text-primary dark:text-text-inverse mb-2">
                      💡 コツとヒント
                    </h4>
                    <ul className="text-sm text-text-secondary dark:text-gray-300 space-y-1">
                      <li>• 集中できない時は短時間（5分）から始めてみましょう</li>
                      <li>• 継続的に使うことで、自分に合う気晴らし方法が見つかります</li>
                      <li>• 提案は毎回異なる内容が生成されます</li>
                    </ul>
                  </div>
                )}

                {currentSection.id === 'voice-guide' && (
                  <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                    <h4 className="font-medium text-text-primary dark:text-text-inverse mb-2">
                      🔇 音声が出ない場合
                    </h4>
                    <ul className="text-sm text-text-secondary dark:text-gray-300 space-y-1">
                      <li>• ブラウザの音声設定をご確認ください</li>
                      <li>• 一時的なサーバー問題の可能性があります</li>
                      <li>• 文字での提案でも十分効果的です</li>
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* フッター */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-surface-secondary dark:bg-gray-700">
          <div className="flex items-center justify-between">
            <p className="text-sm text-text-secondary dark:text-gray-300">
              ストレス軽減にお役立てください 🌟
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors duration-200"
            >
              始める
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;