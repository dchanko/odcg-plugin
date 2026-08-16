export default {
  id: 'default',
  title: 'Calculator',
  fields: [
    { name: 'amount', label: 'Amount', type: 'number', min: 0, step: 0.01, default: 100 },
    { name: 'rate', label: 'Rate (%)', type: 'number', min: 0, max: 100, step: 0.1, default: 5 },
  ],
  compute(values) {
    return values.amount * (1 + values.rate / 100);
  },
  formatResult(value) {
    return value.toFixed(2);
  },
  aggregateResults(validResults) {
    return validResults.reduce((sum, n) => sum + n, 0);
  },
  formatGrandTotal(value) {
    return value.toFixed(2);
  },
  grandTotalLabel: 'Grand Total',
  minLines: 1,
  maxLines: null,
};
