import { useState } from "react";
import { Event } from "../types";
import List from "../common/components/core/List";
import { Css, Flex } from "../common/styles/common.styles";
import { Mono } from "../common/styles/fonts";
import SchemaPropsRenderer from "./schema";
import { IconButton } from "../common/components/core/Button/IconButton";
import { css } from "@emotion/css";
import { useGitInfo } from "../cloud/state/gitinfo";
import NoSchemasView from "./noschemasview";

export interface SchemaAppProps {
  className?: string;
}

const SchemaApp = ({ className }: SchemaAppProps) => {
  const [search, setSearch] = useState("");
  const [gitInfo] = useGitInfo();

  let filteredSchemas = gitInfo?.eventSchema?.events ?? [];

  if (filteredSchemas.length === 0) {
    return <NoSchemasView />;
  }

  const searchStr = search.trim().toLowerCase();
  if (searchStr !== "") {
    filteredSchemas = filteredSchemas.filter((schema) =>
      schema.name.toLowerCase().includes(searchStr)
    );
  }

  // TODO: show selected items at the top.
  return (
    <Flex.Col className={className}>
      <List<Event>
        data={filteredSchemas}
        emptyMessage="No Event Models found."
        renderItem={(item) => {
          return (
            <Flex.Row
              alignItems="center"
              justifyContent="space-between"
              className={css(Flex.grow(1), Css.margin("0px 6px"))}
            >
              <Flex.Col gap={4}>
                <Mono.M14>{item.name}</Mono.M14>
                <Mono.M10>{item.description}</Mono.M10>
              </Flex.Col>
              <IconButton icon="edit" onClick={() => {}} />
            </Flex.Row>
          );
        }}
        search={{
          searchPlaceHolder: "Search for Event Models",
          search,
          setSearch,
          actions: [<IconButton icon="plus" label="Add" />],
        }}
        expandable={{
          renderItem: (item) => <SchemaPropsRenderer data={{ schema: item }} />,
        }}
      />
    </Flex.Col>
  );
};

export default SchemaApp;
