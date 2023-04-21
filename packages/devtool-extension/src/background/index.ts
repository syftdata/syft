import {
  setEndRecordingStorage,
  setStartRecordingStorage,
  localStorageGet,
  executeScript,
  createTab,
  recordNavigationEvent,
} from '../common/utils'

// @ts-ignore-error - CRXJS needs injected scripts to be this way.
// https://dev.to/jacksteamdev/advanced-config-for-rpce-3966
import recorderScriptPath from '../recorder?script'

chrome.runtime.onMessage.addListener(async function (request, sender, sendResponse) {
  if (request.type === 'start-recording') {
    const testEditorTabId = sender.tab?.id

    const newUrl = request.url
    const newTab = await createTab(newUrl)
    const tabId = newTab.id

    if (tabId == null) {
      throw new Error('New tab id not defined')
    }

    setStartRecordingStorage(tabId, 0, newUrl, testEditorTabId)
  } else if (request.type === 'forward-recording') {
    chrome.tabs.update(request.tabId, { active: true })

    chrome.tabs.sendMessage(request.tabId, {
      type: 'playwright-test-recording',
      code: request.code,
      actions: request.actions,
    })
  }
})

/// *** Navigation Events *** ///

async function onNavEvent(details: chrome.webNavigation.WebNavigationTransitionCallbackDetails) {
  const { tabId, url, transitionType, transitionQualifiers, frameId } = details
  const { recording, recordingTabId, recordingFrameId, recordingState } = await localStorageGet([
    'recording',
    'recordingState',
    'recordingTabId',
    'recordingFrameId',
  ])

  // Check if it's a parent frame, we're recording, and it's the right tabid
  if (frameId !== recordingFrameId || recordingState !== 'active' || recordingTabId !== tabId) {
    return
  }

  await recordNavigationEvent(url, transitionType, transitionQualifiers, recording)
}

// Set recording as ended when the recording tab is closed
chrome.tabs.onRemoved.addListener(async (tabId) => {
  const { recordingTabId } = await localStorageGet(['recordingTabId'])
  if (tabId == recordingTabId) {
    setEndRecordingStorage()
  }
})

chrome.webNavigation.onHistoryStateUpdated.addListener(onNavEvent)
chrome.webNavigation.onReferenceFragmentUpdated.addListener(onNavEvent)
chrome.webNavigation.onCommitted.addListener(onNavEvent)

chrome.webNavigation.onCompleted.addListener(async (details) => {
  const { tabId, frameId } = details

  const { recordingTabId, recordingFrameId, recordingState } = await localStorageGet([
    'recordingTabId',
    'recordingFrameId',
    'recordingState',
  ])

  if (frameId !== recordingFrameId || tabId != recordingTabId || recordingState != 'active') {
    return
  }

  await executeScript(tabId, recordingFrameId, recorderScriptPath)
})

/// **** Context Menus **** ///

const HOVER_CTX_MENU_ID = 'syft-menu-hover-id'
const AWAIT_TEXT_CTX_MENU_ID = 'syft-menu-await-text-id'
const AWAIT_EVENT_CTX_MENU_ID = 'syft-menu-await-event-id'

chrome.contextMenus.removeAll()
chrome.contextMenus.create({
  title: 'Record hover over element',
  contexts: ['all'],
  id: HOVER_CTX_MENU_ID,
  enabled: false,
})
chrome.contextMenus.create({
  title: 'Assert for Syft event',
  contexts: ['selection'],
  id: AWAIT_EVENT_CTX_MENU_ID,
  enabled: false,
})
chrome.contextMenus.create({
  title: 'Assert/wait for selected text',
  contexts: ['selection'],
  id: AWAIT_TEXT_CTX_MENU_ID,
  enabled: false,
})

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (typeof tab === 'undefined') {
    return
  }
  const { recordingTabId } = await localStorageGet(['recordingTabId'])
  if (tab.id != recordingTabId) {
    return
  }
  let type = 'onAwaitSyftEventCtxMenu'
  if (info.menuItemId === HOVER_CTX_MENU_ID) {
    type = 'onHoverCtxMenu'
  } else if (info.menuItemId === AWAIT_TEXT_CTX_MENU_ID) {
    type = 'onAwaitTextCtxMenu'
  }
  chrome.tabs.sendMessage(recordingTabId, {
    type,
    selectionText: info.selectionText,
  })
})

function updateContextMenuItems({ enabled }: { enabled: boolean }) {
  chrome.contextMenus.update(HOVER_CTX_MENU_ID, {
    enabled,
  })
  chrome.contextMenus.update(AWAIT_TEXT_CTX_MENU_ID, {
    enabled,
  })
  chrome.contextMenus.update(AWAIT_EVENT_CTX_MENU_ID, {
    enabled,
  })
}

localStorageGet(['recordingState']).then(({ recordingState }) => {
  if (recordingState === 'active') {
    updateContextMenuItems({ enabled: true })
  } else {
    updateContextMenuItems({ enabled: false })
  }
})

chrome.storage.onChanged.addListener((changes) => {
  if (changes?.recordingState?.oldValue === changes?.recordingState?.newValue) {
    return
  }

  if (changes?.recordingState?.newValue == 'active') {
    updateContextMenuItems({ enabled: true })
  }
  if (changes?.recordingState?.newValue == 'finished') {
    updateContextMenuItems({ enabled: false })
  }
})

/// *** Devtools Panel Communication *** ///

const connections: Record<string, chrome.runtime.Port> = {}

chrome.runtime.onConnect.addListener(function (port) {
  const extensionListener = function (message: any, port: chrome.runtime.Port) {
    // The original connection event doesn't include the tab ID of the
    // DevTools page, so we need to send it explicitly.
    if (message.name === 'init') {
      connections[message.tabId] = port
      return
    }
    console.debug('message is ', message)
  }

  // Listen to messages sent from the DevTools page
  port.onMessage.addListener(extensionListener)

  port.onDisconnect.addListener(function (port) {
    port.onMessage.removeListener(extensionListener)
    const tabs = Object.keys(connections)
    for (var i = 0, len = tabs.length; i < len; i++) {
      if (connections[tabs[i]] === port) {
        delete connections[tabs[i]]
        break
      }
    }
  })
})

// Receive message from content script and relay to the devTools page for the
// current tab
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  // Messages from content scripts should have sender.tab set
  if (sender.tab) {
    var tabId = sender.tab.id?.toString()
    if (tabId != null && tabId in connections) {
      connections[tabId].postMessage(request)
    } else {
      console.warn('Tab not found in connection list.')
    }
  } else {
    console.warn('sender.tab not defined.')
  }
  return true
})

export {}
