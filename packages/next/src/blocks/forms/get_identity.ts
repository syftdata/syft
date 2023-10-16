import { convertToAttributeSet } from './get_attributes';
import { type AttributeSet, type SyftFormField } from './types';

export interface Identity {
  id: string;
  traits: AttributeSet;
}

const TRAIT_FIELDS = [
  'email',
  'name',
  'employees',
  'employeeCount',
  'phone',
  'firstName',
  'lastName',
  'fullName',
  'title',
  'role',
  'username',
  'website',
  'domain',
  'company',
  'country'
];

export function findIdentityInForm(
  fields: SyftFormField[]
): Identity | undefined {
  // identify email / name / username
  let emailField = fields.find((field) => field.type === 'email');
  if (emailField == null) {
    emailField = fields.find(
      (field) => field.name.includes('email') || field.label?.includes('email')
    );
  }

  if (emailField == null || emailField.value == null) {
    return;
  }

  const traits = fields.filter((field) => {
    const data = [field.id, field.name, field.label, field.type];
    return data.some(
      (f) => f != null && TRAIT_FIELDS.some((x) => f.toLowerCase().includes(x))
    );
  });

  return {
    id: emailField.value,
    traits: convertToAttributeSet(traits)
  };
}
