import React from "react";
import { Action, EventSchema, SyftEvent } from "../types";
import List from "../common/components/core/List";
import { Flex } from "../common/styles/common.styles";
import { Mono } from "../common/styles/fonts";
import SchemaPropsRenderer, { SchemaAndEvents } from "./schema";
import { IconButton, PrimaryIconButton } from "../common/components/core/Button";
import { isArrayEqual } from '../common/utils';
import { ActionText } from '../common/ActionText';

export const TodoSchemas: EventSchema[] = [
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

export interface SchemaSelectorProps {
  setEvents: (events: SyftEvent[]) => void;
  action?: Action;
  schemas: EventSchema[];
  className?: string;
}

const SchemaSelector = ({
  setEvents,
  action,
  schemas,
  className
}: SchemaSelectorProps) => {
  const [search, setSearch] = React.useState("");
  const [expectedEvents, setExpectedEvents] = React.useState<SyftEvent[]>(action?.events ?? []);

  const schemaAndEvents = React.useMemo(() => {
    const map = new Map<string, SyftEvent>();
    expectedEvents.forEach((event) => {
      map.set(event.name, event);
    });
    return schemas.map((schema) => {
      return {schema, event: map.get(schema.name)} as SchemaAndEvents;
    });
  }, [schemas, expectedEvents]);

  if (!action) {
    return null;
  }
  
  const didWeModify = !isArrayEqual(action.events, expectedEvents);
  const save = () => {
    setEvents(expectedEvents);
  }

  const addSchema = (schema: EventSchema) => {
    const expectedEvents1 = [...expectedEvents, {
      name: schema.name,
      props: {},
      createdAt: new Date(),
      syft_status: { valid: "valid", track: "" },
    }];
    setExpectedEvents(expectedEvents1);
  };

  const removeSchema = (schema: EventSchema) => {
    const index = expectedEvents.findIndex((i) => i.name === schema.name);
    if (index > -1) {
      const expectedEvents1 = [...expectedEvents];
      expectedEvents1.splice(index, 1);
      setExpectedEvents(expectedEvents1); 
    }
  };

  const updateSchema = (schema: SchemaAndEvents) => {    
    const events = [...expectedEvents];
    const index = events.findIndex((i) => i.name === schema.schema.name);
    if (index > -1 && schema.event) {
      events[index] = schema.event;
      setExpectedEvents(events);
    }    
  };

  let filteredSchemas = schemaAndEvents;
  const searchStr = search.trim().toLowerCase();
  if (searchStr !== "") {
    filteredSchemas = filteredSchemas.filter((schema) =>
      schema.schema.name.toLowerCase().includes(searchStr)
    );
  }

  // TODO: show selected items at the top.
  return (
    <Flex.Col className={className}>
      {/* <ActionText action={action} /> */}
      <List<SchemaAndEvents>
        data={filteredSchemas}
        renderItem={(item) => {
          return (
            <Flex.Row alignItems="center" justifyContent="space-between" className={Flex.grow(1)}>
              <Flex.Col gap={4} className={Flex.grow(1)}>
                <Mono.M14>{item.schema.name}</Mono.M14>
                <Mono.M10>{item.schema.documentation}</Mono.M10>
              </Flex.Col>
              {item.event ? (
                <IconButton label="remove" onClick={() => removeSchema(item.schema)} />
              ) : (
                <IconButton icon="plus" onClick={() => addSchema(item.schema)} />
              )}
            </Flex.Row>
          );
        }}
        search={{
          searchPlaceHolder: "Search for Event Models",
          search,
          setSearch,
          actions: [
            didWeModify ? <PrimaryIconButton label="save" onClick={save} /> : <></>
          ]
        }}
        expandable={{
          isExpanded: (item) => item.event != null,
          renderItem: (item) => <SchemaPropsRenderer data={item} onUpdate={updateSchema} />,
        }}
      />
    </Flex.Col>
  );
};
export default SchemaSelector;
