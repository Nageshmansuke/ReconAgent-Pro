import React, { useState } from 'react';
import { Send } from 'lucide-react';

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
    <div className="terminal-card">
      <div className="flex flex-col gap-3 mb-4">
        <div className="text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]">
          Ask about this reconciliation run
        </div>

        {/* Quiet Outlined Suggestion Chips */}
        <div className="flex flex-wrap items-center gap-2">
          {samplePrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => { setQuery(prompt); handleSend(prompt); }}
              className="px-2.5 py-1 rounded border border-[var(--border-subtle)] bg-transparent hover:border-[var(--border-hover)] hover:bg-[var(--bg-surface-elevated)] text-xs text-[var(--text-secondary)] transition-all text-left"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Clean Single-line Input */}
      <div className="relative flex items-center">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask a question in plain English (e.g. 'Show fee overcharges')..."
          className="terminal-input w-full pr-10"
        />
        <button
          onClick={() => handleSend()}
          disabled={isLoading || !query.trim()}
          className="absolute right-2 p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <Send className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Response Card */}
      {copilotResponse && (
        <div className="mt-4 p-4 rounded bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] flex flex-col gap-3">
          <div className="text-xs font-mono text-[var(--accent-blue)] uppercase">
            Copilot Response
          </div>
          <p className="text-xs text-[var(--text-primary)] leading-relaxed">{copilotResponse.answer}</p>

          {copilotResponse.key_findings && copilotResponse.key_findings.length > 0 && (
            <div className="pl-3 border-l-2 border-[var(--border-hover)]">
              <span className="text-[11px] font-medium text-[var(--text-secondary)] uppercase block mb-1">Key Findings</span>
              <ul className="list-disc list-inside text-xs text-[var(--text-secondary)] space-y-1">
                {copilotResponse.key_findings.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {copilotResponse.suggested_action && (
            <div className="text-xs text-[var(--color-success)] bg-transparent pt-2 border-t border-[var(--border-subtle)]">
              <strong>Action:</strong> {copilotResponse.suggested_action}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
