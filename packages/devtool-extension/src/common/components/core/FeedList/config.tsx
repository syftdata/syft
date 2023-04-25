import { Colors } from "../../../styles/colors";
import { Css, Flex } from "../../../styles/common.styles";
import { Subheading } from "../../../styles/fonts";
import Icon, { IconName } from "../Icon/Icon";
import type { DoubleRowCellValue } from "../Table/TableCell";
import TableCell from "../Table/TableCell";

export interface FeedListConfig {
  key: string;
  icon: IconName;
  value: DoubleRowCellValue;
  date: Date;
}

export const FeedListColumns = [
  {
    dataIndex: "icon",
    key: "icon",
    width: 25,
    render: (value: IconName, record: unknown, index: number) => (
      <Icon icon={value} />
    ),
  },
  {
    dataIndex: "value",
    key: "value",
    width: 400,
    render: (value: DoubleRowCellValue, record: unknown, index: number) => (
      <TableCell type="custom" key={index} className={Css.width("fit-content")}>
        <Flex.Col gap={2} className={Css.width("fit-content")}>
          <Subheading.SH12>{value.title}</Subheading.SH12>
          <Subheading.SH10 color={Colors.Gray.V9}>
            {value.subTitle}
          </Subheading.SH10>
        </Flex.Col>
      </TableCell>
    ),
  },
  {
    dataIndex: "date",
    key: "date",
    width: 50,
    render: (value: Date, record: unknown, index: number) => (
      <TableCell type="custom" key={index}>
        <Flex.Col gap={2} alignItems="end">
          <Subheading.SH10>
            {value?.toLocaleDateString("en-US", {
              month: "2-digit",
              day: "2-digit",
              year: "numeric",
            })}
          </Subheading.SH10>
          <Subheading.SH10 color={Colors.Gray.V9}>
            {value?.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Subheading.SH10>
        </Flex.Col>
      </TableCell>
    ),
  },
];
