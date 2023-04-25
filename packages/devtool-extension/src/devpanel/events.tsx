import { ColumnsType } from "antd/es/table";
import SyftTable from "../common/components/core/Table/SyftTable";
import { SyftEvent } from "../types";
import TableCell from "../common/components/core/Table/TableCell";
import { css } from "@emotion/css";
import EventPropsRenderer from "./event";
type PanelProps = { events: SyftEvent[] }; /* could also use interface */

export const SyftEventColumns = [
  {
    title: <TableCell value="Event Name" type="header" />,
    dataIndex: "name",
    key: "name",
    render: (value, record, index) => <TableCell value={value} key={index} />,
  },
  {
    title: <TableCell value="Created At" type="header" />,
    dataIndex: "createdAt",
    key: "createdAt",
    width: 120,
    render: (value, record, index) => (
      <TableCell
        value={value ? value.toLocaleTimeString("en-US") : ""}
        key={index}
      />
    ),
  },
  {
    title: <TableCell value="Status" type="header" />,
    dataIndex: "syft_status",
    key: "syft_status",
    width: 80,
    render: (value, record, index) => (
      <TableCell
        type="enum"
        value={value.valid ? "Valid" : "Invalid"}
        key={index}
        justifyContent="end"
      />
    ),
  },
] as ColumnsType<SyftEvent>;

const Panel = ({ events }: PanelProps) => {
  if (!events) {
    return <></>;
  }
  const keyedEvents = events.map((event, idx) => ({ ...event, key: idx }));
  return (
    <SyftTable
      className={css`
        height: 100%;
        padding: 0px;
      `}
      expandable={{
        expandedRowRender: (record: SyftEvent) => (
          <EventPropsRenderer data={record.props} />
        ),
        rowExpandable: (record: SyftEvent) => record.props !== undefined,
      }}
      showHeader={false}
      columns={SyftEventColumns}
      data={keyedEvents}
    />
  );
};
export default Panel;
