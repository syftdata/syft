import {
  SyftEvent,
  SyftEventInstrumentStatus,
  SyftEventTrackStatus,
  SyftEventValidStatus,
} from '../types'
import { addDomEvents, isAutomaticEvent, isImplicitEvent, isSemiExplicitEvent } from './dom'
import { getPathTo } from './xpath'

// This method gets the properties of the element that triggered the event.
function getFromSyftEvent(event: CustomEvent): SyftEvent {
  const syftevent: SyftEvent = {
    name: event.detail.name,
    props: event.detail.props,
    syft_status: event.detail.syft_status,
    createdAt: event.detail.createdAt,
  }
  syftevent.createdAt = syftevent.props.time ? new Date(syftevent.props.time) : new Date()
  return syftevent
}

function getFromDomEvent(event: Event): SyftEvent {
  const element = 'target' in event ? event.target : undefined
  const syftevent: SyftEvent = {
    name: event.type,
    props: {},
    createdAt: new Date(),
    syft_status: {
      tracked: SyftEventTrackStatus.NOT_TRACKED,
      valid: SyftEventValidStatus.UNKNOWN,
      instrumented: SyftEventInstrumentStatus.NOT_INSTRUMENTED,
    },
  }

  if (element instanceof HTMLElement) {
    if (syftevent.name === 'mousedown') {
      syftevent.name = 'click' // HACK to make the demo look good.
    }
    let name = `${syftevent.name} on ${element.tagName.toLowerCase()}`
    const props = {
      tagName: element.tagName,
      ...element.dataset,
    } as Record<string, any>
    if (element.className) {
      name = `${syftevent.name} on ${element.tagName.toLowerCase()}@${element.className}`
      props.className = element.className
    }
    if (element.id) {
      name = `${syftevent.name} on ${element.tagName.toLowerCase()}#${element.id}`
      props.id = element.id
    }
    syftevent.name = name
    props.path = getPathTo(element)
    syftevent.props = props
  }
  return syftevent
}

addDomEvents((event) => {
  const syftevent = getFromDomEvent(event)
  if (isAutomaticEvent(event) || isImplicitEvent(event)) {
    // pass
  } else if (isSemiExplicitEvent(event)) {
    syftevent.syft_status.instrumented = SyftEventInstrumentStatus.NOT_INSTRUMENTED_VERBOSE
    chrome.runtime.sendMessage(syftevent)
  } else {
    chrome.runtime.sendMessage(syftevent)
  }
})

window.addEventListener(
  'syft-event',
  (event) => {
    chrome.runtime.sendMessage({
      ...getFromSyftEvent(event as CustomEvent),
    })
  },
  true,
)

// inject script
const delay = 200
setTimeout(() => {
  const script = document.createElement('script')
  script.src = chrome.runtime.getURL('scripts/react_devtools_hook.js')
  document.head.appendChild(script)
}, delay)

export {}
