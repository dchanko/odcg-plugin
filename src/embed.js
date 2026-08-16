import styles from './styles.css?inline';
import { getFormula } from './formulas/index.js';
import { applyFieldOverrides, parseFieldOverrides } from './calculator.js';
import { renderWidget } from './ui/render.js';

const INIT_ATTR = 'data-odcg-init';
const STYLES_ID = 'odcg-styles';

function injectStyles() {
  if (document.getElementById(STYLES_ID)) return;

  const style = document.createElement('style');
  style.id = STYLES_ID;
  style.textContent = styles;
  document.head.appendChild(style);
}

function resolveMountPoint(script) {
  const targetSelector = script.dataset.target;

  if (targetSelector) {
    const target = document.querySelector(targetSelector);
    if (target) return target;
    console.warn(`[odcg] Target "${targetSelector}" not found. Inserting after script tag.`);
  }

  const container = document.createElement('div');
  container.className = 'odcg-mount';
  script.insertAdjacentElement('afterend', container);
  return container;
}

function initFromScript(script) {
  if (!script || script.getAttribute(INIT_ATTR) === 'true') return;

  const mountPoint = resolveMountPoint(script);
  if (mountPoint.getAttribute(INIT_ATTR) === 'true') {
    script.setAttribute(INIT_ATTR, 'true');
    return;
  }

  injectStyles();

  const formulaId = script.dataset.formula || 'default';
  const overrides = parseFieldOverrides(script.dataset);
  const formula = applyFieldOverrides(getFormula(formulaId), overrides);

  renderWidget(mountPoint, formula);

  mountPoint.setAttribute(INIT_ATTR, 'true');
  script.setAttribute(INIT_ATTR, 'true');
}

const executingScript = document.currentScript;

function initAll() {
  if (
    executingScript &&
    (executingScript.src.includes('embed') || executingScript.src.includes('odcg'))
  ) {
    initFromScript(executingScript);
    return;
  }

  const scripts = document.querySelectorAll('script[data-formula]:not([data-odcg-init])');
  scripts.forEach(initFromScript);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAll);
} else {
  initAll();
}
