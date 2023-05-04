import { useEffect, useState } from "react";
import { LoginResponse } from "../types";
import { GitView } from "../common/components/gitview";
import { EventSource } from "../types";

export interface GitInfoProps {
  className?: string;
  loginResponse?: LoginResponse | null;
}

const GitInfo = ({ className, loginResponse }: GitInfoProps) => {
  const sources = loginResponse?.sources;
  const branches = loginResponse?.branches;
  const files = loginResponse?.files ?? [];

  const [activeSource, setActiveSource] = useState<EventSource | undefined>();
  const [branch, setBranch] = useState<string>("");

  const setActiveSourceById = (sourceId: string) => {
    if (loginResponse == null) {
      return;
    }
    loginResponse.activeSourceId = sourceId;
    const source = sources?.find((source) => source.id == sourceId);
    setActiveSource(source);
  };

  const setActiveBranch = (branch: string) => {
    if (loginResponse == null) {
      return;
    }
    loginResponse.activeBranch = branch;
    setBranch(branch);
  };

  useEffect(() => {
    if (activeSource == null && loginResponse?.activeSourceId != null) {
      setActiveSourceById(loginResponse.activeSourceId);
    }
  }, [loginResponse]);
  useEffect(() => {
    if (sources?.length) {
      setActiveSource(sources[0]);
    }
  }, [sources]);
  useEffect(() => {
    if (branch == "" && branches != null && branches.length > 0) {
      setBranch(branches[0]!);
    }
  }, [branch, branches]);

  // TODO: show selected items at the top.
  if (!loginResponse) {
    return <div>Not Logged in</div>;
  }

  const createBranch = (branch: string) => {};

  const deleteBranch = (branch: string) => {};

  return (
    <GitView
      sources={loginResponse.sources}
      activeSource={activeSource}
      setActiveSourceById={setActiveSourceById}
      branches={branches}
      branch={branch}
      setBranch={setActiveBranch}
      files={files}
      deleteBranch={deleteBranch}
      createBranch={createBranch}
    />
  );
};

export default GitInfo;
