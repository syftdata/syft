import React, { useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { SyftEvent, SyftEventInstrumentStatus } from '../types'
import './index.css'
import Panel from './events'
import { Flex } from '../common/styles/common.styles'
import { css } from '@emotion/css'
import { Colors } from '../common/styles/colors'
import { Heading } from '../common/styles/fonts'
import Icon from '../common/core/Icon/Icon'

function init(onNewEvent: (event: any) => void) {
  const listener = (message: any) => {
    // change createdAt
    message.createdAt = new Date(message.createdAt)
    onNewEvent(message as SyftEvent)
  }
  //Create a connection to the service worker
  const backgroundPageConnection = chrome.runtime.connect({
    name: 'devtools',
  })
  backgroundPageConnection.onDisconnect.addListener(() => {
    console.log('onDisconnect')
    backgroundPageConnection.onMessage.removeListener(listener)
  })
  backgroundPageConnection.postMessage({
    name: 'init',
    tabId: chrome.devtools.inspectedWindow.tabId,
  })
  backgroundPageConnection.onMessage.addListener(listener)
}

const App = () => {
  const [events, setEvents] = React.useState<Array<SyftEvent>>([])
  const [search, setSearch] = React.useState('')
  const [searchVisible, setSearchVisible] = React.useState(false)

  useEffect(() => {
    init((event) => {
      setEvents((events) => [event, ...events])
    })
  }, [])

  const toggleSearch = () => {
    setSearchVisible(!searchVisible)
  }
  let filteredEvents = events.filter(
    (event) =>
      event.syft_status.instrumented !== SyftEventInstrumentStatus.NOT_INSTRUMENTED_VERBOSE,
  )

  const searchStr = search.trim().toLowerCase()
  if (searchStr !== '') {
    filteredEvents = filteredEvents.filter(
      (event) =>
        event.name.toLowerCase().includes(searchStr) ||
        event.props.path?.toLowerCase().includes(searchStr),
    )
  }
  return (
    <Flex.Col
      className={css`
        height: 100%;
      `}
    >
      <Flex.Row
        className={css`
          padding: 10px;
          background: ${Colors.Branding.V1};
        `}
        justifyContent="space-between"
      >
        <Heading.H14 color={Colors.Branding.DarkBlue}>Syft Events</Heading.H14>
        <Flex.Row gap={3}>
          <input
            type="text"
            className={
              'text-md w-[150px] font-medium text-[#1c1e27] ' + (searchVisible ? '' : 'hidden')
            }
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div onClick={toggleSearch}>
            <Icon icon="code" size="small" />
          </div>
          <div onClick={() => setEvents([])}>
            <Icon icon="close" size="small" />
          </div>
        </Flex.Row>
      </Flex.Row>
      <Panel events={filteredEvents} />
    </Flex.Col>
  )
}

ReactDOM.createRoot(document.getElementById('app') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
