const oneCarat = { diamondHeight: 6.5, diamondWidth: 6.5 };

const typicalInclusion = {
  height: 0.1,
  width: 0.1,
  contrast: 0,
  position: 1,
};

export default [
  {
    id: 'typical-table-crystal',
    label: 'Typical table crystal (VS2)',
    description: 'One typical-contrast crystal in the table of a 1 ct stone.',
    context: { ...oneCarat },
    lines: [{ ...typicalInclusion }],
  },
  {
    id: 'high-contrast-table-crystal',
    label: 'High-contrast table crystal (SI1)',
    description: 'The same 1 ct table crystal with high contrast under overhead lighting.',
    context: { ...oneCarat },
    lines: [{ ...typicalInclusion, contrast: 1 }],
  },
  {
    id: 'low-contrast-cloud',
    label: 'Low-contrast cloud (VVS2)',
    description: 'A low-contrast cloud in the table of a 1 ct stone.',
    context: { ...oneCarat },
    lines: [{ ...typicalInclusion, contrast: -1 }],
  },
  {
    id: 'crystal-near-girdle',
    label: 'Crystal near the girdle (VS2)',
    description: 'A typical-contrast crystal touching or almost touching the girdle.',
    context: { ...oneCarat },
    lines: [{ ...typicalInclusion, position: 4 }],
  },
  {
    id: 'two-table-crystals',
    label: 'Two similar table crystals (VS2)',
    description: 'Two typical-contrast table crystals on a 1 ct stone, combined into one diamond rating.',
    context: { ...oneCarat },
    lines: [{ ...typicalInclusion }, { ...typicalInclusion }],
  },
  {
    id: 'larger-stone-same-crystal',
    label: 'Larger stone with the same crystal (VS1)',
    description: 'The same typical table crystal in a 13 × 13 mm stone, showing large-diamond scaling.',
    context: { diamondHeight: 13, diamondWidth: 13 },
    lines: [{ ...typicalInclusion }],
  },
];
