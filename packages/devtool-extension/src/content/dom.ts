const USE_CAPTURE = true

// automatic events
export function isAutomaticEvent(event: Event) {
  if (event instanceof TransitionEvent || event instanceof AnimationEvent) return true
  if (event.type === 'loadstart' || event.type === 'loadend' || event.type === 'load') return true

  return false
}

// user implicit events
export function isImplicitEvent(event: Event) {
  if (event instanceof PointerEvent) return true
  if (
    event.type === 'scroll' ||
    event.type === 'mousemove' ||
    event.type === 'mouseleave' ||
    event.type === 'mouseout' ||
    event.type === 'mouseenter' ||
    event.type === 'mouseover' ||
    event.type === 'mousewheel' ||
    event.type === 'wheel' ||
    event.type === 'beforeinput' ||
    event.type === 'input'
  )
    return true
  return false
}

// user semiimplicit events
export function isSemiExplicitEvent(event: Event) {
  if (event instanceof FocusEvent) return true
  if (event instanceof KeyboardEvent) return true
  if (event.type === 'mouseup') return true
  if (event.type === 'selectstart') return true
  if (event.type === 'selectionchange') return true
  if (event.type === 'selectionend') return true
  if (event.type === 'readystatechange') return true
  if (event.type === 'visibilitychange') return true
  if (event.type === 'resize') return true
  return false
}

function getEventNames(object: any) {
  let names = []
  for (let name in object) {
    if (name.indexOf('on') === 0) {
      names.push(name.substring(2))
    }
  }
  return names
}

export function addDomEvents(emit: (e: Event) => void) {
  let windowEvents = getEventNames(window)
  let documentEvents = getEventNames(document)
  let i, eventName

  for (i = documentEvents.length - 1; i >= 0; i--) {
    eventName = documentEvents[i]
    document.addEventListener(eventName, emit, USE_CAPTURE)
    windowEvents.splice(windowEvents.indexOf(eventName), 1)
  }

  for (i = windowEvents.length - 1; i >= 0; i--) {
    eventName = windowEvents[i]
    window.addEventListener(eventName, emit, USE_CAPTURE)
  }
}
