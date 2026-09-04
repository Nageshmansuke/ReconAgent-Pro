import test from 'node:test';
import assert from 'node:assert/strict';
import { exactMatch } from '../src/matchers/exact.js';

test('Layer 1 Exact Match — Clean Match', () => {
  const settlements = [{
    settlement_id: 'SETTL_001',
    payment_id: 'pay_12345',
    utr: 'UTR999',
    amount: 1500.00,
    net_amount: 1500.00,
    fee: 0
  }];

  const ledger = [{
    internal_id: 'ORD_001',
    payment_ref: 'pay_12345',
    utr: 'UTR999',
    gross_amount: 1500.00
  }];

  const result = exactMatch(settlements, ledger);
  assert.equal(result.matched.length, 1);
  assert.equal(result.matched[0].settlement.settlement_id, 'SETTL_001');
  assert.equal(result.matched[0].ledger.internal_id, 'ORD_001');
  assert.equal(result.matched[0].match_layer, 'exact');
  assert.equal(result.matched[0].confidence, 1.0);
  assert.equal(result.unmatchedSettlements.length, 0);
  assert.equal(result.unmatchedLedger.length, 0);
});

test('Layer 1 Exact Match — Fee Deduction & Amount Tolerance Edge Case', () => {
  const settlements = [{
    settlement_id: 'SETTL_002',
    payment_id: 'pay_67890',
    utr: 'UTR888',
    amount: 2000.00,
    net_amount: 1952.80,
    fee: 47.20
  }];

  const ledger = [{
    internal_id: 'ORD_002',
    payment_ref: 'pay_67890',
    utr: 'UTR888',
    gross_amount: 2000.00
  }];

  const result = exactMatch(settlements, ledger);
  assert.equal(result.matched.length, 1);
  assert.equal(result.matched[0].ledger.internal_id, 'ORD_002');
  assert.equal(result.matched[0].match_layer, 'exact');
});

test('Layer 1 Exact Match — Non-Match (Mismatched Ref & Amount)', () => {
  const settlements = [{
    settlement_id: 'SETTL_003',
    payment_id: 'pay_XXXXX',
    utr: 'UTR111',
    amount: 3000.00,
    net_amount: 3000.00,
    fee: 0
  }];

  const ledger = [{
    internal_id: 'ORD_003',
    payment_ref: 'pay_YYYYY',
    utr: 'UTR222',
    gross_amount: 3000.00
  }];

  const result = exactMatch(settlements, ledger);
  assert.equal(result.matched.length, 0);
  assert.equal(result.unmatchedSettlements.length, 1);
  assert.equal(result.unmatchedLedger.length, 1);
});
