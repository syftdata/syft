/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/build/";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 204);
/******/ })
/************************************************************************/
/******/ ({

/***/ 204:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var nullthrows__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(45);
/* harmony import */ var nullthrows__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(nullthrows__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(31);
/* global chrome */



function injectScriptSync(src) {
  let code = '';
  const request = new XMLHttpRequest();
  request.addEventListener('load', function () {
    code = this.responseText;
  });
  request.open('GET', src, false);
  request.send();
  const script = document.createElement('script');
  script.textContent = code; // This script runs before the <head> element is created,
  // so we add the script to <html> instead.

  nullthrows__WEBPACK_IMPORTED_MODULE_0___default()(document.documentElement).appendChild(script);
  nullthrows__WEBPACK_IMPORTED_MODULE_0___default()(script.parentNode).removeChild(script);
}

function injectScriptAsync(src) {
  const script = document.createElement('script');
  script.src = src;
  nullthrows__WEBPACK_IMPORTED_MODULE_0___default()(document.documentElement).appendChild(script);
  nullthrows__WEBPACK_IMPORTED_MODULE_0___default()(script.parentNode).removeChild(script);
}

let lastDetectionResult; // We want to detect when a renderer attaches, and notify the "background page"
// (which is shared between tabs and can highlight the React icon).
// Currently we are in "content script" context, so we can't listen to the hook directly
// (it will be injected directly into the page).
// So instead, the hook will use postMessage() to pass message to us here.
// And when this happens, we'll send a message to the "background page".

window.addEventListener('message', function onMessage({
  data,
  source
}) {
  var _data$payload;

  if (source !== window || !data) {
    return;
  }

  switch (data.source) {
    case 'react-devtools-detector':
      lastDetectionResult = {
        hasDetectedReact: true,
        reactBuildType: data.reactBuildType
      };
      chrome.runtime.sendMessage(lastDetectionResult);
      break;

    case 'react-devtools-extension':
      if (((_data$payload = data.payload) === null || _data$payload === void 0 ? void 0 : _data$payload.type) === 'fetch-file-with-cache') {
        const url = data.payload.url;

        const reject = value => {
          chrome.runtime.sendMessage({
            source: 'react-devtools-content-script',
            payload: {
              type: 'fetch-file-with-cache-error',
              url,
              value
            }
          });
        };

        const resolve = value => {
          chrome.runtime.sendMessage({
            source: 'react-devtools-content-script',
            payload: {
              type: 'fetch-file-with-cache-complete',
              url,
              value
            }
          });
        };

        fetch(url, {
          cache: 'force-cache'
        }).then(response => {
          if (response.ok) {
            response.text().then(text => resolve(text)).catch(error => reject(null));
          } else {
            reject(null);
          }
        }, error => reject(null));
      }

      break;

    case 'react-devtools-inject-backend':
      injectScriptAsync(chrome.runtime.getURL('build/react_devtools_backend.js'));
      break;
  }
}); // NOTE: Firefox WebExtensions content scripts are still alive and not re-injected
// while navigating the history to a document that has not been destroyed yet,
// replay the last detection result if the content script is active and the
// document has been hidden and shown again.

window.addEventListener('pageshow', function ({
  target
}) {
  if (!lastDetectionResult || target !== window.document) {
    return;
  }

  chrome.runtime.sendMessage(lastDetectionResult);
}); // We create a "sync" script tag to page to inject the global hook on Manifest V2 extensions.
// To comply with the new security policy in V3, we use chrome.scripting.registerContentScripts instead (see background.js).
// However, the new API only works for Chrome v102+.
// We insert a "async" script tag as a fallback for older versions.
// It has known issues if JS on the page is faster than the extension.
// Users will see a notice in components tab when that happens (see <Tree>).
// For Firefox, V3 is not ready, so sync injection is still the best approach.

const injectScript = _utils__WEBPACK_IMPORTED_MODULE_1__[/* IS_FIREFOX */ "a"] ? injectScriptSync : injectScriptAsync; // Inject a __REACT_DEVTOOLS_GLOBAL_HOOK__ global for React to interact with.
// Only do this for HTML documents though, to avoid e.g. breaking syntax highlighting for XML docs.
// We need to inject this code because content scripts (ie injectGlobalHook.js) don't have access
// to the webpage's window, so in order to access front end settings
// and communicate with React, we must inject this code into the webpage

switch (document.contentType) {
  case 'text/html':
  case 'application/xhtml+xml':
    {
      injectScript(chrome.runtime.getURL('build/installHook.js'));
      break;
    }
}

if (typeof exportFunction === 'function') {
  // eslint-disable-next-line no-undef
  exportFunction(text => {
    // Call clipboard.writeText from the extension content script
    // (as it has the clipboardWrite permission) and return a Promise
    // accessible to the webpage js code.
    return new window.Promise((resolve, reject) => window.navigator.clipboard.writeText(text).then(resolve, reject));
  }, window.wrappedJSObject.__REACT_DEVTOOLS_GLOBAL_HOOK__, {
    defineAs: 'clipboardCopyText'
  });
}

/***/ }),

/***/ 31:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export IS_EDGE */
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return IS_FIREFOX; });
/* unused harmony export IS_CHROME */
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return getBrowserName; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "c", function() { return getBrowserTheme; });
/* global chrome */
const IS_EDGE = navigator.userAgent.indexOf('Edg') >= 0;
const IS_FIREFOX = navigator.userAgent.indexOf('Firefox') >= 0;
const IS_CHROME = IS_EDGE === false && IS_FIREFOX === false;
function getBrowserName() {
  if (IS_EDGE) {
    return 'Edge';
  }

  if (IS_FIREFOX) {
    return 'Firefox';
  }

  if (IS_CHROME) {
    return 'Chrome';
  }

  throw new Error('Expected browser name to be one of Chrome, Edge or Firefox.');
}
function getBrowserTheme() {
  if (IS_CHROME) {
    // chrome.devtools.panels added in Chrome 18.
    // chrome.devtools.panels.themeName added in Chrome 54.
    return chrome.devtools.panels.themeName === 'dark' ? 'dark' : 'light';
  } else {
    // chrome.devtools.panels.themeName added in Firefox 55.
    // https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/devtools.panels/themeName
    if (chrome.devtools && chrome.devtools.panels) {
      switch (chrome.devtools.panels.themeName) {
        case 'dark':
          return 'dark';

        default:
          return 'light';
      }
    }
  }
}

/***/ }),

/***/ 45:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function nullthrows(x, message) {
  if (x != null) {
    return x;
  }

  var error = new Error(message !== undefined ? message : 'Got unexpected ' + x);
  error.framesToPop = 1; // Skip nullthrows's own stack frame.

  throw error;
}

module.exports = nullthrows;
module.exports.default = nullthrows;
Object.defineProperty(module.exports, '__esModule', {
  value: true
});

/***/ })

/******/ });