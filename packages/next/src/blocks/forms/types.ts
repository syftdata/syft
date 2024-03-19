export type AttributeSet = Record<string, unknown>;
export interface SyftFormField {
  id: string;
  label?: string;
  name: string;
  type: string;
  tagName: string;
  value: string;
}
export type SyftFormFields = Record<string, SyftFormField>;
export interface SyftFormData {
  attributes: AttributeSet;
  fields: SyftFormField[];
}
