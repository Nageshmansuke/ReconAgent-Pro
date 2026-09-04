/**
 * Fully Dynamic Real-Time Data Parser & Normalizer for ReconAgent
 * Accepts any real-world CSV or JSON export from payment gateways
 * (Razorpay, Stripe, PayU, Paytm, Banks) or merchant ledgers (QuickBooks, Tally, Shopify, ERPs).
 * No hardcoded field assumptions — uses dynamic pattern matching across all column headers.
 */

export function parseCSV(csvText) {
  const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== '');
  if (lines.length === 0) return [];

  const headers = parseCSVLine(lines[0]).map(h => h.trim());
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

// Dynamic field value extractor by matching key patterns
function findValue(obj, patterns, defaultValue = '') {
  const keys = Object.keys(obj);
  for (const pattern of patterns) {
    const matchedKey = keys.find(k => k.toLowerCase().replace(/[^a-z0-9]/g, '').includes(pattern));
    if (matchedKey && obj[matchedKey] !== undefined && obj[matchedKey] !== '') {
      return obj[matchedKey];
    }
  }
  return defaultValue;
}

export function normalizeSettlementData(rawItems) {
  return rawItems.map((item, idx) => {
    // Dynamic Settlement ID extraction
    const settlementId = findValue(item, ['settlementid', 'settlementref', 'payoutid', 'id'], `SETTL_${1000 + idx}`);

    // Dynamic UTR / Bank Reference extraction
    const utr = findValue(item, ['utr', 'bankref', 'rrn', 'banktransactionid', 'reference']);

    // Dynamic Payment ID / Transaction Ref extraction
    const paymentId = findValue(item, ['paymentid', 'razorpaypaymentid', 'transactionid', 'txid', 'paymentref', 'ref']);

    // Dynamic Amounts
    const amountVal = parseFloat(findValue(item, ['amount', 'grossamount', 'total', 'credit'], 0));
    const feeVal = parseFloat(findValue(item, ['fee', 'commission', 'charges', 'tax'], 0));
    const netVal = parseFloat(findValue(item, ['netamount', 'net', 'payoutamount'], amountVal - feeVal));

    // Dynamic Date
    const dateVal = findValue(item, ['settlementdate', 'date', 'createdat', 'timestamp', 'settledat'], new Date().toISOString());

    // Dynamic Customer Name
    const customerName = findValue(item, ['customername', 'customer', 'payer', 'name', 'entity'], 'Customer');

    return {
      settlement_id: String(settlementId),
      utr: String(utr),
      payment_id: String(paymentId),
      amount: isNaN(amountVal) ? 0 : amountVal,
      fee: isNaN(feeVal) ? 0 : feeVal,
      net_amount: isNaN(netVal) ? amountVal : netVal,
      settlement_date: String(dateVal),
      customer_name: String(customerName),
      status: String(findValue(item, ['status', 'state'], 'settled'))
    };
  });
}

export function normalizeLedgerData(rawItems) {
  return rawItems.map((item, idx) => {
    // Dynamic Internal / Order ID extraction
    const internalId = findValue(item, ['internalid', 'orderid', 'invoiceid', 'orderno', 'invoiceno', 'id'], `ORD_${5000 + idx}`);

    // Dynamic Payment Reference extraction
    const paymentRef = findValue(item, ['paymentref', 'paymentid', 'transactionid', 'refno', 'ref']);

    // Dynamic UTR extraction
    const utr = findValue(item, ['utr', 'bankref', 'rrn']);

    // Dynamic Gross Amount extraction
    const grossAmountVal = parseFloat(findValue(item, ['grossamount', 'amount', 'totalamount', 'total', 'invoiceamount'], 0));

    // Dynamic Date
    const dateVal = findValue(item, ['orderdate', 'date', 'invoicedate', 'createdat', 'timestamp'], new Date().toISOString());

    // Dynamic Customer Name
    const customerName = findValue(item, ['customername', 'customer', 'buyer', 'client', 'name'], 'Customer');

    return {
      internal_id: String(internalId),
      order_id: findValue(item, ['orderid', 'orderno'], `order_${internalId}`),
      payment_ref: String(paymentRef),
      utr: String(utr),
      gross_amount: isNaN(grossAmountVal) ? 0 : grossAmountVal,
      order_date: String(dateVal),
      customer_name: String(customerName),
      status: String(findValue(item, ['status', 'state'], 'captured'))
    };
  });
}
