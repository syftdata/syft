import{A as f}from"./chunk-8ba139f3.js";const u={WebAppUrl:"https://syft.dev"},d={WebAppUrl:"http://localhost:3000"},i=async()=>(await chrome.management.getSelf()).installType==="development"?d:u;function h(){chrome.storage.local.set({recordingState:"finished",recordingTabId:null,recordingFrameId:null,returnTabId:null})}function m(e,t,o){const n={recordingState:"active",recordingTabId:e,recordingFrameId:t,recording:[{type:"load",url:o}]};chrome.storage.local.set(n)}function S(e){chrome.storage.local.set({preferredLibrary:e})}function p(e){chrome.storage.local.set({loginSession:e})}async function w(e){return await chrome.tabs.create({url:e})}function c(e){return new Promise((t,o)=>{chrome.storage.local.get(e,n=>{t(n)})})}async function b(e,t){const o={type:f.Navigate,url:e,source:t};await v(o)}async function v(e,t){const{recording:o}=await c(["recording"]),n=[...o];n.splice(t!=null?t:n.length,0,e),await chrome.storage.local.set({recording:n})}async function A(e,t){const{recording:o}=await c(["recording"]),n=[...o];return t!=null?n.splice(e,1,t):n.splice(e,1),await chrome.storage.local.set({recording:n}),n}function l(e){return e==null||e.length===0}function I(e,t){return e==t||l(e)&&l(t)?!0:!e||!t?!1:e.length===t.length&&e.every((o,n)=>o===t[n])}async function a(){const{loginSession:e}=await c(["loginSession"]);if(e)return e;const t=await i(),o=await fetch(`${t.WebAppUrl}/api/auth/session`,{mode:"cors"});console.log("[Syft][Devtools] loginSession not found. Retrieving from server.");const n=await o.json();if(console.log("[Syft][Devtools] session",n),Object.keys(n).length>0)return console.log("[Syft][Devtools] setting loginSession in storage"),p(n),n}let s=null;async function T(){const e=await a();if(e)return e;{const t=await i();return s&&clearInterval(s),new Promise((o,n)=>{w(t.WebAppUrl),s=setInterval(async()=>{const r=await a();r&&(o(r),s&&clearInterval(s))},1e3)})}}async function j(e,t){const o=await a();if(o){const n=await i(),g=await(await fetch(`${n.WebAppUrl}/api/authed/file`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${o.jwt}`},body:JSON.stringify({name:e,contents:t})})).json();console.log("[Syft][Devtools] saveFile response",g)}}export{T as a,j as b,m as c,h as d,A as e,I as i,c as l,b as r,S as s};