import React from "react";
import { EventSchema } from "@syftdata/common/lib/types";
import { EventTag } from "../types";
import List from "../common/components/core/List";
import { Css, Flex } from "../common/styles/common.styles";
import { Mono } from "../common/styles/fonts";
import { IconButton } from "../common/components/core/Button/IconButton";
import { css } from "@emotion/css";
import Section from "../common/components/core/Section";
import EventPropsView from "./EventPropsView";

// Attached Events view.
export interface EventsViewProps {
  setEvents: (handler: string, events: string[]) => void;
  onEdit: () => void;
  tag: EventTag;
  handler: string;
  schemas: EventSchema[];
}

type SchemaAndTag = {
  schema: EventSchema;
  tag: EventTag;
};
export const EventsView = ({
  setEvents,
  onEdit,
  tag,
  handler,
  schemas,
}: EventsViewProps) => {
  const eventNamesOfHandler = tag.handlerToEvents[handler] ?? [];
  const schemaAndTags = React.useMemo(() => {
    return schemas
      .map((schema) => {
        if (eventNamesOfHandler.includes(schema.name)) {
          // we need to produce checked-keys
          return {
            schema,
            tag,
          };
        }
      })
      .filter((e) => e != null);
  }, [schemas, eventNamesOfHandler]) as SchemaAndTag[];

  const removeEvent = (schema: EventSchema) => {
    const index = eventNamesOfHandler.findIndex((i) => i === schema.name);
    if (index > -1) {
      const expectedEvents1 = [...eventNamesOfHandler];
      expectedEvents1.splice(index, 1);
      setEvents(handler, expectedEvents1);
    }
  };

  const updateSchema = (schema: any) => {
    // TODO: update element props some how ?
  };

  return (
    <Section
      title="Tracked Events"
      extraButtons={<IconButton icon="edit" onClick={onEdit} />}
    >
      <Flex.Col>
        <List<SchemaAndTag>
          data={schemaAndTags}
          emptyMessage={`No events tracked for ${handler}`}
          renderItem={(item) => {
            return (
              <Flex.Row
                alignItems="center"
                justifyContent="space-between"
                className={css(Flex.grow(1), Css.margin("0px 4px"))}
              >
                <Flex.Col gap={4}>
                  <Mono.M14>{item.schema.name}</Mono.M14>
                  <Mono.M10>{item.schema.documentation}</Mono.M10>
                </Flex.Col>
                <IconButton
                  icon="trash"
                  onClick={() => removeEvent(item.schema)}
                />
              </Flex.Row>
            );
          }}
          expandable={{
            isExpanded: (item) => false,
            renderItem: (item) => (
              <EventPropsView
                element={item.tag}
                filterNulls={true}
                onEdit={(schema) => {
                  console.log("Modified schema is ", schema);
                }}
                schema={item.schema}
                className={Css.margin("0px 12px")}
              />
            ),
          }}
        />
      </Flex.Col>
    </Section>
  );
};
