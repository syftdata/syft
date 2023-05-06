import { Event } from "../types";

export const TodoSchemas: Event[] = [
  {
    name: "TodoAdded",
    documentation: "Logged when a ToDo is created.",
    fields: [
      {
        name: "title",
        type: {
          name: "string",
          zodType: "z.string()",
        },
        isOptional: false,
        documentation: "Title of the ToDo",
      },
      {
        name: "created_at",
        type: {
          name: "string",
          zodType: "z.string()",
        },
        isOptional: false,
        documentation: "Time when the ToDo was created",
      },
      {
        name: "id",
        type: {
          name: "number",
          zodType: "z.number()",
        },
        isOptional: false,
        documentation: "ID of the item",
      },
    ],
    zodType:
      "z.object({\n    \ttitle: z.string(),\n\tcreated_at: z.string(),\n\tid: z.number()\n  })",
  },
  {
    name: "TodoToggled",
    documentation: "Logged when a ToDo is (un)done.",
    fields: [
      {
        name: "id",
        type: {
          name: "number",
          zodType: "z.number()",
        },
        isOptional: false,
        documentation: "ID of the ToDo",
      },
      {
        name: "is_done",
        type: {
          name: "boolean",
          zodType: "z.boolean()",
        },
        isOptional: false,
        documentation: "True when the ToDo is marked as done",
        defaultValue: "false",
      },
    ],
    zodType: "z.object({\n    \tid: z.number(),\n\tis_done: z.boolean()\n  })",
  },
  {
    name: "TodoDeleted",
    documentation: "Logged when a ToDo is deleted",
    fields: [
      {
        name: "id",
        type: {
          name: "number",
          zodType: "z.number()",
        },
        isOptional: false,
        documentation: "ID of the ToDo",
      },
      {
        name: "is_done",
        type: {
          name: "boolean",
          zodType: "z.boolean()",
        },
        isOptional: false,
        documentation: "True when the ToDo is marked as done",
        defaultValue: "false",
      },
    ],
    zodType: "z.object({\n    \tid: z.number(),\n\tis_done: z.boolean()\n  })",
  },
  {
    name: "PageEvent",
    documentation: "Logged when the page changes.",
    fields: [
      {
        name: "pageName",
        type: {
          name: "string",
          zodType: "z.string()",
        },
        isOptional: false,
        documentation: "Name of the page",
        defaultValue: '"index"',
      },
    ],
    zodType: "z.object({\n    \tpageName: z.string()\n  })",
  },
  {
    name: "UserIdentity",
    documentation: "User Identity is tracked via this event.",
    fields: [
      {
        name: "userId",
        type: {
          name: "string",
          zodType: "z.string().uuid()",
        },
        isOptional: false,
        documentation: "ID of the user",
      },
    ],
    zodType: "z.object({\n    \tuserId: z.string().uuid()\n  })",
  },
];
