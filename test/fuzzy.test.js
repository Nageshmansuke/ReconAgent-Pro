import test from 'node:test';
import assert from 'node:assert/strict';
import { fuzzyMatch } from '../src/matchers/fuzzy.js';

test('Layer 2 Fuzzy Match — Resolves High Similarity Match', () => {
  const unmatchedSettlements = [{
    settlement_id: 'SETTL_101',
    payment_id: 'pay_ABCDEFXX',
    utr: 'UTR777',
    amount: 2243.00,
    net_amount: 2243.00,
    fee: 0,
    settlement_date: '2026-08-10T14:00:00Z',
    customer_name: 'Rajesh Kumarr'
  }];

  const unmatchedLedger = [{
    internal_id: 'ORD_101',
    payment_ref: 'pay_ABCDEFG3',
    utr: 'UTR777',
    gross_amount: 2243.00,
    order_date: '2026-08-10T10:00:00Z',
    customer_name: 'Rajesh Kumar'
  }];

  const result = fuzzyMatch(unmatchedSettlements, unmatchedLedger);
  assert.equal(result.matched.length, 1);
  assert.equal(result.matched[0].settlement.settlement_id, 'SETTL_101');
  assert.equal(result.matched[0].ledger.internal_id, 'ORD_101');
  assert.equal(result.matched[0].match_layer, 'fuzzy');
  assert.ok(result.matched[0].confidence >= 0.75);
  assert.equal(result.unmatchedSettlements.length, 0);
});

test('Layer 2 Fuzzy Match — Correctly Keeps Low Similarity Unresolved', () => {
  const unmatchedSettlements = [{
    settlement_id: 'SETTL_102',
    payment_id: 'pay_99999',
    utr: 'UTR999',
    amount: 5000.00,
    net_amount: 5000.00,
    fee: 0,
    settlement_date: '2026-08-10T14:00:00Z',
    customer_name: 'Unknown Person'
  }];

  const unmatchedLedger = [{
    internal_id: 'ORD_102',
    payment_ref: 'pay_00000',
    utr: 'UTR000',
    gross_amount: 5000.00,
    order_date: '2026-08-10T10:00:00Z',
    customer_name: 'Siddharth Mehra'
  }];

  const result = fuzzyMatch(unmatchedSettlements, unmatchedLedger);
  assert.equal(result.matched.length, 0);
  assert.equal(result.unmatchedSettlements.length, 1);
  assert.equal(result.unmatchedLedger.length, 1);
});
