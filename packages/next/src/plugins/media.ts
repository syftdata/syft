const observerInit = {
  subtree: true,
  childList: true,
  attributes: true,
  attributeFilter: ['src']
};
function mediaPlaysInDoc(
  doc: Document,
  callback: (event: string, element: HTMLMediaElement) => void
): () => void {
  // console.log('>>> tracking media in ', doc);
  function trackPlay(this: HTMLMediaElement, event: Event): void {
    if (this.dataset.syftClicked === 'true') {
      delete this.dataset.syftClicked;
      return;
    }
    callback(event.type, this);
    if (!(typeof process !== 'undefined' && process.env.NODE_ENV === 'test')) {
      this.dataset.syftClicked = 'true';
      setTimeout(() => {
        this.click();
      }, 10);
      event.preventDefault();
    }
  }

  const tracked = new Set<HTMLMediaElement>();
  function addNode(node: Node | ParentNode): void {
    if (node instanceof HTMLMediaElement) {
      // console.log('>>> found video nodes ', node);
      node.addEventListener('play', trackPlay);
      node.addEventListener('pause', trackPlay);
      node.addEventListener('ended', trackPlay);
      tracked.add(node);
    } else if ('querySelectorAll' in node) {
      node.querySelectorAll('video').forEach(addNode);
    }
  }

  function removeNode(node: Node | ParentNode): void {
    if (node instanceof HTMLMediaElement) {
      node.removeEventListener('play', trackPlay);
      node.removeEventListener('pause', trackPlay);
      node.removeEventListener('ended', trackPlay);
      tracked.delete(node);
    } else if ('querySelectorAll' in node) {
      node.querySelectorAll('video').forEach(removeNode);
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

  doc.querySelectorAll('video').forEach(addNode);
  // Observe mutations
  observer.observe(doc, observerInit);

  return () => {
    tracked.forEach((node) => {
      node.removeEventListener('play', trackPlay);
      node.removeEventListener('pause', trackPlay);
      node.removeEventListener('ended', trackPlay);
    });
    tracked.clear();
    observer.disconnect();
  };
}
export function mediaPlays(
  callback: (event: string, element: HTMLMediaElement) => void
): () => void {
  const deregisterCallbacks = [mediaPlaysInDoc(document, callback)];
  const iframes = document.querySelectorAll('iframe');
  iframes.forEach((iframe) => {
    iframe.addEventListener('load', () => {
      const doc = iframe.contentDocument;
      if (doc == null) {
        // console.warn('>>> iframe contentDocument is null', iframe);
        return;
      }
      deregisterCallbacks.push(mediaPlaysInDoc(doc, callback));
    });
  });
  return () => {
    deregisterCallbacks.forEach((cb) => {
      cb();
    });
  };
}
