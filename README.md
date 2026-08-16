# ODCG Calculator Embed

A pure client-side calculator widget embedded into WordPress (or any website) via a single script tag. No PHP plugin, no backend, no iframe.

## Quick start (WordPress)

Paste this into a **Custom HTML** block, classic editor HTML tab, or page builder HTML widget:

```html
<div id="odcg-calculator"></div>
<script
  src="https://YOUR_HOST/odcg.min.js"
  data-target="#odcg-calculator"
  data-formula="default"
></script>
```

Replace `https://YOUR_HOST/odcg.min.js` with the URL where you host the built file from `dist/odcg.min.js`.

## Configuration

| Attribute | Required | Description |
|-----------|----------|-------------|
| `data-target` | No | CSS selector for the mount point. If omitted, a container is inserted after the script tag. |
| `data-formula` | No | Formula ID to load. Defaults to `default`. |

### Field overrides

Override individual field properties without rebuilding by adding data attributes in the form `data-field-{name}="{prop}:{value}"`:

```html
<script
  src="https://YOUR_HOST/odcg.min.js"
  data-target="#odcg-calculator"
  data-formula="default"
  data-field-amount="default:500"
  data-field-rate="label:Interest Rate (%)"
></script>
```

Supported properties: `label`, `default`, `min`, `max`, `step`.

## Development

```bash
npm install
npm run dev      # local sandbox at http://localhost:5173
npm run build    # outputs dist/odcg.min.js
npm run preview  # serve built files locally
```

- [`index.html`](index.html) — dev sandbox using the source module directly
- [`examples/embed-snippet.html`](examples/embed-snippet.html) — production-style test page

## Hosting the bundle

Host `dist/odcg.min.js` on any HTTPS origin:

- GitHub Pages
- Cloudflare Pages / R2
- AWS S3 + CloudFront
- Your WordPress site (upload to Media Library and use the direct file URL)

The script injects its own CSS — admins only need the single JS file.

## WordPress integration methods

| Method | Where | Notes |
|--------|-------|-------|
| Custom HTML block | Block editor | Paste snippet directly |
| Classic editor | Text/HTML tab | Same snippet |
| Page builder | HTML widget | Verify builder doesn't strip `<script>` tags |
| Theme | `functions.php` | Use `wp_enqueue_script` if security plugins block inline scripts |

### Troubleshooting

**Script tag stripped from post content**
Some security plugins (Wordfence, etc.) remove `<script>` tags from post content. Options:

1. Allowlist the script URL in your security plugin
2. Enqueue via theme `functions.php`:

```php
function odcg_enqueue_calculator() {
  if (is_page('calculator')) {
    wp_enqueue_script(
      'odcg-calculator',
      'https://YOUR_HOST/odcg.min.js',
      array(),
      '1.0.0',
      true
    );
  }
}
add_action('wp_enqueue_script', 'odcg_enqueue_calculator');
```

Then add only the mount div in the page content:

```html
<div id="odcg-calculator"></div>
```

**Widget appears unstyled**
The bundle injects CSS automatically. If styles are missing, check that the script loaded without errors (browser dev tools → Network/Console).

**Multiple calculators on one page**
Use unique `data-target` selectors for each instance. Each script tag initializes independently.

## Multi-line calculations

The widget supports **multiple calculation lines** within a single embed. Users can add or remove lines; each valid line shows its own result, and a **grand total** aggregates all valid line results at the bottom.

- Starts with one line; click **+ Add line** to add more
- **Remove** disables when only one line remains (configurable via `minLines`)
- Incomplete or invalid lines are excluded from the grand total
- A warning appears when some lines are incomplete: *"Total based on X of Y lines"*

## Customizing the formula

Edit or add files under [`src/formulas/`](src/formulas/) and register them in [`src/formulas/index.js`](src/formulas/index.js):

```js
export default {
  id: 'my-formula',
  title: 'My Calculator',
  fields: [
    { name: 'amount', label: 'Amount', type: 'number', min: 0, step: 0.01 },
    {
      name: 'factor',
      label: 'Description',
      type: 'select',
      valueType: 'number',
      default: '1',
      options: [
        { value: '1', label: 'Description 1' },
        { value: '2', label: 'Description 2' },
      ],
    },
  ],
  compute(values) {
    return values.amount * 2;
  },
  formatResult(value) {
    return `$${value.toFixed(2)}`;
  },
  aggregateResults(validResults) {
    // Receives numeric results from valid lines only
    return validResults.reduce((sum, n) => sum + n, 0);
  },
  formatGrandTotal(value) {
    return `$${value.toFixed(2)}`;
  },
  gradeRanges: [
    { max: 1, label: 'A' },
    { max: 2, label: 'B' },
    { max: 3, label: 'C' },
  ],
  fallbackGrade: 'D',
  resultLabel: 'Result',
  grandTotalLabel: 'Grand Total',
  minLines: 1,
  maxLines: null,
};
```

### Formula config reference

| Property | Required | Description |
|----------|----------|-------------|
| `compute(values)` | Yes | Per-line calculation; returns a number |
| `formatResult(value)` | No | Formats each line's result for display |
| `aggregateResults(validResults)` | No | Combines valid line results into grand total. Defaults to sum. |
| `formatGrandTotal(value)` | No | Formats grand total. Falls back to `formatResult`. |
| `gradeRanges` | No | Array of `{ max, label }` thresholds. First match where `value < max` wins. Displays as `number (grade)`. |
| `fallbackGrade` | No | Label when value exceeds all thresholds. Defaults to last range label. |
| `resultLabel` | No | Label for each line's result row. Default: `"Result"`. |
| `grandTotalLabel` | No | Label for grand total row. Default: `"Grand Total"`. |
| `minLines` | No | Minimum lines (remove disabled below this). Default: `1`. |
| `maxLines` | No | Maximum lines (add disabled at cap). Default: unlimited. |

### Field properties

| Property | Applies to | Description |
|----------|------------|-------------|
| `name` | all | Key passed to `compute(values)` |
| `label` | all | Display label |
| `type` | all | `number`, `text`, or `select` |
| `default` | all | Initial value |
| `min`, `max`, `step` | number | Input constraints |
| `options` | select | Array of `{ value, label }` pairs |
| `valueType` | select | Set to `'number'` to coerce selected value to a number in `compute()` |

Then rebuild: `npm run build`.

## Project structure

```
src/
├── embed.js           # Script-tag loader and bootstrap
├── calculator.js      # Validation and computation
├── formulas/          # Formula definitions
├── ui/render.js       # DOM rendering
└── styles.css         # Theme-aware scoped styles
dist/
└── odcg.min.js        # Production bundle
```

## License

MIT
