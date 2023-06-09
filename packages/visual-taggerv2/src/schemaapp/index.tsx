import { useCallback, useMemo, useState } from "react";
import { EventSchema } from "@syftdata/common/lib/types";
import List from "../common/components/core/List";
import { Css, Flex } from "../common/styles/common.styles";
import { Label, Mono } from "../common/styles/fonts";
import SchemaPropsRenderer from "./schema";
import { IconButton } from "../common/components/core/Button/IconButton";
import { css } from "@emotion/css";
import { useGitInfoContext } from "../cloud/state/gitinfo";
import NoSchemasView from "./noschemasview";
import Button from "../common/components/core/Button/Button";
import { Colors } from "../common/styles/colors";
import Spinner from "../common/components/core/Spinner/Spinner";
import AddEventModal, { EditEventModal } from "./AddEventModal";
import { GitInfoActionType } from "../cloud/state/types";
import { SyftEvent } from "../types";

export interface SchemaAppProps {
  className?: string;
}

const SchemaApp = ({ className }: SchemaAppProps) => {
  const [search, setSearch] = useState("");
  const { gitInfoState, dispatch } = useGitInfoContext();

  const [schema, setSchema] = useState<EventSchema | undefined>();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const closeEditEventFlow = useCallback(() => {
    setShowEditModal(false);
  }, []);
  const closeAddEventFlow = useCallback(() => {
    setShowAddModal(false);
  }, []);

  const gitInfoOriginal = gitInfoState.info;
  const gitInfo = gitInfoState.modifiedInfo ?? gitInfoState.info;
  if (!gitInfo || !gitInfoOriginal) {
    return <Spinner />;
  }

  const existingEventSchemas = new Set(
    gitInfoOriginal.eventSchema.events.map((e) => e.name)
  );

  const eventSchemaToEventTags = useMemo(() => {
    const map = new Map<string, SyftEvent[]>();
    gitInfo.eventTags.forEach((tag) => {
      tag.events?.forEach((e) => {
        const eventTags = map.get(e.name) ?? [];
        eventTags.push(e);
        map.set(e.name, eventTags);
      });
    });
    return map;
  }, [gitInfo]);

  const addEventModel = (newEvent: EventSchema) => {
    dispatch({
      type: GitInfoActionType.UPDATE_EVENT_SCHEMA,
      data: [...gitInfo.eventSchema.events, newEvent],
    });
    setShowAddModal(false);
  };

  const editEventModel = (newEvent: EventSchema, oldEvent: EventSchema) => {
    // remove old event from events and add new event in the same place.
    const newEvents = gitInfo.eventSchema.events.map((e) => {
      return e.name !== oldEvent.name ? e : newEvent;
    });
    dispatch({
      type: GitInfoActionType.UPDATE_EVENT_SCHEMA,
      data: newEvents,
    });
    setShowEditModal(false);
  };

  const deleteEventModel = (eventName: string) => {
    // remove old event from events and add new event in the same place.
    const remaining = gitInfo.eventSchema.events.filter((e) => {
      return e.name !== eventName;
    });
    dispatch({
      type: GitInfoActionType.UPDATE_EVENT_SCHEMA,
      data: remaining,
    });
    setShowEditModal(false);
  };

  let filteredSchemas = gitInfo.eventSchema.events;
  if (filteredSchemas.length === 0) {
    return <NoSchemasView />;
  }
  const searchStr = search.trim().toLowerCase();
  if (searchStr !== "") {
    filteredSchemas = filteredSchemas.filter((schema) =>
      schema.name.toLowerCase().includes(searchStr)
    );
  }

  // TODO: show selected items at the top.
  return (
    <Flex.Col className={className}>
      <List<EventSchema>
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
                <Mono.M14>{item.name}</Mono.M14>
                <Mono.M10>{item.documentation}</Mono.M10>
              </Flex.Col>
              <Flex.Row gap={8}>
                <IconButton
                  icon="edit"
                  onClick={() => {
                    setSchema(item);
                    setShowEditModal(true);
                  }}
                />
                <IconButton
                  icon="trash"
                  onClick={() => deleteEventModel(item.name)}
                />
              </Flex.Row>
            </Flex.Row>
          );
        }}
        search={{
          searchPlaceHolder: "Search for Event Models",
          search,
          setSearch,
          actions: [
            <Button
              onClick={() => setShowAddModal(true)}
              type="Clear"
              size="small"
              className={Css.padding(0)}
            >
              <Label.L10 color={Colors.Branding.Blue}>+ Add</Label.L10>
            </Button>,
          ],
        }}
        expandable={{
          itemBackgroundColor: (item) =>
            !existingEventSchemas.has(item.name)
              ? `${Colors.Secondary.Yellow}55`
              : undefined,
          renderItem: (item) => (
            <SchemaPropsRenderer
              data={{
                schema: item,
                event: eventSchemaToEventTags.get(item.name)?.at(0),
              }}
            />
          ),
        }}
      />
      {schema && (
        <EditEventModal
          key={schema.name}
          open={showEditModal}
          event={schema}
          onEditEvent={editEventModel}
          onCancel={closeEditEventFlow}
        />
      )}
      <AddEventModal
        open={showAddModal}
        onAddEvent={addEventModel}
        onCancel={closeAddEventFlow}
      />
    </Flex.Col>
  );
};

export default SchemaApp;
