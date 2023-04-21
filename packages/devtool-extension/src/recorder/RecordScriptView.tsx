import { useState } from 'react'
import { Css, Flex } from '../common/styles/common.styles'
import { Action, ActionsMode, ScriptType } from '../types'
import ScriptTypeSelect from '../common/ScriptTypeSelect'
import CopyToClipboard from 'react-copy-to-clipboard'
import CodeGen from './CodeGen'
import ActionList from './ActionList'
import { cx } from '@emotion/css'
import { genCode } from '../builders'
import { IconButton } from './Button'
import { Colors } from '../common/styles/colors'
import Card from '../common/core/Card'
interface RecordScriptViewProps {
  actions: Action[]
  scriptType: ScriptType
  setScriptType: (scriptType: ScriptType) => void
  header?: React.ReactNode
  className?: string
}

export default function RecordScriptView({
  actions,
  header,
  scriptType,
  setScriptType,
  className,
}: RecordScriptViewProps) {
  const [actionsMode, setActionsMode] = useState<ActionsMode>(ActionsMode.Code)
  const [copyCodeConfirm, setCopyCodeConfirm] = useState<boolean>(false)

  return (
    <Card className={className}>
      {header}
      <Flex.Row justifyContent="space-between" alignItems="center">
        {actionsMode === ActionsMode.Actions ? (
          <IconButton onClick={() => setActionsMode(ActionsMode.Code)} label="Show Code" />
        ) : (
          <IconButton onClick={() => setActionsMode(ActionsMode.Actions)} label="Show Actions" />
        )}
        {actionsMode === ActionsMode.Code && (
          <>
            <ScriptTypeSelect value={scriptType} onChange={setScriptType} />
            <CopyToClipboard
              text={genCode(actions, true, scriptType)}
              onCopy={() => {
                setCopyCodeConfirm(true)
                setTimeout(() => {
                  setCopyCodeConfirm(false)
                }, 2000)
              }}
            >
              <IconButton
                className={copyCodeConfirm ? Css.color(Colors.Secondary.Green) : ''}
                label="Copy Code"
                icon={copyCodeConfirm ? 'check' : 'folder'}
                reverseIcon={true}
              />
            </CopyToClipboard>
          </>
        )}
      </Flex.Row>
      <Flex.Col className={cx(Css.height(240), Css.overflow('scroll'))}>
        {actionsMode === ActionsMode.Code && <CodeGen actions={actions} library={scriptType} />}
        {actionsMode === ActionsMode.Actions && <ActionList actions={actions} />}
      </Flex.Col>
    </Card>
  )
}
