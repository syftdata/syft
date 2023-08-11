import Modal from "../common/components/core/Modal/Modal";
import { ReactElement } from "../types";
import { EventSchema } from "@syftdata/common/lib/types";
import ReactPropsView from "./ReactPropsView";

export interface PropSelectorModalProps {
  tag: ReactElement;
  schema: EventSchema;
  open: boolean;
  addProp(prop: string): void;
  onCancel(): void;
}
const PropSelectorModal = ({
  tag,
  schema,
  open,
  addProp,
  onCancel,
}: PropSelectorModalProps) => {
  const innerAddProp = () => {
    addProp("test");
  };
  return (
    <Modal
      title={`Select a prop to add to ${schema.name}`}
      open={open}
      okText="Save"
      onOk={innerAddProp}
      onCancel={onCancel}
    >
      <ReactPropsView
        element={tag}
        schema={schema}
        filterNulls={true}
        expandAll={true}
      />
    </Modal>
  );
};
export default PropSelectorModal;
