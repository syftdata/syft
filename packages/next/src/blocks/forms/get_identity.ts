import {
  type GroupTraits,
  type Address,
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

  const email = emailField.value;
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