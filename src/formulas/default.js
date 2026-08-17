export default {
  id: 'default',
  title: 'Objective Diamond Clarity Grading Calculator',
  contextLabel: 'Diamond Details',
  contextFields: [
    { name: 'diamondHeight', label: 'Diamond Height (mm)', type: 'number', min: 0, step: 0.01, default: 6.5 },
    { name: 'diamondWidth', label: 'Diamond Width (mm)', type: 'number', min: 0, step: 0.01, default: 6.5 },
  ],
  fields: [
    { name: 'height', label: 'Height (μm)', type: 'number', min: 1, step: 1, default: 100 },
    { name: 'width', label: 'Width (μm)', type: 'number', min: 1, step: 1, default: 100 },
    {
      name: 'contrast',
      label: 'Contrast',
      type: 'range',
      min: -1,
      max: 1,
      step: 0.1,
      default: 0,
      options: [
        { value: '-1', label: 'Low contrast; difficult to observe with overhead lighting; e.g. a "cloud".' },
        { value: '-0.5', label: 'In between a cloud and typical crystals and feathers.' },
        { value: '0', label: 'Typical contrast of a clear or white crystal or feather as seen with overhead lighting.' },
        { value: '0.5', label: 'A more solid white or darker than usual crystal or feather between typical and high contrast.' },
        { value: '1', label: 'High contrast with overhead lighting; black on a light background or a bright reflector on a dark background.' },
      ],
    },
    {
      name: 'position',
      label: 'Position',
      type: 'select',
      valueType: 'number',
      default: '1',
      options: [
        { value: '1', label: 'Inside the table or outside the table within the length of the star facet.' },
        { value: '2', label: 'Outside the length of the star facet from the table and in the inner half of the girdle and main facets.' },
        { value: '3', label: 'In the outer half of the main and girdle facets.' },
        { value: '4', label: 'Touching or almost touching the girdle.' },
      ],
    },
  ],
  compute(values) {
    const { diamondHeight, diamondWidth, height, width, contrast, position } = values;
    
    const diamondArea = diamondHeight * diamondWidth;
    const tenPercentOfDiamondArea = diamondArea * 0.1;
    const oneCaratArea = 6.5 * 6.5;
    const inclusionArea = height * width;
    const isLargeDiamond = diamondArea > oneCaratArea;
    const shouldScale = isLargeDiamond && inclusionArea > tenPercentOfDiamondArea;
    let scaledHeight = height;
    let scaledWidth = width;
    if (shouldScale) {
      const scalingFactor = Math.sqrt(oneCaratArea) / Math.sqrt(diamondArea);
      scaledHeight = height * scalingFactor;
      scaledWidth = width * scalingFactor;
    }

    var score = Math.log2(Math.sqrt(scaledHeight * scaledWidth) / 25.0);

    score += contrast;

    switch (position) {
      case 2:
        score = score < 5 ? score - 0.25 : score;
      case 3:
        if (score < 5) score = score - 0.5;
        else if (score < 6) score = score - 0.25;
        else score = score;
      case 4:
        if (score < 5) score = score - 1.0;
        else if (score < 6) score = score - 0.5;
        else score = score;
      case 1:
      default:
        score = score;
    }

    return score < 0 ? 0 : score;
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
  lineLabel: 'Inclusion',
  grandTotalLabel: 'Diamond Clarity Rating',
  minLines: 1,
  maxLines: null,
};
