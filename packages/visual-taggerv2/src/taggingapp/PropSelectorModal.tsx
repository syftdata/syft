import Modal from "../common/components/core/Modal/Modal";
import { ReactElement } from "../types";
import PropSelectionView from "./PropSelectionView";

export interface PropSelectorModalProps {
  tag: ReactElement;
  fieldName: string;
  open: boolean;
  addProp(prop: string): void;
  onClose(): void;
}
const PropSelectorModal = ({
  tag,
  fieldName,
  open,
  addProp,
  onClose,
}: PropSelectorModalProps) => {
  return (
    <Modal
      title={`Select a source prop`}
      open={open}
      onOk={onClose}
      onCancel={onClose}
    >
      <PropSelectionView
        element={tag}
        defaultSearchValue={fieldName}
        filterNulls={true}
        onAddField={(key) => {
          addProp(key);
          // close the modal
        }}
      />
    </Modal>
  );
};
export default PropSelectorModal;
