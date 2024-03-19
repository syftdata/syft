function linkClicksInDoc(
  doc: Document,
  callback: (url: string, element: HTMLAnchorElement) => void
): () => void {
  const observerInit = {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ['href']
  };

  function trackClick(this: HTMLAnchorElement, event: MouseEvent): void {
    if (this.dataset.syftClicked === 'true') {
      delete this.dataset.syftClicked;
      return;
    }
    callback(this.href, this);
    if (!(typeof process !== 'undefined' && process.env.NODE_ENV === 'test')) {
      this.dataset.syftClicked = 'true';
      setTimeout(() => {
        this.click();
      }, 10);
      event.preventDefault();
    }
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
  doc.querySelectorAll('a').forEach(addNode);
  // Observe mutations
  observer.observe(doc, observerInit);

  return () => {
    tracked.forEach((a) => {
      a.removeEventListener('click', trackClick);
    });
    tracked.clear();
    observer.disconnect();
  };
}

export function linkClicks(
  callback: (url: string, element: HTMLAnchorElement) => void
): () => void {
  const deregisterCallbacks = [linkClicksInDoc(document, callback)];
  const iframes = document.querySelectorAll('iframe');
  iframes.forEach((iframe) => {
    iframe.addEventListener('load', () => {
      const doc = iframe.contentDocument;
      if (doc == null) {
        return;
      }
      deregisterCallbacks.push(linkClicksInDoc(doc, callback));
    });
  });
  return () => {
    deregisterCallbacks.forEach((cb) => {
      cb();
    });
  };
}
