"use client";

import { ReviewIssue } from "@/lib/types";
import { useState } from "react";

interface IssuesTableProps {
  issues: ReviewIssue[];
}

const severityConfig = {
  critical: {
    color: "text-red-400",
    bg: "bg-red-900/20",
    border: "border-red-500/50",
    badge: "bg-red-500/20 border-red-500/50 text-red-400",
  },
  high: {
    color: "text-orange-400",
    bg: "bg-orange-900/20",
    border: "border-orange-500/50",
    badge: "bg-orange-500/20 border-orange-500/50 text-orange-400",
  },
  medium: {
    color: "text-yellow-400",
    bg: "bg-yellow-900/20",
    border: "border-yellow-500/50",
    badge: "bg-yellow-500/20 border-yellow-500/50 text-yellow-400",
  },
  low: {
    color: "text-green-400",
    bg: "bg-green-900/20",
    border: "border-green-500/50",
    badge: "bg-green-500/20 border-green-500/50 text-green-400",
  },
  info: {
    color: "text-blue-400",
    bg: "bg-blue-900/20",
    border: "border-blue-500/50",
    badge: "bg-blue-500/20 border-blue-500/50 text-blue-400",
  },
};

function extractCodeBlock(text: string): { code: string; language: string } | null {
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/;
  const match = text.match(codeBlockRegex);

  if (match) {
    const language = match[1] || "text";
    const code = match[2].trim();
    return { code, language };
  }
  return null;
}

function getTitle(text: string): string {
  const firstSentence = text.split(/[.!?]/)[0];
  return firstSentence.length > 100 ? firstSentence.substring(0, 100) + "..." : firstSentence;
}

export default function IssuesTable({ issues }: IssuesTableProps) {
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [copiedCode, setCopiedCode] = useState<number | null>(null);

  const handleCopyCode = (index: number, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(index);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-slate-700/50">
      <table className="w-full">
        {/* Table Header */}
        <thead className="bg-slate-800/50 border-b border-slate-700/50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider w-24">
              Severity
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Issue
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider w-20">
              Line
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider w-32">
              Detected By
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider w-32">
              Action
            </th>
          </tr>
        </thead>

        {/* Table Body */}
        <tbody className="bg-slate-900/50 divide-y divide-slate-700/50">
          {issues.map((issue, index) => {
            const config = severityConfig[issue.severity];
            const codeBlock = extractCodeBlock(issue.suggestion);
            const isExpanded = expandedRow === index;
            const title = getTitle(issue.issue);

            return (
              <>
                {/* Main Row */}
                <tr
                  key={index}
                  className="hover:bg-slate-800/30 transition-colors cursor-pointer"
                  onClick={() => setExpandedRow(isExpanded ? null : index)}
                >
                  {/* Severity Badge */}
                  <td className="px-4 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase border ${config.badge}`}>
                      {issue.severity}
                    </span>
                  </td>

                  {/* Issue Title */}
                  <td className="px-4 py-4">
                    <div className="flex items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white font-medium leading-relaxed">
                          {title}
                        </p>
                      </div>
                      {!isExpanded && (
                        <svg className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      )}
                      {isExpanded && (
                        <svg className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      )}
                    </div>
                  </td>

                  {/* Line Number */}
                  <td className="px-4 py-4">
                    {issue.line_number !== null ? (
                      <span className="text-sm font-mono text-slate-400">
                        {issue.line_number}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-600">N/A</span>
                    )}
                  </td>

                  {/* Detected By - Hover Tooltip */}
                  <td className="px-4 py-4">
                    <div className="group relative">
                      <div className="flex -space-x-2">
                        {issue.found_by?.slice(0, 3).map((agent, i) => (
                          <div
                            key={i}
                            className="w-8 h-8 rounded-full bg-slate-700 border-2 border-slate-900 flex items-center justify-center"
                            title={agent}
                          >
                            <span className="text-xs font-bold text-slate-300">
                              {agent.charAt(0)}
                            </span>
                          </div>
                        ))}
                        {issue.found_by && issue.found_by.length > 3 && (
                          <div className="w-8 h-8 rounded-full bg-slate-700 border-2 border-slate-900 flex items-center justify-center">
                            <span className="text-xs font-bold text-slate-300">
                              +{issue.found_by.length - 3}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Hover Tooltip */}
                      <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-10">
                        <div className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 shadow-xl whitespace-nowrap">
                          <div className="text-xs text-slate-300 font-medium mb-1">Detected by:</div>
                          <div className="space-y-1">
                            {issue.found_by?.map((agent, i) => (
                              <div key={i} className="text-xs text-slate-400">
                                • {agent}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Fix Button */}
                  <td className="px-4 py-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedRow(isExpanded ? null : index);
                      }}
                      className="px-3 py-1.5 bg-blue-600/90 hover:bg-blue-600 text-white text-xs font-semibold rounded transition-colors"
                    >
                      {isExpanded ? "Hide Fix" : "View Fix"}
                    </button>
                  </td>
                </tr>

                {/* Expanded Row - Fix Details */}
                {isExpanded && (
                  <tr>
                    <td colSpan={5} className="px-4 py-4 bg-slate-800/30">
                      <div className="space-y-4">
                        {/* Full Issue Description */}
                        <div>
                          <div className="text-xs font-semibold text-slate-400 uppercase mb-2">
                            Issue Details
                          </div>
                          <p className="text-sm text-slate-300 leading-relaxed">
                            {issue.issue}
                          </p>
                        </div>

                        {/* Fix Suggestion */}
                        <div>
                          <div className="text-xs font-semibold text-slate-400 uppercase mb-2">
                            Suggested Fix
                          </div>
                          {codeBlock ? (
                            <div className="bg-slate-900/80 rounded-lg border border-slate-700/50 overflow-hidden">
                              {/* Code Header */}
                              <div className="flex items-center justify-between px-4 py-2 bg-slate-800/80 border-b border-slate-700/50">
                                <span className="text-xs text-slate-400 font-mono">
                                  {codeBlock.language}
                                </span>
                                <button
                                  onClick={() => handleCopyCode(index, codeBlock.code)}
                                  className="flex items-center gap-1.5 px-2 py-1 bg-slate-700/50 hover:bg-slate-600/50 rounded text-xs transition-colors"
                                >
                                  {copiedCode === index ? (
                                    <>
                                      <svg className="w-3 h-3 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                      </svg>
                                      <span className="text-green-400">Copied!</span>
                                    </>
                                  ) : (
                                    <>
                                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                                        <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                                      </svg>
                                      <span className="text-slate-300">Copy</span>
                                    </>
                                  )}
                                </button>
                              </div>

                              {/* Code Block */}
                              <div className="p-4 overflow-x-auto">
                                <pre className="text-xs font-mono text-slate-300 leading-relaxed">
                                  <code>{codeBlock.code}</code>
                                </pre>
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm text-slate-300 leading-relaxed">
                              {issue.suggestion}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            );
          })}
        </tbody>
      </table>

      {issues.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <p>No issues found in this category</p>
        </div>
      )}
    </div>
  );
}
