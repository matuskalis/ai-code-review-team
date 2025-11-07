"use client";

import { CodeQualityScore } from "@/lib/types";
import CircularProgress from "./CircularProgress";

interface QualityScoreProps {
  score: CodeQualityScore;
}

const getScoreColor = (score: number) => {
  if (score >= 90) return "#22c55e";
  if (score >= 80) return "#3b82f6";
  if (score >= 70) return "#eab308";
  if (score >= 60) return "#f97316";
  return "#ef4444";
};

export default function QualityScore({ score }: QualityScoreProps) {
  const hasImprovementProjection =
    score.projected_score &&
    score.projected_grade &&
    score.projected_score > score.overall_score;

  const scoreMetrics = [
    {
      label: "Security",
      value: score.security_score,
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      ),
      description: "Vulnerabilities & risks",
    },
    {
      label: "Performance",
      value: score.performance_score,
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
        </svg>
      ),
      description: "Speed & efficiency",
    },
    {
      label: "Style",
      value: score.style_score,
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ),
      description: "Code quality & maintainability",
    },
  ];

  return (
    <div className="mb-8 slide-up">
      {/* Header Card */}
      <div className="glass-card rounded-2xl p-8 shadow-2xl border border-slate-700/50">
        {/* Overall Score - Circular Progress */}
        <div className="mb-8">
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-white mb-6">Code Quality Score</h3>
          </div>

          <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12">
            {/* Circular Progress Dial */}
            <div className="flex flex-col items-center">
              <CircularProgress
                value={score.overall_score}
                max={100}
                grade={score.grade}
                size={180}
                strokeWidth={14}
              />
              <div className="mt-4 text-center">
                <div className="text-sm font-semibold text-blue-400 mb-1">
                  Top {Math.round(100 - score.overall_score * 0.85)}%
                </div>
                <div className="text-xs text-slate-500">
                  Better than {Math.round(score.overall_score * 0.85)}% of submitted code
                </div>
              </div>
            </div>

            {/* Improvement Projection */}
            {hasImprovementProjection && (
              <div className="flex items-center gap-6">
                <svg className="w-10 h-10 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                <div className="flex flex-col items-center">
                  <CircularProgress
                    value={score.projected_score}
                    max={100}
                    grade={score.projected_grade}
                    size={140}
                    strokeWidth={10}
                  />
                  <div className="mt-3 text-center">
                    <div className="text-xs font-semibold text-blue-400">After Fixes</div>
                    <div className="text-xs text-slate-500">Potential improvement</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-center">
          {/* Spacer */}
          <div className="hidden lg:block lg:col-span-1"></div>

          {/* Individual Metrics */}
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
            {scoreMetrics.map((metric) => (
              <div
                key={metric.label}
                className="relative overflow-hidden rounded-xl bg-slate-800/50 border border-slate-700/50 p-6 hover:border-slate-600/50 transition-all duration-300 hover:scale-105"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="text-slate-300">{metric.icon}</div>
                  <div
                    className="text-2xl font-bold"
                    style={{ color: getScoreColor(metric.value) }}
                  >
                    {metric.value}
                  </div>
                </div>
                <div className="text-sm font-semibold text-white mb-1">
                  {metric.label}
                </div>
                <div className="text-xs text-slate-400">
                  {metric.description}
                </div>

                {/* Progress bar */}
                <div className="mt-4 h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: `${metric.value}%`,
                      backgroundColor: getScoreColor(metric.value),
                      boxShadow: `0 0 10px ${getScoreColor(metric.value)}40`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 pt-6 border-t border-slate-700/50">
          <div className="flex flex-wrap gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#ef4444" }}></div>
              <span>Critical (logarithmic penalty)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#f97316" }}></div>
              <span>High (scaled)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#eab308" }}></div>
              <span>Medium -6pts</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#22c55e" }}></div>
              <span>Low -2pts</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
