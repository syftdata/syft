import { Action, ActionType, EventTag } from "../types";
import Section from "../common/components/core/Section";
import { SelectedSchemaView } from "../schemaapp/selector";
import { EventSchema } from "@syftdata/common/lib/types";
import ElementView from "./ElementView";

export interface TagDetailedViewProps {
  tag?: EventTag;

  startEditTagFlow: () => void;
  onUpdateTag: (action?: Action) => void;
  schemas: EventSchema[];
}

export default function TagDetailedView({
  tag,
  startEditTagFlow,
  onUpdateTag,
  schemas,
}: TagDetailedViewProps) {
  if (!tag) {
    return <></>;
  }

  return (
    <>
      <SelectedSchemaView
        action={tag}
        onEdit={startEditTagFlow}
        setEvents={(events) => {
          onUpdateTag({
            ...tag,
            events,
          });
        }}
        schemas={schemas}
      />
      {tag.type !== ActionType.Load && (
        <Section title="Interaction">
          <ElementView action={tag} />
        </Section>
      )}
    </>
  );
}
