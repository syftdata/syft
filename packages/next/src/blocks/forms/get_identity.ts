import {
  type Address,
  type GroupTraits,
  type UserTraits
} from '../../common/event_types';
import { getAttributeSet } from './get_attributes';
import { type SyftFormField } from './types';

export interface Identity {
  id: string;
  traits: UserTraits;
  groupTraits: GroupTraits;
}

const USER_ADDRESS_FIELDS = ['country', 'state', 'city'];
const USER_TRAIT_FIELDS = [
  'name',
  'phone',
  'firstName',
  'lastName',
  'fullName',
  'title',
  'role',
  'username'
];
const USER_TRAIT_MAPPING = {
  role: 'title'
};

const GROUP_TRAIT_FIELDS = ['employees', 'employeeCount', 'company', 'website'];
const GROUP_TRAIT_MAPPING = {
  employeeCount: 'employees',
  company: 'name'
};

const EMAIL_REGEX = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
function validateEmail(email): boolean {
  return email != null && EMAIL_REGEX.test(email);
}

export function findIdentityInForm(
  fields: SyftFormField[]
): Identity | undefined {
  // identify email / name / username
  const emailField = fields.find((field) => validateEmail(field.value));
  const userTraits = getAttributeSet<UserTraits>(
    fields,
    USER_TRAIT_FIELDS,
    USER_TRAIT_MAPPING
  );
  const address = getAttributeSet<Address>(fields, USER_ADDRESS_FIELDS);
  const company = getAttributeSet<GroupTraits>(
    fields,
    GROUP_TRAIT_FIELDS,
    GROUP_TRAIT_MAPPING
  );

  const email = emailField?.value;
  return {
    id: email,
    traits: {
      ...userTraits,
      company: company.name,
      address,
      email
    },
    groupTraits: company
  };
}
