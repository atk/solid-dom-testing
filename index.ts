import {
  computeAccessibleDescription,
  computeAccessibleName
} from 'dom-accessibility-api';
import { instance } from 'uvu/assert';

/**
 * Checks if the current radio/checkbox element is checked
 * @param {HTMLElement} element to be tested
 * @returns {boolean} true if checked, false if not
 */
export const isChecked = (elem?: any): boolean => {
  const isInput = elem instanceof HTMLInputElement;
  return (
    elem instanceof HTMLElement &&
    ['checkbox', 'radio'].includes(
      elem.getAttribute(isInput ? 'type' : 'role') ?? ''
    ) &&
    (elem.getAttribute('checked') ?? 'false') !== 'false'
  );
};

/**
 * Recursively checks if element or a parent is disabled
 * @param elem {HTMLElement | ParentNode} element to be tested
 * @returns {boolean} true if disabled, false if not
 */
export const isDisabled = (elem: HTMLElement | ParentNode | null): boolean =>
  elem instanceof HTMLElement &&
  (elem.hasAttribute('disabled') ||
    (elem.getAttribute('aria-disabled') ?? 'false') !== 'false' ||
    (elem.parentNode instanceof HTMLElement && isDisabled(elem.parentNode)));

/**
 * Checks if the argument is a DOM element without other DOM elements inside it
 * @param elem element to be tested
 * @returns true if empty, false if not empty or not a dom element
 */
export const isEmptyDomElement = (elem?: any): boolean =>
  elem instanceof HTMLElement &&
  !Array.from(elem.childNodes).some((node) => node.nodeType !== 8);

/**
 * Checks if the argument is a completely empty DOM element
 * @deprecated use isEmptyDomElement
 * @param elem element to be test
 * @returns true if empty, false if not or not a DOM element
 */
export const isEmpty = (elem?: any): boolean =>
  elem instanceof HTMLElement && elem.innerHTML === '';

/**
 * Checks if the argument is an element within the current document
 * @param elem element to be tested
 * @param doc optional to select a different document to test against, e.g. in an iframe
 * @returns true if in document, false if not or not a DOM element
 */
export const isInDocument = (elem?: any, doc = document): elem is HTMLElement =>
  elem instanceof HTMLElement &&
  (elem.parentNode === doc || isInDocument(elem.parentNode, doc));

/**
 * Checks if the argument is an element within the current document
 * @deprecated use isInDocument
 * @param elem element to be tested
 * @param doc optional to select a different document to test against, e.g. in an iframe
 * @returns true if in document, false if not or not a DOM element
 */
export const isInDOM = isInDocument;

/**
 * Checks if the argument is an invalid form element
 * @param elem element to be tested
 * @returns true if invalid form element, false if not
 */
export const isInvalid = (elem?: any): boolean =>
  elem instanceof HTMLElement &&
  (elem.getAttribute('aria-invalid') === 'true' ||
    !('checkValidity' in elem) ||
    !(elem as HTMLFormElement).checkValidity());

/**
 * Checks if the argument is a valid form element
 * @param elem element to be tested
 * @returns true if invalid form element, false if not
 */
export const isValid = (elem?: any): boolean =>
  elem instanceof HTMLElement &&
  (((elem.getAttribute('aria-invalid') || 'false') === 'false' &&
    !('checkValidity' in elem)) ||
    (elem as HTMLFormElement).checkValidity());

/**
 * Checks if an argument is an element that can be and is required
 * @param elem element to be tested
 * @returns true if required, false if not
 */
export const isRequired = (elem?: any) =>
  (elem instanceof HTMLElement &&
    ((elem instanceof HTMLInputElement &&
      !['color', 'hidden', 'range', 'submit', 'image', 'reset'].includes(
        elem.getAttribute('type') ?? 'text'
      )) ||
      elem instanceof HTMLTextAreaElement ||
      elem instanceof HTMLSelectElement) &&
    elem.hasAttribute('required')) ||
  (['combobox', 'gridcell', 'radiogroup', 'spinbutton', 'tree'].includes(
    elem?.getAttribute('role') ?? ''
  ) &&
    elem?.getAttribute('aria-required') === 'true');

/**
 * Checks if element should be visible - warning: there are some uncovered edge cases
 * @param elem element to be checked
 * @returns true if the element should be visible, false if it shouldn't
 */
export const isVisible = (elem?: any): boolean => {
  if (!isInDocument(elem)) {
    return false;
  }
  if ((elem.getAttribute('hidden') ?? 'false') !== 'false') {
    return false;
  }
  const { display, visibility, opacity, height, width } =
    window.getComputedStyle(elem);
  return (
    display !== 'none' &&
    visibility !== 'hidden' &&
    visibility !== 'collapse' &&
    Number(opacity || '1') !== 0 &&
    (['inline', 'static'].includes(display) ||
      Number(width || '1') * Number(height || '1') > 0) &&
    (elem.parentNode === document.documentElement || isVisible(elem.parentNode))
  );
};

/**
 * Checks if the element has an accessible description
 * @param elem element to be checked
 * @param expected optional string or regular expression to be checked against
 * @returns true if the element has an accessible description
 */
export const hasAccessibleDescription = (
  elem?: any,
  expected?: string | RegExp
) => {
  if (elem instanceof HTMLElement || elem instanceof SVGElement) {
    const actual = computeAccessibleDescription(elem);
    return expected instanceof RegExp
      ? expected.test(actual)
      : expected
      ? actual.indexOf(expected) !== -1
      : actual.length > 3;
  }
  return false;
};

/**
 * Checks if the element has an accessible name
 * @param elem element to be checked
 * @param expected optional string or regular expression to be checked against
 * @returns true if the element has an accessible name
 */
export const hasAccessibleName = (elem?: any, expected?: string | RegExp) => {
  if (elem instanceof HTMLElement || elem instanceof SVGElement) {
    const actual = computeAccessibleName(elem);
    return expected instanceof RegExp
      ? expected.test(actual)
      : expected
      ? actual.indexOf(expected) !== -1
      : actual.length > 3;
  }
  return false;
};

/**
 * Checks if an element has a certain attribute (optionally with an expected value)
 * @param elem element to be checked
 * @param name of the attribute
 * @param expected optional string or regular expression to check the value against
 * @returns true if the attribute is present and as expected
 */
export const hasAttribute = (
  elem: any,
  name: string,
  expected?: string | RegExp
) => {
  if (elem instanceof HTMLElement || elem instanceof SVGElement) {
    if (expected) {
      const actual = elem.getAttribute(name);
      return (
        actual !== null &&
        (expected instanceof RegExp
          ? expected.test(actual)
          : actual === expected)
      );
    }
    return elem.hasAttribute(name);
  }
  return false;
};

/**
 * Checks if an element has a certain class name
 * @param elem element to be checked
 * @param name string with a class name or regular expression to check the whole class name attribute against.
 * @returns true if matched
 */
export const hasClass = (elem: any, name: string | RegExp) =>
  (elem instanceof HTMLElement || elem instanceof SVGElement) &&
  name instanceof RegExp
    ? name.test(elem.className)
    : elem.classList.contains(name);

/**
 * Checks if an element is described by other elements with a certain description
 * @deprecated use hasAccessibleDescription
 * @param elem element to be checked
 * @param description string or regular expression to check the description against.
 * @returns true if it matches
 */
export const hasDescription = (elem: any, description: string | RegExp) => {
  if (elem instanceof HTMLElement || elem instanceof SVGElement) {
    const actual = (elem.getAttribute('aria-describedby') ?? '').replace(
      /(\s*)(\S+)/g,
      (_: string, space: string, descriptionId: string) => {
        const descriptionNode =
          descriptionId && elem.ownerDocument.getElementById(descriptionId);
        return descriptionNode && /\S+/.test(descriptionNode.textContent || '')
          ? space + descriptionNode.textContent
          : '';
      }
    );
    return description instanceof RegExp
      ? description.test(actual)
      : actual.indexOf(description) !== -1;
  }
  return false;
};

/**
 * Checks if an form element has a shown value
 * @param elem element to be checked
 * @param value string, regular expression or for select/multiple an array thereof
 * @returns true if display value matches
 */
export const hasDisplayValue = (
  elem: any,
  value: string | RegExp | (string | RegExp)[]
) => {
  if (
    elem instanceof HTMLSelectElement ||
    elem instanceof HTMLTextAreaElement ||
    (elem instanceof HTMLInputElement &&
      !['radio', 'checkbox'].includes(elem.type))
  ) {
    const values = Array.isArray(value) ? value : [value];
    const actual =
      'options' in elem
        ? [...elem.options]
            .filter((option) => option.selected)
            .map((option) => option.textContent ?? '')
        : [elem.value];
    return values.every((value, index) =>
      value instanceof RegExp
        ? value.test(actual[index])
        : actual[index]?.indexOf(value) !== -1
    );
  }
  return false;
};

/**
 * Checks if descendant is inside ancestor
 * @param ancestor element to be checked
 * @param descendant element to be checked
 * @returns true if descendant is a descendant of ancestor
 */
export const hasElement = (ancestor: any, descendant: any): boolean =>
  (ancestor instanceof HTMLElement || ancestor instanceof SVGElement) &&
  (descendant instanceof HTMLElement || descendant instanceof SVGElement) &&
  ancestor.contains(descendant);

/**
 * Checks if a form element is invalid and has an accessible error message
 * @param elem element to be checked
 * @param message string or regular expression to check against the message
 * @returns true if field is invalid and has an accessible error message matching the message attribute
 */
export const hasErrorMessage = (elem: any, message: string | RegExp) => {
  if (isInvalid(elem)) {
    const actual = (elem.getAttribute('aria-errormessage') ?? '').replace(
      /(\s*)(\S+)/g,
      (_: string, space: string, messageId: string) => {
        const messageNode =
          messageId && elem.ownerDocument.getElementById(messageId);
        return messageNode && /\S+/.test(messageNode.textContent || '')
          ? space + messageNode.textContent
          : '';
      }
    );
    return message instanceof RegExp
      ? message.test(actual)
      : actual.indexOf(message) !== -1;
  }
  return false;
};

/**
 * Checks if the element has focus
 * @param elem element to be checked
 * @returns true if element is focussed
 */
export const hasFocus = (elem: any) =>
  (elem instanceof HTMLElement || elem instanceof SVGElement) &&
  (elem.ownerDocument ?? document).activeElement === elem;

/**
 * Checks if a form has certain values
 * @param elem form element to be checked
 * @param expected object with the values (multiple values for same-name checkboxes or multiselect fields go in an array, single checkboxes yield booleans, number inputs number); not all fields need to be expected
 * @returns true if form values match the expected values
 */
export const hasFormValues = (elem: any, expected: Record<string, any>) => {
  if (elem instanceof HTMLFormElement) {
    const fields: (
      | HTMLInputElement
      | HTMLSelectElement
      | HTMLTextAreaElement
    )[] = Array.from(elem.querySelectorAll('input, select, textarea'));
    const names = Array.from(
      fields.reduce((nameSet, field) => {
        if (field.name) {
          nameSet.add(field.name);
        }
        return nameSet;
      }, new Set<string>())
    );
    const values = names.reduce<Record<string, any>>((values, name) => {
      const selected = fields.filter((field) => field.name === name);
      if (selected.length > 1) {
        values[name] =
          selected[0].type === 'radio'
            ? selected.find((field) => 'checked' in field && field.checked)
                ?.value
            : selected.reduce<string[]>((values, field) => {
                if ('checked' in field && field.checked) {
                  values.push(field.value);
                }
                return values;
              }, []);
      } else {
        const field = selected[0];
        if (field instanceof HTMLSelectElement) {
          if (field.multiple) {
            values[name] = Array.from(field.options)
              .filter((option) => option.selected)
              .map((option) => option.value);
          } else {
            values[name] = field.value;
          }
        } else if (field.type === 'number') {
          values[name] = (field as HTMLInputElement).valueAsNumber;
        } else if (['radio', 'checkbox'].includes(field.type)) {
          values[name] = 'checked' in field && field.checked;
        } else {
          values[name] = field.value;
        }
      }
      return values;
    }, {});
    return Object.keys(expected).every((name) => {
      if (Array.isArray(expected[name])) {
        return expected[name].every(
          (value: any, index: number) => value === values[name]?.[index]
        );
      }
      return expected[name] === values[name];
    });
  }
  return false;
};

/**
 * Checks if a (pseudo)
 * @param elem element to be checked or [element, '::before' | '::after'] for pseudo element
 * @param expectedStyles styles object or string
 * @returns true if expected styles are set on the element
 */
export const hasStyle = (
  elem: any,
  expectedStyles: string | Record<string, string | RegExp>
) => {
  const [node, pseudo] = Array.isArray(elem) ? elem : [elem, undefined];
  if (node instanceof HTMLElement || node instanceof SVGElement) {
    const actual = window.getComputedStyle(node, pseudo);
    const styles =
      expectedStyles instanceof Object
        ? expectedStyles
        : expectedStyles
            .split(/\s*;\s*/g)
            .reduce<Record<string, string>>((styles, style) => {
              const [key, value] = style.split(/\s*:\s*/);
              if (key && value) {
                styles[key] = value;
              }
              return styles;
            }, {});

    return Object.keys(styles).every((name) => {
      const expected = styles[name];
      const style = actual[name as any] || '';
      return expected instanceof RegExp
        ? expected.test(style)
        : style === expected;
    });
  }
  return false;
};

/**
 * Check if the HTML content of the element is exactly as the html
 * @param elem element to be checked
 * @param html content that is expected
 * @returns true if elem contains html in its innerHTML
 */
export const hasHTMLContent = (elem: any, html: string) => {
  if (elem instanceof HTMLElement || elem instanceof SVGElement) {
    const div = Object.assign(elem.ownerDocument.createElement('div'), {
      innerHTML: html
    });
    const normalizedHtml = div.innerHTML;
    return elem.innerHTML === normalizedHtml;
  }
  return false;
};

/**
 * Check if the text content of the element is exactly as the text
 * @param elem element to be checked
 * @param text content that is expected
 * @returns true if elem contains text in its textContent
 */
export const hasTextContent = (elem: any, text: string) =>
  (elem instanceof HTMLElement || elem instanceof SVGElement) &&
  elem.textContent === text;

/**
 * Checks if input/select/textarea has the given value
 * @param elem element to be checked
 * @param value to be checked against, number for number input, array for multiple select, otherwise string
 * @returns true if matches
 */
export const hasValue = (elem: any, value: string | string[] | number) =>
  elem instanceof HTMLTextAreaElement
    ? elem.value === value
    : elem instanceof HTMLInputElement
    ? elem.type === 'number'
      ? elem.valueAsNumber === value
      : elem.value === value
    : elem instanceof HTMLSelectElement
    ? elem.multiple
      ? [...elem.options]
          .filter((option) => option.selected)
          .every(
            (option, index) =>
              (Array.isArray(value) ? value : [value])[index] === option.value
          )
      : elem.value === value
    : false;
