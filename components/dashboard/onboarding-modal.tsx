'use client';

import { useState, useEffect } from 'react';
import { X, Rss, FileText, Share2, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';

const ONBOARDING_KEY = 'ath_onboarded';

interface OnboardingStep {
  icon: React.ReactNode;
  title: string;
  description: string;
  highlight: string;
}

const STEPS: OnboardingStep[] = [
  {
    icon: <Rss className="w-10 h-10 text-blue-400" />,
    title: 'Your trend feed is live',
    description:
      'AI Trend Hub automatically pulls the latest AI news from RSS feeds and Reddit communities every 30 minutes. Your dashboard is always up to date — no manual refreshing needed.',
    highlight: 'Trends are scored 1–100 based on recency, engagement, and source authority.',
  },
  {
    icon: <FileText className="w-10 h-10 text-purple-400" />,
    title: 'Click any trend to generate an article',
    description:
      "Select a trend card, choose your angle, and the AI writes a full article in Jack's voice using your IP frameworks. Toggle the AIDA framework for engagement-optimized content.",
    highlight: 'Articles include your CTAs, cross-industry examples, and Hybrid AI messaging.',
  },
  {
    icon: <Share2 className="w-10 h-10 text-green-400" />,
    title: 'Publish to WordPress or share on social',
    description:
      'Generate platform-specific social media posts (Twitter, LinkedIn, Facebook) with smart character limits, suggested hashtags, and in-place editing. Copy & paste to publish anywhere.',
    highlight: 'Each post is tailored to the platform\'s style and audience expectations.',
  },
];

export function OnboardingModal() {
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    // Only show if flag is not set
    if (typeof window !== 'undefined') {
      const done = localStorage.getItem(ONBOARDING_KEY);
      if (!done) {
        setShow(true);
      }
    }
  }, []);

  const dismiss = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(ONBOARDING_KEY, 'true');
    }
    setShow(false);
  };

  const next = () => {
    if (step < STEPS.length - 1) setStep(step + 1);
    else dismiss();
  };

  const prev = () => {
    if (step > 0) setStep(step - 1);
  };

  if (!show) return null;

  const current = STEPS[step];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={dismiss}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg mx-4 bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Close */}
        <button
          onClick={dismiss}
          className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors z-10"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Progress bar */}
        <div className="flex gap-1.5 px-8 pt-6">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors ${
                i <= step ? 'bg-blue-500' : 'bg-zinc-700'
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="px-8 pt-8 pb-4 text-center">
          <div className="inline-flex items-center justify-center p-4 bg-zinc-800/60 rounded-2xl mb-6">
            {current.icon}
          </div>

          <h2 className="text-2xl font-bold text-white mb-3">
            {current.title}
          </h2>

          <p className="text-zinc-400 leading-relaxed mb-4">
            {current.description}
          </p>

          <div className="inline-block bg-blue-500/10 border border-blue-500/30 rounded-lg px-4 py-2">
            <p className="text-sm text-blue-400">
              <Sparkles className="inline w-4 h-4 mr-1 -mt-0.5" />
              {current.highlight}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-8 py-6">
          <button
            onClick={prev}
            disabled={step === 0}
            className="flex items-center gap-1 text-sm text-zinc-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>

          <span className="text-xs text-zinc-600">
            {step + 1} of {STEPS.length}
          </span>

          <button
            onClick={next}
            className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors"
          >
            {step < STEPS.length - 1 ? (
              <>
                Next
                <ChevronRight className="w-4 h-4" />
              </>
            ) : (
              'Get Started'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
