export interface Constants {
  WebAppUrl: string;
  LoginUrl: string;
  AddSchemaUrl: string;
  EditSchemaUrl: (schemaId: string) => string;
}

function createConstants(url: string): Constants {
  return {
    WebAppUrl: url,
    LoginUrl: url,
    AddSchemaUrl: `${url}/catalog?action=add`,
    EditSchemaUrl: (schemaId: string) =>
      `${url}/catalog?action=edit&active=${schemaId}`,
  };
}

export const constants = createConstants(import.meta.env.VITE_CLOUD_URL);
