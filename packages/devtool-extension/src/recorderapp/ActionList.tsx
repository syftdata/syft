import { Action, EventSchema, isSupportedActionType } from "../types";
import { ActionText } from "./ActionText";
import { Css, Flex } from "../common/styles/common.styles";
import { IconButton } from "../common/components/core/Button";
import { useState } from "react";
import List from "../common/components/core/List";
import { Mono } from "../common/styles/fonts";
import { Colors, backgroundCss } from "../common/styles/colors";
import { css } from "@emotion/css";
import { TodoSchemas } from "../schemaapp/mockdata";
import Section from "../common/components/core/Section";
import SchemaSelector from "../schemaapp/selector";

interface ActionListProps {
  actions: Action[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  onDelete: (index: number) => void;
}
function ActionList({
  actions,
  selectedIndex,
  onSelect,
  onDelete,
}: ActionListProps) {
  const _actions = actions.filter((action) =>
    isSupportedActionType(action.type)
  );
  if (!_actions.length) {
    return (
      <Flex.Col alignItems="center" className={Css.margin("4px 4px")}>
        <Mono.M14>Steps will show up here once you start recording.</Mono.M14>
      </Flex.Col>
    );
  }

  return (
    <List<Action>
      data={_actions}
      renderItem={(action, index) => {
        const eventCount = action.events?.length ?? 0;
        return (
          <Flex.Row
            gap={4}
            alignItems="center"
            className={css(
              Flex.grow(1),
              selectedIndex === index && backgroundCss(Colors.Branding.V1)
            )}
          >
            <ActionText
              action={action}
              className={css(Flex.grow(1), Css.margin("0px 6px"))}
            />
            {eventCount > 0 && <Mono.M10>{eventCount} Events</Mono.M10>}
            <IconButton
              icon="edit"
              onClick={() => {
                onSelect(index);
              }}
            />
            <IconButton
              icon="trash"
              onClick={() => {
                onDelete(index);
              }}
            />
          </Flex.Row>
        );
      }}
    />
  );
}

export interface ActionListContainerProps {
  actions: Action[];
  onUpdateAction?: (index: number, action?: Action) => void;
}

export default function ActionListContainer({
  actions,
  onUpdateAction,
}: ActionListContainerProps) {
  // select the last action by default.
  const [selectedActionIndex, setSelectedActionIndex] = useState<number>(-1);
  const [schemas, setSchemas] = useState<EventSchema[]>([]);
  const selectedAction =
    selectedActionIndex > -1 ? actions[selectedActionIndex] : null;

  const loadSchemas = () => {
    setSchemas(TodoSchemas);
    // // Fetching data from FaceBook Jest Repo
    // fetch("http://127.0.0.1:8085/", {
    //   method: "GET",
    //   headers: new Headers({
    //     Accept: "application/json",
    //   }),
    // })
    //   .then((res) => res.json())
    //   .then((response) => setSchemas(response.schemas))
    //   .catch((error) => console.log(error));
  };

  return (
    <Flex.Col className={Flex.grow(1)}>
      <Section title="Recorded Steps" className={Flex.grow(1)}>
        <ActionList
          actions={actions}
          selectedIndex={selectedActionIndex}
          onSelect={(index) => {
            if (index === selectedActionIndex) {
              setSelectedActionIndex(-1);
            } else {
              loadSchemas();
              setSelectedActionIndex(index);
            }
          }}
          onDelete={(index) => {
            onUpdateAction && onUpdateAction(index);
          }}
        />
      </Section>
      {selectedAction && (
        <Section
          title="Attach Events"
          className={css(Flex.grow(1), Css.maxHeight(300))}
        >
          <SchemaSelector
            key={selectedActionIndex}
            action={selectedAction}
            setEvents={(events) => {
              onUpdateAction &&
                onUpdateAction(selectedActionIndex, {
                  ...selectedAction,
                  events,
                });
              setSelectedActionIndex(-1);
            }}
            schemas={schemas}
          />
        </Section>
      )}
    </Flex.Col>
  );
}
