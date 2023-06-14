/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { useState } from "react";
import Button from "./core/Button/Button";
import Input from "./core/Input/Input";
import Modal from "../components/core/Modal/Modal";
import Select from "../components/core/Input/Select";
import { Label } from "../styles/fonts";
import { Colors } from "../styles/colors";
import { Css } from "../styles/common.styles";
import { IconButton } from "./core/Button/IconButton";

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

  onCommit?: () => void;
  hasChanges?: boolean;

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

  onCommit,
  hasChanges,

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
        options={sources?.map((source) => ({
          value: source.id,
          label: source.name,
        }))}
        width={130}
        onChange={(e) => setActiveSourceById(e as string)}
      />
      <Select
        label="Branch"
        value={activeBranch}
        rowWise={rowWise}
        options={branches?.map((branch) => ({
          value: branch,
          label: branch,
        }))}
        width={130}
        onChange={(e) => setActiveBranch(e as string)}
      />
      {hasChanges && onCommit && (
        <IconButton
          icon="floppy-disc"
          label="Commit"
          color={Colors.Branding.Blue}
          onClick={() => onCommit()}
        />
      )}
      <Button
        onClick={showModal}
        type="Clear"
        size="small"
        className={Css.padding(0)}
      >
        <Label.L12 color={Colors.Branding.Blue}>+Add Branch</Label.L12>
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
