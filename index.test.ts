import { suite } from 'uvu';
import * as assert from 'uvu/assert';

import {
  hasAccessibleDescription,
  hasAccessibleName,
  hasAttribute,
  hasClass,
  hasDescription,
  hasDisplayValue,
  hasElement,
  hasErrorMessage,
  hasFormValues,
  hasHTMLContent,
  hasStyle,
  hasTextContent,
  hasValue,
  isChecked,
  isDisabled,
  isEmpty,
  isEmptyDomElement,
  isInDocument,
  isInvalid,
  isRequired,
  isValid,
  isVisible
} from './index';

type ElementContext = { elements: HTMLElement[] };

const testIsChecked = suite<ElementContext>('isChecked');

testIsChecked.before((context) => {
  const div = document.createElement('div');

  div.innerHTML = `
    <input type="checkbox" name="checkbox-checked" value="true" checked />
    <input type="radio" name="radio-checked" value="true" checked="checked" />
    <input type="checkbox" name="checkbox-unchecked" value="false" />
    <input type="radio" name="radio-unchecked" value="false" checked="false" />
    <input type="text" name="text" value="false" />
    <div></div>`;

  context.elements = Array.from(div.querySelectorAll('*'));
});

testIsChecked('will get the correct results', ({ elements }) =>
  elements.forEach((elem) => {
    const result = elem.getAttribute('value') === 'true';
    const name = elem.getAttribute('name') ?? 'non-checkable element';
    const message = `wrong value for ${name}`;

    assert.is(isChecked(elem), result, message);
  })
);

testIsChecked.run();

const testIsDisabled = suite<ElementContext>('isDisabled');

testIsDisabled.before((context) => {
  const div = document.createElement('div');

  div.innerHTML = `
    <input type="text" disabled name="disabled-text" value="true" />
    <div data-name="disabled-div" aria-disabled="true" data-value="true">
      <button data-value="true">indirectly disabled button</button>
    </div>
    <textarea name="enabled-select">false</textarea>`;

  context.elements = Array.from(
    div.querySelectorAll('input, div, button, textarea')
  );
});

testIsDisabled('will return the correct results', ({ elements }) =>
  elements.forEach((elem) => {
    const result =
      (elem.getAttribute('value') ??
        elem.innerHTML ??
        elem.getAttribute('data-value') ??
        'false') !== 'false';
    const name = elem.getAttribute('name') ?? elem.getAttribute('data-name');
    const message = `wrong value for ${name}`;

    assert.is(isDisabled(elem), result, message);
  })
);

testIsDisabled.run();

const testIsEmptyDomElement = suite<ElementContext>('isEmptyDomElement');

testIsEmptyDomElement.before((context) => {
  const div = document.createElement('div');

  div.innerHTML = `<br />
    <span><!-- comment only --></span>
    <div data-value="false">this one contains an element <i></i> but this i-tag doesn't</div>`;

  context.elements = Array.from(div.querySelectorAll('*'));
});

testIsEmptyDomElement('will return the correct results', ({ elements }) =>
  elements.forEach((elem: HTMLElement) => {
    const result = elem.getAttribute('data-value') !== 'false';
    const name = elem.nodeName.toLowerCase();
    const message = `wrong value for ${name}`;

    assert.is(isEmptyDomElement(elem), result, message);
  })
);

testIsEmptyDomElement.run();

const testIsEmpty = suite<ElementContext>('isEmpty');

testIsEmpty.before((context) => {
  const div = document.createElement('div');

  div.innerHTML = `<br />
    <span data-value="false"><!-- comment only --></span>
    <div data-value="false">this one contains an element <i></i> but this i-tag doesn't </div>`;

  context.elements = Array.from(div.querySelectorAll('*'));
});

testIsEmpty('will return the correct results', ({ elements }) =>
  elements.forEach((elem) => {
    const result = elem.getAttribute('data-value') !== 'false';
    const name = elem.nodeName.toLowerCase();
    const message = `wrong value for ${name}`;

    assert.is(isEmpty(elem), result, message);
  })
);

testIsEmpty.run();

const testIsInDocument = suite<ElementContext>('isInDocument');

testIsInDocument.before((context) => {
  context.elements = [
    document.createElement('div'),
    Object.assign(document.createElement('div'), { innerHTML: 'false' })
  ];
  document.body.appendChild(context.elements[0]);
});

testIsInDocument.after(({ elements }) => {
  document.body.removeChild(elements[0]);
});

testIsInDocument('will return the correct results', ({ elements }) =>
  elements.forEach((elem, index) => {
    const result = (elem ?? { innerHTML: 'false' }).innerHTML !== 'false';
    const state = ['unmounted', 'mounted'][index];
    const message = `wrong value for ${state} element`;

    assert.is(isInDocument(elem), result, message);
  })
);

testIsInDocument('will return the correct results for no element', () =>
  assert.is(isInDocument(null), false, 'true for no element')
);

testIsInDocument(
  'will return the correct results for a different document',
  () => {
    const doc = new DOMParser().parseFromString(
      '<!doctype html><html><head><title></title></head><body><div>Element</div></body></html>',
      'text/html'
    );
    const elem = doc.querySelector('div');
    assert.instance(elem, HTMLDivElement, 'not a div element');
    assert.is(isInDocument(elem, doc), true, 'is not in document');
    assert.is(isInDocument(elem), false, 'is in wrong document');
    assert.is(isInDocument(null, doc), false, 'non-element in document');
  }
);

testIsInDocument.run();

const testIsInvalid = suite<ElementContext>('isInvalid');

testIsInvalid.before((context) => {
  const div = document.createElement('div');
  div.innerHTML = `<form>
    <input required value="" />
    <input value="true" />
    <button aria-invalid="true">true</button>
  </form>`;
  context.elements = Array.from(div.querySelectorAll('input, button'));
});

testIsInvalid('will return the correct results', ({ elements }) =>
  elements.forEach((elem, index) => {
    const result = index !== 1;
    const name = ['invalid input', 'valid input', 'invalid button'][index];
    const message = `wrong value for ${name}`;

    assert.is(isInvalid(elem), result, message);
  })
);

testIsInvalid.run();

const testIsValid = suite<ElementContext>('isValid');

testIsValid.before((context) => {
  const div = document.createElement('div');
  div.innerHTML = `<form>
    <input required pattern="\w+" value="" />
    <input value="true" />
    <button aria-invalid="true">true</button>
  </form>`;

  context.elements = Array.from(div.querySelectorAll('input, button'));
});

testIsValid('will return the correct results', ({ elements }) =>
  elements.forEach((elem, index) => {
    const result = index !== 0;
    const name = ['invalid input', 'valid input', 'invalid button'][index];
    const message = `wrong value for ${name}`;

    assert.is(isValid(elem), result, message);
  })
);

testIsValid.run();

const testIsRequired = suite<ElementContext>('isRequired');

testIsRequired.before((context) => {
  const div = document.createElement('div');
  div.innerHTML = `<br />
    <input type="hidden" />
    <input type="color" />
    <input type="range" />
    <input type="submit" />
    <input type="image" />
    <input type="reset" />
    <div role="tree"></tree>
    <div role="other" aria-required="true"></div>
    <textarea></textarea>
    <select required></select>
    <input type="text" required />
    <div role="combobox" aria-required="true"`;

  context.elements = Array.from(div.querySelectorAll('*'));
});

testIsRequired('will return the correct results', ({ elements }) =>
  elements.forEach((elem, index) => {
    const result = index > 9;
    const state = result ? 'required' : 'not required';
    const name = `${state} ${elem.nodeName.toLowerCase()}`;
    const message = `wrong value for ${name}`;

    assert.is(isRequired(elem), result, message);
  })
);

testIsRequired.run();

const testIsVisible = suite<ElementContext>('isVisible');

testIsVisible.before((context) => {
  const div = document.createElement('div');

  div.innerHTML = `<style>.display-none{display:none;}.zero-size{display:block;width:0;}</style>
    <div hidden data-name="hidden attribute"></div>
    <div class="display-none" data-name="display none in CSS class">you don't see me</div>
    <div style="visibility: hidden;" data-name="visibility hidden in style attribute">invisible</div>
    <div class="zero-size" data-name="zero size in CSS class">zero size</div>
    <div style="opacity: 0;" data-name="hidden by zero opacity in style">see-through</div>
    <span style="display: none">
      <div data-name="invisible because of parent"></div>
    </span>
    <div class="zero-size" style="display: inline" data-name="visible because inline even though zero size" data-visible="true">Now you see me</div>
    <div data-name="visible because default style" data-visible="true">visible</div>`;

  document.body.appendChild(div);

  context.elements = Array.from(div.querySelectorAll('div'));

  context.elements.push(
    ((elem) => {
      elem.setAttribute('data-name', 'invisible because not in DOM');
      return elem;
    })(document.createElement('div'))
  );
});

testIsVisible('will return the correct results', ({ elements }) =>
  elements.forEach((elem) => {
    const result = elem.hasAttribute('data-visible');
    const name = elem.getAttribute('data-name');
    const message = `wrong value for ${name}`;
    assert.is(isVisible(elem), result, message);
  })
);

testIsVisible.run();

const testHasAccessibleDescription = suite<ElementContext>(
  'hasAccessibleDescription'
);

testHasAccessibleDescription.before((context) => {
  const div = document.createElement('div');
  document.body.appendChild(div);

  div.innerHTML = `
    <label for="a1">accessible name</label>
    <input id="a1" aria-describedby="hint" />
    <span id="hint">accessible description</span>
  `;

  context.elements = Array.from(div.querySelectorAll('*'));
  context.elements.push(div);
});

testHasAccessibleDescription.after(({ elements }) => {
  document.body.removeChild(elements[3]);
});

[undefined, 'accessible description', /accessible/].forEach((matcher, index) =>
  testHasAccessibleDescription(
    'will return the correct results',
    ({ elements }) => {
      const input = elements[1];
      const message = [
        'accessible description not longer than 3 characters',
        'accessible description does not match string',
        'accessible description does not match regex'
      ][index];
      assert.is(hasAccessibleDescription(input, matcher), true, message);
    }
  )
);

testHasAccessibleDescription(
  'will return the correct value on element without description',
  ({ elements }) => {
    const label = elements[0];
    assert.is(
      hasAccessibleDescription(label),
      false,
      "accessible description on element that shouldn't have any"
    );
  }
);

testHasAccessibleDescription(
  'will return the correct results for non-element',
  () => {
    assert.is(
      hasAccessibleDescription(null),
      false,
      'accessible description true on non-element?'
    );
  }
);

testHasAccessibleDescription.run();

const testHasAccessibleName = suite<ElementContext>('hasAccessibleName');

testHasAccessibleName.before((context) => {
  const div = document.createElement('div');
  document.body.appendChild(div);

  div.innerHTML = `
    <label for="a1">accessible name</label>
    <input id="a1" />
    <p aria-labelledby="hint">test</p>
    <span id="hint">accessible name</span>
    <p aria-label="accessible name">test</p>
  `;

  context.elements = Array.from(div.querySelectorAll('*'));
  context.elements.push(div);
});

testHasAccessibleName.after(({ elements }) => {
  document.body.removeChild(elements[5]);
});

testHasAccessibleName(
  'will return the correct result for input with label',
  ({ elements }) => {
    const input = elements[1];
    assert.is(
      hasAccessibleName(input, 'accessible name'),
      true,
      'did not find label'
    );
  }
);

testHasAccessibleName(
  'will return the correct value for aria-labelledby',
  ({ elements }) => {
    const p = elements[2];
    assert.is(
      hasAccessibleName(p, /accessible/),
      true,
      'aria-labelledby attribute mismatch'
    );
  }
);

testHasAccessibleName(
  'will return the correct value for aria-label',
  ({ elements }) => {
    const p = elements[4];
    assert.is(
      hasAccessibleName(p, /accessible/),
      true,
      'aria-label attribute mismatch'
    );
  }
);

testHasAccessibleName(
  'will return the correct value for an element without accessible name',
  ({ elements }) => {
    const span = elements[3];
    assert.is(
      hasAccessibleName(span),
      false,
      'accessible name found where there is none'
    );
  }
);

testHasAccessibleName('will return the correct value for a non-element', () => {
  assert.is(
    hasAccessibleName(null),
    false,
    'accessible name found for non-element'
  );
});

testHasAccessibleName.run();

const testHasAttribute = suite<ElementContext>('hasAttribute');

testHasAttribute.before((context) => {
  context.elements = [document.createElement('div')];
  Object.entries({
    'aria-label': 'accessible name'
  }).forEach(([name, value]) => context.elements[0].setAttribute(name, value));
});

testHasAttribute('will return true without expectation', ({ elements }) => {
  assert.is(
    hasAttribute(elements[0], 'aria-label'),
    true,
    'wrong value for simple has check'
  );
});

testHasAttribute('will return false without expectation', ({ elements }) => {
  assert.is(
    hasAttribute(elements[0], 'aria-labelledby'),
    false,
    'wrong value for simple has check'
  );
});

testHasAttribute('will return true with string expectation', ({ elements }) => {
  assert.is(
    hasAttribute(elements[0], 'aria-label', 'accessible name'),
    true,
    'wrong value for simple has check'
  );
});

testHasAttribute(
  'will return false with string expectation',
  ({ elements }) => {
    assert.is(
      hasAttribute(elements[0], 'aria-label', 'accessible-name'),
      false,
      'wrong value for simple has check'
    );
  }
);

testHasAttribute('will return true with regex expectation', ({ elements }) => {
  assert.is(
    hasAttribute(elements[0], 'aria-label', /^accessible\b/),
    true,
    'wrong value for simple has check'
  );
});

testHasAttribute('will return false with regex expectation', ({ elements }) => {
  assert.is(
    hasAttribute(elements[0], 'aria-label', /^accessible$/),
    false,
    'wrong value for simple has check'
  );
});

testHasAttribute('will return false for non-element', () => {
  assert.is(
    hasAttribute(null, 'aria-label'),
    false,
    'wrong value for simple has check'
  );
});

testHasAttribute.run();

const testHasClass =
  suite<{ elements: (HTMLElement | SVGElement)[] }>('hasClass');

testHasClass.before((context) => {
  context.elements = [
    Object.assign(document.createElement('div'), {
      className: 'test test2 test-3'
    }),
    Object.assign(
      document.createElementNS('http://www.w3.org/2000/svg', 'path'),
      { className: 'test2' }
    )
  ];
});

testHasClass('will return true for string', ({ elements }) => {
  assert.is(
    hasClass(elements[0], 'test2'),
    true,
    'wrong value for string based class check'
  );
});

testHasClass('will return false for string', ({ elements }) => {
  assert.is(
    hasClass(elements[0], 'test3'),
    false,
    'wrong value for string based class check'
  );
});

testHasClass('will return true for regex', ({ elements }) => {
  assert.is(
    hasClass(elements[0], /test-\d$/),
    true,
    'wrong value for regex based class check'
  );
});

testHasClass('will return true for svg element', ({ elements }) => {
  assert.is(
    hasClass(elements[1], /test-\d$/),
    true,
    'wrong value for regex based class check'
  );
});

testHasClass('will return false for regex', ({ elements }) => {
  assert.is(
    hasClass(elements[0], /test-?\D$/),
    false,
    'wrong value for regex based class check'
  );
});

testHasClass('will return false for non-element', () => {
  testHasClass('will return true for regex', () => {
    assert.is(
      hasClass(null, 'none'),
      false,
      'wrong value for string based class check'
    );
  });
});

testHasClass.run();

const testHasDescription = suite<ElementContext>('hasDescription');

testHasDescription.before((context) => {
  const div = document.createElement('div');
  document.body.appendChild(div);

  div.innerHTML = `
    <div aria-describedby="test1 test2"></div>
    <span id="test1">first part</span>
    <span id="test2">second part</span>
    <div aria-describedby="test3"></div>
    <div></div>
  `;

  context.elements = Array.from(div.querySelectorAll('div'));
  context.elements.push(div);
});

testHasDescription.after(({ elements }) => {
  document.body.removeChild(elements[elements.length - 1]);
});

testHasDescription('will return true for string', ({ elements }) => {
  assert.is(
    hasDescription(elements[0], 'first part second part'),
    true,
    'no string match'
  );
});

testHasDescription('will return false for string', ({ elements }) => {
  assert.is(
    hasDescription(elements[0], 'third part'),
    false,
    'wrong string match'
  );
});

testHasDescription('will return true for regex', ({ elements }) => {
  assert.is(hasDescription(elements[0], /\w+ part/), true, 'no regexp match');
});

testHasDescription('will return false for regex', ({ elements }) => {
  assert.is(
    hasDescription(elements[0], /\w+ Part/),
    false,
    'wrong regexp match'
  );
});

testHasDescription(
  'will return false for missing description element',
  ({ elements }) => {
    assert.is(
      hasDescription(elements[1], /\S+/),
      false,
      'wrong description match'
    );
  }
);

testHasDescription(
  'will return false for missing aria-describedby attribute',
  ({ elements }) => {
    assert.is(
      hasDescription(elements[2], /\S+/),
      false,
      'match for no element'
    );
  }
);

testHasDescription('will return false for no dom-element', ({ elements }) => {
  assert.is(hasDescription(null, ''), false, 'match for no element');
});

testHasDescription.run();

const testHasDisplayValue = suite<ElementContext>('hasDisplayValue');

testHasDisplayValue.before((context) => {
  const div = document.createElement('div');

  div.innerHTML = `
    <input type="text" value="this is one value" />
    <select>
      <option>first value</option>
      <option selected>last value</option>
    </select>
    <select multiple>
      <option selected>one</option>
      <option selected>two</option>
      <option>three</option>
      <option selected>four</option>
    </select>
  `;

  context.elements = Array.from(div.querySelectorAll('input, select'));
});

testHasDisplayValue('returns true for input / string', ({ elements }) => {
  const input = elements[0];

  assert.is(
    hasDisplayValue(input, 'this is one value'),
    true,
    'no match for input / string'
  );
});

testHasDisplayValue('returns false for input / string', ({ elements }) => {
  const input = elements[0];

  assert.is(
    hasDisplayValue(input, 'this is no value'),
    false,
    'no match for input / string'
  );
});

testHasDisplayValue('returns true for input / regex', ({ elements }) => {
  const input = elements[0];

  assert.is(
    hasDisplayValue(input, /this is one value/),
    true,
    'no match for input / regex'
  );
});

testHasDisplayValue('returns false for input / regex', ({ elements }) => {
  const input = elements[0];

  assert.is(
    hasDisplayValue(input, /this is$/),
    false,
    'no match for input / regex'
  );
});

testHasDisplayValue('returns true for select / string', ({ elements }) => {
  const select = elements[1];

  assert.is(
    hasDisplayValue(select, 'last value'),
    true,
    'no match for input / string'
  );
});

testHasDisplayValue('returns false for select / string', ({ elements }) => {
  const select = elements[1];

  assert.is(
    hasDisplayValue(select, 'first value'),
    false,
    'no match for input / string'
  );
});

testHasDisplayValue('returns true for select / regex', ({ elements }) => {
  const select = elements[1];

  assert.is(
    hasDisplayValue(select, /last/),
    true,
    'no match for input / regex'
  );
});

testHasDisplayValue('returns false for select / regex', ({ elements }) => {
  const select = elements[1];

  assert.is(
    hasDisplayValue(select, /first/),
    false,
    'no match for input / regex'
  );
});

testHasDisplayValue('returns true for multi select', ({ elements }) => {
  const select = elements[2];

  assert.is(
    hasDisplayValue(select, ['one', /two/, 'four']),
    true,
    'no match for input / string'
  );
});

testHasDisplayValue('returns false for multi select', ({ elements }) => {
  const select = elements[2];

  assert.is(
    hasDisplayValue(select, ['one', /three/, 'four']),
    false,
    'no match for input / string'
  );
});

testHasDisplayValue('returns false for non-element', () => {
  assert.is(
    hasDisplayValue(null, 'no'),
    false,
    'wrongly matched for no element'
  );
});

testHasDisplayValue.run();

const testHasElement = suite<ElementContext>('hasElement');

testHasElement.before((context) => {
  const div = document.createElement('div');
  div.innerHTML = `
    <div id="ancestor">
      <div id="descendant"></div>
    </div>
    <div id="orphan"></div>`;

  context.elements = Array.from(div.querySelectorAll('div'));
});

testHasElement('returns true for correct order', ({ elements }) => {
  assert.is(
    hasElement(elements[0], elements[1]),
    true,
    'did not find descendant'
  );
});

testHasElement('returns false for wrong order', ({ elements }) => {
  assert.is(
    hasElement(elements[1], elements[0]),
    false,
    'did wrongly find ancestor as descendant'
  );
});

testHasElement('returns false for orphan', ({ elements }) => {
  assert.is(
    hasElement(elements[0], elements[2]),
    false,
    'did wrongly find orphan'
  );
});

testHasElement('returns false for non-element ancestor', ({ elements }) => {
  assert.is(
    hasElement(null, elements[1]),
    false,
    'did wrongly find descendant in non-element ancestor'
  );
});

testHasElement('returns false for non-element descendant', ({ elements }) => {
  assert.is(
    hasElement(elements[0], null),
    false,
    'did wrongly find non-element descendant'
  );
});

testHasElement.run();

const testHasErrorMessage = suite<ElementContext>('hasDescription');

testHasErrorMessage.before((context) => {
  const div = document.createElement('div');
  document.body.appendChild(div);

  div.innerHTML = `
    <input aria-errormessage="msg1 msg2" aria-invalid="true" />
    <span id="msg1">first part</span>
    <span id="msg2">second part</span>
    <input aria-errormessage="msg3" aria-invalid="true" />
    <input aria-errormessage="msg1" />
    <input aria-invalid="true" />
    <input aria-errormessage="empty" aria-invalid="true />
    <br id="empty" />
  `;

  context.elements = Array.from(div.querySelectorAll('input'));
  context.elements.push(div);
});

testHasErrorMessage.after(({ elements }) => {
  document.body.removeChild(elements[elements.length - 1]);
});

testHasErrorMessage('will return true for string', ({ elements }) => {
  assert.is(
    hasErrorMessage(elements[0], 'first part second part'),
    true,
    'no string match'
  );
});

testHasErrorMessage('will return false for string', ({ elements }) => {
  assert.is(
    hasErrorMessage(elements[0], 'third part'),
    false,
    'wrong string match'
  );
});

testHasErrorMessage('will return true for regex', ({ elements }) => {
  assert.is(hasErrorMessage(elements[0], /\w+ part/), true, 'no regexp match');
});

testHasErrorMessage('will return false for regex', ({ elements }) => {
  assert.is(
    hasErrorMessage(elements[0], /\w+ Part/),
    false,
    'wrong regexp match'
  );
});

testHasErrorMessage(
  'will return false for empty description element',
  ({ elements }) => {
    assert.is(
      hasErrorMessage(elements[4], /\S+/),
      false,
      'wrong description match'
    );
  }
);

testHasErrorMessage(
  'will return false for missing description element',
  ({ elements }) => {
    assert.is(
      hasErrorMessage(elements[1], /\S+/),
      false,
      'wrong description match'
    );
  }
);

testHasErrorMessage(
  'will return false for non-invalid elements',
  ({ elements }) => {
    assert.is(
      hasErrorMessage(elements[2], /\S+/),
      false,
      'match for non-invalid element'
    );
  }
);

testHasErrorMessage(
  'will return false for elements without aria-errormessage',
  ({ elements }) => {
    assert.is(
      hasErrorMessage(elements[3], /\S+/),
      false,
      'match for element w/o attribute'
    );
  }
);

testHasErrorMessage('will return false for no dom-element', () => {
  assert.is(hasErrorMessage(null, ''), false, 'match for no element');
});

testHasErrorMessage.run();

const testHasFormValues = suite<
  ElementContext & { expectedValues: Record<string, any> }
>('hasFormValues');

testHasFormValues.before((context) => {
  const div = document.createElement('div');

  div.innerHTML = `
    <form>
      <input name="singleCheckbox" type="checkbox" checked value="irrelevant" />
      <input name="multipleCheckboxes" type="checkbox" checked value="one" />
      <input name="multipleCheckboxes" type="checkbox" checked value="two" />
      <input name="multipleCheckboxes" type="checkbox" value="three" />
      <input name="multipleCheckboxes" type="checkbox" checked value="four" />
      <input name="radioButton" type="radio" value="one" />
      <input name="radioButton" type="radio" checked value="two" />
      <input name="radioButton" type="radio" value="three" />
      <input name="numberInput" type="number" value="7" />
      <input name="textInput" type="text" value="test" />
      <select name="singleSelect">
        <option value="one">one</option>
        <option value="two">two</option>
        <option value="three" selected>three</option>
      </select>
      <select multiple name="multiSelect">
        <option value="one">one</option>
        <option value="two">two</option>
        <option value="three" selected>three</option>
        <option value="four" selected>four</option>
      </select>
      <textarea name="textarea">test</textarea>
    </form>
  `;

  context.elements = Array.from(div.querySelectorAll('form'));
  context.expectedValues = {
    singleCheckbox: true,
    multipleCheckboxes: ['one', 'two', 'four'],
    radioButton: 'two',
    numberInput: 7,
    textInput: 'test',
    singleSelect: 'three',
    multiSelect: ['three', 'four'],
    textarea: 'test'
  };
});

testHasFormValues(
  'will return true for correct values',
  ({ elements, expectedValues }) =>
    assert.is(hasFormValues(elements[0], expectedValues), true, 'no match')
);

testHasFormValues(
  'will return true for partial expectations',
  ({ elements, expectedValues }) =>
    Object.entries(expectedValues).forEach(([name, value]) =>
      assert.is(
        hasFormValues(elements[0], { [name]: value }),
        true,
        `no match for ${name}=${value}`
      )
    )
);

testHasFormValues(
  'will return false for one miss',
  ({ elements, expectedValues }) =>
    assert.is(
      hasFormValues(elements[0], { ...expectedValues, textarea: 'nope' }),
      false,
      'wrong match for false data'
    )
);

testHasFormValues('will return false for non-form elements', () =>
  assert.is(hasFormValues(null, {}), false, 'true for non-element')
);

testHasFormValues.run();

const testHasStyle = suite<ElementContext>('hasStyle');

testHasStyle.before((context) => {
  const div = document.createElement('div');
  document.body.appendChild(div);
  div.innerHTML = `
    <style>
      div { color: white; }      
      .inline { display: inline; }
      .inline::before {
        content: 'Hello, World';
      }
    </style>
    <div class="inline" style="position: absolute;"></div>
  `;

  context.elements = Array.from(div.querySelectorAll('div'));
  context.elements.push(div);
});

testHasStyle.after(({ elements }) => {
  document.body.removeChild(elements[1]);
});

testHasStyle(
  'will return true for an object with all values',
  ({ elements }) => {
    assert.is(
      hasStyle(elements[0], {
        color: 'white',
        display: 'inline',
        position: 'absolute'
      }),
      true,
      'style mismatch'
    );
  }
);

testHasStyle(
  'will return true for an object with partial values',
  ({ elements }) => {
    assert.is(
      hasStyle(elements[0], {
        color: 'white',
        position: 'absolute'
      }),
      true,
      'style mismatch'
    );
  }
);

testHasStyle(
  'will return true for a string with all values',
  ({ elements }) => {
    assert.is(
      hasStyle(
        elements[0],
        'color: white; display: inline; position: absolute'
      ),
      true,
      'style mismatch'
    );
  }
);

testHasStyle(
  'will return true for a pseudo element (not supported by jsdom)',
  ({ elements }) => {
    assert.is(
      hasStyle([elements[0], ''], { color: 'white' }),
      true,
      'style mismatch'
    );
  }
);

testHasStyle(
  'will return false for an object with wrong values',
  ({ elements }) => {
    assert.is(
      hasStyle(elements[0], {
        color: /black/,
        position: 'absolute'
      }),
      false,
      'wrong style match'
    );
  }
);

testHasStyle(
  'will return true for a string with all values',
  ({ elements }) => {
    assert.is(
      hasStyle(
        elements[0],
        'color: black; display: inline; position: absolute;'
      ),
      false,
      'wrong style match'
    );
  }
);

testHasStyle(
  'will return true for a non-css attribute value',
  ({ elements }) => {
    assert.is(
      hasStyle(elements[0], 'colour: black;'),
      false,
      'wrong style match'
    );
  }
);

testHasStyle('will return false for a non-element', () => {
  assert.is(hasStyle(null, 'color: black;'), false, 'wrong non-element match');
});

testHasStyle.run();

const testHasHTMLContent = suite<ElementContext>('hasHTMLContent');

testHasHTMLContent.before((context) => {
  const div = document.createElement('div');
  document.body.appendChild(div);

  div.innerHTML = '<span>Hello, World</span><p>🙂</p>';

  context.elements = [div];
});

testHasHTMLContent.after(({ elements }) => {
  document.body.removeChild(elements[0]);
});

testHasHTMLContent('returns true for the correct content', ({ elements }) => {
  assert.is(
    hasHTMLContent(elements[0], '<span>Hello, World</span><p>🙂</p>'),
    true,
    'html mismatch'
  );
});

testHasHTMLContent('returns false for incorrect content', ({ elements }) => {
  assert.is(
    hasHTMLContent(elements[0], '<span>Hello, World</span><p>🥲</p>'),
    false,
    'wrong html match'
  );
});

testHasHTMLContent('returns true for non-element', ({ elements }) => {
  assert.is(
    hasHTMLContent(null, '<span>Hello, World</span><p>🙂</p>'),
    false,
    'wrong match for non-element'
  );
});

testHasHTMLContent.run();

const testHasTextContent = suite<ElementContext>('hasTextContent');

testHasTextContent.before((context) => {
  const div = document.createElement('div');
  document.body.appendChild(div);

  div.innerHTML = '<span>Hello, World</span><p>🙂</p>';

  context.elements = [div];
});

testHasTextContent.after(({ elements }) => {
  document.body.removeChild(elements[0]);
});

testHasTextContent('will return true for correct content', ({ elements }) => {
  assert.is(hasTextContent(elements[0], 'Hello, World🙂'), true, 'no match');
});

testHasTextContent(
  'will return false for incorrect content',
  ({ elements }) => {
    assert.is(hasTextContent(elements[0], "Hullo, Guv'🙂"), false, 'no match');
  }
);

testHasTextContent('will return false for non-element', ({ elements }) => {
  assert.is(hasTextContent(null, 'Hello, World🙂'), false, 'no match');
});

testHasTextContent.run();

const testHasValue = suite<ElementContext>('hasValue');

testHasValue.before((context) => {
  const div = document.createElement('div');
  div.innerHTML = `
    <input type="text" value="text" />
    <input type="number" value="5" />
    <select>
      <option value="first">First Value</option>
      <option value="second" selected>Second Value</option>
      <option value="third">Third Value</option>
    </select>
    <select multiple>
      <option value="first">First Value</option>
      <option value="second" selected>Second Value</option>
      <option value="third" selected>Third Value</option>
    </select>
    <select multiple>
      <option value="first">First Value</option>
      <option value="second">Second Value</option>
      <option value="third" selected>Third Value</option>
    </select>
    <textarea>test</textarea>
  `;

  context.elements = Array.from(div.querySelectorAll('input, select, textarea'));
});

testHasValue('will return the correct value for text input', ({ elements }) => {
  assert.is(hasValue(elements[0], 'text'), true, 'value mismatch');
});

testHasValue('will return the correct value for number input', ({ elements }) => {
  assert.is(hasValue(elements[1], 5), true, 'value mismatch');
});

testHasValue('will return the correct value for select', ({ elements }) => {
  assert.is(hasValue(elements[2], 'second'), true, 'value mismatch');
});

testHasValue('will return the correct value for multi select', ({ elements }) => {
  assert.is(hasValue(elements[3], ['second', 'third']), true, 'value mismatch');
});

testHasValue('will return the correct single value for multi select', ({ elements }) => {
  assert.is(hasValue(elements[4], 'third'), true, 'value mismatch');
});

testHasValue('will return the correct value for textarea', ({ elements }) => {
  assert.is(hasValue(elements[5], 'test'), true, 'value mismatch');
});

testHasValue('will return false for wrong text', ({ elements }) => {
  assert.is(hasValue(elements[0], 'test'), false, 'wrong value match');
});


testHasValue('will return false for non-element', ({ elements }) => {
  assert.is(hasValue(null, 'test'), false, 'wrong value match');
});


testHasValue.run();
