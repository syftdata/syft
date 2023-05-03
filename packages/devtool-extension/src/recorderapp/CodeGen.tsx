import React from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

import { genCode, genJson } from "../builders";

import type { Action } from "../types";
import { ScriptType } from "../types";

export default function CodeGen({
  title,
  actions,
  library,
  styles,
}: {
  title: string;
  actions: Action[];
  library: ScriptType;
  styles?: React.CSSProperties;
}) {
  return (
    <SyntaxHighlighter
      language="json"
      style={vscDarkPlus}
      customStyle={{
        background: "none",
        overflow: "scroll",
        ...(styles || {}),
      }}
      data-testid="code-block"
    >
      {genJson(title, actions)}
    </SyntaxHighlighter>
  );
}
