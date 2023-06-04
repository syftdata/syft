import { useCallback, useState } from "react";
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
import { useUserSession } from "../cloud/state/usersession";
import LoginView from "../cloud/views/LoginView";
import AddEventModal, { EditEventModal } from "./AddEventModal";
import { GitInfoActionType } from "../cloud/state/types";

export interface SchemaAppProps {
  className?: string;
}

const SchemaApp = ({ className }: SchemaAppProps) => {
  const [userSession] = useUserSession();
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

  if (!userSession) {
    return <LoginView />;
  }
  const gitInfo = gitInfoState.info;
  if (!gitInfo) {
    return <Spinner />;
  }

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
          renderItem: (item) => <SchemaPropsRenderer data={{ schema: item }} />,
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
