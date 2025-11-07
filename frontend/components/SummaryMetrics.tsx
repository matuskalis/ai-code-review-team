"use client";

import { useState, useEffect } from "react";
import { CodeReviewResponse } from "@/lib/types";

interface SummaryMetricsProps {
  totalIssues: number;
  grade: string;
  agentCount: number;
  result?: CodeReviewResponse;  // Full result for export
}

export default function SummaryMetrics({
  totalIssues,
  grade,
  agentCount,
  result,
}: SummaryMetricsProps) {
  const [reviewTime, setReviewTime] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [exported, setExported] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      setReviewTime((Date.now() - startTime) / 1000);
    }, 100);

    // Assume review is complete when component mounts with results
    setTimeout(() => {
      setIsComplete(true);
      clearInterval(interval);
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const createShareableLink = () => {
    if (!result) return;

    // Create shareable link with encoded result data
    const encodedData = btoa(JSON.stringify({
      review_id: result.review_id,
      grade: result.quality_score?.grade,
      overall_score: result.quality_score?.overall_score,
      total_issues: result.total_issues,
      timestamp: new Date().toISOString(),
    }));

    const shareUrl = `${window.location.origin}/share/${encodedData}`;

    // Copy to clipboard
    navigator.clipboard.writeText(shareUrl);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const exportAsMarkdown = () => {
    if (!result) return;

    const markdown = generateMarkdownReport(result);

    // Copy to clipboard
    navigator.clipboard.writeText(markdown);
    setExported(true);
    setTimeout(() => setExported(false), 2000);

    // Also trigger download
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `code-review-${result.review_id.substring(0, 8)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const generateMarkdownReport = (result: CodeReviewResponse): string => {
    const lines: string[] = [];

    // Header
    lines.push("# Code Review Report\n");
    lines.push(`**Review ID:** ${result.review_id}`);
    lines.push(`**Date:** ${new Date().toISOString().split("T")[0]}`);
    lines.push(`**Grade:** ${result.quality_score?.grade || "N/A"} (${result.quality_score?.overall_score || 0}/100)\n`);

    // Summary
    lines.push("## Executive Summary\n");
    lines.push(result.overall_summary);
    lines.push("");

    // Quality Scores
    if (result.quality_score) {
      lines.push("## Quality Metrics\n");
      lines.push(`- **Overall Score:** ${result.quality_score.overall_score}/100`);
      lines.push(`- **Security:** ${result.quality_score.security_score}/100`);
      lines.push(`- **Performance:** ${result.quality_score.performance_score}/100`);
      lines.push(`- **Style:** ${result.quality_score.style_score}/100`);

      if (result.quality_score.projected_score && result.quality_score.projected_grade) {
        lines.push(`\n**Expected after fixes:** ${result.quality_score.projected_grade} (${result.quality_score.projected_score}/100)`);
      }
      lines.push("");
    }

    // Issues by severity
    if (result.unique_issues && result.unique_issues.length > 0) {
      lines.push("## Issues\n");

      const severities = ["critical", "high", "medium", "low", "info"];
      severities.forEach((severity) => {
        const issues = result.unique_issues.filter((i) => i.severity === severity);
        if (issues.length === 0) return;

        lines.push(`### ${severity.toUpperCase()} (${issues.length})\n`);

        issues.forEach((issue, idx) => {
          lines.push(`#### ${idx + 1}. ${issue.issue.split(/[.!?]/)[0]}`);
          if (issue.line_number !== null) {
            lines.push(`**Line:** ${issue.line_number}`);
          }
          if (issue.found_by && issue.found_by.length > 0) {
            lines.push(`**Detected by:** ${issue.found_by.join(", ")}`);
          }
          lines.push("");
          lines.push(`**Issue:** ${issue.issue}`);
          lines.push("");
          lines.push(`**Suggested Fix:** ${issue.suggestion}`);
          lines.push("");
        });
      });
    }

    // Agent Reviews
    lines.push("## Agent Reviews\n");
    result.agent_reviews.forEach((review) => {
      const icon = review.agent_type === "security" ? "🛡️" : review.agent_type === "performance" ? "⚡" : "✨";
      lines.push(`### ${icon} ${review.agent_type.charAt(0).toUpperCase() + review.agent_type.slice(1)} Agent\n`);
      lines.push(`**Status:** ${review.status}`);
      lines.push(`**Summary:** ${review.summary}`);
      lines.push(`**Issues Found:** ${review.issues.length}`);
      lines.push("");
    });

    lines.push("---");
    lines.push("*Generated by AI Code Review Team*");

    return lines.join("\n");
  };

  return (
    <div className="glass-card rounded-xl p-4 mb-6 border-l-4 border-l-blue-500">
      <div className="flex items-center justify-between flex-wrap gap-4">
        {/* Review Status */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <div className="text-sm font-semibold text-white">Review Complete</div>
            <div className="text-xs text-slate-400">
              {agentCount} AI agents analyzed your code
            </div>
          </div>
        </div>

        {/* Metrics with mini bars */}
        <div className="flex gap-6">
          {/* Grade */}
          <div className="text-center min-w-[80px]">
            <div className="text-2xl font-bold text-blue-400 mb-1">{grade}</div>
            <div className="text-xs text-slate-500 mb-2">Grade</div>
            {/* Mini visual indicator */}
            <div className="h-1 bg-slate-700/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-400 rounded-full transition-all duration-1000"
                style={{
                  width: grade === "A+" || grade === "A" ? "100%" :
                         grade === "B" ? "80%" :
                         grade === "C" ? "60%" :
                         grade === "D" ? "40%" : "20%"
                }}
              />
            </div>
          </div>

          {/* Issues */}
          <div className="text-center min-w-[80px]">
            <div className="text-2xl font-bold text-orange-400 mb-1">{totalIssues}</div>
            <div className="text-xs text-slate-500 mb-2">Issues</div>
            {/* Mini visual indicator - fewer is better */}
            <div className="h-1 bg-slate-700/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-400 rounded-full transition-all duration-1000"
                style={{
                  width: totalIssues === 0 ? "0%" :
                         totalIssues <= 3 ? "25%" :
                         totalIssues <= 6 ? "50%" :
                         totalIssues <= 10 ? "75%" : "100%"
                }}
              />
            </div>
          </div>

          {/* Time */}
          {isComplete && (
            <div className="text-center min-w-[80px]">
              <div className="text-2xl font-bold text-purple-400 mb-1">
                {reviewTime.toFixed(1)}s
              </div>
              <div className="text-xs text-slate-500 mb-2">Duration</div>
              {/* Mini visual indicator */}
              <div className="h-1 bg-slate-700/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-400 rounded-full transition-all duration-1000"
                  style={{
                    width: reviewTime <= 5 ? "100%" :
                           reviewTime <= 10 ? "75%" :
                           reviewTime <= 15 ? "50%" : "25%"
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {/* Share Link Button */}
          <button
            onClick={createShareableLink}
            disabled={!result}
            className={`px-4 py-2 text-white text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-2 border ${
              linkCopied
                ? "bg-green-600 border-green-500"
                : "bg-blue-600/90 hover:bg-blue-600 border-blue-500"
            } ${!result ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {linkCopied ? (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Link Copied!</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                </svg>
                <span>Share Report</span>
              </>
            )}
          </button>

          {/* Export Button */}
          <button
            onClick={exportAsMarkdown}
            disabled={!result}
            className={`px-4 py-2 text-white text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-2 border ${
              exported
                ? "bg-green-600 border-green-500"
                : "bg-slate-700/80 hover:bg-slate-600/80 border-slate-600"
            } ${!result ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {exported ? (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Exported!</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                <span>Export Report</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
