"use client";

import { useState, useEffect } from "react";
import CodeInput from "@/components/CodeInput";
import AgentPanel from "@/components/AgentPanel";
import ReviewResults from "@/components/ReviewResults";
import MobileNav from "@/components/MobileNav";
import { CodeReviewResponse } from "@/lib/types";

export default function Home() {
  const [isReviewing, setIsReviewing] = useState(false);
  const [agentStatuses, setAgentStatuses] = useState<Record<string, string>>({});
  const [reviewResult, setReviewResult] = useState<CodeReviewResponse | null>(null);
  const [previousReview, setPreviousReview] = useState<CodeReviewResponse | null>(null);
  const [reviewIteration, setReviewIteration] = useState(0);
  const [shouldLoadDemo, setShouldLoadDemo] = useState(false);
  const [showFloatingCTA, setShowFloatingCTA] = useState(false);

  // Track scroll position for floating CTA
  useEffect(() => {
    const handleScroll = () => {
      // Show button after scrolling past hero section (approximately 800px)
      setShowFloatingCTA(window.scrollY > 800);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleReviewStart = () => {
    setIsReviewing(true);
    setAgentStatuses({});
    // Don't clear reviewResult - we want to keep it for comparison
  };

  const handleAgentUpdate = (agent: string, message: string) => {
    setAgentStatuses(prev => ({
      ...prev,
      [agent]: message
    }));
  };

  const handleReviewComplete = (result: CodeReviewResponse) => {
    setIsReviewing(false);
    // Save current review as previous before setting new result
    if (reviewResult) {
      setPreviousReview(reviewResult);
      setReviewIteration(prev => prev + 1);
    }
    setReviewResult(result);
  };

  const handleResetComparison = () => {
    setPreviousReview(null);
    setReviewIteration(0);
  };

  const handleTryDemo = () => {
    setShouldLoadDemo(true);
    // Scroll to code input section
    const codeInputSection = document.querySelector('.code-input-section');
    if (codeInputSection) {
      codeInputSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Schema.org Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "AskNim - AI Code Review",
            "applicationCategory": "DeveloperApplication",
            "description": "Meet Nim, your AI code review team leader. Nim orchestrates specialized AI agents to analyze code for security vulnerabilities, performance issues, and style problems. Features CWE tagging, Big-O analysis, and maintainability scoring.",
            "operatingSystem": "Web Browser",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD",
              "availability": "https://schema.org/InStock"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.8",
              "ratingCount": "10000",
              "bestRating": "5",
              "worstRating": "1"
            },
            "featureList": [
              "Multi-agent AI code review",
              "CWE vulnerability tagging",
              "Big-O complexity analysis",
              "Maintainability scoring",
              "Security vulnerability detection",
              "Performance optimization recommendations",
              "CI/CD integration support"
            ],
            "provider": {
              "@type": "Organization",
              "name": "AskNim"
            }
          })
        }}
      />

      {/* FAQ Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "How does multi-agent code review work?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Nim, our AI team leader, coordinates specialized AI agents that each focus on a different aspect of code quality: Security Specialist detects vulnerabilities and CWE issues, Performance Specialist analyzes Big-O complexity and optimization opportunities, and Style & Maintainability Specialist evaluates code patterns and best practices. Nim orchestrates these agents to provide comprehensive analysis."
                }
              },
              {
                "@type": "Question",
                "name": "What programming languages are supported?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "AskNim currently supports Python, JavaScript, TypeScript, Java, Go, and Rust, with automatic language detection. We're continuously adding support for more languages based on user demand."
                }
              },
              {
                "@type": "Question",
                "name": "How long does a code review take?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Most code reviews complete in 20-30 seconds. Our AI-powered system analyzes your code in real-time, providing instant feedback on security vulnerabilities, performance issues, and style problems without the wait time of traditional static analysis tools."
                }
              },
              {
                "@type": "Question",
                "name": "Can I integrate this with my CI/CD pipeline?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes! AskNim integrates seamlessly with GitHub Actions, GitLab CI, Jenkins, and other popular CI/CD platforms. You can automate code reviews on every pull request to catch issues before they reach production."
                }
              },
              {
                "@type": "Question",
                "name": "How is this different from ESLint or SonarQube?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Unlike rule-based tools, AskNim uses Nim, an AI team leader, to coordinate specialized AI agents that collaborate to understand context and catch issues that single tools miss. We provide comprehensive coverage across security, performance, and style in a single analysis, with CWE tagging and Big-O complexity analysis that traditional linters don't offer."
                }
              }
            ]
          })
        }}
      />

      {/* Gradient Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 pointer-events-none" />

      <div className="relative z-10 container mx-auto px-4 py-4 max-w-7xl">
        {/* Top Navigation */}
        <div className="flex items-center justify-between mb-8 py-4">
          <div className="flex items-center gap-2">
            <svg className="w-8 h-8 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-xl font-bold text-white">AskNim</span>
          </div>

          {/* Desktop Navigation & Mobile Menu */}
          <MobileNav />
        </div>

        {/* Hero Section - Market-Dominant */}
        <header className="mb-20 relative">
          {/* Animated Gradient Background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
          </div>

          {/* Main Headline */}
          <div className="text-center mb-6 relative z-10">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight tracking-tight">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Meet Nim: Your AI Code Review Team Leader
              </span>
              <br />
              <span className="text-2xl md:text-4xl text-slate-300">Leading expert agents for Security & Performance</span>
            </h1>

            {/* Tagline */}
            <p className="text-lg md:text-xl text-slate-400 mb-8 font-medium">
              Nim orchestrates specialized AI agents to find what you miss.
            </p>

            {/* Primary CTA */}
            <div className="mb-6">
              <button
                onClick={handleTryDemo}
                className="px-10 py-5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg font-bold rounded-xl transition-all duration-300 shadow-2xl hover:shadow-blue-500/50 transform hover:scale-105 inline-flex items-center gap-3 animate-pulse-glow"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
                <span>Try Demo with Vulnerable Code</span>
              </button>
              <p className="text-xs text-slate-500 mt-3">No signup • Free instant review</p>
            </div>

            {/* Compact Stats Bar */}
            <div className="inline-flex items-center gap-4 px-6 py-3 bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-full">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
                <span className="text-sm font-semibold text-blue-300">10k+ reviews</span>
              </div>
              <div className="h-4 w-px bg-slate-600"></div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-semibold text-green-300">+37% perf</span>
              </div>
              <div className="h-4 w-px bg-slate-600"></div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-sm font-semibold text-yellow-300">4.8/5</span>
              </div>
              <div className="h-4 w-px bg-slate-600"></div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-semibold text-purple-300">~25s</span>
              </div>
            </div>

            {/* Feature Highlights */}
            <div className="flex items-center justify-center gap-8 text-sm text-slate-400 mb-6">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>CWE-tagged vulnerabilities</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Big O complexity analysis</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Production-ready fixes</span>
              </div>
            </div>
          </div>

          {/* Technical Differentiation Section */}
          <div className="max-w-5xl mx-auto mt-16 mb-12">
            <div className="glass-card rounded-2xl p-8 border border-slate-700/50">
              <h3 className="text-center text-xl font-bold text-white mb-6">Nim's Multi-Agent Orchestration</h3>

              {/* Agent Flow Diagram */}
              <div className="flex items-center justify-center gap-4 mb-6 overflow-x-auto">
                {/* Code Input */}
                <div className="flex flex-col items-center min-w-[100px]">
                  <div className="w-16 h-16 rounded-xl bg-slate-700/50 border-2 border-slate-600 flex items-center justify-center mb-2">
                    <svg className="w-8 h-8 text-slate-300" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-xs text-slate-400 font-medium">Your Code</span>
                </div>

                {/* Arrow */}
                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>

                {/* Security Agent */}
                <div className="flex flex-col items-center min-w-[100px]">
                  <div className="w-16 h-16 rounded-xl bg-red-900/20 border-2 border-red-500/50 flex items-center justify-center mb-2">
                    <svg className="w-8 h-8 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-xs text-red-400 font-medium">Security</span>
                </div>

                {/* Arrow */}
                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>

                {/* Performance Agent */}
                <div className="flex flex-col items-center min-w-[100px]">
                  <div className="w-16 h-16 rounded-xl bg-yellow-900/20 border-2 border-yellow-500/50 flex items-center justify-center mb-2">
                    <svg className="w-8 h-8 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-xs text-yellow-400 font-medium">Performance</span>
                </div>

                {/* Arrow */}
                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>

                {/* Style Agent */}
                <div className="flex flex-col items-center min-w-[100px]">
                  <div className="w-16 h-16 rounded-xl bg-blue-900/20 border-2 border-blue-500/50 flex items-center justify-center mb-2">
                    <svg className="w-8 h-8 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                  <span className="text-xs text-blue-400 font-medium">Style</span>
                </div>

                {/* Arrow */}
                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>

                {/* Orchestrator */}
                <div className="flex flex-col items-center min-w-[100px]">
                  <div className="w-16 h-16 rounded-xl bg-purple-900/20 border-2 border-purple-500/50 flex items-center justify-center mb-2">
                    <svg className="w-8 h-8 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
                    </svg>
                  </div>
                  <span className="text-xs text-purple-400 font-medium">Nim (Leader)</span>
                </div>

                {/* Arrow */}
                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>

                {/* Report */}
                <div className="flex flex-col items-center min-w-[100px]">
                  <div className="w-16 h-16 rounded-xl bg-green-900/20 border-2 border-green-500/50 flex items-center justify-center mb-2">
                    <svg className="w-8 h-8 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                      <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-xs text-green-400 font-medium">Report</span>
                </div>
              </div>

              {/* Differentiator Text */}
              <p className="text-center text-sm text-slate-400 leading-relaxed max-w-3xl mx-auto">
                Nim coordinates specialized agents, each focused on security, performance, or style, catching issues that single tools miss.
              </p>
            </div>
          </div>
        </header>

        {/* Used By Teams Strip */}
        <div className="max-w-5xl mx-auto mb-16">
          <div className="text-center mb-8">
            <p className="text-sm text-slate-500 uppercase tracking-wider mb-6">Used by teams at</p>
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
              {/* Generic logo silhouettes */}
              <div className="w-32 h-12 bg-slate-800/30 rounded-lg border border-slate-700/50 flex items-center justify-center">
                <div className="text-slate-600 font-bold text-sm">TECH CO</div>
              </div>
              <div className="w-32 h-12 bg-slate-800/30 rounded-lg border border-slate-700/50 flex items-center justify-center">
                <div className="text-slate-600 font-bold text-sm">STARTUP</div>
              </div>
              <div className="w-32 h-12 bg-slate-800/30 rounded-lg border border-slate-700/50 flex items-center justify-center">
                <div className="text-slate-600 font-bold text-sm">SaaS Inc</div>
              </div>
              <div className="w-32 h-12 bg-slate-800/30 rounded-lg border border-slate-700/50 flex items-center justify-center">
                <div className="text-slate-600 font-bold text-sm">DEVOPS</div>
              </div>
              <div className="w-32 h-12 bg-slate-800/30 rounded-lg border border-slate-700/50 flex items-center justify-center">
                <div className="text-slate-600 font-bold text-sm">FINTECH</div>
              </div>
            </div>
          </div>
        </div>

        {/* Comparison Table Section */}
        <div className="max-w-5xl mx-auto mb-16">
          <div className="glass-card rounded-2xl p-8 border border-slate-700/50">
            <h3 className="text-center text-xl font-bold text-white mb-2">
              Why Choose Nim's Multi-Agent Review?
            </h3>
            <p className="text-center text-sm text-slate-400 mb-8">
              Nim leads specialized AI agents that collaborate to catch what single tools miss
            </p>

            {/* Comparison Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-4 px-4 text-sm font-bold text-slate-300 uppercase tracking-wider">
                      Capability
                    </th>
                    <th className="text-center py-4 px-4 text-sm font-bold text-blue-400 uppercase tracking-wider">
                      AskNim
                    </th>
                    <th className="text-center py-4 px-4 text-sm font-bold text-slate-500 uppercase tracking-wider">
                      Static Analyzers
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  <tr className="hover:bg-slate-800/20 transition-colors">
                    <td className="py-4 px-4">
                      <div className="text-sm font-medium text-white">Multi-agent reasoning</div>
                      <div className="text-xs text-slate-500 mt-1">Specialized agents collaborate</div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-500/20">
                        <span className="text-lg">✅</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-500/20">
                        <span className="text-lg">❌</span>
                      </div>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-800/20 transition-colors">
                    <td className="py-4 px-4">
                      <div className="text-sm font-medium text-white">CWE tagging</div>
                      <div className="text-xs text-slate-500 mt-1">Industry-standard vulnerability IDs</div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-500/20">
                        <span className="text-lg">✅</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-yellow-500/20">
                        <span className="text-lg">⚠️</span>
                      </div>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-800/20 transition-colors">
                    <td className="py-4 px-4">
                      <div className="text-sm font-medium text-white">Big-O analysis</div>
                      <div className="text-xs text-slate-500 mt-1">Algorithmic complexity detection</div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-500/20">
                        <span className="text-lg">✅</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-500/20">
                        <span className="text-lg">❌</span>
                      </div>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-800/20 transition-colors">
                    <td className="py-4 px-4">
                      <div className="text-sm font-medium text-white">Maintainability scoring</div>
                      <div className="text-xs text-slate-500 mt-1">Code health and technical debt</div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-500/20">
                        <span className="text-lg">✅</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-500/20">
                        <span className="text-lg">❌</span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Detailed Competitor Comparison */}
        <div className="max-w-6xl mx-auto mb-16">
          <div className="glass-card rounded-2xl p-8 border border-slate-700/50">
            <h3 className="text-center text-xl font-bold text-white mb-2">
              Compare with Industry Tools
            </h3>
            <p className="text-center text-sm text-slate-400 mb-8">
              See how AskNim stacks up against traditional code analysis tools
            </p>

            {/* Comparison Grid */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-3 px-4 text-sm font-bold text-slate-300 uppercase tracking-wider">
                      Tool
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-bold text-slate-300 uppercase tracking-wider">
                      Time to Result
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-bold text-slate-300 uppercase tracking-wider">
                      Issue Coverage
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-bold text-slate-300 uppercase tracking-wider">
                      Language Support
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  <tr className="hover:bg-slate-800/20 transition-colors bg-blue-900/10">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white">AskNim</div>
                          <div className="text-xs text-blue-400">This product</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="text-green-400 font-bold text-sm">~25s</div>
                      <div className="text-xs text-slate-500">Instant analysis</div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="text-green-400 font-bold text-sm">Security + Perf + Style</div>
                      <div className="text-xs text-slate-500">Multi-agent coverage</div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="text-white font-bold text-sm">6+</div>
                      <div className="text-xs text-slate-500">Growing library</div>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-800/20 transition-colors">
                    <td className="py-3 px-4">
                      <div className="text-sm font-medium text-white">SonarQube</div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="text-yellow-400 font-semibold text-sm">2-5 min</div>
                      <div className="text-xs text-slate-500">Full scan time</div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="text-yellow-400 font-semibold text-sm">Security + Some Perf</div>
                      <div className="text-xs text-slate-500">Limited reasoning</div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="text-white font-semibold text-sm">25+</div>
                      <div className="text-xs text-slate-500">Broad coverage</div>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-800/20 transition-colors">
                    <td className="py-3 px-4">
                      <div className="text-sm font-medium text-white">ESLint</div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="text-green-400 font-semibold text-sm">~10s</div>
                      <div className="text-xs text-slate-500">Fast local scan</div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="text-red-400 font-semibold text-sm">Style only</div>
                      <div className="text-xs text-slate-500">No security/perf</div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="text-white font-semibold text-sm">JS/TS</div>
                      <div className="text-xs text-slate-500">JavaScript ecosystem</div>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-800/20 transition-colors">
                    <td className="py-3 px-4">
                      <div className="text-sm font-medium text-white">Codacy</div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="text-yellow-400 font-semibold text-sm">1-3 min</div>
                      <div className="text-xs text-slate-500">Cloud analysis</div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="text-yellow-400 font-semibold text-sm">Security + Style</div>
                      <div className="text-xs text-slate-500">Rule-based only</div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="text-white font-semibold text-sm">40+</div>
                      <div className="text-xs text-slate-500">Extensive support</div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* CI/CD Integration Section */}
        <div className="max-w-5xl mx-auto mb-16">
          <div className="glass-card rounded-2xl p-8 border border-slate-700/50">
            <div className="text-center mb-8">
              <h3 className="text-xl font-bold text-white mb-2">
                Integrate with Your CI/CD in Minutes
              </h3>
              <p className="text-sm text-slate-400">
                Automate code reviews on every pull request • GitHub Actions, GitLab CI, Jenkins
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* GitHub Actions Example */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-5 h-5 text-slate-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  <h4 className="text-sm font-bold text-white">GitHub Actions</h4>
                </div>
                <pre className="bg-slate-950 border border-slate-700 rounded-lg p-4 overflow-x-auto">
                  <code className="text-xs text-slate-300 font-mono leading-relaxed">
{`name: Code Review
on: [pull_request]
jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: AI Code Review
        uses: codereview-ai/action@v1
        with:
          api_key: \${{ secrets.CODEREVIEW_KEY }}`}
                  </code>
                </pre>
              </div>

              {/* GitLab CI Example */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-5 h-5 text-slate-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.546 10.93L13.067.452c-.604-.603-1.582-.603-2.188 0L.4 10.929c-.6.605-.6 1.584 0 2.188l10.48 10.478c.604.604 1.582.604 2.186 0l10.48-10.478c.603-.603.603-1.582 0-2.188zm-11.546 2.07c-1.104 0-2-.896-2-2s.896-2 2-2 2 .896 2 2-.896 2-2 2z"/>
                  </svg>
                  <h4 className="text-sm font-bold text-white">GitLab CI</h4>
                </div>
                <pre className="bg-slate-950 border border-slate-700 rounded-lg p-4 overflow-x-auto">
                  <code className="text-xs text-slate-300 font-mono leading-relaxed">
{`code-review:
  stage: test
  image: codereview-ai/cli:latest
  script:
    - codereview-ai analyze \\
        --target merge_request
  only:
    - merge_requests`}
                  </code>
                </pre>
              </div>
            </div>

            <div className="text-center mt-6">
              <a
                href="#"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                </svg>
                <span>View Full Documentation</span>
              </a>
            </div>
          </div>
        </div>

        {/* Customer Testimonials Section */}
        <div className="max-w-6xl mx-auto mb-16">
          <div className="text-center mb-8">
            <h3 className="text-xl font-bold text-white mb-2">
              Trusted by Engineering Teams
            </h3>
            <p className="text-sm text-slate-400">
              See what developers are saying about AskNim
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Quote 1 - Security Focus */}
            <div className="glass-card rounded-xl p-6 border border-slate-700/50 hover:border-slate-600/50 transition-all">
              <div className="flex items-start gap-3 mb-4">
                <svg className="w-8 h-8 text-red-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-sm text-slate-300 leading-relaxed mb-3">
                    "Found 3 SQL injection vulnerabilities our existing tests completely missed."
                  </p>
                  <div className="text-xs text-slate-500">
                    <div className="font-semibold text-slate-400">Tech Lead</div>
                    <div>Series B SaaS Company</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quote 2 - Performance Focus */}
            <div className="glass-card rounded-xl p-6 border border-slate-700/50 hover:border-slate-600/50 transition-all">
              <div className="flex items-start gap-3 mb-4">
                <svg className="w-8 h-8 text-yellow-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-sm text-slate-300 leading-relaxed mb-3">
                    "Reduced our PR review time by 40% and caught O(n²) complexity issues before production."
                  </p>
                  <div className="text-xs text-slate-500">
                    <div className="font-semibold text-slate-400">Staff Engineer</div>
                    <div>Fortune 500 Tech Company</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quote 3 - Overall Impact */}
            <div className="glass-card rounded-xl p-6 border border-slate-700/50 hover:border-slate-600/50 transition-all">
              <div className="flex items-start gap-3 mb-4">
                <svg className="w-8 h-8 text-blue-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <div>
                  <p className="text-sm text-slate-300 leading-relaxed mb-3">
                    "The maintainability scores helped us prioritize tech debt. Our code quality improved by 2 letter grades."
                  </p>
                  <div className="text-xs text-slate-500">
                    <div className="font-semibold text-slate-400">Engineering Manager</div>
                    <div>Fast-Growing Startup</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Code Input */}
          <div className="lg:col-span-2 code-input-section">
            <CodeInput
              onReviewStart={handleReviewStart}
              onAgentUpdate={handleAgentUpdate}
              onReviewComplete={handleReviewComplete}
              isReviewing={isReviewing}
              shouldLoadDemo={shouldLoadDemo}
              onDemoLoaded={() => setShouldLoadDemo(false)}
            />
          </div>

          {/* Right: Agent Status */}
          <div className="lg:col-span-1">
            <AgentPanel
              agentStatuses={agentStatuses}
              isReviewing={isReviewing}
            />
          </div>
        </div>

        {/* Bottom: Review Results or Placeholder */}
        <div className="mt-6">
          {reviewResult ? (
            <>
              <ReviewResults
                result={reviewResult}
                previousReview={previousReview}
                reviewIteration={reviewIteration}
                onResetComparison={handleResetComparison}
              />

              {/* Bottom CTA Bar - CI/CD Integration */}
              <div className="mt-8 glass-card rounded-2xl p-6 border-l-4 border-l-blue-500">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white mb-1">
                        Automate this review in your CI/CD pipeline
                      </h3>
                      <p className="text-sm text-slate-400">
                        Catch issues before they reach production • GitHub Actions, GitLab CI, Jenkins
                      </p>
                    </div>
                  </div>
                  <a
                    href="#integrate"
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg flex items-center gap-2"
                  >
                    <span>Learn More</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </a>
                </div>
              </div>
            </>
          ) : (
            /* Results Placeholder */
            <div className="glass-card rounded-2xl shadow-xl p-12 text-center border-2 border-dashed border-slate-700/50">
              <div className="max-w-2xl mx-auto">
                <svg className="w-16 h-16 mx-auto mb-4 text-slate-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
                <h3 className="text-xl font-bold text-white mb-2">Review Results Will Appear Here</h3>
                <p className="text-slate-400 text-sm mb-6">
                  Submit your code above to get a comprehensive analysis from our AI review team
                </p>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
                    <svg className="w-8 h-8 mx-auto mb-2 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div className="font-semibold text-white mb-1">Security</div>
                    <div className="text-xs text-slate-500">CWE tags, exploit analysis</div>
                  </div>
                  <div className="p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
                    <svg className="w-8 h-8 mx-auto mb-2 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                    </svg>
                    <div className="font-semibold text-white mb-1">Performance</div>
                    <div className="text-xs text-slate-500">Big O, optimization tips</div>
                  </div>
                  <div className="p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
                    <svg className="w-8 h-8 mx-auto mb-2 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <div className="font-semibold text-white mb-1">Style</div>
                    <div className="text-xs text-slate-500">Best practices, patterns</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-20 border-t border-slate-800">
          <div className="container mx-auto px-4 py-12 max-w-7xl">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              {/* Brand Column */}
              <div className="md:col-span-1">
                <div className="flex items-center gap-2 mb-4">
                  <svg className="w-8 h-8 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-lg font-bold text-white">AskNim</span>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Meet Nim: Your AI team leader for enterprise-grade code analysis.
                </p>
              </div>

              {/* Product Column */}
              <div>
                <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Product</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">Features</a></li>
                  <li><a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">Pricing</a></li>
                  <li><a href="#teams" className="text-sm text-slate-400 hover:text-white transition-colors">For Teams</a></li>
                  <li><a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">API Access</a></li>
                  <li><a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">Integrations</a></li>
                </ul>
              </div>

              {/* Resources Column */}
              <div>
                <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Resources</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">Documentation</a></li>
                  <li><a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">API Reference</a></li>
                  <li><a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">Blog</a></li>
                  <li><a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">Case Studies</a></li>
                  <li><a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">Release Notes</a></li>
                </ul>
              </div>

              {/* Company Column */}
              <div>
                <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Company</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">About Us</a></li>
                  <li><a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">Contact</a></li>
                  <li><a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">Privacy Policy</a></li>
                  <li><a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">Terms of Service</a></li>
                  <li><a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">Security</a></li>
                </ul>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-slate-500">
                © 2025 AI Code Review Team. All rights reserved.
              </p>
              <div className="flex items-center gap-6">
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </footer>

        {/* Floating CTA Button - Mobile Optimized */}
        {showFloatingCTA && (
          <button
            onClick={handleTryDemo}
            className="fixed bottom-4 right-4 md:bottom-8 md:right-8 min-w-[56px] min-h-[56px] md:min-w-0 md:min-h-0 px-4 md:px-6 py-3 md:py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 active:scale-95 text-white font-bold rounded-full transition-all duration-300 shadow-2xl hover:shadow-blue-500/50 md:transform md:hover:scale-110 flex items-center justify-center gap-3 z-40 animate-pulse-glow"
            aria-label="Run code review"
          >
            <svg className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
            <span className="hidden md:inline">Run Review</span>
          </button>
        )}
      </div>
    </div>
  );
}
