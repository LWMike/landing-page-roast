'use client';

import { useState } from 'react';

interface RoastResult {
  score: number;
  headline: {
    rating: 'good' | 'needs-work' | 'bad';
    feedback: string;
    suggestion?: string;
  };
  cta: {
    rating: 'good' | 'needs-work' | 'bad';
    feedback: string;
    suggestion?: string;
  };
  trustSignals: {
    rating: 'good' | 'needs-work' | 'bad';
    feedback: string;
    suggestion?: string;
  };
  clarity: {
    rating: 'good' | 'needs-work' | 'bad';
    feedback: string;
    suggestion?: string;
  };
  overall: string;
  quickWins: string[];
}

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RoastResult | null>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch('/api/roast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      if (!res.ok) {
        throw new Error('Failed to analyze page');
      }

      const data = await res.json();
      setResult(data);
    } catch {
      setError('Failed to analyze the page. Please check the URL and try again.');
    } finally {
      setLoading(false);
    }
  };

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'good': return 'text-green-400 bg-green-400/10 border-green-400/30';
      case 'needs-work': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
      case 'bad': return 'text-red-400 bg-red-400/10 border-red-400/30';
      default: return 'text-zinc-400 bg-zinc-400/10 border-zinc-400/30';
    }
  };

  const getRatingEmoji = (rating: string) => {
    switch (rating) {
      case 'good': return '✅';
      case 'needs-work': return '⚠️';
      case 'bad': return '❌';
      default: return '❓';
    }
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      {/* Hero */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 leading-tight bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
            🔥 Landing Page Roast
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
            Get instant, brutally honest feedback on your landing page. 
            AI-powered conversion analysis in seconds.
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="mb-12">
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://your-landing-page.com"
              required
              className="flex-1 px-6 py-4 bg-zinc-900 border border-zinc-800 rounded-xl text-lg focus:outline-none focus:border-orange-500 transition-colors"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Roasting...
                </span>
              ) : (
                '🔥 Roast My Page'
              )}
            </button>
          </div>
        </form>

        {/* Error */}
        {error && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-center">
            {error}
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-8 animate-in fade-in duration-500">
            {/* Score */}
            <div className="text-center p-8 bg-zinc-900 rounded-2xl border border-zinc-800">
              <div className="text-6xl font-bold mb-2">
                <span className={result.score >= 70 ? 'text-green-400' : result.score >= 40 ? 'text-yellow-400' : 'text-red-400'}>
                  {result.score}
                </span>
                <span className="text-zinc-600">/100</span>
              </div>
              <p className="text-zinc-400">Conversion Score</p>
            </div>

            {/* Breakdown */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* Headline */}
              <div className={`p-6 rounded-xl border ${getRatingColor(result.headline.rating)}`}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">{getRatingEmoji(result.headline.rating)}</span>
                  <h3 className="font-semibold text-lg">Headline</h3>
                </div>
                <p className="text-zinc-300 mb-2">{result.headline.feedback}</p>
                {result.headline.suggestion && (
                  <p className="text-sm text-zinc-400 italic">💡 {result.headline.suggestion}</p>
                )}
              </div>

              {/* CTA */}
              <div className={`p-6 rounded-xl border ${getRatingColor(result.cta.rating)}`}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">{getRatingEmoji(result.cta.rating)}</span>
                  <h3 className="font-semibold text-lg">Call to Action</h3>
                </div>
                <p className="text-zinc-300 mb-2">{result.cta.feedback}</p>
                {result.cta.suggestion && (
                  <p className="text-sm text-zinc-400 italic">💡 {result.cta.suggestion}</p>
                )}
              </div>

              {/* Trust Signals */}
              <div className={`p-6 rounded-xl border ${getRatingColor(result.trustSignals.rating)}`}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">{getRatingEmoji(result.trustSignals.rating)}</span>
                  <h3 className="font-semibold text-lg">Trust Signals</h3>
                </div>
                <p className="text-zinc-300 mb-2">{result.trustSignals.feedback}</p>
                {result.trustSignals.suggestion && (
                  <p className="text-sm text-zinc-400 italic">💡 {result.trustSignals.suggestion}</p>
                )}
              </div>

              {/* Clarity */}
              <div className={`p-6 rounded-xl border ${getRatingColor(result.clarity.rating)}`}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">{getRatingEmoji(result.clarity.rating)}</span>
                  <h3 className="font-semibold text-lg">Clarity</h3>
                </div>
                <p className="text-zinc-300 mb-2">{result.clarity.feedback}</p>
                {result.clarity.suggestion && (
                  <p className="text-sm text-zinc-400 italic">💡 {result.clarity.suggestion}</p>
                )}
              </div>
            </div>

            {/* Overall */}
            <div className="p-6 bg-zinc-900 rounded-xl border border-zinc-800">
              <h3 className="font-semibold text-lg mb-3">📋 Overall Assessment</h3>
              <p className="text-zinc-300">{result.overall}</p>
            </div>

            {/* Quick Wins */}
            {result.quickWins.length > 0 && (
              <div className="p-6 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-xl border border-orange-500/30">
                <h3 className="font-semibold text-lg mb-3 text-orange-400">⚡ Quick Wins</h3>
                <ul className="space-y-2">
                  {result.quickWins.map((win, i) => (
                    <li key={i} className="flex items-start gap-2 text-zinc-300">
                      <span className="text-orange-400">→</span>
                      {win}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Upsell */}
            <div className="text-center p-8 bg-zinc-900 rounded-2xl border border-zinc-800">
              <h3 className="text-xl font-semibold mb-2">Want a deeper analysis?</h3>
              <p className="text-zinc-400 mb-4">Get a detailed PDF report with specific recommendations, competitor analysis, and A/B test ideas.</p>
              <button className="px-6 py-3 bg-white text-zinc-900 font-semibold rounded-xl hover:bg-zinc-100 transition-colors">
                Get Full Report — £9
              </button>
            </div>
          </div>
        )}

        {/* Features */}
        {!result && (
          <div className="grid md:grid-cols-3 gap-6 mt-16">
            <div className="p-6 bg-zinc-900 rounded-xl border border-zinc-800">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="font-semibold mb-2">Headline Analysis</h3>
              <p className="text-zinc-400 text-sm">Is your headline clear, compelling, and benefit-focused?</p>
            </div>
            <div className="p-6 bg-zinc-900 rounded-xl border border-zinc-800">
              <div className="text-3xl mb-3">🔘</div>
              <h3 className="font-semibold mb-2">CTA Effectiveness</h3>
              <p className="text-zinc-400 text-sm">Are your calls-to-action visible, clear, and action-oriented?</p>
            </div>
            <div className="p-6 bg-zinc-900 rounded-xl border border-zinc-800">
              <div className="text-3xl mb-3">🛡️</div>
              <h3 className="font-semibold mb-2">Trust Signals</h3>
              <p className="text-zinc-400 text-sm">Do you have social proof, testimonials, and credibility markers?</p>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-16 text-center text-zinc-500 text-sm">
          <p>Built by Lead Wolf Digital</p>
        </footer>
      </div>
    </main>
  );
}
