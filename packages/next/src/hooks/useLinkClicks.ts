import { useEffect } from 'react';

export interface UseLinkClicksOptions {
  enabled?: boolean;
  callback: (url: string, element: HTMLAnchorElement) => void;
}

export function useLinkClicks({
  callback,
  enabled = true
}: UseLinkClicksOptions): void {
  useEffect(() => {
    if (!enabled) {
      return;
    }
    const targetNode = document;
    const observerInit = {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['href']
    };

    function trackClick(this: HTMLAnchorElement, event: MouseEvent): void {
      callback(this.href, this);
      if (
        !(typeof process !== 'undefined' && process.env.NODE_ENV === 'test')
      ) {
        setTimeout(() => {
          location.href = this.href;
        }, 150);
      }
      event.preventDefault();
    }

    const tracked = new Set<HTMLAnchorElement>();
    function addNode(node: Node | ParentNode): void {
      if (node instanceof HTMLAnchorElement) {
        if (node.host !== location.host) {
          node.addEventListener('click', trackClick);
          tracked.add(node);
        }
      } else if ('querySelectorAll' in node) {
        node.querySelectorAll('a').forEach(addNode);
      }
    }

    function removeNode(node: Node | ParentNode): void {
      if (node instanceof HTMLAnchorElement) {
        node.removeEventListener('click', trackClick);
        tracked.delete(node);
      } else if ('querySelectorAll' in node) {
        node.querySelectorAll('a').forEach(removeNode);
      }
    }

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes') {
          // Handle changed href
          removeNode(mutation.target);
          addNode(mutation.target);
        } else if (mutation.type === 'childList') {
          // Handle added nodes
          mutation.addedNodes.forEach(addNode);
          // Handle removed nodes
          mutation.removedNodes.forEach(removeNode);
        }
      });
    });

    // Track existing nodes
    targetNode.querySelectorAll('a').forEach(addNode);

    // Observe mutations
    observer.observe(targetNode, observerInit);

    return () => {
      tracked.forEach((a) => {
        a.removeEventListener('click', trackClick);
      });
      tracked.clear();
      observer.disconnect();
    };
  }, [enabled]);
}
