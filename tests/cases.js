const oneCarat = { diamondHeight: 6.5, diamondWidth: 6.5 };

export const cases = [
  {
    name: 'default 100x100 table',
    values: { ...oneCarat, height: 100, width: 100, contrast: 0, position: 1 },
    expected: { score: 2, grade: 'VVS2' },
  },
  {
    name: 'contrast +1 on default inclusion',
    values: { ...oneCarat, height: 100, width: 100, contrast: 1, position: 1 },
    expected: { score: 3, grade: 'VS1' },
  },
  {
    name: 'contrast -1 doubles to -2',
    values: { ...oneCarat, height: 100, width: 100, contrast: -1, position: 1 },
    expected: { score: 0, grade: 'FL' },
  },
  {
    name: 'contrast -0.5 doubles to -1',
    values: { ...oneCarat, height: 100, width: 100, contrast: -0.5, position: 1 },
    expected: { score: 1, grade: 'VVS1' },
  },
  {
    name: 'position 3 on score-2 inclusion',
    values: { ...oneCarat, height: 100, width: 100, contrast: 0, position: 3 },
    expected: { score: 1.83, grade: 'VVS1' },
  },
  {
    name: 'position 4 on score-2 inclusion',
    values: { ...oneCarat, height: 100, width: 100, contrast: 0, position: 4 },
    expected: { score: 1.67, grade: 'VVS1' },
  },
  {
    name: 'SI1 band position 2 subtracts 0.25',
    values: { ...oneCarat, height: 800, width: 800, contrast: 0, position: 2 },
    expected: { score: 4.75, grade: 'VS2' },
  },
  {
    name: 'large-diamond scaling 13x13 with 100x100',
    values: { diamondHeight: 13, diamondWidth: 13, height: 100, width: 100, contrast: 0, position: 1 },
    expected: { score: 1, grade: 'VVS1' },
  },
  {
    name: 'floor tiny inclusion to 0',
    values: { ...oneCarat, height: 1, width: 1, contrast: 0, position: 1 },
    expected: { score: 0, grade: 'FL' },
  },
];

export const grandTotalCases = [
  {
    name: 'two default inclusions',
    lines: [
      { ...oneCarat, height: 100, width: 100, contrast: 0, position: 1 },
      { ...oneCarat, height: 100, width: 100, contrast: 0, position: 1 },
    ],
    expected: { score: 4, grade: 'VS2' },
  },
];
