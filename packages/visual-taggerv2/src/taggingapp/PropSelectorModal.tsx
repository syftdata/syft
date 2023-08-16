import { Field } from "@syftdata/common/lib/types";
import Modal from "../common/components/core/Modal/Modal";
import { ReactElement } from "../types";
import PropSelectionView from "./PropSelectionView";
import Input from "../common/components/core/Input/Input";
import { useRef, useState } from "react";
import { Flex } from "../common/styles/common.styles";
import Section from "../common/components/core/Section";
import { IconButton } from "../common/components/core/Button/IconButton";
import { Colors } from "../common/styles/colors";
import type RcTree from "rc-tree";

export interface PropSelectorModalProps {
  tag: ReactElement;
  field?: Field;
  open: boolean;
  updateField(field: Field, oldField?: Field): void;
  onClose(): void;
}
const PropSelectorModal = ({
  tag,
  field,
  open,
  updateField,
  onClose,
}: PropSelectorModalProps) => {
  const originalField: Field = field ?? {
    name: "",
    type: {
      name: "string",
      zodType: "z.string()",
      isArray: false,
    },
    isOptional: false,
  };
  const [name, setName] = useState(originalField.name);
  const [disableSearch, setDisableSearch] = useState(false);
  const treeRef = useRef<RcTree>(null);

  const onOK = () => {
    updateField(
      {
        ...originalField,
        name,
        rename: treeRef.current?.state.checkedKeys[0] as string,
      },
      field
    );
    onClose();
  };
  return (
    <Modal title={`Edit the field`} open={open} onOk={onOK} onCancel={onClose}>
      <Flex.Col gap={8}>
        <Input
          label="Name"
          defaultValue={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Section
          title="Source property"
          extraButtons={
            <IconButton
              icon="magic-wand"
              color={disableSearch ? Colors.Secondary.Salmon : Colors.Gray.V3}
              onClick={() => setDisableSearch(!disableSearch)}
            />
          }
          expandable={true}
        >
          <PropSelectionView
            ref={treeRef}
            element={tag}
            searchValue={!disableSearch ? name : undefined}
            filterNulls={true}
            checkedKey={field?.rename}
          />
        </Section>
      </Flex.Col>
    </Modal>
  );
};
export default PropSelectorModal;
