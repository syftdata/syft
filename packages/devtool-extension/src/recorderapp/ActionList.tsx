import { Action, Event, isSupportedActionType } from "../types";
import { ActionText } from "./ActionText";
import { Css, Flex } from "../common/styles/common.styles";
import { IconButton } from "../common/components/core/Button/IconButton";
import { useState } from "react";
import List from "../common/components/core/List";
import { Mono } from "../common/styles/fonts";
import { Colors, backgroundCss } from "../common/styles/colors";
import { css } from "@emotion/css";
import Section from "../common/components/core/Section";
import SchemaSelector, { SelectedSchemaView } from "../schemaapp/selector";
import { useGitInfo } from "../cloud/state/gitinfo";

interface ActionListProps {
  actions: Action[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  onDelete: (index: number) => void;
  className?: string;
}
function ActionList({
  actions,
  selectedIndex,
  onSelect,
  onDelete,
  className,
}: ActionListProps) {
  const _actions = actions.filter((action) =>
    isSupportedActionType(action.type)
  );
  return (
    <List<Action>
      data={_actions}
      emptyMessage="Steps will show up here once you start recording."
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
            <Flex.Row
              className={Flex.grow(1)}
              alignItems="center"
              justifyContent="space-between"
              onClick={() => {
                onSelect(index);
              }}
            >
              <ActionText action={action} className={Css.margin("0px 6px")} />
              {eventCount > 0 && <Mono.M10>{eventCount} Events</Mono.M10>}
            </Flex.Row>
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
      className={className}
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
  const [gitInfo] = useGitInfo();

  const selectedAction =
    selectedActionIndex > -1 ? actions[selectedActionIndex] : null;

  const schemas = gitInfo?.eventSchema?.events ?? [];
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
              setSelectedActionIndex(index);
            }
          }}
          onDelete={(index) => {
            onUpdateAction && onUpdateAction(index);
          }}
          className={Flex.grow(1)}
        />
      </Section>
      {selectedAction && (
        <>
          {selectedAction.events && selectedAction.events.length > 0 && (
            <Section title="Attached Events">
              <SelectedSchemaView
                key={selectedActionIndex}
                action={selectedAction}
                setEvents={(events) => {
                  onUpdateAction &&
                    onUpdateAction(selectedActionIndex, {
                      ...selectedAction,
                      events,
                    });
                }}
                schemas={schemas}
              />
            </Section>
          )}
          <Section title="Event Models">
            <SchemaSelector
              key={selectedActionIndex}
              action={selectedAction}
              setEvents={(events) => {
                onUpdateAction &&
                  onUpdateAction(selectedActionIndex, {
                    ...selectedAction,
                    events,
                  });
              }}
              schemas={schemas}
              className={Css.maxHeight(300)}
            />
          </Section>
        </>
      )}
    </Flex.Col>
  );
}
