import { useEffect, useState } from "react";
import { EventSchema } from "../types";
import List from "../common/components/core/List";
import { Css, Flex } from "../common/styles/common.styles";
import { Mono } from "../common/styles/fonts";
import SchemaPropsRenderer from "./schema";
import {
  IconButton,
  PrimaryIconButton,
} from "../common/components/core/Button";
import { css } from "@emotion/css";
import { TodoSchemas } from "./mockdata";

export interface SchemaAppProps {
  className?: string;
}

const SchemaApp = ({ className }: SchemaAppProps) => {
  const [search, setSearch] = useState("");
  const [schemas, setSchemas] = useState<EventSchema[]>([]);

  const loadSchemas = () => {
    setSchemas(TodoSchemas);
    // // Fetching data from FaceBook Jest Repo
    // fetch("http://127.0.0.1:8085/", {
    //   method: "GET",
    //   headers: new Headers({
    //     Accept: "application/json",
    //   }),
    // })
    //   .then((res) => res.json())
    //   .then((response) => setSchemas(response.schemas))
    //   .catch((error) => console.log(error));
  };

  useEffect(() => {
    loadSchemas();
  }, []);

  let filteredSchemas = schemas;
  const searchStr = search.trim().toLowerCase();
  if (searchStr !== "") {
    filteredSchemas = schemas.filter((schema) =>
      schema.name.toLowerCase().includes(searchStr)
    );
  }

  // TODO: show selected items at the top.
  return (
    <Flex.Col className={className}>
      <List<EventSchema>
        data={filteredSchemas}
        renderItem={(item) => {
          return (
            <Flex.Row
              alignItems="center"
              justifyContent="space-between"
              className={css(Flex.grow(1), Css.margin("0px 6px"))}
            >
              <Flex.Col gap={4}>
                <Mono.M14>{item.name}</Mono.M14>
                <Mono.M10>{item.documentation}</Mono.M10>
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
