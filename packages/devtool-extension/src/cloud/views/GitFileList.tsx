import { ColumnsType } from "antd/lib/table";
import SyftTable from "../../common/components/core/Table/SyftTable";
import TableCell from "../../common/components/core/Table/TableCell";
import { useGitInfo } from "../state/gitinfo";
import { FileInfo } from "../../types";
import Section from "../../common/components/core/Section";

const GitFileList = () => {
  const [gitInfo] = useGitInfo();
  if (gitInfo == null) {
    return <></>;
  }
  return (
    <Section title="Previous Recordings">
      <SyftTable columns={FileInfoColumns} data={gitInfo.files} rowKey="name" />
    </Section>
  );
};

export default GitFileList;

export const FileInfoColumns = [
  {
    dataIndex: "name",
    key: "name",
    render: (value, record, index) => (
      <TableCell value={value} key={index} type="mono" />
    ),
  },
  {
    dataIndex: "size",
    key: "size",
    render: (value, record, index) => (
      <TableCell value={value} key={index} type="mono" />
    ),
  },
] as ColumnsType<FileInfo>;
