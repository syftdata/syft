import { Action, isSupportedActionType } from "../types";
import { ActionText } from "../common/ActionText";
import { Css, Flex } from "../common/styles/common.styles";
import { IconButton } from "../common/components/core/Button";
import { useState } from "react";
import List from "../common/components/core/List";
import SchemaSelector, { TodoSchemas } from "../schemaselector";
import { Mono } from "../common/styles/fonts";
import { Tabs, TabsProps } from "antd";
import { Colors, backgroundCss, colorCss } from "../common/styles/colors";
import { css } from "@emotion/css";

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
  const selectedAction =
    selectedActionIndex > -1 ? actions[selectedActionIndex] : null;

  return (
    <Flex.Col className={Flex.grow(1)}>
      <Tabs
        defaultActiveKey="1"
        items={[
          {
            key: "1",
            label: `Recorded Steps`,
            children: (
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
              />
            ),
          },
        ]}
        size="small"
        tabBarStyle={{
          marginBottom: 0,
          backgroundColor: Colors.Gray.V1,
          paddingLeft: 8,
        }}
        className={Flex.grow(1)}
      />
      {selectedAction && (
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
          schemas={TodoSchemas}
          className={css(Flex.grow(1), Css.maxHeight(300))}
        />
      )}
    </Flex.Col>
  );
}
