export interface DBEventSource {
  table: string;
  on: string | string[];
}

export interface DBFieldRelation {
  table: string;
  references: string[];
  fields: string[];
  isMany: boolean; // 1 to many or 1 to 1.
}
