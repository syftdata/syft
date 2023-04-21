import React, { useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { SyftEvent, SyftEventInstrumentStatus } from '../types'
import './index.css'
import Panel from './events'
import { Flex } from '../common/styles/common.styles'
import { IconButton } from '../recorder/Button'
import Card from '../common/core/Card'
import CardHeader from '../common/core/Card/CardHeader'
import { Css } from '../common/styles/common.styles'

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
    <Card className={Css.height('100%')}>
      <CardHeader
        title="Syft Events"
        rightItem={
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
            <IconButton onClick={toggleSearch} icon="search" />
            <IconButton onClick={() => setEvents([])} icon="minus-circle" />
          </Flex.Row>
        }
      />
      <Panel events={filteredEvents} />
    </Card>
  )
}

ReactDOM.createRoot(document.getElementById('app') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
