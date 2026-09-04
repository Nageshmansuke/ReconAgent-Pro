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
    <div className="glass-panel p-6 mb-6 border-[#38BDF8]/30 bg-gradient-to-r from-[#12161F] via-[#161C28] to-[#12161F]">
      <div className="flex items-center gap-2 mb-3">
        <div className="p-2 rounded-lg bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/20">
          <Sparkles className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            Ask Recon — AI Finance Copilot
          </h3>
          <p className="text-xs text-[#9CA3AF]">Ask any question about your live reconciliation metrics, fee rates, or audit exceptions in plain English.</p>
        </div>
      </div>

      {/* Quick Prompt Pills */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className="text-xs text-[#9CA3AF] flex items-center gap-1"><Lightbulb className="w-3 h-3 text-[#F5C453]" /> Try asking:</span>
        {samplePrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => { setQuery(prompt); handleSend(prompt); }}
            className="px-2.5 py-1 rounded-full bg-[#0A0C10] hover:bg-[#1E2532] text-xs text-[#38BDF8] border border-[#1E2532] transition-all"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Search Input */}
      <div className="relative flex items-center">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask anything (e.g. 'Show fee overcharges' or 'Summarize unresolved exceptions')..."
          className="w-full bg-[#0A0C10] border border-[#2A3346] focus:border-[#38BDF8] rounded-xl pl-4 pr-12 py-3 text-xs text-white outline-none transition-all shadow-inner"
        />
        <button
          onClick={() => handleSend()}
          disabled={isLoading || !query.trim()}
          className="absolute right-2 btn btn-cyan p-2 text-xs rounded-lg"
        >
          <Send className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* AI Response Output Card */}
      {copilotResponse && (
        <div className="mt-4 p-4 rounded-xl bg-[#0A0C10] border border-[#38BDF8]/30 animate-fade-in">
          <div className="flex items-center gap-2 text-xs font-bold text-[#38BDF8] mb-2">
            <MessageSquare className="w-4 h-4" /> Copilot Answer:
          </div>
          <p className="text-xs text-white leading-relaxed mb-3">{copilotResponse.answer}</p>

          {copilotResponse.key_findings && copilotResponse.key_findings.length > 0 && (
            <div className="mb-3 pl-3 border-l-2 border-[#F5C453]">
              <span className="text-[11px] font-semibold text-[#F5C453] uppercase block mb-1">Key Findings:</span>
              <ul className="list-disc list-inside text-xs text-[#9CA3AF] space-y-1">
                {copilotResponse.key_findings.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {copilotResponse.suggested_action && (
            <div className="flex items-center gap-2 text-xs text-[#34D399] bg-[#10B981]/10 p-2.5 rounded-lg border border-[#10B981]/20">
              <ArrowRight className="w-3.5 h-3.5 shrink-0" />
              <span><strong>Suggested CFO Action:</strong> {copilotResponse.suggested_action}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
