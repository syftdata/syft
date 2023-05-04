/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type { ColumnsType } from "antd/lib/table";
import LabelledTile from "./core/Tile/LabelledTile";
import { Flex } from "../styles/common.styles";
import { Colors } from "../styles/colors";
import { useState } from "react";
import Button from "./core/Button/Button";
import SyftTable from "./core/Table/SyftTable";
import Input from "./core/Input/Input";
import { Label, Subheading } from "../styles/fonts";
import TableCell from "./core/Table/TableCell";

// TODO: The location of this file is not ideal.
// We are sharing this component with a chrome extension.
// Keeping it here keeps the imports consistent, but it's not ideal.

export interface FileInfo {
  name: string;
  size: number;
  created?: Date;
  updated?: Date;
  updatedBy?: string;
}

export interface GitEventSource {
  id: string;
  name: string;
}

export interface GitViewProps {
  sources?: GitEventSource[];
  branches?: string[];
  files: FileInfo[];
  branch: string;
  setBranch: (branch: string) => void;
  createBranch: (branch: string) => void;
  deleteBranch: (branch: string) => void;

  activeSource: GitEventSource | undefined;
  setActiveSourceById: (sourceId: string) => void;
}

export function GitView({
  sources,
  branches,
  files,
  branch,
  setBranch,
  createBranch,
  deleteBranch,
  activeSource,
  setActiveSourceById,
}: GitViewProps) {
  const [newBranch, setNewBranch] = useState("");
  return (
    <Flex.Col gap={24}>
      <LabelledTile label="Branches" className={Flex.grow(1)}>
        <Flex.Col gap={8}>
          <Flex.Row alignItems="center" gap={8}>
            <Label.L10 color={Colors.Gray.V5}>Source</Label.L10>
            <select
              value={activeSource?.id}
              onChange={(e) => setActiveSourceById(e.target.value)}
            >
              {sources?.map((source, key) => (
                <option key={key} value={source.id}>
                  {source.name}
                </option>
              ))}
            </select>
          </Flex.Row>
          <Flex.Row alignItems="center" gap={8}>
            <Label.L10 color={Colors.Gray.V5}>Branch</Label.L10>
            <select value={branch} onChange={(e) => setBranch(e.target.value)}>
              {branches?.map((branch, key) => (
                <option key={key} value={branch}>
                  {branch}
                </option>
              ))}
            </select>
            <Button onClick={() => deleteBranch(branch)} size="small">
              Delete
            </Button>
          </Flex.Row>
        </Flex.Col>
      </LabelledTile>
      <LabelledTile label="Scripts" className={Flex.grow(1)}>
        <SyftTable columns={FileInfoColumns} data={files} />
      </LabelledTile>
      <LabelledTile label="Create Branch" className={Flex.grow(1)}>
        <Flex.Col gap={10}>
          <Input
            label="Branch Name"
            placeholder="main2"
            value={newBranch}
            onChange={(e) => setNewBranch(e.target.value)}
          />
          <Flex.Row justifyContent="end">
            <Button type="Primary" onClick={() => createBranch(newBranch)}>
              <Subheading.SH12>Add</Subheading.SH12>
            </Button>
          </Flex.Row>
        </Flex.Col>
      </LabelledTile>
    </Flex.Col>
  );
}

export const FileInfoColumns = [
  {
    title: <TableCell value="Script Name" type="header" />,
    dataIndex: "name",
    key: "name",
    render: (value, record, index) => (
      <TableCell value={value} key={index} type="mono" />
    ),
  },
  // {
  //   title: <TableCell value="Updated At" type="header" justifyContent="end" />,
  //   dataIndex: "updated",
  //   key: "updated",
  //   render: (value, record, index) => (
  //     <TableCell
  //       value={value?.toLocaleString("en-US", {
  //         month: "numeric",
  //         day: "numeric",
  //         year: "numeric",
  //         hour: "numeric",
  //         minute: "numeric",
  //         hour12: true,
  //       })}
  //       key={index}
  //       type="mono"
  //       justifyContent="end"
  //     />
  //   ),
  // },
  // {
  //   title: <TableCell value="Updated By" type="header" />,
  //   dataIndex: "updatedBy",
  //   key: "updatedBy",
  //   render: (value, record, index) => (
  //     <TableCell value={value} key={index} type="mono" />
  //   ),
  // },
  // {
  //   title: <TableCell value="Created At" type="header" justifyContent="end" />,
  //   dataIndex: "created",
  //   key: "create",
  //   render: (value, record, index) => (
  //     <TableCell
  //       value={value?.toLocaleString("en-US", {
  //         month: "numeric",
  //         day: "numeric",
  //         year: "numeric",
  //         hour: "numeric",
  //         minute: "numeric",
  //         hour12: true,
  //       })}
  //       key={index}
  //       type="mono"
  //       justifyContent="end"
  //     />
  //   ),
  // },
] as ColumnsType<FileInfo>;
