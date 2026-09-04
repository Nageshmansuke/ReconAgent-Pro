import React, { useState } from 'react';
import { MessageSquare, Sparkles, Send, ArrowRight, Lightbulb } from 'lucide-react';

export default function AskReconCopilot() {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copilotResponse, setCopilotResponse] = useState(null);

  const samplePrompts = [
    'Which customer had the largest unmatched settlement?',
    'What was our total gateway fee deduction amount?',
    'Summarize unresolved exceptions and suggested CFO action.'
  ];

  const handleSend = async (queryText = query) => {
    const q = queryText || query;
    if (!q.trim()) return;

    setIsLoading(true);
    setCopilotResponse(null);

    try {
      const res = await fetch('/api/copilot/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q })
      });
      const data = await res.json();
      if (data.success) {
        setCopilotResponse(data.copilotAnswer);
      }
    } catch (err) {
      console.error('Copilot query error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="recon-card mb-6 border-indigo-500/30">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 shrink-0">
          <Sparkles className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <h3 className="text-base font-bold text-[var(--text-primary)]">
            Ask Recon — AI Finance Copilot
          </h3>
          <p className="text-xs text-[var(--text-secondary)]">Ask any question about your live reconciliation metrics, fee rates, or audit exceptions in plain English.</p>
        </div>
      </div>

      {/* Quick Prompt Pills */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className="text-xs text-[var(--text-tertiary)] flex items-center gap-1"><Lightbulb className="w-3.5 h-3.5 text-amber-400" /> Try asking:</span>
        {samplePrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => { setQuery(prompt); handleSend(prompt); }}
            className="px-3 py-1 rounded-full bg-[var(--bg-input)] hover:bg-[var(--bg-card-hover)] text-xs text-indigo-400 border border-[var(--border-dim)] transition-all text-left"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Search Input */}
      <div className="relative flex items-center mb-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask anything (e.g. 'Show fee overcharges' or 'Summarize unresolved exceptions')..."
          className="w-full bg-[var(--bg-input)] border border-[var(--border-bright)] focus:border-indigo-500 rounded-xl pl-4 pr-12 py-3 text-xs text-[var(--text-primary)] outline-none transition-all"
        />
        <button
          onClick={() => handleSend()}
          disabled={isLoading || !query.trim()}
          className="absolute right-2 btn-action btn-indigo-gradient p-2 text-xs rounded-lg"
        >
          <Send className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* AI Response Output Card */}
      {copilotResponse && (
        <div className="mt-4 p-4 rounded-xl bg-[var(--bg-input)] border border-indigo-500/30">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 mb-2">
            <MessageSquare className="w-4 h-4" /> Copilot Answer:
          </div>
          <p className="text-xs text-[var(--text-primary)] leading-relaxed mb-3">{copilotResponse.answer}</p>

          {copilotResponse.key_findings && copilotResponse.key_findings.length > 0 && (
            <div className="mb-3 pl-3 border-l-2 border-amber-500">
              <span className="text-[11px] font-semibold text-amber-500 uppercase block mb-1">Key Findings:</span>
              <ul className="list-disc list-inside text-xs text-[var(--text-secondary)] space-y-1">
                {copilotResponse.key_findings.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {copilotResponse.suggested_action && (
            <div className="flex items-center gap-2 text-xs text-emerald-500 bg-emerald-500/10 p-2.5 rounded-lg border border-emerald-500/20">
              <ArrowRight className="w-3.5 h-3.5 shrink-0" />
              <span><strong>Suggested CFO Action:</strong> {copilotResponse.suggested_action}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
