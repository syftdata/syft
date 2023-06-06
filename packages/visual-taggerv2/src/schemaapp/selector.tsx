import React, { useMemo, useState } from "react";
import { EventSchema } from "@syftdata/common/lib/types";
import { Action, SyftEvent } from "../types";
import List from "../common/components/core/List";
import { Css, Flex } from "../common/styles/common.styles";
import { Mono } from "../common/styles/fonts";
import SchemaPropsRenderer, { SchemaAndEvents } from "./schema";
import { IconButton } from "../common/components/core/Button/IconButton";
import { css } from "@emotion/css";
import NoSchemasView from "./noschemasview";
import Section from "../common/components/core/Section";

export interface SelectedSchemaProps {
  setEvents: (events: SyftEvent[]) => void;
  onEdit: () => void;
  action?: Action;
  schemas: EventSchema[];
  className?: string;
}

export const SelectedSchemaView = ({
  setEvents,
  onEdit,
  action,
  schemas,
  className,
}: SelectedSchemaProps) => {
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

  const removeSchema = (schema: EventSchema) => {
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
    <Section
      title="Attached Events"
      extraButtons={<IconButton icon="edit" onClick={onEdit} />}
    >
      <Flex.Col className={className}>
        <List<SchemaAndEvents>
          data={filteredSchemas}
          emptyMessage="No events attached"
          renderItem={(item) => {
            return (
              <Flex.Row
                alignItems="center"
                justifyContent="space-between"
                className={css(Flex.grow(1), Css.margin("0px 6px"))}
              >
                <Flex.Col gap={4}>
                  <Mono.M14>{item.schema.name}</Mono.M14>
                  <Mono.M10>{item.schema.documentation}</Mono.M10>
                </Flex.Col>
                <IconButton
                  icon="trash"
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
    </Section>
  );
};

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
}: SchemaSelectorProps) => {
  const expectedEvents = action?.events ?? [];
  const [search, setSearch] = useState("");
  const schemaAndEvents = useMemo(() => {
    const map = new Map<string, SyftEvent>();
    expectedEvents.forEach((event) => {
      map.set(event.name, event);
    });
    return schemas.map((schema) => {
      return { schema, event: map.get(schema.name) } as SchemaAndEvents;
    });
  }, [schemas, expectedEvents]);

  if (!action) {
    return null;
  }

  const attachEvent = (schema: EventSchema) => {
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

  const detachEvent = (schema: EventSchema) => {
    const expectedEvents1 = expectedEvents.filter(
      (e) => e.name === schema.name
    );
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
    <List<SchemaAndEvents>
      data={filteredSchemas}
      emptyMessage={<NoSchemasView />}
      renderItem={(item) => {
        return (
          <Flex.Row
            alignItems="center"
            justifyContent="space-between"
            className={css(Flex.grow(1), Css.margin("0px 6px"))}
          >
            <Flex.Col gap={4}>
              <Mono.M14>{item.schema.name}</Mono.M14>
              <Mono.M10>{item.schema.documentation}</Mono.M10>
            </Flex.Col>
            {item.event != null && (
              <IconButton
                icon="minus-circle"
                onClick={() => detachEvent(item.schema)}
              />
            )}
            {item.event == null && (
              <IconButton
                icon="plus-circle"
                onClick={() => attachEvent(item.schema)}
              />
            )}
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
  );
};

export default SchemaSelector;
