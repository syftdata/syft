import { EventSchema } from "@syftdata/common/lib/types";
import { ReactElement } from "../../types";

const getValue = (fields: string[], props: Record<string, any>): any => {
  const field = fields.shift()!;
  try {
    const value = props[field];
    if (fields.length > 0) {
      return getValue(fields, value);
    }
    return value;
  } catch (e) {}
};

const getValueFromSource = (fields: string[], element: ReactElement): any => {
  if (fields.length === 0) {
    return undefined;
  }
  if (fields[0] !== "parent") {
    return getValue(fields, element.reactSource.props);
  } else if (element.parent != null) {
    return getValueFromSource(fields.slice(1), element.parent);
  }
};

export const __getValueFromSource = (
  schema: EventSchema,
  fieldName: string,
  fields: string[],
  element: ReactElement
): any => {
  const val = getValueFromSource(fields, element);
  if (val === undefined) {
    switch (schema.name) {
      case "ProductListViewed":
        switch (fieldName) {
          case "list_id":
            return element.reactSource.name === "InfiniteProducts"
              ? "store"
              : "product";
          case "category":
            return "default";
          default:
            return;
        }
      case "ProductClicked":
        switch (fieldName) {
          case "category":
            return "default";
          case "position":
            return 0;
          default:
            return;
        }
      case "ProductViewed":
        switch (fieldName) {
          case "category":
            return "default";
          default:
            return;
        }
      case "ProductAdded":
        switch (fieldName) {
          case "category":
            return "default";
          default:
            return;
        }
      default:
        return;
    }
  } else {
    if (fieldName === "url") {
      if (!(val as string).startsWith("http")) {
        return `http://localhost:8000/products/${val}`;
      }
    }
  }
  return val;
};
