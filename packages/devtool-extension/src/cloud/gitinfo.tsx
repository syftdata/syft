import { useEffect, useState } from "react";
import { EventSchema, LoginResponse } from "../types";
import List from "../common/components/core/List";
import { Css, Flex } from "../common/styles/common.styles";
import { Mono } from "../common/styles/fonts";
import { IconButton } from "../common/components/core/Button";
import { css } from "@emotion/css";
import Section from "../common/components/core/Section";

export interface GitInfoProps {
  className?: string;
  loginResponse?: LoginResponse | null;
}

const GitInfo = ({ className, loginResponse }: GitInfoProps) => {
  const [search, setSearch] = useState("");
  // TODO: show selected items at the top.
  if (!loginResponse) {
    return <div>Not Logged in</div>;
  }
  const files = loginResponse.files.filter((file) => file.includes(search));
  return (
    <Section title="Git Info" className={className}>
      <Flex.Col>
        <Mono.M14>Branch: {loginResponse.activeBranch}</Mono.M14>
        <List<string>
          data={files}
          renderItem={(item) => {
            return (
              <Flex.Row
                alignItems="center"
                justifyContent="space-between"
                className={css(Flex.grow(1), Css.margin("0px 6px"))}
              >
                <Flex.Col gap={4}>
                  <Mono.M12>{item}</Mono.M12>
                </Flex.Col>
                <IconButton icon="edit" onClick={() => {}} />
              </Flex.Row>
            );
          }}
          search={{
            searchPlaceHolder: "Search scripts",
            search,
            setSearch,
          }}
        />
      </Flex.Col>
    </Section>
  );
};

export default GitInfo;
