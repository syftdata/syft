import React, { useState } from "react";
import { EventSchema } from "@syftdata/common/lib/types";
import { EventTag } from "../types";
import List from "../common/components/core/List";
import { Css, Flex } from "../common/styles/common.styles";
import { Mono } from "../common/styles/fonts";
import SchemaPropsRenderer, { SchemaAndEvents } from "./schema";
import { IconButton } from "../common/components/core/Button/IconButton";
import { css } from "@emotion/css";
// import NoSchemasView from "./noschemasview";
import Section from "../common/components/core/Section";

// Attached Events view.
export interface SelectedSchemaProps {
  setEvents: (handler: string, events: string[]) => void;
  onEdit: () => void;
  tag: EventTag;
  handler: string;
  schemas: EventSchema[];
}
export const SelectedSchemaView = ({
  setEvents,
  onEdit,
  tag,
  handler,
  schemas,
}: SelectedSchemaProps) => {
  const eventNamesOfHandler = tag.handlerToEvents[handler] ?? [];
  const schemaAndEvents = React.useMemo(() => {
    return schemas
      .map((schema) => {
        if (eventNamesOfHandler.includes(schema.name)) {
          return {
            schema,
            event: {
              name: schema.name,
              createdAt: new Date(),
              props: tag.reactSource.props,
              syft_status: { track: "", valid: "" },
            },
          };
        }
      })
      .filter((e) => e != null) as SchemaAndEvents[];
  }, [schemas, eventNamesOfHandler]);

  const removeSchema = (schema: EventSchema) => {
    const index = eventNamesOfHandler.findIndex((i) => i === schema.name);
    if (index > -1) {
      const expectedEvents1 = [...eventNamesOfHandler];
      expectedEvents1.splice(index, 1);
      setEvents(handler, expectedEvents1);
    }
  };

  const updateSchema = (schema: SchemaAndEvents) => {
    // TODO: update element props some how ?
  };

  let filteredSchemas = schemaAndEvents;
  return (
    <Section
      title="Tracked Events"
      extraButtons={<IconButton icon="edit" onClick={onEdit} />}
    >
      <Flex.Col>
        <List<SchemaAndEvents>
          data={filteredSchemas}
          emptyMessage={`No events tracked for ${handler}`}
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
            isExpanded: (item) => true,
            renderItem: (item) => (
              <SchemaPropsRenderer
                data={item}
                showScreenshot={false}
                onUpdate={updateSchema}
              />
            ),
          }}
        />
      </Flex.Col>
    </Section>
  );
};

// Used to attach events to an action
export interface SchemaSelectorProps {
  setEvents: (handler: string, events: string[]) => void;
  action: EventTag;
  handler: string;
  schemas: EventSchema[];
  onMagicWand: () => void;
}
const SchemaSelector = ({
  setEvents,
  action,
  handler,
  schemas,
  onMagicWand,
}: SchemaSelectorProps) => {
  const eventNamesOfHandler = action.handlerToEvents[handler] ?? [];
  const schemaAndEvents = React.useMemo(() => {
    return schemas
      .map((schema) => {
        if (eventNamesOfHandler.includes(schema.name)) {
          return {
            schema,
            event: {
              name: schema.name,
              createdAt: new Date(),
              props: action.reactSource.props,
              syft_status: { track: "", valid: "" },
            },
          };
        }
      })
      .filter((e) => e != null) as SchemaAndEvents[];
  }, [schemas, eventNamesOfHandler]);
  const [search, setSearch] = useState("");

  const addSchema = (schema: EventSchema) => {
    setEvents(handler, [...eventNamesOfHandler, schema.name]);
  };

  const removeSchema = (schema: EventSchema) => {
    const index = eventNamesOfHandler.findIndex((i) => i === schema.name);
    if (index > -1) {
      const expectedEvents1 = [...eventNamesOfHandler];
      expectedEvents1.splice(index, 1);
      setEvents(handler, expectedEvents1);
    }
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
      // emptyMessage={<NoSchemasView onMagicWand={onMagicWand} />}
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
                onClick={() => removeSchema(item.schema)}
              />
            )}
            {item.event == null && (
              <IconButton
                icon="plus-circle"
                onClick={() => addSchema(item.schema)}
              />
            )}
          </Flex.Row>
        );
      }}
      search={{
        searchPlaceHolder: "Search for Schemas",
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
