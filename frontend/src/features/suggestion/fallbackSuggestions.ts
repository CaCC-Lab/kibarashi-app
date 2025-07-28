import { Suggestion } from '../../services/api/suggestions';

export const fallbackSuggestions: Suggestion[] = [
  {
    id: 'fallback-1',
    title: '5分だけ散歩する',
    description: '近所を少し歩くだけでも気分転換になります。',
    category: '行動的',
    duration: 5,
    dataSource: 'fallback',
  },
  {
    id: 'fallback-2',
    title: '温かい飲み物を飲む',
    description: 'コーヒー、紅茶、ハーブティーなどで一息つきましょう。',
    category: '認知的',
    duration: 5,
    dataSource: 'fallback',
  },
  {
    id: 'fallback-3',
    title: '好きな音楽を1曲聴く',
    description: 'お気に入りの曲に集中して、他のことを忘れましょう。',
    category: '認知的',
    duration: 5,
    dataSource: 'fallback',
  },
  {
    id: 'fallback-4',
    title: '簡単なストレッチをする',
    description: '体を軽く動かすと、心もほぐれます。',
    category: '行動的',
    duration: 5,
    dataSource: 'fallback',
  },
  {
    id: 'fallback-5',
    title: '目を閉じて深呼吸する',
    description: '1分間、ゆっくりと呼吸に意識を向けてみましょう。',
    category: '認知的',
    duration: 5,
    dataSource: 'fallback',
  },
];
