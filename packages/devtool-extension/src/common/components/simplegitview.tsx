/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { useState } from "react";
import Button from "./core/Button/Button";
import Input from "./core/Input/Input";
import Modal from "../components/core/Modal/Modal";
import Select, { SelectOption } from "../components/core/Input/Select";
import { Label, Paragraph } from "../styles/fonts";

export interface GitEventSource {
  id: string;
  name: string;
}

export interface SimpleGitViewProps {
  sources?: GitEventSource[];
  activeSource: GitEventSource | undefined;
  setActiveSourceById: (sourceId: string) => void;

  branches?: string[];
  activeBranch: string;
  setActiveBranch: (branch: string) => void;
  createBranch: (branch: string) => void;

  rowWise?: boolean;
}

export function SimpleGitView({
  sources,
  activeSource,
  setActiveSourceById,
  branches,
  activeBranch,
  setActiveBranch,
  createBranch,

  rowWise,
}: SimpleGitViewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBranch, setNewBranch] = useState("");

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    createBranch(newBranch);
    setNewBranch("");
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setNewBranch("");
    setIsModalOpen(false);
  };

  return (
    <>
      <Select
        label="Source"
        value={activeSource?.id}
        rowWise={rowWise}
        onChange={(e) => setActiveSourceById(e as string)}
      >
        {sources?.map((source, key) => (
          <SelectOption key={key} value={source.id}>
            {source.name}
          </SelectOption>
        ))}
      </Select>
      <Select
        label="Branch"
        value={activeBranch}
        rowWise={rowWise}
        onChange={(e) => setActiveBranch(e as string)}
      >
        {branches?.map((branch, key) => (
          <SelectOption key={key} value={branch}>
            {branch}
          </SelectOption>
        ))}
      </Select>
      <Button onClick={showModal} type="Clear" size="small">
        <Label.L12>+ Add Branch</Label.L12>
      </Button>
      <Modal
        open={isModalOpen}
        okText="Create"
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Input
          label="Branch Name"
          placeholder="Branch Name goes here.."
          value={newBranch}
          onChange={(e) => setNewBranch(e.target.value)}
        />
      </Modal>
    </>
  );
}
