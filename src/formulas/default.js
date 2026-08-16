export default {
  id: 'default',
  title: 'Objective Diamond Clarity Grading Calculator',
  fields: [
    { name: 'height', label: 'Height (μm)', type: 'number', min: 1, step: 1, default: 10 },
    { name: 'width', label: 'Width (μm)', type: 'number', min: 1, step: 1, default: 10 },
    { name: 'contrast', label: 'Contrast (%)', type: 'number', min: 0, max: 100, step: 1, default: 50 },
  ],
  compute(values) {
    return Math.log2(Math.sqrt(values.height * values.width) * values.contrast / 250.0);
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
  resultLabel: 'Inclusion Clarity Rating',
  grandTotalLabel: 'Diamond Clarity Rating',
  minLines: 1,
  maxLines: null,
};
