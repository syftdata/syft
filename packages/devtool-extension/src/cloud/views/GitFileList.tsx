import { ColumnsType } from "antd/lib/table";
import SyftTable from "../../common/components/core/Table/SyftTable";
import TableCell from "../../common/components/core/Table/TableCell";
import { useGitInfo } from "../state/gitinfo";
import { FileInfo } from "../../types";
import Section from "../../common/components/core/Section";
import { IconButton } from "../../common/components/core/Button";
import { deleteTestSpec } from "../api/git";
import { useUserSession } from "../state/usersession";
import { runScriptSteps } from "../../replay";

const GitFileList = () => {
  const [gitInfo] = useGitInfo();
  const [userSession] = useUserSession();
  if (gitInfo == null || userSession == null) {
    return <></>;
  }
  const columns = FileInfoColumns;
  columns[1].onCell = (record) => {
    return {
      onClick: async () => {
        if (record.content == null) {
          return;
        }
        await runScriptSteps(JSON.parse(record.content).steps);
      },
    };
  };
  columns[2].onCell = (record) => {
    return {
      onClick: async () => {
        await deleteTestSpec(record.name, record.sha, userSession);
      },
    };
  };
  return (
    <Section title="Previous Recordings">
      <SyftTable columns={FileInfoColumns} data={gitInfo.files} rowKey="path" />
    </Section>
  );
};

export default GitFileList;

export const FileInfoColumns = [
  {
    dataIndex: "name",
    key: "name",
    render: (value, record, index) => <TableCell value={value} key={index} />,
  },
  {
    dataIndex: "play",
    key: "play",
    width: 32,
    render: (value, record, index) => {
      return (
        <TableCell key={index} type="custom" justifyContent="end">
          <IconButton icon="play" />
        </TableCell>
      );
    },
  },
  {
    dataIndex: "delete",
    key: "delete",
    width: 32,
    render: (value, record, index) => {
      return (
        <TableCell key={index} type="custom" justifyContent="end">
          <IconButton icon="trash" />
        </TableCell>
      );
    },
  },
] as ColumnsType<FileInfo>;
