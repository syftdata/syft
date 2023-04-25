import { Action, isSupportedActionType } from "../types";
import { ActionText } from "../common/ActionText";
import { ColumnsType } from "antd/es/table";
import SyftTable from "../common/components/core/Table/SyftTable";
import TableCell from "../common/components/core/Table/TableCell";
import { css } from "@emotion/css";
import { Css, Flex } from "../common/styles/common.styles";
import { IconButton } from "../common/components/core/Button";

const BaseSyftActionColumns = [
  {
    title: "Object",
    dataIndex: "action",
    key: "action",
    render: (value, record, index) => (
      <TableCell key={index} type="custom" className={Css.padding("2px 0")}>
        <ActionText action={value} />
      </TableCell>
    ),
  },
] as ColumnsType<Action>;
export const SyftActionColumns = (onAddEvent?: (action: Action) => void) => {
  if (!onAddEvent) return BaseSyftActionColumns;
  return [
    ...BaseSyftActionColumns,
    {
      title: "Actions",
      dataIndex: "action",
      key: "action",
      render: (value, record, index) => (
        <TableCell key={index} type="custom" className={Css.padding("2px 0")}>
          <Flex.Row>
            <IconButton
              label="Add Event"
              icon="plus"
              onClick={() => onAddEvent(value)}
            />
          </Flex.Row>
        </TableCell>
      ),
    },
  ] as ColumnsType<Action>;
};

export default function ActionList({
  actions,
  onAddEvent,
}: {
  actions: Action[];
  onAddEvent?: (action: Action) => void;
}) {
  const keyedActions = actions
    .filter((action) => isSupportedActionType(action.type))
    .map((action, key) => ({ action, key }));
  return (
    <SyftTable
      className={css`
        height: 100%;
        padding: 0px;
      `}
      showHeader={false}
      columns={SyftActionColumns(onAddEvent)}
      data={keyedActions}
    />
  );
}
