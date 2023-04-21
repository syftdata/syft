import React from 'react'
import { unmountComponentAtNode } from 'react-dom'
import ReactDOM from 'react-dom/client'
import ControlBar from './ControlBar'

// TODO: Move to shadow-root when it's supported in all browsers
// Emotion doesnt like shadow-root.

const target = document.body.appendChild(document.createElement('DIV'))

declare global {
  interface Window {
    __SYFT_CLEAN_UP: () => void
    __SYFT_SCRIPT: boolean | null
    wrappedJSObject: {
      __SYFT_SCRIPT: boolean
    }
  }
  function exportFunction(fn: Function, scope: Window, opts: any): void
}

// Expose a clean up function after a test completes
function cleanUp() {
  window.__SYFT_SCRIPT = null
  unmountComponentAtNode(target)
}

// Expose clean up to window
window.__SYFT_CLEAN_UP = cleanUp
// For firefox
if (typeof exportFunction === 'function') {
  exportFunction(cleanUp, window, { defineAs: '__SYFT_CLEAN_UP' })
}

if (window.__SYFT_SCRIPT == null) {
  window.__SYFT_SCRIPT = true
  // For firefox
  if (window.wrappedJSObject != null) {
    window.wrappedJSObject.__SYFT_SCRIPT = true
  }
  ReactDOM.createRoot(target as HTMLElement).render(
    <React.StrictMode>
      <ControlBar onExit={cleanUp} />
    </React.StrictMode>,
  )
}
