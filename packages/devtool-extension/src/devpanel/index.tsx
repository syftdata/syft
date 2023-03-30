import React, { useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { SyftEvent, SyftEventInstrumentStatus } from '../types'
import './index.css'
import Panel from './panel'

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
    <div className="flex h-screen flex-col">
      <div className="flex w-full items-center bg-[#e7eaf6] p-2.5">
        <div className="flex-grow text-xs font-bold text-[#1c1e27]">Syft Console</div>
        <div className="flex items-start justify-start gap-2.5 rounded border border-[#e7eaf6] bg-white p-[3px]">
          <input
            type="text"
            className={
              'w-[100px] text-xs font-medium text-[#1c1e27] ' + (searchVisible ? '' : 'hidden')
            }
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div onClick={toggleSearch}>
            <svg
              width={14}
              height={14}
              viewBox="0 0 14 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="h-3.5 w-3.5"
            >
              <path
                d="M11.2292 11.2292L9.04166 9.04168M2.77083 6.41668C2.77083 4.40314 4.40312 2.77084 6.41666 2.77084C8.43021 2.77084 10.0625 4.40314 10.0625 6.41668C10.0625 8.43023 8.43021 10.0625 6.41666 10.0625C4.40312 10.0625 2.77083 8.43023 2.77083 6.41668Z"
                stroke="#83848A"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>
      <Panel events={filteredEvents} />
      <div className="flex items-center justify-between border border-[#e7eaf6] bg-[#eaebed] p-2">
        <div className="flex items-center justify-start gap-0.5">
          <svg
            width={12}
            height={12}
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="h-3 w-3 "
            preserveAspectRatio="none"
          >
            <path
              d="M7.875 4.375L9.625 6L7.875 7.625"
              stroke="#83848A"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M9.5 6H5.375"
              stroke="#83848A"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M7.625 2.375H3.375C2.82271 2.375 2.375 2.82271 2.375 3.375V8.625C2.375 9.1773 2.82271 9.625 3.375 9.625H7.625"
              stroke="#83848A"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <p className="text-left text-[10px] font-semibold text-[#3e4048]">Close</p>
        </div>
        <div
          className="flex cursor-pointer items-center justify-start gap-0.5"
          onClick={() => setEvents([])}
        >
          <svg
            width={12}
            height={12}
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="h-3 w-3 "
            preserveAspectRatio="none"
          >
            <path
              d="M8.625 3.375L3.375 8.625"
              stroke="#83848A"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M3.375 3.375L8.625 8.625"
              stroke="#83848A"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <p className="text-left text-[10px] font-semibold text-[#3e4048]">Clear</p>
        </div>
      </div>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('app') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
