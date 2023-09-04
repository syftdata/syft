// https://github.com/timfish/sentry-javascript/blob/c760baa871eedb05e14a54c48506a2adb4d0fa48/packages/utils/src/instrument.ts

// import { type FormEvent, useEffect } from 'react';
// import { isBrowser } from '../common/utils';

// export interface UseFormSubmitOptions {
//   callback: (element: HTMLFormElement) => void;
//   enabled?: boolean;
//   node?: Node & ParentNode;
//   observerInit?: MutationObserverInit;
// }

// export function useFormSubmit({
//   callback,
//   enabled = true,
//   node,
//   observerInit = {
//     subtree: true,
//     childList: true
//   }
// }: UseFormSubmitOptions): void {
//   useEffect(() => {
//     if (!enabled) {
//       return;
//     }
//     if (!isBrowser()) {
//       return;
//     }
//     const targetNode = node ?? document;

//     const tracked = new Set<HTMLFormElement>();
//     const trackedToCB = new Map<HTMLFormElement, any>();
//     function trackSubmit(
//       this: HTMLFormElement,
//       event: FormEvent<HTMLFormElement>
//     ): void {
//       if (
//         !(typeof process !== 'undefined' && process.env.NODE_ENV === 'test')
//       ) {
//         setTimeout(() => {
//           trackedToCB(this)(event);
//         }, 150);
//       }
//       callback(this);
//       event.preventDefault();
//     }

//     function addNode(node: Node | ParentNode): void {
//       if (node instanceof HTMLFormElement) {
//         trackedToCB.set(node, node.onsubmit);
//         node.onsubmit = trackSubmit;
//         tracked.add(node);
//       } else if ('querySelectorAll' in node) {
//         node.querySelectorAll('form').forEach(addNode);
//       }
//     }

//     function removeNode(node: Node | ParentNode): void {
//       if (node instanceof HTMLFormElement) {
//         node.removeEventListener('click', trackSubmit);
//         tracked.delete(node);
//       } else if ('querySelectorAll' in node) {
//         node.querySelectorAll('form').forEach(removeNode);
//       }
//     }

//     const observer = new MutationObserver((mutations) => {
//       mutations.forEach((mutation) => {
//         if (mutation.type === 'childList') {
//           // Handle added nodes
//           mutation.addedNodes.forEach(addNode);
//           // Handle removed nodes
//           mutation.removedNodes.forEach(removeNode);
//         }
//       });
//     });

//     // Track existing nodes
//     targetNode.querySelectorAll('form').forEach(addNode);

//     // Observe mutations
//     observer.observe(targetNode, observerInit);

//     return () => {
//       tracked.forEach((a) => {
//         a.removeEventListener('click', trackSubmit);
//       });
//       tracked.clear();
//       observer.disconnect();
//     };
//   }, []);
// }
