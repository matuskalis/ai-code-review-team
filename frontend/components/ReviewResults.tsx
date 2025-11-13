"use client";

import { CodeReviewResponse, ReviewIssue } from "@/lib/types";
import { useState, useMemo } from "react";
import { Filter } from "lucide-react";
import QualityScore from "./QualityScore";
import FilterBar from "./FilterBar";
import SummaryMetrics from "./SummaryMetrics";
import IssuesTable from "./IssuesTable";
import BottomSheet from "./BottomSheet";

interface ReviewResultsProps {
  result: CodeReviewResponse;
  previousReview?: CodeReviewResponse | null;
  reviewIteration?: number;
  onResetComparison?: () => void;
}

const severityConfig = {
  critical: {
    color: "text-[#ef4444]",
    bg: "bg-[#ef4444]/15",
    border: "border-[#ef4444]/50",
    stripe: "bg-[#ef4444]",
    label: "Critical",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
    ),
    glow: "shadow-[#ef4444]/20",
  },
  high: {
    color: "text-[#f97316]",
    bg: "bg-[#f97316]/15",
    border: "border-[#f97316]/50",
    stripe: "bg-[#f97316]",
    label: "High",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
    ),
    glow: "shadow-[#f97316]/20",
  },
  medium: {
    color: "text-[#eab308]",
    bg: "bg-[#eab308]/15",
    border: "border-[#eab308]/50",
    stripe: "bg-[#eab308]",
    label: "Medium",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
      </svg>
    ),
    glow: "shadow-[#eab308]/20",
  },
  low: {
    color: "text-[#22c55e]",
    bg: "bg-[#22c55e]/15",
    border: "border-[#22c55e]/50",
    stripe: "bg-[#22c55e]",
    label: "Low",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ),
    glow: "shadow-[#22c55e]/20",
  },
  info: {
    color: "text-blue-400",
    bg: "bg-blue-900/30",
    border: "border-blue-500/50",
    stripe: "bg-blue-500",
    label: "Info",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
      </svg>
    ),
    glow: "shadow-blue-500/20",
  },
};

const agentConfig = {
  security: {
    name: "Security",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    ),
    color: "text-red-400"
  },
  performance: {
    name: "Performance",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
      </svg>
    ),
    color: "text-yellow-400"
  },
  style: {
    name: "Style",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ),
    color: "text-blue-400"
  },
};

// Helper function to extract code blocks from suggestion text
function extractCodeBlock(text: string): { code: string; language: string; description: string } | null {
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/;
  const match = text.match(codeBlockRegex);

  if (match) {
    const language = match[1] || "text";
    const code = match[2].trim();
    const description = text.replace(codeBlockRegex, "").trim();
    return { code, language, description };
  }
  return null;
}

// Helper function to extract concise title
function getTitle(text: string): string {
  const firstSentence = text.split(/[.!?]/)[0];
  return firstSentence.length > 80 ? firstSentence.substring(0, 80) + "..." : firstSentence;
}

export default function ReviewResults({
  result,
  previousReview,
  reviewIteration = 0,
  onResetComparison,
}: ReviewResultsProps) {
  const [expandedAgents, setExpandedAgents] = useState<Record<string, boolean>>({
    security: false,
    performance: false,
    style: false,
  });

  // View mode toggle: default to cards on mobile, table on desktop
  const [viewMode, setViewMode] = useState<"table" | "cards">(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth < 768 ? "cards" : "table";
    }
    return "table";
  });
  const [sortBy, setSortBy] = useState<"severity" | "impact" | "line">("severity");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Load filter from localStorage on mount
  const [selectedFilter, setSelectedFilter] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("reviewFilter") || "all";
    }
    return "all";
  });

  // Persist filter to localStorage when it changes
  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter);
    if (typeof window !== "undefined") {
      localStorage.setItem("reviewFilter", filter);
    }
  };

  const toggleAgent = (agentType: string) => {
    setExpandedAgents(prev => ({
      ...prev,
      [agentType]: !prev[agentType],
    }));
  };

  // Calculate issue counts for filter bar
  const issueCounts = useMemo(() => {
    const counts = {
      total: result.unique_issues?.length || 0,
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      security: 0,
      performance: 0,
      style: 0,
    };

    result.unique_issues?.forEach((issue) => {
      // Count by severity
      if (issue.severity === "critical") counts.critical++;
      else if (issue.severity === "high") counts.high++;
      else if (issue.severity === "medium") counts.medium++;
      else if (issue.severity === "low") counts.low++;

      // Count by agent
      issue.found_by?.forEach((agent) => {
        const agentLower = agent.toLowerCase();
        if (agentLower.includes("security")) counts.security++;
        else if (agentLower.includes("performance")) counts.performance++;
        else if (agentLower.includes("style")) counts.style++;
      });
    });

    return counts;
  }, [result.unique_issues]);

  // Filter issues based on selected filter
  const filteredIssues = useMemo(() => {
    if (!result.unique_issues) return [];

    let issues = result.unique_issues.filter((issue) => {
      if (selectedFilter === "all") return true;
      if (selectedFilter === issue.severity) return true;

      // Filter by agent
      if (selectedFilter === "security" && issue.found_by?.some(a => a.toLowerCase().includes("security"))) return true;
      if (selectedFilter === "performance" && issue.found_by?.some(a => a.toLowerCase().includes("performance"))) return true;
      if (selectedFilter === "style" && issue.found_by?.some(a => a.toLowerCase().includes("style"))) return true;

      return false;
    });

    // Sort issues based on selected sort method
    const sortedIssues = [...issues].sort((a, b) => {
      if (sortBy === "severity") {
        const severityOrder = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
        return severityOrder[a.severity] - severityOrder[b.severity];
      } else if (sortBy === "impact") {
        // High impact = critical/high severity + many agents found it
        const getImpact = (issue: typeof a) => {
          const severityWeight = { critical: 4, high: 3, medium: 2, low: 1, info: 0 }[issue.severity];
          const agentCount = issue.found_by?.length || 0;
          return severityWeight * 10 + agentCount;
        };
        return getImpact(b) - getImpact(a);
      } else if (sortBy === "line") {
        // Sort by line number (nulls last)
        if (a.line_number === null) return 1;
        if (b.line_number === null) return -1;
        return a.line_number - b.line_number;
      }
      return 0;
    });

    return sortedIssues;
  }, [result.unique_issues, selectedFilter, sortBy]);

  // Group issues by severity for severity-first display
  const issuesBySeverity = useMemo(() => {
    const grouped: Record<string, typeof filteredIssues> = {
      critical: [],
      high: [],
      medium: [],
      low: [],
      info: [],
    };

    filteredIssues.forEach((issue) => {
      if (grouped[issue.severity]) {
        grouped[issue.severity].push(issue);
      }
    });

    return grouped;
  }, [filteredIssues]);

  return (
    <div className="slide-in-left space-y-6">
      {/* Summary Metrics Bar */}
      <SummaryMetrics
        totalIssues={result.unique_issues?.length || 0}
        grade={result.quality_score?.grade || "N/A"}
        agentCount={result.agent_reviews.length}
        result={result}
      />

      {/* Before/After Comparison Card */}
      {previousReview && previousReview.quality_score && result.quality_score && (
        <div className="glass-card rounded-xl p-6 border-l-4 border-l-green-500 mb-6 slide-up">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                  <span>Iteration #{reviewIteration}</span>
                  <span className="text-xs px-2 py-1 bg-blue-500/20 border border-blue-500/50 text-blue-400 rounded-full">Re-analysis</span>
                </h3>
                <p className="text-sm text-slate-400">
                  Comparing improvements from your previous review
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              {/* Score Comparison */}
              <div className="text-center">
                <div className="text-xs text-slate-500 mb-1">Score</div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-slate-400 line-through">
                    {previousReview.quality_score.overall_score}
                  </span>
                  <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                  </svg>
                  <span className="text-2xl font-bold text-green-400">
                    {result.quality_score.overall_score}
                  </span>
                  <span className="text-sm text-green-400 font-semibold">
                    (+{result.quality_score.overall_score - previousReview.quality_score.overall_score})
                  </span>
                </div>
              </div>

              {/* Issues Comparison */}
              <div className="text-center">
                <div className="text-xs text-slate-500 mb-1">Issues</div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-slate-400 line-through">
                    {previousReview.unique_issues?.length || 0}
                  </span>
                  <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-2xl font-bold text-green-400">
                    {result.unique_issues?.length || 0}
                  </span>
                  <span className="text-sm text-green-400 font-semibold">
                    ({(previousReview.unique_issues?.length || 0) - (result.unique_issues?.length || 0)} fixed)
                  </span>
                </div>
              </div>

              {/* Grade Comparison */}
              <div className="text-center">
                <div className="text-xs text-slate-500 mb-1">Grade</div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-slate-400 line-through">
                    {previousReview.quality_score.grade}
                  </span>
                  <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                  </svg>
                  <span className="text-2xl font-bold text-green-400">
                    {result.quality_score.grade}
                  </span>
                </div>
              </div>

              {/* Reset Button */}
              {onResetComparison && (
                <button
                  onClick={onResetComparison}
                  className="ml-4 px-3 py-2 bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600 text-slate-300 text-xs font-medium rounded-lg transition-colors"
                  title="Reset comparison"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="glass-card rounded-2xl shadow-2xl p-8">
        <h2 className="text-2xl font-bold text-white mb-8">Review Results</h2>

        {/* Quality Score */}
        {result.quality_score && (
          <QualityScore score={result.quality_score} />
        )}

        {/* Overall Summary */}
        <div className="mb-12 p-6 bg-slate-900/50 rounded-xl border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">Executive Summary</h3>
            <span className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full text-sm font-semibold shadow-lg">
              {result.unique_issues?.length || result.total_issues} unique issues
            </span>
          </div>
          <div className="text-slate-300 whitespace-pre-line text-sm leading-relaxed">
            {result.overall_summary}
          </div>
        </div>

        {/* Filter Bar + View Toggle - Sticky on Mobile */}
        {result.unique_issues && result.unique_issues.length > 0 && (
          <div className="sticky top-0 z-20 bg-slate-950/95 backdrop-blur-sm pb-4 mb-6 -mx-4 px-4 md:mx-0 md:px-0 md:static md:bg-transparent md:backdrop-blur-none">
            {/* Mobile Filter Button */}
            <div className="md:hidden flex items-center gap-2 mb-3">
              <button
                onClick={() => setShowMobileFilters(true)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors active:scale-95 min-h-[44px]"
              >
                <Filter className="w-5 h-5" />
                <span className="font-semibold">
                  Filters {selectedFilter !== "all" ? `(${selectedFilter})` : ""}
                </span>
              </button>

              {/* View Mode Toggle - Mobile */}
              <div className="flex items-center gap-1 glass-card rounded-lg p-1">
                <button
                  onClick={() => setViewMode("cards")}
                  className={`p-2 rounded transition-colors active:scale-95 ${
                    viewMode === "cards"
                      ? "bg-blue-600 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                  aria-label="Card view"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 12a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1v-4zM11 4a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V4zM11 12a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode("table")}
                  className={`p-2 rounded transition-colors active:scale-95 ${
                    viewMode === "table"
                      ? "bg-blue-600 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                  aria-label="Table view"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Desktop Filter Bar */}
            <div className="hidden md:flex items-center justify-between gap-4">
              <div className="flex-1">
                <FilterBar
                  selectedFilter={selectedFilter}
                  onFilterChange={handleFilterChange}
                  issueCounts={issueCounts}
                />
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-400 font-medium">Sort by:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as "severity" | "impact" | "line")}
                  className="px-3 py-1.5 bg-slate-800/80 text-slate-300 text-xs font-medium rounded-lg border border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                >
                  <option value="severity">Severity</option>
                  <option value="impact">High Impact</option>
                  <option value="line">Line Number</option>
                </select>
              </div>

              {/* View Mode Toggle - Desktop */}
              <div className="flex items-center gap-2 glass-card rounded-lg p-1">
                <button
                  onClick={() => setViewMode("table")}
                  className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
                    viewMode === "table"
                      ? "bg-blue-600 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode("cards")}
                  className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
                    viewMode === "cards"
                      ? "bg-blue-600 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 12a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1v-4zM11 4a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V4zM11 12a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Mobile Bottom Sheet for Filters */}
            <BottomSheet
              isOpen={showMobileFilters}
              onClose={() => setShowMobileFilters(false)}
              title="Filter Issues"
            >
              <div className="space-y-4">
                <FilterBar
                  selectedFilter={selectedFilter}
                  onFilterChange={(filter) => {
                    handleFilterChange(filter);
                    setShowMobileFilters(false);
                  }}
                  issueCounts={issueCounts}
                />

                {/* Sort Option in Mobile Filter */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Sort by</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as "severity" | "impact" | "line")}
                    className="w-full px-4 py-3 bg-slate-800 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all min-h-[44px]"
                  >
                    <option value="severity">Severity (High to Low)</option>
                    <option value="impact">High Impact First</option>
                    <option value="line">Line Number</option>
                  </select>
                </div>
              </div>
            </BottomSheet>
          </div>
        )}

        {/* Table View or Card View */}
        {filteredIssues.length > 0 ? (
          viewMode === "table" ? (
            <div className="mb-8">
              <IssuesTable issues={filteredIssues} />
            </div>
          ) : (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <h3 className="text-2xl font-bold text-white">
                {selectedFilter === "all" ? "Key Findings" : `Filtered: ${selectedFilter}`}
              </h3>
              <div className="h-px flex-1 bg-gradient-to-r from-slate-700 to-transparent"></div>
            </div>

            {/* Group by Severity: Critical → High → Medium → Low → Info */}
            <div className="space-y-12">
              {(["critical", "high", "medium", "low", "info"] as const).map((severity) => {
                const severityIssues = issuesBySeverity[severity];
                if (severityIssues.length === 0) return null;

                const config = severityConfig[severity];

                return (
                  <div key={severity} className="space-y-5">
                    {/* Severity Section Header */}
                    <div className="flex items-center gap-3">
                      <div className={`flex items-center gap-2 ${config.color}`}>
                        <div className="w-6 h-6">{config.icon}</div>
                        <h4 className="text-xl font-bold uppercase tracking-wide">
                          {config.label}
                        </h4>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${config.bg} ${config.border} border`}>
                        {severityIssues.length} {severityIssues.length === 1 ? "issue" : "issues"}
                      </span>
                      <div className="h-px flex-1 bg-gradient-to-r from-slate-700 to-transparent"></div>
                    </div>

                    {/* Issues for this severity */}
                    <div className="space-y-4">
                      {severityIssues.map((issue, idx) => (
                        <div key={idx} className="fade-in-card">
                          <UniqueIssueCard issue={issue} />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          )
        ) : (
          result.unique_issues && result.unique_issues.length > 0 && (
            <div className="text-center py-12 text-slate-400">
              <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
              <p>No issues match the selected filter</p>
            </div>
          )
        )}

        {/* Agent Reviews */}
        <div className="mt-12 space-y-4">
        {result.agent_reviews.map((agentReview) => {
          const config = agentConfig[agentReview.agent_type];
          const isExpanded = expandedAgents[agentReview.agent_type];

          return (
            <div
              key={agentReview.agent_type}
              className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden"
            >
              {/* Agent Header */}
              <button
                onClick={() => toggleAgent(agentReview.agent_type)}
                className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={config.color}>{config.icon}</div>
                  <div className="text-left">
                    <h3 className={`font-semibold ${config.color}`}>
                      {config.name} Review
                    </h3>
                    <p className="text-sm text-gray-400">
                      {agentReview.issues.length} issue{agentReview.issues.length !== 1 ? 's' : ''} found
                    </p>
                  </div>
                </div>
                <svg
                  className={`w-5 h-5 text-gray-400 transition-transform ${
                    isExpanded ? "transform rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Agent Details */}
              {isExpanded && (
                <div className="px-5 pb-5 space-y-4">
                  {/* Summary */}
                  <div className="p-3 bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-300">{agentReview.summary}</p>
                  </div>

                  {/* Issues */}
                  {agentReview.issues.length > 0 ? (
                    <div className="space-y-3">
                      {agentReview.issues.map((issue, idx) => (
                        <IssueCard key={idx} issue={issue} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      No issues found by this agent
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
        </div>
      </div>
    </div>
  );
}

function UniqueIssueCard({ issue }: { issue: ReviewIssue }) {
  const config = severityConfig[issue.severity];
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [showFixedCode, setShowFixedCode] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const handleCopy = () => {
    const text = `${issue.issue}\n\nFix: ${issue.suggestion}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const title = getTitle(issue.issue);
  const hasMoreDetails = issue.issue.length > title.length;
  const codeBlock = extractCodeBlock(issue.suggestion);

  return (
    <div className="relative overflow-hidden rounded-xl bg-slate-900/60 border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300 group">
      {/* Vertical color stripe */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${config.stripe} ${config.glow}`} />

      <div className="pl-6 pr-4 py-5">
        {/* Header Row */}
        <div className="flex items-start gap-4 mb-3">
          <div className={`flex-shrink-0 mt-1 ${config.color}`}>{config.icon}</div>

          <div className="flex-1 min-w-0">
            {/* Title + Badges */}
            <div className="flex items-start gap-3 mb-2 flex-wrap">
              <h3 className="text-white font-semibold text-base flex-1 min-w-0">
                {title}
              </h3>

              <div className="flex items-center gap-2 flex-shrink-0">
                <span
                  className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase ${config.color} bg-slate-800/80 border ${config.border}`}
                >
                  {issue.severity}
                </span>

                {issue.line_number !== null && (
                  <span className="text-xs text-slate-400 font-mono bg-slate-800/50 px-2 py-1 rounded-md">
                    Line {issue.line_number}
                  </span>
                )}
              </div>
            </div>

            {/* Found by badges */}
            {issue.found_by && issue.found_by.length > 0 && (
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs text-slate-500">Detected by:</span>
                <div className="flex gap-1.5">
                  {issue.found_by.map((agent) => (
                    <span
                      key={agent}
                      className="px-2 py-0.5 bg-purple-900/40 border border-purple-500/40 text-purple-300 text-xs rounded font-medium"
                    >
                      {agent}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Expandable details */}
            {hasMoreDetails && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-sm text-blue-400 hover:text-blue-300 mb-3 flex items-center gap-1 transition-colors"
              >
                {expanded ? "Less details" : "More details"}
                <span className={`transform transition-transform ${expanded ? "rotate-180" : ""}`}>▼</span>
              </button>
            )}

            <div className={`expand-content ${expanded && hasMoreDetails ? "expanded" : ""}`}>
              <div className="mb-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                <p className="text-sm text-slate-300 leading-relaxed">{issue.issue}</p>
              </div>
            </div>

            {/* Suggestion Box */}
            <div className="bg-slate-800/60 rounded-lg border border-slate-700/50">
              {codeBlock ? (
                <>
                  {/* Description */}
                  {codeBlock.description && (
                    <div className="p-4 border-b border-slate-700/50">
                      <div className="flex items-start gap-3">
                        <svg className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
                        </svg>
                        <span className="text-green-400 text-sm font-semibold">Fix:</span>
                        <p className="text-sm text-slate-300 leading-relaxed flex-1">{codeBlock.description}</p>
                      </div>
                    </div>
                  )}

                  {/* Code Block */}
                  <div className="relative">
                    {/* Toggle and Copy buttons */}
                    <div className="flex items-center justify-between px-4 py-2 bg-slate-900/80 border-b border-slate-700/50">
                      <button
                        onClick={() => setShowFixedCode(!showFixedCode)}
                        className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1.5 transition-colors"
                      >
                        <span>{showFixedCode ? "▼" : "▶"}</span>
                        <span>{showFixedCode ? "Hide" : "View"} Fixed Code</span>
                        <span className="text-slate-500">({codeBlock.language})</span>
                      </button>

                      {showFixedCode && (
                        <button
                          onClick={() => handleCopyCode(codeBlock.code)}
                          className="text-xs px-2 py-1 bg-slate-700/50 hover:bg-slate-600/50 rounded transition-colors flex items-center gap-1.5"
                        >
                          {copiedCode ? (
                            <>
                              <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              <span className="text-green-400">Copied!</span>
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                                <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                              </svg>
                              <span className="text-slate-300">Copy Code</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    {/* Code Display */}
                    <div className={`expand-content ${showFixedCode ? "expanded" : ""}`}>
                      <div className="p-4 bg-[#1e293b] overflow-x-auto">
                        <pre className="text-xs font-mono text-slate-300 leading-relaxed">
                          <code>{codeBlock.code}</code>
                        </pre>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                /* Fallback for non-code suggestions */
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <svg className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
                    </svg>
                    <span className="text-green-400 text-sm font-semibold">Fix:</span>
                    <p className="text-sm text-slate-300 leading-relaxed flex-1">{issue.suggestion}</p>

                    <button
                      onClick={handleCopy}
                      className="flex-shrink-0 p-1.5 hover:bg-slate-700/50 rounded transition-colors"
                      title="Copy fix snippet"
                    >
                      {copied ? (
                        <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-slate-400 hover:text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                          <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function IssueCard({ issue }: { issue: ReviewIssue }) {
  const config = severityConfig[issue.severity];

  return (
    <div className={`p-4 rounded-lg border ${config.bg} ${config.border}`}>
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 ${config.color}`}>{config.icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-xs font-semibold uppercase ${config.color}`}>
              {issue.severity}
            </span>
            {issue.line_number !== null && (
              <span className="text-xs text-gray-500">
                Line {issue.line_number}
              </span>
            )}
          </div>
          <p className="text-white font-medium mb-2">{issue.issue}</p>
          <div className="p-3 bg-gray-900/50 rounded border border-gray-700">
            <p className="text-sm text-gray-300">
              <span className="text-green-400 font-medium">Suggestion: </span>
              {issue.suggestion}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
