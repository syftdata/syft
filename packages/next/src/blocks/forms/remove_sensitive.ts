import { type SyftFormField } from './types';

const EXCLUDE_FIELDS = [
  'ccn',
  'cvv',
  'cvc',
  'password',
  'pin',
  'secret',
  'token',
  'creditCard'
];

const EXCLUDE_FIELD_TYPES = ['hidden', 'password'];

// check to see if input value looks like a credit card number
// see: https://www.safaribooksonline.com/library/view/regular-expressions-cookbook/9781449327453/ch04s20.html
const ccRegex =
  /^(?:(4[0-9]{12}(?:[0-9]{3})?)|(5[1-5][0-9]{14})|(6(?:011|5[0-9]{2})[0-9]{12})|(3[47][0-9]{13})|(3(?:0[0-5]|[68][0-9])[0-9]{11})|((?:2131|1800|35[0-9]{3})[0-9]{11}))$/;
// check to see if input value looks like a social security number
const ssnRegex = /(^\d{3}-?\d{2}-?\d{4}$)/;

/*
 * Check whether a string value should be "captured" or if it may contain sentitive data
 * using a variety of heuristics.
 * @param {string} value - string value to check
 * @returns {boolean} whether the element should be captured
 */
export function canCaptureValue(value: string): boolean {
  if (value == null) {
    return false;
  }

  if (typeof value === 'string') {
    value = value.trim();

    if (ccRegex.test(value.replace(/[- ]/g, ''))) {
      return false;
    }
    if (ssnRegex.test(value)) {
      return false;
    }
  }

  return true;
}

export function removeSensitive(fields: SyftFormField[]): SyftFormField[] {
  return fields.filter((field) => {
    if (EXCLUDE_FIELD_TYPES.includes(field.type)) return false;
    if (!canCaptureValue(field.value)) return false;
    const data = [field.id, field.name, field.label];
    // remove by value regex as well.
    return !data.some(
      (f) =>
        f != null && EXCLUDE_FIELDS.some((x) => f.toLowerCase().includes(x))
    );
  });
}
