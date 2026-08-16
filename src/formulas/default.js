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
  gradeRanges: [
    { max: 1, label: 'FL' },
    { max: 2, label: 'VVS1' },
    { max: 3, label: 'VVS2' },
    { max: 4, label: 'VS1' },
    { max: 5, label: 'VS2' },
    { max: 6, label: 'SI1' },
    { max: 7, label: 'SI2' },
    { max: 8, label: 'SI3' },
    { max: 9, label: 'I1' },
    { max: 10, label: 'I2' },
    { max: 11, label: 'I3' }
  ],
  fallbackGrade: 'Reject',
  resultLabel: 'Inclusion Clarity Rating',
  grandTotalLabel: 'Diamond Clarity Rating',
  minLines: 1,
  maxLines: null,
};
