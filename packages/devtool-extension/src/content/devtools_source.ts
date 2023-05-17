import { MessageType } from '../types';

let SHOWED_WARN = false;
const getSourceFile = () => {
    const getReactSourceFileOfElement = (selectors: any) => {
        console.debug('[Syft][Content] searching for sourceFile');
        // @ts-expect-error __REACT_DEVTOOLS_GLOBAL_HOOK__ is available in puppeteer
        const devtoolsHook: any = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
        if (!devtoolsHook || !devtoolsHook.reactDevtoolsAgent) {
            if (!SHOWED_WARN) {
                console.warn('Please install React Developer Tools extension');
                SHOWED_WARN = true;
            }
            return;
        }

        const ele = document.querySelector(selectors.generalSelector);
        if (!ele) {
            console.debug(`[Syft][Content] Couldn\'t find element for ${selectors.generalSelector}`);
            return;
        }
        const rendererInterface = devtoolsHook.reactDevtoolsAgent.getBestMatchingRendererInterface(ele);
        if (rendererInterface != null) {
        try {
            const node = rendererInterface.getFiberForNative(ele);
            return {
                name: node?.type?.name,
                source: node._debugSource.fileName,
                owner: node._debugOwner.type.name,
                ownerSource: node._debugOwner._debugSource.fileName,
            };
        } catch (error) {}
        } 
    }    
    window.addEventListener("message", (event) => {
        if (event.data.type !== MessageType.GetSourceFile) return;
        const sourceFile = getReactSourceFileOfElement(event.data.data);
        if (sourceFile) {
            window.postMessage({
                type: MessageType.GetSourceFileResponse,
                data: sourceFile,
            });
        }
        return true;
    });
    // @ts-expect-error
    window.SYFT_INJECTED = true;
}
getSourceFile();
export {}