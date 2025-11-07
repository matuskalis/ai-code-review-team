"use client";

interface FilterBarProps {
  selectedFilter: string;
  onFilterChange: (filter: string) => void;
  issueCounts: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    security: number;
    performance: number;
    style: number;
  };
}

export default function FilterBar({
  selectedFilter,
  onFilterChange,
  issueCounts,
}: FilterBarProps) {
  const filters = [
    {
      id: "all",
      label: "All Issues",
      count: issueCounts.total,
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
          <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
        </svg>
      ),
    },
    { id: "critical", label: "Critical", count: issueCounts.critical, color: "red" },
    { id: "high", label: "High", count: issueCounts.high, color: "orange" },
    { id: "medium", label: "Medium", count: issueCounts.medium, color: "yellow" },
    { id: "low", label: "Low", count: issueCounts.low, color: "green" },
    {
      id: "security",
      label: "Security",
      count: issueCounts.security,
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      ),
    },
    {
      id: "performance",
      label: "Performance",
      count: issueCounts.performance,
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
        </svg>
      ),
    },
    {
      id: "style",
      label: "Style",
      count: issueCounts.style,
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ),
    },
  ];

  const getButtonClasses = (filterId: string, color?: string) => {
    const isSelected = selectedFilter === filterId;
    const baseClasses =
      "px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex items-center gap-2";

    if (isSelected) {
      if (color === "red")
        return `${baseClasses} bg-red-600 text-white shadow-lg shadow-red-500/30`;
      if (color === "orange")
        return `${baseClasses} bg-orange-600 text-white shadow-lg shadow-orange-500/30`;
      if (color === "yellow")
        return `${baseClasses} bg-yellow-600 text-white shadow-lg shadow-yellow-500/30`;
      if (color === "green")
        return `${baseClasses} bg-green-600 text-white shadow-lg shadow-green-500/30`;
      return `${baseClasses} bg-blue-600 text-white shadow-lg shadow-blue-500/30`;
    }

    return `${baseClasses} bg-slate-800/60 text-slate-300 hover:bg-slate-700/60 border border-slate-600/50`;
  };

  return (
    <div className="glass-card rounded-xl p-4 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm font-semibold text-slate-400">Filter by:</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => onFilterChange(filter.id)}
            className={getButtonClasses(filter.id, filter.color)}
          >
            {filter.icon && filter.icon}
            <span>{filter.label}</span>
            {filter.count > 0 && (
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  selectedFilter === filter.id
                    ? "bg-white/20"
                    : "bg-slate-700 text-slate-300"
                }`}
              >
                {filter.count}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
