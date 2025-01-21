'use client';

export type SortOption = 'latest' | 'popular' | 'trending';

const SORT_OPTIONS = [
  { id: 'latest', name: '最新順', icon: '🕒' },
  { id: 'popular', name: '人気順', icon: '👁' },
  { id: 'trending', name: '注目順', icon: '❤️' }
] as const;

type SortFilterProps = {
  selectedSort: SortOption;
  onSortChange: (sort: SortOption) => void;
};

export default function SortFilter({
  selectedSort,
  onSortChange
}: SortFilterProps) {
  return (
    <div className="flex items-center space-x-2 mb-6">
      <span className="text-sm text-gray-500">並び替え:</span>
      <div className="flex space-x-1">
        {SORT_OPTIONS.map((option) => (
          <button
            key={option.id}
            onClick={() => onSortChange(option.id)}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors
              flex items-center space-x-1
              ${
                selectedSort === option.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            <span>{option.icon}</span>
            <span>{option.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
} 