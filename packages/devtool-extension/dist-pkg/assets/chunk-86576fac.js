var B=Object.defineProperty;var K=(e,t,n)=>t in e?B(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n;var a=(e,t,n)=>(K(e,typeof t!="symbol"?t+"":t,n),n);import{c as T,f as C,j as G,F,a as v,r as k,g as V,e as U,R as J,d as Q}from"./chunk-34b209c4.js";import{l as Z}from"./chunk-1bea96a2.js";import{A as m,M as H,S as q}from"./chunk-8ba139f3.js";var W="Expected a function",z=0/0,ee="[object Symbol]",te=/^\s+|\s+$/g,ne=/^[-+]0x[0-9a-f]+$/i,re=/^0b[01]+$/i,ie=/^0o[0-7]+$/i,oe=parseInt,se=typeof T=="object"&&T&&T.Object===Object&&T,ae=typeof self=="object"&&self&&self.Object===Object&&self,ce=se||ae||Function("return this")(),de=Object.prototype,le=de.toString,ue=Math.max,fe=Math.min,O=function(){return ce.Date.now()};function ge(e,t,n){var r,i,c,d,s,l,g=0,S=!1,h=!1,b=!0;if(typeof e!="function")throw new TypeError(W);t=N(t)||0,I(n)&&(S=!!n.leading,h="maxWait"in n,c=h?ue(N(n.maxWait)||0,t):c,b="trailing"in n?!!n.trailing:b);function w(o){var f=r,y=i;return r=i=void 0,g=o,d=e.apply(y,f),d}function u(o){return g=o,s=setTimeout(p,t),S?w(o):d}function L(o){var f=o-l,y=o-g,_=t-f;return h?fe(_,c-y):_}function E(o){var f=o-l,y=o-g;return l===void 0||f>=t||f<0||h&&y>=c}function p(){var o=O();if(E(o))return x(o);s=setTimeout(p,L(o))}function x(o){return s=void 0,b&&r?w(o):(r=i=void 0,d)}function M(){s!==void 0&&clearTimeout(s),g=0,r=l=i=s=void 0}function j(){return s===void 0?d:x(O())}function R(){var o=O(),f=E(o);if(r=arguments,i=this,l=o,f){if(s===void 0)return u(l);if(h)return s=setTimeout(p,t),w(l)}return s===void 0&&(s=setTimeout(p,t)),d}return R.cancel=M,R.flush=j,R}function he(e,t,n){var r=!0,i=!0;if(typeof e!="function")throw new TypeError(W);return I(n)&&(r="leading"in n?!!n.leading:r,i="trailing"in n?!!n.trailing:i),ge(e,t,{leading:r,maxWait:t,trailing:i})}function I(e){var t=typeof e;return!!e&&(t=="object"||t=="function")}function pe(e){return!!e&&typeof e=="object"}function me(e){return typeof e=="symbol"||pe(e)&&le.call(e)==ee}function N(e){if(typeof e=="number")return e;if(me(e))return z;if(I(e)){var t=typeof e.valueOf=="function"?e.valueOf():e;e=I(t)?t+"":t}if(typeof e!="string")return e===0?e:+e;e=e.replace(te,"");var n=re.test(e);return n||ie.test(e)?oe(e.slice(2),n?2:8):ne.test(e)?z:+e}var ye=he,be="Expected a function",Y=0/0,we="[object Symbol]",xe=/^\s+|\s+$/g,Se=/^[-+]0x[0-9a-f]+$/i,Te=/^0b[01]+$/i,ve=/^0o[0-7]+$/i,Ee=parseInt,Re=typeof T=="object"&&T&&T.Object===Object&&T,Me=typeof self=="object"&&self&&self.Object===Object&&self,ke=Re||Me||Function("return this")(),Ae=Object.prototype,Le=Ae.toString,_e=Math.max,Ce=Math.min,$=function(){return ke.Date.now()};function Ie(e,t,n){var r,i,c,d,s,l,g=0,S=!1,h=!1,b=!0;if(typeof e!="function")throw new TypeError(be);t=P(t)||0,D(n)&&(S=!!n.leading,h="maxWait"in n,c=h?_e(P(n.maxWait)||0,t):c,b="trailing"in n?!!n.trailing:b);function w(o){var f=r,y=i;return r=i=void 0,g=o,d=e.apply(y,f),d}function u(o){return g=o,s=setTimeout(p,t),S?w(o):d}function L(o){var f=o-l,y=o-g,_=t-f;return h?Ce(_,c-y):_}function E(o){var f=o-l,y=o-g;return l===void 0||f>=t||f<0||h&&y>=c}function p(){var o=$();if(E(o))return x(o);s=setTimeout(p,L(o))}function x(o){return s=void 0,b&&r?w(o):(r=i=void 0,d)}function M(){s!==void 0&&clearTimeout(s),g=0,r=l=i=s=void 0}function j(){return s===void 0?d:x($())}function R(){var o=$(),f=E(o);if(r=arguments,i=this,l=o,f){if(s===void 0)return u(l);if(h)return s=setTimeout(p,t),w(l)}return s===void 0&&(s=setTimeout(p,t)),d}return R.cancel=M,R.flush=j,R}function D(e){var t=typeof e;return!!e&&(t=="object"||t=="function")}function je(e){return!!e&&typeof e=="object"}function Oe(e){return typeof e=="symbol"||je(e)&&Le.call(e)==we}function P(e){if(typeof e=="number")return e;if(Oe(e))return Y;if(D(e)){var t=typeof e.valueOf=="function"?e.valueOf():e;e=D(t)?t+"":t}if(typeof e!="string")return e===0?e:+e;e=e.replace(xe,"");var n=Te.test(e);return n||ve.test(e)?Ee(e.slice(2),n?2:8):Se.test(e)?Y:+e}var $e=Ie;function Fe(e){if(["AltGraph","Backspace","Delete"].includes(e.key)||e.key==="@"&&e.code==="KeyL")return!1;if(navigator.platform.includes("Mac")){if(e.key==="v"&&e.metaKey)return!1}else if(e.key==="v"&&e.ctrlKey||e.key==="Insert"&&e.shiftKey)return!1;if(["Shift","Control","Meta","Alt"].includes(e.key))return!1;const t=e.ctrlKey||e.altKey||e.metaKey;return!(e.key.length===1&&!t)}function A(e,t){var r;const n=t!=null?t:e.target;return{isPassword:n instanceof HTMLInputElement&&n.type.toLowerCase()==="password",type:m.Click,tagName:n.tagName,inputType:n instanceof HTMLInputElement?n.type:void 0,selectors:(r=C(n))!=null?r:{},timestamp:e.timeStamp,hasOnlyText:n.children.length===0&&n.innerText.length>0,value:void 0}}async function He(e){let t;const n=i=>{t!=null&&(t(i),t=null,window.removeEventListener("message",r))},r=i=>{if(i.data.type===H.GetSourceFileResponse)return n(i.data.data),!0};return new Promise((i,c)=>{t=i,window.addEventListener("message",r),setTimeout(()=>{n(void 0)},100),window.postMessage({type:H.GetSourceFile,data:e.selectors})})}class De{constructor({onAction:t}){a(this,"_recording");a(this,"currentEventHandleType",null);a(this,"onAction");a(this,"lastContextMenuEvent",null);a(this,"appendToRecording",t=>{this._recording.push(t),He(t).then(n=>{t.eventSource=n}).catch(n=>{console.error(n)}).finally(()=>{chrome.storage.local.set({recording:this._recording}),this.onAction(this._recording)})});a(this,"updateLastRecordedAction",t=>{const r={...this._recording[this._recording.length-1],...t};this._recording[this._recording.length-1]=r,chrome.storage.local.set({recording:this._recording}),this.onAction(this._recording)});a(this,"checkAndSetDuplicateEventHandle",t=>this.currentEventHandleType!=null?!0:(this.currentEventHandleType=t.type,setTimeout(()=>{this.currentEventHandleType=null},0),!1));a(this,"onMouseWheel",t=>{const n=this._recording[this._recording.length-1],{pageXOffset:r,pageYOffset:i}=window;if(n.type==="wheel"&&Math.sign(n.deltaX)===Math.sign(t.deltaX)&&Math.sign(n.deltaY)===Math.sign(t.deltaY))this.updateLastRecordedAction({deltaX:Math.floor(n.deltaX+t.deltaX),deltaY:Math.floor(n.deltaY+t.deltaY),pageXOffset:r,pageYOffset:i});else{const c={type:m.Wheel,deltaX:Math.floor(t.deltaX),deltaY:Math.floor(t.deltaY),pageXOffset:r,pageYOffset:i};this.appendToRecording(c)}});a(this,"onClick",t=>{if(t.isTrusted===!1||this.checkAndSetDuplicateEventHandle(t))return;const n=t.target,{parentElement:r}=n,i=(r==null?void 0:r.tagName)==="A"?r:n,c={...A(t,i),type:m.Click};this.appendToRecording(c)});a(this,"onDrag",t=>{const n=this._recording[this._recording.length-1];t.type==="dragstart"?this.appendToRecording({...A(t),type:m.DragAndDrop,sourceX:t.x,sourceY:t.y}):t.type==="drop"&&n.type===m.DragAndDrop&&this.updateLastRecordedAction({targetX:t.x,targetY:t.y})});a(this,"onKeyDown",t=>{if(!Fe(t)||this.checkAndSetDuplicateEventHandle(t))return;const n={...A(t),type:m.Keydown,key:t.key};this.appendToRecording(n)});a(this,"onContextMenu",t=>{this.lastContextMenuEvent=t});a(this,"onBackgroundMessage",t=>{var n,r;if(t!==null&&this.lastContextMenuEvent!=null){let i;switch(t.type){case"onHoverCtxMenu":i={...A(this.lastContextMenuEvent),type:m.Hover,selectors:(n=C(this.lastContextMenuEvent.target))!=null?n:{}};break;case"onAwaitTextCtxMenu":i={...A(this.lastContextMenuEvent),type:m.AwaitText,text:t.selectionText,selectors:(r=C(this.lastContextMenuEvent.target))!=null?r:{}};break}i!=null&&this.appendToRecording(i)}});a(this,"onInput",t=>{if(this.checkAndSetDuplicateEventHandle(t))return;const n=t.target,r=C(n),i=this._recording[this._recording.length-1];if(i.type==="input"&&i.selectors.generalSelector===(r==null?void 0:r.generalSelector))this.updateLastRecordedAction({value:n==null?void 0:n.value,timestamp:t.timeStamp});else{const c={...A(t),type:m.Input,value:n==null?void 0:n.value};this.appendToRecording(c)}});a(this,"onResize",()=>{const t=this.getLastResizeAction(),{innerWidth:n,innerHeight:r}=window;if(t==null||t.width!==n||t.height!==r){const i={type:m.Resize,width:n,height:r};this.appendToRecording(i)}});a(this,"getLastResizeAction",()=>{for(let t=this._recording.length-1;t>=0;t--)if(this._recording[t].type===m.Resize)return this._recording[t]});a(this,"debouncedOnResize",$e(this.onResize,300));a(this,"onFullScreenshot",()=>{const t={type:m.FullScreenshot};this.appendToRecording(t)});this.onAction=t,this._recording=[],Z(["recording"]).then(({recording:n})=>{this._recording=n,chrome.storage.onChanged.addListener(r=>{r.recording!=null&&r.recording.newValue!=r.recording.oldValue&&(this._recording=r.recording.newValue)}),window.addEventListener("click",this.onClick,!0),window.addEventListener("contextmenu",this.onContextMenu,!0),window.addEventListener("dragstart",this.onDrag,!0),window.addEventListener("drop",this.onDrag,!0),window.addEventListener("input",this.onInput,!0),window.addEventListener("keydown",this.onKeyDown,!0),window.addEventListener("resize",this.debouncedOnResize,!0),window.addEventListener("wheel",this.onMouseWheel,!0),chrome.runtime.onMessage.addListener(this.onBackgroundMessage),this.onResize()})}deregister(){window.removeEventListener("click",this.onClick,!0),window.removeEventListener("contextmenu",this.onContextMenu,!0),window.removeEventListener("dragstart",this.onDrag,!0),window.removeEventListener("drop",this.onDrag,!0),window.removeEventListener("input",this.onInput,!0),window.removeEventListener("keydown",this.onKeyDown,!0),window.removeEventListener("resize",this.debouncedOnResize,!0),window.removeEventListener("wheel",this.onMouseWheel,!0)}}const ze=`div#Highlighter-outline{box-sizing:border-box;pointer-events:none!important;position:fixed!important;background:#ff5d5b26!important;border:3px solid #ff5d5b!important;z-index:2147483647!important}div#Highlighter-label{pointer-events:none!important;position:fixed!important;background:#080a0b!important;color:#fff!important;padding:8px!important;font-family:monospace!important;border-radius:5px!important;z-index:2147483647!important}
`;function Ne({rect:e,displayedSelector:t}){return G(F,{children:[v("style",{children:ze}),v("div",{id:"Highlighter-outline",style:{top:e.top,left:e.left,width:e.width,height:e.height}}),v("div",{id:"Highlighter-label",style:{top:e.top+e.height+8,left:e.left},children:t})]})}function Ye(){var h,b,w;const[e,t]=k.exports.useState(null),[n,r]=k.exports.useState({}),[i,c]=k.exports.useState(!1),d=k.exports.useRef(u=>{}),s=k.exports.useRef(null),l=()=>{var u;c(!0),document.removeEventListener("mousemove",d.current,!0),t(null),(u=s.current)==null||u.deregister()};k.exports.useEffect(()=>{s.current==null&&(d.current=ye(u=>{const L=u.clientX,E=u.clientY,p=document.elementFromPoint(L,E);if(p!=null){const{parentElement:x}=p,M=(x==null?void 0:x.tagName)==="A"?x:p;t(M||null),r(C(M))}},100),document.addEventListener("mousemove",d.current,!0),s.current=new De({onAction:u=>{chrome.runtime.sendMessage({type:H.RecordedStep,data:u})}}),console.debug("[Syft][Content] Injecting the recorder listeners"),chrome.storage.onChanged.addListener(u=>{u.recordingState!=null&&u.recordingState.newValue==="finished"&&u.recordingState.newValue!==u.recordingState.oldValue&&(i||l())}))},[]);const g=e==null?void 0:e.getBoundingClientRect(),S=V({type:m.Click,tagName:(h=e==null?void 0:e.tagName)!=null?h:"",inputType:void 0,value:void 0,selectors:n||{},timestamp:0,isPassword:!1,hasOnlyText:((b=e==null?void 0:e.children)==null?void 0:b.length)===0&&((w=e==null?void 0:e.innerText)==null?void 0:w.length)>0},q.Playwright);return i?v(F,{}):v(F,{children:g!=null&&g.top!=null&&v(Ne,{rect:g,displayedSelector:S!=null?S:""})})}const X=document.body.appendChild(document.createElement("DIV"));function Pe(){window.__SYFT_SCRIPT=null,Q.exports.unmountComponentAtNode(X)}window.__SYFT_CLEAN_UP=Pe;window.__SYFT_SCRIPT==null?(window.__SYFT_SCRIPT=!0,console.debug("[Syft][Content] Injecting the recorder app"),U.createRoot(X).render(v(J.StrictMode,{children:v(Ye,{})}))):console.debug("[Syft][Content] Recorder app already injected");
