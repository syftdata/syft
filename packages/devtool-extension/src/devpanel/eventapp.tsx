import React from "react";
import { SyftEvent, SyftEventInstrumentStatus } from "../types";
import "./index.css";
import Panel from "./events";
import { Flex } from "../common/styles/common.styles";
import { IconButton } from "../common/core/Button";
import Card from "../common/core/Card";
import CardHeader from "../common/core/Card/CardHeader";
import { Css } from "../common/styles/common.styles";

const EventApp = ({
  events,
  clear,
}: {
  events: SyftEvent[];
  clear: () => void;
}) => {
  const [search, setSearch] = React.useState("");
  const [searchVisible, setSearchVisible] = React.useState(false);

  const toggleSearch = () => {
    setSearchVisible(!searchVisible);
  };
  let filteredEvents = events.filter(
    (event) =>
      event.syft_status.instrumented !==
      SyftEventInstrumentStatus.NOT_INSTRUMENTED_VERBOSE
  );

  const searchStr = search.trim().toLowerCase();
  if (searchStr !== "") {
    filteredEvents = filteredEvents.filter(
      (event) =>
        event.name.toLowerCase().includes(searchStr) ||
        event.props.path?.toLowerCase().includes(searchStr)
    );
  }
  return (
    <Card className={Css.height("100%")}>
      <CardHeader
        title="Syft Events"
        rightItem={
          <Flex.Row gap={3}>
            <input
              type="text"
              className={
                "text-md w-[150px] font-medium text-[#1c1e27] " +
                (searchVisible ? "" : "hidden")
              }
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <IconButton onClick={toggleSearch} icon="search" />
            <IconButton onClick={clear} icon="minus-circle" />
          </Flex.Row>
        }
      />
      <Panel events={filteredEvents} />
    </Card>
  );
};
export default EventApp;
