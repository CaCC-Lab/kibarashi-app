import { Suggestion } from '../../services/api/types';
import { useFavorites } from '../../hooks/useFavorites';

interface FavoriteButtonProps {
  suggestion: Suggestion;
  className?: string;
}

/**
 * お気に入り登録/解除ボタン
 */
export default function FavoriteButton({ suggestion, className = '' }: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const isFav = isFavorite(suggestion.id);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // カードのクリックイベントを防ぐ
    toggleFavorite(suggestion);
  };

  return (
    <button
      onClick={handleClick}
      className={`p-2 rounded-full transition-all duration-200 ${
        isFav 
          ? 'text-red-500 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30' 
          : 'text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700'
      } ${className}`}
      aria-label={isFav ? 'お気に入りから削除' : 'お気に入りに追加'}
      title={isFav ? 'お気に入りから削除' : 'お気に入りに追加'}
    >
      <svg
        className="w-5 h-5"
        fill={isFav ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
        />
      </svg>
    </button>
  );
}