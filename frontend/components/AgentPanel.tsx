"use client";

interface AgentPanelProps {
  agentStatuses: Record<string, string>;
  isReviewing: boolean;
}

const agentInfo = {
  "Security Specialist": {
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    ),
    color: "text-red-400",
    bgColor: "bg-red-900/20",
    borderColor: "border-red-500/30",
    glowColor: "shadow-red-500/20",
  },
  "Performance Specialist": {
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
      </svg>
    ),
    color: "text-yellow-400",
    bgColor: "bg-yellow-900/20",
    borderColor: "border-yellow-500/30",
    glowColor: "shadow-yellow-500/20",
  },
  "Style & Maintainability Specialist": {
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ),
    color: "text-blue-400",
    bgColor: "bg-blue-900/20",
    borderColor: "border-blue-500/30",
    glowColor: "shadow-blue-500/20",
  },
  "Orchestrator": {
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
      </svg>
    ),
    color: "text-purple-400",
    bgColor: "bg-purple-900/20",
    borderColor: "border-purple-500/30",
    glowColor: "shadow-purple-500/20",
  },
};

export default function AgentPanel({
  agentStatuses,
  isReviewing,
}: AgentPanelProps) {
  // Extract issue count from status message
  const extractIssueCount = (status: string): number | null => {
    const match = status.match(/(\d+)\s+issue/i);
    return match ? parseInt(match[1]) : null;
  };

  // Calculate total issues found so far
  const totalIssuesFound = Object.values(agentStatuses).reduce((total, status) => {
    const count = extractIssueCount(status);
    return count ? total + count : total;
  }, 0);

  return (
    <div className="glass-card rounded-2xl shadow-xl p-6 h-full">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <svg className="w-6 h-6 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm2 10a1 1 0 10-2 0v3a1 1 0 102 0v-3zm2-3a1 1 0 011 1v5a1 1 0 11-2 0v-5a1 1 0 011-1zm4-1a1 1 0 10-2 0v7a1 1 0 102 0V8z" clipRule="evenodd" />
          </svg>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white">AI Review Agents</h2>
            <p className="text-xs text-slate-500">
              {isReviewing ? "Analyzing your code..." : Object.keys(agentStatuses).length > 0 ? "Review complete" : "Waiting for code submission"}
            </p>
          </div>
          {/* Live Issue Counter */}
          {isReviewing && totalIssuesFound > 0 && (
            <div className="px-3 py-1.5 bg-orange-500/20 border border-orange-500/50 rounded-full animate-pulse">
              <span className="text-orange-400 font-bold text-sm">{totalIssuesFound}</span>
              <span className="text-orange-400 text-xs ml-1">found</span>
            </div>
          )}
        </div>
      </div>

      {!isReviewing && Object.keys(agentStatuses).length === 0 && (
        <div className="text-center py-12 opacity-60">
          <svg className="w-16 h-16 mx-auto mb-4 text-slate-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm2 10a1 1 0 10-2 0v3a1 1 0 102 0v-3zm2-3a1 1 0 011 1v5a1 1 0 11-2 0v-5a1 1 0 011-1zm4-1a1 1 0 10-2 0v7a1 1 0 102 0V8z" clipRule="evenodd" />
          </svg>
          <p className="text-slate-500 mb-2 font-medium">Agents Ready</p>
          <p className="text-xs text-slate-600">Submit code to start review</p>
        </div>
      )}

      <div className="space-y-3">
        {Object.entries(agentInfo).map(([agentName, info]) => {
          const status = agentStatuses[agentName];
          const isActive = status !== undefined;
          const isComplete = status?.includes("✓") || status?.includes("Complete");
          const isFailed = status?.includes("✗") || status?.includes("Failed");

          return (
            <div
              key={agentName}
              className={`rounded-xl p-4 border transition-all duration-500 ${info.bgColor} ${
                info.borderColor
              } ${
                isActive
                  ? `opacity-100 scale-100 ${isComplete ? info.glowColor + " shadow-lg" : ""}`
                  : "opacity-50 scale-95"
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Animated Icon */}
                <div className={`${info.color} ${isReviewing && isActive && !isComplete ? "animate-pulse" : ""}`}>
                  {info.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className={`font-semibold ${info.color} text-sm`}>
                      {agentName}
                    </h3>
                    {/* Issue count badge */}
                    {status && extractIssueCount(status) !== null && (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${info.bgColor} ${info.borderColor} border`}>
                        {extractIssueCount(status)} issue{extractIssueCount(status) !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  {status ? (
                    <div className="flex items-center gap-2">
                      {/* Loading indicator */}
                      {isReviewing && !isComplete && !isFailed && (
                        <div className="flex gap-1">
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${info.color.replace(
                              "text-",
                              "bg-"
                            )} animate-pulse`}
                            style={{ animationDelay: "0ms" }}
                          />
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${info.color.replace(
                              "text-",
                              "bg-"
                            )} animate-pulse`}
                            style={{ animationDelay: "200ms" }}
                          />
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${info.color.replace(
                              "text-",
                              "bg-"
                            )} animate-pulse`}
                            style={{ animationDelay: "400ms" }}
                          />
                        </div>
                      )}
                      {/* Status text */}
                      <p className="text-xs text-slate-300 truncate">{status}</p>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500">Waiting...</p>
                  )}
                </div>

                {/* Status indicator */}
                {isComplete && (
                  <div className="flex-shrink-0">
                    <div className="w-6 h-6 rounded-full bg-green-500/20 border border-green-500/50 flex items-center justify-center">
                      <span className="text-xs">✓</span>
                    </div>
                  </div>
                )}
                {isFailed && (
                  <div className="flex-shrink-0">
                    <div className="w-6 h-6 rounded-full bg-red-500/20 border border-red-500/50 flex items-center justify-center">
                      <span className="text-xs">✗</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {isReviewing && (
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/30 rounded-xl">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6 text-blue-400 animate-spin-slow" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-sm font-medium text-blue-300">Analysis in progress</p>
              <p className="text-xs text-slate-400">This may take 20-30 seconds</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
