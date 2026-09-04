import Anthropic from '@anthropic-ai/sdk';

/**
 * Layer 3: Bounded AI Escalation Matcher
 * Only invoked for genuine leftovers after Layer 1 (Exact) and Layer 2 (Fuzzy).
 * Uses Claude API with strict JSON schema validation, call caps, confidence thresholds,
 * and try/catch fallback to "unresolved — flagged for human review".
 */
export async function aiEscalation(unmatchedSettlements, unmatchedLedger, options = {}) {
  const maxCalls = options.maxCalls || 20;
  const confidenceThreshold = options.confidenceThreshold || 0.60;
  const simulateFailure = options.simulateFailure || false;

  const matched = [];
  const remainingSettlements = [];
  const remainingLedgerMap = new Map(unmatchedLedger.map(l => [l.internal_id, l]));

  // Setup Anthropic client if API key is present
  const apiKey = options.apiKey || process.env.ANTHROPIC_API_KEY;
  let anthropic = null;
  if (apiKey && apiKey !== 'your_anthropic_api_key_here' && !simulateFailure) {
    try {
      anthropic = new Anthropic({ apiKey });
    } catch (err) {
      console.warn('Failed to initialize Anthropic client:', err.message);
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

    if (!anthropic) {
      // Fallback when no active API key is provided
      remainingSettlements.push({
        ...settl,
        unresolved_reason: 'unresolved — flagged for human review (AI key not configured)'
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
  "matched_id": "ORD_xxxx" | null,
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
      const response = await anthropic.messages.create({
        model: process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022',
        max_tokens: 300,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }]
      });

      const responseText = response.content?.[0]?.text || '';
      
      // Extract JSON from response text if wrapped in markdown codeblocks
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
          reason: `AI Escalation: ${parsed.reason}`
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
      // Graceful fallback on API error, parse error, or schema mismatch
      console.warn(`AI Escalation error for settlement ${settl.settlement_id}:`, err.message);
      remainingSettlements.push({
        ...settl,
        unresolved_reason: `unresolved — flagged for human review (AI error: ${err.message})`
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
