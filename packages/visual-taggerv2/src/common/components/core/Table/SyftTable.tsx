import { css } from "@emotion/css";
import Table, { type ColumnsType } from "antd/lib/table";
import { Colors } from "../../../styles/colors";
import { Css, Flex } from "../../../styles/common.styles";
import { type ExpandableConfig } from "antd/lib/table/interface";

interface SyftTableProps {
  columns: ColumnsType<any>;
  data?: any[];
  showHeader?: boolean;
  className?: string;
  expandable?: ExpandableConfig<any>;
  rowKey?: string;
  emptyMessage?: React.ReactNode;
  onRowClick?: (data: any, index?: number) => void;
}
const SyftTable = ({
  columns,
  data,
  showHeader = true,
  className,
  expandable,
  rowKey,
  emptyMessage,
  onRowClick,
}: SyftTableProps) => {
  if (emptyMessage && (!data || data.length === 0)) {
    return <>{emptyMessage}</>;
  }
  return (
    <Flex.Col
      className={css(
        Css.background(Colors.White),
        Css.border(`1px solid ${Colors.Gray.V1}`),
        Css.padding("12px 16px"),
        Css.overflow("hidden"),
        className
      )}
    >
      <Flex.Col className={Css.overflow("hidden auto")}>
        <Table
          columns={columns}
          expandable={expandable}
          dataSource={data}
          pagination={false}
          sticky
          size="small"
          showHeader={showHeader}
          rowKey={rowKey}
          onRow={(record, rowIndex) => {
            return {
              onClick: () => onRowClick?.(record, rowIndex),
            };
          }}
        />
      </Flex.Col>
    </Flex.Col>
  );
};

export default SyftTable;
