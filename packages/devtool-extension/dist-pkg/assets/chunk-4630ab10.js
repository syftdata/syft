import{M as c}from"./chunk-8ba139f3.js";let s=!1;const u=()=>{const l=r=>{var a;console.debug("[Syft][Content] searching for sourceFile");const t=window.__REACT_DEVTOOLS_GLOBAL_HOOK__;if(!t||!t.reactDevtoolsAgent){s||(console.warn("Please install React Developer Tools extension"),s=!0);return}const o=document.querySelector(r.generalSelector);if(!o){console.debug(`[Syft][Content] Couldn't find element for ${r.generalSelector}`);return}const n=t.reactDevtoolsAgent.getBestMatchingRendererInterface(o);if(n!=null)try{const e=n.getFiberForNative(o);return{name:(a=e==null?void 0:e.type)==null?void 0:a.name,source:e._debugSource.fileName,owner:e._debugOwner.type.name,ownerSource:e._debugOwner._debugSource.fileName}}catch{}};window.addEventListener("message",r=>{if(r.data.type!==c.GetSourceFile)return;const t=l(r.data.data);return t&&window.postMessage({type:c.GetSourceFileResponse,data:t}),!0}),window.SYFT_INJECTED=!0};u();
