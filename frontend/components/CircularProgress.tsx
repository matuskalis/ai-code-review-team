"use client";

interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  grade: string;
  label?: string;
}

const getGradeColor = (grade: string) => {
  switch (grade) {
    case "A+":
    case "A":
      return "#22c55e";
    case "B":
      return "#3b82f6";
    case "C":
      return "#eab308";
    case "D":
      return "#f97316";
    case "F":
      return "#ef4444";
    default:
      return "#64748b";
  }
};

export default function CircularProgress({
  value,
  max = 100,
  size = 160,
  strokeWidth = 12,
  grade,
  label,
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percentage = (value / max) * 100;
  const offset = circumference - (percentage / 100) * circumference;
  const color = getGradeColor(grade);

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(148, 163, 184, 0.2)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
          style={{
            filter: `drop-shadow(0 0 8px ${color}40)`,
          }}
        />
      </svg>
      {/* Center content */}
      <div className="absolute flex flex-col items-center">
        <div
          className="text-4xl font-bold mb-1"
          style={{ color }}
        >
          {grade}
        </div>
        <div className="text-sm text-gray-400">
          {value}/{max}
        </div>
        {label && (
          <div className="text-xs text-gray-500 mt-1">{label}</div>
        )}
      </div>
    </div>
  );
}
