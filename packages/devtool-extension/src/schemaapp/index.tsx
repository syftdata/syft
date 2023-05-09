import { useState } from "react";
import { Event } from "../types";
import List from "../common/components/core/List";
import { Css, Flex } from "../common/styles/common.styles";
import { Label, Mono } from "../common/styles/fonts";
import SchemaPropsRenderer from "./schema";
import { IconButton } from "../common/components/core/Button/IconButton";
import { css } from "@emotion/css";
import { useGitInfo } from "../cloud/state/gitinfo";
import NoSchemasView from "./noschemasview";
import Button from "../common/components/core/Button/Button";
import { createTab } from "../common/utils";
import { Colors } from "../common/styles/colors";
import { constants } from "../constants";
import Spinner from "../common/components/core/Spinner/Spinner";
import { useUserSession } from "../cloud/state/usersession";
import LoginView from "../cloud/views/LoginView";

export interface SchemaAppProps {
  className?: string;
}

const SchemaApp = ({ className }: SchemaAppProps) => {
  const [userSession] = useUserSession();
  const [search, setSearch] = useState("");
  const [gitInfo] = useGitInfo();

  if (!userSession) {
    return <LoginView />;
  }
  if (!gitInfo) {
    return <Spinner />;
  }

  let filteredSchemas = gitInfo.eventSchema.events;
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
        emptyMessage={<NoSchemasView />}
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
              <IconButton
                icon="edit"
                onClick={() => {
                  createTab(constants.EditSchemaUrl(item.id));
                }}
              />
            </Flex.Row>
          );
        }}
        search={{
          searchPlaceHolder: "Search for Event Models",
          search,
          setSearch,
          actions: [
            <Button
              onClick={() => {
                createTab(constants.AddSchemaUrl);
              }}
              type="Clear"
              size="small"
              className={Css.padding(0)}
            >
              <Label.L10 color={Colors.Branding.DarkBlue}>+ Add</Label.L10>
            </Button>,
          ],
        }}
        expandable={{
          renderItem: (item) => <SchemaPropsRenderer data={{ schema: item }} />,
        }}
      />
    </Flex.Col>
  );
};

export default SchemaApp;
