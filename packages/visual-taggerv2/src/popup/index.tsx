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
import { Colors } from "../common/styles/colors";

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
      className={css(Css.width(380), Css.padding(20))}
      alignItems="center"
    >
      <Flex.Col gap={8} alignItems="center">
        <Flex.Row gap={8} alignItems="center">
          <img
            src="/img/logo-128.png"
            alt="logo"
            className={css(Css.imgCoverFitCss, Css.width(24), Css.height(24))}
          />
          <Heading.H18 color={Colors.Gray.V7}>Syft Studio</Heading.H18>
        </Flex.Row>
        <Subheading.SH12 color={Colors.Branding.Blue}>
          Open Developer tools to get started.
        </Subheading.SH12>
      </Flex.Col>
      <Flex.Col gap={16}>
        <Flex.Col gap={8}>
          <Paragraph.P12>1. Right-click -&gt; Inspect (or)</Paragraph.P12>
          <SyftTable
            columns={columns}
            data={shortcuts}
            className={css(Css.padding(0), Css.border("none !important"))}
          />
        </Flex.Col>
        <Paragraph.P12>2. Go to "Syft Studio" tab.</Paragraph.P12>
      </Flex.Col>
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
