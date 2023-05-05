import AntdModal, { type ModalProps as AntdModalProps } from "antd/lib/modal";
import { Flex } from "../../../styles/common.styles";
import Button from "../Button/Button";

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
            <Button key="cancel" onClick={onCancel}>
              {cancelText ?? "Cancel"}
            </Button>
            <Button key="okay" type="Primary" onClick={onOk}>
              {okText ?? "Ok"}
            </Button>
          </Flex.Row>,
        ]
      }
    />
  );
};

export default Modal;
