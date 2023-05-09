import{a1 as ae}from"./chunk-8a47ec5d.js";import{A as S,S as le,T as g}from"./chunk-c834524c.js";var J={},Q=ae.exports;J.createRoot=Q.createRoot,J.hydrateRoot=Q.hydrateRoot;let h,v;function b(e,r){if(e.nodeType!==Node.ELEMENT_NODE)throw new Error("Can't generate CSS selector for non-element node type.");if(e.tagName.toLowerCase()==="html")return"html";const n={root:document.body,idName:a=>!0,className:a=>!0,tagName:a=>!0,attr:(a,u)=>!1,seedMinLength:1,optimizedMinLength:2,threshold:1e3,maxNumberOfTries:1e4};h={...n,...r},v=oe(h.root,n);let i=A(e,0,()=>A(e,1,()=>A(e,2)));if(i){const a=ee(te(i,e));return a.length>0&&(i=a[0]),y(i)}else throw new Error("Selector was not found.")}function oe(e,r){return e.nodeType===Node.DOCUMENT_NODE?e:e===r.root?e.ownerDocument:e}function A(e,r,n){let i=null,a=[],u=e,c=0;for(;u&&u!==h.root.parentElement;){let o=p(ue(u))||p(...fe(u))||p(...ce(u))||p(de(u))||[se()];const d=he(u);if(r===0)d&&(o=o.concat(o.filter(E).map(l=>x(l,d))));else if(r===1)o=o.slice(0,1),d&&(o=o.concat(o.filter(E).map(l=>x(l,d))));else if(r===2){const[l]=o=o.slice(0,1);d&&E(l)&&(o=[x(l,d)])}for(let l of o)l.level=c;if(a.push(o),a.length>=h.seedMinLength&&(i=X(a,n),i))break;u=u.parentElement,c++}return i||(i=X(a,n)),i}function X(e,r){const n=ee(k(e));if(n.length>h.threshold)return r?r():null;for(let i of n)if(Z(i))return i;return null}function y(e){let r=e[0],n=r.name;for(let i=1;i<e.length;i++){const a=e[i].level||0;r.level===a-1?n=`${e[i].name} > ${n}`:n=`${e[i].name} ${n}`,r=e[i]}return n}function Y(e){return e.map(r=>r.penalty).reduce((r,n)=>r+n,0)}function Z(e){switch(v.querySelectorAll(y(e)).length){case 0:throw new Error(`Can't select any node with this selector: ${y(e)}`);case 1:return!0;default:return!1}}function ue(e){const r=e.getAttribute("id");return r&&h.idName(r)?{name:"#"+w(r,{isIdentifier:!0}),penalty:0}:null}function fe(e){return Array.from(e.attributes).filter(n=>h.attr(n.name,n.value)).map(n=>({name:"["+w(n.name,{isIdentifier:!0})+'="'+w(n.value)+'"]',penalty:.5}))}function ce(e){return Array.from(e.classList).filter(h.className).map(n=>({name:"."+w(n,{isIdentifier:!0}),penalty:1}))}function de(e){const r=e.tagName.toLowerCase();return h.tagName(r)?{name:r,penalty:2}:null}function se(){return{name:"*",penalty:3}}function he(e){const r=e.parentNode;if(!r)return null;let n=r.firstChild;if(!n)return null;let i=0;for(;n&&(n.nodeType===Node.ELEMENT_NODE&&i++,n!==e);)n=n.nextSibling;return i}function x(e,r){return{name:e.name+`:nth-child(${r})`,penalty:e.penalty+1}}function E(e){return e.name!=="html"&&!e.name.startsWith("#")}function p(...e){const r=e.filter(ge);return r.length>0?r:null}function ge(e){return e!=null}function*k(e,r=[]){if(e.length>0)for(let n of e[0])yield*k(e.slice(1,e.length),r.concat(n));else yield r}function ee(e){return Array.from(e).sort((r,n)=>Y(r)-Y(n))}function*te(e,r,n={counter:0,visited:new Map}){if(e.length>2&&e.length>h.optimizedMinLength)for(let i=1;i<e.length-1;i++){if(n.counter>h.maxNumberOfTries)return;n.counter+=1;const a=[...e];a.splice(i,1);const u=y(a);if(n.visited.has(u))return;Z(a)&&me(a,r)&&(yield a,n.visited.set(u,!0),yield*te(a,r,n))}}function me(e,r){return v.querySelector(y(e))===r}const Se=/[ -,\.\/:-@\[-\^`\{-~]/,ye=/[ -,\.\/:-@\[\]\^`\{-~]/,pe=/(^|\\+)?(\\[A-F0-9]{1,6})\x20(?![a-fA-F0-9\x20])/g,Ne={escapeEverything:!1,isIdentifier:!1,quotes:"single",wrap:!1};function w(e,r={}){const n={...Ne,...r};n.quotes!="single"&&n.quotes!="double"&&(n.quotes="single");const i=n.quotes=="double"?'"':"'",a=n.isIdentifier,u=e.charAt(0);let c="",o=0;const d=e.length;for(;o<d;){const l=e.charAt(o++);let f=l.charCodeAt(0),s;if(f<32||f>126){if(f>=55296&&f<=56319&&o<d){const m=e.charCodeAt(o++);(m&64512)==56320?f=((f&1023)<<10)+(m&1023)+65536:o--}s="\\"+f.toString(16).toUpperCase()+" "}else n.escapeEverything?Se.test(l)?s="\\"+l:s="\\"+f.toString(16).toUpperCase()+" ":/[\t\n\f\r\x0B]/.test(l)?s="\\"+f.toString(16).toUpperCase()+" ":l=="\\"||!a&&(l=='"'&&i==l||l=="'"&&i==l)||a&&ye.test(l)?s="\\"+l:s=l;c+=s}return a&&(/^-[-\d]/.test(c)?c="\\-"+c.slice(1):/\d/.test(u)&&(c="\\3"+u+" "+c.slice(1))),c=c.replace(pe,function(l,f,s){return f&&f.length%2?l:(f||"")+s}),!a&&n.wrap?i+c+i:c}function ne(e,r){return new Set(r.filter(n=>{const i=e.getAttribute(n);return i!=null&&i.length>0}))}function re(e,r){return ne(e,r).size>0}function be(e,r){const n=ne(e,r);return i=>n.has(i)}function N(e,r){let n=null;try{n=re(e,r)?b(e,{idName:()=>!1,attr:be(e,r)}):null}catch{}return n}function we(e){return e.length===1&&e.match(/[0-9]/)}function Ee(e){var l;if(e==null)return null;const r=e.getAttribute("href");let n=null;try{n=b(e)}catch{}let i=null;try{i=b(e,{attr:()=>!0})}catch{}const a=N(e,["href"]),u=N(e,["name","placeholder","for"]),c=N(e,["aria-label","alt","title"]),o=N(e,["data-testid","data-test-id","data-testing","data-test","data-qa","data-cy"]);let d=null;try{d=re(e,["id"])&&!we((l=e.id)==null?void 0:l[0])?b(e,{attr:f=>f==="id"}):null}catch{}return{id:d,generalSelector:n,attrSelector:i,testIdSelector:o,text:e.innerText,href:r,hrefSelector:a,accessibilitySelector:c,formSelector:u}}function ve(e,r){var n,i,a,u,c,o,d,l,f,s,m,C,I,T,q,D,L,M,O,U,z,F,P,R,$,B,_,K,V,H,W,j,G;switch(e.type){case S.Click:case S.Hover:case S.DragAndDrop:{const t=e.selectors,ie=r===le.Playwright&&((n=t==null?void 0:t.text)==null?void 0:n.length)!=null&&((i=t==null?void 0:t.text)==null?void 0:i.length)<25&&e.hasOnlyText?`text=${t.text}`:null;return e.tagName===g.Input?(l=(d=(o=(c=(u=(a=t.testIdSelector)!=null?a:t==null?void 0:t.id)!=null?u:t==null?void 0:t.formSelector)!=null?c:t==null?void 0:t.accessibilitySelector)!=null?o:t==null?void 0:t.generalSelector)!=null?d:t==null?void 0:t.attrSelector)!=null?l:null:e.tagName===g.A?(T=(I=(C=(m=(s=(f=t.testIdSelector)!=null?f:t==null?void 0:t.id)!=null?s:t==null?void 0:t.hrefSelector)!=null?m:t==null?void 0:t.accessibilitySelector)!=null?C:t==null?void 0:t.generalSelector)!=null?I:t==null?void 0:t.attrSelector)!=null?T:null:e.tagName===g.Span||e.tagName===g.EM||e.tagName===g.Cite||e.tagName===g.B||e.tagName===g.Strong?(z=(U=(O=(M=(L=(D=(q=t.testIdSelector)!=null?q:t==null?void 0:t.id)!=null?D:t==null?void 0:t.accessibilitySelector)!=null?L:t==null?void 0:t.hrefSelector)!=null?M:ie)!=null?O:t==null?void 0:t.generalSelector)!=null?U:t==null?void 0:t.attrSelector)!=null?z:null:(_=(B=($=(R=(P=(F=t.testIdSelector)!=null?F:t==null?void 0:t.id)!=null?P:t==null?void 0:t.accessibilitySelector)!=null?R:t==null?void 0:t.hrefSelector)!=null?$:t==null?void 0:t.generalSelector)!=null?B:t==null?void 0:t.attrSelector)!=null?_:null}case S.Input:case S.Keydown:{const t=e.selectors;return(G=(j=(W=(H=(V=(K=t.testIdSelector)!=null?K:t==null?void 0:t.id)!=null?V:t==null?void 0:t.formSelector)!=null?H:t==null?void 0:t.accessibilitySelector)!=null?W:t==null?void 0:t.generalSelector)!=null?j:t==null?void 0:t.attrSelector)!=null?G:null}}return null}export{Ee as a,J as c,ve as g};
