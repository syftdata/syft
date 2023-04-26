import React from "react";
import { SyftEvent } from "../types";
import "./index.css";
import { Flex } from "../common/styles/common.styles";
import Card from "../common/components/core/Card";
import List from "../common/components/core/List";
import { Mono } from "../common/styles/fonts";
import EventPropsRenderer from "./event";

const EventApp = ({
  events,
  clear,
}: {
  events: SyftEvent[];
  clear: () => void;
}) => {
  const [search, setSearch] = React.useState("");
  let filteredEvents = events;
  const searchStr = search.trim().toLowerCase();
  if (searchStr !== "") {
    filteredEvents = filteredEvents.filter(
      (event) =>
        event.name.toLowerCase().includes(searchStr) ||
        event.props.path?.toLowerCase().includes(searchStr)
    );
  }
  return (
    <Card className={Flex.grow(1)}>
      <List<SyftEvent>
        data={filteredEvents}
        renderItem={(event) => (
          <Flex.Row alignItems="center" justifyContent="space-between">
            <Mono.M12 className={Flex.grow(1)}>{event.name}</Mono.M12>
            <Mono.M10>
              {event.createdAt
                ? event.createdAt.toLocaleTimeString("en-US")
                : ""}
            </Mono.M10>
          </Flex.Row>
        )}
        search={{
          searchPlaceHolder: "Search",
          setSearch,
          search,
        }}
        expandable={{
          renderItem: (item) => <EventPropsRenderer data={item.props} />,
        }}
      />
    </Card>
  );
};
export default EventApp;
