import { getPathTo } from './xpath'

declare global {
  interface devTools {
    renderers: { size?: number }
    onCommitFiberRoot(...args: any[]): any
  }

  interface Window {
    __REACT_DEVTOOLS_GLOBAL_HOOK__: devTools
  }

  interface component {
    name: string | undefined | null
    node?: any
    xpath?: string
    state?: any[]
    stateType?: { stateful: boolean; receiving: boolean; sending: any } | -1
    hooks?: [string]
    children?: [string] | [] | component[]
    props?: object
  }
}

function throttle(fn: (...args: any[]) => any, wait: number) {
  let time = Date.now()
  return function (...args: any[]) {
    if (time + wait - Date.now() < 0) {
      fn(...args)
      time = Date.now()
    }
  }
}

function hook() {
  const devTools = window.__REACT_DEVTOOLS_GLOBAL_HOOK__

  // if devtools not activated
  if (!devTools) {
    sendToContentScript("Looks like you don't have react devtools activated")
    console.warn('Please install react devtools')
    return
  }

  // if hook can't find react
  if ((devTools.renderers?.size ?? 0) < 1) {
    console.warn('Is this a React application ?', devTools)
    sendToContentScript(
      "Looks like this page doesn't use React. Go to a React page and trigger a state change",
    )
    return
  }

  // patch react devtools function called on render
  devTools.onCommitFiberRoot = (function (original) {
    return function (...args) {
      if (args.length > 1) {
        const fiberDOM = args[1]
        const rootNode = fiberDOM.current.stateNode.current
        console.log('>>> input is ', fiberDOM, rootNode)
        const arr: any[] = []
        try {
          throttledRecurse(rootNode.child, arr)
          if (arr.length > 0) sendToContentScript(arr[0])
          console.log('>>> output is ', fiberDOM, rootNode)
        } catch (error) {
          sendToContentScript("we're sorry, there was an error on our end.")
        }
      }
      return original(...args)
    }
  })(devTools.onCommitFiberRoot)
}

// message sending function
function sendToContentScript(tree: any) {
  console.log(tree)
  window.postMessage({ tree }, '*')
}

const clean = (item: any, depth = 0): any => {
  // base case
  if (depth > 10) return 'max recursion depth reached'
  if (typeof item !== 'object' && typeof item !== 'function') return item

  // if item is composite
  if (item === null) return null
  if (typeof item === 'object') {
    let result: any
    if (item.$$typeof && typeof item.$$typeof === 'symbol') {
      return item.type && typeof item.type !== 'string'
        ? `<${item.type.name} />`
        : 'React component'
    }
    if (Array.isArray(item)) {
      result = []
      item.forEach((elem, idx) => {
        result[idx] = clean(elem, depth + 1)
      })
    } else {
      result = {}
      Object.keys(item).forEach((key) => {
        result[key] = clean(item[key], depth + 1)
      })
    }
    return result
  }
  if (typeof item === 'function') {
    return `function: ${item.name}()`
  }
}

const getName = (node: any, component: component, parentArr: component[]): void | -1 => {
  if (!node.type || !node.type.name) {
    // this is a misc fiber node or html element, continue without appending
    if (node.child) recurse(node.child, parentArr)
    if (node.sibling) recurse(node.sibling, parentArr)
    return -1
  } else {
    // if valid, extract component name
    component.name = node.type.name
  }
}

const getState = (node: any, component: component): void => {
  // for linked list recursion
  const llRecurse = (stateNode: any, arr: any[]): any => {
    arr.push(clean(stateNode.memoizedState))

    if (stateNode.next && stateNode.memoizedState !== stateNode.next.memoizedState)
      llRecurse(stateNode.next, arr)
  }

  // if no state, exit
  if (!node.memoizedState) return
  // if state stored in linked list
  if (node.memoizedState.memoizedState !== undefined) {
    if (node.memoizedState.next === null) {
      component.state = clean(node.memoizedState.memoizedState)
      return
    }
    component.state = []
    llRecurse(node.memoizedState, component.state)
    return
  }

  // not linked list
  component.state = clean(node.memoizedState)
}

const getProps = (node: any, component: component): void => {
  if (node.memoizedProps && Object.keys(node.memoizedProps).length > 0) {
    const props: Record<string, any> = {}
    Object.keys(node.memoizedProps).forEach((prop) => {
      props[prop] = clean(node.memoizedProps[prop])
    })

    component.props = props
  }
}

const getHooks = (node: any, component: component): void => {
  if (node._debugHookTypes) component.hooks = node._debugHookTypes
}

const getChildren = (node: any, component: component, parentArr: any[]): void => {
  const children: component[] = []

  if (node.child) {
    recurse(node.child, children)
  }
  if (node.sibling) recurse(node.sibling, parentArr)

  //   console.log(children.length);
  if (children.length > 0) component.children = children
}

const getStateType = (component: component): void => {
  const stateType = {
    stateful: !(component.state === undefined),
    receiving: !(component.props === undefined),
    sending:
      component.children && component.children.some((child: any) => child.props !== undefined),
  }

  if (Object.values(stateType).some((isTrue) => isTrue)) {
    component.stateType = stateType
  }
}

const getXPath = (node: any, component: component): void => {
  component.xpath = getPathTo(node)
}

const throttledRecurse = throttle(recurse, 300)

// function for fiber tree traversal
function recurse(node: any, parentArr: any[]) {
  const component: component = {
    name: '',
    // for debugging:
    // node,
  }

  // if invalid component, recursion will contine, exit here
  if (getName(node, component, parentArr) === -1) return
  getState(node, component)
  getProps(node, component)
  getHooks(node, component)
  // insert component into parent's children array
  parentArr.push(component)
  // below functions must execute after inner recursion
  getChildren(node, component, parentArr)
  getStateType(component)
  getXPath(node, component)
}
hook()

export { clean }
