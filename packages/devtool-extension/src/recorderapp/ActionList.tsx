import { Action, isSupportedActionType } from "../types";
import { ActionText } from "../common/ActionText";
import { Flex } from "../common/styles/common.styles";
import { IconButton } from "../common/components/core/Button";
import { useState } from "react";
import List from "../common/components/core/List";
import SchemaSelector, { TodoSchemas } from "../schemaselector";
import { Mono } from '../common/styles/fonts';

export default function ActionList({
  actions,
  onUpdateAction,
}: {
  actions: Action[];
  onUpdateAction?: (index: number, action: Action) => void;
}) {
  // select the last action by default.
  const [selectedActionIndex, setSelectedActionIndex] = useState<number>(-1);
  const _actions = actions.filter((action) =>
    isSupportedActionType(action.type)
  );
  const selectedAction = selectedActionIndex > -1 ? actions[selectedActionIndex] : null;
  return (
    <Flex.Col className={Flex.grow(1)}>
      <List<Action>
        data={_actions}
        renderItem={(action, index) => {
          const eventCount = action.events?.length ?? 0;
          return (
            <Flex.Row gap={4} alignItems='center' className={Flex.grow(1)}>
              <ActionText action={action} className={Flex.grow(1)} />
              {<Mono.M10>{eventCount} Events</Mono.M10>}
              {onUpdateAction && (
                <IconButton
                  icon="edit"
                  onClick={() => {
                    if (selectedActionIndex !== index) {
                      setSelectedActionIndex(index);
                    } else {
                      setSelectedActionIndex(-1);
                    }
                  }}
                />
              )}
            </Flex.Row>
          );
        }}
      />
      {
        selectedAction && (
        <SchemaSelector 
          key={selectedActionIndex}
          action={selectedAction}
          setEvents={(events) => {
            onUpdateAction && onUpdateAction(selectedActionIndex, {
              ...selectedAction,
              events
            });
            setSelectedActionIndex(-1);
          }}
          schemas={TodoSchemas} 
        />
        )
      }
    </Flex.Col>
  );
}
