export default {
  id: 'default',
  title: 'Objective Diamond Clarity Grading Calculator',
  contextLabel: 'Diamond Details',
  contextFields: [
    { name: 'diamondHeight', label: 'Diamond Height (mm)', type: 'number', min: 0, step: 0.01, default: 6.5 },
    { name: 'diamondWidth', label: 'Diamond Width (mm)', type: 'number', min: 0, step: 0.01, default: 6.5 },
  ],
  fields: [
    { name: 'height', label: 'Height (mm)', type: 'number', min: 0.001, step: 0.001, default: .10 },
    { name: 'width', label: 'Width (mm)', type: 'number', min: 0.001, step: 0.001, default: .10 },
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
    const { diamondHeight, diamondWidth, height, width, position } = values;
    let { contrast } = values;
    
    const diamondArea = diamondHeight * diamondWidth;
    const tenPercentOfDiamondArea = diamondArea * 0.1;
    const oneCaratArea = 6.5 * 6.5;
    const inclusionArea = height * 1000 * width * 1000
    const isLargeDiamond = diamondArea > oneCaratArea;
    const shouldScale = isLargeDiamond && inclusionArea > tenPercentOfDiamondArea;
    let scaledHeight = height * 1000;
    let scaledWidth = width * 1000;
    if (shouldScale) {
      const scalingFactor = Math.sqrt(oneCaratArea) / Math.sqrt(diamondArea);
      scaledHeight = height * scalingFactor * 1000;
      scaledWidth = width * scalingFactor * 1000;
    }
    
    var score = Math.log2(Math.sqrt(scaledHeight * scaledWidth / 25.0));

    if (contrast < 0) contrast *= 2;
    
    score += contrast;

    if (score < 5 && position >= 3)
    {
      var positionAdjustment = (1.0 - (score / 6.0)) * 0.25;
      if (position == 4) positionAdjustment *= 2;
      score -= positionAdjustment;
    }
    else if (score >= 5 && score < 6 && position >= 2) // SI_1
    {
      score -= 0.25; // TODO: -0.5 in a "large diamond"
    }

    return score < 0 ? 0 : score;
  },
  
  formatResult(value) {
    return value.toFixed(2);
  },
  aggregateResults(validResults) {
    return Math.log(validResults.reduce((sum, n) => sum + Math.pow(Math.sqrt(25) * Math.pow(2, n), 2) / 25, 0)) / Math.log(4);
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
