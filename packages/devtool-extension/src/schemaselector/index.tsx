import React from "react";
import ReactDOM from "react-dom/client";
import { EventSchema } from "../types";
import "./index.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import List from "../common/components/core/List";
import { Flex } from "../common/styles/common.styles";
import { Subheading } from "../common/styles/fonts";
import SchemaPropsRenderer from "./schema";

const schemas: EventSchema[] = [
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

const App = () => {
  const [search, setSearch] = React.useState("");

  let filteredEvents = schemas;
  const searchStr = search.trim().toLowerCase();
  if (searchStr !== "") {
    filteredEvents = filteredEvents.filter((event) =>
      event.name.toLowerCase().includes(searchStr)
    );
  }
  return (
    <List<EventSchema>
      data={filteredEvents}
      renderItem={(item) => {
        return (
          <Flex.Row>
            <Subheading.SH14>{item.name}</Subheading.SH14>
            <Subheading.SH10>{item.documentation}</Subheading.SH10>
          </Flex.Row>
        );
      }}
      search={{
        searchPlaceHolder: "Search for events",
        search,
        setSearch,
      }}
      expandable={{
        renderItem: (item) => <SchemaPropsRenderer data={item} />,
      }}
    />
  );
};

ReactDOM.createRoot(document.getElementById("app") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
