import React from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'

import { genCode } from '../builders'

import type { Action } from '../types'
import { ScriptType } from '../types'

export default function CodeGen({
  actions,
  library,
  styles,
}: {
  actions: Action[]
  library: ScriptType
  styles?: React.CSSProperties
}) {
  return (
    <SyntaxHighlighter
      language="javascript"
      style={vscDarkPlus}
      customStyle={{
        background: 'none',
        overflow: 'scroll',
        ...(styles || {}),
      }}
      data-testid="code-block"
    >
      {genCode(actions, true, library)}
    </SyntaxHighlighter>
  )
}
