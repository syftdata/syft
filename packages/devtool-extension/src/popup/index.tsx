import React from "react";
import ReactDOM from "react-dom/client";
import { Css, Flex } from "../common/styles/common.styles";
import { Heading, Paragraph, Subheading } from "../common/styles/fonts";
import { css } from "@emotion/css";
import SyftTable from "../common/components/core/Table/SyftTable";
import Icon from "../common/components/core/Icon/Icon";
import {
  IconButton,
  PrimaryIconButton,
} from "../common/components/core/Button/IconButton";
import { createTab } from "../common/utils";

const shortcuts = [
  {
    key: "1",
    name: "Mac",
    shortcut: "Command+Option+I",
  },
  {
    key: "2",
    name: "Windows / Linux",
    shortcut: "F12 or Control+Shift+I",
  },
];

const columns = [
  {
    title: "Platform",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "Shortcut",
    dataIndex: "shortcut",
    key: "shortcut",
  },
];

const App = () => {
  return (
    <Flex.Col
      gap={16}
      className={css(Css.width(380), Css.padding(10))}
      alignItems="center"
    >
      <Flex.Col gap={6} alignItems="center">
        <Heading.H18>Syft Studio</Heading.H18>
        <Subheading.SH12>Use Developer tools to get started.</Subheading.SH12>
      </Flex.Col>
      <Paragraph.P14>
        1. Open Developer tools by Right click -&gt; Inspect (or)
      </Paragraph.P14>
      <SyftTable columns={columns} data={shortcuts} />
      <Paragraph.P14>2. Go to "Syft Studio" tab.</Paragraph.P14>
      <IconButton
        onClick={() => {
          createTab("https://studio.syftdata.com");
        }}
        label="More Info"
      />
    </Flex.Col>
  );
};
let target = document.getElementById("app") as HTMLElement;
ReactDOM.createRoot(target).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
