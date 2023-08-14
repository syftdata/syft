import Modal from "../common/components/core/Modal/Modal";
import { ReactElement } from "../types";
import PropSelectionView from "./PropSelectionView";

export interface PropSelectorModalProps {
  tag: ReactElement;
  open: boolean;
  addProp(prop: string): void;
  onClose(): void;
}
const PropSelectorModal = ({
  tag,
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
