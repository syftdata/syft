import React from "react";
import { EventSchema } from "@syftdata/common/lib/types";
import { EventTag } from "../types";
import List from "../common/components/core/List";
import { Css, Flex } from "../common/styles/common.styles";
import { Mono } from "../common/styles/fonts";
import { IconButton } from "../common/components/core/Button/IconButton";
import { css } from "@emotion/css";
import Section from "../common/components/core/Section";
import EventPropsViewV2, { SchemaAndElement } from "./eventprops";

// Attached Events view.
export interface EventsViewProps {
  setEvents: (handler: string, events: string[]) => void;
  updateSchema: (schema: EventSchema) => void;
  onEdit: () => void;
  tag: EventTag;
  handler: string;
  schemas: EventSchema[];
}

export const EventsView = ({
  setEvents,
  updateSchema,
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
  }, [schemas, tag, eventNamesOfHandler]) as SchemaAndElement[];

  const removeEvent = (schema: EventSchema) => {
    const index = eventNamesOfHandler.findIndex((i) => i === schema.name);
    if (index > -1) {
      const expectedEvents1 = [...eventNamesOfHandler];
      expectedEvents1.splice(index, 1);
      setEvents(handler, expectedEvents1);
    }
  };

  const onUpdateSchema = (data: SchemaAndElement) => {
    // TODO: update element props some how ?
    updateSchema(data.schema);
  };

  return (
    <Section
      title="Events"
      extraButtons={<IconButton icon="plus" onClick={onEdit} />}
      expandable={true}
    >
      <Flex.Col>
        <List<SchemaAndElement>
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
              // <EventPropsView data={item} onUpdate={onUpdateSchema} />
              <EventPropsViewV2 data={item} onUpdate={onUpdateSchema} />
            ),
          }}
        />
      </Flex.Col>
    </Section>
  );
};
