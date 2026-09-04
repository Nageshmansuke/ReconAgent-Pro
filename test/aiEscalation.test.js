import test from 'node:test';
import assert from 'node:assert/strict';
import { aiEscalation } from '../src/matchers/aiEscalation.js';

test('Layer 3 AI Escalation — Graceful Fallback on Missing API Key', async () => {
  const unmatchedSettlements = [{
    settlement_id: 'SETTL_999',
    payment_id: 'pay_UNKNOWN',
    utr: 'UTR99999',
    amount: 1000.00,
    net_amount: 1000.00,
    fee: 0,
    settlement_date: '2026-08-15T10:00:00Z',
    customer_name: 'Test Customer'
  }];

  const unmatchedLedger = [{
    internal_id: 'ORD_999',
    payment_ref: 'pay_OTHER',
    utr: 'UTR88888',
    gross_amount: 1000.00,
    order_date: '2026-08-15T10:00:00Z',
    customer_name: 'Test Customer'
  }];

  const result = await aiEscalation(unmatchedSettlements, unmatchedLedger, { apiKey: 'your_anthropic_api_key_here' });
  assert.equal(result.matched.length, 0);
  assert.equal(result.unmatchedSettlements.length, 1);
  assert.ok(result.unmatchedSettlements[0].unresolved_reason.includes('flagged for human review'));
});

test('Layer 3 AI Escalation — Forced Failure Fallback (Simulated API Timeout/Parse Failure)', async () => {
  const unmatchedSettlements = [{
    settlement_id: 'SETTL_998',
    payment_id: 'pay_FAILTEST',
    utr: 'UTR99998',
    amount: 1200.00,
    net_amount: 1200.00,
    fee: 0,
    settlement_date: '2026-08-15T10:00:00Z',
    customer_name: 'Failure Test User'
  }];

  const unmatchedLedger = [{
    internal_id: 'ORD_998',
    payment_ref: 'pay_FAILTEST',
    utr: 'UTR99998',
    gross_amount: 1200.00,
    order_date: '2026-08-15T10:00:00Z',
    customer_name: 'Failure Test User'
  }];

  // Pass simulateFailure: true to test deliberate failure recovery
  const result = await aiEscalation(unmatchedSettlements, unmatchedLedger, { simulateFailure: true });
  assert.equal(result.matched.length, 0);
  assert.equal(result.unmatchedSettlements.length, 1);
  assert.equal(result.unmatchedSettlements[0].unresolved_reason, 'unresolved — flagged for human review (simulated AI timeout/parse error)');
});
