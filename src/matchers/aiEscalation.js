import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenAI } from '@google/genai';

/**
 * Layer 3: Bounded AI Escalation Matcher
 * Operates strictly on genuine leftovers after Layer 1 (Exact) and Layer 2 (Fuzzy).
 * Supports both Google Gemini API and Anthropic Claude API.
 * Uses strict JSON schema validation, call caps, confidence thresholds,
 * and try/catch fallback to "unresolved — flagged for human review".
 * Fully dynamic via environment variables or options.
 */
export async function aiEscalation(unmatchedSettlements, unmatchedLedger, options = {}) {
  const maxCalls = options.maxCalls || parseInt(process.env.MAX_AI_CALLS || '20');
  const confidenceThreshold = options.confidenceThreshold || parseFloat(process.env.AI_CONFIDENCE_THRESHOLD || '0.60');
  const simulateFailure = options.simulateFailure || false;

  const matched = [];
  const remainingSettlements = [];
  const remainingLedgerMap = new Map(unmatchedLedger.map(l => [l.internal_id, l]));

  // Determine provider: 'gemini' or 'anthropic'
  const geminiKey = options.geminiApiKey || process.env.GEMINI_API_KEY;
  const anthropicKey = options.anthropicApiKey || process.env.ANTHROPIC_API_KEY;

  let provider = options.provider || process.env.AI_PROVIDER;
  if (!provider) {
    if (geminiKey && geminiKey !== 'your_gemini_api_key_here') {
      provider = 'gemini';
    } else if (anthropicKey && anthropicKey !== 'your_anthropic_api_key_here') {
      provider = 'anthropic';
    } else {
      provider = 'none';
    }
  }

  let googleAI = null;
  let anthropic = null;

  if (!simulateFailure) {
    if (provider === 'gemini' && geminiKey && geminiKey !== 'your_gemini_api_key_here') {
      try {
        googleAI = new GoogleGenAI({ apiKey: geminiKey });
      } catch (err) {
        console.warn('Failed to initialize Google GenAI client:', err.message);
      }
    } else if (provider === 'anthropic' && anthropicKey && anthropicKey !== 'your_anthropic_api_key_here') {
      try {
        anthropic = new Anthropic({ apiKey: anthropicKey });
      } catch (err) {
        console.warn('Failed to initialize Anthropic client:', err.message);
      }
    }
  }

  let callsMade = 0;

  for (const settl of unmatchedSettlements) {
    if (callsMade >= maxCalls) {
      remainingSettlements.push({
        ...settl,
        unresolved_reason: 'unresolved — AI call cap reached'
      });
      continue;
    }

    if (simulateFailure) {
      // Intentionally trigger failure case for demonstration / testing
      remainingSettlements.push({
        ...settl,
        unresolved_reason: 'unresolved — flagged for human review (simulated AI timeout/parse error)'
      });
      continue;
    }

    if (!googleAI && !anthropic) {
      // Fallback when no active API key is provided
      remainingSettlements.push({
        ...settl,
        unresolved_reason: `unresolved — flagged for human review (${provider} API key not configured)`
      });
      continue;
    }

    const candidates = Array.from(remainingLedgerMap.values());
    if (candidates.length === 0) {
      remainingSettlements.push({
        ...settl,
        unresolved_reason: 'unresolved — no internal ledger candidates remaining'
      });
      continue;
    }

    const systemPrompt = `You are ReconAgent, an expert financial reconciliation AI controller.
Your task is to analyze an unmatched payment gateway settlement record against a list of candidate internal ledger records.
Determine if there is a true match (considering split payments, typos, minor fee deductions, date offsets).
Return ONLY a valid JSON object matching this exact schema:
{
  "match": true | false,
  "matched_id": "<internal_id of matched ledger candidate>" | null,
  "confidence": 0.0 to 1.0,
  "reason": "Clear one-sentence explanation for the decision"
}`;

    const userPrompt = `Settlement Record:
${JSON.stringify(settl, null, 2)}

Candidate Ledger Records:
${JSON.stringify(candidates, null, 2)}

Evaluate whether the settlement matches any ledger record. Reply strictly with the JSON object.`;

    try {
      callsMade++;
      let responseText = '';

      if (googleAI) {
        const preferredModel = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
        let response;
        try {
          response = await googleAI.models.generateContent({
            model: preferredModel,
            contents: userPrompt,
            config: {
              systemInstruction: systemPrompt,
              responseMimeType: 'application/json'
            }
          });
        } catch (modelErr) {
          // Fallback to gemini-1.5-flash if preferred model fails or returns 404
          response = await googleAI.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: userPrompt,
            config: {
              systemInstruction: systemPrompt,
              responseMimeType: 'application/json'
            }
          });
        }
        responseText = response.text || '';
      } else if (anthropic) {
        const modelName = process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022';
        const response = await anthropic.messages.create({
          model: modelName,
          max_tokens: 300,
          system: systemPrompt,
          messages: [{ role: 'user', content: userPrompt }]
        });
        responseText = response.content?.[0]?.text || '';
      }

      // Extract JSON from response text
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('AI response did not contain valid JSON block');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      // Schema validation
      if (typeof parsed.match !== 'boolean' || typeof parsed.confidence !== 'number' || !parsed.reason) {
        throw new Error('AI response failed JSON schema validation');
      }

      if (parsed.match && parsed.matched_id && remainingLedgerMap.has(parsed.matched_id) && parsed.confidence >= confidenceThreshold) {
        const matchedLedger = remainingLedgerMap.get(parsed.matched_id);
        remainingLedgerMap.delete(parsed.matched_id);

        matched.push({
          settlement: settl,
          ledger: matchedLedger,
          match_layer: 'ai',
          confidence: Math.round(parsed.confidence * 100) / 100,
          reason: `AI Escalation (${provider.toUpperCase()}): ${parsed.reason}`
        });
      } else {
        remainingSettlements.push({
          ...settl,
          unresolved_reason: parsed.match && parsed.confidence < confidenceThreshold
            ? `unresolved — flagged for human review (low AI confidence: ${parsed.confidence})`
            : `unresolved — flagged for human review (${parsed.reason || 'No matching ledger record'})`
        });
      }
    } catch (err) {
      console.warn(`AI Escalation error (${provider}) for settlement ${settl.settlement_id}:`, err.message);
      const cleanErr = err.message ? err.message.split('\n')[0].replace(/"/g, "'") : 'API timeout or model unavailable';
      remainingSettlements.push({
        ...settl,
        unresolved_reason: `unresolved — flagged for human review (AI note: ${cleanErr})`
      });
    }
  }

  const finalRemainingLedger = Array.from(remainingLedgerMap.values());

  return {
    matched,
    unmatchedSettlements: remainingSettlements,
    unmatchedLedger: finalRemainingLedger,
    callsMade
  };
}
