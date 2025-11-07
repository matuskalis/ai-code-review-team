"use client";

import { useState, useEffect, useCallback } from "react";
import { CodeReviewResponse, WebSocketMessage } from "@/lib/types";

// Language detection function
function detectLanguage(code: string): { language: string; confidence: number } | null {
  if (!code.trim()) return null;

  const patterns = {
    python: [
      /^import\s+\w+/m,
      /^from\s+\w+\s+import/m,
      /def\s+\w+\s*\(/,
      /:\s*$/m,
      /@\w+/,
      /\bself\b/,
      /\bprint\s*\(/,
    ],
    javascript: [
      /^import\s+.*\s+from\s+['"]/m,
      /^const\s+\w+\s*=/m,
      /^let\s+\w+\s*=/m,
      /^var\s+\w+\s*=/m,
      /=>\s*{/,
      /function\s+\w+\s*\(/,
      /console\.log\(/,
    ],
    typescript: [
      /^import\s+.*\s+from\s+['"]/m,
      /:\s*(string|number|boolean|any)\b/,
      /^interface\s+\w+/m,
      /^type\s+\w+/m,
      /<\w+>/,
      /^const\s+\w+:\s*\w+/m,
    ],
    java: [
      /^import\s+[\w.]+;/m,
      /^public\s+class\s+\w+/m,
      /^private\s+\w+\s+\w+/m,
      /System\.out\.println\(/,
      /@Override/,
      /\bpublic\s+static\s+void\s+main\b/,
    ],
    go: [
      /^package\s+\w+/m,
      /^import\s+\(/m,
      /^func\s+\w+\s*\(/m,
      /^type\s+\w+\s+struct/m,
      /:=\s*/,
      /fmt\.Print/,
    ],
    rust: [
      /^use\s+\w+/m,
      /^fn\s+\w+\s*\(/m,
      /^pub\s+fn\s+\w+/m,
      /let\s+mut\s+\w+/,
      /::\w+/,
      /println!\(/,
      /&\w+/,
    ],
  };

  const scores: Record<string, number> = {};

  for (const [lang, langPatterns] of Object.entries(patterns)) {
    let matches = 0;
    for (const pattern of langPatterns) {
      if (pattern.test(code)) {
        matches++;
      }
    }
    scores[lang] = matches / langPatterns.length;
  }

  // Find the language with the highest score
  const entries = Object.entries(scores);
  if (entries.length === 0) return null;

  const [bestLang, bestScore] = entries.reduce((a, b) => (a[1] > b[1] ? a : b));

  if (bestScore === 0) return null;

  return { language: bestLang, confidence: bestScore };
}

interface CodeInputProps {
  onReviewStart: () => void;
  onAgentUpdate: (agent: string, message: string) => void;
  onReviewComplete: (result: CodeReviewResponse) => void;
  isReviewing: boolean;
  shouldLoadDemo?: boolean;
  onDemoLoaded?: () => void;
}

const CODE_EXAMPLES = [
  {
    name: "Vulnerable Python (Grade: D-F)",
    language: "python",
    context: "User authentication function with security flaws",
    code: `def authenticate_user(username, password):
    # Security issue: SQL injection vulnerability
    query = f"SELECT * FROM users WHERE username = '{username}' AND password = '{password}'"
    result = db.execute(query)

    # Performance issue: N+1 query problem
    users = []
    for user_id in result:
        user_data = db.execute(f"SELECT * FROM user_details WHERE id = {user_id}")
        users.append(user_data)

    # Style issue: poor error handling
    return users[0] if users else None`,
  },
  {
    name: "React Component Issues (Grade: C)",
    language: "javascript",
    context: "React component with performance and security issues",
    code: `import React, { useState, useEffect } from 'react';

function UserProfile({ userId }) {
    const [user, setUser] = useState(null);
    const [posts, setPosts] = useState([]);

    // Performance: Missing dependency array causes infinite loop
    useEffect(() => {
        fetch('/api/user/' + userId)
            .then(res => res.json())
            .then(data => setUser(data));
    });

    // Security: XSS vulnerability
    const renderBio = () => {
        return <div dangerouslySetInnerHTML={{__html: user.bio}} />;
    };

    // Performance: Unnecessary re-renders, no memoization
    const filteredPosts = posts.filter(post => post.userId === userId);

    // Style: Inconsistent error handling
    if (!user) return null;

    return (
        <div>
            <h1>{user.name}</h1>
            {renderBio()}
            {filteredPosts.map(post => <div key={post.id}>{post.title}</div>)}
        </div>
    );
}`,
  },
  {
    name: "TypeScript Async Issues (Grade: B)",
    language: "typescript",
    context: "API endpoint handler with async/await issues",
    code: `import { Request, Response } from 'express';

async function processOrder(req: Request, res: Response) {
    const { userId, items } = req.body;

    // Performance: Sequential operations that could be parallel
    const user = await getUserById(userId);
    const inventory = await checkInventory(items);
    const pricing = await calculatePricing(items);

    // Missing error handling for async operations
    const order = {
        user: user,
        items: items,
        total: pricing.total
    };

    // Style: No input validation
    await saveOrder(order);

    // Performance: Not using Promise.all for parallel operations
    const notification = await sendNotification(user.email);
    const invoice = await generateInvoice(order);

    return res.json({
        success: true,
        orderId: order.id
    });
}

async function getUserById(id: string) {
    return await db.query('SELECT * FROM users WHERE id = ?', [id]);
}`,
  },
  {
    name: "Clean Python Code (Grade: A)",
    language: "python",
    context: "Well-structured user service with proper error handling",
    code: `from typing import Optional, List
import logging
from dataclasses import dataclass

@dataclass
class User:
    id: int
    username: str
    email: str

class UserService:
    """Service for managing user operations with proper error handling."""

    def __init__(self, db_connection):
        self.db = db_connection
        self.logger = logging.getLogger(__name__)

    def get_user_by_id(self, user_id: int) -> Optional[User]:
        """
        Retrieve user by ID with proper error handling.

        Args:
            user_id: The unique identifier for the user

        Returns:
            User object if found, None otherwise
        """
        try:
            # Using parameterized queries to prevent SQL injection
            query = "SELECT id, username, email FROM users WHERE id = ?"
            result = self.db.execute(query, (user_id,))

            if result:
                return User(**result.fetchone())
            return None

        except Exception as e:
            self.logger.error(f"Error fetching user {user_id}: {e}")
            return None

    def get_users_with_details(self, user_ids: List[int]) -> List[User]:
        """Efficiently fetch multiple users using batch query."""
        try:
            # Performance: Using IN clause instead of N+1 queries
            placeholders = ','.join('?' * len(user_ids))
            query = f"SELECT id, username, email FROM users WHERE id IN ({placeholders})"
            results = self.db.execute(query, user_ids)

            return [User(**row) for row in results.fetchall()]

        except Exception as e:
            self.logger.error(f"Error fetching users: {e}")
            return []`,
  },
];

export default function CodeInput({
  onReviewStart,
  onAgentUpdate,
  onReviewComplete,
  isReviewing,
  shouldLoadDemo,
  onDemoLoaded,
}: CodeInputProps) {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("python");
  const [context, setContext] = useState("");
  const [currentExampleIndex, setCurrentExampleIndex] = useState(0);
  const [manualLanguageChange, setManualLanguageChange] = useState(false);

  // Auto-load demo when requested
  useEffect(() => {
    if (shouldLoadDemo) {
      loadExample(0); // Load first example (vulnerable Python)
      onDemoLoaded?.();
    }
  }, [shouldLoadDemo]);

  // Auto-detect language from code (only if user hasn't manually changed it)
  useEffect(() => {
    if (code.trim() && !manualLanguageChange && !isReviewing) {
      const detection = detectLanguage(code);
      if (detection && detection.confidence >= 0.7) {
        setLanguage(detection.language);
      }
    }
  }, [code, manualLanguageChange, isReviewing]);

  const loadExample = (index: number) => {
    const example = CODE_EXAMPLES[index];
    setCode(example.code);
    setLanguage(example.language);
    setContext(example.context);
    setCurrentExampleIndex(index);
    setManualLanguageChange(false); // Reset since this is an example load
  };

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    setManualLanguageChange(true); // User manually changed language
  };

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    // Reset manual flag when code is cleared
    if (!newCode.trim()) {
      setManualLanguageChange(false);
    }
  };

  const shuffleExample = () => {
    const nextIndex = (currentExampleIndex + 1) % CODE_EXAMPLES.length;
    loadExample(nextIndex);
  };

  const handleSubmit = async () => {
    if (!code.trim()) {
      alert("Please enter some code to review");
      return;
    }

    onReviewStart();

    try {
      // Connect to WebSocket
      const ws = new WebSocket("ws://localhost:8000/ws/review");

      ws.onopen = () => {
        // Send review request
        ws.send(JSON.stringify({
          code,
          language,
          context: context || undefined,
        }));
      };

      ws.onmessage = (event) => {
        const message: WebSocketMessage = JSON.parse(event.data);

        if (message.type === "status" && message.agent && message.message) {
          onAgentUpdate(message.agent, message.message);
        } else if (message.type === "complete" && message.data) {
          onReviewComplete(message.data);
          ws.close();
        } else if (message.type === "error") {
          alert(`Error: ${message.message}`);
          ws.close();
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        alert("Failed to connect to review service. Make sure the backend is running.");
      };

      ws.onclose = () => {
        console.log("WebSocket connection closed");
      };
    } catch (error) {
      console.error("Error starting review:", error);
      alert("Failed to start review");
    }
  };

  return (
    <div className="glass-card rounded-2xl shadow-xl p-8">
      {/* Section Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
          <h2 className="text-xl font-bold text-white">Submit Code for Review</h2>
        </div>
        <p className="text-sm text-slate-400">Our AI agents will analyze your code for security, performance, and style issues</p>
      </div>

      <div className="space-y-6">
        {/* Language selector */}
        <div>
          <label className="block text-sm font-bold text-white mb-2">
            Programming Language
          </label>
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-800/80 text-white rounded-xl border border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all disabled:opacity-50"
            disabled={isReviewing}
          >
            <option value="python">Python</option>
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="java">Java</option>
            <option value="go">Go</option>
            <option value="rust">Rust</option>
          </select>
        </div>

        {/* Code input */}
        <div>
          <label className="block text-sm font-bold text-white mb-2">
            Your Code
          </label>
          <textarea
            value={code}
            onChange={(e) => handleCodeChange(e.target.value)}
            placeholder="Paste your code here..."
            className="w-full h-64 px-4 py-3 bg-slate-900/80 text-white rounded-xl border border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-mono text-sm transition-all disabled:opacity-50 resize-none"
            disabled={isReviewing}
          />
        </div>

        {/* Context input with tooltip */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <label className="block text-sm font-bold text-white">
              Context
            </label>
            <span className="text-slate-500 text-xs">(optional)</span>
            <div className="group relative">
              <svg className="w-4 h-4 text-slate-500 cursor-help" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-3 bg-slate-800 border border-slate-600 rounded-lg shadow-xl z-10">
                <p className="text-xs text-slate-300">
                  Provide additional context about what your code does. This helps our AI agents give more relevant feedback.
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Example: "This function handles user login and session creation"
                </p>
              </div>
            </div>
          </div>
          <input
            type="text"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="e.g., This function handles user authentication"
            className="w-full px-4 py-2.5 bg-slate-800/80 text-white rounded-xl border border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all disabled:opacity-50"
            disabled={isReviewing}
          />
        </div>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-700"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-3 bg-slate-900 text-slate-500 font-medium">OR TRY AN EXAMPLE</span>
          </div>
        </div>

        {/* Example selector - moved below code input */}
        <div>
          <label className="block text-sm font-bold text-white mb-3">
            Quick Start Examples
          </label>
          <div className="flex gap-2 flex-wrap mb-3">
            {CODE_EXAMPLES.map((example, index) => (
              <button
                key={index}
                onClick={() => loadExample(index)}
                disabled={isReviewing}
                className={`px-3 py-2 text-xs font-medium rounded-lg transition-all duration-200 ${
                  currentExampleIndex === index && code
                    ? "bg-blue-600 text-white shadow-lg"
                    : "bg-slate-700/40 text-slate-300 hover:bg-slate-600/60 border border-slate-600/50"
                } disabled:opacity-50`}
              >
                {example.name}
              </button>
            ))}
          </div>
          <button
            onClick={shuffleExample}
            disabled={isReviewing}
            className="w-full px-4 py-2.5 bg-slate-700/40 hover:bg-slate-600/60 disabled:bg-slate-800 text-slate-300 text-sm font-medium rounded-lg transition-all duration-200 border border-slate-600/50 flex items-center justify-center gap-2"
            title="Load next example"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8 5a1 1 0 100 2h5.586l-1.293 1.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L13.586 5H8zM12 15a1 1 0 100-2H6.414l1.293-1.293a1 1 0 10-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L6.414 15H12z" />
            </svg>
            <span>Shuffle Random Example</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 space-y-3">
          {/* Primary Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={isReviewing || !code.trim()}
            className="w-full px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-slate-700 disabled:to-slate-700 text-white text-lg font-bold rounded-xl transition-all duration-300 shadow-xl hover:shadow-2xl disabled:shadow-none transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed"
          >
            {isReviewing ? (
              <span className="flex items-center justify-center gap-3">
                <svg className="w-5 h-5 animate-spin" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
                <span>Analyzing Your Code...</span>
              </span>
            ) : (
              <span className="flex items-center justify-center gap-3">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
                <span>Start AI Code Review</span>
              </span>
            )}
          </button>

          {/* GitHub Sign In Button */}
          <button
            onClick={() => {
              // Placeholder for GitHub OAuth
              alert("GitHub sign-in coming soon! This will enable saved reviews and history.");
            }}
            disabled={isReviewing}
            className="w-full px-6 py-3 bg-slate-800/80 hover:bg-slate-700/80 disabled:bg-slate-800/50 text-white font-semibold rounded-xl transition-all duration-200 border border-slate-600/50 hover:border-slate-500 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            <span>Sign in with GitHub</span>
            <span className="px-2 py-0.5 bg-blue-500/20 border border-blue-500/50 rounded text-xs text-blue-300">Soon</span>
          </button>

          {!code.trim() && !isReviewing && (
            <p className="text-xs text-slate-500 text-center mt-2">
              Enter code or select an example to get started
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
