import AntdModal, { type ModalProps as AntdModalProps } from "antd/lib/modal";
import { Flex } from "../../../styles/common.styles";
import Button from "../Button/Button";
import { Subheading } from "../../../styles/fonts";
import { Colors } from "../../../styles/colors";

export interface ModalProps extends AntdModalProps {
  className?: string;
}
const Modal = ({
  okText,
  cancelText,
  onOk,
  onCancel,
  footer,
  className,
  ...otherModalProps
}: ModalProps) => {
  return (
    <AntdModal
      {...otherModalProps}
      className={className}
      onOk={onOk}
      onCancel={onCancel}
      footer={
        footer ?? [
          <Flex.Row gap={4} key="footer" justifyContent="end">
            <Button key="cancel" type="Clear" onClick={onCancel}>
              <Subheading.SH12 color={Colors.Gray.V7}>
                {cancelText ?? "Cancel"}
              </Subheading.SH12>
            </Button>
            <Button key="okay" type="Primary" onClick={onOk}>
              <Subheading.SH12>{okText ?? "Ok"}</Subheading.SH12>
            </Button>
          </Flex.Row>,
        ]
      }
    />
  );
};

export default Modal;
