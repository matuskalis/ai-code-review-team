"use client";

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Close menu on route change or escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  return (
    <>
      {/* Hamburger Button - Mobile Only */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 right-4 z-50 p-3 bg-slate-800/90 backdrop-blur-sm border border-slate-700 rounded-lg hover:bg-slate-700 transition-colors active:scale-95"
        aria-label={isOpen ? "Close menu" : "Open menu"}
        aria-expanded={isOpen}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <Menu className="w-6 h-6 text-white" />
        )}
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Menu Drawer */}
      <nav
        className={`md:hidden fixed top-0 right-0 h-full w-64 bg-slate-900/95 backdrop-blur-md border-l border-slate-700 z-40 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-label="Mobile navigation"
      >
        <div className="flex flex-col h-full pt-20 px-6 pb-6">
          {/* Navigation Links */}
          <div className="flex flex-col gap-4">
            <a
              href="#features"
              onClick={() => setIsOpen(false)}
              className="text-lg text-slate-300 hover:text-white transition-colors py-3 px-4 rounded-lg hover:bg-slate-800/50 active:scale-95 min-h-[44px] flex items-center"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              onClick={() => setIsOpen(false)}
              className="text-lg text-slate-300 hover:text-white transition-colors py-3 px-4 rounded-lg hover:bg-slate-800/50 active:scale-95 min-h-[44px] flex items-center"
            >
              How It Works
            </a>
            <a
              href="#pricing"
              onClick={() => setIsOpen(false)}
              className="text-lg text-slate-300 hover:text-white transition-colors py-3 px-4 rounded-lg hover:bg-slate-800/50 active:scale-95 min-h-[44px] flex items-center"
            >
              Pricing
            </a>
            <a
              href="#docs"
              onClick={() => setIsOpen(false)}
              className="text-lg text-slate-300 hover:text-white transition-colors py-3 px-4 rounded-lg hover:bg-slate-800/50 active:scale-95 min-h-[44px] flex items-center"
            >
              Docs
            </a>
            <a
              href="#api"
              onClick={() => setIsOpen(false)}
              className="text-lg text-slate-300 hover:text-white transition-colors py-3 px-4 rounded-lg hover:bg-slate-800/50 active:scale-95 min-h-[44px] flex items-center"
            >
              API
            </a>
          </div>

          {/* CTA Button */}
          <div className="mt-auto">
            <a
              href="#try-now"
              onClick={() => setIsOpen(false)}
              className="block w-full py-3 px-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg font-semibold text-white hover:shadow-lg hover:shadow-purple-500/25 transition-all text-center active:scale-95 min-h-[44px] flex items-center justify-center"
            >
              Try Free Demo
            </a>
          </div>
        </div>
      </nav>

      {/* Desktop Navigation - Hidden on Mobile */}
      <nav className="hidden md:flex items-center justify-between mb-8 py-4">
        <div className="flex items-center gap-6">
          <a href="#features" className="text-sm text-slate-400 hover:text-white transition-colors">
            Features
          </a>
          <a href="#how-it-works" className="text-sm text-slate-400 hover:text-white transition-colors">
            How It Works
          </a>
          <a href="#pricing" className="text-sm text-slate-400 hover:text-white transition-colors">
            Pricing
          </a>
          <a href="#docs" className="text-sm text-slate-400 hover:text-white transition-colors">
            Docs
          </a>
          <a href="#api" className="text-sm text-slate-400 hover:text-white transition-colors">
            API
          </a>
        </div>
      </nav>
    </>
  );
}
