import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../data');

// Simple Pseudo-Random Generator (LCG) for deterministic, reproducible noise
function createRandom(seed = 42) {
  let s = seed;
  return function () {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

const FIRST_NAMES = ['Aarav', 'Priya', 'Rohan', 'Ananya', 'Vikram', 'Neha', 'Kabir', 'Sneha', 'Aditya', 'Pooja', 'Siddharth', 'Meera', 'Karan', 'Riya', 'Amit'];
const LAST_NAMES = ['Sharma', 'Verma', 'Patel', 'Gupta', 'Iyer', 'Reddy', 'Singh', 'Nair', 'Deshmukh', 'Joshi', 'Chopra', 'Rao', 'Mehta', 'Kulkarni', 'Bhasin'];

function getRandomElement(arr, randFn) {
  return arr[Math.floor(randFn() * arr.length)];
}

function generateRandomRef(randFn, prefix = 'pay_') {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let str = '';
  for (let i = 0; i < 10; i++) {
    str += chars[Math.floor(randFn() * chars.length)];
  }
  return prefix + str;
}

function generateRandomUTR(randFn) {
  let num = '987';
  for (let i = 0; i < 9; i++) {
    num += Math.floor(randFn() * 10);
  }
  return 'UTR' + num;
}

export function generateSyntheticData(seed = 12345) {
  const rand = createRandom(seed);
  const settlements = [];
  const internalLedger = [];
  const groundTruth = [];

  let settlCounter = 1000;
  let ordCounter = 5000;
  const baseDate = new Date('2026-08-01T09:00:00Z');

  // Total base pairs to generate ~ 70
  // Distribution:
  // 1. Exact matches (35 pairs) ~ 50%
  // 2. Fee-adjusted net amount matches (12 pairs)
  // 3. Date drift (3-5 days) matches (6 pairs)
  // 4. Reference / Name typo (Layer 2 / Layer 3 candidate) (8 pairs)
  // 5. Split payment (2-3 cases)
  // 6. Duplicate settlement (2-3 cases)
  // 7. Missing settlements in gateway (internal order exists, no settlement) (4 cases)
  // 8. Unmatched settlement (settlement exists, no internal order record) (3 cases)

  // 1. Exact matches (35 pairs)
  for (let i = 0; i < 35; i++) {
    settlCounter++;
    ordCounter++;
    const sId = `SETTL_${settlCounter}`;
    const oId = `ORD_${ordCounter}`;
    const ref = generateRandomRef(rand);
    const utr = generateRandomUTR(rand);
    const amount = Math.floor(rand() * 8900 + 100) + 0.00;
    const custName = `${getRandomElement(FIRST_NAMES, rand)} ${getRandomElement(LAST_NAMES, rand)}`;
    
    const itemDate = new Date(baseDate.getTime() + (i * 12 + rand() * 4) * 3600 * 1000);

    settlements.push({
      settlement_id: sId,
      utr: utr,
      payment_id: ref,
      amount: amount,
      fee: 0,
      net_amount: amount,
      settlement_date: itemDate.toISOString(),
      customer_name: custName,
      status: 'settled'
    });

    internalLedger.push({
      internal_id: oId,
      order_id: `order_${ref.slice(4)}`,
      payment_ref: ref,
      utr: utr,
      gross_amount: amount,
      order_date: itemDate.toISOString(),
      customer_name: custName,
      status: 'captured'
    });

    groundTruth.push({
      settlement_id: sId,
      internal_id: oId,
      noise_type: 'exact_match',
      explanation: 'Exact match on payment reference, UTR, amount, and date.'
    });
  }

  // 2. Fee-adjusted matches (12 pairs) — gateway net amount after 2% fee + GST
  for (let i = 0; i < 12; i++) {
    settlCounter++;
    ordCounter++;
    const sId = `SETTL_${settlCounter}`;
    const oId = `ORD_${ordCounter}`;
    const ref = generateRandomRef(rand);
    const utr = generateRandomUTR(rand);
    const grossAmount = Math.floor(rand() * 5000 + 1000);
    const fee = Math.round(grossAmount * 0.02 * 100) / 100;
    const tax = Math.round(fee * 0.18 * 100) / 100;
    const netAmount = Math.round((grossAmount - fee - tax) * 100) / 100;
    const custName = `${getRandomElement(FIRST_NAMES, rand)} ${getRandomElement(LAST_NAMES, rand)}`;
    const itemDate = new Date(baseDate.getTime() + (40 * 12 + i * 10) * 3600 * 1000);

    settlements.push({
      settlement_id: sId,
      utr: utr,
      payment_id: ref,
      amount: grossAmount,
      fee: fee + tax,
      net_amount: netAmount,
      settlement_date: itemDate.toISOString(),
      customer_name: custName,
      status: 'settled'
    });

    internalLedger.push({
      internal_id: oId,
      order_id: `order_${ref.slice(4)}`,
      payment_ref: ref,
      utr: utr,
      gross_amount: grossAmount,
      order_date: itemDate.toISOString(),
      customer_name: custName,
      status: 'captured'
    });

    groundTruth.push({
      settlement_id: sId,
      internal_id: oId,
      noise_type: 'fee_deducted',
      explanation: `Settlement net amount ${netAmount} is gross amount ${grossAmount} minus fee+tax ${fee + tax}. Match on ref ${ref}.`
    });
  }

  // 3. Date drift matches (6 pairs) — 1-3 days delay between order and settlement
  for (let i = 0; i < 6; i++) {
    settlCounter++;
    ordCounter++;
    const sId = `SETTL_${settlCounter}`;
    const oId = `ORD_${ordCounter}`;
    const ref = generateRandomRef(rand);
    const utr = generateRandomUTR(rand);
    const amount = Math.floor(rand() * 4000 + 500);
    const custName = `${getRandomElement(FIRST_NAMES, rand)} ${getRandomElement(LAST_NAMES, rand)}`;
    const orderDate = new Date(baseDate.getTime() + (i * 24 + 10) * 3600 * 1000);
    const settlementDate = new Date(orderDate.getTime() + (1 + Math.floor(rand() * 3)) * 24 * 3600 * 1000);

    settlements.push({
      settlement_id: sId,
      utr: utr,
      payment_id: ref,
      amount: amount,
      fee: 0,
      net_amount: amount,
      settlement_date: settlementDate.toISOString(),
      customer_name: custName,
      status: 'settled'
    });

    internalLedger.push({
      internal_id: oId,
      order_id: `order_${ref.slice(4)}`,
      payment_ref: ref,
      utr: utr,
      gross_amount: amount,
      order_date: orderDate.toISOString(),
      customer_name: custName,
      status: 'captured'
    });

    groundTruth.push({
      settlement_id: sId,
      internal_id: oId,
      noise_type: 'date_drift',
      explanation: `Settlement settled 1-3 days after order date. Match on payment ref ${ref} and amount.`
    });
  }

  // 4. Reference & Name Typos / Mismatches (8 pairs) — triggers Fuzzy or AI Escalation
  const typoCases = [
    { name: 'Rajesh Kumar', typoName: 'Rajesh Kumarr', refOffset: false, refTypo: true },
    { name: 'Vikram Sethi', typoName: 'Vikram S.', refOffset: false, refTypo: true },
    { name: 'Deepak Verma', typoName: 'Deepak V', refOffset: false, refTypo: false }, // UTR typo
    { name: 'Sunita Rao', typoName: 'Sunitha Rao', refOffset: false, refTypo: true },
    { name: 'Manish Pandey', typoName: 'Manish P', refOffset: false, refTypo: true },
    { name: 'Anil Kapoor', typoName: 'Anil K', refOffset: false, refTypo: true },
    { name: 'Pankaj Tripathi', typoName: 'Pankaj T.', refOffset: false, refTypo: true },
    { name: 'Sujata Mohanty', typoName: 'Sujata M', refOffset: false, refTypo: true }
  ];

  for (let i = 0; i < typoCases.length; i++) {
    settlCounter++;
    ordCounter++;
    const tc = typoCases[i];
    const sId = `SETTL_${settlCounter}`;
    const oId = `ORD_${ordCounter}`;
    const baseRef = generateRandomRef(rand);
    const baseUTR = generateRandomUTR(rand);
    const amount = Math.floor(rand() * 6000 + 800);
    const itemDate = new Date(baseDate.getTime() + (100 + i * 15) * 3600 * 1000);

    // Create deliberate typo in payment_id or UTR
    const settlRef = tc.refTypo ? baseRef.slice(0, -2) + 'XX' : baseRef;
    const settlUTR = !tc.refTypo ? baseUTR.slice(0, -2) + '99' : baseUTR;

    settlements.push({
      settlement_id: sId,
      utr: settlUTR,
      payment_id: settlRef,
      amount: amount,
      fee: 0,
      net_amount: amount,
      settlement_date: itemDate.toISOString(),
      customer_name: tc.typoName,
      status: 'settled'
    });

    internalLedger.push({
      internal_id: oId,
      order_id: `order_${baseRef.slice(4)}`,
      payment_ref: baseRef,
      utr: baseUTR,
      gross_amount: amount,
      order_date: itemDate.toISOString(),
      customer_name: tc.name,
      status: 'captured'
    });

    groundTruth.push({
      settlement_id: sId,
      internal_id: oId,
      noise_type: 'typo_ref',
      explanation: `Typo/abbreviation in ref or name (${tc.typoName} vs ${tc.name}, ref ${settlRef} vs ${baseRef}). Amount ${amount} matches.`
    });
  }

  // 5. Split payments (2 cases) — 1 internal order settled as 2 gateway records
  for (let i = 0; i < 2; i++) {
    ordCounter++;
    const oId = `ORD_${ordCounter}`;
    const totalAmount = 5000 + i * 2000;
    const part1 = Math.floor(totalAmount * 0.6);
    const part2 = totalAmount - part1;
    const baseRef = generateRandomRef(rand);
    const utr = generateRandomUTR(rand);
    const custName = `${getRandomElement(FIRST_NAMES, rand)} ${getRandomElement(LAST_NAMES, rand)}`;
    const itemDate = new Date(baseDate.getTime() + (200 + i * 20) * 3600 * 1000);

    settlCounter++;
    const sId1 = `SETTL_${settlCounter}`;
    settlements.push({
      settlement_id: sId1,
      utr: utr + '_P1',
      payment_id: baseRef + '_1',
      amount: part1,
      fee: 0,
      net_amount: part1,
      settlement_date: itemDate.toISOString(),
      customer_name: custName + ' (Part 1)',
      status: 'settled'
    });

    settlCounter++;
    const sId2 = `SETTL_${settlCounter}`;
    settlements.push({
      settlement_id: sId2,
      utr: utr + '_P2',
      payment_id: baseRef + '_2',
      amount: part2,
      fee: 0,
      net_amount: part2,
      settlement_date: itemDate.toISOString(),
      customer_name: custName + ' (Part 2)',
      status: 'settled'
    });

    internalLedger.push({
      internal_id: oId,
      order_id: `order_${baseRef.slice(4)}`,
      payment_ref: baseRef,
      utr: utr,
      gross_amount: totalAmount,
      order_date: itemDate.toISOString(),
      customer_name: custName,
      status: 'captured'
    });

    groundTruth.push({
      settlement_id: sId1,
      internal_id: oId,
      noise_type: 'split_payment',
      explanation: `Split payment part 1 (${part1}) of order ${oId} total ${totalAmount}.`
    });

    groundTruth.push({
      settlement_id: sId2,
      internal_id: oId,
      noise_type: 'split_payment',
      explanation: `Split payment part 2 (${part2}) of order ${oId} total ${totalAmount}.`
    });
  }

  // 6. Duplicate settlement (2 cases) — same settlement recorded twice in gateway log
  for (let i = 0; i < 2; i++) {
    settlCounter++;
    ordCounter++;
    const sIdOriginal = `SETTL_${settlCounter}`;
    const oId = `ORD_${ordCounter}`;
    const ref = generateRandomRef(rand);
    const utr = generateRandomUTR(rand);
    const amount = 2500 + i * 1000;
    const custName = `${getRandomElement(FIRST_NAMES, rand)} ${getRandomElement(LAST_NAMES, rand)}`;
    const itemDate = new Date(baseDate.getTime() + (250 + i * 15) * 3600 * 1000);

    settlements.push({
      settlement_id: sIdOriginal,
      utr: utr,
      payment_id: ref,
      amount: amount,
      fee: 0,
      net_amount: amount,
      settlement_date: itemDate.toISOString(),
      customer_name: custName,
      status: 'settled'
    });

    // Duplicate settlement row
    settlCounter++;
    const sIdDup = `SETTL_${settlCounter}`;
    settlements.push({
      settlement_id: sIdDup,
      utr: utr,
      payment_id: ref,
      amount: amount,
      fee: 0,
      net_amount: amount,
      settlement_date: itemDate.toISOString(),
      customer_name: custName,
      status: 'settled'
    });

    internalLedger.push({
      internal_id: oId,
      order_id: `order_${ref.slice(4)}`,
      payment_ref: ref,
      utr: utr,
      gross_amount: amount,
      order_date: itemDate.toISOString(),
      customer_name: custName,
      status: 'captured'
    });

    groundTruth.push({
      settlement_id: sIdOriginal,
      internal_id: oId,
      noise_type: 'exact_match',
      explanation: `Primary settlement match for order ${oId}.`
    });

    groundTruth.push({
      settlement_id: sIdDup,
      internal_id: oId,
      noise_type: 'duplicate',
      explanation: `Duplicate settlement entry for order ${oId} (already matched by ${sIdOriginal}).`
    });
  }

  // 7. Missing settlements in gateway (4 orders in internal ledger without settlement)
  for (let i = 0; i < 4; i++) {
    ordCounter++;
    const oId = `ORD_${ordCounter}`;
    const ref = generateRandomRef(rand);
    const utr = generateRandomUTR(rand);
    const amount = 1200 + i * 350;
    const custName = `${getRandomElement(FIRST_NAMES, rand)} ${getRandomElement(LAST_NAMES, rand)}`;
    const itemDate = new Date(baseDate.getTime() + (280 + i * 10) * 3600 * 1000);

    internalLedger.push({
      internal_id: oId,
      order_id: `order_${ref.slice(4)}`,
      payment_ref: ref,
      utr: utr,
      gross_amount: amount,
      order_date: itemDate.toISOString(),
      customer_name: custName,
      status: 'captured'
    });

    groundTruth.push({
      settlement_id: null,
      internal_id: oId,
      noise_type: 'missing_settlement',
      explanation: `Internal ledger order ${oId} has no corresponding settlement in gateway.`
    });
  }

  // 8. Unmatched settlement (3 settlements in gateway without internal ledger record)
  for (let i = 0; i < 3; i++) {
    settlCounter++;
    const sId = `SETTL_${settlCounter}`;
    const ref = generateRandomRef(rand);
    const utr = generateRandomUTR(rand);
    const amount = 3400 + i * 700;
    const custName = `${getRandomElement(FIRST_NAMES, rand)} ${getRandomElement(LAST_NAMES, rand)}`;
    const itemDate = new Date(baseDate.getTime() + (320 + i * 10) * 3600 * 1000);

    settlements.push({
      settlement_id: sId,
      utr: utr,
      payment_id: ref,
      amount: amount,
      fee: 0,
      net_amount: amount,
      settlement_date: itemDate.toISOString(),
      customer_name: custName,
      status: 'settled'
    });

    groundTruth.push({
      settlement_id: sId,
      internal_id: null,
      noise_type: 'missing_ledger',
      explanation: `Gateway settlement ${sId} has no corresponding order record in internal ledger.`
    });
  }

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  fs.writeFileSync(path.join(DATA_DIR, 'gateway_settlements.json'), JSON.stringify(settlements, null, 2));
  fs.writeFileSync(path.join(DATA_DIR, 'internal_ledger.json'), JSON.stringify(internalLedger, null, 2));
  fs.writeFileSync(path.join(DATA_DIR, 'ground_truth.json'), JSON.stringify(groundTruth, null, 2));

  return {
    settlementsCount: settlements.length,
    internalLedgerCount: internalLedger.length,
    groundTruthCount: groundTruth.length
  };
}

// Execute if run directly from CLI
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename)) {
  const result = generateSyntheticData();
  console.log('Generated synthetic data successfully:');
  console.log(`- Gateway Settlements: ${result.settlementsCount}`);
  console.log(`- Internal Ledger: ${result.internalLedgerCount}`);
  console.log(`- Ground Truth Answers: ${result.groundTruthCount}`);
}
