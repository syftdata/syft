import React from "react";
import { Action, Event, SyftEvent } from "../types";
import List from "../common/components/core/List";
import { Css, Flex } from "../common/styles/common.styles";
import { Mono } from "../common/styles/fonts";
import SchemaPropsRenderer, { SchemaAndEvents } from "./schema";
import {
  IconButton,
  SecondaryIconButton,
} from "../common/components/core/Button/IconButton";
import { css } from "@emotion/css";

export interface SchemaSelectorProps {
  setEvents: (events: SyftEvent[]) => void;
  action?: Action;
  schemas: Event[];
  className?: string;
}

export const SelectedSchemaView = ({
  setEvents,
  action,
  schemas,
  className,
}: SchemaSelectorProps) => {
  const expectedEvents = action?.events ?? [];
  const schemaAndEvents = React.useMemo(() => {
    const map = new Map<string, SyftEvent>();
    expectedEvents.forEach((event) => {
      map.set(event.name, event);
    });
    return schemas
      .map((schema) => {
        return { schema, event: map.get(schema.name) } as SchemaAndEvents;
      })
      .filter((i) => i.event != null);
  }, [schemas, expectedEvents]);

  if (!action) {
    return null;
  }

  const removeSchema = (schema: Event) => {
    const index = expectedEvents.findIndex((i) => i.name === schema.name);
    if (index > -1) {
      const expectedEvents1 = [...expectedEvents];
      expectedEvents1.splice(index, 1);
      setEvents(expectedEvents1);
    }
  };

  const updateSchema = (schema: SchemaAndEvents) => {
    const events = [...expectedEvents];
    const index = events.findIndex((i) => i.name === schema.schema.name);
    if (index > -1 && schema.event) {
      events[index] = schema.event;
      setEvents(events);
    }
  };

  let filteredSchemas = schemaAndEvents;
  return (
    <Flex.Col className={className}>
      <List<SchemaAndEvents>
        data={filteredSchemas}
        renderItem={(item) => {
          return (
            <Flex.Row
              alignItems="center"
              justifyContent="space-between"
              className={css(Flex.grow(1), Css.margin("0px 6px"))}
            >
              <Flex.Col gap={4}>
                <Mono.M14>{item.schema.name}</Mono.M14>
                <Mono.M10>{item.schema.description}</Mono.M10>
              </Flex.Col>
              <SecondaryIconButton
                label="remove"
                onClick={() => removeSchema(item.schema)}
              />
            </Flex.Row>
          );
        }}
        expandable={{
          renderItem: (item) => (
            <SchemaPropsRenderer data={item} onUpdate={updateSchema} />
          ),
        }}
      />
    </Flex.Col>
  );
};

const SchemaSelector = ({
  setEvents,
  action,
  schemas,
  className,
}: SchemaSelectorProps) => {
  const [search, setSearch] = React.useState("");
  const expectedEvents = action?.events ?? [];
  const schemaAndEvents = React.useMemo(() => {
    const map = new Map<string, SyftEvent>();
    expectedEvents.forEach((event) => {
      map.set(event.name, event);
    });
    return schemas
      .map((schema) => {
        return { schema, event: map.get(schema.name) } as SchemaAndEvents;
      })
      .filter((i) => i.event == null);
  }, [schemas, expectedEvents]);

  if (!action) {
    return null;
  }

  const addSchema = (schema: Event) => {
    const expectedEvents1 = [
      ...expectedEvents,
      {
        name: schema.name,
        props: {},
        createdAt: new Date(),
        syft_status: { valid: "valid", track: "" },
      },
    ];
    setEvents(expectedEvents1);
  };

  let filteredSchemas = schemaAndEvents;
  const searchStr = search.trim().toLowerCase();
  if (searchStr !== "") {
    filteredSchemas = filteredSchemas.filter((schema) =>
      schema.schema.name.toLowerCase().includes(searchStr)
    );
  }
  return (
    <Flex.Col className={className}>
      <List<SchemaAndEvents>
        data={filteredSchemas}
        renderItem={(item) => {
          return (
            <Flex.Row
              alignItems="center"
              justifyContent="space-between"
              className={css(Flex.grow(1), Css.margin("0px 6px"))}
            >
              <Flex.Col gap={4}>
                <Mono.M14>{item.schema.name}</Mono.M14>
                <Mono.M10>{item.schema.description}</Mono.M10>
              </Flex.Col>
              <IconButton
                icon="plus-circle"
                onClick={() => addSchema(item.schema)}
              />
            </Flex.Row>
          );
        }}
        search={{
          searchPlaceHolder: "Search for Event Models",
          search,
          setSearch,
        }}
        expandable={{
          renderItem: (item) => <SchemaPropsRenderer data={item} />,
        }}
      />
    </Flex.Col>
  );
};

export default SchemaSelector;
