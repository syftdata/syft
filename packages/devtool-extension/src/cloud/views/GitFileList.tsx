import { ColumnsType } from "antd/lib/table";
import SyftTable from "../../common/components/core/Table/SyftTable";
import TableCell from "../../common/components/core/Table/TableCell";
import { useGitInfo } from "../state/gitinfo";
import { FileInfo } from "../../types";
import Section from "../../common/components/core/Section";
import { IconButton } from "../../common/components/core/Button/IconButton";
import { deleteTestSpec } from "../api/git";
import { useUserSession } from "../state/usersession";
import Spinner from "../../common/components/core/Spinner/Spinner";

export interface GitFileListProps {
  onPreview: (test: FileInfo) => void;
  onEdit: (test: FileInfo) => void;
}

const GitFileList = ({ onPreview, onEdit }: GitFileListProps) => {
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
        onPreview(record);
      },
    };
  };
  columns[2].onCell = (record) => {
    return {
      onClick: async () => {
        if (record.content == null) {
          return;
        }
        onEdit(record);
      },
    };
  };
  columns[3].onCell = (record) => {
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
    dataIndex: "edit",
    key: "edit",
    width: 32,
    render: (value, record, index) => {
      return (
        <TableCell key={index} type="custom" justifyContent="end">
          <IconButton icon="edit" />
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
