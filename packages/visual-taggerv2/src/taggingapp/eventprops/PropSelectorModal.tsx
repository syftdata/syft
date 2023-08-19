import { Field } from "@syftdata/common/lib/types";
import Modal from "../../common/components/core/Modal/Modal";
import { ReactElement } from "../../types";
import PropSelectionView from "./PropSelectionView";
import Input from "../../common/components/core/Input/Input";
import { useRef, useState } from "react";
import { Flex } from "../../common/styles/common.styles";
import Section from "../../common/components/core/Section";
import { IconButton } from "../../common/components/core/Button/IconButton";
import { Colors } from "../../common/styles/colors";
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
      zodType: "z.string().optional()",
      isArray: false,
    },
    isOptional: true,
  };
  const [name, setName] = useState(originalField.name);
  const [transfrom, setTransform] = useState(originalField.name);
  const [disableSearch, setDisableSearch] = useState(false);
  const treeRef = useRef<RcTree>(null);

  const onOK = () => {
    const source = treeRef.current?.state.checkedKeys[0] as string;
    const _name =
      (name !== "" ? name : (source.split(".").pop() as string)) ?? "";
    updateField(
      {
        ...originalField,
        name: _name,
        rename: source,
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
              color={disableSearch ? Colors.Gray.V3 : Colors.Branding.Blue}
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
        <Section title="Customize" defaultExpanded={false} expandable={true}>
          <Input
            label="Transform"
            defaultValue={name}
            onChange={(e) => setTransform(e.target.value)}
          />
        </Section>
      </Flex.Col>
    </Modal>
  );
};
export default PropSelectorModal;
