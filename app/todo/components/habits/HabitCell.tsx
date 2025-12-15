interface HabitCellProps {
  checked: boolean;
  date: string;
  isToday?: boolean;
  isFuture?: boolean;
  onClick: () => void;
}

export function HabitCell({ 
  checked, 
  date, 
  isToday = false, 
  isFuture = false,
  onClick 
}: HabitCellProps) {
  return (
    <button
      onClick={onClick}
      disabled={isFuture}
      className={`
        w-8 h-8 flex items-center justify-center
        border rounded
        transition-all duration-150
        ${isToday ? 'ring-2 ring-blue-500 ring-offset-1' : ''}
        ${checked 
          ? 'bg-green-500 border-green-600 text-white hover:bg-green-600' 
          : 'bg-gray-50 border-gray-300 hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-600 dark:hover:bg-gray-700'
        }
        ${isFuture ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
        disabled:hover:bg-gray-50 dark:disabled:hover:bg-gray-800
      `}
      title={`${date} - ${checked ? 'Completed' : 'Not completed'}`}
    >
      {checked && (
        <svg 
          className="w-5 h-5" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M5 13l4 4L19 7" 
          />
        </svg>
      )}
    </button>
  );
}
