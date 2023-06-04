import { Action } from "../types";
import { Css } from "../common/styles/common.styles";
import Section from "../common/components/core/Section";
import SchemaSelector, { SelectedSchemaView } from "../schemaapp/selector";
import { useGitInfoContext } from "../cloud/state/gitinfo";

export interface ActionEditorProps {
  action: Action;
  onUpdateAction?: (action?: Action) => void;
}

export default function ActionEditor({
  action,
  onUpdateAction,
}: ActionEditorProps) {
  const { gitInfoState } = useGitInfoContext();
  const gitInfo = gitInfoState.info;
  const schemas = gitInfo?.eventSchema?.events ?? [];
  return (
    <>
      {action.events && action.events.length > 0 && (
        <Section title="Attached Events">
          <SelectedSchemaView
            action={action}
            setEvents={(events) => {
              onUpdateAction &&
                onUpdateAction({
                  ...action,
                  events,
                });
            }}
            schemas={schemas}
          />
        </Section>
      )}
      <Section title="Event Models">
        <SchemaSelector
          action={action}
          setEvents={(events) => {
            onUpdateAction &&
              onUpdateAction({
                ...action,
                events,
              });
          }}
          schemas={schemas}
          className={Css.maxHeight(300)}
        />
      </Section>
    </>
  );
}
