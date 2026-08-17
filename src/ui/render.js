import {
  validateFields,
  computeResult,
  formatResultDisplay,
  computeGrandTotal,
  formatGrandTotalDisplay,
  getFieldDescription,
} from '../calculator.js';

function createFieldElement(field, idSuffix) {
  const wrapper = document.createElement('div');
  wrapper.className = 'odcg-field';

  const inputId = `odcg-${field.name}-${idSuffix}`;

  const label = document.createElement('label');
  label.className = 'odcg-label';
  label.htmlFor = inputId;
  label.textContent = field.label;

  let input;

  if (field.type === 'select' && Array.isArray(field.options)) {
    input = document.createElement('select');
    for (const option of field.options) {
      const opt = document.createElement('option');
      opt.value = option.value;
      opt.textContent = option.label;
      input.appendChild(opt);
    }
  } else if (field.type === 'range') {
    input = document.createElement('input');
    input.type = 'range';
    if (field.min != null) input.min = field.min;
    if (field.max != null) input.max = field.max;
    if (field.step != null) input.step = field.step;
    input.className = 'odcg-range';

    const description = document.createElement('span');
    description.className = 'odcg-range-description';
    description.setAttribute('aria-live', 'polite');

    function updateDescription() {
      description.textContent = getFieldDescription(field, Number(input.value));
    }

    input.addEventListener('input', updateDescription);
    input.addEventListener('change', updateDescription);

    input.id = inputId;
    input.name = field.name;
    if (field.default != null) input.value = field.default;
    updateDescription();

    wrapper.appendChild(label);
    wrapper.appendChild(input);
    wrapper.appendChild(description);
    return { wrapper, input };
  } else {
    input = document.createElement('input');
    input.type = field.type === 'number' ? 'number' : 'text';
    if (field.min != null) input.min = field.min;
    if (field.max != null) input.max = field.max;
    if (field.step != null) input.step = field.step;
  }

  input.id = inputId;
  input.name = field.name;
  input.className = 'odcg-input';
  if (field.default != null) input.value = field.default;

  wrapper.appendChild(label);
  wrapper.appendChild(input);
  return { wrapper, input };
}

function collectValues(lineEl, fields) {
  const values = {};
  for (const field of fields) {
    const input = lineEl.querySelector(`[name="${field.name}"]`);
    values[field.name] = input?.value ?? '';
  }
  return values;
}

function renderLineErrors(container, errors) {
  container.innerHTML = '';
  if (errors.length === 0) {
    container.hidden = true;
    return;
  }
  container.hidden = false;
  const list = document.createElement('ul');
  list.className = 'odcg-errors';
  for (const error of errors) {
    const item = document.createElement('li');
    item.textContent = error;
    list.appendChild(item);
  }
  container.appendChild(list);
}

function formatLineLabel(formula, lineIndex) {
  const prefix = formula.lineLabel ?? 'Line';
  return `${prefix} ${lineIndex + 1}`;
}

function createLineElement(formula, lineIndex, onRemove) {
  const line = document.createElement('div');
  line.className = 'odcg-line';
  line.dataset.lineIndex = String(lineIndex);

  const header = document.createElement('div');
  header.className = 'odcg-line-header';

  const lineLabel = document.createElement('span');
  lineLabel.className = 'odcg-line-label';
  lineLabel.textContent = formatLineLabel(formula, lineIndex);

  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.className = 'odcg-line-remove';
  removeBtn.textContent = 'Remove';
  removeBtn.setAttribute('aria-label', `Remove ${formatLineLabel(formula, lineIndex)}`);
  removeBtn.addEventListener('click', () => onRemove(line));

  header.appendChild(lineLabel);
  header.appendChild(removeBtn);

  const fieldsContainer = document.createElement('div');
  fieldsContainer.className = 'odcg-fields';

  for (const field of formula.fields) {
    const { wrapper } = createFieldElement(field, String(lineIndex));
    fieldsContainer.appendChild(wrapper);
  }

  const errorsEl = document.createElement('div');
  errorsEl.className = 'odcg-line-errors';
  errorsEl.setAttribute('role', 'alert');
  errorsEl.hidden = true;

  const resultSection = document.createElement('div');
  resultSection.className = 'odcg-line-result';

  const resultLabel = document.createElement('span');
  resultLabel.className = 'odcg-result-label';
  resultLabel.textContent = formula.resultLabel ?? 'Result';

  const resultOutput = document.createElement('output');
  resultOutput.className = 'odcg-result-value';
  resultOutput.setAttribute('aria-live', 'polite');
  resultOutput.textContent = '—';

  resultSection.appendChild(resultLabel);
  resultSection.appendChild(resultOutput);

  line.appendChild(header);
  line.appendChild(fieldsContainer);
  line.appendChild(errorsEl);
  line.appendChild(resultSection);

  return { line, resultOutput, errorsEl, removeBtn };
}

function createContextSection(formula) {
  if (!formula.contextFields?.length) return null;

  const section = document.createElement('div');
  section.className = 'odcg-context';

  if (formula.contextLabel) {
    const title = document.createElement('h3');
    title.className = 'odcg-context-title';
    title.textContent = formula.contextLabel;
    section.appendChild(title);
  }

  const fieldsContainer = document.createElement('div');
  fieldsContainer.className = 'odcg-context-fields';

  for (const field of formula.contextFields) {
    const { wrapper } = createFieldElement(field, 'ctx');
    fieldsContainer.appendChild(wrapper);
  }

  const errorsEl = document.createElement('div');
  errorsEl.className = 'odcg-context-errors';
  errorsEl.setAttribute('role', 'alert');
  errorsEl.hidden = true;

  section.appendChild(fieldsContainer);
  section.appendChild(errorsEl);

  return { section, errorsEl };
}

function renumberLines(linesContainer, formula) {
  const lines = linesContainer.querySelectorAll('.odcg-line');
  lines.forEach((lineEl, index) => {
    lineEl.dataset.lineIndex = String(index);
    const label = lineEl.querySelector('.odcg-line-label');
    if (label) label.textContent = formatLineLabel(formula, index);

    const removeBtn = lineEl.querySelector('.odcg-line-remove');
    if (removeBtn) {
      removeBtn.setAttribute('aria-label', `Remove ${formatLineLabel(formula, index)}`);
    }
  });
}

export function renderWidget(container, formula) {
  container.innerHTML = '';
  container.classList.add('odcg-widget');

  const minLines = formula.minLines ?? 1;
  const maxLines = formula.maxLines ?? null;
  const grandTotalLabel = formula.grandTotalLabel ?? 'Grand Total';

  const heading = document.createElement('h2');
  heading.className = 'odcg-title';
  heading.textContent = formula.title;

  const form = document.createElement('form');
  form.className = 'odcg-form';
  form.noValidate = true;

  const context = createContextSection(formula);
  const contextSection = context?.section ?? null;
  const contextErrorsEl = context?.errorsEl ?? null;

  const linesContainer = document.createElement('div');
  linesContainer.className = 'odcg-lines';

  const addBtn = document.createElement('button');
  addBtn.type = 'button';
  addBtn.className = 'odcg-add-line';
  addBtn.textContent = '+ Add ' + formula.lineLabel ?? 'line';
  addBtn.setAttribute('aria-label', 'Add calculation ' + formula.lineLabel ?? 'line');

  const warningEl = document.createElement('div');
  warningEl.className = 'odcg-warning';
  warningEl.setAttribute('role', 'status');
  warningEl.hidden = true;

  const grandTotalSection = document.createElement('div');
  grandTotalSection.className = 'odcg-grand-total';

  const grandTotalLabelEl = document.createElement('span');
  grandTotalLabelEl.className = 'odcg-grand-total-label';
  grandTotalLabelEl.textContent = grandTotalLabel;

  const grandTotalOutput = document.createElement('output');
  grandTotalOutput.className = 'odcg-grand-total-value';
  grandTotalOutput.setAttribute('aria-live', 'polite');
  grandTotalOutput.textContent = '—';

  grandTotalSection.appendChild(grandTotalLabelEl);
  grandTotalSection.appendChild(grandTotalOutput);

  form.appendChild(linesContainer);
  form.appendChild(addBtn);
  form.appendChild(warningEl);
  form.appendChild(grandTotalSection);

  if (contextSection) {
    form.insertBefore(contextSection, linesContainer);
  }

  container.appendChild(heading);
  container.appendChild(form);

  const lineEntries = [];

  function updateControls() {
    const lineCount = lineEntries.length;
    addBtn.disabled = maxLines != null && lineCount >= maxLines;

    for (const entry of lineEntries) {
      entry.removeBtn.disabled = lineCount <= minLines;
    }
  }

  function updateAll() {
    let contextValues = {};

    if (contextSection && formula.contextFields?.length) {
      const rawContext = collectValues(contextSection, formula.contextFields);
      const { values, errors, valid } = validateFields(
        { fields: formula.contextFields },
        rawContext,
      );
      renderLineErrors(contextErrorsEl, errors);

      if (!valid) {
        for (const entry of lineEntries) {
          entry.resultOutput.textContent = '—';
          renderLineErrors(entry.errorsEl, []);
        }
        warningEl.hidden = true;
        grandTotalOutput.textContent = '—';
        return;
      }

      contextValues = values;
    }

    const validResults = [];
    let validCount = 0;

    for (const entry of lineEntries) {
      const rawValues = collectValues(entry.line, formula.fields);
      const { values, errors, valid } = validateFields(formula, rawValues);
      renderLineErrors(entry.errorsEl, errors);

      if (!valid) {
        entry.resultOutput.textContent = '—';
        continue;
      }

      const merged = { ...contextValues, ...values };
      const { result, error } = computeResult(formula, merged);
      if (error) {
        renderLineErrors(entry.errorsEl, [error]);
        entry.resultOutput.textContent = '—';
        continue;
      }

      entry.resultOutput.textContent = formatResultDisplay(formula, result);
      validResults.push(result);
      validCount += 1;
    }

    const totalLines = lineEntries.length;
    const incompleteCount = totalLines - validCount;

    if (incompleteCount > 0) {
      warningEl.hidden = false;
      warningEl.textContent = `Total based on ${validCount} of ${totalLines} lines`;
    } else {
      warningEl.hidden = true;
      warningEl.textContent = '';
    }

    if (validCount === 0) {
      grandTotalOutput.textContent = '—';
      return;
    }

    const { result, error } = computeGrandTotal(formula, validResults);
    if (error || result == null) {
      grandTotalOutput.textContent = '—';
      return;
    }

    grandTotalOutput.textContent = formatGrandTotalDisplay(formula, result);
  }

  if (contextSection) {
    contextSection.addEventListener('input', updateAll);
    contextSection.addEventListener('change', updateAll);
  }

  function removeLine(lineEl) {
    if (lineEntries.length <= minLines) return;

    const index = lineEntries.findIndex((entry) => entry.line === lineEl);
    if (index === -1) return;

    lineEntries.splice(index, 1);
    lineEl.remove();
    renumberLines(linesContainer, formula);
    updateControls();
    updateAll();
  }

  function addLine() {
    if (maxLines != null && lineEntries.length >= maxLines) return;

    const lineIndex = lineEntries.length;
    const entry = createLineElement(formula, lineIndex, removeLine);
    lineEntries.push(entry);
    linesContainer.appendChild(entry.line);

    entry.line.addEventListener('input', updateAll);
    entry.line.addEventListener('change', updateAll);

    updateControls();
    updateAll();
  }

  addBtn.addEventListener('click', addLine);

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    updateAll();
  });

  addLine();
}
