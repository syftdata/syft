import { useState } from "react";
import { SyftEvent } from "../types";
import { Flex } from "../common/styles/common.styles";
import List from "../common/components/core/List";
import { Mono } from "../common/styles/fonts";
import EventPropsRenderer from "./event";
import Button from "../common/components/core/Button/Button";
import { IconButton } from "../common/components/core/Button/IconButton";

const EventApp = ({
  events,
  clear,
}: {
  events: SyftEvent[];
  clear: () => void;
}) => {
  const [search, setSearch] = useState("");
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
    <Flex.Col gap={4}>
      <List<SyftEvent>
        data={filteredEvents}
        className={Flex.grow(1)}
        emptyMessage="Instrumented events will appear here."
        renderItem={(event) => (
          <Flex.Row
            alignItems="center"
            justifyContent="space-between"
            className={Flex.grow(1)}
          >
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
      {/* <Flex.Row gap={4}>
        <IconButton size="small" icon="trash" label="Clear" onClick={clear} />
        <IconButton
          size="small"
          icon="copy"
          label="Copy"
          onClick={() => {
            const data = JSON.stringify(events, null, 2);
            console.log(data);
          }}
        />
      </Flex.Row> */}
    </Flex.Col>
  );
};
export default EventApp;
