# solid-dom-testing

Small assertion helpers for testing with solid-testing-library without using jest and @testing-library/jest-dom.

Use them with your favorite assert tool, e.g.:

```js
// nodejs
assert(isInDocument(element), 'element is not in document');
// uvu
assert.ok(isInDocument(element), 'element is not in document');
// tape
t.ok(isInDocument(element), 'element is not in document');
// chai
chai.assert(isInDocument(element), 'element is not in document');
```

Or use your own.

## isChecked(element)

Returns true if the element is a radio button or a checkbox (either input or aria-role) and is checked.

## isDisabled(element)

Returns true if the element can be and is disabled.

## isEmptyDomElement(element)

Returns true if the element contains nothing but comment nodes.

## isEmpty(element)

Returns true if the element is truly empty.

## isInDocument(element[, document])

Returns true if the element is mounted in the document. The optional second argument allows providing a document different from the current one, e.g. for iframe testing.

## isInvalid(element)

Returns true if the element can be and is invalid.

## isValid(element)

Returns true if the element can be and is valid.

## isRequired(element)

Returns true if the element can be and is required.

## isVisible(element)

Returns true if the element should be visible (being pushed inside an clipped element doesn't count; please don't expect magic).

## hasAccessibleDescription(element[, expected])

Returns true if the element has an accessible description (that matches an expected regular expression or contains an expected string, if given).

## hasAccessibleName(element[, expected])

Returns true if the element has an accessible name (that matches an expected regular expression or contains an expected string, if given).

## hasAttribute(element, name[, expected])

Returns true if the element has an attribute set with the name (and therein the expected content matched by string or regular expression).

## hasClass(element, name)

Returns true if the element has a class name; if name is a string, it is searched for that class name, otherwise if it is a regular expression, it will attempt to match the whole class name.

## hasDisplayValue(element, value/-s)

Returns true if the element is a form input and the value shown as active is the one provided as second argument in form of a string or regular expression (for select with multiple, use an array of strings/regular expressions).

## hasElement(ancestor, descendant)

Returns true if the ancestor contains the descendant.

## hasErrorMessage(element, message)

Returns true if the element is invalid and described by the text content of a node that has its id specified in the element's `aria-errormessage` attribute matching the message given as string or regular expression.

## hasFocus(element)

Returns true if the element currently has focus.

## hasFormValues(form, expectedValues)

Returns true if the values of the form fields match the expectedValues. Depending on the field, these expectations must conform to the following rules:

- multiple radio buttons of the same name will result in string/undefined
- multiple check boxes will return an array of selected values
- a single check box will return true/false instead of a value
- an input type="number" will return a number
- a select with multiple will return an array of selected options' values
- a single value select will return the selected value
- everything else will return a string

## hasStyle(element, styles)

Returns true if the computed style attributes of the element match with the styles from the second argument, which can either be a string like an inline style or an object with style attribute names as keys and strings or regular expressions as values.

## hasHTMLContent(element, html)

Returns true if the innerHTML matches the expected html content.

## hasTextContent(element, text)

Returns true if the textContent matches the expected text.

## hasValue(element, value)

Returns true if the form element matches the expected value that can be a number for number input, an array of strings for a multi select and a string for other inputs or textarea elements.

# Building and testing

- Checkout this repository
- run `npm i`
- to build, run `npm run build`
- to test once, run `npm test`
- to test once with coverage, run `npm run test:coverage`
- to type check once, run `npm run test:types`
- to test in watch mode, run `npm run test:watch`
- to test in watch mode with coverage, run `npm run test:watch:coverage`
- to type check in watch mode, run `npm run test:watch:types`

---

&copy; 2021 Alex Lohr
