/**
 * Flexible CSV / Data Normalizer for ReconAgent
 * Converts uploaded CSV text or JSON objects into standard internal schemas
 * for Gateway Settlements and Internal Ledger records.
 */

export function parseCSV(csvText) {
  const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== '');
  if (lines.length === 0) return [];

  const headers = parseCSVLine(lines[0]).map(h => h.trim().toLowerCase());
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length === 0 || (values.length === 1 && values[0] === '')) continue;

    const rowObj = {};
    for (let j = 0; j < headers.length; j++) {
      rowObj[headers[j]] = values[j] ? values[j].trim() : '';
    }
    rows.push(rowObj);
  }

  return rows;
}

function parseCSVLine(line) {
  const result = [];
  let cur = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQuotes = !inQuotes;
    } else if (c === ',' && !inQuotes) {
      result.push(cur);
      cur = '';
    } else {
      cur += c;
    }
  }
  result.push(cur);
  return result;
}

export function normalizeSettlementData(rawItems) {
  return rawItems.map((item, idx) => {
    // Map settlement_id
    const settlementId = item.settlement_id || item['settlement id'] || item.settlement_ref || item.id || `SETTL_REAL_${1000 + idx}`;
    
    // Map UTR
    const utr = item.utr || item.utr_number || item['utr number'] || item.bank_ref || item.rrn || '';
    
    // Map payment_id
    const paymentId = item.payment_id || item['payment id'] || item.razorpay_payment_id || item.transaction_id || item.tx_id || '';
    
    // Map amounts
    const rawAmount = parseFloat(item.amount || item.gross_amount || item['amount'] || 0);
    const rawFee = parseFloat(item.fee || item.fees || item.commission || 0);
    const rawNet = parseFloat(item.net_amount || item.net || item.payout_amount || (rawAmount - rawFee));
    
    // Map date
    const dateStr = item.settlement_date || item.date || item.created_at || item.settled_at || new Date().toISOString();
    
    // Map customer name
    const customerName = item.customer_name || item.customer || item.name || item.payer_name || 'Customer';

    return {
      settlement_id: String(settlementId),
      utr: String(utr),
      payment_id: String(paymentId),
      amount: isNaN(rawAmount) ? 0 : rawAmount,
      fee: isNaN(rawFee) ? 0 : rawFee,
      net_amount: isNaN(rawNet) ? rawAmount : rawNet,
      settlement_date: dateStr,
      customer_name: String(customerName),
      status: item.status || 'settled'
    };
  });
}

export function normalizeLedgerData(rawItems) {
  return rawItems.map((item, idx) => {
    const internalId = item.internal_id || item.order_id || item['order id'] || item.invoice_id || item.id || `ORD_REAL_${5000 + idx}`;
    const paymentRef = item.payment_ref || item.payment_id || item['payment ref'] || item.ref || item.transaction_id || '';
    const utr = item.utr || item.utr_number || item['utr number'] || '';
    const grossAmount = parseFloat(item.gross_amount || item.amount || item['amount'] || item.total_amount || 0);
    const dateStr = item.order_date || item.date || item.created_at || new Date().toISOString();
    const customerName = item.customer_name || item.customer || item.buyer || item.name || 'Customer';

    return {
      internal_id: String(internalId),
      order_id: item.order_id || `order_${internalId}`,
      payment_ref: String(paymentRef),
      utr: String(utr),
      gross_amount: isNaN(grossAmount) ? 0 : grossAmount,
      order_date: dateStr,
      customer_name: String(customerName),
      status: item.status || 'captured'
    };
  });
}
