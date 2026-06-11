(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
const version = "2.9.8";
const pkg = {
  version
};
const APP_VERSION = pkg.version;
document.getElementById("boot-version").textContent = "v" + APP_VERSION;
function getDefaultExportFromCjs(x) {
  return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
}
var jsxRuntime$1 = { exports: {} };
var reactJsxRuntime_production$1 = {};
/**
 * @license React
 * react-jsx-runtime.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var hasRequiredReactJsxRuntime_production$1;
function requireReactJsxRuntime_production$1() {
  if (hasRequiredReactJsxRuntime_production$1) return reactJsxRuntime_production$1;
  hasRequiredReactJsxRuntime_production$1 = 1;
  var REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element"), REACT_FRAGMENT_TYPE = Symbol.for("react.fragment");
  function jsxProd(type, config, maybeKey) {
    var key = null;
    void 0 !== maybeKey && (key = "" + maybeKey);
    void 0 !== config.key && (key = "" + config.key);
    if ("key" in config) {
      maybeKey = {};
      for (var propName in config)
        "key" !== propName && (maybeKey[propName] = config[propName]);
    } else maybeKey = config;
    config = maybeKey.ref;
    return {
      $$typeof: REACT_ELEMENT_TYPE,
      type,
      key,
      ref: void 0 !== config ? config : null,
      props: maybeKey
    };
  }
  reactJsxRuntime_production$1.Fragment = REACT_FRAGMENT_TYPE;
  reactJsxRuntime_production$1.jsx = jsxProd;
  reactJsxRuntime_production$1.jsxs = jsxProd;
  return reactJsxRuntime_production$1;
}
var hasRequiredJsxRuntime$1;
function requireJsxRuntime$1() {
  if (hasRequiredJsxRuntime$1) return jsxRuntime$1.exports;
  hasRequiredJsxRuntime$1 = 1;
  {
    jsxRuntime$1.exports = requireReactJsxRuntime_production$1();
  }
  return jsxRuntime$1.exports;
}
var jsxRuntimeExports$1 = requireJsxRuntime$1();
var client = { exports: {} };
var reactDomClient_production = {};
var scheduler = { exports: {} };
var scheduler_production = {};
/**
 * @license React
 * scheduler.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var hasRequiredScheduler_production;
function requireScheduler_production() {
  if (hasRequiredScheduler_production) return scheduler_production;
  hasRequiredScheduler_production = 1;
  (function(exports) {
    function push(heap, node) {
      var index = heap.length;
      heap.push(node);
      a: for (; 0 < index; ) {
        var parentIndex = index - 1 >>> 1, parent = heap[parentIndex];
        if (0 < compare(parent, node))
          heap[parentIndex] = node, heap[index] = parent, index = parentIndex;
        else break a;
      }
    }
    function peek(heap) {
      return 0 === heap.length ? null : heap[0];
    }
    function pop(heap) {
      if (0 === heap.length) return null;
      var first = heap[0], last = heap.pop();
      if (last !== first) {
        heap[0] = last;
        a: for (var index = 0, length = heap.length, halfLength = length >>> 1; index < halfLength; ) {
          var leftIndex = 2 * (index + 1) - 1, left = heap[leftIndex], rightIndex = leftIndex + 1, right = heap[rightIndex];
          if (0 > compare(left, last))
            rightIndex < length && 0 > compare(right, left) ? (heap[index] = right, heap[rightIndex] = last, index = rightIndex) : (heap[index] = left, heap[leftIndex] = last, index = leftIndex);
          else if (rightIndex < length && 0 > compare(right, last))
            heap[index] = right, heap[rightIndex] = last, index = rightIndex;
          else break a;
        }
      }
      return first;
    }
    function compare(a, b) {
      var diff = a.sortIndex - b.sortIndex;
      return 0 !== diff ? diff : a.id - b.id;
    }
    exports.unstable_now = void 0;
    if ("object" === typeof performance && "function" === typeof performance.now) {
      var localPerformance = performance;
      exports.unstable_now = function() {
        return localPerformance.now();
      };
    } else {
      var localDate = Date, initialTime = localDate.now();
      exports.unstable_now = function() {
        return localDate.now() - initialTime;
      };
    }
    var taskQueue = [], timerQueue = [], taskIdCounter = 1, currentTask = null, currentPriorityLevel = 3, isPerformingWork = false, isHostCallbackScheduled = false, isHostTimeoutScheduled = false, needsPaint = false, localSetTimeout = "function" === typeof setTimeout ? setTimeout : null, localClearTimeout = "function" === typeof clearTimeout ? clearTimeout : null, localSetImmediate = "undefined" !== typeof setImmediate ? setImmediate : null;
    function advanceTimers(currentTime) {
      for (var timer = peek(timerQueue); null !== timer; ) {
        if (null === timer.callback) pop(timerQueue);
        else if (timer.startTime <= currentTime)
          pop(timerQueue), timer.sortIndex = timer.expirationTime, push(taskQueue, timer);
        else break;
        timer = peek(timerQueue);
      }
    }
    function handleTimeout(currentTime) {
      isHostTimeoutScheduled = false;
      advanceTimers(currentTime);
      if (!isHostCallbackScheduled)
        if (null !== peek(taskQueue))
          isHostCallbackScheduled = true, isMessageLoopRunning || (isMessageLoopRunning = true, schedulePerformWorkUntilDeadline());
        else {
          var firstTimer = peek(timerQueue);
          null !== firstTimer && requestHostTimeout(handleTimeout, firstTimer.startTime - currentTime);
        }
    }
    var isMessageLoopRunning = false, taskTimeoutID = -1, frameInterval = 5, startTime = -1;
    function shouldYieldToHost() {
      return needsPaint ? true : exports.unstable_now() - startTime < frameInterval ? false : true;
    }
    function performWorkUntilDeadline() {
      needsPaint = false;
      if (isMessageLoopRunning) {
        var currentTime = exports.unstable_now();
        startTime = currentTime;
        var hasMoreWork = true;
        try {
          a: {
            isHostCallbackScheduled = false;
            isHostTimeoutScheduled && (isHostTimeoutScheduled = false, localClearTimeout(taskTimeoutID), taskTimeoutID = -1);
            isPerformingWork = true;
            var previousPriorityLevel = currentPriorityLevel;
            try {
              b: {
                advanceTimers(currentTime);
                for (currentTask = peek(taskQueue); null !== currentTask && !(currentTask.expirationTime > currentTime && shouldYieldToHost()); ) {
                  var callback = currentTask.callback;
                  if ("function" === typeof callback) {
                    currentTask.callback = null;
                    currentPriorityLevel = currentTask.priorityLevel;
                    var continuationCallback = callback(
                      currentTask.expirationTime <= currentTime
                    );
                    currentTime = exports.unstable_now();
                    if ("function" === typeof continuationCallback) {
                      currentTask.callback = continuationCallback;
                      advanceTimers(currentTime);
                      hasMoreWork = true;
                      break b;
                    }
                    currentTask === peek(taskQueue) && pop(taskQueue);
                    advanceTimers(currentTime);
                  } else pop(taskQueue);
                  currentTask = peek(taskQueue);
                }
                if (null !== currentTask) hasMoreWork = true;
                else {
                  var firstTimer = peek(timerQueue);
                  null !== firstTimer && requestHostTimeout(
                    handleTimeout,
                    firstTimer.startTime - currentTime
                  );
                  hasMoreWork = false;
                }
              }
              break a;
            } finally {
              currentTask = null, currentPriorityLevel = previousPriorityLevel, isPerformingWork = false;
            }
            hasMoreWork = void 0;
          }
        } finally {
          hasMoreWork ? schedulePerformWorkUntilDeadline() : isMessageLoopRunning = false;
        }
      }
    }
    var schedulePerformWorkUntilDeadline;
    if ("function" === typeof localSetImmediate)
      schedulePerformWorkUntilDeadline = function() {
        localSetImmediate(performWorkUntilDeadline);
      };
    else if ("undefined" !== typeof MessageChannel) {
      var channel = new MessageChannel(), port = channel.port2;
      channel.port1.onmessage = performWorkUntilDeadline;
      schedulePerformWorkUntilDeadline = function() {
        port.postMessage(null);
      };
    } else
      schedulePerformWorkUntilDeadline = function() {
        localSetTimeout(performWorkUntilDeadline, 0);
      };
    function requestHostTimeout(callback, ms) {
      taskTimeoutID = localSetTimeout(function() {
        callback(exports.unstable_now());
      }, ms);
    }
    exports.unstable_IdlePriority = 5;
    exports.unstable_ImmediatePriority = 1;
    exports.unstable_LowPriority = 4;
    exports.unstable_NormalPriority = 3;
    exports.unstable_Profiling = null;
    exports.unstable_UserBlockingPriority = 2;
    exports.unstable_cancelCallback = function(task) {
      task.callback = null;
    };
    exports.unstable_forceFrameRate = function(fps) {
      0 > fps || 125 < fps ? console.error(
        "forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"
      ) : frameInterval = 0 < fps ? Math.floor(1e3 / fps) : 5;
    };
    exports.unstable_getCurrentPriorityLevel = function() {
      return currentPriorityLevel;
    };
    exports.unstable_next = function(eventHandler) {
      switch (currentPriorityLevel) {
        case 1:
        case 2:
        case 3:
          var priorityLevel = 3;
          break;
        default:
          priorityLevel = currentPriorityLevel;
      }
      var previousPriorityLevel = currentPriorityLevel;
      currentPriorityLevel = priorityLevel;
      try {
        return eventHandler();
      } finally {
        currentPriorityLevel = previousPriorityLevel;
      }
    };
    exports.unstable_requestPaint = function() {
      needsPaint = true;
    };
    exports.unstable_runWithPriority = function(priorityLevel, eventHandler) {
      switch (priorityLevel) {
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
          break;
        default:
          priorityLevel = 3;
      }
      var previousPriorityLevel = currentPriorityLevel;
      currentPriorityLevel = priorityLevel;
      try {
        return eventHandler();
      } finally {
        currentPriorityLevel = previousPriorityLevel;
      }
    };
    exports.unstable_scheduleCallback = function(priorityLevel, callback, options) {
      var currentTime = exports.unstable_now();
      "object" === typeof options && null !== options ? (options = options.delay, options = "number" === typeof options && 0 < options ? currentTime + options : currentTime) : options = currentTime;
      switch (priorityLevel) {
        case 1:
          var timeout = -1;
          break;
        case 2:
          timeout = 250;
          break;
        case 5:
          timeout = 1073741823;
          break;
        case 4:
          timeout = 1e4;
          break;
        default:
          timeout = 5e3;
      }
      timeout = options + timeout;
      priorityLevel = {
        id: taskIdCounter++,
        callback,
        priorityLevel,
        startTime: options,
        expirationTime: timeout,
        sortIndex: -1
      };
      options > currentTime ? (priorityLevel.sortIndex = options, push(timerQueue, priorityLevel), null === peek(taskQueue) && priorityLevel === peek(timerQueue) && (isHostTimeoutScheduled ? (localClearTimeout(taskTimeoutID), taskTimeoutID = -1) : isHostTimeoutScheduled = true, requestHostTimeout(handleTimeout, options - currentTime))) : (priorityLevel.sortIndex = timeout, push(taskQueue, priorityLevel), isHostCallbackScheduled || isPerformingWork || (isHostCallbackScheduled = true, isMessageLoopRunning || (isMessageLoopRunning = true, schedulePerformWorkUntilDeadline())));
      return priorityLevel;
    };
    exports.unstable_shouldYield = shouldYieldToHost;
    exports.unstable_wrapCallback = function(callback) {
      var parentPriorityLevel = currentPriorityLevel;
      return function() {
        var previousPriorityLevel = currentPriorityLevel;
        currentPriorityLevel = parentPriorityLevel;
        try {
          return callback.apply(this, arguments);
        } finally {
          currentPriorityLevel = previousPriorityLevel;
        }
      };
    };
  })(scheduler_production);
  return scheduler_production;
}
var hasRequiredScheduler;
function requireScheduler() {
  if (hasRequiredScheduler) return scheduler.exports;
  hasRequiredScheduler = 1;
  {
    scheduler.exports = requireScheduler_production();
  }
  return scheduler.exports;
}
var react$1 = { exports: {} };
var react_production$1 = {};
/**
 * @license React
 * react.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var hasRequiredReact_production$1;
function requireReact_production$1() {
  if (hasRequiredReact_production$1) return react_production$1;
  hasRequiredReact_production$1 = 1;
  var REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element"), REACT_PORTAL_TYPE = Symbol.for("react.portal"), REACT_FRAGMENT_TYPE = Symbol.for("react.fragment"), REACT_STRICT_MODE_TYPE = Symbol.for("react.strict_mode"), REACT_PROFILER_TYPE = Symbol.for("react.profiler"), REACT_CONSUMER_TYPE = Symbol.for("react.consumer"), REACT_CONTEXT_TYPE = Symbol.for("react.context"), REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref"), REACT_SUSPENSE_TYPE = Symbol.for("react.suspense"), REACT_MEMO_TYPE = Symbol.for("react.memo"), REACT_LAZY_TYPE = Symbol.for("react.lazy"), REACT_ACTIVITY_TYPE = Symbol.for("react.activity"), MAYBE_ITERATOR_SYMBOL = Symbol.iterator;
  function getIteratorFn(maybeIterable) {
    if (null === maybeIterable || "object" !== typeof maybeIterable) return null;
    maybeIterable = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable["@@iterator"];
    return "function" === typeof maybeIterable ? maybeIterable : null;
  }
  var ReactNoopUpdateQueue = {
    isMounted: function() {
      return false;
    },
    enqueueForceUpdate: function() {
    },
    enqueueReplaceState: function() {
    },
    enqueueSetState: function() {
    }
  }, assign = Object.assign, emptyObject = {};
  function Component(props, context, updater) {
    this.props = props;
    this.context = context;
    this.refs = emptyObject;
    this.updater = updater || ReactNoopUpdateQueue;
  }
  Component.prototype.isReactComponent = {};
  Component.prototype.setState = function(partialState, callback) {
    if ("object" !== typeof partialState && "function" !== typeof partialState && null != partialState)
      throw Error(
        "takes an object of state variables to update or a function which returns an object of state variables."
      );
    this.updater.enqueueSetState(this, partialState, callback, "setState");
  };
  Component.prototype.forceUpdate = function(callback) {
    this.updater.enqueueForceUpdate(this, callback, "forceUpdate");
  };
  function ComponentDummy() {
  }
  ComponentDummy.prototype = Component.prototype;
  function PureComponent(props, context, updater) {
    this.props = props;
    this.context = context;
    this.refs = emptyObject;
    this.updater = updater || ReactNoopUpdateQueue;
  }
  var pureComponentPrototype = PureComponent.prototype = new ComponentDummy();
  pureComponentPrototype.constructor = PureComponent;
  assign(pureComponentPrototype, Component.prototype);
  pureComponentPrototype.isPureReactComponent = true;
  var isArrayImpl = Array.isArray;
  function noop() {
  }
  var ReactSharedInternals = { H: null, A: null, T: null, S: null }, hasOwnProperty = Object.prototype.hasOwnProperty;
  function ReactElement(type, key, props) {
    var refProp = props.ref;
    return {
      $$typeof: REACT_ELEMENT_TYPE,
      type,
      key,
      ref: void 0 !== refProp ? refProp : null,
      props
    };
  }
  function cloneAndReplaceKey(oldElement, newKey) {
    return ReactElement(oldElement.type, newKey, oldElement.props);
  }
  function isValidElement(object) {
    return "object" === typeof object && null !== object && object.$$typeof === REACT_ELEMENT_TYPE;
  }
  function escape(key) {
    var escaperLookup = { "=": "=0", ":": "=2" };
    return "$" + key.replace(/[=:]/g, function(match) {
      return escaperLookup[match];
    });
  }
  var userProvidedKeyEscapeRegex = /\/+/g;
  function getElementKey(element, index) {
    return "object" === typeof element && null !== element && null != element.key ? escape("" + element.key) : index.toString(36);
  }
  function resolveThenable(thenable) {
    switch (thenable.status) {
      case "fulfilled":
        return thenable.value;
      case "rejected":
        throw thenable.reason;
      default:
        switch ("string" === typeof thenable.status ? thenable.then(noop, noop) : (thenable.status = "pending", thenable.then(
          function(fulfilledValue) {
            "pending" === thenable.status && (thenable.status = "fulfilled", thenable.value = fulfilledValue);
          },
          function(error) {
            "pending" === thenable.status && (thenable.status = "rejected", thenable.reason = error);
          }
        )), thenable.status) {
          case "fulfilled":
            return thenable.value;
          case "rejected":
            throw thenable.reason;
        }
    }
    throw thenable;
  }
  function mapIntoArray(children, array, escapedPrefix, nameSoFar, callback) {
    var type = typeof children;
    if ("undefined" === type || "boolean" === type) children = null;
    var invokeCallback = false;
    if (null === children) invokeCallback = true;
    else
      switch (type) {
        case "bigint":
        case "string":
        case "number":
          invokeCallback = true;
          break;
        case "object":
          switch (children.$$typeof) {
            case REACT_ELEMENT_TYPE:
            case REACT_PORTAL_TYPE:
              invokeCallback = true;
              break;
            case REACT_LAZY_TYPE:
              return invokeCallback = children._init, mapIntoArray(
                invokeCallback(children._payload),
                array,
                escapedPrefix,
                nameSoFar,
                callback
              );
          }
      }
    if (invokeCallback)
      return callback = callback(children), invokeCallback = "" === nameSoFar ? "." + getElementKey(children, 0) : nameSoFar, isArrayImpl(callback) ? (escapedPrefix = "", null != invokeCallback && (escapedPrefix = invokeCallback.replace(userProvidedKeyEscapeRegex, "$&/") + "/"), mapIntoArray(callback, array, escapedPrefix, "", function(c) {
        return c;
      })) : null != callback && (isValidElement(callback) && (callback = cloneAndReplaceKey(
        callback,
        escapedPrefix + (null == callback.key || children && children.key === callback.key ? "" : ("" + callback.key).replace(
          userProvidedKeyEscapeRegex,
          "$&/"
        ) + "/") + invokeCallback
      )), array.push(callback)), 1;
    invokeCallback = 0;
    var nextNamePrefix = "" === nameSoFar ? "." : nameSoFar + ":";
    if (isArrayImpl(children))
      for (var i = 0; i < children.length; i++)
        nameSoFar = children[i], type = nextNamePrefix + getElementKey(nameSoFar, i), invokeCallback += mapIntoArray(
          nameSoFar,
          array,
          escapedPrefix,
          type,
          callback
        );
    else if (i = getIteratorFn(children), "function" === typeof i)
      for (children = i.call(children), i = 0; !(nameSoFar = children.next()).done; )
        nameSoFar = nameSoFar.value, type = nextNamePrefix + getElementKey(nameSoFar, i++), invokeCallback += mapIntoArray(
          nameSoFar,
          array,
          escapedPrefix,
          type,
          callback
        );
    else if ("object" === type) {
      if ("function" === typeof children.then)
        return mapIntoArray(
          resolveThenable(children),
          array,
          escapedPrefix,
          nameSoFar,
          callback
        );
      array = String(children);
      throw Error(
        "Objects are not valid as a React child (found: " + ("[object Object]" === array ? "object with keys {" + Object.keys(children).join(", ") + "}" : array) + "). If you meant to render a collection of children, use an array instead."
      );
    }
    return invokeCallback;
  }
  function mapChildren(children, func, context) {
    if (null == children) return children;
    var result = [], count = 0;
    mapIntoArray(children, result, "", "", function(child) {
      return func.call(context, child, count++);
    });
    return result;
  }
  function lazyInitializer(payload) {
    if (-1 === payload._status) {
      var ctor = payload._result;
      ctor = ctor();
      ctor.then(
        function(moduleObject) {
          if (0 === payload._status || -1 === payload._status)
            payload._status = 1, payload._result = moduleObject;
        },
        function(error) {
          if (0 === payload._status || -1 === payload._status)
            payload._status = 2, payload._result = error;
        }
      );
      -1 === payload._status && (payload._status = 0, payload._result = ctor);
    }
    if (1 === payload._status) return payload._result.default;
    throw payload._result;
  }
  var reportGlobalError = "function" === typeof reportError ? reportError : function(error) {
    if ("object" === typeof window && "function" === typeof window.ErrorEvent) {
      var event = new window.ErrorEvent("error", {
        bubbles: true,
        cancelable: true,
        message: "object" === typeof error && null !== error && "string" === typeof error.message ? String(error.message) : String(error),
        error
      });
      if (!window.dispatchEvent(event)) return;
    } else if ("object" === typeof process && "function" === typeof process.emit) {
      process.emit("uncaughtException", error);
      return;
    }
    console.error(error);
  }, Children = {
    map: mapChildren,
    forEach: function(children, forEachFunc, forEachContext) {
      mapChildren(
        children,
        function() {
          forEachFunc.apply(this, arguments);
        },
        forEachContext
      );
    },
    count: function(children) {
      var n = 0;
      mapChildren(children, function() {
        n++;
      });
      return n;
    },
    toArray: function(children) {
      return mapChildren(children, function(child) {
        return child;
      }) || [];
    },
    only: function(children) {
      if (!isValidElement(children))
        throw Error(
          "React.Children.only expected to receive a single React element child."
        );
      return children;
    }
  };
  react_production$1.Activity = REACT_ACTIVITY_TYPE;
  react_production$1.Children = Children;
  react_production$1.Component = Component;
  react_production$1.Fragment = REACT_FRAGMENT_TYPE;
  react_production$1.Profiler = REACT_PROFILER_TYPE;
  react_production$1.PureComponent = PureComponent;
  react_production$1.StrictMode = REACT_STRICT_MODE_TYPE;
  react_production$1.Suspense = REACT_SUSPENSE_TYPE;
  react_production$1.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = ReactSharedInternals;
  react_production$1.__COMPILER_RUNTIME = {
    __proto__: null,
    c: function(size) {
      return ReactSharedInternals.H.useMemoCache(size);
    }
  };
  react_production$1.cache = function(fn) {
    return function() {
      return fn.apply(null, arguments);
    };
  };
  react_production$1.cacheSignal = function() {
    return null;
  };
  react_production$1.cloneElement = function(element, config, children) {
    if (null === element || void 0 === element)
      throw Error(
        "The argument must be a React element, but you passed " + element + "."
      );
    var props = assign({}, element.props), key = element.key;
    if (null != config)
      for (propName in void 0 !== config.key && (key = "" + config.key), config)
        !hasOwnProperty.call(config, propName) || "key" === propName || "__self" === propName || "__source" === propName || "ref" === propName && void 0 === config.ref || (props[propName] = config[propName]);
    var propName = arguments.length - 2;
    if (1 === propName) props.children = children;
    else if (1 < propName) {
      for (var childArray = Array(propName), i = 0; i < propName; i++)
        childArray[i] = arguments[i + 2];
      props.children = childArray;
    }
    return ReactElement(element.type, key, props);
  };
  react_production$1.createContext = function(defaultValue) {
    defaultValue = {
      $$typeof: REACT_CONTEXT_TYPE,
      _currentValue: defaultValue,
      _currentValue2: defaultValue,
      _threadCount: 0,
      Provider: null,
      Consumer: null
    };
    defaultValue.Provider = defaultValue;
    defaultValue.Consumer = {
      $$typeof: REACT_CONSUMER_TYPE,
      _context: defaultValue
    };
    return defaultValue;
  };
  react_production$1.createElement = function(type, config, children) {
    var propName, props = {}, key = null;
    if (null != config)
      for (propName in void 0 !== config.key && (key = "" + config.key), config)
        hasOwnProperty.call(config, propName) && "key" !== propName && "__self" !== propName && "__source" !== propName && (props[propName] = config[propName]);
    var childrenLength = arguments.length - 2;
    if (1 === childrenLength) props.children = children;
    else if (1 < childrenLength) {
      for (var childArray = Array(childrenLength), i = 0; i < childrenLength; i++)
        childArray[i] = arguments[i + 2];
      props.children = childArray;
    }
    if (type && type.defaultProps)
      for (propName in childrenLength = type.defaultProps, childrenLength)
        void 0 === props[propName] && (props[propName] = childrenLength[propName]);
    return ReactElement(type, key, props);
  };
  react_production$1.createRef = function() {
    return { current: null };
  };
  react_production$1.forwardRef = function(render) {
    return { $$typeof: REACT_FORWARD_REF_TYPE, render };
  };
  react_production$1.isValidElement = isValidElement;
  react_production$1.lazy = function(ctor) {
    return {
      $$typeof: REACT_LAZY_TYPE,
      _payload: { _status: -1, _result: ctor },
      _init: lazyInitializer
    };
  };
  react_production$1.memo = function(type, compare) {
    return {
      $$typeof: REACT_MEMO_TYPE,
      type,
      compare: void 0 === compare ? null : compare
    };
  };
  react_production$1.startTransition = function(scope) {
    var prevTransition = ReactSharedInternals.T, currentTransition = {};
    ReactSharedInternals.T = currentTransition;
    try {
      var returnValue = scope(), onStartTransitionFinish = ReactSharedInternals.S;
      null !== onStartTransitionFinish && onStartTransitionFinish(currentTransition, returnValue);
      "object" === typeof returnValue && null !== returnValue && "function" === typeof returnValue.then && returnValue.then(noop, reportGlobalError);
    } catch (error) {
      reportGlobalError(error);
    } finally {
      null !== prevTransition && null !== currentTransition.types && (prevTransition.types = currentTransition.types), ReactSharedInternals.T = prevTransition;
    }
  };
  react_production$1.unstable_useCacheRefresh = function() {
    return ReactSharedInternals.H.useCacheRefresh();
  };
  react_production$1.use = function(usable) {
    return ReactSharedInternals.H.use(usable);
  };
  react_production$1.useActionState = function(action, initialState, permalink) {
    return ReactSharedInternals.H.useActionState(action, initialState, permalink);
  };
  react_production$1.useCallback = function(callback, deps) {
    return ReactSharedInternals.H.useCallback(callback, deps);
  };
  react_production$1.useContext = function(Context) {
    return ReactSharedInternals.H.useContext(Context);
  };
  react_production$1.useDebugValue = function() {
  };
  react_production$1.useDeferredValue = function(value, initialValue) {
    return ReactSharedInternals.H.useDeferredValue(value, initialValue);
  };
  react_production$1.useEffect = function(create, deps) {
    return ReactSharedInternals.H.useEffect(create, deps);
  };
  react_production$1.useEffectEvent = function(callback) {
    return ReactSharedInternals.H.useEffectEvent(callback);
  };
  react_production$1.useId = function() {
    return ReactSharedInternals.H.useId();
  };
  react_production$1.useImperativeHandle = function(ref, create, deps) {
    return ReactSharedInternals.H.useImperativeHandle(ref, create, deps);
  };
  react_production$1.useInsertionEffect = function(create, deps) {
    return ReactSharedInternals.H.useInsertionEffect(create, deps);
  };
  react_production$1.useLayoutEffect = function(create, deps) {
    return ReactSharedInternals.H.useLayoutEffect(create, deps);
  };
  react_production$1.useMemo = function(create, deps) {
    return ReactSharedInternals.H.useMemo(create, deps);
  };
  react_production$1.useOptimistic = function(passthrough, reducer) {
    return ReactSharedInternals.H.useOptimistic(passthrough, reducer);
  };
  react_production$1.useReducer = function(reducer, initialArg, init) {
    return ReactSharedInternals.H.useReducer(reducer, initialArg, init);
  };
  react_production$1.useRef = function(initialValue) {
    return ReactSharedInternals.H.useRef(initialValue);
  };
  react_production$1.useState = function(initialState) {
    return ReactSharedInternals.H.useState(initialState);
  };
  react_production$1.useSyncExternalStore = function(subscribe, getSnapshot, getServerSnapshot) {
    return ReactSharedInternals.H.useSyncExternalStore(
      subscribe,
      getSnapshot,
      getServerSnapshot
    );
  };
  react_production$1.useTransition = function() {
    return ReactSharedInternals.H.useTransition();
  };
  react_production$1.version = "19.2.6";
  return react_production$1;
}
var hasRequiredReact$1;
function requireReact$1() {
  if (hasRequiredReact$1) return react$1.exports;
  hasRequiredReact$1 = 1;
  {
    react$1.exports = requireReact_production$1();
  }
  return react$1.exports;
}
var reactDom = { exports: {} };
var reactDom_production = {};
/**
 * @license React
 * react-dom.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var hasRequiredReactDom_production;
function requireReactDom_production() {
  if (hasRequiredReactDom_production) return reactDom_production;
  hasRequiredReactDom_production = 1;
  var React2 = requireReact$1();
  function formatProdErrorMessage(code) {
    var url = "https://react.dev/errors/" + code;
    if (1 < arguments.length) {
      url += "?args[]=" + encodeURIComponent(arguments[1]);
      for (var i = 2; i < arguments.length; i++)
        url += "&args[]=" + encodeURIComponent(arguments[i]);
    }
    return "Minified React error #" + code + "; visit " + url + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
  }
  function noop() {
  }
  var Internals = {
    d: {
      f: noop,
      r: function() {
        throw Error(formatProdErrorMessage(522));
      },
      D: noop,
      C: noop,
      L: noop,
      m: noop,
      X: noop,
      S: noop,
      M: noop
    },
    p: 0,
    findDOMNode: null
  }, REACT_PORTAL_TYPE = Symbol.for("react.portal");
  function createPortal$1(children, containerInfo, implementation) {
    var key = 3 < arguments.length && void 0 !== arguments[3] ? arguments[3] : null;
    return {
      $$typeof: REACT_PORTAL_TYPE,
      key: null == key ? null : "" + key,
      children,
      containerInfo,
      implementation
    };
  }
  var ReactSharedInternals = React2.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
  function getCrossOriginStringAs(as, input) {
    if ("font" === as) return "";
    if ("string" === typeof input)
      return "use-credentials" === input ? input : "";
  }
  reactDom_production.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = Internals;
  reactDom_production.createPortal = function(children, container) {
    var key = 2 < arguments.length && void 0 !== arguments[2] ? arguments[2] : null;
    if (!container || 1 !== container.nodeType && 9 !== container.nodeType && 11 !== container.nodeType)
      throw Error(formatProdErrorMessage(299));
    return createPortal$1(children, container, null, key);
  };
  reactDom_production.flushSync = function(fn) {
    var previousTransition = ReactSharedInternals.T, previousUpdatePriority = Internals.p;
    try {
      if (ReactSharedInternals.T = null, Internals.p = 2, fn) return fn();
    } finally {
      ReactSharedInternals.T = previousTransition, Internals.p = previousUpdatePriority, Internals.d.f();
    }
  };
  reactDom_production.preconnect = function(href, options) {
    "string" === typeof href && (options ? (options = options.crossOrigin, options = "string" === typeof options ? "use-credentials" === options ? options : "" : void 0) : options = null, Internals.d.C(href, options));
  };
  reactDom_production.prefetchDNS = function(href) {
    "string" === typeof href && Internals.d.D(href);
  };
  reactDom_production.preinit = function(href, options) {
    if ("string" === typeof href && options && "string" === typeof options.as) {
      var as = options.as, crossOrigin = getCrossOriginStringAs(as, options.crossOrigin), integrity = "string" === typeof options.integrity ? options.integrity : void 0, fetchPriority = "string" === typeof options.fetchPriority ? options.fetchPriority : void 0;
      "style" === as ? Internals.d.S(
        href,
        "string" === typeof options.precedence ? options.precedence : void 0,
        {
          crossOrigin,
          integrity,
          fetchPriority
        }
      ) : "script" === as && Internals.d.X(href, {
        crossOrigin,
        integrity,
        fetchPriority,
        nonce: "string" === typeof options.nonce ? options.nonce : void 0
      });
    }
  };
  reactDom_production.preinitModule = function(href, options) {
    if ("string" === typeof href)
      if ("object" === typeof options && null !== options) {
        if (null == options.as || "script" === options.as) {
          var crossOrigin = getCrossOriginStringAs(
            options.as,
            options.crossOrigin
          );
          Internals.d.M(href, {
            crossOrigin,
            integrity: "string" === typeof options.integrity ? options.integrity : void 0,
            nonce: "string" === typeof options.nonce ? options.nonce : void 0
          });
        }
      } else null == options && Internals.d.M(href);
  };
  reactDom_production.preload = function(href, options) {
    if ("string" === typeof href && "object" === typeof options && null !== options && "string" === typeof options.as) {
      var as = options.as, crossOrigin = getCrossOriginStringAs(as, options.crossOrigin);
      Internals.d.L(href, as, {
        crossOrigin,
        integrity: "string" === typeof options.integrity ? options.integrity : void 0,
        nonce: "string" === typeof options.nonce ? options.nonce : void 0,
        type: "string" === typeof options.type ? options.type : void 0,
        fetchPriority: "string" === typeof options.fetchPriority ? options.fetchPriority : void 0,
        referrerPolicy: "string" === typeof options.referrerPolicy ? options.referrerPolicy : void 0,
        imageSrcSet: "string" === typeof options.imageSrcSet ? options.imageSrcSet : void 0,
        imageSizes: "string" === typeof options.imageSizes ? options.imageSizes : void 0,
        media: "string" === typeof options.media ? options.media : void 0
      });
    }
  };
  reactDom_production.preloadModule = function(href, options) {
    if ("string" === typeof href)
      if (options) {
        var crossOrigin = getCrossOriginStringAs(options.as, options.crossOrigin);
        Internals.d.m(href, {
          as: "string" === typeof options.as && "script" !== options.as ? options.as : void 0,
          crossOrigin,
          integrity: "string" === typeof options.integrity ? options.integrity : void 0
        });
      } else Internals.d.m(href);
  };
  reactDom_production.requestFormReset = function(form) {
    Internals.d.r(form);
  };
  reactDom_production.unstable_batchedUpdates = function(fn, a) {
    return fn(a);
  };
  reactDom_production.useFormState = function(action, initialState, permalink) {
    return ReactSharedInternals.H.useFormState(action, initialState, permalink);
  };
  reactDom_production.useFormStatus = function() {
    return ReactSharedInternals.H.useHostTransitionStatus();
  };
  reactDom_production.version = "19.2.6";
  return reactDom_production;
}
var hasRequiredReactDom;
function requireReactDom() {
  if (hasRequiredReactDom) return reactDom.exports;
  hasRequiredReactDom = 1;
  function checkDCE() {
    if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ === "undefined" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE !== "function") {
      return;
    }
    try {
      __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(checkDCE);
    } catch (err) {
      console.error(err);
    }
  }
  {
    checkDCE();
    reactDom.exports = requireReactDom_production();
  }
  return reactDom.exports;
}
/**
 * @license React
 * react-dom-client.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var hasRequiredReactDomClient_production;
function requireReactDomClient_production() {
  if (hasRequiredReactDomClient_production) return reactDomClient_production;
  hasRequiredReactDomClient_production = 1;
  var Scheduler = requireScheduler(), React2 = requireReact$1(), ReactDOM = requireReactDom();
  function formatProdErrorMessage(code) {
    var url = "https://react.dev/errors/" + code;
    if (1 < arguments.length) {
      url += "?args[]=" + encodeURIComponent(arguments[1]);
      for (var i = 2; i < arguments.length; i++)
        url += "&args[]=" + encodeURIComponent(arguments[i]);
    }
    return "Minified React error #" + code + "; visit " + url + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
  }
  function isValidContainer(node) {
    return !(!node || 1 !== node.nodeType && 9 !== node.nodeType && 11 !== node.nodeType);
  }
  function getNearestMountedFiber(fiber) {
    var node = fiber, nearestMounted = fiber;
    if (fiber.alternate) for (; node.return; ) node = node.return;
    else {
      fiber = node;
      do
        node = fiber, 0 !== (node.flags & 4098) && (nearestMounted = node.return), fiber = node.return;
      while (fiber);
    }
    return 3 === node.tag ? nearestMounted : null;
  }
  function getSuspenseInstanceFromFiber(fiber) {
    if (13 === fiber.tag) {
      var suspenseState = fiber.memoizedState;
      null === suspenseState && (fiber = fiber.alternate, null !== fiber && (suspenseState = fiber.memoizedState));
      if (null !== suspenseState) return suspenseState.dehydrated;
    }
    return null;
  }
  function getActivityInstanceFromFiber(fiber) {
    if (31 === fiber.tag) {
      var activityState = fiber.memoizedState;
      null === activityState && (fiber = fiber.alternate, null !== fiber && (activityState = fiber.memoizedState));
      if (null !== activityState) return activityState.dehydrated;
    }
    return null;
  }
  function assertIsMounted(fiber) {
    if (getNearestMountedFiber(fiber) !== fiber)
      throw Error(formatProdErrorMessage(188));
  }
  function findCurrentFiberUsingSlowPath(fiber) {
    var alternate = fiber.alternate;
    if (!alternate) {
      alternate = getNearestMountedFiber(fiber);
      if (null === alternate) throw Error(formatProdErrorMessage(188));
      return alternate !== fiber ? null : fiber;
    }
    for (var a = fiber, b = alternate; ; ) {
      var parentA = a.return;
      if (null === parentA) break;
      var parentB = parentA.alternate;
      if (null === parentB) {
        b = parentA.return;
        if (null !== b) {
          a = b;
          continue;
        }
        break;
      }
      if (parentA.child === parentB.child) {
        for (parentB = parentA.child; parentB; ) {
          if (parentB === a) return assertIsMounted(parentA), fiber;
          if (parentB === b) return assertIsMounted(parentA), alternate;
          parentB = parentB.sibling;
        }
        throw Error(formatProdErrorMessage(188));
      }
      if (a.return !== b.return) a = parentA, b = parentB;
      else {
        for (var didFindChild = false, child$0 = parentA.child; child$0; ) {
          if (child$0 === a) {
            didFindChild = true;
            a = parentA;
            b = parentB;
            break;
          }
          if (child$0 === b) {
            didFindChild = true;
            b = parentA;
            a = parentB;
            break;
          }
          child$0 = child$0.sibling;
        }
        if (!didFindChild) {
          for (child$0 = parentB.child; child$0; ) {
            if (child$0 === a) {
              didFindChild = true;
              a = parentB;
              b = parentA;
              break;
            }
            if (child$0 === b) {
              didFindChild = true;
              b = parentB;
              a = parentA;
              break;
            }
            child$0 = child$0.sibling;
          }
          if (!didFindChild) throw Error(formatProdErrorMessage(189));
        }
      }
      if (a.alternate !== b) throw Error(formatProdErrorMessage(190));
    }
    if (3 !== a.tag) throw Error(formatProdErrorMessage(188));
    return a.stateNode.current === a ? fiber : alternate;
  }
  function findCurrentHostFiberImpl(node) {
    var tag = node.tag;
    if (5 === tag || 26 === tag || 27 === tag || 6 === tag) return node;
    for (node = node.child; null !== node; ) {
      tag = findCurrentHostFiberImpl(node);
      if (null !== tag) return tag;
      node = node.sibling;
    }
    return null;
  }
  var assign = Object.assign, REACT_LEGACY_ELEMENT_TYPE = Symbol.for("react.element"), REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element"), REACT_PORTAL_TYPE = Symbol.for("react.portal"), REACT_FRAGMENT_TYPE = Symbol.for("react.fragment"), REACT_STRICT_MODE_TYPE = Symbol.for("react.strict_mode"), REACT_PROFILER_TYPE = Symbol.for("react.profiler"), REACT_CONSUMER_TYPE = Symbol.for("react.consumer"), REACT_CONTEXT_TYPE = Symbol.for("react.context"), REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref"), REACT_SUSPENSE_TYPE = Symbol.for("react.suspense"), REACT_SUSPENSE_LIST_TYPE = Symbol.for("react.suspense_list"), REACT_MEMO_TYPE = Symbol.for("react.memo"), REACT_LAZY_TYPE = Symbol.for("react.lazy");
  var REACT_ACTIVITY_TYPE = Symbol.for("react.activity");
  var REACT_MEMO_CACHE_SENTINEL = Symbol.for("react.memo_cache_sentinel");
  var MAYBE_ITERATOR_SYMBOL = Symbol.iterator;
  function getIteratorFn(maybeIterable) {
    if (null === maybeIterable || "object" !== typeof maybeIterable) return null;
    maybeIterable = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable["@@iterator"];
    return "function" === typeof maybeIterable ? maybeIterable : null;
  }
  var REACT_CLIENT_REFERENCE = Symbol.for("react.client.reference");
  function getComponentNameFromType(type) {
    if (null == type) return null;
    if ("function" === typeof type)
      return type.$$typeof === REACT_CLIENT_REFERENCE ? null : type.displayName || type.name || null;
    if ("string" === typeof type) return type;
    switch (type) {
      case REACT_FRAGMENT_TYPE:
        return "Fragment";
      case REACT_PROFILER_TYPE:
        return "Profiler";
      case REACT_STRICT_MODE_TYPE:
        return "StrictMode";
      case REACT_SUSPENSE_TYPE:
        return "Suspense";
      case REACT_SUSPENSE_LIST_TYPE:
        return "SuspenseList";
      case REACT_ACTIVITY_TYPE:
        return "Activity";
    }
    if ("object" === typeof type)
      switch (type.$$typeof) {
        case REACT_PORTAL_TYPE:
          return "Portal";
        case REACT_CONTEXT_TYPE:
          return type.displayName || "Context";
        case REACT_CONSUMER_TYPE:
          return (type._context.displayName || "Context") + ".Consumer";
        case REACT_FORWARD_REF_TYPE:
          var innerType = type.render;
          type = type.displayName;
          type || (type = innerType.displayName || innerType.name || "", type = "" !== type ? "ForwardRef(" + type + ")" : "ForwardRef");
          return type;
        case REACT_MEMO_TYPE:
          return innerType = type.displayName || null, null !== innerType ? innerType : getComponentNameFromType(type.type) || "Memo";
        case REACT_LAZY_TYPE:
          innerType = type._payload;
          type = type._init;
          try {
            return getComponentNameFromType(type(innerType));
          } catch (x) {
          }
      }
    return null;
  }
  var isArrayImpl = Array.isArray, ReactSharedInternals = React2.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, ReactDOMSharedInternals = ReactDOM.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, sharedNotPendingObject = {
    pending: false,
    data: null,
    method: null,
    action: null
  }, valueStack = [], index = -1;
  function createCursor(defaultValue) {
    return { current: defaultValue };
  }
  function pop(cursor) {
    0 > index || (cursor.current = valueStack[index], valueStack[index] = null, index--);
  }
  function push(cursor, value) {
    index++;
    valueStack[index] = cursor.current;
    cursor.current = value;
  }
  var contextStackCursor = createCursor(null), contextFiberStackCursor = createCursor(null), rootInstanceStackCursor = createCursor(null), hostTransitionProviderCursor = createCursor(null);
  function pushHostContainer(fiber, nextRootInstance) {
    push(rootInstanceStackCursor, nextRootInstance);
    push(contextFiberStackCursor, fiber);
    push(contextStackCursor, null);
    switch (nextRootInstance.nodeType) {
      case 9:
      case 11:
        fiber = (fiber = nextRootInstance.documentElement) ? (fiber = fiber.namespaceURI) ? getOwnHostContext(fiber) : 0 : 0;
        break;
      default:
        if (fiber = nextRootInstance.tagName, nextRootInstance = nextRootInstance.namespaceURI)
          nextRootInstance = getOwnHostContext(nextRootInstance), fiber = getChildHostContextProd(nextRootInstance, fiber);
        else
          switch (fiber) {
            case "svg":
              fiber = 1;
              break;
            case "math":
              fiber = 2;
              break;
            default:
              fiber = 0;
          }
    }
    pop(contextStackCursor);
    push(contextStackCursor, fiber);
  }
  function popHostContainer() {
    pop(contextStackCursor);
    pop(contextFiberStackCursor);
    pop(rootInstanceStackCursor);
  }
  function pushHostContext(fiber) {
    null !== fiber.memoizedState && push(hostTransitionProviderCursor, fiber);
    var context = contextStackCursor.current;
    var JSCompiler_inline_result = getChildHostContextProd(context, fiber.type);
    context !== JSCompiler_inline_result && (push(contextFiberStackCursor, fiber), push(contextStackCursor, JSCompiler_inline_result));
  }
  function popHostContext(fiber) {
    contextFiberStackCursor.current === fiber && (pop(contextStackCursor), pop(contextFiberStackCursor));
    hostTransitionProviderCursor.current === fiber && (pop(hostTransitionProviderCursor), HostTransitionContext._currentValue = sharedNotPendingObject);
  }
  var prefix, suffix;
  function describeBuiltInComponentFrame(name) {
    if (void 0 === prefix)
      try {
        throw Error();
      } catch (x) {
        var match = x.stack.trim().match(/\n( *(at )?)/);
        prefix = match && match[1] || "";
        suffix = -1 < x.stack.indexOf("\n    at") ? " (<anonymous>)" : -1 < x.stack.indexOf("@") ? "@unknown:0:0" : "";
      }
    return "\n" + prefix + name + suffix;
  }
  var reentry = false;
  function describeNativeComponentFrame(fn, construct) {
    if (!fn || reentry) return "";
    reentry = true;
    var previousPrepareStackTrace = Error.prepareStackTrace;
    Error.prepareStackTrace = void 0;
    try {
      var RunInRootFrame = {
        DetermineComponentFrameRoot: function() {
          try {
            if (construct) {
              var Fake = function() {
                throw Error();
              };
              Object.defineProperty(Fake.prototype, "props", {
                set: function() {
                  throw Error();
                }
              });
              if ("object" === typeof Reflect && Reflect.construct) {
                try {
                  Reflect.construct(Fake, []);
                } catch (x) {
                  var control = x;
                }
                Reflect.construct(fn, [], Fake);
              } else {
                try {
                  Fake.call();
                } catch (x$1) {
                  control = x$1;
                }
                fn.call(Fake.prototype);
              }
            } else {
              try {
                throw Error();
              } catch (x$2) {
                control = x$2;
              }
              (Fake = fn()) && "function" === typeof Fake.catch && Fake.catch(function() {
              });
            }
          } catch (sample) {
            if (sample && control && "string" === typeof sample.stack)
              return [sample.stack, control.stack];
          }
          return [null, null];
        }
      };
      RunInRootFrame.DetermineComponentFrameRoot.displayName = "DetermineComponentFrameRoot";
      var namePropDescriptor = Object.getOwnPropertyDescriptor(
        RunInRootFrame.DetermineComponentFrameRoot,
        "name"
      );
      namePropDescriptor && namePropDescriptor.configurable && Object.defineProperty(
        RunInRootFrame.DetermineComponentFrameRoot,
        "name",
        { value: "DetermineComponentFrameRoot" }
      );
      var _RunInRootFrame$Deter = RunInRootFrame.DetermineComponentFrameRoot(), sampleStack = _RunInRootFrame$Deter[0], controlStack = _RunInRootFrame$Deter[1];
      if (sampleStack && controlStack) {
        var sampleLines = sampleStack.split("\n"), controlLines = controlStack.split("\n");
        for (namePropDescriptor = RunInRootFrame = 0; RunInRootFrame < sampleLines.length && !sampleLines[RunInRootFrame].includes("DetermineComponentFrameRoot"); )
          RunInRootFrame++;
        for (; namePropDescriptor < controlLines.length && !controlLines[namePropDescriptor].includes(
          "DetermineComponentFrameRoot"
        ); )
          namePropDescriptor++;
        if (RunInRootFrame === sampleLines.length || namePropDescriptor === controlLines.length)
          for (RunInRootFrame = sampleLines.length - 1, namePropDescriptor = controlLines.length - 1; 1 <= RunInRootFrame && 0 <= namePropDescriptor && sampleLines[RunInRootFrame] !== controlLines[namePropDescriptor]; )
            namePropDescriptor--;
        for (; 1 <= RunInRootFrame && 0 <= namePropDescriptor; RunInRootFrame--, namePropDescriptor--)
          if (sampleLines[RunInRootFrame] !== controlLines[namePropDescriptor]) {
            if (1 !== RunInRootFrame || 1 !== namePropDescriptor) {
              do
                if (RunInRootFrame--, namePropDescriptor--, 0 > namePropDescriptor || sampleLines[RunInRootFrame] !== controlLines[namePropDescriptor]) {
                  var frame = "\n" + sampleLines[RunInRootFrame].replace(" at new ", " at ");
                  fn.displayName && frame.includes("<anonymous>") && (frame = frame.replace("<anonymous>", fn.displayName));
                  return frame;
                }
              while (1 <= RunInRootFrame && 0 <= namePropDescriptor);
            }
            break;
          }
      }
    } finally {
      reentry = false, Error.prepareStackTrace = previousPrepareStackTrace;
    }
    return (previousPrepareStackTrace = fn ? fn.displayName || fn.name : "") ? describeBuiltInComponentFrame(previousPrepareStackTrace) : "";
  }
  function describeFiber(fiber, childFiber) {
    switch (fiber.tag) {
      case 26:
      case 27:
      case 5:
        return describeBuiltInComponentFrame(fiber.type);
      case 16:
        return describeBuiltInComponentFrame("Lazy");
      case 13:
        return fiber.child !== childFiber && null !== childFiber ? describeBuiltInComponentFrame("Suspense Fallback") : describeBuiltInComponentFrame("Suspense");
      case 19:
        return describeBuiltInComponentFrame("SuspenseList");
      case 0:
      case 15:
        return describeNativeComponentFrame(fiber.type, false);
      case 11:
        return describeNativeComponentFrame(fiber.type.render, false);
      case 1:
        return describeNativeComponentFrame(fiber.type, true);
      case 31:
        return describeBuiltInComponentFrame("Activity");
      default:
        return "";
    }
  }
  function getStackByFiberInDevAndProd(workInProgress2) {
    try {
      var info = "", previous = null;
      do
        info += describeFiber(workInProgress2, previous), previous = workInProgress2, workInProgress2 = workInProgress2.return;
      while (workInProgress2);
      return info;
    } catch (x) {
      return "\nError generating stack: " + x.message + "\n" + x.stack;
    }
  }
  var hasOwnProperty = Object.prototype.hasOwnProperty, scheduleCallback$3 = Scheduler.unstable_scheduleCallback, cancelCallback$1 = Scheduler.unstable_cancelCallback, shouldYield = Scheduler.unstable_shouldYield, requestPaint = Scheduler.unstable_requestPaint, now = Scheduler.unstable_now, getCurrentPriorityLevel = Scheduler.unstable_getCurrentPriorityLevel, ImmediatePriority = Scheduler.unstable_ImmediatePriority, UserBlockingPriority = Scheduler.unstable_UserBlockingPriority, NormalPriority$1 = Scheduler.unstable_NormalPriority, LowPriority = Scheduler.unstable_LowPriority, IdlePriority = Scheduler.unstable_IdlePriority, log$1 = Scheduler.log, unstable_setDisableYieldValue = Scheduler.unstable_setDisableYieldValue, rendererID = null, injectedHook = null;
  function setIsStrictModeForDevtools(newIsStrictMode) {
    "function" === typeof log$1 && unstable_setDisableYieldValue(newIsStrictMode);
    if (injectedHook && "function" === typeof injectedHook.setStrictMode)
      try {
        injectedHook.setStrictMode(rendererID, newIsStrictMode);
      } catch (err) {
      }
  }
  var clz32 = Math.clz32 ? Math.clz32 : clz32Fallback, log = Math.log, LN2 = Math.LN2;
  function clz32Fallback(x) {
    x >>>= 0;
    return 0 === x ? 32 : 31 - (log(x) / LN2 | 0) | 0;
  }
  var nextTransitionUpdateLane = 256, nextTransitionDeferredLane = 262144, nextRetryLane = 4194304;
  function getHighestPriorityLanes(lanes) {
    var pendingSyncLanes = lanes & 42;
    if (0 !== pendingSyncLanes) return pendingSyncLanes;
    switch (lanes & -lanes) {
      case 1:
        return 1;
      case 2:
        return 2;
      case 4:
        return 4;
      case 8:
        return 8;
      case 16:
        return 16;
      case 32:
        return 32;
      case 64:
        return 64;
      case 128:
        return 128;
      case 256:
      case 512:
      case 1024:
      case 2048:
      case 4096:
      case 8192:
      case 16384:
      case 32768:
      case 65536:
      case 131072:
        return lanes & 261888;
      case 262144:
      case 524288:
      case 1048576:
      case 2097152:
        return lanes & 3932160;
      case 4194304:
      case 8388608:
      case 16777216:
      case 33554432:
        return lanes & 62914560;
      case 67108864:
        return 67108864;
      case 134217728:
        return 134217728;
      case 268435456:
        return 268435456;
      case 536870912:
        return 536870912;
      case 1073741824:
        return 0;
      default:
        return lanes;
    }
  }
  function getNextLanes(root2, wipLanes, rootHasPendingCommit) {
    var pendingLanes = root2.pendingLanes;
    if (0 === pendingLanes) return 0;
    var nextLanes = 0, suspendedLanes = root2.suspendedLanes, pingedLanes = root2.pingedLanes;
    root2 = root2.warmLanes;
    var nonIdlePendingLanes = pendingLanes & 134217727;
    0 !== nonIdlePendingLanes ? (pendingLanes = nonIdlePendingLanes & ~suspendedLanes, 0 !== pendingLanes ? nextLanes = getHighestPriorityLanes(pendingLanes) : (pingedLanes &= nonIdlePendingLanes, 0 !== pingedLanes ? nextLanes = getHighestPriorityLanes(pingedLanes) : rootHasPendingCommit || (rootHasPendingCommit = nonIdlePendingLanes & ~root2, 0 !== rootHasPendingCommit && (nextLanes = getHighestPriorityLanes(rootHasPendingCommit))))) : (nonIdlePendingLanes = pendingLanes & ~suspendedLanes, 0 !== nonIdlePendingLanes ? nextLanes = getHighestPriorityLanes(nonIdlePendingLanes) : 0 !== pingedLanes ? nextLanes = getHighestPriorityLanes(pingedLanes) : rootHasPendingCommit || (rootHasPendingCommit = pendingLanes & ~root2, 0 !== rootHasPendingCommit && (nextLanes = getHighestPriorityLanes(rootHasPendingCommit))));
    return 0 === nextLanes ? 0 : 0 !== wipLanes && wipLanes !== nextLanes && 0 === (wipLanes & suspendedLanes) && (suspendedLanes = nextLanes & -nextLanes, rootHasPendingCommit = wipLanes & -wipLanes, suspendedLanes >= rootHasPendingCommit || 32 === suspendedLanes && 0 !== (rootHasPendingCommit & 4194048)) ? wipLanes : nextLanes;
  }
  function checkIfRootIsPrerendering(root2, renderLanes2) {
    return 0 === (root2.pendingLanes & ~(root2.suspendedLanes & ~root2.pingedLanes) & renderLanes2);
  }
  function computeExpirationTime(lane, currentTime) {
    switch (lane) {
      case 1:
      case 2:
      case 4:
      case 8:
      case 64:
        return currentTime + 250;
      case 16:
      case 32:
      case 128:
      case 256:
      case 512:
      case 1024:
      case 2048:
      case 4096:
      case 8192:
      case 16384:
      case 32768:
      case 65536:
      case 131072:
      case 262144:
      case 524288:
      case 1048576:
      case 2097152:
        return currentTime + 5e3;
      case 4194304:
      case 8388608:
      case 16777216:
      case 33554432:
        return -1;
      case 67108864:
      case 134217728:
      case 268435456:
      case 536870912:
      case 1073741824:
        return -1;
      default:
        return -1;
    }
  }
  function claimNextRetryLane() {
    var lane = nextRetryLane;
    nextRetryLane <<= 1;
    0 === (nextRetryLane & 62914560) && (nextRetryLane = 4194304);
    return lane;
  }
  function createLaneMap(initial) {
    for (var laneMap = [], i = 0; 31 > i; i++) laneMap.push(initial);
    return laneMap;
  }
  function markRootUpdated$1(root2, updateLane) {
    root2.pendingLanes |= updateLane;
    268435456 !== updateLane && (root2.suspendedLanes = 0, root2.pingedLanes = 0, root2.warmLanes = 0);
  }
  function markRootFinished(root2, finishedLanes, remainingLanes, spawnedLane, updatedLanes, suspendedRetryLanes) {
    var previouslyPendingLanes = root2.pendingLanes;
    root2.pendingLanes = remainingLanes;
    root2.suspendedLanes = 0;
    root2.pingedLanes = 0;
    root2.warmLanes = 0;
    root2.expiredLanes &= remainingLanes;
    root2.entangledLanes &= remainingLanes;
    root2.errorRecoveryDisabledLanes &= remainingLanes;
    root2.shellSuspendCounter = 0;
    var entanglements = root2.entanglements, expirationTimes = root2.expirationTimes, hiddenUpdates = root2.hiddenUpdates;
    for (remainingLanes = previouslyPendingLanes & ~remainingLanes; 0 < remainingLanes; ) {
      var index$7 = 31 - clz32(remainingLanes), lane = 1 << index$7;
      entanglements[index$7] = 0;
      expirationTimes[index$7] = -1;
      var hiddenUpdatesForLane = hiddenUpdates[index$7];
      if (null !== hiddenUpdatesForLane)
        for (hiddenUpdates[index$7] = null, index$7 = 0; index$7 < hiddenUpdatesForLane.length; index$7++) {
          var update = hiddenUpdatesForLane[index$7];
          null !== update && (update.lane &= -536870913);
        }
      remainingLanes &= ~lane;
    }
    0 !== spawnedLane && markSpawnedDeferredLane(root2, spawnedLane, 0);
    0 !== suspendedRetryLanes && 0 === updatedLanes && 0 !== root2.tag && (root2.suspendedLanes |= suspendedRetryLanes & ~(previouslyPendingLanes & ~finishedLanes));
  }
  function markSpawnedDeferredLane(root2, spawnedLane, entangledLanes) {
    root2.pendingLanes |= spawnedLane;
    root2.suspendedLanes &= ~spawnedLane;
    var spawnedLaneIndex = 31 - clz32(spawnedLane);
    root2.entangledLanes |= spawnedLane;
    root2.entanglements[spawnedLaneIndex] = root2.entanglements[spawnedLaneIndex] | 1073741824 | entangledLanes & 261930;
  }
  function markRootEntangled(root2, entangledLanes) {
    var rootEntangledLanes = root2.entangledLanes |= entangledLanes;
    for (root2 = root2.entanglements; rootEntangledLanes; ) {
      var index$8 = 31 - clz32(rootEntangledLanes), lane = 1 << index$8;
      lane & entangledLanes | root2[index$8] & entangledLanes && (root2[index$8] |= entangledLanes);
      rootEntangledLanes &= ~lane;
    }
  }
  function getBumpedLaneForHydration(root2, renderLanes2) {
    var renderLane = renderLanes2 & -renderLanes2;
    renderLane = 0 !== (renderLane & 42) ? 1 : getBumpedLaneForHydrationByLane(renderLane);
    return 0 !== (renderLane & (root2.suspendedLanes | renderLanes2)) ? 0 : renderLane;
  }
  function getBumpedLaneForHydrationByLane(lane) {
    switch (lane) {
      case 2:
        lane = 1;
        break;
      case 8:
        lane = 4;
        break;
      case 32:
        lane = 16;
        break;
      case 256:
      case 512:
      case 1024:
      case 2048:
      case 4096:
      case 8192:
      case 16384:
      case 32768:
      case 65536:
      case 131072:
      case 262144:
      case 524288:
      case 1048576:
      case 2097152:
      case 4194304:
      case 8388608:
      case 16777216:
      case 33554432:
        lane = 128;
        break;
      case 268435456:
        lane = 134217728;
        break;
      default:
        lane = 0;
    }
    return lane;
  }
  function lanesToEventPriority(lanes) {
    lanes &= -lanes;
    return 2 < lanes ? 8 < lanes ? 0 !== (lanes & 134217727) ? 32 : 268435456 : 8 : 2;
  }
  function resolveUpdatePriority() {
    var updatePriority = ReactDOMSharedInternals.p;
    if (0 !== updatePriority) return updatePriority;
    updatePriority = window.event;
    return void 0 === updatePriority ? 32 : getEventPriority(updatePriority.type);
  }
  function runWithPriority(priority, fn) {
    var previousPriority = ReactDOMSharedInternals.p;
    try {
      return ReactDOMSharedInternals.p = priority, fn();
    } finally {
      ReactDOMSharedInternals.p = previousPriority;
    }
  }
  var randomKey = Math.random().toString(36).slice(2), internalInstanceKey = "__reactFiber$" + randomKey, internalPropsKey = "__reactProps$" + randomKey, internalContainerInstanceKey = "__reactContainer$" + randomKey, internalEventHandlersKey = "__reactEvents$" + randomKey, internalEventHandlerListenersKey = "__reactListeners$" + randomKey, internalEventHandlesSetKey = "__reactHandles$" + randomKey, internalRootNodeResourcesKey = "__reactResources$" + randomKey, internalHoistableMarker = "__reactMarker$" + randomKey;
  function detachDeletedInstance(node) {
    delete node[internalInstanceKey];
    delete node[internalPropsKey];
    delete node[internalEventHandlersKey];
    delete node[internalEventHandlerListenersKey];
    delete node[internalEventHandlesSetKey];
  }
  function getClosestInstanceFromNode(targetNode) {
    var targetInst = targetNode[internalInstanceKey];
    if (targetInst) return targetInst;
    for (var parentNode = targetNode.parentNode; parentNode; ) {
      if (targetInst = parentNode[internalContainerInstanceKey] || parentNode[internalInstanceKey]) {
        parentNode = targetInst.alternate;
        if (null !== targetInst.child || null !== parentNode && null !== parentNode.child)
          for (targetNode = getParentHydrationBoundary(targetNode); null !== targetNode; ) {
            if (parentNode = targetNode[internalInstanceKey]) return parentNode;
            targetNode = getParentHydrationBoundary(targetNode);
          }
        return targetInst;
      }
      targetNode = parentNode;
      parentNode = targetNode.parentNode;
    }
    return null;
  }
  function getInstanceFromNode(node) {
    if (node = node[internalInstanceKey] || node[internalContainerInstanceKey]) {
      var tag = node.tag;
      if (5 === tag || 6 === tag || 13 === tag || 31 === tag || 26 === tag || 27 === tag || 3 === tag)
        return node;
    }
    return null;
  }
  function getNodeFromInstance(inst) {
    var tag = inst.tag;
    if (5 === tag || 26 === tag || 27 === tag || 6 === tag) return inst.stateNode;
    throw Error(formatProdErrorMessage(33));
  }
  function getResourcesFromRoot(root2) {
    var resources = root2[internalRootNodeResourcesKey];
    resources || (resources = root2[internalRootNodeResourcesKey] = { hoistableStyles: /* @__PURE__ */ new Map(), hoistableScripts: /* @__PURE__ */ new Map() });
    return resources;
  }
  function markNodeAsHoistable(node) {
    node[internalHoistableMarker] = true;
  }
  var allNativeEvents = /* @__PURE__ */ new Set(), registrationNameDependencies = {};
  function registerTwoPhaseEvent(registrationName, dependencies) {
    registerDirectEvent(registrationName, dependencies);
    registerDirectEvent(registrationName + "Capture", dependencies);
  }
  function registerDirectEvent(registrationName, dependencies) {
    registrationNameDependencies[registrationName] = dependencies;
    for (registrationName = 0; registrationName < dependencies.length; registrationName++)
      allNativeEvents.add(dependencies[registrationName]);
  }
  var VALID_ATTRIBUTE_NAME_REGEX = RegExp(
    "^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$"
  ), illegalAttributeNameCache = {}, validatedAttributeNameCache = {};
  function isAttributeNameSafe(attributeName) {
    if (hasOwnProperty.call(validatedAttributeNameCache, attributeName))
      return true;
    if (hasOwnProperty.call(illegalAttributeNameCache, attributeName)) return false;
    if (VALID_ATTRIBUTE_NAME_REGEX.test(attributeName))
      return validatedAttributeNameCache[attributeName] = true;
    illegalAttributeNameCache[attributeName] = true;
    return false;
  }
  function setValueForAttribute(node, name, value) {
    if (isAttributeNameSafe(name))
      if (null === value) node.removeAttribute(name);
      else {
        switch (typeof value) {
          case "undefined":
          case "function":
          case "symbol":
            node.removeAttribute(name);
            return;
          case "boolean":
            var prefix$10 = name.toLowerCase().slice(0, 5);
            if ("data-" !== prefix$10 && "aria-" !== prefix$10) {
              node.removeAttribute(name);
              return;
            }
        }
        node.setAttribute(name, "" + value);
      }
  }
  function setValueForKnownAttribute(node, name, value) {
    if (null === value) node.removeAttribute(name);
    else {
      switch (typeof value) {
        case "undefined":
        case "function":
        case "symbol":
        case "boolean":
          node.removeAttribute(name);
          return;
      }
      node.setAttribute(name, "" + value);
    }
  }
  function setValueForNamespacedAttribute(node, namespace, name, value) {
    if (null === value) node.removeAttribute(name);
    else {
      switch (typeof value) {
        case "undefined":
        case "function":
        case "symbol":
        case "boolean":
          node.removeAttribute(name);
          return;
      }
      node.setAttributeNS(namespace, name, "" + value);
    }
  }
  function getToStringValue(value) {
    switch (typeof value) {
      case "bigint":
      case "boolean":
      case "number":
      case "string":
      case "undefined":
        return value;
      case "object":
        return value;
      default:
        return "";
    }
  }
  function isCheckable(elem) {
    var type = elem.type;
    return (elem = elem.nodeName) && "input" === elem.toLowerCase() && ("checkbox" === type || "radio" === type);
  }
  function trackValueOnNode(node, valueField, currentValue) {
    var descriptor = Object.getOwnPropertyDescriptor(
      node.constructor.prototype,
      valueField
    );
    if (!node.hasOwnProperty(valueField) && "undefined" !== typeof descriptor && "function" === typeof descriptor.get && "function" === typeof descriptor.set) {
      var get = descriptor.get, set = descriptor.set;
      Object.defineProperty(node, valueField, {
        configurable: true,
        get: function() {
          return get.call(this);
        },
        set: function(value) {
          currentValue = "" + value;
          set.call(this, value);
        }
      });
      Object.defineProperty(node, valueField, {
        enumerable: descriptor.enumerable
      });
      return {
        getValue: function() {
          return currentValue;
        },
        setValue: function(value) {
          currentValue = "" + value;
        },
        stopTracking: function() {
          node._valueTracker = null;
          delete node[valueField];
        }
      };
    }
  }
  function track(node) {
    if (!node._valueTracker) {
      var valueField = isCheckable(node) ? "checked" : "value";
      node._valueTracker = trackValueOnNode(
        node,
        valueField,
        "" + node[valueField]
      );
    }
  }
  function updateValueIfChanged(node) {
    if (!node) return false;
    var tracker = node._valueTracker;
    if (!tracker) return true;
    var lastValue = tracker.getValue();
    var value = "";
    node && (value = isCheckable(node) ? node.checked ? "true" : "false" : node.value);
    node = value;
    return node !== lastValue ? (tracker.setValue(node), true) : false;
  }
  function getActiveElement(doc) {
    doc = doc || ("undefined" !== typeof document ? document : void 0);
    if ("undefined" === typeof doc) return null;
    try {
      return doc.activeElement || doc.body;
    } catch (e) {
      return doc.body;
    }
  }
  var escapeSelectorAttributeValueInsideDoubleQuotesRegex = /[\n"\\]/g;
  function escapeSelectorAttributeValueInsideDoubleQuotes(value) {
    return value.replace(
      escapeSelectorAttributeValueInsideDoubleQuotesRegex,
      function(ch) {
        return "\\" + ch.charCodeAt(0).toString(16) + " ";
      }
    );
  }
  function updateInput(element, value, defaultValue, lastDefaultValue, checked, defaultChecked, type, name) {
    element.name = "";
    null != type && "function" !== typeof type && "symbol" !== typeof type && "boolean" !== typeof type ? element.type = type : element.removeAttribute("type");
    if (null != value)
      if ("number" === type) {
        if (0 === value && "" === element.value || element.value != value)
          element.value = "" + getToStringValue(value);
      } else
        element.value !== "" + getToStringValue(value) && (element.value = "" + getToStringValue(value));
    else
      "submit" !== type && "reset" !== type || element.removeAttribute("value");
    null != value ? setDefaultValue(element, type, getToStringValue(value)) : null != defaultValue ? setDefaultValue(element, type, getToStringValue(defaultValue)) : null != lastDefaultValue && element.removeAttribute("value");
    null == checked && null != defaultChecked && (element.defaultChecked = !!defaultChecked);
    null != checked && (element.checked = checked && "function" !== typeof checked && "symbol" !== typeof checked);
    null != name && "function" !== typeof name && "symbol" !== typeof name && "boolean" !== typeof name ? element.name = "" + getToStringValue(name) : element.removeAttribute("name");
  }
  function initInput(element, value, defaultValue, checked, defaultChecked, type, name, isHydrating2) {
    null != type && "function" !== typeof type && "symbol" !== typeof type && "boolean" !== typeof type && (element.type = type);
    if (null != value || null != defaultValue) {
      if (!("submit" !== type && "reset" !== type || void 0 !== value && null !== value)) {
        track(element);
        return;
      }
      defaultValue = null != defaultValue ? "" + getToStringValue(defaultValue) : "";
      value = null != value ? "" + getToStringValue(value) : defaultValue;
      isHydrating2 || value === element.value || (element.value = value);
      element.defaultValue = value;
    }
    checked = null != checked ? checked : defaultChecked;
    checked = "function" !== typeof checked && "symbol" !== typeof checked && !!checked;
    element.checked = isHydrating2 ? element.checked : !!checked;
    element.defaultChecked = !!checked;
    null != name && "function" !== typeof name && "symbol" !== typeof name && "boolean" !== typeof name && (element.name = name);
    track(element);
  }
  function setDefaultValue(node, type, value) {
    "number" === type && getActiveElement(node.ownerDocument) === node || node.defaultValue === "" + value || (node.defaultValue = "" + value);
  }
  function updateOptions(node, multiple, propValue, setDefaultSelected) {
    node = node.options;
    if (multiple) {
      multiple = {};
      for (var i = 0; i < propValue.length; i++)
        multiple["$" + propValue[i]] = true;
      for (propValue = 0; propValue < node.length; propValue++)
        i = multiple.hasOwnProperty("$" + node[propValue].value), node[propValue].selected !== i && (node[propValue].selected = i), i && setDefaultSelected && (node[propValue].defaultSelected = true);
    } else {
      propValue = "" + getToStringValue(propValue);
      multiple = null;
      for (i = 0; i < node.length; i++) {
        if (node[i].value === propValue) {
          node[i].selected = true;
          setDefaultSelected && (node[i].defaultSelected = true);
          return;
        }
        null !== multiple || node[i].disabled || (multiple = node[i]);
      }
      null !== multiple && (multiple.selected = true);
    }
  }
  function updateTextarea(element, value, defaultValue) {
    if (null != value && (value = "" + getToStringValue(value), value !== element.value && (element.value = value), null == defaultValue)) {
      element.defaultValue !== value && (element.defaultValue = value);
      return;
    }
    element.defaultValue = null != defaultValue ? "" + getToStringValue(defaultValue) : "";
  }
  function initTextarea(element, value, defaultValue, children) {
    if (null == value) {
      if (null != children) {
        if (null != defaultValue) throw Error(formatProdErrorMessage(92));
        if (isArrayImpl(children)) {
          if (1 < children.length) throw Error(formatProdErrorMessage(93));
          children = children[0];
        }
        defaultValue = children;
      }
      null == defaultValue && (defaultValue = "");
      value = defaultValue;
    }
    defaultValue = getToStringValue(value);
    element.defaultValue = defaultValue;
    children = element.textContent;
    children === defaultValue && "" !== children && null !== children && (element.value = children);
    track(element);
  }
  function setTextContent(node, text) {
    if (text) {
      var firstChild = node.firstChild;
      if (firstChild && firstChild === node.lastChild && 3 === firstChild.nodeType) {
        firstChild.nodeValue = text;
        return;
      }
    }
    node.textContent = text;
  }
  var unitlessNumbers = new Set(
    "animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(
      " "
    )
  );
  function setValueForStyle(style2, styleName, value) {
    var isCustomProperty = 0 === styleName.indexOf("--");
    null == value || "boolean" === typeof value || "" === value ? isCustomProperty ? style2.setProperty(styleName, "") : "float" === styleName ? style2.cssFloat = "" : style2[styleName] = "" : isCustomProperty ? style2.setProperty(styleName, value) : "number" !== typeof value || 0 === value || unitlessNumbers.has(styleName) ? "float" === styleName ? style2.cssFloat = value : style2[styleName] = ("" + value).trim() : style2[styleName] = value + "px";
  }
  function setValueForStyles(node, styles, prevStyles) {
    if (null != styles && "object" !== typeof styles)
      throw Error(formatProdErrorMessage(62));
    node = node.style;
    if (null != prevStyles) {
      for (var styleName in prevStyles)
        !prevStyles.hasOwnProperty(styleName) || null != styles && styles.hasOwnProperty(styleName) || (0 === styleName.indexOf("--") ? node.setProperty(styleName, "") : "float" === styleName ? node.cssFloat = "" : node[styleName] = "");
      for (var styleName$16 in styles)
        styleName = styles[styleName$16], styles.hasOwnProperty(styleName$16) && prevStyles[styleName$16] !== styleName && setValueForStyle(node, styleName$16, styleName);
    } else
      for (var styleName$17 in styles)
        styles.hasOwnProperty(styleName$17) && setValueForStyle(node, styleName$17, styles[styleName$17]);
  }
  function isCustomElement(tagName) {
    if (-1 === tagName.indexOf("-")) return false;
    switch (tagName) {
      case "annotation-xml":
      case "color-profile":
      case "font-face":
      case "font-face-src":
      case "font-face-uri":
      case "font-face-format":
      case "font-face-name":
      case "missing-glyph":
        return false;
      default:
        return true;
    }
  }
  var aliases = /* @__PURE__ */ new Map([
    ["acceptCharset", "accept-charset"],
    ["htmlFor", "for"],
    ["httpEquiv", "http-equiv"],
    ["crossOrigin", "crossorigin"],
    ["accentHeight", "accent-height"],
    ["alignmentBaseline", "alignment-baseline"],
    ["arabicForm", "arabic-form"],
    ["baselineShift", "baseline-shift"],
    ["capHeight", "cap-height"],
    ["clipPath", "clip-path"],
    ["clipRule", "clip-rule"],
    ["colorInterpolation", "color-interpolation"],
    ["colorInterpolationFilters", "color-interpolation-filters"],
    ["colorProfile", "color-profile"],
    ["colorRendering", "color-rendering"],
    ["dominantBaseline", "dominant-baseline"],
    ["enableBackground", "enable-background"],
    ["fillOpacity", "fill-opacity"],
    ["fillRule", "fill-rule"],
    ["floodColor", "flood-color"],
    ["floodOpacity", "flood-opacity"],
    ["fontFamily", "font-family"],
    ["fontSize", "font-size"],
    ["fontSizeAdjust", "font-size-adjust"],
    ["fontStretch", "font-stretch"],
    ["fontStyle", "font-style"],
    ["fontVariant", "font-variant"],
    ["fontWeight", "font-weight"],
    ["glyphName", "glyph-name"],
    ["glyphOrientationHorizontal", "glyph-orientation-horizontal"],
    ["glyphOrientationVertical", "glyph-orientation-vertical"],
    ["horizAdvX", "horiz-adv-x"],
    ["horizOriginX", "horiz-origin-x"],
    ["imageRendering", "image-rendering"],
    ["letterSpacing", "letter-spacing"],
    ["lightingColor", "lighting-color"],
    ["markerEnd", "marker-end"],
    ["markerMid", "marker-mid"],
    ["markerStart", "marker-start"],
    ["overlinePosition", "overline-position"],
    ["overlineThickness", "overline-thickness"],
    ["paintOrder", "paint-order"],
    ["panose-1", "panose-1"],
    ["pointerEvents", "pointer-events"],
    ["renderingIntent", "rendering-intent"],
    ["shapeRendering", "shape-rendering"],
    ["stopColor", "stop-color"],
    ["stopOpacity", "stop-opacity"],
    ["strikethroughPosition", "strikethrough-position"],
    ["strikethroughThickness", "strikethrough-thickness"],
    ["strokeDasharray", "stroke-dasharray"],
    ["strokeDashoffset", "stroke-dashoffset"],
    ["strokeLinecap", "stroke-linecap"],
    ["strokeLinejoin", "stroke-linejoin"],
    ["strokeMiterlimit", "stroke-miterlimit"],
    ["strokeOpacity", "stroke-opacity"],
    ["strokeWidth", "stroke-width"],
    ["textAnchor", "text-anchor"],
    ["textDecoration", "text-decoration"],
    ["textRendering", "text-rendering"],
    ["transformOrigin", "transform-origin"],
    ["underlinePosition", "underline-position"],
    ["underlineThickness", "underline-thickness"],
    ["unicodeBidi", "unicode-bidi"],
    ["unicodeRange", "unicode-range"],
    ["unitsPerEm", "units-per-em"],
    ["vAlphabetic", "v-alphabetic"],
    ["vHanging", "v-hanging"],
    ["vIdeographic", "v-ideographic"],
    ["vMathematical", "v-mathematical"],
    ["vectorEffect", "vector-effect"],
    ["vertAdvY", "vert-adv-y"],
    ["vertOriginX", "vert-origin-x"],
    ["vertOriginY", "vert-origin-y"],
    ["wordSpacing", "word-spacing"],
    ["writingMode", "writing-mode"],
    ["xmlnsXlink", "xmlns:xlink"],
    ["xHeight", "x-height"]
  ]), isJavaScriptProtocol = /^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;
  function sanitizeURL(url) {
    return isJavaScriptProtocol.test("" + url) ? "javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')" : url;
  }
  function noop$1() {
  }
  var currentReplayingEvent = null;
  function getEventTarget(nativeEvent) {
    nativeEvent = nativeEvent.target || nativeEvent.srcElement || window;
    nativeEvent.correspondingUseElement && (nativeEvent = nativeEvent.correspondingUseElement);
    return 3 === nativeEvent.nodeType ? nativeEvent.parentNode : nativeEvent;
  }
  var restoreTarget = null, restoreQueue = null;
  function restoreStateOfTarget(target) {
    var internalInstance = getInstanceFromNode(target);
    if (internalInstance && (target = internalInstance.stateNode)) {
      var props = target[internalPropsKey] || null;
      a: switch (target = internalInstance.stateNode, internalInstance.type) {
        case "input":
          updateInput(
            target,
            props.value,
            props.defaultValue,
            props.defaultValue,
            props.checked,
            props.defaultChecked,
            props.type,
            props.name
          );
          internalInstance = props.name;
          if ("radio" === props.type && null != internalInstance) {
            for (props = target; props.parentNode; ) props = props.parentNode;
            props = props.querySelectorAll(
              'input[name="' + escapeSelectorAttributeValueInsideDoubleQuotes(
                "" + internalInstance
              ) + '"][type="radio"]'
            );
            for (internalInstance = 0; internalInstance < props.length; internalInstance++) {
              var otherNode = props[internalInstance];
              if (otherNode !== target && otherNode.form === target.form) {
                var otherProps = otherNode[internalPropsKey] || null;
                if (!otherProps) throw Error(formatProdErrorMessage(90));
                updateInput(
                  otherNode,
                  otherProps.value,
                  otherProps.defaultValue,
                  otherProps.defaultValue,
                  otherProps.checked,
                  otherProps.defaultChecked,
                  otherProps.type,
                  otherProps.name
                );
              }
            }
            for (internalInstance = 0; internalInstance < props.length; internalInstance++)
              otherNode = props[internalInstance], otherNode.form === target.form && updateValueIfChanged(otherNode);
          }
          break a;
        case "textarea":
          updateTextarea(target, props.value, props.defaultValue);
          break a;
        case "select":
          internalInstance = props.value, null != internalInstance && updateOptions(target, !!props.multiple, internalInstance, false);
      }
    }
  }
  var isInsideEventHandler = false;
  function batchedUpdates$1(fn, a, b) {
    if (isInsideEventHandler) return fn(a, b);
    isInsideEventHandler = true;
    try {
      var JSCompiler_inline_result = fn(a);
      return JSCompiler_inline_result;
    } finally {
      if (isInsideEventHandler = false, null !== restoreTarget || null !== restoreQueue) {
        if (flushSyncWork$1(), restoreTarget && (a = restoreTarget, fn = restoreQueue, restoreQueue = restoreTarget = null, restoreStateOfTarget(a), fn))
          for (a = 0; a < fn.length; a++) restoreStateOfTarget(fn[a]);
      }
    }
  }
  function getListener(inst, registrationName) {
    var stateNode = inst.stateNode;
    if (null === stateNode) return null;
    var props = stateNode[internalPropsKey] || null;
    if (null === props) return null;
    stateNode = props[registrationName];
    a: switch (registrationName) {
      case "onClick":
      case "onClickCapture":
      case "onDoubleClick":
      case "onDoubleClickCapture":
      case "onMouseDown":
      case "onMouseDownCapture":
      case "onMouseMove":
      case "onMouseMoveCapture":
      case "onMouseUp":
      case "onMouseUpCapture":
      case "onMouseEnter":
        (props = !props.disabled) || (inst = inst.type, props = !("button" === inst || "input" === inst || "select" === inst || "textarea" === inst));
        inst = !props;
        break a;
      default:
        inst = false;
    }
    if (inst) return null;
    if (stateNode && "function" !== typeof stateNode)
      throw Error(
        formatProdErrorMessage(231, registrationName, typeof stateNode)
      );
    return stateNode;
  }
  var canUseDOM = !("undefined" === typeof window || "undefined" === typeof window.document || "undefined" === typeof window.document.createElement), passiveBrowserEventsSupported = false;
  if (canUseDOM)
    try {
      var options = {};
      Object.defineProperty(options, "passive", {
        get: function() {
          passiveBrowserEventsSupported = true;
        }
      });
      window.addEventListener("test", options, options);
      window.removeEventListener("test", options, options);
    } catch (e) {
      passiveBrowserEventsSupported = false;
    }
  var root = null, startText = null, fallbackText = null;
  function getData() {
    if (fallbackText) return fallbackText;
    var start, startValue = startText, startLength = startValue.length, end, endValue = "value" in root ? root.value : root.textContent, endLength = endValue.length;
    for (start = 0; start < startLength && startValue[start] === endValue[start]; start++) ;
    var minEnd = startLength - start;
    for (end = 1; end <= minEnd && startValue[startLength - end] === endValue[endLength - end]; end++) ;
    return fallbackText = endValue.slice(start, 1 < end ? 1 - end : void 0);
  }
  function getEventCharCode(nativeEvent) {
    var keyCode = nativeEvent.keyCode;
    "charCode" in nativeEvent ? (nativeEvent = nativeEvent.charCode, 0 === nativeEvent && 13 === keyCode && (nativeEvent = 13)) : nativeEvent = keyCode;
    10 === nativeEvent && (nativeEvent = 13);
    return 32 <= nativeEvent || 13 === nativeEvent ? nativeEvent : 0;
  }
  function functionThatReturnsTrue() {
    return true;
  }
  function functionThatReturnsFalse() {
    return false;
  }
  function createSyntheticEvent(Interface) {
    function SyntheticBaseEvent(reactName, reactEventType, targetInst, nativeEvent, nativeEventTarget) {
      this._reactName = reactName;
      this._targetInst = targetInst;
      this.type = reactEventType;
      this.nativeEvent = nativeEvent;
      this.target = nativeEventTarget;
      this.currentTarget = null;
      for (var propName in Interface)
        Interface.hasOwnProperty(propName) && (reactName = Interface[propName], this[propName] = reactName ? reactName(nativeEvent) : nativeEvent[propName]);
      this.isDefaultPrevented = (null != nativeEvent.defaultPrevented ? nativeEvent.defaultPrevented : false === nativeEvent.returnValue) ? functionThatReturnsTrue : functionThatReturnsFalse;
      this.isPropagationStopped = functionThatReturnsFalse;
      return this;
    }
    assign(SyntheticBaseEvent.prototype, {
      preventDefault: function() {
        this.defaultPrevented = true;
        var event = this.nativeEvent;
        event && (event.preventDefault ? event.preventDefault() : "unknown" !== typeof event.returnValue && (event.returnValue = false), this.isDefaultPrevented = functionThatReturnsTrue);
      },
      stopPropagation: function() {
        var event = this.nativeEvent;
        event && (event.stopPropagation ? event.stopPropagation() : "unknown" !== typeof event.cancelBubble && (event.cancelBubble = true), this.isPropagationStopped = functionThatReturnsTrue);
      },
      persist: function() {
      },
      isPersistent: functionThatReturnsTrue
    });
    return SyntheticBaseEvent;
  }
  var EventInterface = {
    eventPhase: 0,
    bubbles: 0,
    cancelable: 0,
    timeStamp: function(event) {
      return event.timeStamp || Date.now();
    },
    defaultPrevented: 0,
    isTrusted: 0
  }, SyntheticEvent = createSyntheticEvent(EventInterface), UIEventInterface = assign({}, EventInterface, { view: 0, detail: 0 }), SyntheticUIEvent = createSyntheticEvent(UIEventInterface), lastMovementX, lastMovementY, lastMouseEvent, MouseEventInterface = assign({}, UIEventInterface, {
    screenX: 0,
    screenY: 0,
    clientX: 0,
    clientY: 0,
    pageX: 0,
    pageY: 0,
    ctrlKey: 0,
    shiftKey: 0,
    altKey: 0,
    metaKey: 0,
    getModifierState: getEventModifierState,
    button: 0,
    buttons: 0,
    relatedTarget: function(event) {
      return void 0 === event.relatedTarget ? event.fromElement === event.srcElement ? event.toElement : event.fromElement : event.relatedTarget;
    },
    movementX: function(event) {
      if ("movementX" in event) return event.movementX;
      event !== lastMouseEvent && (lastMouseEvent && "mousemove" === event.type ? (lastMovementX = event.screenX - lastMouseEvent.screenX, lastMovementY = event.screenY - lastMouseEvent.screenY) : lastMovementY = lastMovementX = 0, lastMouseEvent = event);
      return lastMovementX;
    },
    movementY: function(event) {
      return "movementY" in event ? event.movementY : lastMovementY;
    }
  }), SyntheticMouseEvent = createSyntheticEvent(MouseEventInterface), DragEventInterface = assign({}, MouseEventInterface, { dataTransfer: 0 }), SyntheticDragEvent = createSyntheticEvent(DragEventInterface), FocusEventInterface = assign({}, UIEventInterface, { relatedTarget: 0 }), SyntheticFocusEvent = createSyntheticEvent(FocusEventInterface), AnimationEventInterface = assign({}, EventInterface, {
    animationName: 0,
    elapsedTime: 0,
    pseudoElement: 0
  }), SyntheticAnimationEvent = createSyntheticEvent(AnimationEventInterface), ClipboardEventInterface = assign({}, EventInterface, {
    clipboardData: function(event) {
      return "clipboardData" in event ? event.clipboardData : window.clipboardData;
    }
  }), SyntheticClipboardEvent = createSyntheticEvent(ClipboardEventInterface), CompositionEventInterface = assign({}, EventInterface, { data: 0 }), SyntheticCompositionEvent = createSyntheticEvent(CompositionEventInterface), normalizeKey = {
    Esc: "Escape",
    Spacebar: " ",
    Left: "ArrowLeft",
    Up: "ArrowUp",
    Right: "ArrowRight",
    Down: "ArrowDown",
    Del: "Delete",
    Win: "OS",
    Menu: "ContextMenu",
    Apps: "ContextMenu",
    Scroll: "ScrollLock",
    MozPrintableKey: "Unidentified"
  }, translateToKey = {
    8: "Backspace",
    9: "Tab",
    12: "Clear",
    13: "Enter",
    16: "Shift",
    17: "Control",
    18: "Alt",
    19: "Pause",
    20: "CapsLock",
    27: "Escape",
    32: " ",
    33: "PageUp",
    34: "PageDown",
    35: "End",
    36: "Home",
    37: "ArrowLeft",
    38: "ArrowUp",
    39: "ArrowRight",
    40: "ArrowDown",
    45: "Insert",
    46: "Delete",
    112: "F1",
    113: "F2",
    114: "F3",
    115: "F4",
    116: "F5",
    117: "F6",
    118: "F7",
    119: "F8",
    120: "F9",
    121: "F10",
    122: "F11",
    123: "F12",
    144: "NumLock",
    145: "ScrollLock",
    224: "Meta"
  }, modifierKeyToProp = {
    Alt: "altKey",
    Control: "ctrlKey",
    Meta: "metaKey",
    Shift: "shiftKey"
  };
  function modifierStateGetter(keyArg) {
    var nativeEvent = this.nativeEvent;
    return nativeEvent.getModifierState ? nativeEvent.getModifierState(keyArg) : (keyArg = modifierKeyToProp[keyArg]) ? !!nativeEvent[keyArg] : false;
  }
  function getEventModifierState() {
    return modifierStateGetter;
  }
  var KeyboardEventInterface = assign({}, UIEventInterface, {
    key: function(nativeEvent) {
      if (nativeEvent.key) {
        var key = normalizeKey[nativeEvent.key] || nativeEvent.key;
        if ("Unidentified" !== key) return key;
      }
      return "keypress" === nativeEvent.type ? (nativeEvent = getEventCharCode(nativeEvent), 13 === nativeEvent ? "Enter" : String.fromCharCode(nativeEvent)) : "keydown" === nativeEvent.type || "keyup" === nativeEvent.type ? translateToKey[nativeEvent.keyCode] || "Unidentified" : "";
    },
    code: 0,
    location: 0,
    ctrlKey: 0,
    shiftKey: 0,
    altKey: 0,
    metaKey: 0,
    repeat: 0,
    locale: 0,
    getModifierState: getEventModifierState,
    charCode: function(event) {
      return "keypress" === event.type ? getEventCharCode(event) : 0;
    },
    keyCode: function(event) {
      return "keydown" === event.type || "keyup" === event.type ? event.keyCode : 0;
    },
    which: function(event) {
      return "keypress" === event.type ? getEventCharCode(event) : "keydown" === event.type || "keyup" === event.type ? event.keyCode : 0;
    }
  }), SyntheticKeyboardEvent = createSyntheticEvent(KeyboardEventInterface), PointerEventInterface = assign({}, MouseEventInterface, {
    pointerId: 0,
    width: 0,
    height: 0,
    pressure: 0,
    tangentialPressure: 0,
    tiltX: 0,
    tiltY: 0,
    twist: 0,
    pointerType: 0,
    isPrimary: 0
  }), SyntheticPointerEvent = createSyntheticEvent(PointerEventInterface), TouchEventInterface = assign({}, UIEventInterface, {
    touches: 0,
    targetTouches: 0,
    changedTouches: 0,
    altKey: 0,
    metaKey: 0,
    ctrlKey: 0,
    shiftKey: 0,
    getModifierState: getEventModifierState
  }), SyntheticTouchEvent = createSyntheticEvent(TouchEventInterface), TransitionEventInterface = assign({}, EventInterface, {
    propertyName: 0,
    elapsedTime: 0,
    pseudoElement: 0
  }), SyntheticTransitionEvent = createSyntheticEvent(TransitionEventInterface), WheelEventInterface = assign({}, MouseEventInterface, {
    deltaX: function(event) {
      return "deltaX" in event ? event.deltaX : "wheelDeltaX" in event ? -event.wheelDeltaX : 0;
    },
    deltaY: function(event) {
      return "deltaY" in event ? event.deltaY : "wheelDeltaY" in event ? -event.wheelDeltaY : "wheelDelta" in event ? -event.wheelDelta : 0;
    },
    deltaZ: 0,
    deltaMode: 0
  }), SyntheticWheelEvent = createSyntheticEvent(WheelEventInterface), ToggleEventInterface = assign({}, EventInterface, {
    newState: 0,
    oldState: 0
  }), SyntheticToggleEvent = createSyntheticEvent(ToggleEventInterface), END_KEYCODES = [9, 13, 27, 32], canUseCompositionEvent = canUseDOM && "CompositionEvent" in window, documentMode = null;
  canUseDOM && "documentMode" in document && (documentMode = document.documentMode);
  var canUseTextInputEvent = canUseDOM && "TextEvent" in window && !documentMode, useFallbackCompositionData = canUseDOM && (!canUseCompositionEvent || documentMode && 8 < documentMode && 11 >= documentMode), SPACEBAR_CHAR = String.fromCharCode(32), hasSpaceKeypress = false;
  function isFallbackCompositionEnd(domEventName, nativeEvent) {
    switch (domEventName) {
      case "keyup":
        return -1 !== END_KEYCODES.indexOf(nativeEvent.keyCode);
      case "keydown":
        return 229 !== nativeEvent.keyCode;
      case "keypress":
      case "mousedown":
      case "focusout":
        return true;
      default:
        return false;
    }
  }
  function getDataFromCustomEvent(nativeEvent) {
    nativeEvent = nativeEvent.detail;
    return "object" === typeof nativeEvent && "data" in nativeEvent ? nativeEvent.data : null;
  }
  var isComposing = false;
  function getNativeBeforeInputChars(domEventName, nativeEvent) {
    switch (domEventName) {
      case "compositionend":
        return getDataFromCustomEvent(nativeEvent);
      case "keypress":
        if (32 !== nativeEvent.which) return null;
        hasSpaceKeypress = true;
        return SPACEBAR_CHAR;
      case "textInput":
        return domEventName = nativeEvent.data, domEventName === SPACEBAR_CHAR && hasSpaceKeypress ? null : domEventName;
      default:
        return null;
    }
  }
  function getFallbackBeforeInputChars(domEventName, nativeEvent) {
    if (isComposing)
      return "compositionend" === domEventName || !canUseCompositionEvent && isFallbackCompositionEnd(domEventName, nativeEvent) ? (domEventName = getData(), fallbackText = startText = root = null, isComposing = false, domEventName) : null;
    switch (domEventName) {
      case "paste":
        return null;
      case "keypress":
        if (!(nativeEvent.ctrlKey || nativeEvent.altKey || nativeEvent.metaKey) || nativeEvent.ctrlKey && nativeEvent.altKey) {
          if (nativeEvent.char && 1 < nativeEvent.char.length)
            return nativeEvent.char;
          if (nativeEvent.which) return String.fromCharCode(nativeEvent.which);
        }
        return null;
      case "compositionend":
        return useFallbackCompositionData && "ko" !== nativeEvent.locale ? null : nativeEvent.data;
      default:
        return null;
    }
  }
  var supportedInputTypes = {
    color: true,
    date: true,
    datetime: true,
    "datetime-local": true,
    email: true,
    month: true,
    number: true,
    password: true,
    range: true,
    search: true,
    tel: true,
    text: true,
    time: true,
    url: true,
    week: true
  };
  function isTextInputElement(elem) {
    var nodeName = elem && elem.nodeName && elem.nodeName.toLowerCase();
    return "input" === nodeName ? !!supportedInputTypes[elem.type] : "textarea" === nodeName ? true : false;
  }
  function createAndAccumulateChangeEvent(dispatchQueue, inst, nativeEvent, target) {
    restoreTarget ? restoreQueue ? restoreQueue.push(target) : restoreQueue = [target] : restoreTarget = target;
    inst = accumulateTwoPhaseListeners(inst, "onChange");
    0 < inst.length && (nativeEvent = new SyntheticEvent(
      "onChange",
      "change",
      null,
      nativeEvent,
      target
    ), dispatchQueue.push({ event: nativeEvent, listeners: inst }));
  }
  var activeElement$1 = null, activeElementInst$1 = null;
  function runEventInBatch(dispatchQueue) {
    processDispatchQueue(dispatchQueue, 0);
  }
  function getInstIfValueChanged(targetInst) {
    var targetNode = getNodeFromInstance(targetInst);
    if (updateValueIfChanged(targetNode)) return targetInst;
  }
  function getTargetInstForChangeEvent(domEventName, targetInst) {
    if ("change" === domEventName) return targetInst;
  }
  var isInputEventSupported = false;
  if (canUseDOM) {
    var JSCompiler_inline_result$jscomp$286;
    if (canUseDOM) {
      var isSupported$jscomp$inline_427 = "oninput" in document;
      if (!isSupported$jscomp$inline_427) {
        var element$jscomp$inline_428 = document.createElement("div");
        element$jscomp$inline_428.setAttribute("oninput", "return;");
        isSupported$jscomp$inline_427 = "function" === typeof element$jscomp$inline_428.oninput;
      }
      JSCompiler_inline_result$jscomp$286 = isSupported$jscomp$inline_427;
    } else JSCompiler_inline_result$jscomp$286 = false;
    isInputEventSupported = JSCompiler_inline_result$jscomp$286 && (!document.documentMode || 9 < document.documentMode);
  }
  function stopWatchingForValueChange() {
    activeElement$1 && (activeElement$1.detachEvent("onpropertychange", handlePropertyChange), activeElementInst$1 = activeElement$1 = null);
  }
  function handlePropertyChange(nativeEvent) {
    if ("value" === nativeEvent.propertyName && getInstIfValueChanged(activeElementInst$1)) {
      var dispatchQueue = [];
      createAndAccumulateChangeEvent(
        dispatchQueue,
        activeElementInst$1,
        nativeEvent,
        getEventTarget(nativeEvent)
      );
      batchedUpdates$1(runEventInBatch, dispatchQueue);
    }
  }
  function handleEventsForInputEventPolyfill(domEventName, target, targetInst) {
    "focusin" === domEventName ? (stopWatchingForValueChange(), activeElement$1 = target, activeElementInst$1 = targetInst, activeElement$1.attachEvent("onpropertychange", handlePropertyChange)) : "focusout" === domEventName && stopWatchingForValueChange();
  }
  function getTargetInstForInputEventPolyfill(domEventName) {
    if ("selectionchange" === domEventName || "keyup" === domEventName || "keydown" === domEventName)
      return getInstIfValueChanged(activeElementInst$1);
  }
  function getTargetInstForClickEvent(domEventName, targetInst) {
    if ("click" === domEventName) return getInstIfValueChanged(targetInst);
  }
  function getTargetInstForInputOrChangeEvent(domEventName, targetInst) {
    if ("input" === domEventName || "change" === domEventName)
      return getInstIfValueChanged(targetInst);
  }
  function is(x, y) {
    return x === y && (0 !== x || 1 / x === 1 / y) || x !== x && y !== y;
  }
  var objectIs = "function" === typeof Object.is ? Object.is : is;
  function shallowEqual(objA, objB) {
    if (objectIs(objA, objB)) return true;
    if ("object" !== typeof objA || null === objA || "object" !== typeof objB || null === objB)
      return false;
    var keysA = Object.keys(objA), keysB = Object.keys(objB);
    if (keysA.length !== keysB.length) return false;
    for (keysB = 0; keysB < keysA.length; keysB++) {
      var currentKey = keysA[keysB];
      if (!hasOwnProperty.call(objB, currentKey) || !objectIs(objA[currentKey], objB[currentKey]))
        return false;
    }
    return true;
  }
  function getLeafNode(node) {
    for (; node && node.firstChild; ) node = node.firstChild;
    return node;
  }
  function getNodeForCharacterOffset(root2, offset) {
    var node = getLeafNode(root2);
    root2 = 0;
    for (var nodeEnd; node; ) {
      if (3 === node.nodeType) {
        nodeEnd = root2 + node.textContent.length;
        if (root2 <= offset && nodeEnd >= offset)
          return { node, offset: offset - root2 };
        root2 = nodeEnd;
      }
      a: {
        for (; node; ) {
          if (node.nextSibling) {
            node = node.nextSibling;
            break a;
          }
          node = node.parentNode;
        }
        node = void 0;
      }
      node = getLeafNode(node);
    }
  }
  function containsNode(outerNode, innerNode) {
    return outerNode && innerNode ? outerNode === innerNode ? true : outerNode && 3 === outerNode.nodeType ? false : innerNode && 3 === innerNode.nodeType ? containsNode(outerNode, innerNode.parentNode) : "contains" in outerNode ? outerNode.contains(innerNode) : outerNode.compareDocumentPosition ? !!(outerNode.compareDocumentPosition(innerNode) & 16) : false : false;
  }
  function getActiveElementDeep(containerInfo) {
    containerInfo = null != containerInfo && null != containerInfo.ownerDocument && null != containerInfo.ownerDocument.defaultView ? containerInfo.ownerDocument.defaultView : window;
    for (var element = getActiveElement(containerInfo.document); element instanceof containerInfo.HTMLIFrameElement; ) {
      try {
        var JSCompiler_inline_result = "string" === typeof element.contentWindow.location.href;
      } catch (err) {
        JSCompiler_inline_result = false;
      }
      if (JSCompiler_inline_result) containerInfo = element.contentWindow;
      else break;
      element = getActiveElement(containerInfo.document);
    }
    return element;
  }
  function hasSelectionCapabilities(elem) {
    var nodeName = elem && elem.nodeName && elem.nodeName.toLowerCase();
    return nodeName && ("input" === nodeName && ("text" === elem.type || "search" === elem.type || "tel" === elem.type || "url" === elem.type || "password" === elem.type) || "textarea" === nodeName || "true" === elem.contentEditable);
  }
  var skipSelectionChangeEvent = canUseDOM && "documentMode" in document && 11 >= document.documentMode, activeElement = null, activeElementInst = null, lastSelection = null, mouseDown = false;
  function constructSelectEvent(dispatchQueue, nativeEvent, nativeEventTarget) {
    var doc = nativeEventTarget.window === nativeEventTarget ? nativeEventTarget.document : 9 === nativeEventTarget.nodeType ? nativeEventTarget : nativeEventTarget.ownerDocument;
    mouseDown || null == activeElement || activeElement !== getActiveElement(doc) || (doc = activeElement, "selectionStart" in doc && hasSelectionCapabilities(doc) ? doc = { start: doc.selectionStart, end: doc.selectionEnd } : (doc = (doc.ownerDocument && doc.ownerDocument.defaultView || window).getSelection(), doc = {
      anchorNode: doc.anchorNode,
      anchorOffset: doc.anchorOffset,
      focusNode: doc.focusNode,
      focusOffset: doc.focusOffset
    }), lastSelection && shallowEqual(lastSelection, doc) || (lastSelection = doc, doc = accumulateTwoPhaseListeners(activeElementInst, "onSelect"), 0 < doc.length && (nativeEvent = new SyntheticEvent(
      "onSelect",
      "select",
      null,
      nativeEvent,
      nativeEventTarget
    ), dispatchQueue.push({ event: nativeEvent, listeners: doc }), nativeEvent.target = activeElement)));
  }
  function makePrefixMap(styleProp, eventName) {
    var prefixes = {};
    prefixes[styleProp.toLowerCase()] = eventName.toLowerCase();
    prefixes["Webkit" + styleProp] = "webkit" + eventName;
    prefixes["Moz" + styleProp] = "moz" + eventName;
    return prefixes;
  }
  var vendorPrefixes = {
    animationend: makePrefixMap("Animation", "AnimationEnd"),
    animationiteration: makePrefixMap("Animation", "AnimationIteration"),
    animationstart: makePrefixMap("Animation", "AnimationStart"),
    transitionrun: makePrefixMap("Transition", "TransitionRun"),
    transitionstart: makePrefixMap("Transition", "TransitionStart"),
    transitioncancel: makePrefixMap("Transition", "TransitionCancel"),
    transitionend: makePrefixMap("Transition", "TransitionEnd")
  }, prefixedEventNames = {}, style = {};
  canUseDOM && (style = document.createElement("div").style, "AnimationEvent" in window || (delete vendorPrefixes.animationend.animation, delete vendorPrefixes.animationiteration.animation, delete vendorPrefixes.animationstart.animation), "TransitionEvent" in window || delete vendorPrefixes.transitionend.transition);
  function getVendorPrefixedEventName(eventName) {
    if (prefixedEventNames[eventName]) return prefixedEventNames[eventName];
    if (!vendorPrefixes[eventName]) return eventName;
    var prefixMap = vendorPrefixes[eventName], styleProp;
    for (styleProp in prefixMap)
      if (prefixMap.hasOwnProperty(styleProp) && styleProp in style)
        return prefixedEventNames[eventName] = prefixMap[styleProp];
    return eventName;
  }
  var ANIMATION_END = getVendorPrefixedEventName("animationend"), ANIMATION_ITERATION = getVendorPrefixedEventName("animationiteration"), ANIMATION_START = getVendorPrefixedEventName("animationstart"), TRANSITION_RUN = getVendorPrefixedEventName("transitionrun"), TRANSITION_START = getVendorPrefixedEventName("transitionstart"), TRANSITION_CANCEL = getVendorPrefixedEventName("transitioncancel"), TRANSITION_END = getVendorPrefixedEventName("transitionend"), topLevelEventsToReactNames = /* @__PURE__ */ new Map(), simpleEventPluginEvents = "abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(
    " "
  );
  simpleEventPluginEvents.push("scrollEnd");
  function registerSimpleEvent(domEventName, reactName) {
    topLevelEventsToReactNames.set(domEventName, reactName);
    registerTwoPhaseEvent(reactName, [domEventName]);
  }
  var reportGlobalError = "function" === typeof reportError ? reportError : function(error) {
    if ("object" === typeof window && "function" === typeof window.ErrorEvent) {
      var event = new window.ErrorEvent("error", {
        bubbles: true,
        cancelable: true,
        message: "object" === typeof error && null !== error && "string" === typeof error.message ? String(error.message) : String(error),
        error
      });
      if (!window.dispatchEvent(event)) return;
    } else if ("object" === typeof process && "function" === typeof process.emit) {
      process.emit("uncaughtException", error);
      return;
    }
    console.error(error);
  }, concurrentQueues = [], concurrentQueuesIndex = 0, concurrentlyUpdatedLanes = 0;
  function finishQueueingConcurrentUpdates() {
    for (var endIndex = concurrentQueuesIndex, i = concurrentlyUpdatedLanes = concurrentQueuesIndex = 0; i < endIndex; ) {
      var fiber = concurrentQueues[i];
      concurrentQueues[i++] = null;
      var queue = concurrentQueues[i];
      concurrentQueues[i++] = null;
      var update = concurrentQueues[i];
      concurrentQueues[i++] = null;
      var lane = concurrentQueues[i];
      concurrentQueues[i++] = null;
      if (null !== queue && null !== update) {
        var pending = queue.pending;
        null === pending ? update.next = update : (update.next = pending.next, pending.next = update);
        queue.pending = update;
      }
      0 !== lane && markUpdateLaneFromFiberToRoot(fiber, update, lane);
    }
  }
  function enqueueUpdate$1(fiber, queue, update, lane) {
    concurrentQueues[concurrentQueuesIndex++] = fiber;
    concurrentQueues[concurrentQueuesIndex++] = queue;
    concurrentQueues[concurrentQueuesIndex++] = update;
    concurrentQueues[concurrentQueuesIndex++] = lane;
    concurrentlyUpdatedLanes |= lane;
    fiber.lanes |= lane;
    fiber = fiber.alternate;
    null !== fiber && (fiber.lanes |= lane);
  }
  function enqueueConcurrentHookUpdate(fiber, queue, update, lane) {
    enqueueUpdate$1(fiber, queue, update, lane);
    return getRootForUpdatedFiber(fiber);
  }
  function enqueueConcurrentRenderForLane(fiber, lane) {
    enqueueUpdate$1(fiber, null, null, lane);
    return getRootForUpdatedFiber(fiber);
  }
  function markUpdateLaneFromFiberToRoot(sourceFiber, update, lane) {
    sourceFiber.lanes |= lane;
    var alternate = sourceFiber.alternate;
    null !== alternate && (alternate.lanes |= lane);
    for (var isHidden = false, parent = sourceFiber.return; null !== parent; )
      parent.childLanes |= lane, alternate = parent.alternate, null !== alternate && (alternate.childLanes |= lane), 22 === parent.tag && (sourceFiber = parent.stateNode, null === sourceFiber || sourceFiber._visibility & 1 || (isHidden = true)), sourceFiber = parent, parent = parent.return;
    return 3 === sourceFiber.tag ? (parent = sourceFiber.stateNode, isHidden && null !== update && (isHidden = 31 - clz32(lane), sourceFiber = parent.hiddenUpdates, alternate = sourceFiber[isHidden], null === alternate ? sourceFiber[isHidden] = [update] : alternate.push(update), update.lane = lane | 536870912), parent) : null;
  }
  function getRootForUpdatedFiber(sourceFiber) {
    if (50 < nestedUpdateCount)
      throw nestedUpdateCount = 0, rootWithNestedUpdates = null, Error(formatProdErrorMessage(185));
    for (var parent = sourceFiber.return; null !== parent; )
      sourceFiber = parent, parent = sourceFiber.return;
    return 3 === sourceFiber.tag ? sourceFiber.stateNode : null;
  }
  var emptyContextObject = {};
  function FiberNode(tag, pendingProps, key, mode) {
    this.tag = tag;
    this.key = key;
    this.sibling = this.child = this.return = this.stateNode = this.type = this.elementType = null;
    this.index = 0;
    this.refCleanup = this.ref = null;
    this.pendingProps = pendingProps;
    this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null;
    this.mode = mode;
    this.subtreeFlags = this.flags = 0;
    this.deletions = null;
    this.childLanes = this.lanes = 0;
    this.alternate = null;
  }
  function createFiberImplClass(tag, pendingProps, key, mode) {
    return new FiberNode(tag, pendingProps, key, mode);
  }
  function shouldConstruct(Component) {
    Component = Component.prototype;
    return !(!Component || !Component.isReactComponent);
  }
  function createWorkInProgress(current, pendingProps) {
    var workInProgress2 = current.alternate;
    null === workInProgress2 ? (workInProgress2 = createFiberImplClass(
      current.tag,
      pendingProps,
      current.key,
      current.mode
    ), workInProgress2.elementType = current.elementType, workInProgress2.type = current.type, workInProgress2.stateNode = current.stateNode, workInProgress2.alternate = current, current.alternate = workInProgress2) : (workInProgress2.pendingProps = pendingProps, workInProgress2.type = current.type, workInProgress2.flags = 0, workInProgress2.subtreeFlags = 0, workInProgress2.deletions = null);
    workInProgress2.flags = current.flags & 65011712;
    workInProgress2.childLanes = current.childLanes;
    workInProgress2.lanes = current.lanes;
    workInProgress2.child = current.child;
    workInProgress2.memoizedProps = current.memoizedProps;
    workInProgress2.memoizedState = current.memoizedState;
    workInProgress2.updateQueue = current.updateQueue;
    pendingProps = current.dependencies;
    workInProgress2.dependencies = null === pendingProps ? null : { lanes: pendingProps.lanes, firstContext: pendingProps.firstContext };
    workInProgress2.sibling = current.sibling;
    workInProgress2.index = current.index;
    workInProgress2.ref = current.ref;
    workInProgress2.refCleanup = current.refCleanup;
    return workInProgress2;
  }
  function resetWorkInProgress(workInProgress2, renderLanes2) {
    workInProgress2.flags &= 65011714;
    var current = workInProgress2.alternate;
    null === current ? (workInProgress2.childLanes = 0, workInProgress2.lanes = renderLanes2, workInProgress2.child = null, workInProgress2.subtreeFlags = 0, workInProgress2.memoizedProps = null, workInProgress2.memoizedState = null, workInProgress2.updateQueue = null, workInProgress2.dependencies = null, workInProgress2.stateNode = null) : (workInProgress2.childLanes = current.childLanes, workInProgress2.lanes = current.lanes, workInProgress2.child = current.child, workInProgress2.subtreeFlags = 0, workInProgress2.deletions = null, workInProgress2.memoizedProps = current.memoizedProps, workInProgress2.memoizedState = current.memoizedState, workInProgress2.updateQueue = current.updateQueue, workInProgress2.type = current.type, renderLanes2 = current.dependencies, workInProgress2.dependencies = null === renderLanes2 ? null : {
      lanes: renderLanes2.lanes,
      firstContext: renderLanes2.firstContext
    });
    return workInProgress2;
  }
  function createFiberFromTypeAndProps(type, key, pendingProps, owner, mode, lanes) {
    var fiberTag = 0;
    owner = type;
    if ("function" === typeof type) shouldConstruct(type) && (fiberTag = 1);
    else if ("string" === typeof type)
      fiberTag = isHostHoistableType(
        type,
        pendingProps,
        contextStackCursor.current
      ) ? 26 : "html" === type || "head" === type || "body" === type ? 27 : 5;
    else
      a: switch (type) {
        case REACT_ACTIVITY_TYPE:
          return type = createFiberImplClass(31, pendingProps, key, mode), type.elementType = REACT_ACTIVITY_TYPE, type.lanes = lanes, type;
        case REACT_FRAGMENT_TYPE:
          return createFiberFromFragment(pendingProps.children, mode, lanes, key);
        case REACT_STRICT_MODE_TYPE:
          fiberTag = 8;
          mode |= 24;
          break;
        case REACT_PROFILER_TYPE:
          return type = createFiberImplClass(12, pendingProps, key, mode | 2), type.elementType = REACT_PROFILER_TYPE, type.lanes = lanes, type;
        case REACT_SUSPENSE_TYPE:
          return type = createFiberImplClass(13, pendingProps, key, mode), type.elementType = REACT_SUSPENSE_TYPE, type.lanes = lanes, type;
        case REACT_SUSPENSE_LIST_TYPE:
          return type = createFiberImplClass(19, pendingProps, key, mode), type.elementType = REACT_SUSPENSE_LIST_TYPE, type.lanes = lanes, type;
        default:
          if ("object" === typeof type && null !== type)
            switch (type.$$typeof) {
              case REACT_CONTEXT_TYPE:
                fiberTag = 10;
                break a;
              case REACT_CONSUMER_TYPE:
                fiberTag = 9;
                break a;
              case REACT_FORWARD_REF_TYPE:
                fiberTag = 11;
                break a;
              case REACT_MEMO_TYPE:
                fiberTag = 14;
                break a;
              case REACT_LAZY_TYPE:
                fiberTag = 16;
                owner = null;
                break a;
            }
          fiberTag = 29;
          pendingProps = Error(
            formatProdErrorMessage(130, null === type ? "null" : typeof type, "")
          );
          owner = null;
      }
    key = createFiberImplClass(fiberTag, pendingProps, key, mode);
    key.elementType = type;
    key.type = owner;
    key.lanes = lanes;
    return key;
  }
  function createFiberFromFragment(elements, mode, lanes, key) {
    elements = createFiberImplClass(7, elements, key, mode);
    elements.lanes = lanes;
    return elements;
  }
  function createFiberFromText(content, mode, lanes) {
    content = createFiberImplClass(6, content, null, mode);
    content.lanes = lanes;
    return content;
  }
  function createFiberFromDehydratedFragment(dehydratedNode) {
    var fiber = createFiberImplClass(18, null, null, 0);
    fiber.stateNode = dehydratedNode;
    return fiber;
  }
  function createFiberFromPortal(portal, mode, lanes) {
    mode = createFiberImplClass(
      4,
      null !== portal.children ? portal.children : [],
      portal.key,
      mode
    );
    mode.lanes = lanes;
    mode.stateNode = {
      containerInfo: portal.containerInfo,
      pendingChildren: null,
      implementation: portal.implementation
    };
    return mode;
  }
  var CapturedStacks = /* @__PURE__ */ new WeakMap();
  function createCapturedValueAtFiber(value, source) {
    if ("object" === typeof value && null !== value) {
      var existing = CapturedStacks.get(value);
      if (void 0 !== existing) return existing;
      source = {
        value,
        source,
        stack: getStackByFiberInDevAndProd(source)
      };
      CapturedStacks.set(value, source);
      return source;
    }
    return {
      value,
      source,
      stack: getStackByFiberInDevAndProd(source)
    };
  }
  var forkStack = [], forkStackIndex = 0, treeForkProvider = null, treeForkCount = 0, idStack = [], idStackIndex = 0, treeContextProvider = null, treeContextId = 1, treeContextOverflow = "";
  function pushTreeFork(workInProgress2, totalChildren) {
    forkStack[forkStackIndex++] = treeForkCount;
    forkStack[forkStackIndex++] = treeForkProvider;
    treeForkProvider = workInProgress2;
    treeForkCount = totalChildren;
  }
  function pushTreeId(workInProgress2, totalChildren, index2) {
    idStack[idStackIndex++] = treeContextId;
    idStack[idStackIndex++] = treeContextOverflow;
    idStack[idStackIndex++] = treeContextProvider;
    treeContextProvider = workInProgress2;
    var baseIdWithLeadingBit = treeContextId;
    workInProgress2 = treeContextOverflow;
    var baseLength = 32 - clz32(baseIdWithLeadingBit) - 1;
    baseIdWithLeadingBit &= ~(1 << baseLength);
    index2 += 1;
    var length = 32 - clz32(totalChildren) + baseLength;
    if (30 < length) {
      var numberOfOverflowBits = baseLength - baseLength % 5;
      length = (baseIdWithLeadingBit & (1 << numberOfOverflowBits) - 1).toString(32);
      baseIdWithLeadingBit >>= numberOfOverflowBits;
      baseLength -= numberOfOverflowBits;
      treeContextId = 1 << 32 - clz32(totalChildren) + baseLength | index2 << baseLength | baseIdWithLeadingBit;
      treeContextOverflow = length + workInProgress2;
    } else
      treeContextId = 1 << length | index2 << baseLength | baseIdWithLeadingBit, treeContextOverflow = workInProgress2;
  }
  function pushMaterializedTreeId(workInProgress2) {
    null !== workInProgress2.return && (pushTreeFork(workInProgress2, 1), pushTreeId(workInProgress2, 1, 0));
  }
  function popTreeContext(workInProgress2) {
    for (; workInProgress2 === treeForkProvider; )
      treeForkProvider = forkStack[--forkStackIndex], forkStack[forkStackIndex] = null, treeForkCount = forkStack[--forkStackIndex], forkStack[forkStackIndex] = null;
    for (; workInProgress2 === treeContextProvider; )
      treeContextProvider = idStack[--idStackIndex], idStack[idStackIndex] = null, treeContextOverflow = idStack[--idStackIndex], idStack[idStackIndex] = null, treeContextId = idStack[--idStackIndex], idStack[idStackIndex] = null;
  }
  function restoreSuspendedTreeContext(workInProgress2, suspendedContext) {
    idStack[idStackIndex++] = treeContextId;
    idStack[idStackIndex++] = treeContextOverflow;
    idStack[idStackIndex++] = treeContextProvider;
    treeContextId = suspendedContext.id;
    treeContextOverflow = suspendedContext.overflow;
    treeContextProvider = workInProgress2;
  }
  var hydrationParentFiber = null, nextHydratableInstance = null, isHydrating = false, hydrationErrors = null, rootOrSingletonContext = false, HydrationMismatchException = Error(formatProdErrorMessage(519));
  function throwOnHydrationMismatch(fiber) {
    var error = Error(
      formatProdErrorMessage(
        418,
        1 < arguments.length && void 0 !== arguments[1] && arguments[1] ? "text" : "HTML",
        ""
      )
    );
    queueHydrationError(createCapturedValueAtFiber(error, fiber));
    throw HydrationMismatchException;
  }
  function prepareToHydrateHostInstance(fiber) {
    var instance = fiber.stateNode, type = fiber.type, props = fiber.memoizedProps;
    instance[internalInstanceKey] = fiber;
    instance[internalPropsKey] = props;
    switch (type) {
      case "dialog":
        listenToNonDelegatedEvent("cancel", instance);
        listenToNonDelegatedEvent("close", instance);
        break;
      case "iframe":
      case "object":
      case "embed":
        listenToNonDelegatedEvent("load", instance);
        break;
      case "video":
      case "audio":
        for (type = 0; type < mediaEventTypes.length; type++)
          listenToNonDelegatedEvent(mediaEventTypes[type], instance);
        break;
      case "source":
        listenToNonDelegatedEvent("error", instance);
        break;
      case "img":
      case "image":
      case "link":
        listenToNonDelegatedEvent("error", instance);
        listenToNonDelegatedEvent("load", instance);
        break;
      case "details":
        listenToNonDelegatedEvent("toggle", instance);
        break;
      case "input":
        listenToNonDelegatedEvent("invalid", instance);
        initInput(
          instance,
          props.value,
          props.defaultValue,
          props.checked,
          props.defaultChecked,
          props.type,
          props.name,
          true
        );
        break;
      case "select":
        listenToNonDelegatedEvent("invalid", instance);
        break;
      case "textarea":
        listenToNonDelegatedEvent("invalid", instance), initTextarea(instance, props.value, props.defaultValue, props.children);
    }
    type = props.children;
    "string" !== typeof type && "number" !== typeof type && "bigint" !== typeof type || instance.textContent === "" + type || true === props.suppressHydrationWarning || checkForUnmatchedText(instance.textContent, type) ? (null != props.popover && (listenToNonDelegatedEvent("beforetoggle", instance), listenToNonDelegatedEvent("toggle", instance)), null != props.onScroll && listenToNonDelegatedEvent("scroll", instance), null != props.onScrollEnd && listenToNonDelegatedEvent("scrollend", instance), null != props.onClick && (instance.onclick = noop$1), instance = true) : instance = false;
    instance || throwOnHydrationMismatch(fiber, true);
  }
  function popToNextHostParent(fiber) {
    for (hydrationParentFiber = fiber.return; hydrationParentFiber; )
      switch (hydrationParentFiber.tag) {
        case 5:
        case 31:
        case 13:
          rootOrSingletonContext = false;
          return;
        case 27:
        case 3:
          rootOrSingletonContext = true;
          return;
        default:
          hydrationParentFiber = hydrationParentFiber.return;
      }
  }
  function popHydrationState(fiber) {
    if (fiber !== hydrationParentFiber) return false;
    if (!isHydrating) return popToNextHostParent(fiber), isHydrating = true, false;
    var tag = fiber.tag, JSCompiler_temp;
    if (JSCompiler_temp = 3 !== tag && 27 !== tag) {
      if (JSCompiler_temp = 5 === tag)
        JSCompiler_temp = fiber.type, JSCompiler_temp = !("form" !== JSCompiler_temp && "button" !== JSCompiler_temp) || shouldSetTextContent(fiber.type, fiber.memoizedProps);
      JSCompiler_temp = !JSCompiler_temp;
    }
    JSCompiler_temp && nextHydratableInstance && throwOnHydrationMismatch(fiber);
    popToNextHostParent(fiber);
    if (13 === tag) {
      fiber = fiber.memoizedState;
      fiber = null !== fiber ? fiber.dehydrated : null;
      if (!fiber) throw Error(formatProdErrorMessage(317));
      nextHydratableInstance = getNextHydratableInstanceAfterHydrationBoundary(fiber);
    } else if (31 === tag) {
      fiber = fiber.memoizedState;
      fiber = null !== fiber ? fiber.dehydrated : null;
      if (!fiber) throw Error(formatProdErrorMessage(317));
      nextHydratableInstance = getNextHydratableInstanceAfterHydrationBoundary(fiber);
    } else
      27 === tag ? (tag = nextHydratableInstance, isSingletonScope(fiber.type) ? (fiber = previousHydratableOnEnteringScopedSingleton, previousHydratableOnEnteringScopedSingleton = null, nextHydratableInstance = fiber) : nextHydratableInstance = tag) : nextHydratableInstance = hydrationParentFiber ? getNextHydratable(fiber.stateNode.nextSibling) : null;
    return true;
  }
  function resetHydrationState() {
    nextHydratableInstance = hydrationParentFiber = null;
    isHydrating = false;
  }
  function upgradeHydrationErrorsToRecoverable() {
    var queuedErrors = hydrationErrors;
    null !== queuedErrors && (null === workInProgressRootRecoverableErrors ? workInProgressRootRecoverableErrors = queuedErrors : workInProgressRootRecoverableErrors.push.apply(
      workInProgressRootRecoverableErrors,
      queuedErrors
    ), hydrationErrors = null);
    return queuedErrors;
  }
  function queueHydrationError(error) {
    null === hydrationErrors ? hydrationErrors = [error] : hydrationErrors.push(error);
  }
  var valueCursor = createCursor(null), currentlyRenderingFiber$1 = null, lastContextDependency = null;
  function pushProvider(providerFiber, context, nextValue) {
    push(valueCursor, context._currentValue);
    context._currentValue = nextValue;
  }
  function popProvider(context) {
    context._currentValue = valueCursor.current;
    pop(valueCursor);
  }
  function scheduleContextWorkOnParentPath(parent, renderLanes2, propagationRoot) {
    for (; null !== parent; ) {
      var alternate = parent.alternate;
      (parent.childLanes & renderLanes2) !== renderLanes2 ? (parent.childLanes |= renderLanes2, null !== alternate && (alternate.childLanes |= renderLanes2)) : null !== alternate && (alternate.childLanes & renderLanes2) !== renderLanes2 && (alternate.childLanes |= renderLanes2);
      if (parent === propagationRoot) break;
      parent = parent.return;
    }
  }
  function propagateContextChanges(workInProgress2, contexts, renderLanes2, forcePropagateEntireTree) {
    var fiber = workInProgress2.child;
    null !== fiber && (fiber.return = workInProgress2);
    for (; null !== fiber; ) {
      var list = fiber.dependencies;
      if (null !== list) {
        var nextFiber = fiber.child;
        list = list.firstContext;
        a: for (; null !== list; ) {
          var dependency = list;
          list = fiber;
          for (var i = 0; i < contexts.length; i++)
            if (dependency.context === contexts[i]) {
              list.lanes |= renderLanes2;
              dependency = list.alternate;
              null !== dependency && (dependency.lanes |= renderLanes2);
              scheduleContextWorkOnParentPath(
                list.return,
                renderLanes2,
                workInProgress2
              );
              forcePropagateEntireTree || (nextFiber = null);
              break a;
            }
          list = dependency.next;
        }
      } else if (18 === fiber.tag) {
        nextFiber = fiber.return;
        if (null === nextFiber) throw Error(formatProdErrorMessage(341));
        nextFiber.lanes |= renderLanes2;
        list = nextFiber.alternate;
        null !== list && (list.lanes |= renderLanes2);
        scheduleContextWorkOnParentPath(nextFiber, renderLanes2, workInProgress2);
        nextFiber = null;
      } else nextFiber = fiber.child;
      if (null !== nextFiber) nextFiber.return = fiber;
      else
        for (nextFiber = fiber; null !== nextFiber; ) {
          if (nextFiber === workInProgress2) {
            nextFiber = null;
            break;
          }
          fiber = nextFiber.sibling;
          if (null !== fiber) {
            fiber.return = nextFiber.return;
            nextFiber = fiber;
            break;
          }
          nextFiber = nextFiber.return;
        }
      fiber = nextFiber;
    }
  }
  function propagateParentContextChanges(current, workInProgress2, renderLanes2, forcePropagateEntireTree) {
    current = null;
    for (var parent = workInProgress2, isInsidePropagationBailout = false; null !== parent; ) {
      if (!isInsidePropagationBailout) {
        if (0 !== (parent.flags & 524288)) isInsidePropagationBailout = true;
        else if (0 !== (parent.flags & 262144)) break;
      }
      if (10 === parent.tag) {
        var currentParent = parent.alternate;
        if (null === currentParent) throw Error(formatProdErrorMessage(387));
        currentParent = currentParent.memoizedProps;
        if (null !== currentParent) {
          var context = parent.type;
          objectIs(parent.pendingProps.value, currentParent.value) || (null !== current ? current.push(context) : current = [context]);
        }
      } else if (parent === hostTransitionProviderCursor.current) {
        currentParent = parent.alternate;
        if (null === currentParent) throw Error(formatProdErrorMessage(387));
        currentParent.memoizedState.memoizedState !== parent.memoizedState.memoizedState && (null !== current ? current.push(HostTransitionContext) : current = [HostTransitionContext]);
      }
      parent = parent.return;
    }
    null !== current && propagateContextChanges(
      workInProgress2,
      current,
      renderLanes2,
      forcePropagateEntireTree
    );
    workInProgress2.flags |= 262144;
  }
  function checkIfContextChanged(currentDependencies) {
    for (currentDependencies = currentDependencies.firstContext; null !== currentDependencies; ) {
      if (!objectIs(
        currentDependencies.context._currentValue,
        currentDependencies.memoizedValue
      ))
        return true;
      currentDependencies = currentDependencies.next;
    }
    return false;
  }
  function prepareToReadContext(workInProgress2) {
    currentlyRenderingFiber$1 = workInProgress2;
    lastContextDependency = null;
    workInProgress2 = workInProgress2.dependencies;
    null !== workInProgress2 && (workInProgress2.firstContext = null);
  }
  function readContext(context) {
    return readContextForConsumer(currentlyRenderingFiber$1, context);
  }
  function readContextDuringReconciliation(consumer, context) {
    null === currentlyRenderingFiber$1 && prepareToReadContext(consumer);
    return readContextForConsumer(consumer, context);
  }
  function readContextForConsumer(consumer, context) {
    var value = context._currentValue;
    context = { context, memoizedValue: value, next: null };
    if (null === lastContextDependency) {
      if (null === consumer) throw Error(formatProdErrorMessage(308));
      lastContextDependency = context;
      consumer.dependencies = { lanes: 0, firstContext: context };
      consumer.flags |= 524288;
    } else lastContextDependency = lastContextDependency.next = context;
    return value;
  }
  var AbortControllerLocal = "undefined" !== typeof AbortController ? AbortController : function() {
    var listeners = [], signal = this.signal = {
      aborted: false,
      addEventListener: function(type, listener) {
        listeners.push(listener);
      }
    };
    this.abort = function() {
      signal.aborted = true;
      listeners.forEach(function(listener) {
        return listener();
      });
    };
  }, scheduleCallback$2 = Scheduler.unstable_scheduleCallback, NormalPriority = Scheduler.unstable_NormalPriority, CacheContext = {
    $$typeof: REACT_CONTEXT_TYPE,
    Consumer: null,
    Provider: null,
    _currentValue: null,
    _currentValue2: null,
    _threadCount: 0
  };
  function createCache() {
    return {
      controller: new AbortControllerLocal(),
      data: /* @__PURE__ */ new Map(),
      refCount: 0
    };
  }
  function releaseCache(cache) {
    cache.refCount--;
    0 === cache.refCount && scheduleCallback$2(NormalPriority, function() {
      cache.controller.abort();
    });
  }
  var currentEntangledListeners = null, currentEntangledPendingCount = 0, currentEntangledLane = 0, currentEntangledActionThenable = null;
  function entangleAsyncAction(transition, thenable) {
    if (null === currentEntangledListeners) {
      var entangledListeners = currentEntangledListeners = [];
      currentEntangledPendingCount = 0;
      currentEntangledLane = requestTransitionLane();
      currentEntangledActionThenable = {
        status: "pending",
        value: void 0,
        then: function(resolve) {
          entangledListeners.push(resolve);
        }
      };
    }
    currentEntangledPendingCount++;
    thenable.then(pingEngtangledActionScope, pingEngtangledActionScope);
    return thenable;
  }
  function pingEngtangledActionScope() {
    if (0 === --currentEntangledPendingCount && null !== currentEntangledListeners) {
      null !== currentEntangledActionThenable && (currentEntangledActionThenable.status = "fulfilled");
      var listeners = currentEntangledListeners;
      currentEntangledListeners = null;
      currentEntangledLane = 0;
      currentEntangledActionThenable = null;
      for (var i = 0; i < listeners.length; i++) (0, listeners[i])();
    }
  }
  function chainThenableValue(thenable, result) {
    var listeners = [], thenableWithOverride = {
      status: "pending",
      value: null,
      reason: null,
      then: function(resolve) {
        listeners.push(resolve);
      }
    };
    thenable.then(
      function() {
        thenableWithOverride.status = "fulfilled";
        thenableWithOverride.value = result;
        for (var i = 0; i < listeners.length; i++) (0, listeners[i])(result);
      },
      function(error) {
        thenableWithOverride.status = "rejected";
        thenableWithOverride.reason = error;
        for (error = 0; error < listeners.length; error++)
          (0, listeners[error])(void 0);
      }
    );
    return thenableWithOverride;
  }
  var prevOnStartTransitionFinish = ReactSharedInternals.S;
  ReactSharedInternals.S = function(transition, returnValue) {
    globalMostRecentTransitionTime = now();
    "object" === typeof returnValue && null !== returnValue && "function" === typeof returnValue.then && entangleAsyncAction(transition, returnValue);
    null !== prevOnStartTransitionFinish && prevOnStartTransitionFinish(transition, returnValue);
  };
  var resumedCache = createCursor(null);
  function peekCacheFromPool() {
    var cacheResumedFromPreviousRender = resumedCache.current;
    return null !== cacheResumedFromPreviousRender ? cacheResumedFromPreviousRender : workInProgressRoot.pooledCache;
  }
  function pushTransition(offscreenWorkInProgress, prevCachePool) {
    null === prevCachePool ? push(resumedCache, resumedCache.current) : push(resumedCache, prevCachePool.pool);
  }
  function getSuspendedCache() {
    var cacheFromPool = peekCacheFromPool();
    return null === cacheFromPool ? null : { parent: CacheContext._currentValue, pool: cacheFromPool };
  }
  var SuspenseException = Error(formatProdErrorMessage(460)), SuspenseyCommitException = Error(formatProdErrorMessage(474)), SuspenseActionException = Error(formatProdErrorMessage(542)), noopSuspenseyCommitThenable = { then: function() {
  } };
  function isThenableResolved(thenable) {
    thenable = thenable.status;
    return "fulfilled" === thenable || "rejected" === thenable;
  }
  function trackUsedThenable(thenableState2, thenable, index2) {
    index2 = thenableState2[index2];
    void 0 === index2 ? thenableState2.push(thenable) : index2 !== thenable && (thenable.then(noop$1, noop$1), thenable = index2);
    switch (thenable.status) {
      case "fulfilled":
        return thenable.value;
      case "rejected":
        throw thenableState2 = thenable.reason, checkIfUseWrappedInAsyncCatch(thenableState2), thenableState2;
      default:
        if ("string" === typeof thenable.status) thenable.then(noop$1, noop$1);
        else {
          thenableState2 = workInProgressRoot;
          if (null !== thenableState2 && 100 < thenableState2.shellSuspendCounter)
            throw Error(formatProdErrorMessage(482));
          thenableState2 = thenable;
          thenableState2.status = "pending";
          thenableState2.then(
            function(fulfilledValue) {
              if ("pending" === thenable.status) {
                var fulfilledThenable = thenable;
                fulfilledThenable.status = "fulfilled";
                fulfilledThenable.value = fulfilledValue;
              }
            },
            function(error) {
              if ("pending" === thenable.status) {
                var rejectedThenable = thenable;
                rejectedThenable.status = "rejected";
                rejectedThenable.reason = error;
              }
            }
          );
        }
        switch (thenable.status) {
          case "fulfilled":
            return thenable.value;
          case "rejected":
            throw thenableState2 = thenable.reason, checkIfUseWrappedInAsyncCatch(thenableState2), thenableState2;
        }
        suspendedThenable = thenable;
        throw SuspenseException;
    }
  }
  function resolveLazy(lazyType) {
    try {
      var init = lazyType._init;
      return init(lazyType._payload);
    } catch (x) {
      if (null !== x && "object" === typeof x && "function" === typeof x.then)
        throw suspendedThenable = x, SuspenseException;
      throw x;
    }
  }
  var suspendedThenable = null;
  function getSuspendedThenable() {
    if (null === suspendedThenable) throw Error(formatProdErrorMessage(459));
    var thenable = suspendedThenable;
    suspendedThenable = null;
    return thenable;
  }
  function checkIfUseWrappedInAsyncCatch(rejectedReason) {
    if (rejectedReason === SuspenseException || rejectedReason === SuspenseActionException)
      throw Error(formatProdErrorMessage(483));
  }
  var thenableState$1 = null, thenableIndexCounter$1 = 0;
  function unwrapThenable(thenable) {
    var index2 = thenableIndexCounter$1;
    thenableIndexCounter$1 += 1;
    null === thenableState$1 && (thenableState$1 = []);
    return trackUsedThenable(thenableState$1, thenable, index2);
  }
  function coerceRef(workInProgress2, element) {
    element = element.props.ref;
    workInProgress2.ref = void 0 !== element ? element : null;
  }
  function throwOnInvalidObjectTypeImpl(returnFiber, newChild) {
    if (newChild.$$typeof === REACT_LEGACY_ELEMENT_TYPE)
      throw Error(formatProdErrorMessage(525));
    returnFiber = Object.prototype.toString.call(newChild);
    throw Error(
      formatProdErrorMessage(
        31,
        "[object Object]" === returnFiber ? "object with keys {" + Object.keys(newChild).join(", ") + "}" : returnFiber
      )
    );
  }
  function createChildReconciler(shouldTrackSideEffects) {
    function deleteChild(returnFiber, childToDelete) {
      if (shouldTrackSideEffects) {
        var deletions = returnFiber.deletions;
        null === deletions ? (returnFiber.deletions = [childToDelete], returnFiber.flags |= 16) : deletions.push(childToDelete);
      }
    }
    function deleteRemainingChildren(returnFiber, currentFirstChild) {
      if (!shouldTrackSideEffects) return null;
      for (; null !== currentFirstChild; )
        deleteChild(returnFiber, currentFirstChild), currentFirstChild = currentFirstChild.sibling;
      return null;
    }
    function mapRemainingChildren(currentFirstChild) {
      for (var existingChildren = /* @__PURE__ */ new Map(); null !== currentFirstChild; )
        null !== currentFirstChild.key ? existingChildren.set(currentFirstChild.key, currentFirstChild) : existingChildren.set(currentFirstChild.index, currentFirstChild), currentFirstChild = currentFirstChild.sibling;
      return existingChildren;
    }
    function useFiber(fiber, pendingProps) {
      fiber = createWorkInProgress(fiber, pendingProps);
      fiber.index = 0;
      fiber.sibling = null;
      return fiber;
    }
    function placeChild(newFiber, lastPlacedIndex, newIndex) {
      newFiber.index = newIndex;
      if (!shouldTrackSideEffects)
        return newFiber.flags |= 1048576, lastPlacedIndex;
      newIndex = newFiber.alternate;
      if (null !== newIndex)
        return newIndex = newIndex.index, newIndex < lastPlacedIndex ? (newFiber.flags |= 67108866, lastPlacedIndex) : newIndex;
      newFiber.flags |= 67108866;
      return lastPlacedIndex;
    }
    function placeSingleChild(newFiber) {
      shouldTrackSideEffects && null === newFiber.alternate && (newFiber.flags |= 67108866);
      return newFiber;
    }
    function updateTextNode(returnFiber, current, textContent, lanes) {
      if (null === current || 6 !== current.tag)
        return current = createFiberFromText(textContent, returnFiber.mode, lanes), current.return = returnFiber, current;
      current = useFiber(current, textContent);
      current.return = returnFiber;
      return current;
    }
    function updateElement(returnFiber, current, element, lanes) {
      var elementType = element.type;
      if (elementType === REACT_FRAGMENT_TYPE)
        return updateFragment(
          returnFiber,
          current,
          element.props.children,
          lanes,
          element.key
        );
      if (null !== current && (current.elementType === elementType || "object" === typeof elementType && null !== elementType && elementType.$$typeof === REACT_LAZY_TYPE && resolveLazy(elementType) === current.type))
        return current = useFiber(current, element.props), coerceRef(current, element), current.return = returnFiber, current;
      current = createFiberFromTypeAndProps(
        element.type,
        element.key,
        element.props,
        null,
        returnFiber.mode,
        lanes
      );
      coerceRef(current, element);
      current.return = returnFiber;
      return current;
    }
    function updatePortal(returnFiber, current, portal, lanes) {
      if (null === current || 4 !== current.tag || current.stateNode.containerInfo !== portal.containerInfo || current.stateNode.implementation !== portal.implementation)
        return current = createFiberFromPortal(portal, returnFiber.mode, lanes), current.return = returnFiber, current;
      current = useFiber(current, portal.children || []);
      current.return = returnFiber;
      return current;
    }
    function updateFragment(returnFiber, current, fragment, lanes, key) {
      if (null === current || 7 !== current.tag)
        return current = createFiberFromFragment(
          fragment,
          returnFiber.mode,
          lanes,
          key
        ), current.return = returnFiber, current;
      current = useFiber(current, fragment);
      current.return = returnFiber;
      return current;
    }
    function createChild(returnFiber, newChild, lanes) {
      if ("string" === typeof newChild && "" !== newChild || "number" === typeof newChild || "bigint" === typeof newChild)
        return newChild = createFiberFromText(
          "" + newChild,
          returnFiber.mode,
          lanes
        ), newChild.return = returnFiber, newChild;
      if ("object" === typeof newChild && null !== newChild) {
        switch (newChild.$$typeof) {
          case REACT_ELEMENT_TYPE:
            return lanes = createFiberFromTypeAndProps(
              newChild.type,
              newChild.key,
              newChild.props,
              null,
              returnFiber.mode,
              lanes
            ), coerceRef(lanes, newChild), lanes.return = returnFiber, lanes;
          case REACT_PORTAL_TYPE:
            return newChild = createFiberFromPortal(
              newChild,
              returnFiber.mode,
              lanes
            ), newChild.return = returnFiber, newChild;
          case REACT_LAZY_TYPE:
            return newChild = resolveLazy(newChild), createChild(returnFiber, newChild, lanes);
        }
        if (isArrayImpl(newChild) || getIteratorFn(newChild))
          return newChild = createFiberFromFragment(
            newChild,
            returnFiber.mode,
            lanes,
            null
          ), newChild.return = returnFiber, newChild;
        if ("function" === typeof newChild.then)
          return createChild(returnFiber, unwrapThenable(newChild), lanes);
        if (newChild.$$typeof === REACT_CONTEXT_TYPE)
          return createChild(
            returnFiber,
            readContextDuringReconciliation(returnFiber, newChild),
            lanes
          );
        throwOnInvalidObjectTypeImpl(returnFiber, newChild);
      }
      return null;
    }
    function updateSlot(returnFiber, oldFiber, newChild, lanes) {
      var key = null !== oldFiber ? oldFiber.key : null;
      if ("string" === typeof newChild && "" !== newChild || "number" === typeof newChild || "bigint" === typeof newChild)
        return null !== key ? null : updateTextNode(returnFiber, oldFiber, "" + newChild, lanes);
      if ("object" === typeof newChild && null !== newChild) {
        switch (newChild.$$typeof) {
          case REACT_ELEMENT_TYPE:
            return newChild.key === key ? updateElement(returnFiber, oldFiber, newChild, lanes) : null;
          case REACT_PORTAL_TYPE:
            return newChild.key === key ? updatePortal(returnFiber, oldFiber, newChild, lanes) : null;
          case REACT_LAZY_TYPE:
            return newChild = resolveLazy(newChild), updateSlot(returnFiber, oldFiber, newChild, lanes);
        }
        if (isArrayImpl(newChild) || getIteratorFn(newChild))
          return null !== key ? null : updateFragment(returnFiber, oldFiber, newChild, lanes, null);
        if ("function" === typeof newChild.then)
          return updateSlot(
            returnFiber,
            oldFiber,
            unwrapThenable(newChild),
            lanes
          );
        if (newChild.$$typeof === REACT_CONTEXT_TYPE)
          return updateSlot(
            returnFiber,
            oldFiber,
            readContextDuringReconciliation(returnFiber, newChild),
            lanes
          );
        throwOnInvalidObjectTypeImpl(returnFiber, newChild);
      }
      return null;
    }
    function updateFromMap(existingChildren, returnFiber, newIdx, newChild, lanes) {
      if ("string" === typeof newChild && "" !== newChild || "number" === typeof newChild || "bigint" === typeof newChild)
        return existingChildren = existingChildren.get(newIdx) || null, updateTextNode(returnFiber, existingChildren, "" + newChild, lanes);
      if ("object" === typeof newChild && null !== newChild) {
        switch (newChild.$$typeof) {
          case REACT_ELEMENT_TYPE:
            return existingChildren = existingChildren.get(
              null === newChild.key ? newIdx : newChild.key
            ) || null, updateElement(returnFiber, existingChildren, newChild, lanes);
          case REACT_PORTAL_TYPE:
            return existingChildren = existingChildren.get(
              null === newChild.key ? newIdx : newChild.key
            ) || null, updatePortal(returnFiber, existingChildren, newChild, lanes);
          case REACT_LAZY_TYPE:
            return newChild = resolveLazy(newChild), updateFromMap(
              existingChildren,
              returnFiber,
              newIdx,
              newChild,
              lanes
            );
        }
        if (isArrayImpl(newChild) || getIteratorFn(newChild))
          return existingChildren = existingChildren.get(newIdx) || null, updateFragment(returnFiber, existingChildren, newChild, lanes, null);
        if ("function" === typeof newChild.then)
          return updateFromMap(
            existingChildren,
            returnFiber,
            newIdx,
            unwrapThenable(newChild),
            lanes
          );
        if (newChild.$$typeof === REACT_CONTEXT_TYPE)
          return updateFromMap(
            existingChildren,
            returnFiber,
            newIdx,
            readContextDuringReconciliation(returnFiber, newChild),
            lanes
          );
        throwOnInvalidObjectTypeImpl(returnFiber, newChild);
      }
      return null;
    }
    function reconcileChildrenArray(returnFiber, currentFirstChild, newChildren, lanes) {
      for (var resultingFirstChild = null, previousNewFiber = null, oldFiber = currentFirstChild, newIdx = currentFirstChild = 0, nextOldFiber = null; null !== oldFiber && newIdx < newChildren.length; newIdx++) {
        oldFiber.index > newIdx ? (nextOldFiber = oldFiber, oldFiber = null) : nextOldFiber = oldFiber.sibling;
        var newFiber = updateSlot(
          returnFiber,
          oldFiber,
          newChildren[newIdx],
          lanes
        );
        if (null === newFiber) {
          null === oldFiber && (oldFiber = nextOldFiber);
          break;
        }
        shouldTrackSideEffects && oldFiber && null === newFiber.alternate && deleteChild(returnFiber, oldFiber);
        currentFirstChild = placeChild(newFiber, currentFirstChild, newIdx);
        null === previousNewFiber ? resultingFirstChild = newFiber : previousNewFiber.sibling = newFiber;
        previousNewFiber = newFiber;
        oldFiber = nextOldFiber;
      }
      if (newIdx === newChildren.length)
        return deleteRemainingChildren(returnFiber, oldFiber), isHydrating && pushTreeFork(returnFiber, newIdx), resultingFirstChild;
      if (null === oldFiber) {
        for (; newIdx < newChildren.length; newIdx++)
          oldFiber = createChild(returnFiber, newChildren[newIdx], lanes), null !== oldFiber && (currentFirstChild = placeChild(
            oldFiber,
            currentFirstChild,
            newIdx
          ), null === previousNewFiber ? resultingFirstChild = oldFiber : previousNewFiber.sibling = oldFiber, previousNewFiber = oldFiber);
        isHydrating && pushTreeFork(returnFiber, newIdx);
        return resultingFirstChild;
      }
      for (oldFiber = mapRemainingChildren(oldFiber); newIdx < newChildren.length; newIdx++)
        nextOldFiber = updateFromMap(
          oldFiber,
          returnFiber,
          newIdx,
          newChildren[newIdx],
          lanes
        ), null !== nextOldFiber && (shouldTrackSideEffects && null !== nextOldFiber.alternate && oldFiber.delete(
          null === nextOldFiber.key ? newIdx : nextOldFiber.key
        ), currentFirstChild = placeChild(
          nextOldFiber,
          currentFirstChild,
          newIdx
        ), null === previousNewFiber ? resultingFirstChild = nextOldFiber : previousNewFiber.sibling = nextOldFiber, previousNewFiber = nextOldFiber);
      shouldTrackSideEffects && oldFiber.forEach(function(child) {
        return deleteChild(returnFiber, child);
      });
      isHydrating && pushTreeFork(returnFiber, newIdx);
      return resultingFirstChild;
    }
    function reconcileChildrenIterator(returnFiber, currentFirstChild, newChildren, lanes) {
      if (null == newChildren) throw Error(formatProdErrorMessage(151));
      for (var resultingFirstChild = null, previousNewFiber = null, oldFiber = currentFirstChild, newIdx = currentFirstChild = 0, nextOldFiber = null, step = newChildren.next(); null !== oldFiber && !step.done; newIdx++, step = newChildren.next()) {
        oldFiber.index > newIdx ? (nextOldFiber = oldFiber, oldFiber = null) : nextOldFiber = oldFiber.sibling;
        var newFiber = updateSlot(returnFiber, oldFiber, step.value, lanes);
        if (null === newFiber) {
          null === oldFiber && (oldFiber = nextOldFiber);
          break;
        }
        shouldTrackSideEffects && oldFiber && null === newFiber.alternate && deleteChild(returnFiber, oldFiber);
        currentFirstChild = placeChild(newFiber, currentFirstChild, newIdx);
        null === previousNewFiber ? resultingFirstChild = newFiber : previousNewFiber.sibling = newFiber;
        previousNewFiber = newFiber;
        oldFiber = nextOldFiber;
      }
      if (step.done)
        return deleteRemainingChildren(returnFiber, oldFiber), isHydrating && pushTreeFork(returnFiber, newIdx), resultingFirstChild;
      if (null === oldFiber) {
        for (; !step.done; newIdx++, step = newChildren.next())
          step = createChild(returnFiber, step.value, lanes), null !== step && (currentFirstChild = placeChild(step, currentFirstChild, newIdx), null === previousNewFiber ? resultingFirstChild = step : previousNewFiber.sibling = step, previousNewFiber = step);
        isHydrating && pushTreeFork(returnFiber, newIdx);
        return resultingFirstChild;
      }
      for (oldFiber = mapRemainingChildren(oldFiber); !step.done; newIdx++, step = newChildren.next())
        step = updateFromMap(oldFiber, returnFiber, newIdx, step.value, lanes), null !== step && (shouldTrackSideEffects && null !== step.alternate && oldFiber.delete(null === step.key ? newIdx : step.key), currentFirstChild = placeChild(step, currentFirstChild, newIdx), null === previousNewFiber ? resultingFirstChild = step : previousNewFiber.sibling = step, previousNewFiber = step);
      shouldTrackSideEffects && oldFiber.forEach(function(child) {
        return deleteChild(returnFiber, child);
      });
      isHydrating && pushTreeFork(returnFiber, newIdx);
      return resultingFirstChild;
    }
    function reconcileChildFibersImpl(returnFiber, currentFirstChild, newChild, lanes) {
      "object" === typeof newChild && null !== newChild && newChild.type === REACT_FRAGMENT_TYPE && null === newChild.key && (newChild = newChild.props.children);
      if ("object" === typeof newChild && null !== newChild) {
        switch (newChild.$$typeof) {
          case REACT_ELEMENT_TYPE:
            a: {
              for (var key = newChild.key; null !== currentFirstChild; ) {
                if (currentFirstChild.key === key) {
                  key = newChild.type;
                  if (key === REACT_FRAGMENT_TYPE) {
                    if (7 === currentFirstChild.tag) {
                      deleteRemainingChildren(
                        returnFiber,
                        currentFirstChild.sibling
                      );
                      lanes = useFiber(
                        currentFirstChild,
                        newChild.props.children
                      );
                      lanes.return = returnFiber;
                      returnFiber = lanes;
                      break a;
                    }
                  } else if (currentFirstChild.elementType === key || "object" === typeof key && null !== key && key.$$typeof === REACT_LAZY_TYPE && resolveLazy(key) === currentFirstChild.type) {
                    deleteRemainingChildren(
                      returnFiber,
                      currentFirstChild.sibling
                    );
                    lanes = useFiber(currentFirstChild, newChild.props);
                    coerceRef(lanes, newChild);
                    lanes.return = returnFiber;
                    returnFiber = lanes;
                    break a;
                  }
                  deleteRemainingChildren(returnFiber, currentFirstChild);
                  break;
                } else deleteChild(returnFiber, currentFirstChild);
                currentFirstChild = currentFirstChild.sibling;
              }
              newChild.type === REACT_FRAGMENT_TYPE ? (lanes = createFiberFromFragment(
                newChild.props.children,
                returnFiber.mode,
                lanes,
                newChild.key
              ), lanes.return = returnFiber, returnFiber = lanes) : (lanes = createFiberFromTypeAndProps(
                newChild.type,
                newChild.key,
                newChild.props,
                null,
                returnFiber.mode,
                lanes
              ), coerceRef(lanes, newChild), lanes.return = returnFiber, returnFiber = lanes);
            }
            return placeSingleChild(returnFiber);
          case REACT_PORTAL_TYPE:
            a: {
              for (key = newChild.key; null !== currentFirstChild; ) {
                if (currentFirstChild.key === key)
                  if (4 === currentFirstChild.tag && currentFirstChild.stateNode.containerInfo === newChild.containerInfo && currentFirstChild.stateNode.implementation === newChild.implementation) {
                    deleteRemainingChildren(
                      returnFiber,
                      currentFirstChild.sibling
                    );
                    lanes = useFiber(currentFirstChild, newChild.children || []);
                    lanes.return = returnFiber;
                    returnFiber = lanes;
                    break a;
                  } else {
                    deleteRemainingChildren(returnFiber, currentFirstChild);
                    break;
                  }
                else deleteChild(returnFiber, currentFirstChild);
                currentFirstChild = currentFirstChild.sibling;
              }
              lanes = createFiberFromPortal(newChild, returnFiber.mode, lanes);
              lanes.return = returnFiber;
              returnFiber = lanes;
            }
            return placeSingleChild(returnFiber);
          case REACT_LAZY_TYPE:
            return newChild = resolveLazy(newChild), reconcileChildFibersImpl(
              returnFiber,
              currentFirstChild,
              newChild,
              lanes
            );
        }
        if (isArrayImpl(newChild))
          return reconcileChildrenArray(
            returnFiber,
            currentFirstChild,
            newChild,
            lanes
          );
        if (getIteratorFn(newChild)) {
          key = getIteratorFn(newChild);
          if ("function" !== typeof key) throw Error(formatProdErrorMessage(150));
          newChild = key.call(newChild);
          return reconcileChildrenIterator(
            returnFiber,
            currentFirstChild,
            newChild,
            lanes
          );
        }
        if ("function" === typeof newChild.then)
          return reconcileChildFibersImpl(
            returnFiber,
            currentFirstChild,
            unwrapThenable(newChild),
            lanes
          );
        if (newChild.$$typeof === REACT_CONTEXT_TYPE)
          return reconcileChildFibersImpl(
            returnFiber,
            currentFirstChild,
            readContextDuringReconciliation(returnFiber, newChild),
            lanes
          );
        throwOnInvalidObjectTypeImpl(returnFiber, newChild);
      }
      return "string" === typeof newChild && "" !== newChild || "number" === typeof newChild || "bigint" === typeof newChild ? (newChild = "" + newChild, null !== currentFirstChild && 6 === currentFirstChild.tag ? (deleteRemainingChildren(returnFiber, currentFirstChild.sibling), lanes = useFiber(currentFirstChild, newChild), lanes.return = returnFiber, returnFiber = lanes) : (deleteRemainingChildren(returnFiber, currentFirstChild), lanes = createFiberFromText(newChild, returnFiber.mode, lanes), lanes.return = returnFiber, returnFiber = lanes), placeSingleChild(returnFiber)) : deleteRemainingChildren(returnFiber, currentFirstChild);
    }
    return function(returnFiber, currentFirstChild, newChild, lanes) {
      try {
        thenableIndexCounter$1 = 0;
        var firstChildFiber = reconcileChildFibersImpl(
          returnFiber,
          currentFirstChild,
          newChild,
          lanes
        );
        thenableState$1 = null;
        return firstChildFiber;
      } catch (x) {
        if (x === SuspenseException || x === SuspenseActionException) throw x;
        var fiber = createFiberImplClass(29, x, null, returnFiber.mode);
        fiber.lanes = lanes;
        fiber.return = returnFiber;
        return fiber;
      } finally {
      }
    };
  }
  var reconcileChildFibers = createChildReconciler(true), mountChildFibers = createChildReconciler(false), hasForceUpdate = false;
  function initializeUpdateQueue(fiber) {
    fiber.updateQueue = {
      baseState: fiber.memoizedState,
      firstBaseUpdate: null,
      lastBaseUpdate: null,
      shared: { pending: null, lanes: 0, hiddenCallbacks: null },
      callbacks: null
    };
  }
  function cloneUpdateQueue(current, workInProgress2) {
    current = current.updateQueue;
    workInProgress2.updateQueue === current && (workInProgress2.updateQueue = {
      baseState: current.baseState,
      firstBaseUpdate: current.firstBaseUpdate,
      lastBaseUpdate: current.lastBaseUpdate,
      shared: current.shared,
      callbacks: null
    });
  }
  function createUpdate(lane) {
    return { lane, tag: 0, payload: null, callback: null, next: null };
  }
  function enqueueUpdate(fiber, update, lane) {
    var updateQueue = fiber.updateQueue;
    if (null === updateQueue) return null;
    updateQueue = updateQueue.shared;
    if (0 !== (executionContext & 2)) {
      var pending = updateQueue.pending;
      null === pending ? update.next = update : (update.next = pending.next, pending.next = update);
      updateQueue.pending = update;
      update = getRootForUpdatedFiber(fiber);
      markUpdateLaneFromFiberToRoot(fiber, null, lane);
      return update;
    }
    enqueueUpdate$1(fiber, updateQueue, update, lane);
    return getRootForUpdatedFiber(fiber);
  }
  function entangleTransitions(root2, fiber, lane) {
    fiber = fiber.updateQueue;
    if (null !== fiber && (fiber = fiber.shared, 0 !== (lane & 4194048))) {
      var queueLanes = fiber.lanes;
      queueLanes &= root2.pendingLanes;
      lane |= queueLanes;
      fiber.lanes = lane;
      markRootEntangled(root2, lane);
    }
  }
  function enqueueCapturedUpdate(workInProgress2, capturedUpdate) {
    var queue = workInProgress2.updateQueue, current = workInProgress2.alternate;
    if (null !== current && (current = current.updateQueue, queue === current)) {
      var newFirst = null, newLast = null;
      queue = queue.firstBaseUpdate;
      if (null !== queue) {
        do {
          var clone = {
            lane: queue.lane,
            tag: queue.tag,
            payload: queue.payload,
            callback: null,
            next: null
          };
          null === newLast ? newFirst = newLast = clone : newLast = newLast.next = clone;
          queue = queue.next;
        } while (null !== queue);
        null === newLast ? newFirst = newLast = capturedUpdate : newLast = newLast.next = capturedUpdate;
      } else newFirst = newLast = capturedUpdate;
      queue = {
        baseState: current.baseState,
        firstBaseUpdate: newFirst,
        lastBaseUpdate: newLast,
        shared: current.shared,
        callbacks: current.callbacks
      };
      workInProgress2.updateQueue = queue;
      return;
    }
    workInProgress2 = queue.lastBaseUpdate;
    null === workInProgress2 ? queue.firstBaseUpdate = capturedUpdate : workInProgress2.next = capturedUpdate;
    queue.lastBaseUpdate = capturedUpdate;
  }
  var didReadFromEntangledAsyncAction = false;
  function suspendIfUpdateReadFromEntangledAsyncAction() {
    if (didReadFromEntangledAsyncAction) {
      var entangledActionThenable = currentEntangledActionThenable;
      if (null !== entangledActionThenable) throw entangledActionThenable;
    }
  }
  function processUpdateQueue(workInProgress$jscomp$0, props, instance$jscomp$0, renderLanes2) {
    didReadFromEntangledAsyncAction = false;
    var queue = workInProgress$jscomp$0.updateQueue;
    hasForceUpdate = false;
    var firstBaseUpdate = queue.firstBaseUpdate, lastBaseUpdate = queue.lastBaseUpdate, pendingQueue = queue.shared.pending;
    if (null !== pendingQueue) {
      queue.shared.pending = null;
      var lastPendingUpdate = pendingQueue, firstPendingUpdate = lastPendingUpdate.next;
      lastPendingUpdate.next = null;
      null === lastBaseUpdate ? firstBaseUpdate = firstPendingUpdate : lastBaseUpdate.next = firstPendingUpdate;
      lastBaseUpdate = lastPendingUpdate;
      var current = workInProgress$jscomp$0.alternate;
      null !== current && (current = current.updateQueue, pendingQueue = current.lastBaseUpdate, pendingQueue !== lastBaseUpdate && (null === pendingQueue ? current.firstBaseUpdate = firstPendingUpdate : pendingQueue.next = firstPendingUpdate, current.lastBaseUpdate = lastPendingUpdate));
    }
    if (null !== firstBaseUpdate) {
      var newState = queue.baseState;
      lastBaseUpdate = 0;
      current = firstPendingUpdate = lastPendingUpdate = null;
      pendingQueue = firstBaseUpdate;
      do {
        var updateLane = pendingQueue.lane & -536870913, isHiddenUpdate = updateLane !== pendingQueue.lane;
        if (isHiddenUpdate ? (workInProgressRootRenderLanes & updateLane) === updateLane : (renderLanes2 & updateLane) === updateLane) {
          0 !== updateLane && updateLane === currentEntangledLane && (didReadFromEntangledAsyncAction = true);
          null !== current && (current = current.next = {
            lane: 0,
            tag: pendingQueue.tag,
            payload: pendingQueue.payload,
            callback: null,
            next: null
          });
          a: {
            var workInProgress2 = workInProgress$jscomp$0, update = pendingQueue;
            updateLane = props;
            var instance = instance$jscomp$0;
            switch (update.tag) {
              case 1:
                workInProgress2 = update.payload;
                if ("function" === typeof workInProgress2) {
                  newState = workInProgress2.call(instance, newState, updateLane);
                  break a;
                }
                newState = workInProgress2;
                break a;
              case 3:
                workInProgress2.flags = workInProgress2.flags & -65537 | 128;
              case 0:
                workInProgress2 = update.payload;
                updateLane = "function" === typeof workInProgress2 ? workInProgress2.call(instance, newState, updateLane) : workInProgress2;
                if (null === updateLane || void 0 === updateLane) break a;
                newState = assign({}, newState, updateLane);
                break a;
              case 2:
                hasForceUpdate = true;
            }
          }
          updateLane = pendingQueue.callback;
          null !== updateLane && (workInProgress$jscomp$0.flags |= 64, isHiddenUpdate && (workInProgress$jscomp$0.flags |= 8192), isHiddenUpdate = queue.callbacks, null === isHiddenUpdate ? queue.callbacks = [updateLane] : isHiddenUpdate.push(updateLane));
        } else
          isHiddenUpdate = {
            lane: updateLane,
            tag: pendingQueue.tag,
            payload: pendingQueue.payload,
            callback: pendingQueue.callback,
            next: null
          }, null === current ? (firstPendingUpdate = current = isHiddenUpdate, lastPendingUpdate = newState) : current = current.next = isHiddenUpdate, lastBaseUpdate |= updateLane;
        pendingQueue = pendingQueue.next;
        if (null === pendingQueue)
          if (pendingQueue = queue.shared.pending, null === pendingQueue)
            break;
          else
            isHiddenUpdate = pendingQueue, pendingQueue = isHiddenUpdate.next, isHiddenUpdate.next = null, queue.lastBaseUpdate = isHiddenUpdate, queue.shared.pending = null;
      } while (1);
      null === current && (lastPendingUpdate = newState);
      queue.baseState = lastPendingUpdate;
      queue.firstBaseUpdate = firstPendingUpdate;
      queue.lastBaseUpdate = current;
      null === firstBaseUpdate && (queue.shared.lanes = 0);
      workInProgressRootSkippedLanes |= lastBaseUpdate;
      workInProgress$jscomp$0.lanes = lastBaseUpdate;
      workInProgress$jscomp$0.memoizedState = newState;
    }
  }
  function callCallback(callback, context) {
    if ("function" !== typeof callback)
      throw Error(formatProdErrorMessage(191, callback));
    callback.call(context);
  }
  function commitCallbacks(updateQueue, context) {
    var callbacks = updateQueue.callbacks;
    if (null !== callbacks)
      for (updateQueue.callbacks = null, updateQueue = 0; updateQueue < callbacks.length; updateQueue++)
        callCallback(callbacks[updateQueue], context);
  }
  var currentTreeHiddenStackCursor = createCursor(null), prevEntangledRenderLanesCursor = createCursor(0);
  function pushHiddenContext(fiber, context) {
    fiber = entangledRenderLanes;
    push(prevEntangledRenderLanesCursor, fiber);
    push(currentTreeHiddenStackCursor, context);
    entangledRenderLanes = fiber | context.baseLanes;
  }
  function reuseHiddenContextOnStack() {
    push(prevEntangledRenderLanesCursor, entangledRenderLanes);
    push(currentTreeHiddenStackCursor, currentTreeHiddenStackCursor.current);
  }
  function popHiddenContext() {
    entangledRenderLanes = prevEntangledRenderLanesCursor.current;
    pop(currentTreeHiddenStackCursor);
    pop(prevEntangledRenderLanesCursor);
  }
  var suspenseHandlerStackCursor = createCursor(null), shellBoundary = null;
  function pushPrimaryTreeSuspenseHandler(handler) {
    var current = handler.alternate;
    push(suspenseStackCursor, suspenseStackCursor.current & 1);
    push(suspenseHandlerStackCursor, handler);
    null === shellBoundary && (null === current || null !== currentTreeHiddenStackCursor.current ? shellBoundary = handler : null !== current.memoizedState && (shellBoundary = handler));
  }
  function pushDehydratedActivitySuspenseHandler(fiber) {
    push(suspenseStackCursor, suspenseStackCursor.current);
    push(suspenseHandlerStackCursor, fiber);
    null === shellBoundary && (shellBoundary = fiber);
  }
  function pushOffscreenSuspenseHandler(fiber) {
    22 === fiber.tag ? (push(suspenseStackCursor, suspenseStackCursor.current), push(suspenseHandlerStackCursor, fiber), null === shellBoundary && (shellBoundary = fiber)) : reuseSuspenseHandlerOnStack();
  }
  function reuseSuspenseHandlerOnStack() {
    push(suspenseStackCursor, suspenseStackCursor.current);
    push(suspenseHandlerStackCursor, suspenseHandlerStackCursor.current);
  }
  function popSuspenseHandler(fiber) {
    pop(suspenseHandlerStackCursor);
    shellBoundary === fiber && (shellBoundary = null);
    pop(suspenseStackCursor);
  }
  var suspenseStackCursor = createCursor(0);
  function findFirstSuspended(row) {
    for (var node = row; null !== node; ) {
      if (13 === node.tag) {
        var state = node.memoizedState;
        if (null !== state && (state = state.dehydrated, null === state || isSuspenseInstancePending(state) || isSuspenseInstanceFallback(state)))
          return node;
      } else if (19 === node.tag && ("forwards" === node.memoizedProps.revealOrder || "backwards" === node.memoizedProps.revealOrder || "unstable_legacy-backwards" === node.memoizedProps.revealOrder || "together" === node.memoizedProps.revealOrder)) {
        if (0 !== (node.flags & 128)) return node;
      } else if (null !== node.child) {
        node.child.return = node;
        node = node.child;
        continue;
      }
      if (node === row) break;
      for (; null === node.sibling; ) {
        if (null === node.return || node.return === row) return null;
        node = node.return;
      }
      node.sibling.return = node.return;
      node = node.sibling;
    }
    return null;
  }
  var renderLanes = 0, currentlyRenderingFiber = null, currentHook = null, workInProgressHook = null, didScheduleRenderPhaseUpdate = false, didScheduleRenderPhaseUpdateDuringThisPass = false, shouldDoubleInvokeUserFnsInHooksDEV = false, localIdCounter = 0, thenableIndexCounter = 0, thenableState = null, globalClientIdCounter = 0;
  function throwInvalidHookError() {
    throw Error(formatProdErrorMessage(321));
  }
  function areHookInputsEqual(nextDeps, prevDeps) {
    if (null === prevDeps) return false;
    for (var i = 0; i < prevDeps.length && i < nextDeps.length; i++)
      if (!objectIs(nextDeps[i], prevDeps[i])) return false;
    return true;
  }
  function renderWithHooks(current, workInProgress2, Component, props, secondArg, nextRenderLanes) {
    renderLanes = nextRenderLanes;
    currentlyRenderingFiber = workInProgress2;
    workInProgress2.memoizedState = null;
    workInProgress2.updateQueue = null;
    workInProgress2.lanes = 0;
    ReactSharedInternals.H = null === current || null === current.memoizedState ? HooksDispatcherOnMount : HooksDispatcherOnUpdate;
    shouldDoubleInvokeUserFnsInHooksDEV = false;
    nextRenderLanes = Component(props, secondArg);
    shouldDoubleInvokeUserFnsInHooksDEV = false;
    didScheduleRenderPhaseUpdateDuringThisPass && (nextRenderLanes = renderWithHooksAgain(
      workInProgress2,
      Component,
      props,
      secondArg
    ));
    finishRenderingHooks(current);
    return nextRenderLanes;
  }
  function finishRenderingHooks(current) {
    ReactSharedInternals.H = ContextOnlyDispatcher;
    var didRenderTooFewHooks = null !== currentHook && null !== currentHook.next;
    renderLanes = 0;
    workInProgressHook = currentHook = currentlyRenderingFiber = null;
    didScheduleRenderPhaseUpdate = false;
    thenableIndexCounter = 0;
    thenableState = null;
    if (didRenderTooFewHooks) throw Error(formatProdErrorMessage(300));
    null === current || didReceiveUpdate || (current = current.dependencies, null !== current && checkIfContextChanged(current) && (didReceiveUpdate = true));
  }
  function renderWithHooksAgain(workInProgress2, Component, props, secondArg) {
    currentlyRenderingFiber = workInProgress2;
    var numberOfReRenders = 0;
    do {
      didScheduleRenderPhaseUpdateDuringThisPass && (thenableState = null);
      thenableIndexCounter = 0;
      didScheduleRenderPhaseUpdateDuringThisPass = false;
      if (25 <= numberOfReRenders) throw Error(formatProdErrorMessage(301));
      numberOfReRenders += 1;
      workInProgressHook = currentHook = null;
      if (null != workInProgress2.updateQueue) {
        var children = workInProgress2.updateQueue;
        children.lastEffect = null;
        children.events = null;
        children.stores = null;
        null != children.memoCache && (children.memoCache.index = 0);
      }
      ReactSharedInternals.H = HooksDispatcherOnRerender;
      children = Component(props, secondArg);
    } while (didScheduleRenderPhaseUpdateDuringThisPass);
    return children;
  }
  function TransitionAwareHostComponent() {
    var dispatcher = ReactSharedInternals.H, maybeThenable = dispatcher.useState()[0];
    maybeThenable = "function" === typeof maybeThenable.then ? useThenable(maybeThenable) : maybeThenable;
    dispatcher = dispatcher.useState()[0];
    (null !== currentHook ? currentHook.memoizedState : null) !== dispatcher && (currentlyRenderingFiber.flags |= 1024);
    return maybeThenable;
  }
  function checkDidRenderIdHook() {
    var didRenderIdHook = 0 !== localIdCounter;
    localIdCounter = 0;
    return didRenderIdHook;
  }
  function bailoutHooks(current, workInProgress2, lanes) {
    workInProgress2.updateQueue = current.updateQueue;
    workInProgress2.flags &= -2053;
    current.lanes &= ~lanes;
  }
  function resetHooksOnUnwind(workInProgress2) {
    if (didScheduleRenderPhaseUpdate) {
      for (workInProgress2 = workInProgress2.memoizedState; null !== workInProgress2; ) {
        var queue = workInProgress2.queue;
        null !== queue && (queue.pending = null);
        workInProgress2 = workInProgress2.next;
      }
      didScheduleRenderPhaseUpdate = false;
    }
    renderLanes = 0;
    workInProgressHook = currentHook = currentlyRenderingFiber = null;
    didScheduleRenderPhaseUpdateDuringThisPass = false;
    thenableIndexCounter = localIdCounter = 0;
    thenableState = null;
  }
  function mountWorkInProgressHook() {
    var hook = {
      memoizedState: null,
      baseState: null,
      baseQueue: null,
      queue: null,
      next: null
    };
    null === workInProgressHook ? currentlyRenderingFiber.memoizedState = workInProgressHook = hook : workInProgressHook = workInProgressHook.next = hook;
    return workInProgressHook;
  }
  function updateWorkInProgressHook() {
    if (null === currentHook) {
      var nextCurrentHook = currentlyRenderingFiber.alternate;
      nextCurrentHook = null !== nextCurrentHook ? nextCurrentHook.memoizedState : null;
    } else nextCurrentHook = currentHook.next;
    var nextWorkInProgressHook = null === workInProgressHook ? currentlyRenderingFiber.memoizedState : workInProgressHook.next;
    if (null !== nextWorkInProgressHook)
      workInProgressHook = nextWorkInProgressHook, currentHook = nextCurrentHook;
    else {
      if (null === nextCurrentHook) {
        if (null === currentlyRenderingFiber.alternate)
          throw Error(formatProdErrorMessage(467));
        throw Error(formatProdErrorMessage(310));
      }
      currentHook = nextCurrentHook;
      nextCurrentHook = {
        memoizedState: currentHook.memoizedState,
        baseState: currentHook.baseState,
        baseQueue: currentHook.baseQueue,
        queue: currentHook.queue,
        next: null
      };
      null === workInProgressHook ? currentlyRenderingFiber.memoizedState = workInProgressHook = nextCurrentHook : workInProgressHook = workInProgressHook.next = nextCurrentHook;
    }
    return workInProgressHook;
  }
  function createFunctionComponentUpdateQueue() {
    return { lastEffect: null, events: null, stores: null, memoCache: null };
  }
  function useThenable(thenable) {
    var index2 = thenableIndexCounter;
    thenableIndexCounter += 1;
    null === thenableState && (thenableState = []);
    thenable = trackUsedThenable(thenableState, thenable, index2);
    index2 = currentlyRenderingFiber;
    null === (null === workInProgressHook ? index2.memoizedState : workInProgressHook.next) && (index2 = index2.alternate, ReactSharedInternals.H = null === index2 || null === index2.memoizedState ? HooksDispatcherOnMount : HooksDispatcherOnUpdate);
    return thenable;
  }
  function use(usable) {
    if (null !== usable && "object" === typeof usable) {
      if ("function" === typeof usable.then) return useThenable(usable);
      if (usable.$$typeof === REACT_CONTEXT_TYPE) return readContext(usable);
    }
    throw Error(formatProdErrorMessage(438, String(usable)));
  }
  function useMemoCache(size) {
    var memoCache = null, updateQueue = currentlyRenderingFiber.updateQueue;
    null !== updateQueue && (memoCache = updateQueue.memoCache);
    if (null == memoCache) {
      var current = currentlyRenderingFiber.alternate;
      null !== current && (current = current.updateQueue, null !== current && (current = current.memoCache, null != current && (memoCache = {
        data: current.data.map(function(array) {
          return array.slice();
        }),
        index: 0
      })));
    }
    null == memoCache && (memoCache = { data: [], index: 0 });
    null === updateQueue && (updateQueue = createFunctionComponentUpdateQueue(), currentlyRenderingFiber.updateQueue = updateQueue);
    updateQueue.memoCache = memoCache;
    updateQueue = memoCache.data[memoCache.index];
    if (void 0 === updateQueue)
      for (updateQueue = memoCache.data[memoCache.index] = Array(size), current = 0; current < size; current++)
        updateQueue[current] = REACT_MEMO_CACHE_SENTINEL;
    memoCache.index++;
    return updateQueue;
  }
  function basicStateReducer(state, action) {
    return "function" === typeof action ? action(state) : action;
  }
  function updateReducer(reducer) {
    var hook = updateWorkInProgressHook();
    return updateReducerImpl(hook, currentHook, reducer);
  }
  function updateReducerImpl(hook, current, reducer) {
    var queue = hook.queue;
    if (null === queue) throw Error(formatProdErrorMessage(311));
    queue.lastRenderedReducer = reducer;
    var baseQueue = hook.baseQueue, pendingQueue = queue.pending;
    if (null !== pendingQueue) {
      if (null !== baseQueue) {
        var baseFirst = baseQueue.next;
        baseQueue.next = pendingQueue.next;
        pendingQueue.next = baseFirst;
      }
      current.baseQueue = baseQueue = pendingQueue;
      queue.pending = null;
    }
    pendingQueue = hook.baseState;
    if (null === baseQueue) hook.memoizedState = pendingQueue;
    else {
      current = baseQueue.next;
      var newBaseQueueFirst = baseFirst = null, newBaseQueueLast = null, update = current, didReadFromEntangledAsyncAction$60 = false;
      do {
        var updateLane = update.lane & -536870913;
        if (updateLane !== update.lane ? (workInProgressRootRenderLanes & updateLane) === updateLane : (renderLanes & updateLane) === updateLane) {
          var revertLane = update.revertLane;
          if (0 === revertLane)
            null !== newBaseQueueLast && (newBaseQueueLast = newBaseQueueLast.next = {
              lane: 0,
              revertLane: 0,
              gesture: null,
              action: update.action,
              hasEagerState: update.hasEagerState,
              eagerState: update.eagerState,
              next: null
            }), updateLane === currentEntangledLane && (didReadFromEntangledAsyncAction$60 = true);
          else if ((renderLanes & revertLane) === revertLane) {
            update = update.next;
            revertLane === currentEntangledLane && (didReadFromEntangledAsyncAction$60 = true);
            continue;
          } else
            updateLane = {
              lane: 0,
              revertLane: update.revertLane,
              gesture: null,
              action: update.action,
              hasEagerState: update.hasEagerState,
              eagerState: update.eagerState,
              next: null
            }, null === newBaseQueueLast ? (newBaseQueueFirst = newBaseQueueLast = updateLane, baseFirst = pendingQueue) : newBaseQueueLast = newBaseQueueLast.next = updateLane, currentlyRenderingFiber.lanes |= revertLane, workInProgressRootSkippedLanes |= revertLane;
          updateLane = update.action;
          shouldDoubleInvokeUserFnsInHooksDEV && reducer(pendingQueue, updateLane);
          pendingQueue = update.hasEagerState ? update.eagerState : reducer(pendingQueue, updateLane);
        } else
          revertLane = {
            lane: updateLane,
            revertLane: update.revertLane,
            gesture: update.gesture,
            action: update.action,
            hasEagerState: update.hasEagerState,
            eagerState: update.eagerState,
            next: null
          }, null === newBaseQueueLast ? (newBaseQueueFirst = newBaseQueueLast = revertLane, baseFirst = pendingQueue) : newBaseQueueLast = newBaseQueueLast.next = revertLane, currentlyRenderingFiber.lanes |= updateLane, workInProgressRootSkippedLanes |= updateLane;
        update = update.next;
      } while (null !== update && update !== current);
      null === newBaseQueueLast ? baseFirst = pendingQueue : newBaseQueueLast.next = newBaseQueueFirst;
      if (!objectIs(pendingQueue, hook.memoizedState) && (didReceiveUpdate = true, didReadFromEntangledAsyncAction$60 && (reducer = currentEntangledActionThenable, null !== reducer)))
        throw reducer;
      hook.memoizedState = pendingQueue;
      hook.baseState = baseFirst;
      hook.baseQueue = newBaseQueueLast;
      queue.lastRenderedState = pendingQueue;
    }
    null === baseQueue && (queue.lanes = 0);
    return [hook.memoizedState, queue.dispatch];
  }
  function rerenderReducer(reducer) {
    var hook = updateWorkInProgressHook(), queue = hook.queue;
    if (null === queue) throw Error(formatProdErrorMessage(311));
    queue.lastRenderedReducer = reducer;
    var dispatch = queue.dispatch, lastRenderPhaseUpdate = queue.pending, newState = hook.memoizedState;
    if (null !== lastRenderPhaseUpdate) {
      queue.pending = null;
      var update = lastRenderPhaseUpdate = lastRenderPhaseUpdate.next;
      do
        newState = reducer(newState, update.action), update = update.next;
      while (update !== lastRenderPhaseUpdate);
      objectIs(newState, hook.memoizedState) || (didReceiveUpdate = true);
      hook.memoizedState = newState;
      null === hook.baseQueue && (hook.baseState = newState);
      queue.lastRenderedState = newState;
    }
    return [newState, dispatch];
  }
  function updateSyncExternalStore(subscribe, getSnapshot, getServerSnapshot) {
    var fiber = currentlyRenderingFiber, hook = updateWorkInProgressHook(), isHydrating$jscomp$0 = isHydrating;
    if (isHydrating$jscomp$0) {
      if (void 0 === getServerSnapshot) throw Error(formatProdErrorMessage(407));
      getServerSnapshot = getServerSnapshot();
    } else getServerSnapshot = getSnapshot();
    var snapshotChanged = !objectIs(
      (currentHook || hook).memoizedState,
      getServerSnapshot
    );
    snapshotChanged && (hook.memoizedState = getServerSnapshot, didReceiveUpdate = true);
    hook = hook.queue;
    updateEffect(subscribeToStore.bind(null, fiber, hook, subscribe), [
      subscribe
    ]);
    if (hook.getSnapshot !== getSnapshot || snapshotChanged || null !== workInProgressHook && workInProgressHook.memoizedState.tag & 1) {
      fiber.flags |= 2048;
      pushSimpleEffect(
        9,
        { destroy: void 0 },
        updateStoreInstance.bind(
          null,
          fiber,
          hook,
          getServerSnapshot,
          getSnapshot
        ),
        null
      );
      if (null === workInProgressRoot) throw Error(formatProdErrorMessage(349));
      isHydrating$jscomp$0 || 0 !== (renderLanes & 127) || pushStoreConsistencyCheck(fiber, getSnapshot, getServerSnapshot);
    }
    return getServerSnapshot;
  }
  function pushStoreConsistencyCheck(fiber, getSnapshot, renderedSnapshot) {
    fiber.flags |= 16384;
    fiber = { getSnapshot, value: renderedSnapshot };
    getSnapshot = currentlyRenderingFiber.updateQueue;
    null === getSnapshot ? (getSnapshot = createFunctionComponentUpdateQueue(), currentlyRenderingFiber.updateQueue = getSnapshot, getSnapshot.stores = [fiber]) : (renderedSnapshot = getSnapshot.stores, null === renderedSnapshot ? getSnapshot.stores = [fiber] : renderedSnapshot.push(fiber));
  }
  function updateStoreInstance(fiber, inst, nextSnapshot, getSnapshot) {
    inst.value = nextSnapshot;
    inst.getSnapshot = getSnapshot;
    checkIfSnapshotChanged(inst) && forceStoreRerender(fiber);
  }
  function subscribeToStore(fiber, inst, subscribe) {
    return subscribe(function() {
      checkIfSnapshotChanged(inst) && forceStoreRerender(fiber);
    });
  }
  function checkIfSnapshotChanged(inst) {
    var latestGetSnapshot = inst.getSnapshot;
    inst = inst.value;
    try {
      var nextValue = latestGetSnapshot();
      return !objectIs(inst, nextValue);
    } catch (error) {
      return true;
    }
  }
  function forceStoreRerender(fiber) {
    var root2 = enqueueConcurrentRenderForLane(fiber, 2);
    null !== root2 && scheduleUpdateOnFiber(root2, fiber, 2);
  }
  function mountStateImpl(initialState) {
    var hook = mountWorkInProgressHook();
    if ("function" === typeof initialState) {
      var initialStateInitializer = initialState;
      initialState = initialStateInitializer();
      if (shouldDoubleInvokeUserFnsInHooksDEV) {
        setIsStrictModeForDevtools(true);
        try {
          initialStateInitializer();
        } finally {
          setIsStrictModeForDevtools(false);
        }
      }
    }
    hook.memoizedState = hook.baseState = initialState;
    hook.queue = {
      pending: null,
      lanes: 0,
      dispatch: null,
      lastRenderedReducer: basicStateReducer,
      lastRenderedState: initialState
    };
    return hook;
  }
  function updateOptimisticImpl(hook, current, passthrough, reducer) {
    hook.baseState = passthrough;
    return updateReducerImpl(
      hook,
      currentHook,
      "function" === typeof reducer ? reducer : basicStateReducer
    );
  }
  function dispatchActionState(fiber, actionQueue, setPendingState, setState, payload) {
    if (isRenderPhaseUpdate(fiber)) throw Error(formatProdErrorMessage(485));
    fiber = actionQueue.action;
    if (null !== fiber) {
      var actionNode = {
        payload,
        action: fiber,
        next: null,
        isTransition: true,
        status: "pending",
        value: null,
        reason: null,
        listeners: [],
        then: function(listener) {
          actionNode.listeners.push(listener);
        }
      };
      null !== ReactSharedInternals.T ? setPendingState(true) : actionNode.isTransition = false;
      setState(actionNode);
      setPendingState = actionQueue.pending;
      null === setPendingState ? (actionNode.next = actionQueue.pending = actionNode, runActionStateAction(actionQueue, actionNode)) : (actionNode.next = setPendingState.next, actionQueue.pending = setPendingState.next = actionNode);
    }
  }
  function runActionStateAction(actionQueue, node) {
    var action = node.action, payload = node.payload, prevState = actionQueue.state;
    if (node.isTransition) {
      var prevTransition = ReactSharedInternals.T, currentTransition = {};
      ReactSharedInternals.T = currentTransition;
      try {
        var returnValue = action(prevState, payload), onStartTransitionFinish = ReactSharedInternals.S;
        null !== onStartTransitionFinish && onStartTransitionFinish(currentTransition, returnValue);
        handleActionReturnValue(actionQueue, node, returnValue);
      } catch (error) {
        onActionError(actionQueue, node, error);
      } finally {
        null !== prevTransition && null !== currentTransition.types && (prevTransition.types = currentTransition.types), ReactSharedInternals.T = prevTransition;
      }
    } else
      try {
        prevTransition = action(prevState, payload), handleActionReturnValue(actionQueue, node, prevTransition);
      } catch (error$66) {
        onActionError(actionQueue, node, error$66);
      }
  }
  function handleActionReturnValue(actionQueue, node, returnValue) {
    null !== returnValue && "object" === typeof returnValue && "function" === typeof returnValue.then ? returnValue.then(
      function(nextState) {
        onActionSuccess(actionQueue, node, nextState);
      },
      function(error) {
        return onActionError(actionQueue, node, error);
      }
    ) : onActionSuccess(actionQueue, node, returnValue);
  }
  function onActionSuccess(actionQueue, actionNode, nextState) {
    actionNode.status = "fulfilled";
    actionNode.value = nextState;
    notifyActionListeners(actionNode);
    actionQueue.state = nextState;
    actionNode = actionQueue.pending;
    null !== actionNode && (nextState = actionNode.next, nextState === actionNode ? actionQueue.pending = null : (nextState = nextState.next, actionNode.next = nextState, runActionStateAction(actionQueue, nextState)));
  }
  function onActionError(actionQueue, actionNode, error) {
    var last = actionQueue.pending;
    actionQueue.pending = null;
    if (null !== last) {
      last = last.next;
      do
        actionNode.status = "rejected", actionNode.reason = error, notifyActionListeners(actionNode), actionNode = actionNode.next;
      while (actionNode !== last);
    }
    actionQueue.action = null;
  }
  function notifyActionListeners(actionNode) {
    actionNode = actionNode.listeners;
    for (var i = 0; i < actionNode.length; i++) (0, actionNode[i])();
  }
  function actionStateReducer(oldState, newState) {
    return newState;
  }
  function mountActionState(action, initialStateProp) {
    if (isHydrating) {
      var ssrFormState = workInProgressRoot.formState;
      if (null !== ssrFormState) {
        a: {
          var JSCompiler_inline_result = currentlyRenderingFiber;
          if (isHydrating) {
            if (nextHydratableInstance) {
              b: {
                var JSCompiler_inline_result$jscomp$0 = nextHydratableInstance;
                for (var inRootOrSingleton = rootOrSingletonContext; 8 !== JSCompiler_inline_result$jscomp$0.nodeType; ) {
                  if (!inRootOrSingleton) {
                    JSCompiler_inline_result$jscomp$0 = null;
                    break b;
                  }
                  JSCompiler_inline_result$jscomp$0 = getNextHydratable(
                    JSCompiler_inline_result$jscomp$0.nextSibling
                  );
                  if (null === JSCompiler_inline_result$jscomp$0) {
                    JSCompiler_inline_result$jscomp$0 = null;
                    break b;
                  }
                }
                inRootOrSingleton = JSCompiler_inline_result$jscomp$0.data;
                JSCompiler_inline_result$jscomp$0 = "F!" === inRootOrSingleton || "F" === inRootOrSingleton ? JSCompiler_inline_result$jscomp$0 : null;
              }
              if (JSCompiler_inline_result$jscomp$0) {
                nextHydratableInstance = getNextHydratable(
                  JSCompiler_inline_result$jscomp$0.nextSibling
                );
                JSCompiler_inline_result = "F!" === JSCompiler_inline_result$jscomp$0.data;
                break a;
              }
            }
            throwOnHydrationMismatch(JSCompiler_inline_result);
          }
          JSCompiler_inline_result = false;
        }
        JSCompiler_inline_result && (initialStateProp = ssrFormState[0]);
      }
    }
    ssrFormState = mountWorkInProgressHook();
    ssrFormState.memoizedState = ssrFormState.baseState = initialStateProp;
    JSCompiler_inline_result = {
      pending: null,
      lanes: 0,
      dispatch: null,
      lastRenderedReducer: actionStateReducer,
      lastRenderedState: initialStateProp
    };
    ssrFormState.queue = JSCompiler_inline_result;
    ssrFormState = dispatchSetState.bind(
      null,
      currentlyRenderingFiber,
      JSCompiler_inline_result
    );
    JSCompiler_inline_result.dispatch = ssrFormState;
    JSCompiler_inline_result = mountStateImpl(false);
    inRootOrSingleton = dispatchOptimisticSetState.bind(
      null,
      currentlyRenderingFiber,
      false,
      JSCompiler_inline_result.queue
    );
    JSCompiler_inline_result = mountWorkInProgressHook();
    JSCompiler_inline_result$jscomp$0 = {
      state: initialStateProp,
      dispatch: null,
      action,
      pending: null
    };
    JSCompiler_inline_result.queue = JSCompiler_inline_result$jscomp$0;
    ssrFormState = dispatchActionState.bind(
      null,
      currentlyRenderingFiber,
      JSCompiler_inline_result$jscomp$0,
      inRootOrSingleton,
      ssrFormState
    );
    JSCompiler_inline_result$jscomp$0.dispatch = ssrFormState;
    JSCompiler_inline_result.memoizedState = action;
    return [initialStateProp, ssrFormState, false];
  }
  function updateActionState(action) {
    var stateHook = updateWorkInProgressHook();
    return updateActionStateImpl(stateHook, currentHook, action);
  }
  function updateActionStateImpl(stateHook, currentStateHook, action) {
    currentStateHook = updateReducerImpl(
      stateHook,
      currentStateHook,
      actionStateReducer
    )[0];
    stateHook = updateReducer(basicStateReducer)[0];
    if ("object" === typeof currentStateHook && null !== currentStateHook && "function" === typeof currentStateHook.then)
      try {
        var state = useThenable(currentStateHook);
      } catch (x) {
        if (x === SuspenseException) throw SuspenseActionException;
        throw x;
      }
    else state = currentStateHook;
    currentStateHook = updateWorkInProgressHook();
    var actionQueue = currentStateHook.queue, dispatch = actionQueue.dispatch;
    action !== currentStateHook.memoizedState && (currentlyRenderingFiber.flags |= 2048, pushSimpleEffect(
      9,
      { destroy: void 0 },
      actionStateActionEffect.bind(null, actionQueue, action),
      null
    ));
    return [state, dispatch, stateHook];
  }
  function actionStateActionEffect(actionQueue, action) {
    actionQueue.action = action;
  }
  function rerenderActionState(action) {
    var stateHook = updateWorkInProgressHook(), currentStateHook = currentHook;
    if (null !== currentStateHook)
      return updateActionStateImpl(stateHook, currentStateHook, action);
    updateWorkInProgressHook();
    stateHook = stateHook.memoizedState;
    currentStateHook = updateWorkInProgressHook();
    var dispatch = currentStateHook.queue.dispatch;
    currentStateHook.memoizedState = action;
    return [stateHook, dispatch, false];
  }
  function pushSimpleEffect(tag, inst, create, deps) {
    tag = { tag, create, deps, inst, next: null };
    inst = currentlyRenderingFiber.updateQueue;
    null === inst && (inst = createFunctionComponentUpdateQueue(), currentlyRenderingFiber.updateQueue = inst);
    create = inst.lastEffect;
    null === create ? inst.lastEffect = tag.next = tag : (deps = create.next, create.next = tag, tag.next = deps, inst.lastEffect = tag);
    return tag;
  }
  function updateRef() {
    return updateWorkInProgressHook().memoizedState;
  }
  function mountEffectImpl(fiberFlags, hookFlags, create, deps) {
    var hook = mountWorkInProgressHook();
    currentlyRenderingFiber.flags |= fiberFlags;
    hook.memoizedState = pushSimpleEffect(
      1 | hookFlags,
      { destroy: void 0 },
      create,
      void 0 === deps ? null : deps
    );
  }
  function updateEffectImpl(fiberFlags, hookFlags, create, deps) {
    var hook = updateWorkInProgressHook();
    deps = void 0 === deps ? null : deps;
    var inst = hook.memoizedState.inst;
    null !== currentHook && null !== deps && areHookInputsEqual(deps, currentHook.memoizedState.deps) ? hook.memoizedState = pushSimpleEffect(hookFlags, inst, create, deps) : (currentlyRenderingFiber.flags |= fiberFlags, hook.memoizedState = pushSimpleEffect(
      1 | hookFlags,
      inst,
      create,
      deps
    ));
  }
  function mountEffect(create, deps) {
    mountEffectImpl(8390656, 8, create, deps);
  }
  function updateEffect(create, deps) {
    updateEffectImpl(2048, 8, create, deps);
  }
  function useEffectEventImpl(payload) {
    currentlyRenderingFiber.flags |= 4;
    var componentUpdateQueue = currentlyRenderingFiber.updateQueue;
    if (null === componentUpdateQueue)
      componentUpdateQueue = createFunctionComponentUpdateQueue(), currentlyRenderingFiber.updateQueue = componentUpdateQueue, componentUpdateQueue.events = [payload];
    else {
      var events = componentUpdateQueue.events;
      null === events ? componentUpdateQueue.events = [payload] : events.push(payload);
    }
  }
  function updateEvent(callback) {
    var ref = updateWorkInProgressHook().memoizedState;
    useEffectEventImpl({ ref, nextImpl: callback });
    return function() {
      if (0 !== (executionContext & 2)) throw Error(formatProdErrorMessage(440));
      return ref.impl.apply(void 0, arguments);
    };
  }
  function updateInsertionEffect(create, deps) {
    return updateEffectImpl(4, 2, create, deps);
  }
  function updateLayoutEffect(create, deps) {
    return updateEffectImpl(4, 4, create, deps);
  }
  function imperativeHandleEffect(create, ref) {
    if ("function" === typeof ref) {
      create = create();
      var refCleanup = ref(create);
      return function() {
        "function" === typeof refCleanup ? refCleanup() : ref(null);
      };
    }
    if (null !== ref && void 0 !== ref)
      return create = create(), ref.current = create, function() {
        ref.current = null;
      };
  }
  function updateImperativeHandle(ref, create, deps) {
    deps = null !== deps && void 0 !== deps ? deps.concat([ref]) : null;
    updateEffectImpl(4, 4, imperativeHandleEffect.bind(null, create, ref), deps);
  }
  function mountDebugValue() {
  }
  function updateCallback(callback, deps) {
    var hook = updateWorkInProgressHook();
    deps = void 0 === deps ? null : deps;
    var prevState = hook.memoizedState;
    if (null !== deps && areHookInputsEqual(deps, prevState[1]))
      return prevState[0];
    hook.memoizedState = [callback, deps];
    return callback;
  }
  function updateMemo(nextCreate, deps) {
    var hook = updateWorkInProgressHook();
    deps = void 0 === deps ? null : deps;
    var prevState = hook.memoizedState;
    if (null !== deps && areHookInputsEqual(deps, prevState[1]))
      return prevState[0];
    prevState = nextCreate();
    if (shouldDoubleInvokeUserFnsInHooksDEV) {
      setIsStrictModeForDevtools(true);
      try {
        nextCreate();
      } finally {
        setIsStrictModeForDevtools(false);
      }
    }
    hook.memoizedState = [prevState, deps];
    return prevState;
  }
  function mountDeferredValueImpl(hook, value, initialValue) {
    if (void 0 === initialValue || 0 !== (renderLanes & 1073741824) && 0 === (workInProgressRootRenderLanes & 261930))
      return hook.memoizedState = value;
    hook.memoizedState = initialValue;
    hook = requestDeferredLane();
    currentlyRenderingFiber.lanes |= hook;
    workInProgressRootSkippedLanes |= hook;
    return initialValue;
  }
  function updateDeferredValueImpl(hook, prevValue, value, initialValue) {
    if (objectIs(value, prevValue)) return value;
    if (null !== currentTreeHiddenStackCursor.current)
      return hook = mountDeferredValueImpl(hook, value, initialValue), objectIs(hook, prevValue) || (didReceiveUpdate = true), hook;
    if (0 === (renderLanes & 42) || 0 !== (renderLanes & 1073741824) && 0 === (workInProgressRootRenderLanes & 261930))
      return didReceiveUpdate = true, hook.memoizedState = value;
    hook = requestDeferredLane();
    currentlyRenderingFiber.lanes |= hook;
    workInProgressRootSkippedLanes |= hook;
    return prevValue;
  }
  function startTransition(fiber, queue, pendingState, finishedState, callback) {
    var previousPriority = ReactDOMSharedInternals.p;
    ReactDOMSharedInternals.p = 0 !== previousPriority && 8 > previousPriority ? previousPriority : 8;
    var prevTransition = ReactSharedInternals.T, currentTransition = {};
    ReactSharedInternals.T = currentTransition;
    dispatchOptimisticSetState(fiber, false, queue, pendingState);
    try {
      var returnValue = callback(), onStartTransitionFinish = ReactSharedInternals.S;
      null !== onStartTransitionFinish && onStartTransitionFinish(currentTransition, returnValue);
      if (null !== returnValue && "object" === typeof returnValue && "function" === typeof returnValue.then) {
        var thenableForFinishedState = chainThenableValue(
          returnValue,
          finishedState
        );
        dispatchSetStateInternal(
          fiber,
          queue,
          thenableForFinishedState,
          requestUpdateLane(fiber)
        );
      } else
        dispatchSetStateInternal(
          fiber,
          queue,
          finishedState,
          requestUpdateLane(fiber)
        );
    } catch (error) {
      dispatchSetStateInternal(
        fiber,
        queue,
        { then: function() {
        }, status: "rejected", reason: error },
        requestUpdateLane()
      );
    } finally {
      ReactDOMSharedInternals.p = previousPriority, null !== prevTransition && null !== currentTransition.types && (prevTransition.types = currentTransition.types), ReactSharedInternals.T = prevTransition;
    }
  }
  function noop() {
  }
  function startHostTransition(formFiber, pendingState, action, formData) {
    if (5 !== formFiber.tag) throw Error(formatProdErrorMessage(476));
    var queue = ensureFormComponentIsStateful(formFiber).queue;
    startTransition(
      formFiber,
      queue,
      pendingState,
      sharedNotPendingObject,
      null === action ? noop : function() {
        requestFormReset$1(formFiber);
        return action(formData);
      }
    );
  }
  function ensureFormComponentIsStateful(formFiber) {
    var existingStateHook = formFiber.memoizedState;
    if (null !== existingStateHook) return existingStateHook;
    existingStateHook = {
      memoizedState: sharedNotPendingObject,
      baseState: sharedNotPendingObject,
      baseQueue: null,
      queue: {
        pending: null,
        lanes: 0,
        dispatch: null,
        lastRenderedReducer: basicStateReducer,
        lastRenderedState: sharedNotPendingObject
      },
      next: null
    };
    var initialResetState = {};
    existingStateHook.next = {
      memoizedState: initialResetState,
      baseState: initialResetState,
      baseQueue: null,
      queue: {
        pending: null,
        lanes: 0,
        dispatch: null,
        lastRenderedReducer: basicStateReducer,
        lastRenderedState: initialResetState
      },
      next: null
    };
    formFiber.memoizedState = existingStateHook;
    formFiber = formFiber.alternate;
    null !== formFiber && (formFiber.memoizedState = existingStateHook);
    return existingStateHook;
  }
  function requestFormReset$1(formFiber) {
    var stateHook = ensureFormComponentIsStateful(formFiber);
    null === stateHook.next && (stateHook = formFiber.alternate.memoizedState);
    dispatchSetStateInternal(
      formFiber,
      stateHook.next.queue,
      {},
      requestUpdateLane()
    );
  }
  function useHostTransitionStatus() {
    return readContext(HostTransitionContext);
  }
  function updateId() {
    return updateWorkInProgressHook().memoizedState;
  }
  function updateRefresh() {
    return updateWorkInProgressHook().memoizedState;
  }
  function refreshCache(fiber) {
    for (var provider = fiber.return; null !== provider; ) {
      switch (provider.tag) {
        case 24:
        case 3:
          var lane = requestUpdateLane();
          fiber = createUpdate(lane);
          var root$69 = enqueueUpdate(provider, fiber, lane);
          null !== root$69 && (scheduleUpdateOnFiber(root$69, provider, lane), entangleTransitions(root$69, provider, lane));
          provider = { cache: createCache() };
          fiber.payload = provider;
          return;
      }
      provider = provider.return;
    }
  }
  function dispatchReducerAction(fiber, queue, action) {
    var lane = requestUpdateLane();
    action = {
      lane,
      revertLane: 0,
      gesture: null,
      action,
      hasEagerState: false,
      eagerState: null,
      next: null
    };
    isRenderPhaseUpdate(fiber) ? enqueueRenderPhaseUpdate(queue, action) : (action = enqueueConcurrentHookUpdate(fiber, queue, action, lane), null !== action && (scheduleUpdateOnFiber(action, fiber, lane), entangleTransitionUpdate(action, queue, lane)));
  }
  function dispatchSetState(fiber, queue, action) {
    var lane = requestUpdateLane();
    dispatchSetStateInternal(fiber, queue, action, lane);
  }
  function dispatchSetStateInternal(fiber, queue, action, lane) {
    var update = {
      lane,
      revertLane: 0,
      gesture: null,
      action,
      hasEagerState: false,
      eagerState: null,
      next: null
    };
    if (isRenderPhaseUpdate(fiber)) enqueueRenderPhaseUpdate(queue, update);
    else {
      var alternate = fiber.alternate;
      if (0 === fiber.lanes && (null === alternate || 0 === alternate.lanes) && (alternate = queue.lastRenderedReducer, null !== alternate))
        try {
          var currentState = queue.lastRenderedState, eagerState = alternate(currentState, action);
          update.hasEagerState = true;
          update.eagerState = eagerState;
          if (objectIs(eagerState, currentState))
            return enqueueUpdate$1(fiber, queue, update, 0), null === workInProgressRoot && finishQueueingConcurrentUpdates(), false;
        } catch (error) {
        } finally {
        }
      action = enqueueConcurrentHookUpdate(fiber, queue, update, lane);
      if (null !== action)
        return scheduleUpdateOnFiber(action, fiber, lane), entangleTransitionUpdate(action, queue, lane), true;
    }
    return false;
  }
  function dispatchOptimisticSetState(fiber, throwIfDuringRender, queue, action) {
    action = {
      lane: 2,
      revertLane: requestTransitionLane(),
      gesture: null,
      action,
      hasEagerState: false,
      eagerState: null,
      next: null
    };
    if (isRenderPhaseUpdate(fiber)) {
      if (throwIfDuringRender) throw Error(formatProdErrorMessage(479));
    } else
      throwIfDuringRender = enqueueConcurrentHookUpdate(
        fiber,
        queue,
        action,
        2
      ), null !== throwIfDuringRender && scheduleUpdateOnFiber(throwIfDuringRender, fiber, 2);
  }
  function isRenderPhaseUpdate(fiber) {
    var alternate = fiber.alternate;
    return fiber === currentlyRenderingFiber || null !== alternate && alternate === currentlyRenderingFiber;
  }
  function enqueueRenderPhaseUpdate(queue, update) {
    didScheduleRenderPhaseUpdateDuringThisPass = didScheduleRenderPhaseUpdate = true;
    var pending = queue.pending;
    null === pending ? update.next = update : (update.next = pending.next, pending.next = update);
    queue.pending = update;
  }
  function entangleTransitionUpdate(root2, queue, lane) {
    if (0 !== (lane & 4194048)) {
      var queueLanes = queue.lanes;
      queueLanes &= root2.pendingLanes;
      lane |= queueLanes;
      queue.lanes = lane;
      markRootEntangled(root2, lane);
    }
  }
  var ContextOnlyDispatcher = {
    readContext,
    use,
    useCallback: throwInvalidHookError,
    useContext: throwInvalidHookError,
    useEffect: throwInvalidHookError,
    useImperativeHandle: throwInvalidHookError,
    useLayoutEffect: throwInvalidHookError,
    useInsertionEffect: throwInvalidHookError,
    useMemo: throwInvalidHookError,
    useReducer: throwInvalidHookError,
    useRef: throwInvalidHookError,
    useState: throwInvalidHookError,
    useDebugValue: throwInvalidHookError,
    useDeferredValue: throwInvalidHookError,
    useTransition: throwInvalidHookError,
    useSyncExternalStore: throwInvalidHookError,
    useId: throwInvalidHookError,
    useHostTransitionStatus: throwInvalidHookError,
    useFormState: throwInvalidHookError,
    useActionState: throwInvalidHookError,
    useOptimistic: throwInvalidHookError,
    useMemoCache: throwInvalidHookError,
    useCacheRefresh: throwInvalidHookError
  };
  ContextOnlyDispatcher.useEffectEvent = throwInvalidHookError;
  var HooksDispatcherOnMount = {
    readContext,
    use,
    useCallback: function(callback, deps) {
      mountWorkInProgressHook().memoizedState = [
        callback,
        void 0 === deps ? null : deps
      ];
      return callback;
    },
    useContext: readContext,
    useEffect: mountEffect,
    useImperativeHandle: function(ref, create, deps) {
      deps = null !== deps && void 0 !== deps ? deps.concat([ref]) : null;
      mountEffectImpl(
        4194308,
        4,
        imperativeHandleEffect.bind(null, create, ref),
        deps
      );
    },
    useLayoutEffect: function(create, deps) {
      return mountEffectImpl(4194308, 4, create, deps);
    },
    useInsertionEffect: function(create, deps) {
      mountEffectImpl(4, 2, create, deps);
    },
    useMemo: function(nextCreate, deps) {
      var hook = mountWorkInProgressHook();
      deps = void 0 === deps ? null : deps;
      var nextValue = nextCreate();
      if (shouldDoubleInvokeUserFnsInHooksDEV) {
        setIsStrictModeForDevtools(true);
        try {
          nextCreate();
        } finally {
          setIsStrictModeForDevtools(false);
        }
      }
      hook.memoizedState = [nextValue, deps];
      return nextValue;
    },
    useReducer: function(reducer, initialArg, init) {
      var hook = mountWorkInProgressHook();
      if (void 0 !== init) {
        var initialState = init(initialArg);
        if (shouldDoubleInvokeUserFnsInHooksDEV) {
          setIsStrictModeForDevtools(true);
          try {
            init(initialArg);
          } finally {
            setIsStrictModeForDevtools(false);
          }
        }
      } else initialState = initialArg;
      hook.memoizedState = hook.baseState = initialState;
      reducer = {
        pending: null,
        lanes: 0,
        dispatch: null,
        lastRenderedReducer: reducer,
        lastRenderedState: initialState
      };
      hook.queue = reducer;
      reducer = reducer.dispatch = dispatchReducerAction.bind(
        null,
        currentlyRenderingFiber,
        reducer
      );
      return [hook.memoizedState, reducer];
    },
    useRef: function(initialValue) {
      var hook = mountWorkInProgressHook();
      initialValue = { current: initialValue };
      return hook.memoizedState = initialValue;
    },
    useState: function(initialState) {
      initialState = mountStateImpl(initialState);
      var queue = initialState.queue, dispatch = dispatchSetState.bind(null, currentlyRenderingFiber, queue);
      queue.dispatch = dispatch;
      return [initialState.memoizedState, dispatch];
    },
    useDebugValue: mountDebugValue,
    useDeferredValue: function(value, initialValue) {
      var hook = mountWorkInProgressHook();
      return mountDeferredValueImpl(hook, value, initialValue);
    },
    useTransition: function() {
      var stateHook = mountStateImpl(false);
      stateHook = startTransition.bind(
        null,
        currentlyRenderingFiber,
        stateHook.queue,
        true,
        false
      );
      mountWorkInProgressHook().memoizedState = stateHook;
      return [false, stateHook];
    },
    useSyncExternalStore: function(subscribe, getSnapshot, getServerSnapshot) {
      var fiber = currentlyRenderingFiber, hook = mountWorkInProgressHook();
      if (isHydrating) {
        if (void 0 === getServerSnapshot)
          throw Error(formatProdErrorMessage(407));
        getServerSnapshot = getServerSnapshot();
      } else {
        getServerSnapshot = getSnapshot();
        if (null === workInProgressRoot)
          throw Error(formatProdErrorMessage(349));
        0 !== (workInProgressRootRenderLanes & 127) || pushStoreConsistencyCheck(fiber, getSnapshot, getServerSnapshot);
      }
      hook.memoizedState = getServerSnapshot;
      var inst = { value: getServerSnapshot, getSnapshot };
      hook.queue = inst;
      mountEffect(subscribeToStore.bind(null, fiber, inst, subscribe), [
        subscribe
      ]);
      fiber.flags |= 2048;
      pushSimpleEffect(
        9,
        { destroy: void 0 },
        updateStoreInstance.bind(
          null,
          fiber,
          inst,
          getServerSnapshot,
          getSnapshot
        ),
        null
      );
      return getServerSnapshot;
    },
    useId: function() {
      var hook = mountWorkInProgressHook(), identifierPrefix = workInProgressRoot.identifierPrefix;
      if (isHydrating) {
        var JSCompiler_inline_result = treeContextOverflow;
        var idWithLeadingBit = treeContextId;
        JSCompiler_inline_result = (idWithLeadingBit & ~(1 << 32 - clz32(idWithLeadingBit) - 1)).toString(32) + JSCompiler_inline_result;
        identifierPrefix = "_" + identifierPrefix + "R_" + JSCompiler_inline_result;
        JSCompiler_inline_result = localIdCounter++;
        0 < JSCompiler_inline_result && (identifierPrefix += "H" + JSCompiler_inline_result.toString(32));
        identifierPrefix += "_";
      } else
        JSCompiler_inline_result = globalClientIdCounter++, identifierPrefix = "_" + identifierPrefix + "r_" + JSCompiler_inline_result.toString(32) + "_";
      return hook.memoizedState = identifierPrefix;
    },
    useHostTransitionStatus,
    useFormState: mountActionState,
    useActionState: mountActionState,
    useOptimistic: function(passthrough) {
      var hook = mountWorkInProgressHook();
      hook.memoizedState = hook.baseState = passthrough;
      var queue = {
        pending: null,
        lanes: 0,
        dispatch: null,
        lastRenderedReducer: null,
        lastRenderedState: null
      };
      hook.queue = queue;
      hook = dispatchOptimisticSetState.bind(
        null,
        currentlyRenderingFiber,
        true,
        queue
      );
      queue.dispatch = hook;
      return [passthrough, hook];
    },
    useMemoCache,
    useCacheRefresh: function() {
      return mountWorkInProgressHook().memoizedState = refreshCache.bind(
        null,
        currentlyRenderingFiber
      );
    },
    useEffectEvent: function(callback) {
      var hook = mountWorkInProgressHook(), ref = { impl: callback };
      hook.memoizedState = ref;
      return function() {
        if (0 !== (executionContext & 2))
          throw Error(formatProdErrorMessage(440));
        return ref.impl.apply(void 0, arguments);
      };
    }
  }, HooksDispatcherOnUpdate = {
    readContext,
    use,
    useCallback: updateCallback,
    useContext: readContext,
    useEffect: updateEffect,
    useImperativeHandle: updateImperativeHandle,
    useInsertionEffect: updateInsertionEffect,
    useLayoutEffect: updateLayoutEffect,
    useMemo: updateMemo,
    useReducer: updateReducer,
    useRef: updateRef,
    useState: function() {
      return updateReducer(basicStateReducer);
    },
    useDebugValue: mountDebugValue,
    useDeferredValue: function(value, initialValue) {
      var hook = updateWorkInProgressHook();
      return updateDeferredValueImpl(
        hook,
        currentHook.memoizedState,
        value,
        initialValue
      );
    },
    useTransition: function() {
      var booleanOrThenable = updateReducer(basicStateReducer)[0], start = updateWorkInProgressHook().memoizedState;
      return [
        "boolean" === typeof booleanOrThenable ? booleanOrThenable : useThenable(booleanOrThenable),
        start
      ];
    },
    useSyncExternalStore: updateSyncExternalStore,
    useId: updateId,
    useHostTransitionStatus,
    useFormState: updateActionState,
    useActionState: updateActionState,
    useOptimistic: function(passthrough, reducer) {
      var hook = updateWorkInProgressHook();
      return updateOptimisticImpl(hook, currentHook, passthrough, reducer);
    },
    useMemoCache,
    useCacheRefresh: updateRefresh
  };
  HooksDispatcherOnUpdate.useEffectEvent = updateEvent;
  var HooksDispatcherOnRerender = {
    readContext,
    use,
    useCallback: updateCallback,
    useContext: readContext,
    useEffect: updateEffect,
    useImperativeHandle: updateImperativeHandle,
    useInsertionEffect: updateInsertionEffect,
    useLayoutEffect: updateLayoutEffect,
    useMemo: updateMemo,
    useReducer: rerenderReducer,
    useRef: updateRef,
    useState: function() {
      return rerenderReducer(basicStateReducer);
    },
    useDebugValue: mountDebugValue,
    useDeferredValue: function(value, initialValue) {
      var hook = updateWorkInProgressHook();
      return null === currentHook ? mountDeferredValueImpl(hook, value, initialValue) : updateDeferredValueImpl(
        hook,
        currentHook.memoizedState,
        value,
        initialValue
      );
    },
    useTransition: function() {
      var booleanOrThenable = rerenderReducer(basicStateReducer)[0], start = updateWorkInProgressHook().memoizedState;
      return [
        "boolean" === typeof booleanOrThenable ? booleanOrThenable : useThenable(booleanOrThenable),
        start
      ];
    },
    useSyncExternalStore: updateSyncExternalStore,
    useId: updateId,
    useHostTransitionStatus,
    useFormState: rerenderActionState,
    useActionState: rerenderActionState,
    useOptimistic: function(passthrough, reducer) {
      var hook = updateWorkInProgressHook();
      if (null !== currentHook)
        return updateOptimisticImpl(hook, currentHook, passthrough, reducer);
      hook.baseState = passthrough;
      return [passthrough, hook.queue.dispatch];
    },
    useMemoCache,
    useCacheRefresh: updateRefresh
  };
  HooksDispatcherOnRerender.useEffectEvent = updateEvent;
  function applyDerivedStateFromProps(workInProgress2, ctor, getDerivedStateFromProps, nextProps) {
    ctor = workInProgress2.memoizedState;
    getDerivedStateFromProps = getDerivedStateFromProps(nextProps, ctor);
    getDerivedStateFromProps = null === getDerivedStateFromProps || void 0 === getDerivedStateFromProps ? ctor : assign({}, ctor, getDerivedStateFromProps);
    workInProgress2.memoizedState = getDerivedStateFromProps;
    0 === workInProgress2.lanes && (workInProgress2.updateQueue.baseState = getDerivedStateFromProps);
  }
  var classComponentUpdater = {
    enqueueSetState: function(inst, payload, callback) {
      inst = inst._reactInternals;
      var lane = requestUpdateLane(), update = createUpdate(lane);
      update.payload = payload;
      void 0 !== callback && null !== callback && (update.callback = callback);
      payload = enqueueUpdate(inst, update, lane);
      null !== payload && (scheduleUpdateOnFiber(payload, inst, lane), entangleTransitions(payload, inst, lane));
    },
    enqueueReplaceState: function(inst, payload, callback) {
      inst = inst._reactInternals;
      var lane = requestUpdateLane(), update = createUpdate(lane);
      update.tag = 1;
      update.payload = payload;
      void 0 !== callback && null !== callback && (update.callback = callback);
      payload = enqueueUpdate(inst, update, lane);
      null !== payload && (scheduleUpdateOnFiber(payload, inst, lane), entangleTransitions(payload, inst, lane));
    },
    enqueueForceUpdate: function(inst, callback) {
      inst = inst._reactInternals;
      var lane = requestUpdateLane(), update = createUpdate(lane);
      update.tag = 2;
      void 0 !== callback && null !== callback && (update.callback = callback);
      callback = enqueueUpdate(inst, update, lane);
      null !== callback && (scheduleUpdateOnFiber(callback, inst, lane), entangleTransitions(callback, inst, lane));
    }
  };
  function checkShouldComponentUpdate(workInProgress2, ctor, oldProps, newProps, oldState, newState, nextContext) {
    workInProgress2 = workInProgress2.stateNode;
    return "function" === typeof workInProgress2.shouldComponentUpdate ? workInProgress2.shouldComponentUpdate(newProps, newState, nextContext) : ctor.prototype && ctor.prototype.isPureReactComponent ? !shallowEqual(oldProps, newProps) || !shallowEqual(oldState, newState) : true;
  }
  function callComponentWillReceiveProps(workInProgress2, instance, newProps, nextContext) {
    workInProgress2 = instance.state;
    "function" === typeof instance.componentWillReceiveProps && instance.componentWillReceiveProps(newProps, nextContext);
    "function" === typeof instance.UNSAFE_componentWillReceiveProps && instance.UNSAFE_componentWillReceiveProps(newProps, nextContext);
    instance.state !== workInProgress2 && classComponentUpdater.enqueueReplaceState(instance, instance.state, null);
  }
  function resolveClassComponentProps(Component, baseProps) {
    var newProps = baseProps;
    if ("ref" in baseProps) {
      newProps = {};
      for (var propName in baseProps)
        "ref" !== propName && (newProps[propName] = baseProps[propName]);
    }
    if (Component = Component.defaultProps) {
      newProps === baseProps && (newProps = assign({}, newProps));
      for (var propName$73 in Component)
        void 0 === newProps[propName$73] && (newProps[propName$73] = Component[propName$73]);
    }
    return newProps;
  }
  function defaultOnUncaughtError(error) {
    reportGlobalError(error);
  }
  function defaultOnCaughtError(error) {
    console.error(error);
  }
  function defaultOnRecoverableError(error) {
    reportGlobalError(error);
  }
  function logUncaughtError(root2, errorInfo) {
    try {
      var onUncaughtError = root2.onUncaughtError;
      onUncaughtError(errorInfo.value, { componentStack: errorInfo.stack });
    } catch (e$74) {
      setTimeout(function() {
        throw e$74;
      });
    }
  }
  function logCaughtError(root2, boundary, errorInfo) {
    try {
      var onCaughtError = root2.onCaughtError;
      onCaughtError(errorInfo.value, {
        componentStack: errorInfo.stack,
        errorBoundary: 1 === boundary.tag ? boundary.stateNode : null
      });
    } catch (e$75) {
      setTimeout(function() {
        throw e$75;
      });
    }
  }
  function createRootErrorUpdate(root2, errorInfo, lane) {
    lane = createUpdate(lane);
    lane.tag = 3;
    lane.payload = { element: null };
    lane.callback = function() {
      logUncaughtError(root2, errorInfo);
    };
    return lane;
  }
  function createClassErrorUpdate(lane) {
    lane = createUpdate(lane);
    lane.tag = 3;
    return lane;
  }
  function initializeClassErrorUpdate(update, root2, fiber, errorInfo) {
    var getDerivedStateFromError = fiber.type.getDerivedStateFromError;
    if ("function" === typeof getDerivedStateFromError) {
      var error = errorInfo.value;
      update.payload = function() {
        return getDerivedStateFromError(error);
      };
      update.callback = function() {
        logCaughtError(root2, fiber, errorInfo);
      };
    }
    var inst = fiber.stateNode;
    null !== inst && "function" === typeof inst.componentDidCatch && (update.callback = function() {
      logCaughtError(root2, fiber, errorInfo);
      "function" !== typeof getDerivedStateFromError && (null === legacyErrorBoundariesThatAlreadyFailed ? legacyErrorBoundariesThatAlreadyFailed = /* @__PURE__ */ new Set([this]) : legacyErrorBoundariesThatAlreadyFailed.add(this));
      var stack = errorInfo.stack;
      this.componentDidCatch(errorInfo.value, {
        componentStack: null !== stack ? stack : ""
      });
    });
  }
  function throwException(root2, returnFiber, sourceFiber, value, rootRenderLanes) {
    sourceFiber.flags |= 32768;
    if (null !== value && "object" === typeof value && "function" === typeof value.then) {
      returnFiber = sourceFiber.alternate;
      null !== returnFiber && propagateParentContextChanges(
        returnFiber,
        sourceFiber,
        rootRenderLanes,
        true
      );
      sourceFiber = suspenseHandlerStackCursor.current;
      if (null !== sourceFiber) {
        switch (sourceFiber.tag) {
          case 31:
          case 13:
            return null === shellBoundary ? renderDidSuspendDelayIfPossible() : null === sourceFiber.alternate && 0 === workInProgressRootExitStatus && (workInProgressRootExitStatus = 3), sourceFiber.flags &= -257, sourceFiber.flags |= 65536, sourceFiber.lanes = rootRenderLanes, value === noopSuspenseyCommitThenable ? sourceFiber.flags |= 16384 : (returnFiber = sourceFiber.updateQueue, null === returnFiber ? sourceFiber.updateQueue = /* @__PURE__ */ new Set([value]) : returnFiber.add(value), attachPingListener(root2, value, rootRenderLanes)), false;
          case 22:
            return sourceFiber.flags |= 65536, value === noopSuspenseyCommitThenable ? sourceFiber.flags |= 16384 : (returnFiber = sourceFiber.updateQueue, null === returnFiber ? (returnFiber = {
              transitions: null,
              markerInstances: null,
              retryQueue: /* @__PURE__ */ new Set([value])
            }, sourceFiber.updateQueue = returnFiber) : (sourceFiber = returnFiber.retryQueue, null === sourceFiber ? returnFiber.retryQueue = /* @__PURE__ */ new Set([value]) : sourceFiber.add(value)), attachPingListener(root2, value, rootRenderLanes)), false;
        }
        throw Error(formatProdErrorMessage(435, sourceFiber.tag));
      }
      attachPingListener(root2, value, rootRenderLanes);
      renderDidSuspendDelayIfPossible();
      return false;
    }
    if (isHydrating)
      return returnFiber = suspenseHandlerStackCursor.current, null !== returnFiber ? (0 === (returnFiber.flags & 65536) && (returnFiber.flags |= 256), returnFiber.flags |= 65536, returnFiber.lanes = rootRenderLanes, value !== HydrationMismatchException && (root2 = Error(formatProdErrorMessage(422), { cause: value }), queueHydrationError(createCapturedValueAtFiber(root2, sourceFiber)))) : (value !== HydrationMismatchException && (returnFiber = Error(formatProdErrorMessage(423), {
        cause: value
      }), queueHydrationError(
        createCapturedValueAtFiber(returnFiber, sourceFiber)
      )), root2 = root2.current.alternate, root2.flags |= 65536, rootRenderLanes &= -rootRenderLanes, root2.lanes |= rootRenderLanes, value = createCapturedValueAtFiber(value, sourceFiber), rootRenderLanes = createRootErrorUpdate(
        root2.stateNode,
        value,
        rootRenderLanes
      ), enqueueCapturedUpdate(root2, rootRenderLanes), 4 !== workInProgressRootExitStatus && (workInProgressRootExitStatus = 2)), false;
    var wrapperError = Error(formatProdErrorMessage(520), { cause: value });
    wrapperError = createCapturedValueAtFiber(wrapperError, sourceFiber);
    null === workInProgressRootConcurrentErrors ? workInProgressRootConcurrentErrors = [wrapperError] : workInProgressRootConcurrentErrors.push(wrapperError);
    4 !== workInProgressRootExitStatus && (workInProgressRootExitStatus = 2);
    if (null === returnFiber) return true;
    value = createCapturedValueAtFiber(value, sourceFiber);
    sourceFiber = returnFiber;
    do {
      switch (sourceFiber.tag) {
        case 3:
          return sourceFiber.flags |= 65536, root2 = rootRenderLanes & -rootRenderLanes, sourceFiber.lanes |= root2, root2 = createRootErrorUpdate(sourceFiber.stateNode, value, root2), enqueueCapturedUpdate(sourceFiber, root2), false;
        case 1:
          if (returnFiber = sourceFiber.type, wrapperError = sourceFiber.stateNode, 0 === (sourceFiber.flags & 128) && ("function" === typeof returnFiber.getDerivedStateFromError || null !== wrapperError && "function" === typeof wrapperError.componentDidCatch && (null === legacyErrorBoundariesThatAlreadyFailed || !legacyErrorBoundariesThatAlreadyFailed.has(wrapperError))))
            return sourceFiber.flags |= 65536, rootRenderLanes &= -rootRenderLanes, sourceFiber.lanes |= rootRenderLanes, rootRenderLanes = createClassErrorUpdate(rootRenderLanes), initializeClassErrorUpdate(
              rootRenderLanes,
              root2,
              sourceFiber,
              value
            ), enqueueCapturedUpdate(sourceFiber, rootRenderLanes), false;
      }
      sourceFiber = sourceFiber.return;
    } while (null !== sourceFiber);
    return false;
  }
  var SelectiveHydrationException = Error(formatProdErrorMessage(461)), didReceiveUpdate = false;
  function reconcileChildren(current, workInProgress2, nextChildren, renderLanes2) {
    workInProgress2.child = null === current ? mountChildFibers(workInProgress2, null, nextChildren, renderLanes2) : reconcileChildFibers(
      workInProgress2,
      current.child,
      nextChildren,
      renderLanes2
    );
  }
  function updateForwardRef(current, workInProgress2, Component, nextProps, renderLanes2) {
    Component = Component.render;
    var ref = workInProgress2.ref;
    if ("ref" in nextProps) {
      var propsWithoutRef = {};
      for (var key in nextProps)
        "ref" !== key && (propsWithoutRef[key] = nextProps[key]);
    } else propsWithoutRef = nextProps;
    prepareToReadContext(workInProgress2);
    nextProps = renderWithHooks(
      current,
      workInProgress2,
      Component,
      propsWithoutRef,
      ref,
      renderLanes2
    );
    key = checkDidRenderIdHook();
    if (null !== current && !didReceiveUpdate)
      return bailoutHooks(current, workInProgress2, renderLanes2), bailoutOnAlreadyFinishedWork(current, workInProgress2, renderLanes2);
    isHydrating && key && pushMaterializedTreeId(workInProgress2);
    workInProgress2.flags |= 1;
    reconcileChildren(current, workInProgress2, nextProps, renderLanes2);
    return workInProgress2.child;
  }
  function updateMemoComponent(current, workInProgress2, Component, nextProps, renderLanes2) {
    if (null === current) {
      var type = Component.type;
      if ("function" === typeof type && !shouldConstruct(type) && void 0 === type.defaultProps && null === Component.compare)
        return workInProgress2.tag = 15, workInProgress2.type = type, updateSimpleMemoComponent(
          current,
          workInProgress2,
          type,
          nextProps,
          renderLanes2
        );
      current = createFiberFromTypeAndProps(
        Component.type,
        null,
        nextProps,
        workInProgress2,
        workInProgress2.mode,
        renderLanes2
      );
      current.ref = workInProgress2.ref;
      current.return = workInProgress2;
      return workInProgress2.child = current;
    }
    type = current.child;
    if (!checkScheduledUpdateOrContext(current, renderLanes2)) {
      var prevProps = type.memoizedProps;
      Component = Component.compare;
      Component = null !== Component ? Component : shallowEqual;
      if (Component(prevProps, nextProps) && current.ref === workInProgress2.ref)
        return bailoutOnAlreadyFinishedWork(current, workInProgress2, renderLanes2);
    }
    workInProgress2.flags |= 1;
    current = createWorkInProgress(type, nextProps);
    current.ref = workInProgress2.ref;
    current.return = workInProgress2;
    return workInProgress2.child = current;
  }
  function updateSimpleMemoComponent(current, workInProgress2, Component, nextProps, renderLanes2) {
    if (null !== current) {
      var prevProps = current.memoizedProps;
      if (shallowEqual(prevProps, nextProps) && current.ref === workInProgress2.ref)
        if (didReceiveUpdate = false, workInProgress2.pendingProps = nextProps = prevProps, checkScheduledUpdateOrContext(current, renderLanes2))
          0 !== (current.flags & 131072) && (didReceiveUpdate = true);
        else
          return workInProgress2.lanes = current.lanes, bailoutOnAlreadyFinishedWork(current, workInProgress2, renderLanes2);
    }
    return updateFunctionComponent(
      current,
      workInProgress2,
      Component,
      nextProps,
      renderLanes2
    );
  }
  function updateOffscreenComponent(current, workInProgress2, renderLanes2, nextProps) {
    var nextChildren = nextProps.children, prevState = null !== current ? current.memoizedState : null;
    null === current && null === workInProgress2.stateNode && (workInProgress2.stateNode = {
      _visibility: 1,
      _pendingMarkers: null,
      _retryCache: null,
      _transitions: null
    });
    if ("hidden" === nextProps.mode) {
      if (0 !== (workInProgress2.flags & 128)) {
        prevState = null !== prevState ? prevState.baseLanes | renderLanes2 : renderLanes2;
        if (null !== current) {
          nextProps = workInProgress2.child = current.child;
          for (nextChildren = 0; null !== nextProps; )
            nextChildren = nextChildren | nextProps.lanes | nextProps.childLanes, nextProps = nextProps.sibling;
          nextProps = nextChildren & ~prevState;
        } else nextProps = 0, workInProgress2.child = null;
        return deferHiddenOffscreenComponent(
          current,
          workInProgress2,
          prevState,
          renderLanes2,
          nextProps
        );
      }
      if (0 !== (renderLanes2 & 536870912))
        workInProgress2.memoizedState = { baseLanes: 0, cachePool: null }, null !== current && pushTransition(
          workInProgress2,
          null !== prevState ? prevState.cachePool : null
        ), null !== prevState ? pushHiddenContext(workInProgress2, prevState) : reuseHiddenContextOnStack(), pushOffscreenSuspenseHandler(workInProgress2);
      else
        return nextProps = workInProgress2.lanes = 536870912, deferHiddenOffscreenComponent(
          current,
          workInProgress2,
          null !== prevState ? prevState.baseLanes | renderLanes2 : renderLanes2,
          renderLanes2,
          nextProps
        );
    } else
      null !== prevState ? (pushTransition(workInProgress2, prevState.cachePool), pushHiddenContext(workInProgress2, prevState), reuseSuspenseHandlerOnStack(), workInProgress2.memoizedState = null) : (null !== current && pushTransition(workInProgress2, null), reuseHiddenContextOnStack(), reuseSuspenseHandlerOnStack());
    reconcileChildren(current, workInProgress2, nextChildren, renderLanes2);
    return workInProgress2.child;
  }
  function bailoutOffscreenComponent(current, workInProgress2) {
    null !== current && 22 === current.tag || null !== workInProgress2.stateNode || (workInProgress2.stateNode = {
      _visibility: 1,
      _pendingMarkers: null,
      _retryCache: null,
      _transitions: null
    });
    return workInProgress2.sibling;
  }
  function deferHiddenOffscreenComponent(current, workInProgress2, nextBaseLanes, renderLanes2, remainingChildLanes) {
    var JSCompiler_inline_result = peekCacheFromPool();
    JSCompiler_inline_result = null === JSCompiler_inline_result ? null : { parent: CacheContext._currentValue, pool: JSCompiler_inline_result };
    workInProgress2.memoizedState = {
      baseLanes: nextBaseLanes,
      cachePool: JSCompiler_inline_result
    };
    null !== current && pushTransition(workInProgress2, null);
    reuseHiddenContextOnStack();
    pushOffscreenSuspenseHandler(workInProgress2);
    null !== current && propagateParentContextChanges(current, workInProgress2, renderLanes2, true);
    workInProgress2.childLanes = remainingChildLanes;
    return null;
  }
  function mountActivityChildren(workInProgress2, nextProps) {
    nextProps = mountWorkInProgressOffscreenFiber(
      { mode: nextProps.mode, children: nextProps.children },
      workInProgress2.mode
    );
    nextProps.ref = workInProgress2.ref;
    workInProgress2.child = nextProps;
    nextProps.return = workInProgress2;
    return nextProps;
  }
  function retryActivityComponentWithoutHydrating(current, workInProgress2, renderLanes2) {
    reconcileChildFibers(workInProgress2, current.child, null, renderLanes2);
    current = mountActivityChildren(workInProgress2, workInProgress2.pendingProps);
    current.flags |= 2;
    popSuspenseHandler(workInProgress2);
    workInProgress2.memoizedState = null;
    return current;
  }
  function updateActivityComponent(current, workInProgress2, renderLanes2) {
    var nextProps = workInProgress2.pendingProps, didSuspend = 0 !== (workInProgress2.flags & 128);
    workInProgress2.flags &= -129;
    if (null === current) {
      if (isHydrating) {
        if ("hidden" === nextProps.mode)
          return current = mountActivityChildren(workInProgress2, nextProps), workInProgress2.lanes = 536870912, bailoutOffscreenComponent(null, current);
        pushDehydratedActivitySuspenseHandler(workInProgress2);
        (current = nextHydratableInstance) ? (current = canHydrateHydrationBoundary(
          current,
          rootOrSingletonContext
        ), current = null !== current && "&" === current.data ? current : null, null !== current && (workInProgress2.memoizedState = {
          dehydrated: current,
          treeContext: null !== treeContextProvider ? { id: treeContextId, overflow: treeContextOverflow } : null,
          retryLane: 536870912,
          hydrationErrors: null
        }, renderLanes2 = createFiberFromDehydratedFragment(current), renderLanes2.return = workInProgress2, workInProgress2.child = renderLanes2, hydrationParentFiber = workInProgress2, nextHydratableInstance = null)) : current = null;
        if (null === current) throw throwOnHydrationMismatch(workInProgress2);
        workInProgress2.lanes = 536870912;
        return null;
      }
      return mountActivityChildren(workInProgress2, nextProps);
    }
    var prevState = current.memoizedState;
    if (null !== prevState) {
      var dehydrated = prevState.dehydrated;
      pushDehydratedActivitySuspenseHandler(workInProgress2);
      if (didSuspend)
        if (workInProgress2.flags & 256)
          workInProgress2.flags &= -257, workInProgress2 = retryActivityComponentWithoutHydrating(
            current,
            workInProgress2,
            renderLanes2
          );
        else if (null !== workInProgress2.memoizedState)
          workInProgress2.child = current.child, workInProgress2.flags |= 128, workInProgress2 = null;
        else throw Error(formatProdErrorMessage(558));
      else if (didReceiveUpdate || propagateParentContextChanges(current, workInProgress2, renderLanes2, false), didSuspend = 0 !== (renderLanes2 & current.childLanes), didReceiveUpdate || didSuspend) {
        nextProps = workInProgressRoot;
        if (null !== nextProps && (dehydrated = getBumpedLaneForHydration(nextProps, renderLanes2), 0 !== dehydrated && dehydrated !== prevState.retryLane))
          throw prevState.retryLane = dehydrated, enqueueConcurrentRenderForLane(current, dehydrated), scheduleUpdateOnFiber(nextProps, current, dehydrated), SelectiveHydrationException;
        renderDidSuspendDelayIfPossible();
        workInProgress2 = retryActivityComponentWithoutHydrating(
          current,
          workInProgress2,
          renderLanes2
        );
      } else
        current = prevState.treeContext, nextHydratableInstance = getNextHydratable(dehydrated.nextSibling), hydrationParentFiber = workInProgress2, isHydrating = true, hydrationErrors = null, rootOrSingletonContext = false, null !== current && restoreSuspendedTreeContext(workInProgress2, current), workInProgress2 = mountActivityChildren(workInProgress2, nextProps), workInProgress2.flags |= 4096;
      return workInProgress2;
    }
    current = createWorkInProgress(current.child, {
      mode: nextProps.mode,
      children: nextProps.children
    });
    current.ref = workInProgress2.ref;
    workInProgress2.child = current;
    current.return = workInProgress2;
    return current;
  }
  function markRef(current, workInProgress2) {
    var ref = workInProgress2.ref;
    if (null === ref)
      null !== current && null !== current.ref && (workInProgress2.flags |= 4194816);
    else {
      if ("function" !== typeof ref && "object" !== typeof ref)
        throw Error(formatProdErrorMessage(284));
      if (null === current || current.ref !== ref)
        workInProgress2.flags |= 4194816;
    }
  }
  function updateFunctionComponent(current, workInProgress2, Component, nextProps, renderLanes2) {
    prepareToReadContext(workInProgress2);
    Component = renderWithHooks(
      current,
      workInProgress2,
      Component,
      nextProps,
      void 0,
      renderLanes2
    );
    nextProps = checkDidRenderIdHook();
    if (null !== current && !didReceiveUpdate)
      return bailoutHooks(current, workInProgress2, renderLanes2), bailoutOnAlreadyFinishedWork(current, workInProgress2, renderLanes2);
    isHydrating && nextProps && pushMaterializedTreeId(workInProgress2);
    workInProgress2.flags |= 1;
    reconcileChildren(current, workInProgress2, Component, renderLanes2);
    return workInProgress2.child;
  }
  function replayFunctionComponent(current, workInProgress2, nextProps, Component, secondArg, renderLanes2) {
    prepareToReadContext(workInProgress2);
    workInProgress2.updateQueue = null;
    nextProps = renderWithHooksAgain(
      workInProgress2,
      Component,
      nextProps,
      secondArg
    );
    finishRenderingHooks(current);
    Component = checkDidRenderIdHook();
    if (null !== current && !didReceiveUpdate)
      return bailoutHooks(current, workInProgress2, renderLanes2), bailoutOnAlreadyFinishedWork(current, workInProgress2, renderLanes2);
    isHydrating && Component && pushMaterializedTreeId(workInProgress2);
    workInProgress2.flags |= 1;
    reconcileChildren(current, workInProgress2, nextProps, renderLanes2);
    return workInProgress2.child;
  }
  function updateClassComponent(current, workInProgress2, Component, nextProps, renderLanes2) {
    prepareToReadContext(workInProgress2);
    if (null === workInProgress2.stateNode) {
      var context = emptyContextObject, contextType = Component.contextType;
      "object" === typeof contextType && null !== contextType && (context = readContext(contextType));
      context = new Component(nextProps, context);
      workInProgress2.memoizedState = null !== context.state && void 0 !== context.state ? context.state : null;
      context.updater = classComponentUpdater;
      workInProgress2.stateNode = context;
      context._reactInternals = workInProgress2;
      context = workInProgress2.stateNode;
      context.props = nextProps;
      context.state = workInProgress2.memoizedState;
      context.refs = {};
      initializeUpdateQueue(workInProgress2);
      contextType = Component.contextType;
      context.context = "object" === typeof contextType && null !== contextType ? readContext(contextType) : emptyContextObject;
      context.state = workInProgress2.memoizedState;
      contextType = Component.getDerivedStateFromProps;
      "function" === typeof contextType && (applyDerivedStateFromProps(
        workInProgress2,
        Component,
        contextType,
        nextProps
      ), context.state = workInProgress2.memoizedState);
      "function" === typeof Component.getDerivedStateFromProps || "function" === typeof context.getSnapshotBeforeUpdate || "function" !== typeof context.UNSAFE_componentWillMount && "function" !== typeof context.componentWillMount || (contextType = context.state, "function" === typeof context.componentWillMount && context.componentWillMount(), "function" === typeof context.UNSAFE_componentWillMount && context.UNSAFE_componentWillMount(), contextType !== context.state && classComponentUpdater.enqueueReplaceState(context, context.state, null), processUpdateQueue(workInProgress2, nextProps, context, renderLanes2), suspendIfUpdateReadFromEntangledAsyncAction(), context.state = workInProgress2.memoizedState);
      "function" === typeof context.componentDidMount && (workInProgress2.flags |= 4194308);
      nextProps = true;
    } else if (null === current) {
      context = workInProgress2.stateNode;
      var unresolvedOldProps = workInProgress2.memoizedProps, oldProps = resolveClassComponentProps(Component, unresolvedOldProps);
      context.props = oldProps;
      var oldContext = context.context, contextType$jscomp$0 = Component.contextType;
      contextType = emptyContextObject;
      "object" === typeof contextType$jscomp$0 && null !== contextType$jscomp$0 && (contextType = readContext(contextType$jscomp$0));
      var getDerivedStateFromProps = Component.getDerivedStateFromProps;
      contextType$jscomp$0 = "function" === typeof getDerivedStateFromProps || "function" === typeof context.getSnapshotBeforeUpdate;
      unresolvedOldProps = workInProgress2.pendingProps !== unresolvedOldProps;
      contextType$jscomp$0 || "function" !== typeof context.UNSAFE_componentWillReceiveProps && "function" !== typeof context.componentWillReceiveProps || (unresolvedOldProps || oldContext !== contextType) && callComponentWillReceiveProps(
        workInProgress2,
        context,
        nextProps,
        contextType
      );
      hasForceUpdate = false;
      var oldState = workInProgress2.memoizedState;
      context.state = oldState;
      processUpdateQueue(workInProgress2, nextProps, context, renderLanes2);
      suspendIfUpdateReadFromEntangledAsyncAction();
      oldContext = workInProgress2.memoizedState;
      unresolvedOldProps || oldState !== oldContext || hasForceUpdate ? ("function" === typeof getDerivedStateFromProps && (applyDerivedStateFromProps(
        workInProgress2,
        Component,
        getDerivedStateFromProps,
        nextProps
      ), oldContext = workInProgress2.memoizedState), (oldProps = hasForceUpdate || checkShouldComponentUpdate(
        workInProgress2,
        Component,
        oldProps,
        nextProps,
        oldState,
        oldContext,
        contextType
      )) ? (contextType$jscomp$0 || "function" !== typeof context.UNSAFE_componentWillMount && "function" !== typeof context.componentWillMount || ("function" === typeof context.componentWillMount && context.componentWillMount(), "function" === typeof context.UNSAFE_componentWillMount && context.UNSAFE_componentWillMount()), "function" === typeof context.componentDidMount && (workInProgress2.flags |= 4194308)) : ("function" === typeof context.componentDidMount && (workInProgress2.flags |= 4194308), workInProgress2.memoizedProps = nextProps, workInProgress2.memoizedState = oldContext), context.props = nextProps, context.state = oldContext, context.context = contextType, nextProps = oldProps) : ("function" === typeof context.componentDidMount && (workInProgress2.flags |= 4194308), nextProps = false);
    } else {
      context = workInProgress2.stateNode;
      cloneUpdateQueue(current, workInProgress2);
      contextType = workInProgress2.memoizedProps;
      contextType$jscomp$0 = resolveClassComponentProps(Component, contextType);
      context.props = contextType$jscomp$0;
      getDerivedStateFromProps = workInProgress2.pendingProps;
      oldState = context.context;
      oldContext = Component.contextType;
      oldProps = emptyContextObject;
      "object" === typeof oldContext && null !== oldContext && (oldProps = readContext(oldContext));
      unresolvedOldProps = Component.getDerivedStateFromProps;
      (oldContext = "function" === typeof unresolvedOldProps || "function" === typeof context.getSnapshotBeforeUpdate) || "function" !== typeof context.UNSAFE_componentWillReceiveProps && "function" !== typeof context.componentWillReceiveProps || (contextType !== getDerivedStateFromProps || oldState !== oldProps) && callComponentWillReceiveProps(
        workInProgress2,
        context,
        nextProps,
        oldProps
      );
      hasForceUpdate = false;
      oldState = workInProgress2.memoizedState;
      context.state = oldState;
      processUpdateQueue(workInProgress2, nextProps, context, renderLanes2);
      suspendIfUpdateReadFromEntangledAsyncAction();
      var newState = workInProgress2.memoizedState;
      contextType !== getDerivedStateFromProps || oldState !== newState || hasForceUpdate || null !== current && null !== current.dependencies && checkIfContextChanged(current.dependencies) ? ("function" === typeof unresolvedOldProps && (applyDerivedStateFromProps(
        workInProgress2,
        Component,
        unresolvedOldProps,
        nextProps
      ), newState = workInProgress2.memoizedState), (contextType$jscomp$0 = hasForceUpdate || checkShouldComponentUpdate(
        workInProgress2,
        Component,
        contextType$jscomp$0,
        nextProps,
        oldState,
        newState,
        oldProps
      ) || null !== current && null !== current.dependencies && checkIfContextChanged(current.dependencies)) ? (oldContext || "function" !== typeof context.UNSAFE_componentWillUpdate && "function" !== typeof context.componentWillUpdate || ("function" === typeof context.componentWillUpdate && context.componentWillUpdate(nextProps, newState, oldProps), "function" === typeof context.UNSAFE_componentWillUpdate && context.UNSAFE_componentWillUpdate(
        nextProps,
        newState,
        oldProps
      )), "function" === typeof context.componentDidUpdate && (workInProgress2.flags |= 4), "function" === typeof context.getSnapshotBeforeUpdate && (workInProgress2.flags |= 1024)) : ("function" !== typeof context.componentDidUpdate || contextType === current.memoizedProps && oldState === current.memoizedState || (workInProgress2.flags |= 4), "function" !== typeof context.getSnapshotBeforeUpdate || contextType === current.memoizedProps && oldState === current.memoizedState || (workInProgress2.flags |= 1024), workInProgress2.memoizedProps = nextProps, workInProgress2.memoizedState = newState), context.props = nextProps, context.state = newState, context.context = oldProps, nextProps = contextType$jscomp$0) : ("function" !== typeof context.componentDidUpdate || contextType === current.memoizedProps && oldState === current.memoizedState || (workInProgress2.flags |= 4), "function" !== typeof context.getSnapshotBeforeUpdate || contextType === current.memoizedProps && oldState === current.memoizedState || (workInProgress2.flags |= 1024), nextProps = false);
    }
    context = nextProps;
    markRef(current, workInProgress2);
    nextProps = 0 !== (workInProgress2.flags & 128);
    context || nextProps ? (context = workInProgress2.stateNode, Component = nextProps && "function" !== typeof Component.getDerivedStateFromError ? null : context.render(), workInProgress2.flags |= 1, null !== current && nextProps ? (workInProgress2.child = reconcileChildFibers(
      workInProgress2,
      current.child,
      null,
      renderLanes2
    ), workInProgress2.child = reconcileChildFibers(
      workInProgress2,
      null,
      Component,
      renderLanes2
    )) : reconcileChildren(current, workInProgress2, Component, renderLanes2), workInProgress2.memoizedState = context.state, current = workInProgress2.child) : current = bailoutOnAlreadyFinishedWork(
      current,
      workInProgress2,
      renderLanes2
    );
    return current;
  }
  function mountHostRootWithoutHydrating(current, workInProgress2, nextChildren, renderLanes2) {
    resetHydrationState();
    workInProgress2.flags |= 256;
    reconcileChildren(current, workInProgress2, nextChildren, renderLanes2);
    return workInProgress2.child;
  }
  var SUSPENDED_MARKER = {
    dehydrated: null,
    treeContext: null,
    retryLane: 0,
    hydrationErrors: null
  };
  function mountSuspenseOffscreenState(renderLanes2) {
    return { baseLanes: renderLanes2, cachePool: getSuspendedCache() };
  }
  function getRemainingWorkInPrimaryTree(current, primaryTreeDidDefer, renderLanes2) {
    current = null !== current ? current.childLanes & ~renderLanes2 : 0;
    primaryTreeDidDefer && (current |= workInProgressDeferredLane);
    return current;
  }
  function updateSuspenseComponent(current, workInProgress2, renderLanes2) {
    var nextProps = workInProgress2.pendingProps, showFallback = false, didSuspend = 0 !== (workInProgress2.flags & 128), JSCompiler_temp;
    (JSCompiler_temp = didSuspend) || (JSCompiler_temp = null !== current && null === current.memoizedState ? false : 0 !== (suspenseStackCursor.current & 2));
    JSCompiler_temp && (showFallback = true, workInProgress2.flags &= -129);
    JSCompiler_temp = 0 !== (workInProgress2.flags & 32);
    workInProgress2.flags &= -33;
    if (null === current) {
      if (isHydrating) {
        showFallback ? pushPrimaryTreeSuspenseHandler(workInProgress2) : reuseSuspenseHandlerOnStack();
        (current = nextHydratableInstance) ? (current = canHydrateHydrationBoundary(
          current,
          rootOrSingletonContext
        ), current = null !== current && "&" !== current.data ? current : null, null !== current && (workInProgress2.memoizedState = {
          dehydrated: current,
          treeContext: null !== treeContextProvider ? { id: treeContextId, overflow: treeContextOverflow } : null,
          retryLane: 536870912,
          hydrationErrors: null
        }, renderLanes2 = createFiberFromDehydratedFragment(current), renderLanes2.return = workInProgress2, workInProgress2.child = renderLanes2, hydrationParentFiber = workInProgress2, nextHydratableInstance = null)) : current = null;
        if (null === current) throw throwOnHydrationMismatch(workInProgress2);
        isSuspenseInstanceFallback(current) ? workInProgress2.lanes = 32 : workInProgress2.lanes = 536870912;
        return null;
      }
      var nextPrimaryChildren = nextProps.children;
      nextProps = nextProps.fallback;
      if (showFallback)
        return reuseSuspenseHandlerOnStack(), showFallback = workInProgress2.mode, nextPrimaryChildren = mountWorkInProgressOffscreenFiber(
          { mode: "hidden", children: nextPrimaryChildren },
          showFallback
        ), nextProps = createFiberFromFragment(
          nextProps,
          showFallback,
          renderLanes2,
          null
        ), nextPrimaryChildren.return = workInProgress2, nextProps.return = workInProgress2, nextPrimaryChildren.sibling = nextProps, workInProgress2.child = nextPrimaryChildren, nextProps = workInProgress2.child, nextProps.memoizedState = mountSuspenseOffscreenState(renderLanes2), nextProps.childLanes = getRemainingWorkInPrimaryTree(
          current,
          JSCompiler_temp,
          renderLanes2
        ), workInProgress2.memoizedState = SUSPENDED_MARKER, bailoutOffscreenComponent(null, nextProps);
      pushPrimaryTreeSuspenseHandler(workInProgress2);
      return mountSuspensePrimaryChildren(workInProgress2, nextPrimaryChildren);
    }
    var prevState = current.memoizedState;
    if (null !== prevState && (nextPrimaryChildren = prevState.dehydrated, null !== nextPrimaryChildren)) {
      if (didSuspend)
        workInProgress2.flags & 256 ? (pushPrimaryTreeSuspenseHandler(workInProgress2), workInProgress2.flags &= -257, workInProgress2 = retrySuspenseComponentWithoutHydrating(
          current,
          workInProgress2,
          renderLanes2
        )) : null !== workInProgress2.memoizedState ? (reuseSuspenseHandlerOnStack(), workInProgress2.child = current.child, workInProgress2.flags |= 128, workInProgress2 = null) : (reuseSuspenseHandlerOnStack(), nextPrimaryChildren = nextProps.fallback, showFallback = workInProgress2.mode, nextProps = mountWorkInProgressOffscreenFiber(
          { mode: "visible", children: nextProps.children },
          showFallback
        ), nextPrimaryChildren = createFiberFromFragment(
          nextPrimaryChildren,
          showFallback,
          renderLanes2,
          null
        ), nextPrimaryChildren.flags |= 2, nextProps.return = workInProgress2, nextPrimaryChildren.return = workInProgress2, nextProps.sibling = nextPrimaryChildren, workInProgress2.child = nextProps, reconcileChildFibers(
          workInProgress2,
          current.child,
          null,
          renderLanes2
        ), nextProps = workInProgress2.child, nextProps.memoizedState = mountSuspenseOffscreenState(renderLanes2), nextProps.childLanes = getRemainingWorkInPrimaryTree(
          current,
          JSCompiler_temp,
          renderLanes2
        ), workInProgress2.memoizedState = SUSPENDED_MARKER, workInProgress2 = bailoutOffscreenComponent(null, nextProps));
      else if (pushPrimaryTreeSuspenseHandler(workInProgress2), isSuspenseInstanceFallback(nextPrimaryChildren)) {
        JSCompiler_temp = nextPrimaryChildren.nextSibling && nextPrimaryChildren.nextSibling.dataset;
        if (JSCompiler_temp) var digest = JSCompiler_temp.dgst;
        JSCompiler_temp = digest;
        nextProps = Error(formatProdErrorMessage(419));
        nextProps.stack = "";
        nextProps.digest = JSCompiler_temp;
        queueHydrationError({ value: nextProps, source: null, stack: null });
        workInProgress2 = retrySuspenseComponentWithoutHydrating(
          current,
          workInProgress2,
          renderLanes2
        );
      } else if (didReceiveUpdate || propagateParentContextChanges(current, workInProgress2, renderLanes2, false), JSCompiler_temp = 0 !== (renderLanes2 & current.childLanes), didReceiveUpdate || JSCompiler_temp) {
        JSCompiler_temp = workInProgressRoot;
        if (null !== JSCompiler_temp && (nextProps = getBumpedLaneForHydration(JSCompiler_temp, renderLanes2), 0 !== nextProps && nextProps !== prevState.retryLane))
          throw prevState.retryLane = nextProps, enqueueConcurrentRenderForLane(current, nextProps), scheduleUpdateOnFiber(JSCompiler_temp, current, nextProps), SelectiveHydrationException;
        isSuspenseInstancePending(nextPrimaryChildren) || renderDidSuspendDelayIfPossible();
        workInProgress2 = retrySuspenseComponentWithoutHydrating(
          current,
          workInProgress2,
          renderLanes2
        );
      } else
        isSuspenseInstancePending(nextPrimaryChildren) ? (workInProgress2.flags |= 192, workInProgress2.child = current.child, workInProgress2 = null) : (current = prevState.treeContext, nextHydratableInstance = getNextHydratable(
          nextPrimaryChildren.nextSibling
        ), hydrationParentFiber = workInProgress2, isHydrating = true, hydrationErrors = null, rootOrSingletonContext = false, null !== current && restoreSuspendedTreeContext(workInProgress2, current), workInProgress2 = mountSuspensePrimaryChildren(
          workInProgress2,
          nextProps.children
        ), workInProgress2.flags |= 4096);
      return workInProgress2;
    }
    if (showFallback)
      return reuseSuspenseHandlerOnStack(), nextPrimaryChildren = nextProps.fallback, showFallback = workInProgress2.mode, prevState = current.child, digest = prevState.sibling, nextProps = createWorkInProgress(prevState, {
        mode: "hidden",
        children: nextProps.children
      }), nextProps.subtreeFlags = prevState.subtreeFlags & 65011712, null !== digest ? nextPrimaryChildren = createWorkInProgress(
        digest,
        nextPrimaryChildren
      ) : (nextPrimaryChildren = createFiberFromFragment(
        nextPrimaryChildren,
        showFallback,
        renderLanes2,
        null
      ), nextPrimaryChildren.flags |= 2), nextPrimaryChildren.return = workInProgress2, nextProps.return = workInProgress2, nextProps.sibling = nextPrimaryChildren, workInProgress2.child = nextProps, bailoutOffscreenComponent(null, nextProps), nextProps = workInProgress2.child, nextPrimaryChildren = current.child.memoizedState, null === nextPrimaryChildren ? nextPrimaryChildren = mountSuspenseOffscreenState(renderLanes2) : (showFallback = nextPrimaryChildren.cachePool, null !== showFallback ? (prevState = CacheContext._currentValue, showFallback = showFallback.parent !== prevState ? { parent: prevState, pool: prevState } : showFallback) : showFallback = getSuspendedCache(), nextPrimaryChildren = {
        baseLanes: nextPrimaryChildren.baseLanes | renderLanes2,
        cachePool: showFallback
      }), nextProps.memoizedState = nextPrimaryChildren, nextProps.childLanes = getRemainingWorkInPrimaryTree(
        current,
        JSCompiler_temp,
        renderLanes2
      ), workInProgress2.memoizedState = SUSPENDED_MARKER, bailoutOffscreenComponent(current.child, nextProps);
    pushPrimaryTreeSuspenseHandler(workInProgress2);
    renderLanes2 = current.child;
    current = renderLanes2.sibling;
    renderLanes2 = createWorkInProgress(renderLanes2, {
      mode: "visible",
      children: nextProps.children
    });
    renderLanes2.return = workInProgress2;
    renderLanes2.sibling = null;
    null !== current && (JSCompiler_temp = workInProgress2.deletions, null === JSCompiler_temp ? (workInProgress2.deletions = [current], workInProgress2.flags |= 16) : JSCompiler_temp.push(current));
    workInProgress2.child = renderLanes2;
    workInProgress2.memoizedState = null;
    return renderLanes2;
  }
  function mountSuspensePrimaryChildren(workInProgress2, primaryChildren) {
    primaryChildren = mountWorkInProgressOffscreenFiber(
      { mode: "visible", children: primaryChildren },
      workInProgress2.mode
    );
    primaryChildren.return = workInProgress2;
    return workInProgress2.child = primaryChildren;
  }
  function mountWorkInProgressOffscreenFiber(offscreenProps, mode) {
    offscreenProps = createFiberImplClass(22, offscreenProps, null, mode);
    offscreenProps.lanes = 0;
    return offscreenProps;
  }
  function retrySuspenseComponentWithoutHydrating(current, workInProgress2, renderLanes2) {
    reconcileChildFibers(workInProgress2, current.child, null, renderLanes2);
    current = mountSuspensePrimaryChildren(
      workInProgress2,
      workInProgress2.pendingProps.children
    );
    current.flags |= 2;
    workInProgress2.memoizedState = null;
    return current;
  }
  function scheduleSuspenseWorkOnFiber(fiber, renderLanes2, propagationRoot) {
    fiber.lanes |= renderLanes2;
    var alternate = fiber.alternate;
    null !== alternate && (alternate.lanes |= renderLanes2);
    scheduleContextWorkOnParentPath(fiber.return, renderLanes2, propagationRoot);
  }
  function initSuspenseListRenderState(workInProgress2, isBackwards, tail, lastContentRow, tailMode, treeForkCount2) {
    var renderState = workInProgress2.memoizedState;
    null === renderState ? workInProgress2.memoizedState = {
      isBackwards,
      rendering: null,
      renderingStartTime: 0,
      last: lastContentRow,
      tail,
      tailMode,
      treeForkCount: treeForkCount2
    } : (renderState.isBackwards = isBackwards, renderState.rendering = null, renderState.renderingStartTime = 0, renderState.last = lastContentRow, renderState.tail = tail, renderState.tailMode = tailMode, renderState.treeForkCount = treeForkCount2);
  }
  function updateSuspenseListComponent(current, workInProgress2, renderLanes2) {
    var nextProps = workInProgress2.pendingProps, revealOrder = nextProps.revealOrder, tailMode = nextProps.tail;
    nextProps = nextProps.children;
    var suspenseContext = suspenseStackCursor.current, shouldForceFallback = 0 !== (suspenseContext & 2);
    shouldForceFallback ? (suspenseContext = suspenseContext & 1 | 2, workInProgress2.flags |= 128) : suspenseContext &= 1;
    push(suspenseStackCursor, suspenseContext);
    reconcileChildren(current, workInProgress2, nextProps, renderLanes2);
    nextProps = isHydrating ? treeForkCount : 0;
    if (!shouldForceFallback && null !== current && 0 !== (current.flags & 128))
      a: for (current = workInProgress2.child; null !== current; ) {
        if (13 === current.tag)
          null !== current.memoizedState && scheduleSuspenseWorkOnFiber(current, renderLanes2, workInProgress2);
        else if (19 === current.tag)
          scheduleSuspenseWorkOnFiber(current, renderLanes2, workInProgress2);
        else if (null !== current.child) {
          current.child.return = current;
          current = current.child;
          continue;
        }
        if (current === workInProgress2) break a;
        for (; null === current.sibling; ) {
          if (null === current.return || current.return === workInProgress2)
            break a;
          current = current.return;
        }
        current.sibling.return = current.return;
        current = current.sibling;
      }
    switch (revealOrder) {
      case "forwards":
        renderLanes2 = workInProgress2.child;
        for (revealOrder = null; null !== renderLanes2; )
          current = renderLanes2.alternate, null !== current && null === findFirstSuspended(current) && (revealOrder = renderLanes2), renderLanes2 = renderLanes2.sibling;
        renderLanes2 = revealOrder;
        null === renderLanes2 ? (revealOrder = workInProgress2.child, workInProgress2.child = null) : (revealOrder = renderLanes2.sibling, renderLanes2.sibling = null);
        initSuspenseListRenderState(
          workInProgress2,
          false,
          revealOrder,
          renderLanes2,
          tailMode,
          nextProps
        );
        break;
      case "backwards":
      case "unstable_legacy-backwards":
        renderLanes2 = null;
        revealOrder = workInProgress2.child;
        for (workInProgress2.child = null; null !== revealOrder; ) {
          current = revealOrder.alternate;
          if (null !== current && null === findFirstSuspended(current)) {
            workInProgress2.child = revealOrder;
            break;
          }
          current = revealOrder.sibling;
          revealOrder.sibling = renderLanes2;
          renderLanes2 = revealOrder;
          revealOrder = current;
        }
        initSuspenseListRenderState(
          workInProgress2,
          true,
          renderLanes2,
          null,
          tailMode,
          nextProps
        );
        break;
      case "together":
        initSuspenseListRenderState(
          workInProgress2,
          false,
          null,
          null,
          void 0,
          nextProps
        );
        break;
      default:
        workInProgress2.memoizedState = null;
    }
    return workInProgress2.child;
  }
  function bailoutOnAlreadyFinishedWork(current, workInProgress2, renderLanes2) {
    null !== current && (workInProgress2.dependencies = current.dependencies);
    workInProgressRootSkippedLanes |= workInProgress2.lanes;
    if (0 === (renderLanes2 & workInProgress2.childLanes))
      if (null !== current) {
        if (propagateParentContextChanges(
          current,
          workInProgress2,
          renderLanes2,
          false
        ), 0 === (renderLanes2 & workInProgress2.childLanes))
          return null;
      } else return null;
    if (null !== current && workInProgress2.child !== current.child)
      throw Error(formatProdErrorMessage(153));
    if (null !== workInProgress2.child) {
      current = workInProgress2.child;
      renderLanes2 = createWorkInProgress(current, current.pendingProps);
      workInProgress2.child = renderLanes2;
      for (renderLanes2.return = workInProgress2; null !== current.sibling; )
        current = current.sibling, renderLanes2 = renderLanes2.sibling = createWorkInProgress(current, current.pendingProps), renderLanes2.return = workInProgress2;
      renderLanes2.sibling = null;
    }
    return workInProgress2.child;
  }
  function checkScheduledUpdateOrContext(current, renderLanes2) {
    if (0 !== (current.lanes & renderLanes2)) return true;
    current = current.dependencies;
    return null !== current && checkIfContextChanged(current) ? true : false;
  }
  function attemptEarlyBailoutIfNoScheduledUpdate(current, workInProgress2, renderLanes2) {
    switch (workInProgress2.tag) {
      case 3:
        pushHostContainer(workInProgress2, workInProgress2.stateNode.containerInfo);
        pushProvider(workInProgress2, CacheContext, current.memoizedState.cache);
        resetHydrationState();
        break;
      case 27:
      case 5:
        pushHostContext(workInProgress2);
        break;
      case 4:
        pushHostContainer(workInProgress2, workInProgress2.stateNode.containerInfo);
        break;
      case 10:
        pushProvider(
          workInProgress2,
          workInProgress2.type,
          workInProgress2.memoizedProps.value
        );
        break;
      case 31:
        if (null !== workInProgress2.memoizedState)
          return workInProgress2.flags |= 128, pushDehydratedActivitySuspenseHandler(workInProgress2), null;
        break;
      case 13:
        var state$102 = workInProgress2.memoizedState;
        if (null !== state$102) {
          if (null !== state$102.dehydrated)
            return pushPrimaryTreeSuspenseHandler(workInProgress2), workInProgress2.flags |= 128, null;
          if (0 !== (renderLanes2 & workInProgress2.child.childLanes))
            return updateSuspenseComponent(current, workInProgress2, renderLanes2);
          pushPrimaryTreeSuspenseHandler(workInProgress2);
          current = bailoutOnAlreadyFinishedWork(
            current,
            workInProgress2,
            renderLanes2
          );
          return null !== current ? current.sibling : null;
        }
        pushPrimaryTreeSuspenseHandler(workInProgress2);
        break;
      case 19:
        var didSuspendBefore = 0 !== (current.flags & 128);
        state$102 = 0 !== (renderLanes2 & workInProgress2.childLanes);
        state$102 || (propagateParentContextChanges(
          current,
          workInProgress2,
          renderLanes2,
          false
        ), state$102 = 0 !== (renderLanes2 & workInProgress2.childLanes));
        if (didSuspendBefore) {
          if (state$102)
            return updateSuspenseListComponent(
              current,
              workInProgress2,
              renderLanes2
            );
          workInProgress2.flags |= 128;
        }
        didSuspendBefore = workInProgress2.memoizedState;
        null !== didSuspendBefore && (didSuspendBefore.rendering = null, didSuspendBefore.tail = null, didSuspendBefore.lastEffect = null);
        push(suspenseStackCursor, suspenseStackCursor.current);
        if (state$102) break;
        else return null;
      case 22:
        return workInProgress2.lanes = 0, updateOffscreenComponent(
          current,
          workInProgress2,
          renderLanes2,
          workInProgress2.pendingProps
        );
      case 24:
        pushProvider(workInProgress2, CacheContext, current.memoizedState.cache);
    }
    return bailoutOnAlreadyFinishedWork(current, workInProgress2, renderLanes2);
  }
  function beginWork(current, workInProgress2, renderLanes2) {
    if (null !== current)
      if (current.memoizedProps !== workInProgress2.pendingProps)
        didReceiveUpdate = true;
      else {
        if (!checkScheduledUpdateOrContext(current, renderLanes2) && 0 === (workInProgress2.flags & 128))
          return didReceiveUpdate = false, attemptEarlyBailoutIfNoScheduledUpdate(
            current,
            workInProgress2,
            renderLanes2
          );
        didReceiveUpdate = 0 !== (current.flags & 131072) ? true : false;
      }
    else
      didReceiveUpdate = false, isHydrating && 0 !== (workInProgress2.flags & 1048576) && pushTreeId(workInProgress2, treeForkCount, workInProgress2.index);
    workInProgress2.lanes = 0;
    switch (workInProgress2.tag) {
      case 16:
        a: {
          var props = workInProgress2.pendingProps;
          current = resolveLazy(workInProgress2.elementType);
          workInProgress2.type = current;
          if ("function" === typeof current)
            shouldConstruct(current) ? (props = resolveClassComponentProps(current, props), workInProgress2.tag = 1, workInProgress2 = updateClassComponent(
              null,
              workInProgress2,
              current,
              props,
              renderLanes2
            )) : (workInProgress2.tag = 0, workInProgress2 = updateFunctionComponent(
              null,
              workInProgress2,
              current,
              props,
              renderLanes2
            ));
          else {
            if (void 0 !== current && null !== current) {
              var $$typeof = current.$$typeof;
              if ($$typeof === REACT_FORWARD_REF_TYPE) {
                workInProgress2.tag = 11;
                workInProgress2 = updateForwardRef(
                  null,
                  workInProgress2,
                  current,
                  props,
                  renderLanes2
                );
                break a;
              } else if ($$typeof === REACT_MEMO_TYPE) {
                workInProgress2.tag = 14;
                workInProgress2 = updateMemoComponent(
                  null,
                  workInProgress2,
                  current,
                  props,
                  renderLanes2
                );
                break a;
              }
            }
            workInProgress2 = getComponentNameFromType(current) || current;
            throw Error(formatProdErrorMessage(306, workInProgress2, ""));
          }
        }
        return workInProgress2;
      case 0:
        return updateFunctionComponent(
          current,
          workInProgress2,
          workInProgress2.type,
          workInProgress2.pendingProps,
          renderLanes2
        );
      case 1:
        return props = workInProgress2.type, $$typeof = resolveClassComponentProps(
          props,
          workInProgress2.pendingProps
        ), updateClassComponent(
          current,
          workInProgress2,
          props,
          $$typeof,
          renderLanes2
        );
      case 3:
        a: {
          pushHostContainer(
            workInProgress2,
            workInProgress2.stateNode.containerInfo
          );
          if (null === current) throw Error(formatProdErrorMessage(387));
          props = workInProgress2.pendingProps;
          var prevState = workInProgress2.memoizedState;
          $$typeof = prevState.element;
          cloneUpdateQueue(current, workInProgress2);
          processUpdateQueue(workInProgress2, props, null, renderLanes2);
          var nextState = workInProgress2.memoizedState;
          props = nextState.cache;
          pushProvider(workInProgress2, CacheContext, props);
          props !== prevState.cache && propagateContextChanges(
            workInProgress2,
            [CacheContext],
            renderLanes2,
            true
          );
          suspendIfUpdateReadFromEntangledAsyncAction();
          props = nextState.element;
          if (prevState.isDehydrated)
            if (prevState = {
              element: props,
              isDehydrated: false,
              cache: nextState.cache
            }, workInProgress2.updateQueue.baseState = prevState, workInProgress2.memoizedState = prevState, workInProgress2.flags & 256) {
              workInProgress2 = mountHostRootWithoutHydrating(
                current,
                workInProgress2,
                props,
                renderLanes2
              );
              break a;
            } else if (props !== $$typeof) {
              $$typeof = createCapturedValueAtFiber(
                Error(formatProdErrorMessage(424)),
                workInProgress2
              );
              queueHydrationError($$typeof);
              workInProgress2 = mountHostRootWithoutHydrating(
                current,
                workInProgress2,
                props,
                renderLanes2
              );
              break a;
            } else {
              current = workInProgress2.stateNode.containerInfo;
              switch (current.nodeType) {
                case 9:
                  current = current.body;
                  break;
                default:
                  current = "HTML" === current.nodeName ? current.ownerDocument.body : current;
              }
              nextHydratableInstance = getNextHydratable(current.firstChild);
              hydrationParentFiber = workInProgress2;
              isHydrating = true;
              hydrationErrors = null;
              rootOrSingletonContext = true;
              renderLanes2 = mountChildFibers(
                workInProgress2,
                null,
                props,
                renderLanes2
              );
              for (workInProgress2.child = renderLanes2; renderLanes2; )
                renderLanes2.flags = renderLanes2.flags & -3 | 4096, renderLanes2 = renderLanes2.sibling;
            }
          else {
            resetHydrationState();
            if (props === $$typeof) {
              workInProgress2 = bailoutOnAlreadyFinishedWork(
                current,
                workInProgress2,
                renderLanes2
              );
              break a;
            }
            reconcileChildren(current, workInProgress2, props, renderLanes2);
          }
          workInProgress2 = workInProgress2.child;
        }
        return workInProgress2;
      case 26:
        return markRef(current, workInProgress2), null === current ? (renderLanes2 = getResource(
          workInProgress2.type,
          null,
          workInProgress2.pendingProps,
          null
        )) ? workInProgress2.memoizedState = renderLanes2 : isHydrating || (renderLanes2 = workInProgress2.type, current = workInProgress2.pendingProps, props = getOwnerDocumentFromRootContainer(
          rootInstanceStackCursor.current
        ).createElement(renderLanes2), props[internalInstanceKey] = workInProgress2, props[internalPropsKey] = current, setInitialProperties(props, renderLanes2, current), markNodeAsHoistable(props), workInProgress2.stateNode = props) : workInProgress2.memoizedState = getResource(
          workInProgress2.type,
          current.memoizedProps,
          workInProgress2.pendingProps,
          current.memoizedState
        ), null;
      case 27:
        return pushHostContext(workInProgress2), null === current && isHydrating && (props = workInProgress2.stateNode = resolveSingletonInstance(
          workInProgress2.type,
          workInProgress2.pendingProps,
          rootInstanceStackCursor.current
        ), hydrationParentFiber = workInProgress2, rootOrSingletonContext = true, $$typeof = nextHydratableInstance, isSingletonScope(workInProgress2.type) ? (previousHydratableOnEnteringScopedSingleton = $$typeof, nextHydratableInstance = getNextHydratable(props.firstChild)) : nextHydratableInstance = $$typeof), reconcileChildren(
          current,
          workInProgress2,
          workInProgress2.pendingProps.children,
          renderLanes2
        ), markRef(current, workInProgress2), null === current && (workInProgress2.flags |= 4194304), workInProgress2.child;
      case 5:
        if (null === current && isHydrating) {
          if ($$typeof = props = nextHydratableInstance)
            props = canHydrateInstance(
              props,
              workInProgress2.type,
              workInProgress2.pendingProps,
              rootOrSingletonContext
            ), null !== props ? (workInProgress2.stateNode = props, hydrationParentFiber = workInProgress2, nextHydratableInstance = getNextHydratable(props.firstChild), rootOrSingletonContext = false, $$typeof = true) : $$typeof = false;
          $$typeof || throwOnHydrationMismatch(workInProgress2);
        }
        pushHostContext(workInProgress2);
        $$typeof = workInProgress2.type;
        prevState = workInProgress2.pendingProps;
        nextState = null !== current ? current.memoizedProps : null;
        props = prevState.children;
        shouldSetTextContent($$typeof, prevState) ? props = null : null !== nextState && shouldSetTextContent($$typeof, nextState) && (workInProgress2.flags |= 32);
        null !== workInProgress2.memoizedState && ($$typeof = renderWithHooks(
          current,
          workInProgress2,
          TransitionAwareHostComponent,
          null,
          null,
          renderLanes2
        ), HostTransitionContext._currentValue = $$typeof);
        markRef(current, workInProgress2);
        reconcileChildren(current, workInProgress2, props, renderLanes2);
        return workInProgress2.child;
      case 6:
        if (null === current && isHydrating) {
          if (current = renderLanes2 = nextHydratableInstance)
            renderLanes2 = canHydrateTextInstance(
              renderLanes2,
              workInProgress2.pendingProps,
              rootOrSingletonContext
            ), null !== renderLanes2 ? (workInProgress2.stateNode = renderLanes2, hydrationParentFiber = workInProgress2, nextHydratableInstance = null, current = true) : current = false;
          current || throwOnHydrationMismatch(workInProgress2);
        }
        return null;
      case 13:
        return updateSuspenseComponent(current, workInProgress2, renderLanes2);
      case 4:
        return pushHostContainer(
          workInProgress2,
          workInProgress2.stateNode.containerInfo
        ), props = workInProgress2.pendingProps, null === current ? workInProgress2.child = reconcileChildFibers(
          workInProgress2,
          null,
          props,
          renderLanes2
        ) : reconcileChildren(current, workInProgress2, props, renderLanes2), workInProgress2.child;
      case 11:
        return updateForwardRef(
          current,
          workInProgress2,
          workInProgress2.type,
          workInProgress2.pendingProps,
          renderLanes2
        );
      case 7:
        return reconcileChildren(
          current,
          workInProgress2,
          workInProgress2.pendingProps,
          renderLanes2
        ), workInProgress2.child;
      case 8:
        return reconcileChildren(
          current,
          workInProgress2,
          workInProgress2.pendingProps.children,
          renderLanes2
        ), workInProgress2.child;
      case 12:
        return reconcileChildren(
          current,
          workInProgress2,
          workInProgress2.pendingProps.children,
          renderLanes2
        ), workInProgress2.child;
      case 10:
        return props = workInProgress2.pendingProps, pushProvider(workInProgress2, workInProgress2.type, props.value), reconcileChildren(current, workInProgress2, props.children, renderLanes2), workInProgress2.child;
      case 9:
        return $$typeof = workInProgress2.type._context, props = workInProgress2.pendingProps.children, prepareToReadContext(workInProgress2), $$typeof = readContext($$typeof), props = props($$typeof), workInProgress2.flags |= 1, reconcileChildren(current, workInProgress2, props, renderLanes2), workInProgress2.child;
      case 14:
        return updateMemoComponent(
          current,
          workInProgress2,
          workInProgress2.type,
          workInProgress2.pendingProps,
          renderLanes2
        );
      case 15:
        return updateSimpleMemoComponent(
          current,
          workInProgress2,
          workInProgress2.type,
          workInProgress2.pendingProps,
          renderLanes2
        );
      case 19:
        return updateSuspenseListComponent(current, workInProgress2, renderLanes2);
      case 31:
        return updateActivityComponent(current, workInProgress2, renderLanes2);
      case 22:
        return updateOffscreenComponent(
          current,
          workInProgress2,
          renderLanes2,
          workInProgress2.pendingProps
        );
      case 24:
        return prepareToReadContext(workInProgress2), props = readContext(CacheContext), null === current ? ($$typeof = peekCacheFromPool(), null === $$typeof && ($$typeof = workInProgressRoot, prevState = createCache(), $$typeof.pooledCache = prevState, prevState.refCount++, null !== prevState && ($$typeof.pooledCacheLanes |= renderLanes2), $$typeof = prevState), workInProgress2.memoizedState = { parent: props, cache: $$typeof }, initializeUpdateQueue(workInProgress2), pushProvider(workInProgress2, CacheContext, $$typeof)) : (0 !== (current.lanes & renderLanes2) && (cloneUpdateQueue(current, workInProgress2), processUpdateQueue(workInProgress2, null, null, renderLanes2), suspendIfUpdateReadFromEntangledAsyncAction()), $$typeof = current.memoizedState, prevState = workInProgress2.memoizedState, $$typeof.parent !== props ? ($$typeof = { parent: props, cache: props }, workInProgress2.memoizedState = $$typeof, 0 === workInProgress2.lanes && (workInProgress2.memoizedState = workInProgress2.updateQueue.baseState = $$typeof), pushProvider(workInProgress2, CacheContext, props)) : (props = prevState.cache, pushProvider(workInProgress2, CacheContext, props), props !== $$typeof.cache && propagateContextChanges(
          workInProgress2,
          [CacheContext],
          renderLanes2,
          true
        ))), reconcileChildren(
          current,
          workInProgress2,
          workInProgress2.pendingProps.children,
          renderLanes2
        ), workInProgress2.child;
      case 29:
        throw workInProgress2.pendingProps;
    }
    throw Error(formatProdErrorMessage(156, workInProgress2.tag));
  }
  function markUpdate(workInProgress2) {
    workInProgress2.flags |= 4;
  }
  function preloadInstanceAndSuspendIfNeeded(workInProgress2, type, oldProps, newProps, renderLanes2) {
    if (type = 0 !== (workInProgress2.mode & 32)) type = false;
    if (type) {
      if (workInProgress2.flags |= 16777216, (renderLanes2 & 335544128) === renderLanes2)
        if (workInProgress2.stateNode.complete) workInProgress2.flags |= 8192;
        else if (shouldRemainOnPreviousScreen()) workInProgress2.flags |= 8192;
        else
          throw suspendedThenable = noopSuspenseyCommitThenable, SuspenseyCommitException;
    } else workInProgress2.flags &= -16777217;
  }
  function preloadResourceAndSuspendIfNeeded(workInProgress2, resource) {
    if ("stylesheet" !== resource.type || 0 !== (resource.state.loading & 4))
      workInProgress2.flags &= -16777217;
    else if (workInProgress2.flags |= 16777216, !preloadResource(resource))
      if (shouldRemainOnPreviousScreen()) workInProgress2.flags |= 8192;
      else
        throw suspendedThenable = noopSuspenseyCommitThenable, SuspenseyCommitException;
  }
  function scheduleRetryEffect(workInProgress2, retryQueue) {
    null !== retryQueue && (workInProgress2.flags |= 4);
    workInProgress2.flags & 16384 && (retryQueue = 22 !== workInProgress2.tag ? claimNextRetryLane() : 536870912, workInProgress2.lanes |= retryQueue, workInProgressSuspendedRetryLanes |= retryQueue);
  }
  function cutOffTailIfNeeded(renderState, hasRenderedATailFallback) {
    if (!isHydrating)
      switch (renderState.tailMode) {
        case "hidden":
          hasRenderedATailFallback = renderState.tail;
          for (var lastTailNode = null; null !== hasRenderedATailFallback; )
            null !== hasRenderedATailFallback.alternate && (lastTailNode = hasRenderedATailFallback), hasRenderedATailFallback = hasRenderedATailFallback.sibling;
          null === lastTailNode ? renderState.tail = null : lastTailNode.sibling = null;
          break;
        case "collapsed":
          lastTailNode = renderState.tail;
          for (var lastTailNode$106 = null; null !== lastTailNode; )
            null !== lastTailNode.alternate && (lastTailNode$106 = lastTailNode), lastTailNode = lastTailNode.sibling;
          null === lastTailNode$106 ? hasRenderedATailFallback || null === renderState.tail ? renderState.tail = null : renderState.tail.sibling = null : lastTailNode$106.sibling = null;
      }
  }
  function bubbleProperties(completedWork) {
    var didBailout = null !== completedWork.alternate && completedWork.alternate.child === completedWork.child, newChildLanes = 0, subtreeFlags = 0;
    if (didBailout)
      for (var child$107 = completedWork.child; null !== child$107; )
        newChildLanes |= child$107.lanes | child$107.childLanes, subtreeFlags |= child$107.subtreeFlags & 65011712, subtreeFlags |= child$107.flags & 65011712, child$107.return = completedWork, child$107 = child$107.sibling;
    else
      for (child$107 = completedWork.child; null !== child$107; )
        newChildLanes |= child$107.lanes | child$107.childLanes, subtreeFlags |= child$107.subtreeFlags, subtreeFlags |= child$107.flags, child$107.return = completedWork, child$107 = child$107.sibling;
    completedWork.subtreeFlags |= subtreeFlags;
    completedWork.childLanes = newChildLanes;
    return didBailout;
  }
  function completeWork(current, workInProgress2, renderLanes2) {
    var newProps = workInProgress2.pendingProps;
    popTreeContext(workInProgress2);
    switch (workInProgress2.tag) {
      case 16:
      case 15:
      case 0:
      case 11:
      case 7:
      case 8:
      case 12:
      case 9:
      case 14:
        return bubbleProperties(workInProgress2), null;
      case 1:
        return bubbleProperties(workInProgress2), null;
      case 3:
        renderLanes2 = workInProgress2.stateNode;
        newProps = null;
        null !== current && (newProps = current.memoizedState.cache);
        workInProgress2.memoizedState.cache !== newProps && (workInProgress2.flags |= 2048);
        popProvider(CacheContext);
        popHostContainer();
        renderLanes2.pendingContext && (renderLanes2.context = renderLanes2.pendingContext, renderLanes2.pendingContext = null);
        if (null === current || null === current.child)
          popHydrationState(workInProgress2) ? markUpdate(workInProgress2) : null === current || current.memoizedState.isDehydrated && 0 === (workInProgress2.flags & 256) || (workInProgress2.flags |= 1024, upgradeHydrationErrorsToRecoverable());
        bubbleProperties(workInProgress2);
        return null;
      case 26:
        var type = workInProgress2.type, nextResource = workInProgress2.memoizedState;
        null === current ? (markUpdate(workInProgress2), null !== nextResource ? (bubbleProperties(workInProgress2), preloadResourceAndSuspendIfNeeded(workInProgress2, nextResource)) : (bubbleProperties(workInProgress2), preloadInstanceAndSuspendIfNeeded(
          workInProgress2,
          type,
          null,
          newProps,
          renderLanes2
        ))) : nextResource ? nextResource !== current.memoizedState ? (markUpdate(workInProgress2), bubbleProperties(workInProgress2), preloadResourceAndSuspendIfNeeded(workInProgress2, nextResource)) : (bubbleProperties(workInProgress2), workInProgress2.flags &= -16777217) : (current = current.memoizedProps, current !== newProps && markUpdate(workInProgress2), bubbleProperties(workInProgress2), preloadInstanceAndSuspendIfNeeded(
          workInProgress2,
          type,
          current,
          newProps,
          renderLanes2
        ));
        return null;
      case 27:
        popHostContext(workInProgress2);
        renderLanes2 = rootInstanceStackCursor.current;
        type = workInProgress2.type;
        if (null !== current && null != workInProgress2.stateNode)
          current.memoizedProps !== newProps && markUpdate(workInProgress2);
        else {
          if (!newProps) {
            if (null === workInProgress2.stateNode)
              throw Error(formatProdErrorMessage(166));
            bubbleProperties(workInProgress2);
            return null;
          }
          current = contextStackCursor.current;
          popHydrationState(workInProgress2) ? prepareToHydrateHostInstance(workInProgress2) : (current = resolveSingletonInstance(type, newProps, renderLanes2), workInProgress2.stateNode = current, markUpdate(workInProgress2));
        }
        bubbleProperties(workInProgress2);
        return null;
      case 5:
        popHostContext(workInProgress2);
        type = workInProgress2.type;
        if (null !== current && null != workInProgress2.stateNode)
          current.memoizedProps !== newProps && markUpdate(workInProgress2);
        else {
          if (!newProps) {
            if (null === workInProgress2.stateNode)
              throw Error(formatProdErrorMessage(166));
            bubbleProperties(workInProgress2);
            return null;
          }
          nextResource = contextStackCursor.current;
          if (popHydrationState(workInProgress2))
            prepareToHydrateHostInstance(workInProgress2);
          else {
            var ownerDocument = getOwnerDocumentFromRootContainer(
              rootInstanceStackCursor.current
            );
            switch (nextResource) {
              case 1:
                nextResource = ownerDocument.createElementNS(
                  "http://www.w3.org/2000/svg",
                  type
                );
                break;
              case 2:
                nextResource = ownerDocument.createElementNS(
                  "http://www.w3.org/1998/Math/MathML",
                  type
                );
                break;
              default:
                switch (type) {
                  case "svg":
                    nextResource = ownerDocument.createElementNS(
                      "http://www.w3.org/2000/svg",
                      type
                    );
                    break;
                  case "math":
                    nextResource = ownerDocument.createElementNS(
                      "http://www.w3.org/1998/Math/MathML",
                      type
                    );
                    break;
                  case "script":
                    nextResource = ownerDocument.createElement("div");
                    nextResource.innerHTML = "<script><\/script>";
                    nextResource = nextResource.removeChild(
                      nextResource.firstChild
                    );
                    break;
                  case "select":
                    nextResource = "string" === typeof newProps.is ? ownerDocument.createElement("select", {
                      is: newProps.is
                    }) : ownerDocument.createElement("select");
                    newProps.multiple ? nextResource.multiple = true : newProps.size && (nextResource.size = newProps.size);
                    break;
                  default:
                    nextResource = "string" === typeof newProps.is ? ownerDocument.createElement(type, { is: newProps.is }) : ownerDocument.createElement(type);
                }
            }
            nextResource[internalInstanceKey] = workInProgress2;
            nextResource[internalPropsKey] = newProps;
            a: for (ownerDocument = workInProgress2.child; null !== ownerDocument; ) {
              if (5 === ownerDocument.tag || 6 === ownerDocument.tag)
                nextResource.appendChild(ownerDocument.stateNode);
              else if (4 !== ownerDocument.tag && 27 !== ownerDocument.tag && null !== ownerDocument.child) {
                ownerDocument.child.return = ownerDocument;
                ownerDocument = ownerDocument.child;
                continue;
              }
              if (ownerDocument === workInProgress2) break a;
              for (; null === ownerDocument.sibling; ) {
                if (null === ownerDocument.return || ownerDocument.return === workInProgress2)
                  break a;
                ownerDocument = ownerDocument.return;
              }
              ownerDocument.sibling.return = ownerDocument.return;
              ownerDocument = ownerDocument.sibling;
            }
            workInProgress2.stateNode = nextResource;
            a: switch (setInitialProperties(nextResource, type, newProps), type) {
              case "button":
              case "input":
              case "select":
              case "textarea":
                newProps = !!newProps.autoFocus;
                break a;
              case "img":
                newProps = true;
                break a;
              default:
                newProps = false;
            }
            newProps && markUpdate(workInProgress2);
          }
        }
        bubbleProperties(workInProgress2);
        preloadInstanceAndSuspendIfNeeded(
          workInProgress2,
          workInProgress2.type,
          null === current ? null : current.memoizedProps,
          workInProgress2.pendingProps,
          renderLanes2
        );
        return null;
      case 6:
        if (current && null != workInProgress2.stateNode)
          current.memoizedProps !== newProps && markUpdate(workInProgress2);
        else {
          if ("string" !== typeof newProps && null === workInProgress2.stateNode)
            throw Error(formatProdErrorMessage(166));
          current = rootInstanceStackCursor.current;
          if (popHydrationState(workInProgress2)) {
            current = workInProgress2.stateNode;
            renderLanes2 = workInProgress2.memoizedProps;
            newProps = null;
            type = hydrationParentFiber;
            if (null !== type)
              switch (type.tag) {
                case 27:
                case 5:
                  newProps = type.memoizedProps;
              }
            current[internalInstanceKey] = workInProgress2;
            current = current.nodeValue === renderLanes2 || null !== newProps && true === newProps.suppressHydrationWarning || checkForUnmatchedText(current.nodeValue, renderLanes2) ? true : false;
            current || throwOnHydrationMismatch(workInProgress2, true);
          } else
            current = getOwnerDocumentFromRootContainer(current).createTextNode(
              newProps
            ), current[internalInstanceKey] = workInProgress2, workInProgress2.stateNode = current;
        }
        bubbleProperties(workInProgress2);
        return null;
      case 31:
        renderLanes2 = workInProgress2.memoizedState;
        if (null === current || null !== current.memoizedState) {
          newProps = popHydrationState(workInProgress2);
          if (null !== renderLanes2) {
            if (null === current) {
              if (!newProps) throw Error(formatProdErrorMessage(318));
              current = workInProgress2.memoizedState;
              current = null !== current ? current.dehydrated : null;
              if (!current) throw Error(formatProdErrorMessage(557));
              current[internalInstanceKey] = workInProgress2;
            } else
              resetHydrationState(), 0 === (workInProgress2.flags & 128) && (workInProgress2.memoizedState = null), workInProgress2.flags |= 4;
            bubbleProperties(workInProgress2);
            current = false;
          } else
            renderLanes2 = upgradeHydrationErrorsToRecoverable(), null !== current && null !== current.memoizedState && (current.memoizedState.hydrationErrors = renderLanes2), current = true;
          if (!current) {
            if (workInProgress2.flags & 256)
              return popSuspenseHandler(workInProgress2), workInProgress2;
            popSuspenseHandler(workInProgress2);
            return null;
          }
          if (0 !== (workInProgress2.flags & 128))
            throw Error(formatProdErrorMessage(558));
        }
        bubbleProperties(workInProgress2);
        return null;
      case 13:
        newProps = workInProgress2.memoizedState;
        if (null === current || null !== current.memoizedState && null !== current.memoizedState.dehydrated) {
          type = popHydrationState(workInProgress2);
          if (null !== newProps && null !== newProps.dehydrated) {
            if (null === current) {
              if (!type) throw Error(formatProdErrorMessage(318));
              type = workInProgress2.memoizedState;
              type = null !== type ? type.dehydrated : null;
              if (!type) throw Error(formatProdErrorMessage(317));
              type[internalInstanceKey] = workInProgress2;
            } else
              resetHydrationState(), 0 === (workInProgress2.flags & 128) && (workInProgress2.memoizedState = null), workInProgress2.flags |= 4;
            bubbleProperties(workInProgress2);
            type = false;
          } else
            type = upgradeHydrationErrorsToRecoverable(), null !== current && null !== current.memoizedState && (current.memoizedState.hydrationErrors = type), type = true;
          if (!type) {
            if (workInProgress2.flags & 256)
              return popSuspenseHandler(workInProgress2), workInProgress2;
            popSuspenseHandler(workInProgress2);
            return null;
          }
        }
        popSuspenseHandler(workInProgress2);
        if (0 !== (workInProgress2.flags & 128))
          return workInProgress2.lanes = renderLanes2, workInProgress2;
        renderLanes2 = null !== newProps;
        current = null !== current && null !== current.memoizedState;
        renderLanes2 && (newProps = workInProgress2.child, type = null, null !== newProps.alternate && null !== newProps.alternate.memoizedState && null !== newProps.alternate.memoizedState.cachePool && (type = newProps.alternate.memoizedState.cachePool.pool), nextResource = null, null !== newProps.memoizedState && null !== newProps.memoizedState.cachePool && (nextResource = newProps.memoizedState.cachePool.pool), nextResource !== type && (newProps.flags |= 2048));
        renderLanes2 !== current && renderLanes2 && (workInProgress2.child.flags |= 8192);
        scheduleRetryEffect(workInProgress2, workInProgress2.updateQueue);
        bubbleProperties(workInProgress2);
        return null;
      case 4:
        return popHostContainer(), null === current && listenToAllSupportedEvents(workInProgress2.stateNode.containerInfo), bubbleProperties(workInProgress2), null;
      case 10:
        return popProvider(workInProgress2.type), bubbleProperties(workInProgress2), null;
      case 19:
        pop(suspenseStackCursor);
        newProps = workInProgress2.memoizedState;
        if (null === newProps) return bubbleProperties(workInProgress2), null;
        type = 0 !== (workInProgress2.flags & 128);
        nextResource = newProps.rendering;
        if (null === nextResource)
          if (type) cutOffTailIfNeeded(newProps, false);
          else {
            if (0 !== workInProgressRootExitStatus || null !== current && 0 !== (current.flags & 128))
              for (current = workInProgress2.child; null !== current; ) {
                nextResource = findFirstSuspended(current);
                if (null !== nextResource) {
                  workInProgress2.flags |= 128;
                  cutOffTailIfNeeded(newProps, false);
                  current = nextResource.updateQueue;
                  workInProgress2.updateQueue = current;
                  scheduleRetryEffect(workInProgress2, current);
                  workInProgress2.subtreeFlags = 0;
                  current = renderLanes2;
                  for (renderLanes2 = workInProgress2.child; null !== renderLanes2; )
                    resetWorkInProgress(renderLanes2, current), renderLanes2 = renderLanes2.sibling;
                  push(
                    suspenseStackCursor,
                    suspenseStackCursor.current & 1 | 2
                  );
                  isHydrating && pushTreeFork(workInProgress2, newProps.treeForkCount);
                  return workInProgress2.child;
                }
                current = current.sibling;
              }
            null !== newProps.tail && now() > workInProgressRootRenderTargetTime && (workInProgress2.flags |= 128, type = true, cutOffTailIfNeeded(newProps, false), workInProgress2.lanes = 4194304);
          }
        else {
          if (!type)
            if (current = findFirstSuspended(nextResource), null !== current) {
              if (workInProgress2.flags |= 128, type = true, current = current.updateQueue, workInProgress2.updateQueue = current, scheduleRetryEffect(workInProgress2, current), cutOffTailIfNeeded(newProps, true), null === newProps.tail && "hidden" === newProps.tailMode && !nextResource.alternate && !isHydrating)
                return bubbleProperties(workInProgress2), null;
            } else
              2 * now() - newProps.renderingStartTime > workInProgressRootRenderTargetTime && 536870912 !== renderLanes2 && (workInProgress2.flags |= 128, type = true, cutOffTailIfNeeded(newProps, false), workInProgress2.lanes = 4194304);
          newProps.isBackwards ? (nextResource.sibling = workInProgress2.child, workInProgress2.child = nextResource) : (current = newProps.last, null !== current ? current.sibling = nextResource : workInProgress2.child = nextResource, newProps.last = nextResource);
        }
        if (null !== newProps.tail)
          return current = newProps.tail, newProps.rendering = current, newProps.tail = current.sibling, newProps.renderingStartTime = now(), current.sibling = null, renderLanes2 = suspenseStackCursor.current, push(
            suspenseStackCursor,
            type ? renderLanes2 & 1 | 2 : renderLanes2 & 1
          ), isHydrating && pushTreeFork(workInProgress2, newProps.treeForkCount), current;
        bubbleProperties(workInProgress2);
        return null;
      case 22:
      case 23:
        return popSuspenseHandler(workInProgress2), popHiddenContext(), newProps = null !== workInProgress2.memoizedState, null !== current ? null !== current.memoizedState !== newProps && (workInProgress2.flags |= 8192) : newProps && (workInProgress2.flags |= 8192), newProps ? 0 !== (renderLanes2 & 536870912) && 0 === (workInProgress2.flags & 128) && (bubbleProperties(workInProgress2), workInProgress2.subtreeFlags & 6 && (workInProgress2.flags |= 8192)) : bubbleProperties(workInProgress2), renderLanes2 = workInProgress2.updateQueue, null !== renderLanes2 && scheduleRetryEffect(workInProgress2, renderLanes2.retryQueue), renderLanes2 = null, null !== current && null !== current.memoizedState && null !== current.memoizedState.cachePool && (renderLanes2 = current.memoizedState.cachePool.pool), newProps = null, null !== workInProgress2.memoizedState && null !== workInProgress2.memoizedState.cachePool && (newProps = workInProgress2.memoizedState.cachePool.pool), newProps !== renderLanes2 && (workInProgress2.flags |= 2048), null !== current && pop(resumedCache), null;
      case 24:
        return renderLanes2 = null, null !== current && (renderLanes2 = current.memoizedState.cache), workInProgress2.memoizedState.cache !== renderLanes2 && (workInProgress2.flags |= 2048), popProvider(CacheContext), bubbleProperties(workInProgress2), null;
      case 25:
        return null;
      case 30:
        return null;
    }
    throw Error(formatProdErrorMessage(156, workInProgress2.tag));
  }
  function unwindWork(current, workInProgress2) {
    popTreeContext(workInProgress2);
    switch (workInProgress2.tag) {
      case 1:
        return current = workInProgress2.flags, current & 65536 ? (workInProgress2.flags = current & -65537 | 128, workInProgress2) : null;
      case 3:
        return popProvider(CacheContext), popHostContainer(), current = workInProgress2.flags, 0 !== (current & 65536) && 0 === (current & 128) ? (workInProgress2.flags = current & -65537 | 128, workInProgress2) : null;
      case 26:
      case 27:
      case 5:
        return popHostContext(workInProgress2), null;
      case 31:
        if (null !== workInProgress2.memoizedState) {
          popSuspenseHandler(workInProgress2);
          if (null === workInProgress2.alternate)
            throw Error(formatProdErrorMessage(340));
          resetHydrationState();
        }
        current = workInProgress2.flags;
        return current & 65536 ? (workInProgress2.flags = current & -65537 | 128, workInProgress2) : null;
      case 13:
        popSuspenseHandler(workInProgress2);
        current = workInProgress2.memoizedState;
        if (null !== current && null !== current.dehydrated) {
          if (null === workInProgress2.alternate)
            throw Error(formatProdErrorMessage(340));
          resetHydrationState();
        }
        current = workInProgress2.flags;
        return current & 65536 ? (workInProgress2.flags = current & -65537 | 128, workInProgress2) : null;
      case 19:
        return pop(suspenseStackCursor), null;
      case 4:
        return popHostContainer(), null;
      case 10:
        return popProvider(workInProgress2.type), null;
      case 22:
      case 23:
        return popSuspenseHandler(workInProgress2), popHiddenContext(), null !== current && pop(resumedCache), current = workInProgress2.flags, current & 65536 ? (workInProgress2.flags = current & -65537 | 128, workInProgress2) : null;
      case 24:
        return popProvider(CacheContext), null;
      case 25:
        return null;
      default:
        return null;
    }
  }
  function unwindInterruptedWork(current, interruptedWork) {
    popTreeContext(interruptedWork);
    switch (interruptedWork.tag) {
      case 3:
        popProvider(CacheContext);
        popHostContainer();
        break;
      case 26:
      case 27:
      case 5:
        popHostContext(interruptedWork);
        break;
      case 4:
        popHostContainer();
        break;
      case 31:
        null !== interruptedWork.memoizedState && popSuspenseHandler(interruptedWork);
        break;
      case 13:
        popSuspenseHandler(interruptedWork);
        break;
      case 19:
        pop(suspenseStackCursor);
        break;
      case 10:
        popProvider(interruptedWork.type);
        break;
      case 22:
      case 23:
        popSuspenseHandler(interruptedWork);
        popHiddenContext();
        null !== current && pop(resumedCache);
        break;
      case 24:
        popProvider(CacheContext);
    }
  }
  function commitHookEffectListMount(flags, finishedWork) {
    try {
      var updateQueue = finishedWork.updateQueue, lastEffect = null !== updateQueue ? updateQueue.lastEffect : null;
      if (null !== lastEffect) {
        var firstEffect = lastEffect.next;
        updateQueue = firstEffect;
        do {
          if ((updateQueue.tag & flags) === flags) {
            lastEffect = void 0;
            var create = updateQueue.create, inst = updateQueue.inst;
            lastEffect = create();
            inst.destroy = lastEffect;
          }
          updateQueue = updateQueue.next;
        } while (updateQueue !== firstEffect);
      }
    } catch (error) {
      captureCommitPhaseError(finishedWork, finishedWork.return, error);
    }
  }
  function commitHookEffectListUnmount(flags, finishedWork, nearestMountedAncestor$jscomp$0) {
    try {
      var updateQueue = finishedWork.updateQueue, lastEffect = null !== updateQueue ? updateQueue.lastEffect : null;
      if (null !== lastEffect) {
        var firstEffect = lastEffect.next;
        updateQueue = firstEffect;
        do {
          if ((updateQueue.tag & flags) === flags) {
            var inst = updateQueue.inst, destroy = inst.destroy;
            if (void 0 !== destroy) {
              inst.destroy = void 0;
              lastEffect = finishedWork;
              var nearestMountedAncestor = nearestMountedAncestor$jscomp$0, destroy_ = destroy;
              try {
                destroy_();
              } catch (error) {
                captureCommitPhaseError(
                  lastEffect,
                  nearestMountedAncestor,
                  error
                );
              }
            }
          }
          updateQueue = updateQueue.next;
        } while (updateQueue !== firstEffect);
      }
    } catch (error) {
      captureCommitPhaseError(finishedWork, finishedWork.return, error);
    }
  }
  function commitClassCallbacks(finishedWork) {
    var updateQueue = finishedWork.updateQueue;
    if (null !== updateQueue) {
      var instance = finishedWork.stateNode;
      try {
        commitCallbacks(updateQueue, instance);
      } catch (error) {
        captureCommitPhaseError(finishedWork, finishedWork.return, error);
      }
    }
  }
  function safelyCallComponentWillUnmount(current, nearestMountedAncestor, instance) {
    instance.props = resolveClassComponentProps(
      current.type,
      current.memoizedProps
    );
    instance.state = current.memoizedState;
    try {
      instance.componentWillUnmount();
    } catch (error) {
      captureCommitPhaseError(current, nearestMountedAncestor, error);
    }
  }
  function safelyAttachRef(current, nearestMountedAncestor) {
    try {
      var ref = current.ref;
      if (null !== ref) {
        switch (current.tag) {
          case 26:
          case 27:
          case 5:
            var instanceToUse = current.stateNode;
            break;
          case 30:
            instanceToUse = current.stateNode;
            break;
          default:
            instanceToUse = current.stateNode;
        }
        "function" === typeof ref ? current.refCleanup = ref(instanceToUse) : ref.current = instanceToUse;
      }
    } catch (error) {
      captureCommitPhaseError(current, nearestMountedAncestor, error);
    }
  }
  function safelyDetachRef(current, nearestMountedAncestor) {
    var ref = current.ref, refCleanup = current.refCleanup;
    if (null !== ref)
      if ("function" === typeof refCleanup)
        try {
          refCleanup();
        } catch (error) {
          captureCommitPhaseError(current, nearestMountedAncestor, error);
        } finally {
          current.refCleanup = null, current = current.alternate, null != current && (current.refCleanup = null);
        }
      else if ("function" === typeof ref)
        try {
          ref(null);
        } catch (error$140) {
          captureCommitPhaseError(current, nearestMountedAncestor, error$140);
        }
      else ref.current = null;
  }
  function commitHostMount(finishedWork) {
    var type = finishedWork.type, props = finishedWork.memoizedProps, instance = finishedWork.stateNode;
    try {
      a: switch (type) {
        case "button":
        case "input":
        case "select":
        case "textarea":
          props.autoFocus && instance.focus();
          break a;
        case "img":
          props.src ? instance.src = props.src : props.srcSet && (instance.srcset = props.srcSet);
      }
    } catch (error) {
      captureCommitPhaseError(finishedWork, finishedWork.return, error);
    }
  }
  function commitHostUpdate(finishedWork, newProps, oldProps) {
    try {
      var domElement = finishedWork.stateNode;
      updateProperties(domElement, finishedWork.type, oldProps, newProps);
      domElement[internalPropsKey] = newProps;
    } catch (error) {
      captureCommitPhaseError(finishedWork, finishedWork.return, error);
    }
  }
  function isHostParent(fiber) {
    return 5 === fiber.tag || 3 === fiber.tag || 26 === fiber.tag || 27 === fiber.tag && isSingletonScope(fiber.type) || 4 === fiber.tag;
  }
  function getHostSibling(fiber) {
    a: for (; ; ) {
      for (; null === fiber.sibling; ) {
        if (null === fiber.return || isHostParent(fiber.return)) return null;
        fiber = fiber.return;
      }
      fiber.sibling.return = fiber.return;
      for (fiber = fiber.sibling; 5 !== fiber.tag && 6 !== fiber.tag && 18 !== fiber.tag; ) {
        if (27 === fiber.tag && isSingletonScope(fiber.type)) continue a;
        if (fiber.flags & 2) continue a;
        if (null === fiber.child || 4 === fiber.tag) continue a;
        else fiber.child.return = fiber, fiber = fiber.child;
      }
      if (!(fiber.flags & 2)) return fiber.stateNode;
    }
  }
  function insertOrAppendPlacementNodeIntoContainer(node, before, parent) {
    var tag = node.tag;
    if (5 === tag || 6 === tag)
      node = node.stateNode, before ? (9 === parent.nodeType ? parent.body : "HTML" === parent.nodeName ? parent.ownerDocument.body : parent).insertBefore(node, before) : (before = 9 === parent.nodeType ? parent.body : "HTML" === parent.nodeName ? parent.ownerDocument.body : parent, before.appendChild(node), parent = parent._reactRootContainer, null !== parent && void 0 !== parent || null !== before.onclick || (before.onclick = noop$1));
    else if (4 !== tag && (27 === tag && isSingletonScope(node.type) && (parent = node.stateNode, before = null), node = node.child, null !== node))
      for (insertOrAppendPlacementNodeIntoContainer(node, before, parent), node = node.sibling; null !== node; )
        insertOrAppendPlacementNodeIntoContainer(node, before, parent), node = node.sibling;
  }
  function insertOrAppendPlacementNode(node, before, parent) {
    var tag = node.tag;
    if (5 === tag || 6 === tag)
      node = node.stateNode, before ? parent.insertBefore(node, before) : parent.appendChild(node);
    else if (4 !== tag && (27 === tag && isSingletonScope(node.type) && (parent = node.stateNode), node = node.child, null !== node))
      for (insertOrAppendPlacementNode(node, before, parent), node = node.sibling; null !== node; )
        insertOrAppendPlacementNode(node, before, parent), node = node.sibling;
  }
  function commitHostSingletonAcquisition(finishedWork) {
    var singleton = finishedWork.stateNode, props = finishedWork.memoizedProps;
    try {
      for (var type = finishedWork.type, attributes = singleton.attributes; attributes.length; )
        singleton.removeAttributeNode(attributes[0]);
      setInitialProperties(singleton, type, props);
      singleton[internalInstanceKey] = finishedWork;
      singleton[internalPropsKey] = props;
    } catch (error) {
      captureCommitPhaseError(finishedWork, finishedWork.return, error);
    }
  }
  var offscreenSubtreeIsHidden = false, offscreenSubtreeWasHidden = false, needsFormReset = false, PossiblyWeakSet = "function" === typeof WeakSet ? WeakSet : Set, nextEffect = null;
  function commitBeforeMutationEffects(root2, firstChild) {
    root2 = root2.containerInfo;
    eventsEnabled = _enabled;
    root2 = getActiveElementDeep(root2);
    if (hasSelectionCapabilities(root2)) {
      if ("selectionStart" in root2)
        var JSCompiler_temp = {
          start: root2.selectionStart,
          end: root2.selectionEnd
        };
      else
        a: {
          JSCompiler_temp = (JSCompiler_temp = root2.ownerDocument) && JSCompiler_temp.defaultView || window;
          var selection = JSCompiler_temp.getSelection && JSCompiler_temp.getSelection();
          if (selection && 0 !== selection.rangeCount) {
            JSCompiler_temp = selection.anchorNode;
            var anchorOffset = selection.anchorOffset, focusNode = selection.focusNode;
            selection = selection.focusOffset;
            try {
              JSCompiler_temp.nodeType, focusNode.nodeType;
            } catch (e$20) {
              JSCompiler_temp = null;
              break a;
            }
            var length = 0, start = -1, end = -1, indexWithinAnchor = 0, indexWithinFocus = 0, node = root2, parentNode = null;
            b: for (; ; ) {
              for (var next; ; ) {
                node !== JSCompiler_temp || 0 !== anchorOffset && 3 !== node.nodeType || (start = length + anchorOffset);
                node !== focusNode || 0 !== selection && 3 !== node.nodeType || (end = length + selection);
                3 === node.nodeType && (length += node.nodeValue.length);
                if (null === (next = node.firstChild)) break;
                parentNode = node;
                node = next;
              }
              for (; ; ) {
                if (node === root2) break b;
                parentNode === JSCompiler_temp && ++indexWithinAnchor === anchorOffset && (start = length);
                parentNode === focusNode && ++indexWithinFocus === selection && (end = length);
                if (null !== (next = node.nextSibling)) break;
                node = parentNode;
                parentNode = node.parentNode;
              }
              node = next;
            }
            JSCompiler_temp = -1 === start || -1 === end ? null : { start, end };
          } else JSCompiler_temp = null;
        }
      JSCompiler_temp = JSCompiler_temp || { start: 0, end: 0 };
    } else JSCompiler_temp = null;
    selectionInformation = { focusedElem: root2, selectionRange: JSCompiler_temp };
    _enabled = false;
    for (nextEffect = firstChild; null !== nextEffect; )
      if (firstChild = nextEffect, root2 = firstChild.child, 0 !== (firstChild.subtreeFlags & 1028) && null !== root2)
        root2.return = firstChild, nextEffect = root2;
      else
        for (; null !== nextEffect; ) {
          firstChild = nextEffect;
          focusNode = firstChild.alternate;
          root2 = firstChild.flags;
          switch (firstChild.tag) {
            case 0:
              if (0 !== (root2 & 4) && (root2 = firstChild.updateQueue, root2 = null !== root2 ? root2.events : null, null !== root2))
                for (JSCompiler_temp = 0; JSCompiler_temp < root2.length; JSCompiler_temp++)
                  anchorOffset = root2[JSCompiler_temp], anchorOffset.ref.impl = anchorOffset.nextImpl;
              break;
            case 11:
            case 15:
              break;
            case 1:
              if (0 !== (root2 & 1024) && null !== focusNode) {
                root2 = void 0;
                JSCompiler_temp = firstChild;
                anchorOffset = focusNode.memoizedProps;
                focusNode = focusNode.memoizedState;
                selection = JSCompiler_temp.stateNode;
                try {
                  var resolvedPrevProps = resolveClassComponentProps(
                    JSCompiler_temp.type,
                    anchorOffset
                  );
                  root2 = selection.getSnapshotBeforeUpdate(
                    resolvedPrevProps,
                    focusNode
                  );
                  selection.__reactInternalSnapshotBeforeUpdate = root2;
                } catch (error) {
                  captureCommitPhaseError(
                    JSCompiler_temp,
                    JSCompiler_temp.return,
                    error
                  );
                }
              }
              break;
            case 3:
              if (0 !== (root2 & 1024)) {
                if (root2 = firstChild.stateNode.containerInfo, JSCompiler_temp = root2.nodeType, 9 === JSCompiler_temp)
                  clearContainerSparingly(root2);
                else if (1 === JSCompiler_temp)
                  switch (root2.nodeName) {
                    case "HEAD":
                    case "HTML":
                    case "BODY":
                      clearContainerSparingly(root2);
                      break;
                    default:
                      root2.textContent = "";
                  }
              }
              break;
            case 5:
            case 26:
            case 27:
            case 6:
            case 4:
            case 17:
              break;
            default:
              if (0 !== (root2 & 1024)) throw Error(formatProdErrorMessage(163));
          }
          root2 = firstChild.sibling;
          if (null !== root2) {
            root2.return = firstChild.return;
            nextEffect = root2;
            break;
          }
          nextEffect = firstChild.return;
        }
  }
  function commitLayoutEffectOnFiber(finishedRoot, current, finishedWork) {
    var flags = finishedWork.flags;
    switch (finishedWork.tag) {
      case 0:
      case 11:
      case 15:
        recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
        flags & 4 && commitHookEffectListMount(5, finishedWork);
        break;
      case 1:
        recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
        if (flags & 4)
          if (finishedRoot = finishedWork.stateNode, null === current)
            try {
              finishedRoot.componentDidMount();
            } catch (error) {
              captureCommitPhaseError(finishedWork, finishedWork.return, error);
            }
          else {
            var prevProps = resolveClassComponentProps(
              finishedWork.type,
              current.memoizedProps
            );
            current = current.memoizedState;
            try {
              finishedRoot.componentDidUpdate(
                prevProps,
                current,
                finishedRoot.__reactInternalSnapshotBeforeUpdate
              );
            } catch (error$139) {
              captureCommitPhaseError(
                finishedWork,
                finishedWork.return,
                error$139
              );
            }
          }
        flags & 64 && commitClassCallbacks(finishedWork);
        flags & 512 && safelyAttachRef(finishedWork, finishedWork.return);
        break;
      case 3:
        recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
        if (flags & 64 && (finishedRoot = finishedWork.updateQueue, null !== finishedRoot)) {
          current = null;
          if (null !== finishedWork.child)
            switch (finishedWork.child.tag) {
              case 27:
              case 5:
                current = finishedWork.child.stateNode;
                break;
              case 1:
                current = finishedWork.child.stateNode;
            }
          try {
            commitCallbacks(finishedRoot, current);
          } catch (error) {
            captureCommitPhaseError(finishedWork, finishedWork.return, error);
          }
        }
        break;
      case 27:
        null === current && flags & 4 && commitHostSingletonAcquisition(finishedWork);
      case 26:
      case 5:
        recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
        null === current && flags & 4 && commitHostMount(finishedWork);
        flags & 512 && safelyAttachRef(finishedWork, finishedWork.return);
        break;
      case 12:
        recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
        break;
      case 31:
        recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
        flags & 4 && commitActivityHydrationCallbacks(finishedRoot, finishedWork);
        break;
      case 13:
        recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
        flags & 4 && commitSuspenseHydrationCallbacks(finishedRoot, finishedWork);
        flags & 64 && (finishedRoot = finishedWork.memoizedState, null !== finishedRoot && (finishedRoot = finishedRoot.dehydrated, null !== finishedRoot && (finishedWork = retryDehydratedSuspenseBoundary.bind(
          null,
          finishedWork
        ), registerSuspenseInstanceRetry(finishedRoot, finishedWork))));
        break;
      case 22:
        flags = null !== finishedWork.memoizedState || offscreenSubtreeIsHidden;
        if (!flags) {
          current = null !== current && null !== current.memoizedState || offscreenSubtreeWasHidden;
          prevProps = offscreenSubtreeIsHidden;
          var prevOffscreenSubtreeWasHidden = offscreenSubtreeWasHidden;
          offscreenSubtreeIsHidden = flags;
          (offscreenSubtreeWasHidden = current) && !prevOffscreenSubtreeWasHidden ? recursivelyTraverseReappearLayoutEffects(
            finishedRoot,
            finishedWork,
            0 !== (finishedWork.subtreeFlags & 8772)
          ) : recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
          offscreenSubtreeIsHidden = prevProps;
          offscreenSubtreeWasHidden = prevOffscreenSubtreeWasHidden;
        }
        break;
      case 30:
        break;
      default:
        recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
    }
  }
  function detachFiberAfterEffects(fiber) {
    var alternate = fiber.alternate;
    null !== alternate && (fiber.alternate = null, detachFiberAfterEffects(alternate));
    fiber.child = null;
    fiber.deletions = null;
    fiber.sibling = null;
    5 === fiber.tag && (alternate = fiber.stateNode, null !== alternate && detachDeletedInstance(alternate));
    fiber.stateNode = null;
    fiber.return = null;
    fiber.dependencies = null;
    fiber.memoizedProps = null;
    fiber.memoizedState = null;
    fiber.pendingProps = null;
    fiber.stateNode = null;
    fiber.updateQueue = null;
  }
  var hostParent = null, hostParentIsContainer = false;
  function recursivelyTraverseDeletionEffects(finishedRoot, nearestMountedAncestor, parent) {
    for (parent = parent.child; null !== parent; )
      commitDeletionEffectsOnFiber(finishedRoot, nearestMountedAncestor, parent), parent = parent.sibling;
  }
  function commitDeletionEffectsOnFiber(finishedRoot, nearestMountedAncestor, deletedFiber) {
    if (injectedHook && "function" === typeof injectedHook.onCommitFiberUnmount)
      try {
        injectedHook.onCommitFiberUnmount(rendererID, deletedFiber);
      } catch (err) {
      }
    switch (deletedFiber.tag) {
      case 26:
        offscreenSubtreeWasHidden || safelyDetachRef(deletedFiber, nearestMountedAncestor);
        recursivelyTraverseDeletionEffects(
          finishedRoot,
          nearestMountedAncestor,
          deletedFiber
        );
        deletedFiber.memoizedState ? deletedFiber.memoizedState.count-- : deletedFiber.stateNode && (deletedFiber = deletedFiber.stateNode, deletedFiber.parentNode.removeChild(deletedFiber));
        break;
      case 27:
        offscreenSubtreeWasHidden || safelyDetachRef(deletedFiber, nearestMountedAncestor);
        var prevHostParent = hostParent, prevHostParentIsContainer = hostParentIsContainer;
        isSingletonScope(deletedFiber.type) && (hostParent = deletedFiber.stateNode, hostParentIsContainer = false);
        recursivelyTraverseDeletionEffects(
          finishedRoot,
          nearestMountedAncestor,
          deletedFiber
        );
        releaseSingletonInstance(deletedFiber.stateNode);
        hostParent = prevHostParent;
        hostParentIsContainer = prevHostParentIsContainer;
        break;
      case 5:
        offscreenSubtreeWasHidden || safelyDetachRef(deletedFiber, nearestMountedAncestor);
      case 6:
        prevHostParent = hostParent;
        prevHostParentIsContainer = hostParentIsContainer;
        hostParent = null;
        recursivelyTraverseDeletionEffects(
          finishedRoot,
          nearestMountedAncestor,
          deletedFiber
        );
        hostParent = prevHostParent;
        hostParentIsContainer = prevHostParentIsContainer;
        if (null !== hostParent)
          if (hostParentIsContainer)
            try {
              (9 === hostParent.nodeType ? hostParent.body : "HTML" === hostParent.nodeName ? hostParent.ownerDocument.body : hostParent).removeChild(deletedFiber.stateNode);
            } catch (error) {
              captureCommitPhaseError(
                deletedFiber,
                nearestMountedAncestor,
                error
              );
            }
          else
            try {
              hostParent.removeChild(deletedFiber.stateNode);
            } catch (error) {
              captureCommitPhaseError(
                deletedFiber,
                nearestMountedAncestor,
                error
              );
            }
        break;
      case 18:
        null !== hostParent && (hostParentIsContainer ? (finishedRoot = hostParent, clearHydrationBoundary(
          9 === finishedRoot.nodeType ? finishedRoot.body : "HTML" === finishedRoot.nodeName ? finishedRoot.ownerDocument.body : finishedRoot,
          deletedFiber.stateNode
        ), retryIfBlockedOn(finishedRoot)) : clearHydrationBoundary(hostParent, deletedFiber.stateNode));
        break;
      case 4:
        prevHostParent = hostParent;
        prevHostParentIsContainer = hostParentIsContainer;
        hostParent = deletedFiber.stateNode.containerInfo;
        hostParentIsContainer = true;
        recursivelyTraverseDeletionEffects(
          finishedRoot,
          nearestMountedAncestor,
          deletedFiber
        );
        hostParent = prevHostParent;
        hostParentIsContainer = prevHostParentIsContainer;
        break;
      case 0:
      case 11:
      case 14:
      case 15:
        commitHookEffectListUnmount(2, deletedFiber, nearestMountedAncestor);
        offscreenSubtreeWasHidden || commitHookEffectListUnmount(4, deletedFiber, nearestMountedAncestor);
        recursivelyTraverseDeletionEffects(
          finishedRoot,
          nearestMountedAncestor,
          deletedFiber
        );
        break;
      case 1:
        offscreenSubtreeWasHidden || (safelyDetachRef(deletedFiber, nearestMountedAncestor), prevHostParent = deletedFiber.stateNode, "function" === typeof prevHostParent.componentWillUnmount && safelyCallComponentWillUnmount(
          deletedFiber,
          nearestMountedAncestor,
          prevHostParent
        ));
        recursivelyTraverseDeletionEffects(
          finishedRoot,
          nearestMountedAncestor,
          deletedFiber
        );
        break;
      case 21:
        recursivelyTraverseDeletionEffects(
          finishedRoot,
          nearestMountedAncestor,
          deletedFiber
        );
        break;
      case 22:
        offscreenSubtreeWasHidden = (prevHostParent = offscreenSubtreeWasHidden) || null !== deletedFiber.memoizedState;
        recursivelyTraverseDeletionEffects(
          finishedRoot,
          nearestMountedAncestor,
          deletedFiber
        );
        offscreenSubtreeWasHidden = prevHostParent;
        break;
      default:
        recursivelyTraverseDeletionEffects(
          finishedRoot,
          nearestMountedAncestor,
          deletedFiber
        );
    }
  }
  function commitActivityHydrationCallbacks(finishedRoot, finishedWork) {
    if (null === finishedWork.memoizedState && (finishedRoot = finishedWork.alternate, null !== finishedRoot && (finishedRoot = finishedRoot.memoizedState, null !== finishedRoot))) {
      finishedRoot = finishedRoot.dehydrated;
      try {
        retryIfBlockedOn(finishedRoot);
      } catch (error) {
        captureCommitPhaseError(finishedWork, finishedWork.return, error);
      }
    }
  }
  function commitSuspenseHydrationCallbacks(finishedRoot, finishedWork) {
    if (null === finishedWork.memoizedState && (finishedRoot = finishedWork.alternate, null !== finishedRoot && (finishedRoot = finishedRoot.memoizedState, null !== finishedRoot && (finishedRoot = finishedRoot.dehydrated, null !== finishedRoot))))
      try {
        retryIfBlockedOn(finishedRoot);
      } catch (error) {
        captureCommitPhaseError(finishedWork, finishedWork.return, error);
      }
  }
  function getRetryCache(finishedWork) {
    switch (finishedWork.tag) {
      case 31:
      case 13:
      case 19:
        var retryCache = finishedWork.stateNode;
        null === retryCache && (retryCache = finishedWork.stateNode = new PossiblyWeakSet());
        return retryCache;
      case 22:
        return finishedWork = finishedWork.stateNode, retryCache = finishedWork._retryCache, null === retryCache && (retryCache = finishedWork._retryCache = new PossiblyWeakSet()), retryCache;
      default:
        throw Error(formatProdErrorMessage(435, finishedWork.tag));
    }
  }
  function attachSuspenseRetryListeners(finishedWork, wakeables) {
    var retryCache = getRetryCache(finishedWork);
    wakeables.forEach(function(wakeable) {
      if (!retryCache.has(wakeable)) {
        retryCache.add(wakeable);
        var retry = resolveRetryWakeable.bind(null, finishedWork, wakeable);
        wakeable.then(retry, retry);
      }
    });
  }
  function recursivelyTraverseMutationEffects(root$jscomp$0, parentFiber) {
    var deletions = parentFiber.deletions;
    if (null !== deletions)
      for (var i = 0; i < deletions.length; i++) {
        var childToDelete = deletions[i], root2 = root$jscomp$0, returnFiber = parentFiber, parent = returnFiber;
        a: for (; null !== parent; ) {
          switch (parent.tag) {
            case 27:
              if (isSingletonScope(parent.type)) {
                hostParent = parent.stateNode;
                hostParentIsContainer = false;
                break a;
              }
              break;
            case 5:
              hostParent = parent.stateNode;
              hostParentIsContainer = false;
              break a;
            case 3:
            case 4:
              hostParent = parent.stateNode.containerInfo;
              hostParentIsContainer = true;
              break a;
          }
          parent = parent.return;
        }
        if (null === hostParent) throw Error(formatProdErrorMessage(160));
        commitDeletionEffectsOnFiber(root2, returnFiber, childToDelete);
        hostParent = null;
        hostParentIsContainer = false;
        root2 = childToDelete.alternate;
        null !== root2 && (root2.return = null);
        childToDelete.return = null;
      }
    if (parentFiber.subtreeFlags & 13886)
      for (parentFiber = parentFiber.child; null !== parentFiber; )
        commitMutationEffectsOnFiber(parentFiber, root$jscomp$0), parentFiber = parentFiber.sibling;
  }
  var currentHoistableRoot = null;
  function commitMutationEffectsOnFiber(finishedWork, root2) {
    var current = finishedWork.alternate, flags = finishedWork.flags;
    switch (finishedWork.tag) {
      case 0:
      case 11:
      case 14:
      case 15:
        recursivelyTraverseMutationEffects(root2, finishedWork);
        commitReconciliationEffects(finishedWork);
        flags & 4 && (commitHookEffectListUnmount(3, finishedWork, finishedWork.return), commitHookEffectListMount(3, finishedWork), commitHookEffectListUnmount(5, finishedWork, finishedWork.return));
        break;
      case 1:
        recursivelyTraverseMutationEffects(root2, finishedWork);
        commitReconciliationEffects(finishedWork);
        flags & 512 && (offscreenSubtreeWasHidden || null === current || safelyDetachRef(current, current.return));
        flags & 64 && offscreenSubtreeIsHidden && (finishedWork = finishedWork.updateQueue, null !== finishedWork && (flags = finishedWork.callbacks, null !== flags && (current = finishedWork.shared.hiddenCallbacks, finishedWork.shared.hiddenCallbacks = null === current ? flags : current.concat(flags))));
        break;
      case 26:
        var hoistableRoot = currentHoistableRoot;
        recursivelyTraverseMutationEffects(root2, finishedWork);
        commitReconciliationEffects(finishedWork);
        flags & 512 && (offscreenSubtreeWasHidden || null === current || safelyDetachRef(current, current.return));
        if (flags & 4) {
          var currentResource = null !== current ? current.memoizedState : null;
          flags = finishedWork.memoizedState;
          if (null === current)
            if (null === flags)
              if (null === finishedWork.stateNode) {
                a: {
                  flags = finishedWork.type;
                  current = finishedWork.memoizedProps;
                  hoistableRoot = hoistableRoot.ownerDocument || hoistableRoot;
                  b: switch (flags) {
                    case "title":
                      currentResource = hoistableRoot.getElementsByTagName("title")[0];
                      if (!currentResource || currentResource[internalHoistableMarker] || currentResource[internalInstanceKey] || "http://www.w3.org/2000/svg" === currentResource.namespaceURI || currentResource.hasAttribute("itemprop"))
                        currentResource = hoistableRoot.createElement(flags), hoistableRoot.head.insertBefore(
                          currentResource,
                          hoistableRoot.querySelector("head > title")
                        );
                      setInitialProperties(currentResource, flags, current);
                      currentResource[internalInstanceKey] = finishedWork;
                      markNodeAsHoistable(currentResource);
                      flags = currentResource;
                      break a;
                    case "link":
                      var maybeNodes = getHydratableHoistableCache(
                        "link",
                        "href",
                        hoistableRoot
                      ).get(flags + (current.href || ""));
                      if (maybeNodes) {
                        for (var i = 0; i < maybeNodes.length; i++)
                          if (currentResource = maybeNodes[i], currentResource.getAttribute("href") === (null == current.href || "" === current.href ? null : current.href) && currentResource.getAttribute("rel") === (null == current.rel ? null : current.rel) && currentResource.getAttribute("title") === (null == current.title ? null : current.title) && currentResource.getAttribute("crossorigin") === (null == current.crossOrigin ? null : current.crossOrigin)) {
                            maybeNodes.splice(i, 1);
                            break b;
                          }
                      }
                      currentResource = hoistableRoot.createElement(flags);
                      setInitialProperties(currentResource, flags, current);
                      hoistableRoot.head.appendChild(currentResource);
                      break;
                    case "meta":
                      if (maybeNodes = getHydratableHoistableCache(
                        "meta",
                        "content",
                        hoistableRoot
                      ).get(flags + (current.content || ""))) {
                        for (i = 0; i < maybeNodes.length; i++)
                          if (currentResource = maybeNodes[i], currentResource.getAttribute("content") === (null == current.content ? null : "" + current.content) && currentResource.getAttribute("name") === (null == current.name ? null : current.name) && currentResource.getAttribute("property") === (null == current.property ? null : current.property) && currentResource.getAttribute("http-equiv") === (null == current.httpEquiv ? null : current.httpEquiv) && currentResource.getAttribute("charset") === (null == current.charSet ? null : current.charSet)) {
                            maybeNodes.splice(i, 1);
                            break b;
                          }
                      }
                      currentResource = hoistableRoot.createElement(flags);
                      setInitialProperties(currentResource, flags, current);
                      hoistableRoot.head.appendChild(currentResource);
                      break;
                    default:
                      throw Error(formatProdErrorMessage(468, flags));
                  }
                  currentResource[internalInstanceKey] = finishedWork;
                  markNodeAsHoistable(currentResource);
                  flags = currentResource;
                }
                finishedWork.stateNode = flags;
              } else
                mountHoistable(
                  hoistableRoot,
                  finishedWork.type,
                  finishedWork.stateNode
                );
            else
              finishedWork.stateNode = acquireResource(
                hoistableRoot,
                flags,
                finishedWork.memoizedProps
              );
          else
            currentResource !== flags ? (null === currentResource ? null !== current.stateNode && (current = current.stateNode, current.parentNode.removeChild(current)) : currentResource.count--, null === flags ? mountHoistable(
              hoistableRoot,
              finishedWork.type,
              finishedWork.stateNode
            ) : acquireResource(
              hoistableRoot,
              flags,
              finishedWork.memoizedProps
            )) : null === flags && null !== finishedWork.stateNode && commitHostUpdate(
              finishedWork,
              finishedWork.memoizedProps,
              current.memoizedProps
            );
        }
        break;
      case 27:
        recursivelyTraverseMutationEffects(root2, finishedWork);
        commitReconciliationEffects(finishedWork);
        flags & 512 && (offscreenSubtreeWasHidden || null === current || safelyDetachRef(current, current.return));
        null !== current && flags & 4 && commitHostUpdate(
          finishedWork,
          finishedWork.memoizedProps,
          current.memoizedProps
        );
        break;
      case 5:
        recursivelyTraverseMutationEffects(root2, finishedWork);
        commitReconciliationEffects(finishedWork);
        flags & 512 && (offscreenSubtreeWasHidden || null === current || safelyDetachRef(current, current.return));
        if (finishedWork.flags & 32) {
          hoistableRoot = finishedWork.stateNode;
          try {
            setTextContent(hoistableRoot, "");
          } catch (error) {
            captureCommitPhaseError(finishedWork, finishedWork.return, error);
          }
        }
        flags & 4 && null != finishedWork.stateNode && (hoistableRoot = finishedWork.memoizedProps, commitHostUpdate(
          finishedWork,
          hoistableRoot,
          null !== current ? current.memoizedProps : hoistableRoot
        ));
        flags & 1024 && (needsFormReset = true);
        break;
      case 6:
        recursivelyTraverseMutationEffects(root2, finishedWork);
        commitReconciliationEffects(finishedWork);
        if (flags & 4) {
          if (null === finishedWork.stateNode)
            throw Error(formatProdErrorMessage(162));
          flags = finishedWork.memoizedProps;
          current = finishedWork.stateNode;
          try {
            current.nodeValue = flags;
          } catch (error) {
            captureCommitPhaseError(finishedWork, finishedWork.return, error);
          }
        }
        break;
      case 3:
        tagCaches = null;
        hoistableRoot = currentHoistableRoot;
        currentHoistableRoot = getHoistableRoot(root2.containerInfo);
        recursivelyTraverseMutationEffects(root2, finishedWork);
        currentHoistableRoot = hoistableRoot;
        commitReconciliationEffects(finishedWork);
        if (flags & 4 && null !== current && current.memoizedState.isDehydrated)
          try {
            retryIfBlockedOn(root2.containerInfo);
          } catch (error) {
            captureCommitPhaseError(finishedWork, finishedWork.return, error);
          }
        needsFormReset && (needsFormReset = false, recursivelyResetForms(finishedWork));
        break;
      case 4:
        flags = currentHoistableRoot;
        currentHoistableRoot = getHoistableRoot(
          finishedWork.stateNode.containerInfo
        );
        recursivelyTraverseMutationEffects(root2, finishedWork);
        commitReconciliationEffects(finishedWork);
        currentHoistableRoot = flags;
        break;
      case 12:
        recursivelyTraverseMutationEffects(root2, finishedWork);
        commitReconciliationEffects(finishedWork);
        break;
      case 31:
        recursivelyTraverseMutationEffects(root2, finishedWork);
        commitReconciliationEffects(finishedWork);
        flags & 4 && (flags = finishedWork.updateQueue, null !== flags && (finishedWork.updateQueue = null, attachSuspenseRetryListeners(finishedWork, flags)));
        break;
      case 13:
        recursivelyTraverseMutationEffects(root2, finishedWork);
        commitReconciliationEffects(finishedWork);
        finishedWork.child.flags & 8192 && null !== finishedWork.memoizedState !== (null !== current && null !== current.memoizedState) && (globalMostRecentFallbackTime = now());
        flags & 4 && (flags = finishedWork.updateQueue, null !== flags && (finishedWork.updateQueue = null, attachSuspenseRetryListeners(finishedWork, flags)));
        break;
      case 22:
        hoistableRoot = null !== finishedWork.memoizedState;
        var wasHidden = null !== current && null !== current.memoizedState, prevOffscreenSubtreeIsHidden = offscreenSubtreeIsHidden, prevOffscreenSubtreeWasHidden = offscreenSubtreeWasHidden;
        offscreenSubtreeIsHidden = prevOffscreenSubtreeIsHidden || hoistableRoot;
        offscreenSubtreeWasHidden = prevOffscreenSubtreeWasHidden || wasHidden;
        recursivelyTraverseMutationEffects(root2, finishedWork);
        offscreenSubtreeWasHidden = prevOffscreenSubtreeWasHidden;
        offscreenSubtreeIsHidden = prevOffscreenSubtreeIsHidden;
        commitReconciliationEffects(finishedWork);
        if (flags & 8192)
          a: for (root2 = finishedWork.stateNode, root2._visibility = hoistableRoot ? root2._visibility & -2 : root2._visibility | 1, hoistableRoot && (null === current || wasHidden || offscreenSubtreeIsHidden || offscreenSubtreeWasHidden || recursivelyTraverseDisappearLayoutEffects(finishedWork)), current = null, root2 = finishedWork; ; ) {
            if (5 === root2.tag || 26 === root2.tag) {
              if (null === current) {
                wasHidden = current = root2;
                try {
                  if (currentResource = wasHidden.stateNode, hoistableRoot)
                    maybeNodes = currentResource.style, "function" === typeof maybeNodes.setProperty ? maybeNodes.setProperty("display", "none", "important") : maybeNodes.display = "none";
                  else {
                    i = wasHidden.stateNode;
                    var styleProp = wasHidden.memoizedProps.style, display = void 0 !== styleProp && null !== styleProp && styleProp.hasOwnProperty("display") ? styleProp.display : null;
                    i.style.display = null == display || "boolean" === typeof display ? "" : ("" + display).trim();
                  }
                } catch (error) {
                  captureCommitPhaseError(wasHidden, wasHidden.return, error);
                }
              }
            } else if (6 === root2.tag) {
              if (null === current) {
                wasHidden = root2;
                try {
                  wasHidden.stateNode.nodeValue = hoistableRoot ? "" : wasHidden.memoizedProps;
                } catch (error) {
                  captureCommitPhaseError(wasHidden, wasHidden.return, error);
                }
              }
            } else if (18 === root2.tag) {
              if (null === current) {
                wasHidden = root2;
                try {
                  var instance = wasHidden.stateNode;
                  hoistableRoot ? hideOrUnhideDehydratedBoundary(instance, true) : hideOrUnhideDehydratedBoundary(wasHidden.stateNode, false);
                } catch (error) {
                  captureCommitPhaseError(wasHidden, wasHidden.return, error);
                }
              }
            } else if ((22 !== root2.tag && 23 !== root2.tag || null === root2.memoizedState || root2 === finishedWork) && null !== root2.child) {
              root2.child.return = root2;
              root2 = root2.child;
              continue;
            }
            if (root2 === finishedWork) break a;
            for (; null === root2.sibling; ) {
              if (null === root2.return || root2.return === finishedWork) break a;
              current === root2 && (current = null);
              root2 = root2.return;
            }
            current === root2 && (current = null);
            root2.sibling.return = root2.return;
            root2 = root2.sibling;
          }
        flags & 4 && (flags = finishedWork.updateQueue, null !== flags && (current = flags.retryQueue, null !== current && (flags.retryQueue = null, attachSuspenseRetryListeners(finishedWork, current))));
        break;
      case 19:
        recursivelyTraverseMutationEffects(root2, finishedWork);
        commitReconciliationEffects(finishedWork);
        flags & 4 && (flags = finishedWork.updateQueue, null !== flags && (finishedWork.updateQueue = null, attachSuspenseRetryListeners(finishedWork, flags)));
        break;
      case 30:
        break;
      case 21:
        break;
      default:
        recursivelyTraverseMutationEffects(root2, finishedWork), commitReconciliationEffects(finishedWork);
    }
  }
  function commitReconciliationEffects(finishedWork) {
    var flags = finishedWork.flags;
    if (flags & 2) {
      try {
        for (var hostParentFiber, parentFiber = finishedWork.return; null !== parentFiber; ) {
          if (isHostParent(parentFiber)) {
            hostParentFiber = parentFiber;
            break;
          }
          parentFiber = parentFiber.return;
        }
        if (null == hostParentFiber) throw Error(formatProdErrorMessage(160));
        switch (hostParentFiber.tag) {
          case 27:
            var parent = hostParentFiber.stateNode, before = getHostSibling(finishedWork);
            insertOrAppendPlacementNode(finishedWork, before, parent);
            break;
          case 5:
            var parent$141 = hostParentFiber.stateNode;
            hostParentFiber.flags & 32 && (setTextContent(parent$141, ""), hostParentFiber.flags &= -33);
            var before$142 = getHostSibling(finishedWork);
            insertOrAppendPlacementNode(finishedWork, before$142, parent$141);
            break;
          case 3:
          case 4:
            var parent$143 = hostParentFiber.stateNode.containerInfo, before$144 = getHostSibling(finishedWork);
            insertOrAppendPlacementNodeIntoContainer(
              finishedWork,
              before$144,
              parent$143
            );
            break;
          default:
            throw Error(formatProdErrorMessage(161));
        }
      } catch (error) {
        captureCommitPhaseError(finishedWork, finishedWork.return, error);
      }
      finishedWork.flags &= -3;
    }
    flags & 4096 && (finishedWork.flags &= -4097);
  }
  function recursivelyResetForms(parentFiber) {
    if (parentFiber.subtreeFlags & 1024)
      for (parentFiber = parentFiber.child; null !== parentFiber; ) {
        var fiber = parentFiber;
        recursivelyResetForms(fiber);
        5 === fiber.tag && fiber.flags & 1024 && fiber.stateNode.reset();
        parentFiber = parentFiber.sibling;
      }
  }
  function recursivelyTraverseLayoutEffects(root2, parentFiber) {
    if (parentFiber.subtreeFlags & 8772)
      for (parentFiber = parentFiber.child; null !== parentFiber; )
        commitLayoutEffectOnFiber(root2, parentFiber.alternate, parentFiber), parentFiber = parentFiber.sibling;
  }
  function recursivelyTraverseDisappearLayoutEffects(parentFiber) {
    for (parentFiber = parentFiber.child; null !== parentFiber; ) {
      var finishedWork = parentFiber;
      switch (finishedWork.tag) {
        case 0:
        case 11:
        case 14:
        case 15:
          commitHookEffectListUnmount(4, finishedWork, finishedWork.return);
          recursivelyTraverseDisappearLayoutEffects(finishedWork);
          break;
        case 1:
          safelyDetachRef(finishedWork, finishedWork.return);
          var instance = finishedWork.stateNode;
          "function" === typeof instance.componentWillUnmount && safelyCallComponentWillUnmount(
            finishedWork,
            finishedWork.return,
            instance
          );
          recursivelyTraverseDisappearLayoutEffects(finishedWork);
          break;
        case 27:
          releaseSingletonInstance(finishedWork.stateNode);
        case 26:
        case 5:
          safelyDetachRef(finishedWork, finishedWork.return);
          recursivelyTraverseDisappearLayoutEffects(finishedWork);
          break;
        case 22:
          null === finishedWork.memoizedState && recursivelyTraverseDisappearLayoutEffects(finishedWork);
          break;
        case 30:
          recursivelyTraverseDisappearLayoutEffects(finishedWork);
          break;
        default:
          recursivelyTraverseDisappearLayoutEffects(finishedWork);
      }
      parentFiber = parentFiber.sibling;
    }
  }
  function recursivelyTraverseReappearLayoutEffects(finishedRoot$jscomp$0, parentFiber, includeWorkInProgressEffects) {
    includeWorkInProgressEffects = includeWorkInProgressEffects && 0 !== (parentFiber.subtreeFlags & 8772);
    for (parentFiber = parentFiber.child; null !== parentFiber; ) {
      var current = parentFiber.alternate, finishedRoot = finishedRoot$jscomp$0, finishedWork = parentFiber, flags = finishedWork.flags;
      switch (finishedWork.tag) {
        case 0:
        case 11:
        case 15:
          recursivelyTraverseReappearLayoutEffects(
            finishedRoot,
            finishedWork,
            includeWorkInProgressEffects
          );
          commitHookEffectListMount(4, finishedWork);
          break;
        case 1:
          recursivelyTraverseReappearLayoutEffects(
            finishedRoot,
            finishedWork,
            includeWorkInProgressEffects
          );
          current = finishedWork;
          finishedRoot = current.stateNode;
          if ("function" === typeof finishedRoot.componentDidMount)
            try {
              finishedRoot.componentDidMount();
            } catch (error) {
              captureCommitPhaseError(current, current.return, error);
            }
          current = finishedWork;
          finishedRoot = current.updateQueue;
          if (null !== finishedRoot) {
            var instance = current.stateNode;
            try {
              var hiddenCallbacks = finishedRoot.shared.hiddenCallbacks;
              if (null !== hiddenCallbacks)
                for (finishedRoot.shared.hiddenCallbacks = null, finishedRoot = 0; finishedRoot < hiddenCallbacks.length; finishedRoot++)
                  callCallback(hiddenCallbacks[finishedRoot], instance);
            } catch (error) {
              captureCommitPhaseError(current, current.return, error);
            }
          }
          includeWorkInProgressEffects && flags & 64 && commitClassCallbacks(finishedWork);
          safelyAttachRef(finishedWork, finishedWork.return);
          break;
        case 27:
          commitHostSingletonAcquisition(finishedWork);
        case 26:
        case 5:
          recursivelyTraverseReappearLayoutEffects(
            finishedRoot,
            finishedWork,
            includeWorkInProgressEffects
          );
          includeWorkInProgressEffects && null === current && flags & 4 && commitHostMount(finishedWork);
          safelyAttachRef(finishedWork, finishedWork.return);
          break;
        case 12:
          recursivelyTraverseReappearLayoutEffects(
            finishedRoot,
            finishedWork,
            includeWorkInProgressEffects
          );
          break;
        case 31:
          recursivelyTraverseReappearLayoutEffects(
            finishedRoot,
            finishedWork,
            includeWorkInProgressEffects
          );
          includeWorkInProgressEffects && flags & 4 && commitActivityHydrationCallbacks(finishedRoot, finishedWork);
          break;
        case 13:
          recursivelyTraverseReappearLayoutEffects(
            finishedRoot,
            finishedWork,
            includeWorkInProgressEffects
          );
          includeWorkInProgressEffects && flags & 4 && commitSuspenseHydrationCallbacks(finishedRoot, finishedWork);
          break;
        case 22:
          null === finishedWork.memoizedState && recursivelyTraverseReappearLayoutEffects(
            finishedRoot,
            finishedWork,
            includeWorkInProgressEffects
          );
          safelyAttachRef(finishedWork, finishedWork.return);
          break;
        case 30:
          break;
        default:
          recursivelyTraverseReappearLayoutEffects(
            finishedRoot,
            finishedWork,
            includeWorkInProgressEffects
          );
      }
      parentFiber = parentFiber.sibling;
    }
  }
  function commitOffscreenPassiveMountEffects(current, finishedWork) {
    var previousCache = null;
    null !== current && null !== current.memoizedState && null !== current.memoizedState.cachePool && (previousCache = current.memoizedState.cachePool.pool);
    current = null;
    null !== finishedWork.memoizedState && null !== finishedWork.memoizedState.cachePool && (current = finishedWork.memoizedState.cachePool.pool);
    current !== previousCache && (null != current && current.refCount++, null != previousCache && releaseCache(previousCache));
  }
  function commitCachePassiveMountEffect(current, finishedWork) {
    current = null;
    null !== finishedWork.alternate && (current = finishedWork.alternate.memoizedState.cache);
    finishedWork = finishedWork.memoizedState.cache;
    finishedWork !== current && (finishedWork.refCount++, null != current && releaseCache(current));
  }
  function recursivelyTraversePassiveMountEffects(root2, parentFiber, committedLanes, committedTransitions) {
    if (parentFiber.subtreeFlags & 10256)
      for (parentFiber = parentFiber.child; null !== parentFiber; )
        commitPassiveMountOnFiber(
          root2,
          parentFiber,
          committedLanes,
          committedTransitions
        ), parentFiber = parentFiber.sibling;
  }
  function commitPassiveMountOnFiber(finishedRoot, finishedWork, committedLanes, committedTransitions) {
    var flags = finishedWork.flags;
    switch (finishedWork.tag) {
      case 0:
      case 11:
      case 15:
        recursivelyTraversePassiveMountEffects(
          finishedRoot,
          finishedWork,
          committedLanes,
          committedTransitions
        );
        flags & 2048 && commitHookEffectListMount(9, finishedWork);
        break;
      case 1:
        recursivelyTraversePassiveMountEffects(
          finishedRoot,
          finishedWork,
          committedLanes,
          committedTransitions
        );
        break;
      case 3:
        recursivelyTraversePassiveMountEffects(
          finishedRoot,
          finishedWork,
          committedLanes,
          committedTransitions
        );
        flags & 2048 && (finishedRoot = null, null !== finishedWork.alternate && (finishedRoot = finishedWork.alternate.memoizedState.cache), finishedWork = finishedWork.memoizedState.cache, finishedWork !== finishedRoot && (finishedWork.refCount++, null != finishedRoot && releaseCache(finishedRoot)));
        break;
      case 12:
        if (flags & 2048) {
          recursivelyTraversePassiveMountEffects(
            finishedRoot,
            finishedWork,
            committedLanes,
            committedTransitions
          );
          finishedRoot = finishedWork.stateNode;
          try {
            var _finishedWork$memoize2 = finishedWork.memoizedProps, id = _finishedWork$memoize2.id, onPostCommit = _finishedWork$memoize2.onPostCommit;
            "function" === typeof onPostCommit && onPostCommit(
              id,
              null === finishedWork.alternate ? "mount" : "update",
              finishedRoot.passiveEffectDuration,
              -0
            );
          } catch (error) {
            captureCommitPhaseError(finishedWork, finishedWork.return, error);
          }
        } else
          recursivelyTraversePassiveMountEffects(
            finishedRoot,
            finishedWork,
            committedLanes,
            committedTransitions
          );
        break;
      case 31:
        recursivelyTraversePassiveMountEffects(
          finishedRoot,
          finishedWork,
          committedLanes,
          committedTransitions
        );
        break;
      case 13:
        recursivelyTraversePassiveMountEffects(
          finishedRoot,
          finishedWork,
          committedLanes,
          committedTransitions
        );
        break;
      case 23:
        break;
      case 22:
        _finishedWork$memoize2 = finishedWork.stateNode;
        id = finishedWork.alternate;
        null !== finishedWork.memoizedState ? _finishedWork$memoize2._visibility & 2 ? recursivelyTraversePassiveMountEffects(
          finishedRoot,
          finishedWork,
          committedLanes,
          committedTransitions
        ) : recursivelyTraverseAtomicPassiveEffects(finishedRoot, finishedWork) : _finishedWork$memoize2._visibility & 2 ? recursivelyTraversePassiveMountEffects(
          finishedRoot,
          finishedWork,
          committedLanes,
          committedTransitions
        ) : (_finishedWork$memoize2._visibility |= 2, recursivelyTraverseReconnectPassiveEffects(
          finishedRoot,
          finishedWork,
          committedLanes,
          committedTransitions,
          0 !== (finishedWork.subtreeFlags & 10256) || false
        ));
        flags & 2048 && commitOffscreenPassiveMountEffects(id, finishedWork);
        break;
      case 24:
        recursivelyTraversePassiveMountEffects(
          finishedRoot,
          finishedWork,
          committedLanes,
          committedTransitions
        );
        flags & 2048 && commitCachePassiveMountEffect(finishedWork.alternate, finishedWork);
        break;
      default:
        recursivelyTraversePassiveMountEffects(
          finishedRoot,
          finishedWork,
          committedLanes,
          committedTransitions
        );
    }
  }
  function recursivelyTraverseReconnectPassiveEffects(finishedRoot$jscomp$0, parentFiber, committedLanes$jscomp$0, committedTransitions$jscomp$0, includeWorkInProgressEffects) {
    includeWorkInProgressEffects = includeWorkInProgressEffects && (0 !== (parentFiber.subtreeFlags & 10256) || false);
    for (parentFiber = parentFiber.child; null !== parentFiber; ) {
      var finishedRoot = finishedRoot$jscomp$0, finishedWork = parentFiber, committedLanes = committedLanes$jscomp$0, committedTransitions = committedTransitions$jscomp$0, flags = finishedWork.flags;
      switch (finishedWork.tag) {
        case 0:
        case 11:
        case 15:
          recursivelyTraverseReconnectPassiveEffects(
            finishedRoot,
            finishedWork,
            committedLanes,
            committedTransitions,
            includeWorkInProgressEffects
          );
          commitHookEffectListMount(8, finishedWork);
          break;
        case 23:
          break;
        case 22:
          var instance = finishedWork.stateNode;
          null !== finishedWork.memoizedState ? instance._visibility & 2 ? recursivelyTraverseReconnectPassiveEffects(
            finishedRoot,
            finishedWork,
            committedLanes,
            committedTransitions,
            includeWorkInProgressEffects
          ) : recursivelyTraverseAtomicPassiveEffects(
            finishedRoot,
            finishedWork
          ) : (instance._visibility |= 2, recursivelyTraverseReconnectPassiveEffects(
            finishedRoot,
            finishedWork,
            committedLanes,
            committedTransitions,
            includeWorkInProgressEffects
          ));
          includeWorkInProgressEffects && flags & 2048 && commitOffscreenPassiveMountEffects(
            finishedWork.alternate,
            finishedWork
          );
          break;
        case 24:
          recursivelyTraverseReconnectPassiveEffects(
            finishedRoot,
            finishedWork,
            committedLanes,
            committedTransitions,
            includeWorkInProgressEffects
          );
          includeWorkInProgressEffects && flags & 2048 && commitCachePassiveMountEffect(finishedWork.alternate, finishedWork);
          break;
        default:
          recursivelyTraverseReconnectPassiveEffects(
            finishedRoot,
            finishedWork,
            committedLanes,
            committedTransitions,
            includeWorkInProgressEffects
          );
      }
      parentFiber = parentFiber.sibling;
    }
  }
  function recursivelyTraverseAtomicPassiveEffects(finishedRoot$jscomp$0, parentFiber) {
    if (parentFiber.subtreeFlags & 10256)
      for (parentFiber = parentFiber.child; null !== parentFiber; ) {
        var finishedRoot = finishedRoot$jscomp$0, finishedWork = parentFiber, flags = finishedWork.flags;
        switch (finishedWork.tag) {
          case 22:
            recursivelyTraverseAtomicPassiveEffects(finishedRoot, finishedWork);
            flags & 2048 && commitOffscreenPassiveMountEffects(
              finishedWork.alternate,
              finishedWork
            );
            break;
          case 24:
            recursivelyTraverseAtomicPassiveEffects(finishedRoot, finishedWork);
            flags & 2048 && commitCachePassiveMountEffect(finishedWork.alternate, finishedWork);
            break;
          default:
            recursivelyTraverseAtomicPassiveEffects(finishedRoot, finishedWork);
        }
        parentFiber = parentFiber.sibling;
      }
  }
  var suspenseyCommitFlag = 8192;
  function recursivelyAccumulateSuspenseyCommit(parentFiber, committedLanes, suspendedState) {
    if (parentFiber.subtreeFlags & suspenseyCommitFlag)
      for (parentFiber = parentFiber.child; null !== parentFiber; )
        accumulateSuspenseyCommitOnFiber(
          parentFiber,
          committedLanes,
          suspendedState
        ), parentFiber = parentFiber.sibling;
  }
  function accumulateSuspenseyCommitOnFiber(fiber, committedLanes, suspendedState) {
    switch (fiber.tag) {
      case 26:
        recursivelyAccumulateSuspenseyCommit(
          fiber,
          committedLanes,
          suspendedState
        );
        fiber.flags & suspenseyCommitFlag && null !== fiber.memoizedState && suspendResource(
          suspendedState,
          currentHoistableRoot,
          fiber.memoizedState,
          fiber.memoizedProps
        );
        break;
      case 5:
        recursivelyAccumulateSuspenseyCommit(
          fiber,
          committedLanes,
          suspendedState
        );
        break;
      case 3:
      case 4:
        var previousHoistableRoot = currentHoistableRoot;
        currentHoistableRoot = getHoistableRoot(fiber.stateNode.containerInfo);
        recursivelyAccumulateSuspenseyCommit(
          fiber,
          committedLanes,
          suspendedState
        );
        currentHoistableRoot = previousHoistableRoot;
        break;
      case 22:
        null === fiber.memoizedState && (previousHoistableRoot = fiber.alternate, null !== previousHoistableRoot && null !== previousHoistableRoot.memoizedState ? (previousHoistableRoot = suspenseyCommitFlag, suspenseyCommitFlag = 16777216, recursivelyAccumulateSuspenseyCommit(
          fiber,
          committedLanes,
          suspendedState
        ), suspenseyCommitFlag = previousHoistableRoot) : recursivelyAccumulateSuspenseyCommit(
          fiber,
          committedLanes,
          suspendedState
        ));
        break;
      default:
        recursivelyAccumulateSuspenseyCommit(
          fiber,
          committedLanes,
          suspendedState
        );
    }
  }
  function detachAlternateSiblings(parentFiber) {
    var previousFiber = parentFiber.alternate;
    if (null !== previousFiber && (parentFiber = previousFiber.child, null !== parentFiber)) {
      previousFiber.child = null;
      do
        previousFiber = parentFiber.sibling, parentFiber.sibling = null, parentFiber = previousFiber;
      while (null !== parentFiber);
    }
  }
  function recursivelyTraversePassiveUnmountEffects(parentFiber) {
    var deletions = parentFiber.deletions;
    if (0 !== (parentFiber.flags & 16)) {
      if (null !== deletions)
        for (var i = 0; i < deletions.length; i++) {
          var childToDelete = deletions[i];
          nextEffect = childToDelete;
          commitPassiveUnmountEffectsInsideOfDeletedTree_begin(
            childToDelete,
            parentFiber
          );
        }
      detachAlternateSiblings(parentFiber);
    }
    if (parentFiber.subtreeFlags & 10256)
      for (parentFiber = parentFiber.child; null !== parentFiber; )
        commitPassiveUnmountOnFiber(parentFiber), parentFiber = parentFiber.sibling;
  }
  function commitPassiveUnmountOnFiber(finishedWork) {
    switch (finishedWork.tag) {
      case 0:
      case 11:
      case 15:
        recursivelyTraversePassiveUnmountEffects(finishedWork);
        finishedWork.flags & 2048 && commitHookEffectListUnmount(9, finishedWork, finishedWork.return);
        break;
      case 3:
        recursivelyTraversePassiveUnmountEffects(finishedWork);
        break;
      case 12:
        recursivelyTraversePassiveUnmountEffects(finishedWork);
        break;
      case 22:
        var instance = finishedWork.stateNode;
        null !== finishedWork.memoizedState && instance._visibility & 2 && (null === finishedWork.return || 13 !== finishedWork.return.tag) ? (instance._visibility &= -3, recursivelyTraverseDisconnectPassiveEffects(finishedWork)) : recursivelyTraversePassiveUnmountEffects(finishedWork);
        break;
      default:
        recursivelyTraversePassiveUnmountEffects(finishedWork);
    }
  }
  function recursivelyTraverseDisconnectPassiveEffects(parentFiber) {
    var deletions = parentFiber.deletions;
    if (0 !== (parentFiber.flags & 16)) {
      if (null !== deletions)
        for (var i = 0; i < deletions.length; i++) {
          var childToDelete = deletions[i];
          nextEffect = childToDelete;
          commitPassiveUnmountEffectsInsideOfDeletedTree_begin(
            childToDelete,
            parentFiber
          );
        }
      detachAlternateSiblings(parentFiber);
    }
    for (parentFiber = parentFiber.child; null !== parentFiber; ) {
      deletions = parentFiber;
      switch (deletions.tag) {
        case 0:
        case 11:
        case 15:
          commitHookEffectListUnmount(8, deletions, deletions.return);
          recursivelyTraverseDisconnectPassiveEffects(deletions);
          break;
        case 22:
          i = deletions.stateNode;
          i._visibility & 2 && (i._visibility &= -3, recursivelyTraverseDisconnectPassiveEffects(deletions));
          break;
        default:
          recursivelyTraverseDisconnectPassiveEffects(deletions);
      }
      parentFiber = parentFiber.sibling;
    }
  }
  function commitPassiveUnmountEffectsInsideOfDeletedTree_begin(deletedSubtreeRoot, nearestMountedAncestor) {
    for (; null !== nextEffect; ) {
      var fiber = nextEffect;
      switch (fiber.tag) {
        case 0:
        case 11:
        case 15:
          commitHookEffectListUnmount(8, fiber, nearestMountedAncestor);
          break;
        case 23:
        case 22:
          if (null !== fiber.memoizedState && null !== fiber.memoizedState.cachePool) {
            var cache = fiber.memoizedState.cachePool.pool;
            null != cache && cache.refCount++;
          }
          break;
        case 24:
          releaseCache(fiber.memoizedState.cache);
      }
      cache = fiber.child;
      if (null !== cache) cache.return = fiber, nextEffect = cache;
      else
        a: for (fiber = deletedSubtreeRoot; null !== nextEffect; ) {
          cache = nextEffect;
          var sibling = cache.sibling, returnFiber = cache.return;
          detachFiberAfterEffects(cache);
          if (cache === fiber) {
            nextEffect = null;
            break a;
          }
          if (null !== sibling) {
            sibling.return = returnFiber;
            nextEffect = sibling;
            break a;
          }
          nextEffect = returnFiber;
        }
    }
  }
  var DefaultAsyncDispatcher = {
    getCacheForType: function(resourceType) {
      var cache = readContext(CacheContext), cacheForType = cache.data.get(resourceType);
      void 0 === cacheForType && (cacheForType = resourceType(), cache.data.set(resourceType, cacheForType));
      return cacheForType;
    },
    cacheSignal: function() {
      return readContext(CacheContext).controller.signal;
    }
  }, PossiblyWeakMap = "function" === typeof WeakMap ? WeakMap : Map, executionContext = 0, workInProgressRoot = null, workInProgress = null, workInProgressRootRenderLanes = 0, workInProgressSuspendedReason = 0, workInProgressThrownValue = null, workInProgressRootDidSkipSuspendedSiblings = false, workInProgressRootIsPrerendering = false, workInProgressRootDidAttachPingListener = false, entangledRenderLanes = 0, workInProgressRootExitStatus = 0, workInProgressRootSkippedLanes = 0, workInProgressRootInterleavedUpdatedLanes = 0, workInProgressRootPingedLanes = 0, workInProgressDeferredLane = 0, workInProgressSuspendedRetryLanes = 0, workInProgressRootConcurrentErrors = null, workInProgressRootRecoverableErrors = null, workInProgressRootDidIncludeRecursiveRenderUpdate = false, globalMostRecentFallbackTime = 0, globalMostRecentTransitionTime = 0, workInProgressRootRenderTargetTime = Infinity, workInProgressTransitions = null, legacyErrorBoundariesThatAlreadyFailed = null, pendingEffectsStatus = 0, pendingEffectsRoot = null, pendingFinishedWork = null, pendingEffectsLanes = 0, pendingEffectsRemainingLanes = 0, pendingPassiveTransitions = null, pendingRecoverableErrors = null, nestedUpdateCount = 0, rootWithNestedUpdates = null;
  function requestUpdateLane() {
    return 0 !== (executionContext & 2) && 0 !== workInProgressRootRenderLanes ? workInProgressRootRenderLanes & -workInProgressRootRenderLanes : null !== ReactSharedInternals.T ? requestTransitionLane() : resolveUpdatePriority();
  }
  function requestDeferredLane() {
    if (0 === workInProgressDeferredLane)
      if (0 === (workInProgressRootRenderLanes & 536870912) || isHydrating) {
        var lane = nextTransitionDeferredLane;
        nextTransitionDeferredLane <<= 1;
        0 === (nextTransitionDeferredLane & 3932160) && (nextTransitionDeferredLane = 262144);
        workInProgressDeferredLane = lane;
      } else workInProgressDeferredLane = 536870912;
    lane = suspenseHandlerStackCursor.current;
    null !== lane && (lane.flags |= 32);
    return workInProgressDeferredLane;
  }
  function scheduleUpdateOnFiber(root2, fiber, lane) {
    if (root2 === workInProgressRoot && (2 === workInProgressSuspendedReason || 9 === workInProgressSuspendedReason) || null !== root2.cancelPendingCommit)
      prepareFreshStack(root2, 0), markRootSuspended(
        root2,
        workInProgressRootRenderLanes,
        workInProgressDeferredLane,
        false
      );
    markRootUpdated$1(root2, lane);
    if (0 === (executionContext & 2) || root2 !== workInProgressRoot)
      root2 === workInProgressRoot && (0 === (executionContext & 2) && (workInProgressRootInterleavedUpdatedLanes |= lane), 4 === workInProgressRootExitStatus && markRootSuspended(
        root2,
        workInProgressRootRenderLanes,
        workInProgressDeferredLane,
        false
      )), ensureRootIsScheduled(root2);
  }
  function performWorkOnRoot(root$jscomp$0, lanes, forceSync) {
    if (0 !== (executionContext & 6)) throw Error(formatProdErrorMessage(327));
    var shouldTimeSlice = !forceSync && 0 === (lanes & 127) && 0 === (lanes & root$jscomp$0.expiredLanes) || checkIfRootIsPrerendering(root$jscomp$0, lanes), exitStatus = shouldTimeSlice ? renderRootConcurrent(root$jscomp$0, lanes) : renderRootSync(root$jscomp$0, lanes, true), renderWasConcurrent = shouldTimeSlice;
    do {
      if (0 === exitStatus) {
        workInProgressRootIsPrerendering && !shouldTimeSlice && markRootSuspended(root$jscomp$0, lanes, 0, false);
        break;
      } else {
        forceSync = root$jscomp$0.current.alternate;
        if (renderWasConcurrent && !isRenderConsistentWithExternalStores(forceSync)) {
          exitStatus = renderRootSync(root$jscomp$0, lanes, false);
          renderWasConcurrent = false;
          continue;
        }
        if (2 === exitStatus) {
          renderWasConcurrent = lanes;
          if (root$jscomp$0.errorRecoveryDisabledLanes & renderWasConcurrent)
            var JSCompiler_inline_result = 0;
          else
            JSCompiler_inline_result = root$jscomp$0.pendingLanes & -536870913, JSCompiler_inline_result = 0 !== JSCompiler_inline_result ? JSCompiler_inline_result : JSCompiler_inline_result & 536870912 ? 536870912 : 0;
          if (0 !== JSCompiler_inline_result) {
            lanes = JSCompiler_inline_result;
            a: {
              var root2 = root$jscomp$0;
              exitStatus = workInProgressRootConcurrentErrors;
              var wasRootDehydrated = root2.current.memoizedState.isDehydrated;
              wasRootDehydrated && (prepareFreshStack(root2, JSCompiler_inline_result).flags |= 256);
              JSCompiler_inline_result = renderRootSync(
                root2,
                JSCompiler_inline_result,
                false
              );
              if (2 !== JSCompiler_inline_result) {
                if (workInProgressRootDidAttachPingListener && !wasRootDehydrated) {
                  root2.errorRecoveryDisabledLanes |= renderWasConcurrent;
                  workInProgressRootInterleavedUpdatedLanes |= renderWasConcurrent;
                  exitStatus = 4;
                  break a;
                }
                renderWasConcurrent = workInProgressRootRecoverableErrors;
                workInProgressRootRecoverableErrors = exitStatus;
                null !== renderWasConcurrent && (null === workInProgressRootRecoverableErrors ? workInProgressRootRecoverableErrors = renderWasConcurrent : workInProgressRootRecoverableErrors.push.apply(
                  workInProgressRootRecoverableErrors,
                  renderWasConcurrent
                ));
              }
              exitStatus = JSCompiler_inline_result;
            }
            renderWasConcurrent = false;
            if (2 !== exitStatus) continue;
          }
        }
        if (1 === exitStatus) {
          prepareFreshStack(root$jscomp$0, 0);
          markRootSuspended(root$jscomp$0, lanes, 0, true);
          break;
        }
        a: {
          shouldTimeSlice = root$jscomp$0;
          renderWasConcurrent = exitStatus;
          switch (renderWasConcurrent) {
            case 0:
            case 1:
              throw Error(formatProdErrorMessage(345));
            case 4:
              if ((lanes & 4194048) !== lanes) break;
            case 6:
              markRootSuspended(
                shouldTimeSlice,
                lanes,
                workInProgressDeferredLane,
                !workInProgressRootDidSkipSuspendedSiblings
              );
              break a;
            case 2:
              workInProgressRootRecoverableErrors = null;
              break;
            case 3:
            case 5:
              break;
            default:
              throw Error(formatProdErrorMessage(329));
          }
          if ((lanes & 62914560) === lanes && (exitStatus = globalMostRecentFallbackTime + 300 - now(), 10 < exitStatus)) {
            markRootSuspended(
              shouldTimeSlice,
              lanes,
              workInProgressDeferredLane,
              !workInProgressRootDidSkipSuspendedSiblings
            );
            if (0 !== getNextLanes(shouldTimeSlice, 0, true)) break a;
            pendingEffectsLanes = lanes;
            shouldTimeSlice.timeoutHandle = scheduleTimeout(
              commitRootWhenReady.bind(
                null,
                shouldTimeSlice,
                forceSync,
                workInProgressRootRecoverableErrors,
                workInProgressTransitions,
                workInProgressRootDidIncludeRecursiveRenderUpdate,
                lanes,
                workInProgressDeferredLane,
                workInProgressRootInterleavedUpdatedLanes,
                workInProgressSuspendedRetryLanes,
                workInProgressRootDidSkipSuspendedSiblings,
                renderWasConcurrent,
                "Throttled",
                -0,
                0
              ),
              exitStatus
            );
            break a;
          }
          commitRootWhenReady(
            shouldTimeSlice,
            forceSync,
            workInProgressRootRecoverableErrors,
            workInProgressTransitions,
            workInProgressRootDidIncludeRecursiveRenderUpdate,
            lanes,
            workInProgressDeferredLane,
            workInProgressRootInterleavedUpdatedLanes,
            workInProgressSuspendedRetryLanes,
            workInProgressRootDidSkipSuspendedSiblings,
            renderWasConcurrent,
            null,
            -0,
            0
          );
        }
      }
      break;
    } while (1);
    ensureRootIsScheduled(root$jscomp$0);
  }
  function commitRootWhenReady(root2, finishedWork, recoverableErrors, transitions, didIncludeRenderPhaseUpdate, lanes, spawnedLane, updatedLanes, suspendedRetryLanes, didSkipSuspendedSiblings, exitStatus, suspendedCommitReason, completedRenderStartTime, completedRenderEndTime) {
    root2.timeoutHandle = -1;
    suspendedCommitReason = finishedWork.subtreeFlags;
    if (suspendedCommitReason & 8192 || 16785408 === (suspendedCommitReason & 16785408)) {
      suspendedCommitReason = {
        stylesheets: null,
        count: 0,
        imgCount: 0,
        imgBytes: 0,
        suspenseyImages: [],
        waitingForImages: true,
        waitingForViewTransition: false,
        unsuspend: noop$1
      };
      accumulateSuspenseyCommitOnFiber(
        finishedWork,
        lanes,
        suspendedCommitReason
      );
      var timeoutOffset = (lanes & 62914560) === lanes ? globalMostRecentFallbackTime - now() : (lanes & 4194048) === lanes ? globalMostRecentTransitionTime - now() : 0;
      timeoutOffset = waitForCommitToBeReady(
        suspendedCommitReason,
        timeoutOffset
      );
      if (null !== timeoutOffset) {
        pendingEffectsLanes = lanes;
        root2.cancelPendingCommit = timeoutOffset(
          commitRoot.bind(
            null,
            root2,
            finishedWork,
            lanes,
            recoverableErrors,
            transitions,
            didIncludeRenderPhaseUpdate,
            spawnedLane,
            updatedLanes,
            suspendedRetryLanes,
            exitStatus,
            suspendedCommitReason,
            null,
            completedRenderStartTime,
            completedRenderEndTime
          )
        );
        markRootSuspended(root2, lanes, spawnedLane, !didSkipSuspendedSiblings);
        return;
      }
    }
    commitRoot(
      root2,
      finishedWork,
      lanes,
      recoverableErrors,
      transitions,
      didIncludeRenderPhaseUpdate,
      spawnedLane,
      updatedLanes,
      suspendedRetryLanes
    );
  }
  function isRenderConsistentWithExternalStores(finishedWork) {
    for (var node = finishedWork; ; ) {
      var tag = node.tag;
      if ((0 === tag || 11 === tag || 15 === tag) && node.flags & 16384 && (tag = node.updateQueue, null !== tag && (tag = tag.stores, null !== tag)))
        for (var i = 0; i < tag.length; i++) {
          var check = tag[i], getSnapshot = check.getSnapshot;
          check = check.value;
          try {
            if (!objectIs(getSnapshot(), check)) return false;
          } catch (error) {
            return false;
          }
        }
      tag = node.child;
      if (node.subtreeFlags & 16384 && null !== tag)
        tag.return = node, node = tag;
      else {
        if (node === finishedWork) break;
        for (; null === node.sibling; ) {
          if (null === node.return || node.return === finishedWork) return true;
          node = node.return;
        }
        node.sibling.return = node.return;
        node = node.sibling;
      }
    }
    return true;
  }
  function markRootSuspended(root2, suspendedLanes, spawnedLane, didAttemptEntireTree) {
    suspendedLanes &= ~workInProgressRootPingedLanes;
    suspendedLanes &= ~workInProgressRootInterleavedUpdatedLanes;
    root2.suspendedLanes |= suspendedLanes;
    root2.pingedLanes &= ~suspendedLanes;
    didAttemptEntireTree && (root2.warmLanes |= suspendedLanes);
    didAttemptEntireTree = root2.expirationTimes;
    for (var lanes = suspendedLanes; 0 < lanes; ) {
      var index$6 = 31 - clz32(lanes), lane = 1 << index$6;
      didAttemptEntireTree[index$6] = -1;
      lanes &= ~lane;
    }
    0 !== spawnedLane && markSpawnedDeferredLane(root2, spawnedLane, suspendedLanes);
  }
  function flushSyncWork$1() {
    return 0 === (executionContext & 6) ? (flushSyncWorkAcrossRoots_impl(0), false) : true;
  }
  function resetWorkInProgressStack() {
    if (null !== workInProgress) {
      if (0 === workInProgressSuspendedReason)
        var interruptedWork = workInProgress.return;
      else
        interruptedWork = workInProgress, lastContextDependency = currentlyRenderingFiber$1 = null, resetHooksOnUnwind(interruptedWork), thenableState$1 = null, thenableIndexCounter$1 = 0, interruptedWork = workInProgress;
      for (; null !== interruptedWork; )
        unwindInterruptedWork(interruptedWork.alternate, interruptedWork), interruptedWork = interruptedWork.return;
      workInProgress = null;
    }
  }
  function prepareFreshStack(root2, lanes) {
    var timeoutHandle = root2.timeoutHandle;
    -1 !== timeoutHandle && (root2.timeoutHandle = -1, cancelTimeout(timeoutHandle));
    timeoutHandle = root2.cancelPendingCommit;
    null !== timeoutHandle && (root2.cancelPendingCommit = null, timeoutHandle());
    pendingEffectsLanes = 0;
    resetWorkInProgressStack();
    workInProgressRoot = root2;
    workInProgress = timeoutHandle = createWorkInProgress(root2.current, null);
    workInProgressRootRenderLanes = lanes;
    workInProgressSuspendedReason = 0;
    workInProgressThrownValue = null;
    workInProgressRootDidSkipSuspendedSiblings = false;
    workInProgressRootIsPrerendering = checkIfRootIsPrerendering(root2, lanes);
    workInProgressRootDidAttachPingListener = false;
    workInProgressSuspendedRetryLanes = workInProgressDeferredLane = workInProgressRootPingedLanes = workInProgressRootInterleavedUpdatedLanes = workInProgressRootSkippedLanes = workInProgressRootExitStatus = 0;
    workInProgressRootRecoverableErrors = workInProgressRootConcurrentErrors = null;
    workInProgressRootDidIncludeRecursiveRenderUpdate = false;
    0 !== (lanes & 8) && (lanes |= lanes & 32);
    var allEntangledLanes = root2.entangledLanes;
    if (0 !== allEntangledLanes)
      for (root2 = root2.entanglements, allEntangledLanes &= lanes; 0 < allEntangledLanes; ) {
        var index$4 = 31 - clz32(allEntangledLanes), lane = 1 << index$4;
        lanes |= root2[index$4];
        allEntangledLanes &= ~lane;
      }
    entangledRenderLanes = lanes;
    finishQueueingConcurrentUpdates();
    return timeoutHandle;
  }
  function handleThrow(root2, thrownValue) {
    currentlyRenderingFiber = null;
    ReactSharedInternals.H = ContextOnlyDispatcher;
    thrownValue === SuspenseException || thrownValue === SuspenseActionException ? (thrownValue = getSuspendedThenable(), workInProgressSuspendedReason = 3) : thrownValue === SuspenseyCommitException ? (thrownValue = getSuspendedThenable(), workInProgressSuspendedReason = 4) : workInProgressSuspendedReason = thrownValue === SelectiveHydrationException ? 8 : null !== thrownValue && "object" === typeof thrownValue && "function" === typeof thrownValue.then ? 6 : 1;
    workInProgressThrownValue = thrownValue;
    null === workInProgress && (workInProgressRootExitStatus = 1, logUncaughtError(
      root2,
      createCapturedValueAtFiber(thrownValue, root2.current)
    ));
  }
  function shouldRemainOnPreviousScreen() {
    var handler = suspenseHandlerStackCursor.current;
    return null === handler ? true : (workInProgressRootRenderLanes & 4194048) === workInProgressRootRenderLanes ? null === shellBoundary ? true : false : (workInProgressRootRenderLanes & 62914560) === workInProgressRootRenderLanes || 0 !== (workInProgressRootRenderLanes & 536870912) ? handler === shellBoundary : false;
  }
  function pushDispatcher() {
    var prevDispatcher = ReactSharedInternals.H;
    ReactSharedInternals.H = ContextOnlyDispatcher;
    return null === prevDispatcher ? ContextOnlyDispatcher : prevDispatcher;
  }
  function pushAsyncDispatcher() {
    var prevAsyncDispatcher = ReactSharedInternals.A;
    ReactSharedInternals.A = DefaultAsyncDispatcher;
    return prevAsyncDispatcher;
  }
  function renderDidSuspendDelayIfPossible() {
    workInProgressRootExitStatus = 4;
    workInProgressRootDidSkipSuspendedSiblings || (workInProgressRootRenderLanes & 4194048) !== workInProgressRootRenderLanes && null !== suspenseHandlerStackCursor.current || (workInProgressRootIsPrerendering = true);
    0 === (workInProgressRootSkippedLanes & 134217727) && 0 === (workInProgressRootInterleavedUpdatedLanes & 134217727) || null === workInProgressRoot || markRootSuspended(
      workInProgressRoot,
      workInProgressRootRenderLanes,
      workInProgressDeferredLane,
      false
    );
  }
  function renderRootSync(root2, lanes, shouldYieldForPrerendering) {
    var prevExecutionContext = executionContext;
    executionContext |= 2;
    var prevDispatcher = pushDispatcher(), prevAsyncDispatcher = pushAsyncDispatcher();
    if (workInProgressRoot !== root2 || workInProgressRootRenderLanes !== lanes)
      workInProgressTransitions = null, prepareFreshStack(root2, lanes);
    lanes = false;
    var exitStatus = workInProgressRootExitStatus;
    a: do
      try {
        if (0 !== workInProgressSuspendedReason && null !== workInProgress) {
          var unitOfWork = workInProgress, thrownValue = workInProgressThrownValue;
          switch (workInProgressSuspendedReason) {
            case 8:
              resetWorkInProgressStack();
              exitStatus = 6;
              break a;
            case 3:
            case 2:
            case 9:
            case 6:
              null === suspenseHandlerStackCursor.current && (lanes = true);
              var reason = workInProgressSuspendedReason;
              workInProgressSuspendedReason = 0;
              workInProgressThrownValue = null;
              throwAndUnwindWorkLoop(root2, unitOfWork, thrownValue, reason);
              if (shouldYieldForPrerendering && workInProgressRootIsPrerendering) {
                exitStatus = 0;
                break a;
              }
              break;
            default:
              reason = workInProgressSuspendedReason, workInProgressSuspendedReason = 0, workInProgressThrownValue = null, throwAndUnwindWorkLoop(root2, unitOfWork, thrownValue, reason);
          }
        }
        workLoopSync();
        exitStatus = workInProgressRootExitStatus;
        break;
      } catch (thrownValue$165) {
        handleThrow(root2, thrownValue$165);
      }
    while (1);
    lanes && root2.shellSuspendCounter++;
    lastContextDependency = currentlyRenderingFiber$1 = null;
    executionContext = prevExecutionContext;
    ReactSharedInternals.H = prevDispatcher;
    ReactSharedInternals.A = prevAsyncDispatcher;
    null === workInProgress && (workInProgressRoot = null, workInProgressRootRenderLanes = 0, finishQueueingConcurrentUpdates());
    return exitStatus;
  }
  function workLoopSync() {
    for (; null !== workInProgress; ) performUnitOfWork(workInProgress);
  }
  function renderRootConcurrent(root2, lanes) {
    var prevExecutionContext = executionContext;
    executionContext |= 2;
    var prevDispatcher = pushDispatcher(), prevAsyncDispatcher = pushAsyncDispatcher();
    workInProgressRoot !== root2 || workInProgressRootRenderLanes !== lanes ? (workInProgressTransitions = null, workInProgressRootRenderTargetTime = now() + 500, prepareFreshStack(root2, lanes)) : workInProgressRootIsPrerendering = checkIfRootIsPrerendering(
      root2,
      lanes
    );
    a: do
      try {
        if (0 !== workInProgressSuspendedReason && null !== workInProgress) {
          lanes = workInProgress;
          var thrownValue = workInProgressThrownValue;
          b: switch (workInProgressSuspendedReason) {
            case 1:
              workInProgressSuspendedReason = 0;
              workInProgressThrownValue = null;
              throwAndUnwindWorkLoop(root2, lanes, thrownValue, 1);
              break;
            case 2:
            case 9:
              if (isThenableResolved(thrownValue)) {
                workInProgressSuspendedReason = 0;
                workInProgressThrownValue = null;
                replaySuspendedUnitOfWork(lanes);
                break;
              }
              lanes = function() {
                2 !== workInProgressSuspendedReason && 9 !== workInProgressSuspendedReason || workInProgressRoot !== root2 || (workInProgressSuspendedReason = 7);
                ensureRootIsScheduled(root2);
              };
              thrownValue.then(lanes, lanes);
              break a;
            case 3:
              workInProgressSuspendedReason = 7;
              break a;
            case 4:
              workInProgressSuspendedReason = 5;
              break a;
            case 7:
              isThenableResolved(thrownValue) ? (workInProgressSuspendedReason = 0, workInProgressThrownValue = null, replaySuspendedUnitOfWork(lanes)) : (workInProgressSuspendedReason = 0, workInProgressThrownValue = null, throwAndUnwindWorkLoop(root2, lanes, thrownValue, 7));
              break;
            case 5:
              var resource = null;
              switch (workInProgress.tag) {
                case 26:
                  resource = workInProgress.memoizedState;
                case 5:
                case 27:
                  var hostFiber = workInProgress;
                  if (resource ? preloadResource(resource) : hostFiber.stateNode.complete) {
                    workInProgressSuspendedReason = 0;
                    workInProgressThrownValue = null;
                    var sibling = hostFiber.sibling;
                    if (null !== sibling) workInProgress = sibling;
                    else {
                      var returnFiber = hostFiber.return;
                      null !== returnFiber ? (workInProgress = returnFiber, completeUnitOfWork(returnFiber)) : workInProgress = null;
                    }
                    break b;
                  }
              }
              workInProgressSuspendedReason = 0;
              workInProgressThrownValue = null;
              throwAndUnwindWorkLoop(root2, lanes, thrownValue, 5);
              break;
            case 6:
              workInProgressSuspendedReason = 0;
              workInProgressThrownValue = null;
              throwAndUnwindWorkLoop(root2, lanes, thrownValue, 6);
              break;
            case 8:
              resetWorkInProgressStack();
              workInProgressRootExitStatus = 6;
              break a;
            default:
              throw Error(formatProdErrorMessage(462));
          }
        }
        workLoopConcurrentByScheduler();
        break;
      } catch (thrownValue$167) {
        handleThrow(root2, thrownValue$167);
      }
    while (1);
    lastContextDependency = currentlyRenderingFiber$1 = null;
    ReactSharedInternals.H = prevDispatcher;
    ReactSharedInternals.A = prevAsyncDispatcher;
    executionContext = prevExecutionContext;
    if (null !== workInProgress) return 0;
    workInProgressRoot = null;
    workInProgressRootRenderLanes = 0;
    finishQueueingConcurrentUpdates();
    return workInProgressRootExitStatus;
  }
  function workLoopConcurrentByScheduler() {
    for (; null !== workInProgress && !shouldYield(); )
      performUnitOfWork(workInProgress);
  }
  function performUnitOfWork(unitOfWork) {
    var next = beginWork(unitOfWork.alternate, unitOfWork, entangledRenderLanes);
    unitOfWork.memoizedProps = unitOfWork.pendingProps;
    null === next ? completeUnitOfWork(unitOfWork) : workInProgress = next;
  }
  function replaySuspendedUnitOfWork(unitOfWork) {
    var next = unitOfWork;
    var current = next.alternate;
    switch (next.tag) {
      case 15:
      case 0:
        next = replayFunctionComponent(
          current,
          next,
          next.pendingProps,
          next.type,
          void 0,
          workInProgressRootRenderLanes
        );
        break;
      case 11:
        next = replayFunctionComponent(
          current,
          next,
          next.pendingProps,
          next.type.render,
          next.ref,
          workInProgressRootRenderLanes
        );
        break;
      case 5:
        resetHooksOnUnwind(next);
      default:
        unwindInterruptedWork(current, next), next = workInProgress = resetWorkInProgress(next, entangledRenderLanes), next = beginWork(current, next, entangledRenderLanes);
    }
    unitOfWork.memoizedProps = unitOfWork.pendingProps;
    null === next ? completeUnitOfWork(unitOfWork) : workInProgress = next;
  }
  function throwAndUnwindWorkLoop(root2, unitOfWork, thrownValue, suspendedReason) {
    lastContextDependency = currentlyRenderingFiber$1 = null;
    resetHooksOnUnwind(unitOfWork);
    thenableState$1 = null;
    thenableIndexCounter$1 = 0;
    var returnFiber = unitOfWork.return;
    try {
      if (throwException(
        root2,
        returnFiber,
        unitOfWork,
        thrownValue,
        workInProgressRootRenderLanes
      )) {
        workInProgressRootExitStatus = 1;
        logUncaughtError(
          root2,
          createCapturedValueAtFiber(thrownValue, root2.current)
        );
        workInProgress = null;
        return;
      }
    } catch (error) {
      if (null !== returnFiber) throw workInProgress = returnFiber, error;
      workInProgressRootExitStatus = 1;
      logUncaughtError(
        root2,
        createCapturedValueAtFiber(thrownValue, root2.current)
      );
      workInProgress = null;
      return;
    }
    if (unitOfWork.flags & 32768) {
      if (isHydrating || 1 === suspendedReason) root2 = true;
      else if (workInProgressRootIsPrerendering || 0 !== (workInProgressRootRenderLanes & 536870912))
        root2 = false;
      else if (workInProgressRootDidSkipSuspendedSiblings = root2 = true, 2 === suspendedReason || 9 === suspendedReason || 3 === suspendedReason || 6 === suspendedReason)
        suspendedReason = suspenseHandlerStackCursor.current, null !== suspendedReason && 13 === suspendedReason.tag && (suspendedReason.flags |= 16384);
      unwindUnitOfWork(unitOfWork, root2);
    } else completeUnitOfWork(unitOfWork);
  }
  function completeUnitOfWork(unitOfWork) {
    var completedWork = unitOfWork;
    do {
      if (0 !== (completedWork.flags & 32768)) {
        unwindUnitOfWork(
          completedWork,
          workInProgressRootDidSkipSuspendedSiblings
        );
        return;
      }
      unitOfWork = completedWork.return;
      var next = completeWork(
        completedWork.alternate,
        completedWork,
        entangledRenderLanes
      );
      if (null !== next) {
        workInProgress = next;
        return;
      }
      completedWork = completedWork.sibling;
      if (null !== completedWork) {
        workInProgress = completedWork;
        return;
      }
      workInProgress = completedWork = unitOfWork;
    } while (null !== completedWork);
    0 === workInProgressRootExitStatus && (workInProgressRootExitStatus = 5);
  }
  function unwindUnitOfWork(unitOfWork, skipSiblings) {
    do {
      var next = unwindWork(unitOfWork.alternate, unitOfWork);
      if (null !== next) {
        next.flags &= 32767;
        workInProgress = next;
        return;
      }
      next = unitOfWork.return;
      null !== next && (next.flags |= 32768, next.subtreeFlags = 0, next.deletions = null);
      if (!skipSiblings && (unitOfWork = unitOfWork.sibling, null !== unitOfWork)) {
        workInProgress = unitOfWork;
        return;
      }
      workInProgress = unitOfWork = next;
    } while (null !== unitOfWork);
    workInProgressRootExitStatus = 6;
    workInProgress = null;
  }
  function commitRoot(root2, finishedWork, lanes, recoverableErrors, transitions, didIncludeRenderPhaseUpdate, spawnedLane, updatedLanes, suspendedRetryLanes) {
    root2.cancelPendingCommit = null;
    do
      flushPendingEffects();
    while (0 !== pendingEffectsStatus);
    if (0 !== (executionContext & 6)) throw Error(formatProdErrorMessage(327));
    if (null !== finishedWork) {
      if (finishedWork === root2.current) throw Error(formatProdErrorMessage(177));
      didIncludeRenderPhaseUpdate = finishedWork.lanes | finishedWork.childLanes;
      didIncludeRenderPhaseUpdate |= concurrentlyUpdatedLanes;
      markRootFinished(
        root2,
        lanes,
        didIncludeRenderPhaseUpdate,
        spawnedLane,
        updatedLanes,
        suspendedRetryLanes
      );
      root2 === workInProgressRoot && (workInProgress = workInProgressRoot = null, workInProgressRootRenderLanes = 0);
      pendingFinishedWork = finishedWork;
      pendingEffectsRoot = root2;
      pendingEffectsLanes = lanes;
      pendingEffectsRemainingLanes = didIncludeRenderPhaseUpdate;
      pendingPassiveTransitions = transitions;
      pendingRecoverableErrors = recoverableErrors;
      0 !== (finishedWork.subtreeFlags & 10256) || 0 !== (finishedWork.flags & 10256) ? (root2.callbackNode = null, root2.callbackPriority = 0, scheduleCallback$1(NormalPriority$1, function() {
        flushPassiveEffects();
        return null;
      })) : (root2.callbackNode = null, root2.callbackPriority = 0);
      recoverableErrors = 0 !== (finishedWork.flags & 13878);
      if (0 !== (finishedWork.subtreeFlags & 13878) || recoverableErrors) {
        recoverableErrors = ReactSharedInternals.T;
        ReactSharedInternals.T = null;
        transitions = ReactDOMSharedInternals.p;
        ReactDOMSharedInternals.p = 2;
        spawnedLane = executionContext;
        executionContext |= 4;
        try {
          commitBeforeMutationEffects(root2, finishedWork, lanes);
        } finally {
          executionContext = spawnedLane, ReactDOMSharedInternals.p = transitions, ReactSharedInternals.T = recoverableErrors;
        }
      }
      pendingEffectsStatus = 1;
      flushMutationEffects();
      flushLayoutEffects();
      flushSpawnedWork();
    }
  }
  function flushMutationEffects() {
    if (1 === pendingEffectsStatus) {
      pendingEffectsStatus = 0;
      var root2 = pendingEffectsRoot, finishedWork = pendingFinishedWork, rootMutationHasEffect = 0 !== (finishedWork.flags & 13878);
      if (0 !== (finishedWork.subtreeFlags & 13878) || rootMutationHasEffect) {
        rootMutationHasEffect = ReactSharedInternals.T;
        ReactSharedInternals.T = null;
        var previousPriority = ReactDOMSharedInternals.p;
        ReactDOMSharedInternals.p = 2;
        var prevExecutionContext = executionContext;
        executionContext |= 4;
        try {
          commitMutationEffectsOnFiber(finishedWork, root2);
          var priorSelectionInformation = selectionInformation, curFocusedElem = getActiveElementDeep(root2.containerInfo), priorFocusedElem = priorSelectionInformation.focusedElem, priorSelectionRange = priorSelectionInformation.selectionRange;
          if (curFocusedElem !== priorFocusedElem && priorFocusedElem && priorFocusedElem.ownerDocument && containsNode(
            priorFocusedElem.ownerDocument.documentElement,
            priorFocusedElem
          )) {
            if (null !== priorSelectionRange && hasSelectionCapabilities(priorFocusedElem)) {
              var start = priorSelectionRange.start, end = priorSelectionRange.end;
              void 0 === end && (end = start);
              if ("selectionStart" in priorFocusedElem)
                priorFocusedElem.selectionStart = start, priorFocusedElem.selectionEnd = Math.min(
                  end,
                  priorFocusedElem.value.length
                );
              else {
                var doc = priorFocusedElem.ownerDocument || document, win = doc && doc.defaultView || window;
                if (win.getSelection) {
                  var selection = win.getSelection(), length = priorFocusedElem.textContent.length, start$jscomp$0 = Math.min(priorSelectionRange.start, length), end$jscomp$0 = void 0 === priorSelectionRange.end ? start$jscomp$0 : Math.min(priorSelectionRange.end, length);
                  !selection.extend && start$jscomp$0 > end$jscomp$0 && (curFocusedElem = end$jscomp$0, end$jscomp$0 = start$jscomp$0, start$jscomp$0 = curFocusedElem);
                  var startMarker = getNodeForCharacterOffset(
                    priorFocusedElem,
                    start$jscomp$0
                  ), endMarker = getNodeForCharacterOffset(
                    priorFocusedElem,
                    end$jscomp$0
                  );
                  if (startMarker && endMarker && (1 !== selection.rangeCount || selection.anchorNode !== startMarker.node || selection.anchorOffset !== startMarker.offset || selection.focusNode !== endMarker.node || selection.focusOffset !== endMarker.offset)) {
                    var range = doc.createRange();
                    range.setStart(startMarker.node, startMarker.offset);
                    selection.removeAllRanges();
                    start$jscomp$0 > end$jscomp$0 ? (selection.addRange(range), selection.extend(endMarker.node, endMarker.offset)) : (range.setEnd(endMarker.node, endMarker.offset), selection.addRange(range));
                  }
                }
              }
            }
            doc = [];
            for (selection = priorFocusedElem; selection = selection.parentNode; )
              1 === selection.nodeType && doc.push({
                element: selection,
                left: selection.scrollLeft,
                top: selection.scrollTop
              });
            "function" === typeof priorFocusedElem.focus && priorFocusedElem.focus();
            for (priorFocusedElem = 0; priorFocusedElem < doc.length; priorFocusedElem++) {
              var info = doc[priorFocusedElem];
              info.element.scrollLeft = info.left;
              info.element.scrollTop = info.top;
            }
          }
          _enabled = !!eventsEnabled;
          selectionInformation = eventsEnabled = null;
        } finally {
          executionContext = prevExecutionContext, ReactDOMSharedInternals.p = previousPriority, ReactSharedInternals.T = rootMutationHasEffect;
        }
      }
      root2.current = finishedWork;
      pendingEffectsStatus = 2;
    }
  }
  function flushLayoutEffects() {
    if (2 === pendingEffectsStatus) {
      pendingEffectsStatus = 0;
      var root2 = pendingEffectsRoot, finishedWork = pendingFinishedWork, rootHasLayoutEffect = 0 !== (finishedWork.flags & 8772);
      if (0 !== (finishedWork.subtreeFlags & 8772) || rootHasLayoutEffect) {
        rootHasLayoutEffect = ReactSharedInternals.T;
        ReactSharedInternals.T = null;
        var previousPriority = ReactDOMSharedInternals.p;
        ReactDOMSharedInternals.p = 2;
        var prevExecutionContext = executionContext;
        executionContext |= 4;
        try {
          commitLayoutEffectOnFiber(root2, finishedWork.alternate, finishedWork);
        } finally {
          executionContext = prevExecutionContext, ReactDOMSharedInternals.p = previousPriority, ReactSharedInternals.T = rootHasLayoutEffect;
        }
      }
      pendingEffectsStatus = 3;
    }
  }
  function flushSpawnedWork() {
    if (4 === pendingEffectsStatus || 3 === pendingEffectsStatus) {
      pendingEffectsStatus = 0;
      requestPaint();
      var root2 = pendingEffectsRoot, finishedWork = pendingFinishedWork, lanes = pendingEffectsLanes, recoverableErrors = pendingRecoverableErrors;
      0 !== (finishedWork.subtreeFlags & 10256) || 0 !== (finishedWork.flags & 10256) ? pendingEffectsStatus = 5 : (pendingEffectsStatus = 0, pendingFinishedWork = pendingEffectsRoot = null, releaseRootPooledCache(root2, root2.pendingLanes));
      var remainingLanes = root2.pendingLanes;
      0 === remainingLanes && (legacyErrorBoundariesThatAlreadyFailed = null);
      lanesToEventPriority(lanes);
      finishedWork = finishedWork.stateNode;
      if (injectedHook && "function" === typeof injectedHook.onCommitFiberRoot)
        try {
          injectedHook.onCommitFiberRoot(
            rendererID,
            finishedWork,
            void 0,
            128 === (finishedWork.current.flags & 128)
          );
        } catch (err) {
        }
      if (null !== recoverableErrors) {
        finishedWork = ReactSharedInternals.T;
        remainingLanes = ReactDOMSharedInternals.p;
        ReactDOMSharedInternals.p = 2;
        ReactSharedInternals.T = null;
        try {
          for (var onRecoverableError = root2.onRecoverableError, i = 0; i < recoverableErrors.length; i++) {
            var recoverableError = recoverableErrors[i];
            onRecoverableError(recoverableError.value, {
              componentStack: recoverableError.stack
            });
          }
        } finally {
          ReactSharedInternals.T = finishedWork, ReactDOMSharedInternals.p = remainingLanes;
        }
      }
      0 !== (pendingEffectsLanes & 3) && flushPendingEffects();
      ensureRootIsScheduled(root2);
      remainingLanes = root2.pendingLanes;
      0 !== (lanes & 261930) && 0 !== (remainingLanes & 42) ? root2 === rootWithNestedUpdates ? nestedUpdateCount++ : (nestedUpdateCount = 0, rootWithNestedUpdates = root2) : nestedUpdateCount = 0;
      flushSyncWorkAcrossRoots_impl(0);
    }
  }
  function releaseRootPooledCache(root2, remainingLanes) {
    0 === (root2.pooledCacheLanes &= remainingLanes) && (remainingLanes = root2.pooledCache, null != remainingLanes && (root2.pooledCache = null, releaseCache(remainingLanes)));
  }
  function flushPendingEffects() {
    flushMutationEffects();
    flushLayoutEffects();
    flushSpawnedWork();
    return flushPassiveEffects();
  }
  function flushPassiveEffects() {
    if (5 !== pendingEffectsStatus) return false;
    var root2 = pendingEffectsRoot, remainingLanes = pendingEffectsRemainingLanes;
    pendingEffectsRemainingLanes = 0;
    var renderPriority = lanesToEventPriority(pendingEffectsLanes), prevTransition = ReactSharedInternals.T, previousPriority = ReactDOMSharedInternals.p;
    try {
      ReactDOMSharedInternals.p = 32 > renderPriority ? 32 : renderPriority;
      ReactSharedInternals.T = null;
      renderPriority = pendingPassiveTransitions;
      pendingPassiveTransitions = null;
      var root$jscomp$0 = pendingEffectsRoot, lanes = pendingEffectsLanes;
      pendingEffectsStatus = 0;
      pendingFinishedWork = pendingEffectsRoot = null;
      pendingEffectsLanes = 0;
      if (0 !== (executionContext & 6)) throw Error(formatProdErrorMessage(331));
      var prevExecutionContext = executionContext;
      executionContext |= 4;
      commitPassiveUnmountOnFiber(root$jscomp$0.current);
      commitPassiveMountOnFiber(
        root$jscomp$0,
        root$jscomp$0.current,
        lanes,
        renderPriority
      );
      executionContext = prevExecutionContext;
      flushSyncWorkAcrossRoots_impl(0, false);
      if (injectedHook && "function" === typeof injectedHook.onPostCommitFiberRoot)
        try {
          injectedHook.onPostCommitFiberRoot(rendererID, root$jscomp$0);
        } catch (err) {
        }
      return true;
    } finally {
      ReactDOMSharedInternals.p = previousPriority, ReactSharedInternals.T = prevTransition, releaseRootPooledCache(root2, remainingLanes);
    }
  }
  function captureCommitPhaseErrorOnRoot(rootFiber, sourceFiber, error) {
    sourceFiber = createCapturedValueAtFiber(error, sourceFiber);
    sourceFiber = createRootErrorUpdate(rootFiber.stateNode, sourceFiber, 2);
    rootFiber = enqueueUpdate(rootFiber, sourceFiber, 2);
    null !== rootFiber && (markRootUpdated$1(rootFiber, 2), ensureRootIsScheduled(rootFiber));
  }
  function captureCommitPhaseError(sourceFiber, nearestMountedAncestor, error) {
    if (3 === sourceFiber.tag)
      captureCommitPhaseErrorOnRoot(sourceFiber, sourceFiber, error);
    else
      for (; null !== nearestMountedAncestor; ) {
        if (3 === nearestMountedAncestor.tag) {
          captureCommitPhaseErrorOnRoot(
            nearestMountedAncestor,
            sourceFiber,
            error
          );
          break;
        } else if (1 === nearestMountedAncestor.tag) {
          var instance = nearestMountedAncestor.stateNode;
          if ("function" === typeof nearestMountedAncestor.type.getDerivedStateFromError || "function" === typeof instance.componentDidCatch && (null === legacyErrorBoundariesThatAlreadyFailed || !legacyErrorBoundariesThatAlreadyFailed.has(instance))) {
            sourceFiber = createCapturedValueAtFiber(error, sourceFiber);
            error = createClassErrorUpdate(2);
            instance = enqueueUpdate(nearestMountedAncestor, error, 2);
            null !== instance && (initializeClassErrorUpdate(
              error,
              instance,
              nearestMountedAncestor,
              sourceFiber
            ), markRootUpdated$1(instance, 2), ensureRootIsScheduled(instance));
            break;
          }
        }
        nearestMountedAncestor = nearestMountedAncestor.return;
      }
  }
  function attachPingListener(root2, wakeable, lanes) {
    var pingCache = root2.pingCache;
    if (null === pingCache) {
      pingCache = root2.pingCache = new PossiblyWeakMap();
      var threadIDs = /* @__PURE__ */ new Set();
      pingCache.set(wakeable, threadIDs);
    } else
      threadIDs = pingCache.get(wakeable), void 0 === threadIDs && (threadIDs = /* @__PURE__ */ new Set(), pingCache.set(wakeable, threadIDs));
    threadIDs.has(lanes) || (workInProgressRootDidAttachPingListener = true, threadIDs.add(lanes), root2 = pingSuspendedRoot.bind(null, root2, wakeable, lanes), wakeable.then(root2, root2));
  }
  function pingSuspendedRoot(root2, wakeable, pingedLanes) {
    var pingCache = root2.pingCache;
    null !== pingCache && pingCache.delete(wakeable);
    root2.pingedLanes |= root2.suspendedLanes & pingedLanes;
    root2.warmLanes &= ~pingedLanes;
    workInProgressRoot === root2 && (workInProgressRootRenderLanes & pingedLanes) === pingedLanes && (4 === workInProgressRootExitStatus || 3 === workInProgressRootExitStatus && (workInProgressRootRenderLanes & 62914560) === workInProgressRootRenderLanes && 300 > now() - globalMostRecentFallbackTime ? 0 === (executionContext & 2) && prepareFreshStack(root2, 0) : workInProgressRootPingedLanes |= pingedLanes, workInProgressSuspendedRetryLanes === workInProgressRootRenderLanes && (workInProgressSuspendedRetryLanes = 0));
    ensureRootIsScheduled(root2);
  }
  function retryTimedOutBoundary(boundaryFiber, retryLane) {
    0 === retryLane && (retryLane = claimNextRetryLane());
    boundaryFiber = enqueueConcurrentRenderForLane(boundaryFiber, retryLane);
    null !== boundaryFiber && (markRootUpdated$1(boundaryFiber, retryLane), ensureRootIsScheduled(boundaryFiber));
  }
  function retryDehydratedSuspenseBoundary(boundaryFiber) {
    var suspenseState = boundaryFiber.memoizedState, retryLane = 0;
    null !== suspenseState && (retryLane = suspenseState.retryLane);
    retryTimedOutBoundary(boundaryFiber, retryLane);
  }
  function resolveRetryWakeable(boundaryFiber, wakeable) {
    var retryLane = 0;
    switch (boundaryFiber.tag) {
      case 31:
      case 13:
        var retryCache = boundaryFiber.stateNode;
        var suspenseState = boundaryFiber.memoizedState;
        null !== suspenseState && (retryLane = suspenseState.retryLane);
        break;
      case 19:
        retryCache = boundaryFiber.stateNode;
        break;
      case 22:
        retryCache = boundaryFiber.stateNode._retryCache;
        break;
      default:
        throw Error(formatProdErrorMessage(314));
    }
    null !== retryCache && retryCache.delete(wakeable);
    retryTimedOutBoundary(boundaryFiber, retryLane);
  }
  function scheduleCallback$1(priorityLevel, callback) {
    return scheduleCallback$3(priorityLevel, callback);
  }
  var firstScheduledRoot = null, lastScheduledRoot = null, didScheduleMicrotask = false, mightHavePendingSyncWork = false, isFlushingWork = false, currentEventTransitionLane = 0;
  function ensureRootIsScheduled(root2) {
    root2 !== lastScheduledRoot && null === root2.next && (null === lastScheduledRoot ? firstScheduledRoot = lastScheduledRoot = root2 : lastScheduledRoot = lastScheduledRoot.next = root2);
    mightHavePendingSyncWork = true;
    didScheduleMicrotask || (didScheduleMicrotask = true, scheduleImmediateRootScheduleTask());
  }
  function flushSyncWorkAcrossRoots_impl(syncTransitionLanes, onlyLegacy) {
    if (!isFlushingWork && mightHavePendingSyncWork) {
      isFlushingWork = true;
      do {
        var didPerformSomeWork = false;
        for (var root$170 = firstScheduledRoot; null !== root$170; ) {
          if (0 !== syncTransitionLanes) {
            var pendingLanes = root$170.pendingLanes;
            if (0 === pendingLanes) var JSCompiler_inline_result = 0;
            else {
              var suspendedLanes = root$170.suspendedLanes, pingedLanes = root$170.pingedLanes;
              JSCompiler_inline_result = (1 << 31 - clz32(42 | syncTransitionLanes) + 1) - 1;
              JSCompiler_inline_result &= pendingLanes & ~(suspendedLanes & ~pingedLanes);
              JSCompiler_inline_result = JSCompiler_inline_result & 201326741 ? JSCompiler_inline_result & 201326741 | 1 : JSCompiler_inline_result ? JSCompiler_inline_result | 2 : 0;
            }
            0 !== JSCompiler_inline_result && (didPerformSomeWork = true, performSyncWorkOnRoot(root$170, JSCompiler_inline_result));
          } else
            JSCompiler_inline_result = workInProgressRootRenderLanes, JSCompiler_inline_result = getNextLanes(
              root$170,
              root$170 === workInProgressRoot ? JSCompiler_inline_result : 0,
              null !== root$170.cancelPendingCommit || -1 !== root$170.timeoutHandle
            ), 0 === (JSCompiler_inline_result & 3) || checkIfRootIsPrerendering(root$170, JSCompiler_inline_result) || (didPerformSomeWork = true, performSyncWorkOnRoot(root$170, JSCompiler_inline_result));
          root$170 = root$170.next;
        }
      } while (didPerformSomeWork);
      isFlushingWork = false;
    }
  }
  function processRootScheduleInImmediateTask() {
    processRootScheduleInMicrotask();
  }
  function processRootScheduleInMicrotask() {
    mightHavePendingSyncWork = didScheduleMicrotask = false;
    var syncTransitionLanes = 0;
    0 !== currentEventTransitionLane && shouldAttemptEagerTransition() && (syncTransitionLanes = currentEventTransitionLane);
    for (var currentTime = now(), prev = null, root2 = firstScheduledRoot; null !== root2; ) {
      var next = root2.next, nextLanes = scheduleTaskForRootDuringMicrotask(root2, currentTime);
      if (0 === nextLanes)
        root2.next = null, null === prev ? firstScheduledRoot = next : prev.next = next, null === next && (lastScheduledRoot = prev);
      else if (prev = root2, 0 !== syncTransitionLanes || 0 !== (nextLanes & 3))
        mightHavePendingSyncWork = true;
      root2 = next;
    }
    0 !== pendingEffectsStatus && 5 !== pendingEffectsStatus || flushSyncWorkAcrossRoots_impl(syncTransitionLanes);
    0 !== currentEventTransitionLane && (currentEventTransitionLane = 0);
  }
  function scheduleTaskForRootDuringMicrotask(root2, currentTime) {
    for (var suspendedLanes = root2.suspendedLanes, pingedLanes = root2.pingedLanes, expirationTimes = root2.expirationTimes, lanes = root2.pendingLanes & -62914561; 0 < lanes; ) {
      var index$5 = 31 - clz32(lanes), lane = 1 << index$5, expirationTime = expirationTimes[index$5];
      if (-1 === expirationTime) {
        if (0 === (lane & suspendedLanes) || 0 !== (lane & pingedLanes))
          expirationTimes[index$5] = computeExpirationTime(lane, currentTime);
      } else expirationTime <= currentTime && (root2.expiredLanes |= lane);
      lanes &= ~lane;
    }
    currentTime = workInProgressRoot;
    suspendedLanes = workInProgressRootRenderLanes;
    suspendedLanes = getNextLanes(
      root2,
      root2 === currentTime ? suspendedLanes : 0,
      null !== root2.cancelPendingCommit || -1 !== root2.timeoutHandle
    );
    pingedLanes = root2.callbackNode;
    if (0 === suspendedLanes || root2 === currentTime && (2 === workInProgressSuspendedReason || 9 === workInProgressSuspendedReason) || null !== root2.cancelPendingCommit)
      return null !== pingedLanes && null !== pingedLanes && cancelCallback$1(pingedLanes), root2.callbackNode = null, root2.callbackPriority = 0;
    if (0 === (suspendedLanes & 3) || checkIfRootIsPrerendering(root2, suspendedLanes)) {
      currentTime = suspendedLanes & -suspendedLanes;
      if (currentTime === root2.callbackPriority) return currentTime;
      null !== pingedLanes && cancelCallback$1(pingedLanes);
      switch (lanesToEventPriority(suspendedLanes)) {
        case 2:
        case 8:
          suspendedLanes = UserBlockingPriority;
          break;
        case 32:
          suspendedLanes = NormalPriority$1;
          break;
        case 268435456:
          suspendedLanes = IdlePriority;
          break;
        default:
          suspendedLanes = NormalPriority$1;
      }
      pingedLanes = performWorkOnRootViaSchedulerTask.bind(null, root2);
      suspendedLanes = scheduleCallback$3(suspendedLanes, pingedLanes);
      root2.callbackPriority = currentTime;
      root2.callbackNode = suspendedLanes;
      return currentTime;
    }
    null !== pingedLanes && null !== pingedLanes && cancelCallback$1(pingedLanes);
    root2.callbackPriority = 2;
    root2.callbackNode = null;
    return 2;
  }
  function performWorkOnRootViaSchedulerTask(root2, didTimeout) {
    if (0 !== pendingEffectsStatus && 5 !== pendingEffectsStatus)
      return root2.callbackNode = null, root2.callbackPriority = 0, null;
    var originalCallbackNode = root2.callbackNode;
    if (flushPendingEffects() && root2.callbackNode !== originalCallbackNode)
      return null;
    var workInProgressRootRenderLanes$jscomp$0 = workInProgressRootRenderLanes;
    workInProgressRootRenderLanes$jscomp$0 = getNextLanes(
      root2,
      root2 === workInProgressRoot ? workInProgressRootRenderLanes$jscomp$0 : 0,
      null !== root2.cancelPendingCommit || -1 !== root2.timeoutHandle
    );
    if (0 === workInProgressRootRenderLanes$jscomp$0) return null;
    performWorkOnRoot(root2, workInProgressRootRenderLanes$jscomp$0, didTimeout);
    scheduleTaskForRootDuringMicrotask(root2, now());
    return null != root2.callbackNode && root2.callbackNode === originalCallbackNode ? performWorkOnRootViaSchedulerTask.bind(null, root2) : null;
  }
  function performSyncWorkOnRoot(root2, lanes) {
    if (flushPendingEffects()) return null;
    performWorkOnRoot(root2, lanes, true);
  }
  function scheduleImmediateRootScheduleTask() {
    scheduleMicrotask(function() {
      0 !== (executionContext & 6) ? scheduleCallback$3(
        ImmediatePriority,
        processRootScheduleInImmediateTask
      ) : processRootScheduleInMicrotask();
    });
  }
  function requestTransitionLane() {
    if (0 === currentEventTransitionLane) {
      var actionScopeLane = currentEntangledLane;
      0 === actionScopeLane && (actionScopeLane = nextTransitionUpdateLane, nextTransitionUpdateLane <<= 1, 0 === (nextTransitionUpdateLane & 261888) && (nextTransitionUpdateLane = 256));
      currentEventTransitionLane = actionScopeLane;
    }
    return currentEventTransitionLane;
  }
  function coerceFormActionProp(actionProp) {
    return null == actionProp || "symbol" === typeof actionProp || "boolean" === typeof actionProp ? null : "function" === typeof actionProp ? actionProp : sanitizeURL("" + actionProp);
  }
  function createFormDataWithSubmitter(form, submitter) {
    var temp = submitter.ownerDocument.createElement("input");
    temp.name = submitter.name;
    temp.value = submitter.value;
    form.id && temp.setAttribute("form", form.id);
    submitter.parentNode.insertBefore(temp, submitter);
    form = new FormData(form);
    temp.parentNode.removeChild(temp);
    return form;
  }
  function extractEvents$1(dispatchQueue, domEventName, maybeTargetInst, nativeEvent, nativeEventTarget) {
    if ("submit" === domEventName && maybeTargetInst && maybeTargetInst.stateNode === nativeEventTarget) {
      var action = coerceFormActionProp(
        (nativeEventTarget[internalPropsKey] || null).action
      ), submitter = nativeEvent.submitter;
      submitter && (domEventName = (domEventName = submitter[internalPropsKey] || null) ? coerceFormActionProp(domEventName.formAction) : submitter.getAttribute("formAction"), null !== domEventName && (action = domEventName, submitter = null));
      var event = new SyntheticEvent(
        "action",
        "action",
        null,
        nativeEvent,
        nativeEventTarget
      );
      dispatchQueue.push({
        event,
        listeners: [
          {
            instance: null,
            listener: function() {
              if (nativeEvent.defaultPrevented) {
                if (0 !== currentEventTransitionLane) {
                  var formData = submitter ? createFormDataWithSubmitter(nativeEventTarget, submitter) : new FormData(nativeEventTarget);
                  startHostTransition(
                    maybeTargetInst,
                    {
                      pending: true,
                      data: formData,
                      method: nativeEventTarget.method,
                      action
                    },
                    null,
                    formData
                  );
                }
              } else
                "function" === typeof action && (event.preventDefault(), formData = submitter ? createFormDataWithSubmitter(nativeEventTarget, submitter) : new FormData(nativeEventTarget), startHostTransition(
                  maybeTargetInst,
                  {
                    pending: true,
                    data: formData,
                    method: nativeEventTarget.method,
                    action
                  },
                  action,
                  formData
                ));
            },
            currentTarget: nativeEventTarget
          }
        ]
      });
    }
  }
  for (var i$jscomp$inline_1577 = 0; i$jscomp$inline_1577 < simpleEventPluginEvents.length; i$jscomp$inline_1577++) {
    var eventName$jscomp$inline_1578 = simpleEventPluginEvents[i$jscomp$inline_1577], domEventName$jscomp$inline_1579 = eventName$jscomp$inline_1578.toLowerCase(), capitalizedEvent$jscomp$inline_1580 = eventName$jscomp$inline_1578[0].toUpperCase() + eventName$jscomp$inline_1578.slice(1);
    registerSimpleEvent(
      domEventName$jscomp$inline_1579,
      "on" + capitalizedEvent$jscomp$inline_1580
    );
  }
  registerSimpleEvent(ANIMATION_END, "onAnimationEnd");
  registerSimpleEvent(ANIMATION_ITERATION, "onAnimationIteration");
  registerSimpleEvent(ANIMATION_START, "onAnimationStart");
  registerSimpleEvent("dblclick", "onDoubleClick");
  registerSimpleEvent("focusin", "onFocus");
  registerSimpleEvent("focusout", "onBlur");
  registerSimpleEvent(TRANSITION_RUN, "onTransitionRun");
  registerSimpleEvent(TRANSITION_START, "onTransitionStart");
  registerSimpleEvent(TRANSITION_CANCEL, "onTransitionCancel");
  registerSimpleEvent(TRANSITION_END, "onTransitionEnd");
  registerDirectEvent("onMouseEnter", ["mouseout", "mouseover"]);
  registerDirectEvent("onMouseLeave", ["mouseout", "mouseover"]);
  registerDirectEvent("onPointerEnter", ["pointerout", "pointerover"]);
  registerDirectEvent("onPointerLeave", ["pointerout", "pointerover"]);
  registerTwoPhaseEvent(
    "onChange",
    "change click focusin focusout input keydown keyup selectionchange".split(" ")
  );
  registerTwoPhaseEvent(
    "onSelect",
    "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(
      " "
    )
  );
  registerTwoPhaseEvent("onBeforeInput", [
    "compositionend",
    "keypress",
    "textInput",
    "paste"
  ]);
  registerTwoPhaseEvent(
    "onCompositionEnd",
    "compositionend focusout keydown keypress keyup mousedown".split(" ")
  );
  registerTwoPhaseEvent(
    "onCompositionStart",
    "compositionstart focusout keydown keypress keyup mousedown".split(" ")
  );
  registerTwoPhaseEvent(
    "onCompositionUpdate",
    "compositionupdate focusout keydown keypress keyup mousedown".split(" ")
  );
  var mediaEventTypes = "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(
    " "
  ), nonDelegatedEvents = new Set(
    "beforetoggle cancel close invalid load scroll scrollend toggle".split(" ").concat(mediaEventTypes)
  );
  function processDispatchQueue(dispatchQueue, eventSystemFlags) {
    eventSystemFlags = 0 !== (eventSystemFlags & 4);
    for (var i = 0; i < dispatchQueue.length; i++) {
      var _dispatchQueue$i = dispatchQueue[i], event = _dispatchQueue$i.event;
      _dispatchQueue$i = _dispatchQueue$i.listeners;
      a: {
        var previousInstance = void 0;
        if (eventSystemFlags)
          for (var i$jscomp$0 = _dispatchQueue$i.length - 1; 0 <= i$jscomp$0; i$jscomp$0--) {
            var _dispatchListeners$i = _dispatchQueue$i[i$jscomp$0], instance = _dispatchListeners$i.instance, currentTarget = _dispatchListeners$i.currentTarget;
            _dispatchListeners$i = _dispatchListeners$i.listener;
            if (instance !== previousInstance && event.isPropagationStopped())
              break a;
            previousInstance = _dispatchListeners$i;
            event.currentTarget = currentTarget;
            try {
              previousInstance(event);
            } catch (error) {
              reportGlobalError(error);
            }
            event.currentTarget = null;
            previousInstance = instance;
          }
        else
          for (i$jscomp$0 = 0; i$jscomp$0 < _dispatchQueue$i.length; i$jscomp$0++) {
            _dispatchListeners$i = _dispatchQueue$i[i$jscomp$0];
            instance = _dispatchListeners$i.instance;
            currentTarget = _dispatchListeners$i.currentTarget;
            _dispatchListeners$i = _dispatchListeners$i.listener;
            if (instance !== previousInstance && event.isPropagationStopped())
              break a;
            previousInstance = _dispatchListeners$i;
            event.currentTarget = currentTarget;
            try {
              previousInstance(event);
            } catch (error) {
              reportGlobalError(error);
            }
            event.currentTarget = null;
            previousInstance = instance;
          }
      }
    }
  }
  function listenToNonDelegatedEvent(domEventName, targetElement) {
    var JSCompiler_inline_result = targetElement[internalEventHandlersKey];
    void 0 === JSCompiler_inline_result && (JSCompiler_inline_result = targetElement[internalEventHandlersKey] = /* @__PURE__ */ new Set());
    var listenerSetKey = domEventName + "__bubble";
    JSCompiler_inline_result.has(listenerSetKey) || (addTrappedEventListener(targetElement, domEventName, 2, false), JSCompiler_inline_result.add(listenerSetKey));
  }
  function listenToNativeEvent(domEventName, isCapturePhaseListener, target) {
    var eventSystemFlags = 0;
    isCapturePhaseListener && (eventSystemFlags |= 4);
    addTrappedEventListener(
      target,
      domEventName,
      eventSystemFlags,
      isCapturePhaseListener
    );
  }
  var listeningMarker = "_reactListening" + Math.random().toString(36).slice(2);
  function listenToAllSupportedEvents(rootContainerElement) {
    if (!rootContainerElement[listeningMarker]) {
      rootContainerElement[listeningMarker] = true;
      allNativeEvents.forEach(function(domEventName) {
        "selectionchange" !== domEventName && (nonDelegatedEvents.has(domEventName) || listenToNativeEvent(domEventName, false, rootContainerElement), listenToNativeEvent(domEventName, true, rootContainerElement));
      });
      var ownerDocument = 9 === rootContainerElement.nodeType ? rootContainerElement : rootContainerElement.ownerDocument;
      null === ownerDocument || ownerDocument[listeningMarker] || (ownerDocument[listeningMarker] = true, listenToNativeEvent("selectionchange", false, ownerDocument));
    }
  }
  function addTrappedEventListener(targetContainer, domEventName, eventSystemFlags, isCapturePhaseListener) {
    switch (getEventPriority(domEventName)) {
      case 2:
        var listenerWrapper = dispatchDiscreteEvent;
        break;
      case 8:
        listenerWrapper = dispatchContinuousEvent;
        break;
      default:
        listenerWrapper = dispatchEvent;
    }
    eventSystemFlags = listenerWrapper.bind(
      null,
      domEventName,
      eventSystemFlags,
      targetContainer
    );
    listenerWrapper = void 0;
    !passiveBrowserEventsSupported || "touchstart" !== domEventName && "touchmove" !== domEventName && "wheel" !== domEventName || (listenerWrapper = true);
    isCapturePhaseListener ? void 0 !== listenerWrapper ? targetContainer.addEventListener(domEventName, eventSystemFlags, {
      capture: true,
      passive: listenerWrapper
    }) : targetContainer.addEventListener(domEventName, eventSystemFlags, true) : void 0 !== listenerWrapper ? targetContainer.addEventListener(domEventName, eventSystemFlags, {
      passive: listenerWrapper
    }) : targetContainer.addEventListener(domEventName, eventSystemFlags, false);
  }
  function dispatchEventForPluginEventSystem(domEventName, eventSystemFlags, nativeEvent, targetInst$jscomp$0, targetContainer) {
    var ancestorInst = targetInst$jscomp$0;
    if (0 === (eventSystemFlags & 1) && 0 === (eventSystemFlags & 2) && null !== targetInst$jscomp$0)
      a: for (; ; ) {
        if (null === targetInst$jscomp$0) return;
        var nodeTag = targetInst$jscomp$0.tag;
        if (3 === nodeTag || 4 === nodeTag) {
          var container = targetInst$jscomp$0.stateNode.containerInfo;
          if (container === targetContainer) break;
          if (4 === nodeTag)
            for (nodeTag = targetInst$jscomp$0.return; null !== nodeTag; ) {
              var grandTag = nodeTag.tag;
              if ((3 === grandTag || 4 === grandTag) && nodeTag.stateNode.containerInfo === targetContainer)
                return;
              nodeTag = nodeTag.return;
            }
          for (; null !== container; ) {
            nodeTag = getClosestInstanceFromNode(container);
            if (null === nodeTag) return;
            grandTag = nodeTag.tag;
            if (5 === grandTag || 6 === grandTag || 26 === grandTag || 27 === grandTag) {
              targetInst$jscomp$0 = ancestorInst = nodeTag;
              continue a;
            }
            container = container.parentNode;
          }
        }
        targetInst$jscomp$0 = targetInst$jscomp$0.return;
      }
    batchedUpdates$1(function() {
      var targetInst = ancestorInst, nativeEventTarget = getEventTarget(nativeEvent), dispatchQueue = [];
      a: {
        var reactName = topLevelEventsToReactNames.get(domEventName);
        if (void 0 !== reactName) {
          var SyntheticEventCtor = SyntheticEvent, reactEventType = domEventName;
          switch (domEventName) {
            case "keypress":
              if (0 === getEventCharCode(nativeEvent)) break a;
            case "keydown":
            case "keyup":
              SyntheticEventCtor = SyntheticKeyboardEvent;
              break;
            case "focusin":
              reactEventType = "focus";
              SyntheticEventCtor = SyntheticFocusEvent;
              break;
            case "focusout":
              reactEventType = "blur";
              SyntheticEventCtor = SyntheticFocusEvent;
              break;
            case "beforeblur":
            case "afterblur":
              SyntheticEventCtor = SyntheticFocusEvent;
              break;
            case "click":
              if (2 === nativeEvent.button) break a;
            case "auxclick":
            case "dblclick":
            case "mousedown":
            case "mousemove":
            case "mouseup":
            case "mouseout":
            case "mouseover":
            case "contextmenu":
              SyntheticEventCtor = SyntheticMouseEvent;
              break;
            case "drag":
            case "dragend":
            case "dragenter":
            case "dragexit":
            case "dragleave":
            case "dragover":
            case "dragstart":
            case "drop":
              SyntheticEventCtor = SyntheticDragEvent;
              break;
            case "touchcancel":
            case "touchend":
            case "touchmove":
            case "touchstart":
              SyntheticEventCtor = SyntheticTouchEvent;
              break;
            case ANIMATION_END:
            case ANIMATION_ITERATION:
            case ANIMATION_START:
              SyntheticEventCtor = SyntheticAnimationEvent;
              break;
            case TRANSITION_END:
              SyntheticEventCtor = SyntheticTransitionEvent;
              break;
            case "scroll":
            case "scrollend":
              SyntheticEventCtor = SyntheticUIEvent;
              break;
            case "wheel":
              SyntheticEventCtor = SyntheticWheelEvent;
              break;
            case "copy":
            case "cut":
            case "paste":
              SyntheticEventCtor = SyntheticClipboardEvent;
              break;
            case "gotpointercapture":
            case "lostpointercapture":
            case "pointercancel":
            case "pointerdown":
            case "pointermove":
            case "pointerout":
            case "pointerover":
            case "pointerup":
              SyntheticEventCtor = SyntheticPointerEvent;
              break;
            case "toggle":
            case "beforetoggle":
              SyntheticEventCtor = SyntheticToggleEvent;
          }
          var inCapturePhase = 0 !== (eventSystemFlags & 4), accumulateTargetOnly = !inCapturePhase && ("scroll" === domEventName || "scrollend" === domEventName), reactEventName = inCapturePhase ? null !== reactName ? reactName + "Capture" : null : reactName;
          inCapturePhase = [];
          for (var instance = targetInst, lastHostComponent; null !== instance; ) {
            var _instance = instance;
            lastHostComponent = _instance.stateNode;
            _instance = _instance.tag;
            5 !== _instance && 26 !== _instance && 27 !== _instance || null === lastHostComponent || null === reactEventName || (_instance = getListener(instance, reactEventName), null != _instance && inCapturePhase.push(
              createDispatchListener(instance, _instance, lastHostComponent)
            ));
            if (accumulateTargetOnly) break;
            instance = instance.return;
          }
          0 < inCapturePhase.length && (reactName = new SyntheticEventCtor(
            reactName,
            reactEventType,
            null,
            nativeEvent,
            nativeEventTarget
          ), dispatchQueue.push({ event: reactName, listeners: inCapturePhase }));
        }
      }
      if (0 === (eventSystemFlags & 7)) {
        a: {
          reactName = "mouseover" === domEventName || "pointerover" === domEventName;
          SyntheticEventCtor = "mouseout" === domEventName || "pointerout" === domEventName;
          if (reactName && nativeEvent !== currentReplayingEvent && (reactEventType = nativeEvent.relatedTarget || nativeEvent.fromElement) && (getClosestInstanceFromNode(reactEventType) || reactEventType[internalContainerInstanceKey]))
            break a;
          if (SyntheticEventCtor || reactName) {
            reactName = nativeEventTarget.window === nativeEventTarget ? nativeEventTarget : (reactName = nativeEventTarget.ownerDocument) ? reactName.defaultView || reactName.parentWindow : window;
            if (SyntheticEventCtor) {
              if (reactEventType = nativeEvent.relatedTarget || nativeEvent.toElement, SyntheticEventCtor = targetInst, reactEventType = reactEventType ? getClosestInstanceFromNode(reactEventType) : null, null !== reactEventType && (accumulateTargetOnly = getNearestMountedFiber(reactEventType), inCapturePhase = reactEventType.tag, reactEventType !== accumulateTargetOnly || 5 !== inCapturePhase && 27 !== inCapturePhase && 6 !== inCapturePhase))
                reactEventType = null;
            } else SyntheticEventCtor = null, reactEventType = targetInst;
            if (SyntheticEventCtor !== reactEventType) {
              inCapturePhase = SyntheticMouseEvent;
              _instance = "onMouseLeave";
              reactEventName = "onMouseEnter";
              instance = "mouse";
              if ("pointerout" === domEventName || "pointerover" === domEventName)
                inCapturePhase = SyntheticPointerEvent, _instance = "onPointerLeave", reactEventName = "onPointerEnter", instance = "pointer";
              accumulateTargetOnly = null == SyntheticEventCtor ? reactName : getNodeFromInstance(SyntheticEventCtor);
              lastHostComponent = null == reactEventType ? reactName : getNodeFromInstance(reactEventType);
              reactName = new inCapturePhase(
                _instance,
                instance + "leave",
                SyntheticEventCtor,
                nativeEvent,
                nativeEventTarget
              );
              reactName.target = accumulateTargetOnly;
              reactName.relatedTarget = lastHostComponent;
              _instance = null;
              getClosestInstanceFromNode(nativeEventTarget) === targetInst && (inCapturePhase = new inCapturePhase(
                reactEventName,
                instance + "enter",
                reactEventType,
                nativeEvent,
                nativeEventTarget
              ), inCapturePhase.target = lastHostComponent, inCapturePhase.relatedTarget = accumulateTargetOnly, _instance = inCapturePhase);
              accumulateTargetOnly = _instance;
              if (SyntheticEventCtor && reactEventType)
                b: {
                  inCapturePhase = getParent;
                  reactEventName = SyntheticEventCtor;
                  instance = reactEventType;
                  lastHostComponent = 0;
                  for (_instance = reactEventName; _instance; _instance = inCapturePhase(_instance))
                    lastHostComponent++;
                  _instance = 0;
                  for (var tempB = instance; tempB; tempB = inCapturePhase(tempB))
                    _instance++;
                  for (; 0 < lastHostComponent - _instance; )
                    reactEventName = inCapturePhase(reactEventName), lastHostComponent--;
                  for (; 0 < _instance - lastHostComponent; )
                    instance = inCapturePhase(instance), _instance--;
                  for (; lastHostComponent--; ) {
                    if (reactEventName === instance || null !== instance && reactEventName === instance.alternate) {
                      inCapturePhase = reactEventName;
                      break b;
                    }
                    reactEventName = inCapturePhase(reactEventName);
                    instance = inCapturePhase(instance);
                  }
                  inCapturePhase = null;
                }
              else inCapturePhase = null;
              null !== SyntheticEventCtor && accumulateEnterLeaveListenersForEvent(
                dispatchQueue,
                reactName,
                SyntheticEventCtor,
                inCapturePhase,
                false
              );
              null !== reactEventType && null !== accumulateTargetOnly && accumulateEnterLeaveListenersForEvent(
                dispatchQueue,
                accumulateTargetOnly,
                reactEventType,
                inCapturePhase,
                true
              );
            }
          }
        }
        a: {
          reactName = targetInst ? getNodeFromInstance(targetInst) : window;
          SyntheticEventCtor = reactName.nodeName && reactName.nodeName.toLowerCase();
          if ("select" === SyntheticEventCtor || "input" === SyntheticEventCtor && "file" === reactName.type)
            var getTargetInstFunc = getTargetInstForChangeEvent;
          else if (isTextInputElement(reactName))
            if (isInputEventSupported)
              getTargetInstFunc = getTargetInstForInputOrChangeEvent;
            else {
              getTargetInstFunc = getTargetInstForInputEventPolyfill;
              var handleEventFunc = handleEventsForInputEventPolyfill;
            }
          else
            SyntheticEventCtor = reactName.nodeName, !SyntheticEventCtor || "input" !== SyntheticEventCtor.toLowerCase() || "checkbox" !== reactName.type && "radio" !== reactName.type ? targetInst && isCustomElement(targetInst.elementType) && (getTargetInstFunc = getTargetInstForChangeEvent) : getTargetInstFunc = getTargetInstForClickEvent;
          if (getTargetInstFunc && (getTargetInstFunc = getTargetInstFunc(domEventName, targetInst))) {
            createAndAccumulateChangeEvent(
              dispatchQueue,
              getTargetInstFunc,
              nativeEvent,
              nativeEventTarget
            );
            break a;
          }
          handleEventFunc && handleEventFunc(domEventName, reactName, targetInst);
          "focusout" === domEventName && targetInst && "number" === reactName.type && null != targetInst.memoizedProps.value && setDefaultValue(reactName, "number", reactName.value);
        }
        handleEventFunc = targetInst ? getNodeFromInstance(targetInst) : window;
        switch (domEventName) {
          case "focusin":
            if (isTextInputElement(handleEventFunc) || "true" === handleEventFunc.contentEditable)
              activeElement = handleEventFunc, activeElementInst = targetInst, lastSelection = null;
            break;
          case "focusout":
            lastSelection = activeElementInst = activeElement = null;
            break;
          case "mousedown":
            mouseDown = true;
            break;
          case "contextmenu":
          case "mouseup":
          case "dragend":
            mouseDown = false;
            constructSelectEvent(dispatchQueue, nativeEvent, nativeEventTarget);
            break;
          case "selectionchange":
            if (skipSelectionChangeEvent) break;
          case "keydown":
          case "keyup":
            constructSelectEvent(dispatchQueue, nativeEvent, nativeEventTarget);
        }
        var fallbackData;
        if (canUseCompositionEvent)
          b: {
            switch (domEventName) {
              case "compositionstart":
                var eventType = "onCompositionStart";
                break b;
              case "compositionend":
                eventType = "onCompositionEnd";
                break b;
              case "compositionupdate":
                eventType = "onCompositionUpdate";
                break b;
            }
            eventType = void 0;
          }
        else
          isComposing ? isFallbackCompositionEnd(domEventName, nativeEvent) && (eventType = "onCompositionEnd") : "keydown" === domEventName && 229 === nativeEvent.keyCode && (eventType = "onCompositionStart");
        eventType && (useFallbackCompositionData && "ko" !== nativeEvent.locale && (isComposing || "onCompositionStart" !== eventType ? "onCompositionEnd" === eventType && isComposing && (fallbackData = getData()) : (root = nativeEventTarget, startText = "value" in root ? root.value : root.textContent, isComposing = true)), handleEventFunc = accumulateTwoPhaseListeners(targetInst, eventType), 0 < handleEventFunc.length && (eventType = new SyntheticCompositionEvent(
          eventType,
          domEventName,
          null,
          nativeEvent,
          nativeEventTarget
        ), dispatchQueue.push({ event: eventType, listeners: handleEventFunc }), fallbackData ? eventType.data = fallbackData : (fallbackData = getDataFromCustomEvent(nativeEvent), null !== fallbackData && (eventType.data = fallbackData))));
        if (fallbackData = canUseTextInputEvent ? getNativeBeforeInputChars(domEventName, nativeEvent) : getFallbackBeforeInputChars(domEventName, nativeEvent))
          eventType = accumulateTwoPhaseListeners(targetInst, "onBeforeInput"), 0 < eventType.length && (handleEventFunc = new SyntheticCompositionEvent(
            "onBeforeInput",
            "beforeinput",
            null,
            nativeEvent,
            nativeEventTarget
          ), dispatchQueue.push({
            event: handleEventFunc,
            listeners: eventType
          }), handleEventFunc.data = fallbackData);
        extractEvents$1(
          dispatchQueue,
          domEventName,
          targetInst,
          nativeEvent,
          nativeEventTarget
        );
      }
      processDispatchQueue(dispatchQueue, eventSystemFlags);
    });
  }
  function createDispatchListener(instance, listener, currentTarget) {
    return {
      instance,
      listener,
      currentTarget
    };
  }
  function accumulateTwoPhaseListeners(targetFiber, reactName) {
    for (var captureName = reactName + "Capture", listeners = []; null !== targetFiber; ) {
      var _instance2 = targetFiber, stateNode = _instance2.stateNode;
      _instance2 = _instance2.tag;
      5 !== _instance2 && 26 !== _instance2 && 27 !== _instance2 || null === stateNode || (_instance2 = getListener(targetFiber, captureName), null != _instance2 && listeners.unshift(
        createDispatchListener(targetFiber, _instance2, stateNode)
      ), _instance2 = getListener(targetFiber, reactName), null != _instance2 && listeners.push(
        createDispatchListener(targetFiber, _instance2, stateNode)
      ));
      if (3 === targetFiber.tag) return listeners;
      targetFiber = targetFiber.return;
    }
    return [];
  }
  function getParent(inst) {
    if (null === inst) return null;
    do
      inst = inst.return;
    while (inst && 5 !== inst.tag && 27 !== inst.tag);
    return inst ? inst : null;
  }
  function accumulateEnterLeaveListenersForEvent(dispatchQueue, event, target, common, inCapturePhase) {
    for (var registrationName = event._reactName, listeners = []; null !== target && target !== common; ) {
      var _instance3 = target, alternate = _instance3.alternate, stateNode = _instance3.stateNode;
      _instance3 = _instance3.tag;
      if (null !== alternate && alternate === common) break;
      5 !== _instance3 && 26 !== _instance3 && 27 !== _instance3 || null === stateNode || (alternate = stateNode, inCapturePhase ? (stateNode = getListener(target, registrationName), null != stateNode && listeners.unshift(
        createDispatchListener(target, stateNode, alternate)
      )) : inCapturePhase || (stateNode = getListener(target, registrationName), null != stateNode && listeners.push(
        createDispatchListener(target, stateNode, alternate)
      )));
      target = target.return;
    }
    0 !== listeners.length && dispatchQueue.push({ event, listeners });
  }
  var NORMALIZE_NEWLINES_REGEX = /\r\n?/g, NORMALIZE_NULL_AND_REPLACEMENT_REGEX = /\u0000|\uFFFD/g;
  function normalizeMarkupForTextOrAttribute(markup) {
    return ("string" === typeof markup ? markup : "" + markup).replace(NORMALIZE_NEWLINES_REGEX, "\n").replace(NORMALIZE_NULL_AND_REPLACEMENT_REGEX, "");
  }
  function checkForUnmatchedText(serverText, clientText) {
    clientText = normalizeMarkupForTextOrAttribute(clientText);
    return normalizeMarkupForTextOrAttribute(serverText) === clientText ? true : false;
  }
  function setProp(domElement, tag, key, value, props, prevValue) {
    switch (key) {
      case "children":
        "string" === typeof value ? "body" === tag || "textarea" === tag && "" === value || setTextContent(domElement, value) : ("number" === typeof value || "bigint" === typeof value) && "body" !== tag && setTextContent(domElement, "" + value);
        break;
      case "className":
        setValueForKnownAttribute(domElement, "class", value);
        break;
      case "tabIndex":
        setValueForKnownAttribute(domElement, "tabindex", value);
        break;
      case "dir":
      case "role":
      case "viewBox":
      case "width":
      case "height":
        setValueForKnownAttribute(domElement, key, value);
        break;
      case "style":
        setValueForStyles(domElement, value, prevValue);
        break;
      case "data":
        if ("object" !== tag) {
          setValueForKnownAttribute(domElement, "data", value);
          break;
        }
      case "src":
      case "href":
        if ("" === value && ("a" !== tag || "href" !== key)) {
          domElement.removeAttribute(key);
          break;
        }
        if (null == value || "function" === typeof value || "symbol" === typeof value || "boolean" === typeof value) {
          domElement.removeAttribute(key);
          break;
        }
        value = sanitizeURL("" + value);
        domElement.setAttribute(key, value);
        break;
      case "action":
      case "formAction":
        if ("function" === typeof value) {
          domElement.setAttribute(
            key,
            "javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')"
          );
          break;
        } else
          "function" === typeof prevValue && ("formAction" === key ? ("input" !== tag && setProp(domElement, tag, "name", props.name, props, null), setProp(
            domElement,
            tag,
            "formEncType",
            props.formEncType,
            props,
            null
          ), setProp(
            domElement,
            tag,
            "formMethod",
            props.formMethod,
            props,
            null
          ), setProp(
            domElement,
            tag,
            "formTarget",
            props.formTarget,
            props,
            null
          )) : (setProp(domElement, tag, "encType", props.encType, props, null), setProp(domElement, tag, "method", props.method, props, null), setProp(domElement, tag, "target", props.target, props, null)));
        if (null == value || "symbol" === typeof value || "boolean" === typeof value) {
          domElement.removeAttribute(key);
          break;
        }
        value = sanitizeURL("" + value);
        domElement.setAttribute(key, value);
        break;
      case "onClick":
        null != value && (domElement.onclick = noop$1);
        break;
      case "onScroll":
        null != value && listenToNonDelegatedEvent("scroll", domElement);
        break;
      case "onScrollEnd":
        null != value && listenToNonDelegatedEvent("scrollend", domElement);
        break;
      case "dangerouslySetInnerHTML":
        if (null != value) {
          if ("object" !== typeof value || !("__html" in value))
            throw Error(formatProdErrorMessage(61));
          key = value.__html;
          if (null != key) {
            if (null != props.children) throw Error(formatProdErrorMessage(60));
            domElement.innerHTML = key;
          }
        }
        break;
      case "multiple":
        domElement.multiple = value && "function" !== typeof value && "symbol" !== typeof value;
        break;
      case "muted":
        domElement.muted = value && "function" !== typeof value && "symbol" !== typeof value;
        break;
      case "suppressContentEditableWarning":
      case "suppressHydrationWarning":
      case "defaultValue":
      case "defaultChecked":
      case "innerHTML":
      case "ref":
        break;
      case "autoFocus":
        break;
      case "xlinkHref":
        if (null == value || "function" === typeof value || "boolean" === typeof value || "symbol" === typeof value) {
          domElement.removeAttribute("xlink:href");
          break;
        }
        key = sanitizeURL("" + value);
        domElement.setAttributeNS(
          "http://www.w3.org/1999/xlink",
          "xlink:href",
          key
        );
        break;
      case "contentEditable":
      case "spellCheck":
      case "draggable":
      case "value":
      case "autoReverse":
      case "externalResourcesRequired":
      case "focusable":
      case "preserveAlpha":
        null != value && "function" !== typeof value && "symbol" !== typeof value ? domElement.setAttribute(key, "" + value) : domElement.removeAttribute(key);
        break;
      case "inert":
      case "allowFullScreen":
      case "async":
      case "autoPlay":
      case "controls":
      case "default":
      case "defer":
      case "disabled":
      case "disablePictureInPicture":
      case "disableRemotePlayback":
      case "formNoValidate":
      case "hidden":
      case "loop":
      case "noModule":
      case "noValidate":
      case "open":
      case "playsInline":
      case "readOnly":
      case "required":
      case "reversed":
      case "scoped":
      case "seamless":
      case "itemScope":
        value && "function" !== typeof value && "symbol" !== typeof value ? domElement.setAttribute(key, "") : domElement.removeAttribute(key);
        break;
      case "capture":
      case "download":
        true === value ? domElement.setAttribute(key, "") : false !== value && null != value && "function" !== typeof value && "symbol" !== typeof value ? domElement.setAttribute(key, value) : domElement.removeAttribute(key);
        break;
      case "cols":
      case "rows":
      case "size":
      case "span":
        null != value && "function" !== typeof value && "symbol" !== typeof value && !isNaN(value) && 1 <= value ? domElement.setAttribute(key, value) : domElement.removeAttribute(key);
        break;
      case "rowSpan":
      case "start":
        null == value || "function" === typeof value || "symbol" === typeof value || isNaN(value) ? domElement.removeAttribute(key) : domElement.setAttribute(key, value);
        break;
      case "popover":
        listenToNonDelegatedEvent("beforetoggle", domElement);
        listenToNonDelegatedEvent("toggle", domElement);
        setValueForAttribute(domElement, "popover", value);
        break;
      case "xlinkActuate":
        setValueForNamespacedAttribute(
          domElement,
          "http://www.w3.org/1999/xlink",
          "xlink:actuate",
          value
        );
        break;
      case "xlinkArcrole":
        setValueForNamespacedAttribute(
          domElement,
          "http://www.w3.org/1999/xlink",
          "xlink:arcrole",
          value
        );
        break;
      case "xlinkRole":
        setValueForNamespacedAttribute(
          domElement,
          "http://www.w3.org/1999/xlink",
          "xlink:role",
          value
        );
        break;
      case "xlinkShow":
        setValueForNamespacedAttribute(
          domElement,
          "http://www.w3.org/1999/xlink",
          "xlink:show",
          value
        );
        break;
      case "xlinkTitle":
        setValueForNamespacedAttribute(
          domElement,
          "http://www.w3.org/1999/xlink",
          "xlink:title",
          value
        );
        break;
      case "xlinkType":
        setValueForNamespacedAttribute(
          domElement,
          "http://www.w3.org/1999/xlink",
          "xlink:type",
          value
        );
        break;
      case "xmlBase":
        setValueForNamespacedAttribute(
          domElement,
          "http://www.w3.org/XML/1998/namespace",
          "xml:base",
          value
        );
        break;
      case "xmlLang":
        setValueForNamespacedAttribute(
          domElement,
          "http://www.w3.org/XML/1998/namespace",
          "xml:lang",
          value
        );
        break;
      case "xmlSpace":
        setValueForNamespacedAttribute(
          domElement,
          "http://www.w3.org/XML/1998/namespace",
          "xml:space",
          value
        );
        break;
      case "is":
        setValueForAttribute(domElement, "is", value);
        break;
      case "innerText":
      case "textContent":
        break;
      default:
        if (!(2 < key.length) || "o" !== key[0] && "O" !== key[0] || "n" !== key[1] && "N" !== key[1])
          key = aliases.get(key) || key, setValueForAttribute(domElement, key, value);
    }
  }
  function setPropOnCustomElement(domElement, tag, key, value, props, prevValue) {
    switch (key) {
      case "style":
        setValueForStyles(domElement, value, prevValue);
        break;
      case "dangerouslySetInnerHTML":
        if (null != value) {
          if ("object" !== typeof value || !("__html" in value))
            throw Error(formatProdErrorMessage(61));
          key = value.__html;
          if (null != key) {
            if (null != props.children) throw Error(formatProdErrorMessage(60));
            domElement.innerHTML = key;
          }
        }
        break;
      case "children":
        "string" === typeof value ? setTextContent(domElement, value) : ("number" === typeof value || "bigint" === typeof value) && setTextContent(domElement, "" + value);
        break;
      case "onScroll":
        null != value && listenToNonDelegatedEvent("scroll", domElement);
        break;
      case "onScrollEnd":
        null != value && listenToNonDelegatedEvent("scrollend", domElement);
        break;
      case "onClick":
        null != value && (domElement.onclick = noop$1);
        break;
      case "suppressContentEditableWarning":
      case "suppressHydrationWarning":
      case "innerHTML":
      case "ref":
        break;
      case "innerText":
      case "textContent":
        break;
      default:
        if (!registrationNameDependencies.hasOwnProperty(key))
          a: {
            if ("o" === key[0] && "n" === key[1] && (props = key.endsWith("Capture"), tag = key.slice(2, props ? key.length - 7 : void 0), prevValue = domElement[internalPropsKey] || null, prevValue = null != prevValue ? prevValue[key] : null, "function" === typeof prevValue && domElement.removeEventListener(tag, prevValue, props), "function" === typeof value)) {
              "function" !== typeof prevValue && null !== prevValue && (key in domElement ? domElement[key] = null : domElement.hasAttribute(key) && domElement.removeAttribute(key));
              domElement.addEventListener(tag, value, props);
              break a;
            }
            key in domElement ? domElement[key] = value : true === value ? domElement.setAttribute(key, "") : setValueForAttribute(domElement, key, value);
          }
    }
  }
  function setInitialProperties(domElement, tag, props) {
    switch (tag) {
      case "div":
      case "span":
      case "svg":
      case "path":
      case "a":
      case "g":
      case "p":
      case "li":
        break;
      case "img":
        listenToNonDelegatedEvent("error", domElement);
        listenToNonDelegatedEvent("load", domElement);
        var hasSrc = false, hasSrcSet = false, propKey;
        for (propKey in props)
          if (props.hasOwnProperty(propKey)) {
            var propValue = props[propKey];
            if (null != propValue)
              switch (propKey) {
                case "src":
                  hasSrc = true;
                  break;
                case "srcSet":
                  hasSrcSet = true;
                  break;
                case "children":
                case "dangerouslySetInnerHTML":
                  throw Error(formatProdErrorMessage(137, tag));
                default:
                  setProp(domElement, tag, propKey, propValue, props, null);
              }
          }
        hasSrcSet && setProp(domElement, tag, "srcSet", props.srcSet, props, null);
        hasSrc && setProp(domElement, tag, "src", props.src, props, null);
        return;
      case "input":
        listenToNonDelegatedEvent("invalid", domElement);
        var defaultValue = propKey = propValue = hasSrcSet = null, checked = null, defaultChecked = null;
        for (hasSrc in props)
          if (props.hasOwnProperty(hasSrc)) {
            var propValue$184 = props[hasSrc];
            if (null != propValue$184)
              switch (hasSrc) {
                case "name":
                  hasSrcSet = propValue$184;
                  break;
                case "type":
                  propValue = propValue$184;
                  break;
                case "checked":
                  checked = propValue$184;
                  break;
                case "defaultChecked":
                  defaultChecked = propValue$184;
                  break;
                case "value":
                  propKey = propValue$184;
                  break;
                case "defaultValue":
                  defaultValue = propValue$184;
                  break;
                case "children":
                case "dangerouslySetInnerHTML":
                  if (null != propValue$184)
                    throw Error(formatProdErrorMessage(137, tag));
                  break;
                default:
                  setProp(domElement, tag, hasSrc, propValue$184, props, null);
              }
          }
        initInput(
          domElement,
          propKey,
          defaultValue,
          checked,
          defaultChecked,
          propValue,
          hasSrcSet,
          false
        );
        return;
      case "select":
        listenToNonDelegatedEvent("invalid", domElement);
        hasSrc = propValue = propKey = null;
        for (hasSrcSet in props)
          if (props.hasOwnProperty(hasSrcSet) && (defaultValue = props[hasSrcSet], null != defaultValue))
            switch (hasSrcSet) {
              case "value":
                propKey = defaultValue;
                break;
              case "defaultValue":
                propValue = defaultValue;
                break;
              case "multiple":
                hasSrc = defaultValue;
              default:
                setProp(domElement, tag, hasSrcSet, defaultValue, props, null);
            }
        tag = propKey;
        props = propValue;
        domElement.multiple = !!hasSrc;
        null != tag ? updateOptions(domElement, !!hasSrc, tag, false) : null != props && updateOptions(domElement, !!hasSrc, props, true);
        return;
      case "textarea":
        listenToNonDelegatedEvent("invalid", domElement);
        propKey = hasSrcSet = hasSrc = null;
        for (propValue in props)
          if (props.hasOwnProperty(propValue) && (defaultValue = props[propValue], null != defaultValue))
            switch (propValue) {
              case "value":
                hasSrc = defaultValue;
                break;
              case "defaultValue":
                hasSrcSet = defaultValue;
                break;
              case "children":
                propKey = defaultValue;
                break;
              case "dangerouslySetInnerHTML":
                if (null != defaultValue) throw Error(formatProdErrorMessage(91));
                break;
              default:
                setProp(domElement, tag, propValue, defaultValue, props, null);
            }
        initTextarea(domElement, hasSrc, hasSrcSet, propKey);
        return;
      case "option":
        for (checked in props)
          if (props.hasOwnProperty(checked) && (hasSrc = props[checked], null != hasSrc))
            switch (checked) {
              case "selected":
                domElement.selected = hasSrc && "function" !== typeof hasSrc && "symbol" !== typeof hasSrc;
                break;
              default:
                setProp(domElement, tag, checked, hasSrc, props, null);
            }
        return;
      case "dialog":
        listenToNonDelegatedEvent("beforetoggle", domElement);
        listenToNonDelegatedEvent("toggle", domElement);
        listenToNonDelegatedEvent("cancel", domElement);
        listenToNonDelegatedEvent("close", domElement);
        break;
      case "iframe":
      case "object":
        listenToNonDelegatedEvent("load", domElement);
        break;
      case "video":
      case "audio":
        for (hasSrc = 0; hasSrc < mediaEventTypes.length; hasSrc++)
          listenToNonDelegatedEvent(mediaEventTypes[hasSrc], domElement);
        break;
      case "image":
        listenToNonDelegatedEvent("error", domElement);
        listenToNonDelegatedEvent("load", domElement);
        break;
      case "details":
        listenToNonDelegatedEvent("toggle", domElement);
        break;
      case "embed":
      case "source":
      case "link":
        listenToNonDelegatedEvent("error", domElement), listenToNonDelegatedEvent("load", domElement);
      case "area":
      case "base":
      case "br":
      case "col":
      case "hr":
      case "keygen":
      case "meta":
      case "param":
      case "track":
      case "wbr":
      case "menuitem":
        for (defaultChecked in props)
          if (props.hasOwnProperty(defaultChecked) && (hasSrc = props[defaultChecked], null != hasSrc))
            switch (defaultChecked) {
              case "children":
              case "dangerouslySetInnerHTML":
                throw Error(formatProdErrorMessage(137, tag));
              default:
                setProp(domElement, tag, defaultChecked, hasSrc, props, null);
            }
        return;
      default:
        if (isCustomElement(tag)) {
          for (propValue$184 in props)
            props.hasOwnProperty(propValue$184) && (hasSrc = props[propValue$184], void 0 !== hasSrc && setPropOnCustomElement(
              domElement,
              tag,
              propValue$184,
              hasSrc,
              props,
              void 0
            ));
          return;
        }
    }
    for (defaultValue in props)
      props.hasOwnProperty(defaultValue) && (hasSrc = props[defaultValue], null != hasSrc && setProp(domElement, tag, defaultValue, hasSrc, props, null));
  }
  function updateProperties(domElement, tag, lastProps, nextProps) {
    switch (tag) {
      case "div":
      case "span":
      case "svg":
      case "path":
      case "a":
      case "g":
      case "p":
      case "li":
        break;
      case "input":
        var name = null, type = null, value = null, defaultValue = null, lastDefaultValue = null, checked = null, defaultChecked = null;
        for (propKey in lastProps) {
          var lastProp = lastProps[propKey];
          if (lastProps.hasOwnProperty(propKey) && null != lastProp)
            switch (propKey) {
              case "checked":
                break;
              case "value":
                break;
              case "defaultValue":
                lastDefaultValue = lastProp;
              default:
                nextProps.hasOwnProperty(propKey) || setProp(domElement, tag, propKey, null, nextProps, lastProp);
            }
        }
        for (var propKey$201 in nextProps) {
          var propKey = nextProps[propKey$201];
          lastProp = lastProps[propKey$201];
          if (nextProps.hasOwnProperty(propKey$201) && (null != propKey || null != lastProp))
            switch (propKey$201) {
              case "type":
                type = propKey;
                break;
              case "name":
                name = propKey;
                break;
              case "checked":
                checked = propKey;
                break;
              case "defaultChecked":
                defaultChecked = propKey;
                break;
              case "value":
                value = propKey;
                break;
              case "defaultValue":
                defaultValue = propKey;
                break;
              case "children":
              case "dangerouslySetInnerHTML":
                if (null != propKey)
                  throw Error(formatProdErrorMessage(137, tag));
                break;
              default:
                propKey !== lastProp && setProp(
                  domElement,
                  tag,
                  propKey$201,
                  propKey,
                  nextProps,
                  lastProp
                );
            }
        }
        updateInput(
          domElement,
          value,
          defaultValue,
          lastDefaultValue,
          checked,
          defaultChecked,
          type,
          name
        );
        return;
      case "select":
        propKey = value = defaultValue = propKey$201 = null;
        for (type in lastProps)
          if (lastDefaultValue = lastProps[type], lastProps.hasOwnProperty(type) && null != lastDefaultValue)
            switch (type) {
              case "value":
                break;
              case "multiple":
                propKey = lastDefaultValue;
              default:
                nextProps.hasOwnProperty(type) || setProp(
                  domElement,
                  tag,
                  type,
                  null,
                  nextProps,
                  lastDefaultValue
                );
            }
        for (name in nextProps)
          if (type = nextProps[name], lastDefaultValue = lastProps[name], nextProps.hasOwnProperty(name) && (null != type || null != lastDefaultValue))
            switch (name) {
              case "value":
                propKey$201 = type;
                break;
              case "defaultValue":
                defaultValue = type;
                break;
              case "multiple":
                value = type;
              default:
                type !== lastDefaultValue && setProp(
                  domElement,
                  tag,
                  name,
                  type,
                  nextProps,
                  lastDefaultValue
                );
            }
        tag = defaultValue;
        lastProps = value;
        nextProps = propKey;
        null != propKey$201 ? updateOptions(domElement, !!lastProps, propKey$201, false) : !!nextProps !== !!lastProps && (null != tag ? updateOptions(domElement, !!lastProps, tag, true) : updateOptions(domElement, !!lastProps, lastProps ? [] : "", false));
        return;
      case "textarea":
        propKey = propKey$201 = null;
        for (defaultValue in lastProps)
          if (name = lastProps[defaultValue], lastProps.hasOwnProperty(defaultValue) && null != name && !nextProps.hasOwnProperty(defaultValue))
            switch (defaultValue) {
              case "value":
                break;
              case "children":
                break;
              default:
                setProp(domElement, tag, defaultValue, null, nextProps, name);
            }
        for (value in nextProps)
          if (name = nextProps[value], type = lastProps[value], nextProps.hasOwnProperty(value) && (null != name || null != type))
            switch (value) {
              case "value":
                propKey$201 = name;
                break;
              case "defaultValue":
                propKey = name;
                break;
              case "children":
                break;
              case "dangerouslySetInnerHTML":
                if (null != name) throw Error(formatProdErrorMessage(91));
                break;
              default:
                name !== type && setProp(domElement, tag, value, name, nextProps, type);
            }
        updateTextarea(domElement, propKey$201, propKey);
        return;
      case "option":
        for (var propKey$217 in lastProps)
          if (propKey$201 = lastProps[propKey$217], lastProps.hasOwnProperty(propKey$217) && null != propKey$201 && !nextProps.hasOwnProperty(propKey$217))
            switch (propKey$217) {
              case "selected":
                domElement.selected = false;
                break;
              default:
                setProp(
                  domElement,
                  tag,
                  propKey$217,
                  null,
                  nextProps,
                  propKey$201
                );
            }
        for (lastDefaultValue in nextProps)
          if (propKey$201 = nextProps[lastDefaultValue], propKey = lastProps[lastDefaultValue], nextProps.hasOwnProperty(lastDefaultValue) && propKey$201 !== propKey && (null != propKey$201 || null != propKey))
            switch (lastDefaultValue) {
              case "selected":
                domElement.selected = propKey$201 && "function" !== typeof propKey$201 && "symbol" !== typeof propKey$201;
                break;
              default:
                setProp(
                  domElement,
                  tag,
                  lastDefaultValue,
                  propKey$201,
                  nextProps,
                  propKey
                );
            }
        return;
      case "img":
      case "link":
      case "area":
      case "base":
      case "br":
      case "col":
      case "embed":
      case "hr":
      case "keygen":
      case "meta":
      case "param":
      case "source":
      case "track":
      case "wbr":
      case "menuitem":
        for (var propKey$222 in lastProps)
          propKey$201 = lastProps[propKey$222], lastProps.hasOwnProperty(propKey$222) && null != propKey$201 && !nextProps.hasOwnProperty(propKey$222) && setProp(domElement, tag, propKey$222, null, nextProps, propKey$201);
        for (checked in nextProps)
          if (propKey$201 = nextProps[checked], propKey = lastProps[checked], nextProps.hasOwnProperty(checked) && propKey$201 !== propKey && (null != propKey$201 || null != propKey))
            switch (checked) {
              case "children":
              case "dangerouslySetInnerHTML":
                if (null != propKey$201)
                  throw Error(formatProdErrorMessage(137, tag));
                break;
              default:
                setProp(
                  domElement,
                  tag,
                  checked,
                  propKey$201,
                  nextProps,
                  propKey
                );
            }
        return;
      default:
        if (isCustomElement(tag)) {
          for (var propKey$227 in lastProps)
            propKey$201 = lastProps[propKey$227], lastProps.hasOwnProperty(propKey$227) && void 0 !== propKey$201 && !nextProps.hasOwnProperty(propKey$227) && setPropOnCustomElement(
              domElement,
              tag,
              propKey$227,
              void 0,
              nextProps,
              propKey$201
            );
          for (defaultChecked in nextProps)
            propKey$201 = nextProps[defaultChecked], propKey = lastProps[defaultChecked], !nextProps.hasOwnProperty(defaultChecked) || propKey$201 === propKey || void 0 === propKey$201 && void 0 === propKey || setPropOnCustomElement(
              domElement,
              tag,
              defaultChecked,
              propKey$201,
              nextProps,
              propKey
            );
          return;
        }
    }
    for (var propKey$232 in lastProps)
      propKey$201 = lastProps[propKey$232], lastProps.hasOwnProperty(propKey$232) && null != propKey$201 && !nextProps.hasOwnProperty(propKey$232) && setProp(domElement, tag, propKey$232, null, nextProps, propKey$201);
    for (lastProp in nextProps)
      propKey$201 = nextProps[lastProp], propKey = lastProps[lastProp], !nextProps.hasOwnProperty(lastProp) || propKey$201 === propKey || null == propKey$201 && null == propKey || setProp(domElement, tag, lastProp, propKey$201, nextProps, propKey);
  }
  function isLikelyStaticResource(initiatorType) {
    switch (initiatorType) {
      case "css":
      case "script":
      case "font":
      case "img":
      case "image":
      case "input":
      case "link":
        return true;
      default:
        return false;
    }
  }
  function estimateBandwidth() {
    if ("function" === typeof performance.getEntriesByType) {
      for (var count = 0, bits = 0, resourceEntries = performance.getEntriesByType("resource"), i = 0; i < resourceEntries.length; i++) {
        var entry = resourceEntries[i], transferSize = entry.transferSize, initiatorType = entry.initiatorType, duration = entry.duration;
        if (transferSize && duration && isLikelyStaticResource(initiatorType)) {
          initiatorType = 0;
          duration = entry.responseEnd;
          for (i += 1; i < resourceEntries.length; i++) {
            var overlapEntry = resourceEntries[i], overlapStartTime = overlapEntry.startTime;
            if (overlapStartTime > duration) break;
            var overlapTransferSize = overlapEntry.transferSize, overlapInitiatorType = overlapEntry.initiatorType;
            overlapTransferSize && isLikelyStaticResource(overlapInitiatorType) && (overlapEntry = overlapEntry.responseEnd, initiatorType += overlapTransferSize * (overlapEntry < duration ? 1 : (duration - overlapStartTime) / (overlapEntry - overlapStartTime)));
          }
          --i;
          bits += 8 * (transferSize + initiatorType) / (entry.duration / 1e3);
          count++;
          if (10 < count) break;
        }
      }
      if (0 < count) return bits / count / 1e6;
    }
    return navigator.connection && (count = navigator.connection.downlink, "number" === typeof count) ? count : 5;
  }
  var eventsEnabled = null, selectionInformation = null;
  function getOwnerDocumentFromRootContainer(rootContainerElement) {
    return 9 === rootContainerElement.nodeType ? rootContainerElement : rootContainerElement.ownerDocument;
  }
  function getOwnHostContext(namespaceURI) {
    switch (namespaceURI) {
      case "http://www.w3.org/2000/svg":
        return 1;
      case "http://www.w3.org/1998/Math/MathML":
        return 2;
      default:
        return 0;
    }
  }
  function getChildHostContextProd(parentNamespace, type) {
    if (0 === parentNamespace)
      switch (type) {
        case "svg":
          return 1;
        case "math":
          return 2;
        default:
          return 0;
      }
    return 1 === parentNamespace && "foreignObject" === type ? 0 : parentNamespace;
  }
  function shouldSetTextContent(type, props) {
    return "textarea" === type || "noscript" === type || "string" === typeof props.children || "number" === typeof props.children || "bigint" === typeof props.children || "object" === typeof props.dangerouslySetInnerHTML && null !== props.dangerouslySetInnerHTML && null != props.dangerouslySetInnerHTML.__html;
  }
  var currentPopstateTransitionEvent = null;
  function shouldAttemptEagerTransition() {
    var event = window.event;
    if (event && "popstate" === event.type) {
      if (event === currentPopstateTransitionEvent) return false;
      currentPopstateTransitionEvent = event;
      return true;
    }
    currentPopstateTransitionEvent = null;
    return false;
  }
  var scheduleTimeout = "function" === typeof setTimeout ? setTimeout : void 0, cancelTimeout = "function" === typeof clearTimeout ? clearTimeout : void 0, localPromise = "function" === typeof Promise ? Promise : void 0, scheduleMicrotask = "function" === typeof queueMicrotask ? queueMicrotask : "undefined" !== typeof localPromise ? function(callback) {
    return localPromise.resolve(null).then(callback).catch(handleErrorInNextTick);
  } : scheduleTimeout;
  function handleErrorInNextTick(error) {
    setTimeout(function() {
      throw error;
    });
  }
  function isSingletonScope(type) {
    return "head" === type;
  }
  function clearHydrationBoundary(parentInstance, hydrationInstance) {
    var node = hydrationInstance, depth = 0;
    do {
      var nextNode = node.nextSibling;
      parentInstance.removeChild(node);
      if (nextNode && 8 === nextNode.nodeType)
        if (node = nextNode.data, "/$" === node || "/&" === node) {
          if (0 === depth) {
            parentInstance.removeChild(nextNode);
            retryIfBlockedOn(hydrationInstance);
            return;
          }
          depth--;
        } else if ("$" === node || "$?" === node || "$~" === node || "$!" === node || "&" === node)
          depth++;
        else if ("html" === node)
          releaseSingletonInstance(parentInstance.ownerDocument.documentElement);
        else if ("head" === node) {
          node = parentInstance.ownerDocument.head;
          releaseSingletonInstance(node);
          for (var node$jscomp$0 = node.firstChild; node$jscomp$0; ) {
            var nextNode$jscomp$0 = node$jscomp$0.nextSibling, nodeName = node$jscomp$0.nodeName;
            node$jscomp$0[internalHoistableMarker] || "SCRIPT" === nodeName || "STYLE" === nodeName || "LINK" === nodeName && "stylesheet" === node$jscomp$0.rel.toLowerCase() || node.removeChild(node$jscomp$0);
            node$jscomp$0 = nextNode$jscomp$0;
          }
        } else
          "body" === node && releaseSingletonInstance(parentInstance.ownerDocument.body);
      node = nextNode;
    } while (node);
    retryIfBlockedOn(hydrationInstance);
  }
  function hideOrUnhideDehydratedBoundary(suspenseInstance, isHidden) {
    var node = suspenseInstance;
    suspenseInstance = 0;
    do {
      var nextNode = node.nextSibling;
      1 === node.nodeType ? isHidden ? (node._stashedDisplay = node.style.display, node.style.display = "none") : (node.style.display = node._stashedDisplay || "", "" === node.getAttribute("style") && node.removeAttribute("style")) : 3 === node.nodeType && (isHidden ? (node._stashedText = node.nodeValue, node.nodeValue = "") : node.nodeValue = node._stashedText || "");
      if (nextNode && 8 === nextNode.nodeType)
        if (node = nextNode.data, "/$" === node)
          if (0 === suspenseInstance) break;
          else suspenseInstance--;
        else
          "$" !== node && "$?" !== node && "$~" !== node && "$!" !== node || suspenseInstance++;
      node = nextNode;
    } while (node);
  }
  function clearContainerSparingly(container) {
    var nextNode = container.firstChild;
    nextNode && 10 === nextNode.nodeType && (nextNode = nextNode.nextSibling);
    for (; nextNode; ) {
      var node = nextNode;
      nextNode = nextNode.nextSibling;
      switch (node.nodeName) {
        case "HTML":
        case "HEAD":
        case "BODY":
          clearContainerSparingly(node);
          detachDeletedInstance(node);
          continue;
        case "SCRIPT":
        case "STYLE":
          continue;
        case "LINK":
          if ("stylesheet" === node.rel.toLowerCase()) continue;
      }
      container.removeChild(node);
    }
  }
  function canHydrateInstance(instance, type, props, inRootOrSingleton) {
    for (; 1 === instance.nodeType; ) {
      var anyProps = props;
      if (instance.nodeName.toLowerCase() !== type.toLowerCase()) {
        if (!inRootOrSingleton && ("INPUT" !== instance.nodeName || "hidden" !== instance.type))
          break;
      } else if (!inRootOrSingleton)
        if ("input" === type && "hidden" === instance.type) {
          var name = null == anyProps.name ? null : "" + anyProps.name;
          if ("hidden" === anyProps.type && instance.getAttribute("name") === name)
            return instance;
        } else return instance;
      else if (!instance[internalHoistableMarker])
        switch (type) {
          case "meta":
            if (!instance.hasAttribute("itemprop")) break;
            return instance;
          case "link":
            name = instance.getAttribute("rel");
            if ("stylesheet" === name && instance.hasAttribute("data-precedence"))
              break;
            else if (name !== anyProps.rel || instance.getAttribute("href") !== (null == anyProps.href || "" === anyProps.href ? null : anyProps.href) || instance.getAttribute("crossorigin") !== (null == anyProps.crossOrigin ? null : anyProps.crossOrigin) || instance.getAttribute("title") !== (null == anyProps.title ? null : anyProps.title))
              break;
            return instance;
          case "style":
            if (instance.hasAttribute("data-precedence")) break;
            return instance;
          case "script":
            name = instance.getAttribute("src");
            if ((name !== (null == anyProps.src ? null : anyProps.src) || instance.getAttribute("type") !== (null == anyProps.type ? null : anyProps.type) || instance.getAttribute("crossorigin") !== (null == anyProps.crossOrigin ? null : anyProps.crossOrigin)) && name && instance.hasAttribute("async") && !instance.hasAttribute("itemprop"))
              break;
            return instance;
          default:
            return instance;
        }
      instance = getNextHydratable(instance.nextSibling);
      if (null === instance) break;
    }
    return null;
  }
  function canHydrateTextInstance(instance, text, inRootOrSingleton) {
    if ("" === text) return null;
    for (; 3 !== instance.nodeType; ) {
      if ((1 !== instance.nodeType || "INPUT" !== instance.nodeName || "hidden" !== instance.type) && !inRootOrSingleton)
        return null;
      instance = getNextHydratable(instance.nextSibling);
      if (null === instance) return null;
    }
    return instance;
  }
  function canHydrateHydrationBoundary(instance, inRootOrSingleton) {
    for (; 8 !== instance.nodeType; ) {
      if ((1 !== instance.nodeType || "INPUT" !== instance.nodeName || "hidden" !== instance.type) && !inRootOrSingleton)
        return null;
      instance = getNextHydratable(instance.nextSibling);
      if (null === instance) return null;
    }
    return instance;
  }
  function isSuspenseInstancePending(instance) {
    return "$?" === instance.data || "$~" === instance.data;
  }
  function isSuspenseInstanceFallback(instance) {
    return "$!" === instance.data || "$?" === instance.data && "loading" !== instance.ownerDocument.readyState;
  }
  function registerSuspenseInstanceRetry(instance, callback) {
    var ownerDocument = instance.ownerDocument;
    if ("$~" === instance.data) instance._reactRetry = callback;
    else if ("$?" !== instance.data || "loading" !== ownerDocument.readyState)
      callback();
    else {
      var listener = function() {
        callback();
        ownerDocument.removeEventListener("DOMContentLoaded", listener);
      };
      ownerDocument.addEventListener("DOMContentLoaded", listener);
      instance._reactRetry = listener;
    }
  }
  function getNextHydratable(node) {
    for (; null != node; node = node.nextSibling) {
      var nodeType = node.nodeType;
      if (1 === nodeType || 3 === nodeType) break;
      if (8 === nodeType) {
        nodeType = node.data;
        if ("$" === nodeType || "$!" === nodeType || "$?" === nodeType || "$~" === nodeType || "&" === nodeType || "F!" === nodeType || "F" === nodeType)
          break;
        if ("/$" === nodeType || "/&" === nodeType) return null;
      }
    }
    return node;
  }
  var previousHydratableOnEnteringScopedSingleton = null;
  function getNextHydratableInstanceAfterHydrationBoundary(hydrationInstance) {
    hydrationInstance = hydrationInstance.nextSibling;
    for (var depth = 0; hydrationInstance; ) {
      if (8 === hydrationInstance.nodeType) {
        var data = hydrationInstance.data;
        if ("/$" === data || "/&" === data) {
          if (0 === depth)
            return getNextHydratable(hydrationInstance.nextSibling);
          depth--;
        } else
          "$" !== data && "$!" !== data && "$?" !== data && "$~" !== data && "&" !== data || depth++;
      }
      hydrationInstance = hydrationInstance.nextSibling;
    }
    return null;
  }
  function getParentHydrationBoundary(targetInstance) {
    targetInstance = targetInstance.previousSibling;
    for (var depth = 0; targetInstance; ) {
      if (8 === targetInstance.nodeType) {
        var data = targetInstance.data;
        if ("$" === data || "$!" === data || "$?" === data || "$~" === data || "&" === data) {
          if (0 === depth) return targetInstance;
          depth--;
        } else "/$" !== data && "/&" !== data || depth++;
      }
      targetInstance = targetInstance.previousSibling;
    }
    return null;
  }
  function resolveSingletonInstance(type, props, rootContainerInstance) {
    props = getOwnerDocumentFromRootContainer(rootContainerInstance);
    switch (type) {
      case "html":
        type = props.documentElement;
        if (!type) throw Error(formatProdErrorMessage(452));
        return type;
      case "head":
        type = props.head;
        if (!type) throw Error(formatProdErrorMessage(453));
        return type;
      case "body":
        type = props.body;
        if (!type) throw Error(formatProdErrorMessage(454));
        return type;
      default:
        throw Error(formatProdErrorMessage(451));
    }
  }
  function releaseSingletonInstance(instance) {
    for (var attributes = instance.attributes; attributes.length; )
      instance.removeAttributeNode(attributes[0]);
    detachDeletedInstance(instance);
  }
  var preloadPropsMap = /* @__PURE__ */ new Map(), preconnectsSet = /* @__PURE__ */ new Set();
  function getHoistableRoot(container) {
    return "function" === typeof container.getRootNode ? container.getRootNode() : 9 === container.nodeType ? container : container.ownerDocument;
  }
  var previousDispatcher = ReactDOMSharedInternals.d;
  ReactDOMSharedInternals.d = {
    f: flushSyncWork,
    r: requestFormReset,
    D: prefetchDNS,
    C: preconnect,
    L: preload2,
    m: preloadModule,
    X: preinitScript,
    S: preinitStyle,
    M: preinitModuleScript
  };
  function flushSyncWork() {
    var previousWasRendering = previousDispatcher.f(), wasRendering = flushSyncWork$1();
    return previousWasRendering || wasRendering;
  }
  function requestFormReset(form) {
    var formInst = getInstanceFromNode(form);
    null !== formInst && 5 === formInst.tag && "form" === formInst.type ? requestFormReset$1(formInst) : previousDispatcher.r(form);
  }
  var globalDocument = "undefined" === typeof document ? null : document;
  function preconnectAs(rel, href, crossOrigin) {
    var ownerDocument = globalDocument;
    if (ownerDocument && "string" === typeof href && href) {
      var limitedEscapedHref = escapeSelectorAttributeValueInsideDoubleQuotes(href);
      limitedEscapedHref = 'link[rel="' + rel + '"][href="' + limitedEscapedHref + '"]';
      "string" === typeof crossOrigin && (limitedEscapedHref += '[crossorigin="' + crossOrigin + '"]');
      preconnectsSet.has(limitedEscapedHref) || (preconnectsSet.add(limitedEscapedHref), rel = { rel, crossOrigin, href }, null === ownerDocument.querySelector(limitedEscapedHref) && (href = ownerDocument.createElement("link"), setInitialProperties(href, "link", rel), markNodeAsHoistable(href), ownerDocument.head.appendChild(href)));
    }
  }
  function prefetchDNS(href) {
    previousDispatcher.D(href);
    preconnectAs("dns-prefetch", href, null);
  }
  function preconnect(href, crossOrigin) {
    previousDispatcher.C(href, crossOrigin);
    preconnectAs("preconnect", href, crossOrigin);
  }
  function preload2(href, as, options2) {
    previousDispatcher.L(href, as, options2);
    var ownerDocument = globalDocument;
    if (ownerDocument && href && as) {
      var preloadSelector = 'link[rel="preload"][as="' + escapeSelectorAttributeValueInsideDoubleQuotes(as) + '"]';
      "image" === as ? options2 && options2.imageSrcSet ? (preloadSelector += '[imagesrcset="' + escapeSelectorAttributeValueInsideDoubleQuotes(
        options2.imageSrcSet
      ) + '"]', "string" === typeof options2.imageSizes && (preloadSelector += '[imagesizes="' + escapeSelectorAttributeValueInsideDoubleQuotes(
        options2.imageSizes
      ) + '"]')) : preloadSelector += '[href="' + escapeSelectorAttributeValueInsideDoubleQuotes(href) + '"]' : preloadSelector += '[href="' + escapeSelectorAttributeValueInsideDoubleQuotes(href) + '"]';
      var key = preloadSelector;
      switch (as) {
        case "style":
          key = getStyleKey(href);
          break;
        case "script":
          key = getScriptKey(href);
      }
      preloadPropsMap.has(key) || (href = assign(
        {
          rel: "preload",
          href: "image" === as && options2 && options2.imageSrcSet ? void 0 : href,
          as
        },
        options2
      ), preloadPropsMap.set(key, href), null !== ownerDocument.querySelector(preloadSelector) || "style" === as && ownerDocument.querySelector(getStylesheetSelectorFromKey(key)) || "script" === as && ownerDocument.querySelector(getScriptSelectorFromKey(key)) || (as = ownerDocument.createElement("link"), setInitialProperties(as, "link", href), markNodeAsHoistable(as), ownerDocument.head.appendChild(as)));
    }
  }
  function preloadModule(href, options2) {
    previousDispatcher.m(href, options2);
    var ownerDocument = globalDocument;
    if (ownerDocument && href) {
      var as = options2 && "string" === typeof options2.as ? options2.as : "script", preloadSelector = 'link[rel="modulepreload"][as="' + escapeSelectorAttributeValueInsideDoubleQuotes(as) + '"][href="' + escapeSelectorAttributeValueInsideDoubleQuotes(href) + '"]', key = preloadSelector;
      switch (as) {
        case "audioworklet":
        case "paintworklet":
        case "serviceworker":
        case "sharedworker":
        case "worker":
        case "script":
          key = getScriptKey(href);
      }
      if (!preloadPropsMap.has(key) && (href = assign({ rel: "modulepreload", href }, options2), preloadPropsMap.set(key, href), null === ownerDocument.querySelector(preloadSelector))) {
        switch (as) {
          case "audioworklet":
          case "paintworklet":
          case "serviceworker":
          case "sharedworker":
          case "worker":
          case "script":
            if (ownerDocument.querySelector(getScriptSelectorFromKey(key)))
              return;
        }
        as = ownerDocument.createElement("link");
        setInitialProperties(as, "link", href);
        markNodeAsHoistable(as);
        ownerDocument.head.appendChild(as);
      }
    }
  }
  function preinitStyle(href, precedence, options2) {
    previousDispatcher.S(href, precedence, options2);
    var ownerDocument = globalDocument;
    if (ownerDocument && href) {
      var styles = getResourcesFromRoot(ownerDocument).hoistableStyles, key = getStyleKey(href);
      precedence = precedence || "default";
      var resource = styles.get(key);
      if (!resource) {
        var state = { loading: 0, preload: null };
        if (resource = ownerDocument.querySelector(
          getStylesheetSelectorFromKey(key)
        ))
          state.loading = 5;
        else {
          href = assign(
            { rel: "stylesheet", href, "data-precedence": precedence },
            options2
          );
          (options2 = preloadPropsMap.get(key)) && adoptPreloadPropsForStylesheet(href, options2);
          var link = resource = ownerDocument.createElement("link");
          markNodeAsHoistable(link);
          setInitialProperties(link, "link", href);
          link._p = new Promise(function(resolve, reject) {
            link.onload = resolve;
            link.onerror = reject;
          });
          link.addEventListener("load", function() {
            state.loading |= 1;
          });
          link.addEventListener("error", function() {
            state.loading |= 2;
          });
          state.loading |= 4;
          insertStylesheet(resource, precedence, ownerDocument);
        }
        resource = {
          type: "stylesheet",
          instance: resource,
          count: 1,
          state
        };
        styles.set(key, resource);
      }
    }
  }
  function preinitScript(src, options2) {
    previousDispatcher.X(src, options2);
    var ownerDocument = globalDocument;
    if (ownerDocument && src) {
      var scripts = getResourcesFromRoot(ownerDocument).hoistableScripts, key = getScriptKey(src), resource = scripts.get(key);
      resource || (resource = ownerDocument.querySelector(getScriptSelectorFromKey(key)), resource || (src = assign({ src, async: true }, options2), (options2 = preloadPropsMap.get(key)) && adoptPreloadPropsForScript(src, options2), resource = ownerDocument.createElement("script"), markNodeAsHoistable(resource), setInitialProperties(resource, "link", src), ownerDocument.head.appendChild(resource)), resource = {
        type: "script",
        instance: resource,
        count: 1,
        state: null
      }, scripts.set(key, resource));
    }
  }
  function preinitModuleScript(src, options2) {
    previousDispatcher.M(src, options2);
    var ownerDocument = globalDocument;
    if (ownerDocument && src) {
      var scripts = getResourcesFromRoot(ownerDocument).hoistableScripts, key = getScriptKey(src), resource = scripts.get(key);
      resource || (resource = ownerDocument.querySelector(getScriptSelectorFromKey(key)), resource || (src = assign({ src, async: true, type: "module" }, options2), (options2 = preloadPropsMap.get(key)) && adoptPreloadPropsForScript(src, options2), resource = ownerDocument.createElement("script"), markNodeAsHoistable(resource), setInitialProperties(resource, "link", src), ownerDocument.head.appendChild(resource)), resource = {
        type: "script",
        instance: resource,
        count: 1,
        state: null
      }, scripts.set(key, resource));
    }
  }
  function getResource(type, currentProps, pendingProps, currentResource) {
    var JSCompiler_inline_result = (JSCompiler_inline_result = rootInstanceStackCursor.current) ? getHoistableRoot(JSCompiler_inline_result) : null;
    if (!JSCompiler_inline_result) throw Error(formatProdErrorMessage(446));
    switch (type) {
      case "meta":
      case "title":
        return null;
      case "style":
        return "string" === typeof pendingProps.precedence && "string" === typeof pendingProps.href ? (currentProps = getStyleKey(pendingProps.href), pendingProps = getResourcesFromRoot(
          JSCompiler_inline_result
        ).hoistableStyles, currentResource = pendingProps.get(currentProps), currentResource || (currentResource = {
          type: "style",
          instance: null,
          count: 0,
          state: null
        }, pendingProps.set(currentProps, currentResource)), currentResource) : { type: "void", instance: null, count: 0, state: null };
      case "link":
        if ("stylesheet" === pendingProps.rel && "string" === typeof pendingProps.href && "string" === typeof pendingProps.precedence) {
          type = getStyleKey(pendingProps.href);
          var styles$243 = getResourcesFromRoot(
            JSCompiler_inline_result
          ).hoistableStyles, resource$244 = styles$243.get(type);
          resource$244 || (JSCompiler_inline_result = JSCompiler_inline_result.ownerDocument || JSCompiler_inline_result, resource$244 = {
            type: "stylesheet",
            instance: null,
            count: 0,
            state: { loading: 0, preload: null }
          }, styles$243.set(type, resource$244), (styles$243 = JSCompiler_inline_result.querySelector(
            getStylesheetSelectorFromKey(type)
          )) && !styles$243._p && (resource$244.instance = styles$243, resource$244.state.loading = 5), preloadPropsMap.has(type) || (pendingProps = {
            rel: "preload",
            as: "style",
            href: pendingProps.href,
            crossOrigin: pendingProps.crossOrigin,
            integrity: pendingProps.integrity,
            media: pendingProps.media,
            hrefLang: pendingProps.hrefLang,
            referrerPolicy: pendingProps.referrerPolicy
          }, preloadPropsMap.set(type, pendingProps), styles$243 || preloadStylesheet(
            JSCompiler_inline_result,
            type,
            pendingProps,
            resource$244.state
          )));
          if (currentProps && null === currentResource)
            throw Error(formatProdErrorMessage(528, ""));
          return resource$244;
        }
        if (currentProps && null !== currentResource)
          throw Error(formatProdErrorMessage(529, ""));
        return null;
      case "script":
        return currentProps = pendingProps.async, pendingProps = pendingProps.src, "string" === typeof pendingProps && currentProps && "function" !== typeof currentProps && "symbol" !== typeof currentProps ? (currentProps = getScriptKey(pendingProps), pendingProps = getResourcesFromRoot(
          JSCompiler_inline_result
        ).hoistableScripts, currentResource = pendingProps.get(currentProps), currentResource || (currentResource = {
          type: "script",
          instance: null,
          count: 0,
          state: null
        }, pendingProps.set(currentProps, currentResource)), currentResource) : { type: "void", instance: null, count: 0, state: null };
      default:
        throw Error(formatProdErrorMessage(444, type));
    }
  }
  function getStyleKey(href) {
    return 'href="' + escapeSelectorAttributeValueInsideDoubleQuotes(href) + '"';
  }
  function getStylesheetSelectorFromKey(key) {
    return 'link[rel="stylesheet"][' + key + "]";
  }
  function stylesheetPropsFromRawProps(rawProps) {
    return assign({}, rawProps, {
      "data-precedence": rawProps.precedence,
      precedence: null
    });
  }
  function preloadStylesheet(ownerDocument, key, preloadProps, state) {
    ownerDocument.querySelector('link[rel="preload"][as="style"][' + key + "]") ? state.loading = 1 : (key = ownerDocument.createElement("link"), state.preload = key, key.addEventListener("load", function() {
      return state.loading |= 1;
    }), key.addEventListener("error", function() {
      return state.loading |= 2;
    }), setInitialProperties(key, "link", preloadProps), markNodeAsHoistable(key), ownerDocument.head.appendChild(key));
  }
  function getScriptKey(src) {
    return '[src="' + escapeSelectorAttributeValueInsideDoubleQuotes(src) + '"]';
  }
  function getScriptSelectorFromKey(key) {
    return "script[async]" + key;
  }
  function acquireResource(hoistableRoot, resource, props) {
    resource.count++;
    if (null === resource.instance)
      switch (resource.type) {
        case "style":
          var instance = hoistableRoot.querySelector(
            'style[data-href~="' + escapeSelectorAttributeValueInsideDoubleQuotes(props.href) + '"]'
          );
          if (instance)
            return resource.instance = instance, markNodeAsHoistable(instance), instance;
          var styleProps = assign({}, props, {
            "data-href": props.href,
            "data-precedence": props.precedence,
            href: null,
            precedence: null
          });
          instance = (hoistableRoot.ownerDocument || hoistableRoot).createElement(
            "style"
          );
          markNodeAsHoistable(instance);
          setInitialProperties(instance, "style", styleProps);
          insertStylesheet(instance, props.precedence, hoistableRoot);
          return resource.instance = instance;
        case "stylesheet":
          styleProps = getStyleKey(props.href);
          var instance$249 = hoistableRoot.querySelector(
            getStylesheetSelectorFromKey(styleProps)
          );
          if (instance$249)
            return resource.state.loading |= 4, resource.instance = instance$249, markNodeAsHoistable(instance$249), instance$249;
          instance = stylesheetPropsFromRawProps(props);
          (styleProps = preloadPropsMap.get(styleProps)) && adoptPreloadPropsForStylesheet(instance, styleProps);
          instance$249 = (hoistableRoot.ownerDocument || hoistableRoot).createElement("link");
          markNodeAsHoistable(instance$249);
          var linkInstance = instance$249;
          linkInstance._p = new Promise(function(resolve, reject) {
            linkInstance.onload = resolve;
            linkInstance.onerror = reject;
          });
          setInitialProperties(instance$249, "link", instance);
          resource.state.loading |= 4;
          insertStylesheet(instance$249, props.precedence, hoistableRoot);
          return resource.instance = instance$249;
        case "script":
          instance$249 = getScriptKey(props.src);
          if (styleProps = hoistableRoot.querySelector(
            getScriptSelectorFromKey(instance$249)
          ))
            return resource.instance = styleProps, markNodeAsHoistable(styleProps), styleProps;
          instance = props;
          if (styleProps = preloadPropsMap.get(instance$249))
            instance = assign({}, props), adoptPreloadPropsForScript(instance, styleProps);
          hoistableRoot = hoistableRoot.ownerDocument || hoistableRoot;
          styleProps = hoistableRoot.createElement("script");
          markNodeAsHoistable(styleProps);
          setInitialProperties(styleProps, "link", instance);
          hoistableRoot.head.appendChild(styleProps);
          return resource.instance = styleProps;
        case "void":
          return null;
        default:
          throw Error(formatProdErrorMessage(443, resource.type));
      }
    else
      "stylesheet" === resource.type && 0 === (resource.state.loading & 4) && (instance = resource.instance, resource.state.loading |= 4, insertStylesheet(instance, props.precedence, hoistableRoot));
    return resource.instance;
  }
  function insertStylesheet(instance, precedence, root2) {
    for (var nodes = root2.querySelectorAll(
      'link[rel="stylesheet"][data-precedence],style[data-precedence]'
    ), last = nodes.length ? nodes[nodes.length - 1] : null, prior = last, i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      if (node.dataset.precedence === precedence) prior = node;
      else if (prior !== last) break;
    }
    prior ? prior.parentNode.insertBefore(instance, prior.nextSibling) : (precedence = 9 === root2.nodeType ? root2.head : root2, precedence.insertBefore(instance, precedence.firstChild));
  }
  function adoptPreloadPropsForStylesheet(stylesheetProps, preloadProps) {
    null == stylesheetProps.crossOrigin && (stylesheetProps.crossOrigin = preloadProps.crossOrigin);
    null == stylesheetProps.referrerPolicy && (stylesheetProps.referrerPolicy = preloadProps.referrerPolicy);
    null == stylesheetProps.title && (stylesheetProps.title = preloadProps.title);
  }
  function adoptPreloadPropsForScript(scriptProps, preloadProps) {
    null == scriptProps.crossOrigin && (scriptProps.crossOrigin = preloadProps.crossOrigin);
    null == scriptProps.referrerPolicy && (scriptProps.referrerPolicy = preloadProps.referrerPolicy);
    null == scriptProps.integrity && (scriptProps.integrity = preloadProps.integrity);
  }
  var tagCaches = null;
  function getHydratableHoistableCache(type, keyAttribute, ownerDocument) {
    if (null === tagCaches) {
      var cache = /* @__PURE__ */ new Map();
      var caches = tagCaches = /* @__PURE__ */ new Map();
      caches.set(ownerDocument, cache);
    } else
      caches = tagCaches, cache = caches.get(ownerDocument), cache || (cache = /* @__PURE__ */ new Map(), caches.set(ownerDocument, cache));
    if (cache.has(type)) return cache;
    cache.set(type, null);
    ownerDocument = ownerDocument.getElementsByTagName(type);
    for (caches = 0; caches < ownerDocument.length; caches++) {
      var node = ownerDocument[caches];
      if (!(node[internalHoistableMarker] || node[internalInstanceKey] || "link" === type && "stylesheet" === node.getAttribute("rel")) && "http://www.w3.org/2000/svg" !== node.namespaceURI) {
        var nodeKey = node.getAttribute(keyAttribute) || "";
        nodeKey = type + nodeKey;
        var existing = cache.get(nodeKey);
        existing ? existing.push(node) : cache.set(nodeKey, [node]);
      }
    }
    return cache;
  }
  function mountHoistable(hoistableRoot, type, instance) {
    hoistableRoot = hoistableRoot.ownerDocument || hoistableRoot;
    hoistableRoot.head.insertBefore(
      instance,
      "title" === type ? hoistableRoot.querySelector("head > title") : null
    );
  }
  function isHostHoistableType(type, props, hostContext) {
    if (1 === hostContext || null != props.itemProp) return false;
    switch (type) {
      case "meta":
      case "title":
        return true;
      case "style":
        if ("string" !== typeof props.precedence || "string" !== typeof props.href || "" === props.href)
          break;
        return true;
      case "link":
        if ("string" !== typeof props.rel || "string" !== typeof props.href || "" === props.href || props.onLoad || props.onError)
          break;
        switch (props.rel) {
          case "stylesheet":
            return type = props.disabled, "string" === typeof props.precedence && null == type;
          default:
            return true;
        }
      case "script":
        if (props.async && "function" !== typeof props.async && "symbol" !== typeof props.async && !props.onLoad && !props.onError && props.src && "string" === typeof props.src)
          return true;
    }
    return false;
  }
  function preloadResource(resource) {
    return "stylesheet" === resource.type && 0 === (resource.state.loading & 3) ? false : true;
  }
  function suspendResource(state, hoistableRoot, resource, props) {
    if ("stylesheet" === resource.type && ("string" !== typeof props.media || false !== matchMedia(props.media).matches) && 0 === (resource.state.loading & 4)) {
      if (null === resource.instance) {
        var key = getStyleKey(props.href), instance = hoistableRoot.querySelector(
          getStylesheetSelectorFromKey(key)
        );
        if (instance) {
          hoistableRoot = instance._p;
          null !== hoistableRoot && "object" === typeof hoistableRoot && "function" === typeof hoistableRoot.then && (state.count++, state = onUnsuspend.bind(state), hoistableRoot.then(state, state));
          resource.state.loading |= 4;
          resource.instance = instance;
          markNodeAsHoistable(instance);
          return;
        }
        instance = hoistableRoot.ownerDocument || hoistableRoot;
        props = stylesheetPropsFromRawProps(props);
        (key = preloadPropsMap.get(key)) && adoptPreloadPropsForStylesheet(props, key);
        instance = instance.createElement("link");
        markNodeAsHoistable(instance);
        var linkInstance = instance;
        linkInstance._p = new Promise(function(resolve, reject) {
          linkInstance.onload = resolve;
          linkInstance.onerror = reject;
        });
        setInitialProperties(instance, "link", props);
        resource.instance = instance;
      }
      null === state.stylesheets && (state.stylesheets = /* @__PURE__ */ new Map());
      state.stylesheets.set(resource, hoistableRoot);
      (hoistableRoot = resource.state.preload) && 0 === (resource.state.loading & 3) && (state.count++, resource = onUnsuspend.bind(state), hoistableRoot.addEventListener("load", resource), hoistableRoot.addEventListener("error", resource));
    }
  }
  var estimatedBytesWithinLimit = 0;
  function waitForCommitToBeReady(state, timeoutOffset) {
    state.stylesheets && 0 === state.count && insertSuspendedStylesheets(state, state.stylesheets);
    return 0 < state.count || 0 < state.imgCount ? function(commit) {
      var stylesheetTimer = setTimeout(function() {
        state.stylesheets && insertSuspendedStylesheets(state, state.stylesheets);
        if (state.unsuspend) {
          var unsuspend = state.unsuspend;
          state.unsuspend = null;
          unsuspend();
        }
      }, 6e4 + timeoutOffset);
      0 < state.imgBytes && 0 === estimatedBytesWithinLimit && (estimatedBytesWithinLimit = 62500 * estimateBandwidth());
      var imgTimer = setTimeout(
        function() {
          state.waitingForImages = false;
          if (0 === state.count && (state.stylesheets && insertSuspendedStylesheets(state, state.stylesheets), state.unsuspend)) {
            var unsuspend = state.unsuspend;
            state.unsuspend = null;
            unsuspend();
          }
        },
        (state.imgBytes > estimatedBytesWithinLimit ? 50 : 800) + timeoutOffset
      );
      state.unsuspend = commit;
      return function() {
        state.unsuspend = null;
        clearTimeout(stylesheetTimer);
        clearTimeout(imgTimer);
      };
    } : null;
  }
  function onUnsuspend() {
    this.count--;
    if (0 === this.count && (0 === this.imgCount || !this.waitingForImages)) {
      if (this.stylesheets) insertSuspendedStylesheets(this, this.stylesheets);
      else if (this.unsuspend) {
        var unsuspend = this.unsuspend;
        this.unsuspend = null;
        unsuspend();
      }
    }
  }
  var precedencesByRoot = null;
  function insertSuspendedStylesheets(state, resources) {
    state.stylesheets = null;
    null !== state.unsuspend && (state.count++, precedencesByRoot = /* @__PURE__ */ new Map(), resources.forEach(insertStylesheetIntoRoot, state), precedencesByRoot = null, onUnsuspend.call(state));
  }
  function insertStylesheetIntoRoot(root2, resource) {
    if (!(resource.state.loading & 4)) {
      var precedences = precedencesByRoot.get(root2);
      if (precedences) var last = precedences.get(null);
      else {
        precedences = /* @__PURE__ */ new Map();
        precedencesByRoot.set(root2, precedences);
        for (var nodes = root2.querySelectorAll(
          "link[data-precedence],style[data-precedence]"
        ), i = 0; i < nodes.length; i++) {
          var node = nodes[i];
          if ("LINK" === node.nodeName || "not all" !== node.getAttribute("media"))
            precedences.set(node.dataset.precedence, node), last = node;
        }
        last && precedences.set(null, last);
      }
      nodes = resource.instance;
      node = nodes.getAttribute("data-precedence");
      i = precedences.get(node) || last;
      i === last && precedences.set(null, nodes);
      precedences.set(node, nodes);
      this.count++;
      last = onUnsuspend.bind(this);
      nodes.addEventListener("load", last);
      nodes.addEventListener("error", last);
      i ? i.parentNode.insertBefore(nodes, i.nextSibling) : (root2 = 9 === root2.nodeType ? root2.head : root2, root2.insertBefore(nodes, root2.firstChild));
      resource.state.loading |= 4;
    }
  }
  var HostTransitionContext = {
    $$typeof: REACT_CONTEXT_TYPE,
    Provider: null,
    Consumer: null,
    _currentValue: sharedNotPendingObject,
    _currentValue2: sharedNotPendingObject,
    _threadCount: 0
  };
  function FiberRootNode(containerInfo, tag, hydrate, identifierPrefix, onUncaughtError, onCaughtError, onRecoverableError, onDefaultTransitionIndicator, formState) {
    this.tag = 1;
    this.containerInfo = containerInfo;
    this.pingCache = this.current = this.pendingChildren = null;
    this.timeoutHandle = -1;
    this.callbackNode = this.next = this.pendingContext = this.context = this.cancelPendingCommit = null;
    this.callbackPriority = 0;
    this.expirationTimes = createLaneMap(-1);
    this.entangledLanes = this.shellSuspendCounter = this.errorRecoveryDisabledLanes = this.expiredLanes = this.warmLanes = this.pingedLanes = this.suspendedLanes = this.pendingLanes = 0;
    this.entanglements = createLaneMap(0);
    this.hiddenUpdates = createLaneMap(null);
    this.identifierPrefix = identifierPrefix;
    this.onUncaughtError = onUncaughtError;
    this.onCaughtError = onCaughtError;
    this.onRecoverableError = onRecoverableError;
    this.pooledCache = null;
    this.pooledCacheLanes = 0;
    this.formState = formState;
    this.incompleteTransitions = /* @__PURE__ */ new Map();
  }
  function createFiberRoot(containerInfo, tag, hydrate, initialChildren, hydrationCallbacks, isStrictMode, identifierPrefix, formState, onUncaughtError, onCaughtError, onRecoverableError, onDefaultTransitionIndicator) {
    containerInfo = new FiberRootNode(
      containerInfo,
      tag,
      hydrate,
      identifierPrefix,
      onUncaughtError,
      onCaughtError,
      onRecoverableError,
      onDefaultTransitionIndicator,
      formState
    );
    tag = 1;
    true === isStrictMode && (tag |= 24);
    isStrictMode = createFiberImplClass(3, null, null, tag);
    containerInfo.current = isStrictMode;
    isStrictMode.stateNode = containerInfo;
    tag = createCache();
    tag.refCount++;
    containerInfo.pooledCache = tag;
    tag.refCount++;
    isStrictMode.memoizedState = {
      element: initialChildren,
      isDehydrated: hydrate,
      cache: tag
    };
    initializeUpdateQueue(isStrictMode);
    return containerInfo;
  }
  function getContextForSubtree(parentComponent) {
    if (!parentComponent) return emptyContextObject;
    parentComponent = emptyContextObject;
    return parentComponent;
  }
  function updateContainerImpl(rootFiber, lane, element, container, parentComponent, callback) {
    parentComponent = getContextForSubtree(parentComponent);
    null === container.context ? container.context = parentComponent : container.pendingContext = parentComponent;
    container = createUpdate(lane);
    container.payload = { element };
    callback = void 0 === callback ? null : callback;
    null !== callback && (container.callback = callback);
    element = enqueueUpdate(rootFiber, container, lane);
    null !== element && (scheduleUpdateOnFiber(element, rootFiber, lane), entangleTransitions(element, rootFiber, lane));
  }
  function markRetryLaneImpl(fiber, retryLane) {
    fiber = fiber.memoizedState;
    if (null !== fiber && null !== fiber.dehydrated) {
      var a = fiber.retryLane;
      fiber.retryLane = 0 !== a && a < retryLane ? a : retryLane;
    }
  }
  function markRetryLaneIfNotHydrated(fiber, retryLane) {
    markRetryLaneImpl(fiber, retryLane);
    (fiber = fiber.alternate) && markRetryLaneImpl(fiber, retryLane);
  }
  function attemptContinuousHydration(fiber) {
    if (13 === fiber.tag || 31 === fiber.tag) {
      var root2 = enqueueConcurrentRenderForLane(fiber, 67108864);
      null !== root2 && scheduleUpdateOnFiber(root2, fiber, 67108864);
      markRetryLaneIfNotHydrated(fiber, 67108864);
    }
  }
  function attemptHydrationAtCurrentPriority(fiber) {
    if (13 === fiber.tag || 31 === fiber.tag) {
      var lane = requestUpdateLane();
      lane = getBumpedLaneForHydrationByLane(lane);
      var root2 = enqueueConcurrentRenderForLane(fiber, lane);
      null !== root2 && scheduleUpdateOnFiber(root2, fiber, lane);
      markRetryLaneIfNotHydrated(fiber, lane);
    }
  }
  var _enabled = true;
  function dispatchDiscreteEvent(domEventName, eventSystemFlags, container, nativeEvent) {
    var prevTransition = ReactSharedInternals.T;
    ReactSharedInternals.T = null;
    var previousPriority = ReactDOMSharedInternals.p;
    try {
      ReactDOMSharedInternals.p = 2, dispatchEvent(domEventName, eventSystemFlags, container, nativeEvent);
    } finally {
      ReactDOMSharedInternals.p = previousPriority, ReactSharedInternals.T = prevTransition;
    }
  }
  function dispatchContinuousEvent(domEventName, eventSystemFlags, container, nativeEvent) {
    var prevTransition = ReactSharedInternals.T;
    ReactSharedInternals.T = null;
    var previousPriority = ReactDOMSharedInternals.p;
    try {
      ReactDOMSharedInternals.p = 8, dispatchEvent(domEventName, eventSystemFlags, container, nativeEvent);
    } finally {
      ReactDOMSharedInternals.p = previousPriority, ReactSharedInternals.T = prevTransition;
    }
  }
  function dispatchEvent(domEventName, eventSystemFlags, targetContainer, nativeEvent) {
    if (_enabled) {
      var blockedOn = findInstanceBlockingEvent(nativeEvent);
      if (null === blockedOn)
        dispatchEventForPluginEventSystem(
          domEventName,
          eventSystemFlags,
          nativeEvent,
          return_targetInst,
          targetContainer
        ), clearIfContinuousEvent(domEventName, nativeEvent);
      else if (queueIfContinuousEvent(
        blockedOn,
        domEventName,
        eventSystemFlags,
        targetContainer,
        nativeEvent
      ))
        nativeEvent.stopPropagation();
      else if (clearIfContinuousEvent(domEventName, nativeEvent), eventSystemFlags & 4 && -1 < discreteReplayableEvents.indexOf(domEventName)) {
        for (; null !== blockedOn; ) {
          var fiber = getInstanceFromNode(blockedOn);
          if (null !== fiber)
            switch (fiber.tag) {
              case 3:
                fiber = fiber.stateNode;
                if (fiber.current.memoizedState.isDehydrated) {
                  var lanes = getHighestPriorityLanes(fiber.pendingLanes);
                  if (0 !== lanes) {
                    var root2 = fiber;
                    root2.pendingLanes |= 2;
                    for (root2.entangledLanes |= 2; lanes; ) {
                      var lane = 1 << 31 - clz32(lanes);
                      root2.entanglements[1] |= lane;
                      lanes &= ~lane;
                    }
                    ensureRootIsScheduled(fiber);
                    0 === (executionContext & 6) && (workInProgressRootRenderTargetTime = now() + 500, flushSyncWorkAcrossRoots_impl(0));
                  }
                }
                break;
              case 31:
              case 13:
                root2 = enqueueConcurrentRenderForLane(fiber, 2), null !== root2 && scheduleUpdateOnFiber(root2, fiber, 2), flushSyncWork$1(), markRetryLaneIfNotHydrated(fiber, 2);
            }
          fiber = findInstanceBlockingEvent(nativeEvent);
          null === fiber && dispatchEventForPluginEventSystem(
            domEventName,
            eventSystemFlags,
            nativeEvent,
            return_targetInst,
            targetContainer
          );
          if (fiber === blockedOn) break;
          blockedOn = fiber;
        }
        null !== blockedOn && nativeEvent.stopPropagation();
      } else
        dispatchEventForPluginEventSystem(
          domEventName,
          eventSystemFlags,
          nativeEvent,
          null,
          targetContainer
        );
    }
  }
  function findInstanceBlockingEvent(nativeEvent) {
    nativeEvent = getEventTarget(nativeEvent);
    return findInstanceBlockingTarget(nativeEvent);
  }
  var return_targetInst = null;
  function findInstanceBlockingTarget(targetNode) {
    return_targetInst = null;
    targetNode = getClosestInstanceFromNode(targetNode);
    if (null !== targetNode) {
      var nearestMounted = getNearestMountedFiber(targetNode);
      if (null === nearestMounted) targetNode = null;
      else {
        var tag = nearestMounted.tag;
        if (13 === tag) {
          targetNode = getSuspenseInstanceFromFiber(nearestMounted);
          if (null !== targetNode) return targetNode;
          targetNode = null;
        } else if (31 === tag) {
          targetNode = getActivityInstanceFromFiber(nearestMounted);
          if (null !== targetNode) return targetNode;
          targetNode = null;
        } else if (3 === tag) {
          if (nearestMounted.stateNode.current.memoizedState.isDehydrated)
            return 3 === nearestMounted.tag ? nearestMounted.stateNode.containerInfo : null;
          targetNode = null;
        } else nearestMounted !== targetNode && (targetNode = null);
      }
    }
    return_targetInst = targetNode;
    return null;
  }
  function getEventPriority(domEventName) {
    switch (domEventName) {
      case "beforetoggle":
      case "cancel":
      case "click":
      case "close":
      case "contextmenu":
      case "copy":
      case "cut":
      case "auxclick":
      case "dblclick":
      case "dragend":
      case "dragstart":
      case "drop":
      case "focusin":
      case "focusout":
      case "input":
      case "invalid":
      case "keydown":
      case "keypress":
      case "keyup":
      case "mousedown":
      case "mouseup":
      case "paste":
      case "pause":
      case "play":
      case "pointercancel":
      case "pointerdown":
      case "pointerup":
      case "ratechange":
      case "reset":
      case "resize":
      case "seeked":
      case "submit":
      case "toggle":
      case "touchcancel":
      case "touchend":
      case "touchstart":
      case "volumechange":
      case "change":
      case "selectionchange":
      case "textInput":
      case "compositionstart":
      case "compositionend":
      case "compositionupdate":
      case "beforeblur":
      case "afterblur":
      case "beforeinput":
      case "blur":
      case "fullscreenchange":
      case "focus":
      case "hashchange":
      case "popstate":
      case "select":
      case "selectstart":
        return 2;
      case "drag":
      case "dragenter":
      case "dragexit":
      case "dragleave":
      case "dragover":
      case "mousemove":
      case "mouseout":
      case "mouseover":
      case "pointermove":
      case "pointerout":
      case "pointerover":
      case "scroll":
      case "touchmove":
      case "wheel":
      case "mouseenter":
      case "mouseleave":
      case "pointerenter":
      case "pointerleave":
        return 8;
      case "message":
        switch (getCurrentPriorityLevel()) {
          case ImmediatePriority:
            return 2;
          case UserBlockingPriority:
            return 8;
          case NormalPriority$1:
          case LowPriority:
            return 32;
          case IdlePriority:
            return 268435456;
          default:
            return 32;
        }
      default:
        return 32;
    }
  }
  var hasScheduledReplayAttempt = false, queuedFocus = null, queuedDrag = null, queuedMouse = null, queuedPointers = /* @__PURE__ */ new Map(), queuedPointerCaptures = /* @__PURE__ */ new Map(), queuedExplicitHydrationTargets = [], discreteReplayableEvents = "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset".split(
    " "
  );
  function clearIfContinuousEvent(domEventName, nativeEvent) {
    switch (domEventName) {
      case "focusin":
      case "focusout":
        queuedFocus = null;
        break;
      case "dragenter":
      case "dragleave":
        queuedDrag = null;
        break;
      case "mouseover":
      case "mouseout":
        queuedMouse = null;
        break;
      case "pointerover":
      case "pointerout":
        queuedPointers.delete(nativeEvent.pointerId);
        break;
      case "gotpointercapture":
      case "lostpointercapture":
        queuedPointerCaptures.delete(nativeEvent.pointerId);
    }
  }
  function accumulateOrCreateContinuousQueuedReplayableEvent(existingQueuedEvent, blockedOn, domEventName, eventSystemFlags, targetContainer, nativeEvent) {
    if (null === existingQueuedEvent || existingQueuedEvent.nativeEvent !== nativeEvent)
      return existingQueuedEvent = {
        blockedOn,
        domEventName,
        eventSystemFlags,
        nativeEvent,
        targetContainers: [targetContainer]
      }, null !== blockedOn && (blockedOn = getInstanceFromNode(blockedOn), null !== blockedOn && attemptContinuousHydration(blockedOn)), existingQueuedEvent;
    existingQueuedEvent.eventSystemFlags |= eventSystemFlags;
    blockedOn = existingQueuedEvent.targetContainers;
    null !== targetContainer && -1 === blockedOn.indexOf(targetContainer) && blockedOn.push(targetContainer);
    return existingQueuedEvent;
  }
  function queueIfContinuousEvent(blockedOn, domEventName, eventSystemFlags, targetContainer, nativeEvent) {
    switch (domEventName) {
      case "focusin":
        return queuedFocus = accumulateOrCreateContinuousQueuedReplayableEvent(
          queuedFocus,
          blockedOn,
          domEventName,
          eventSystemFlags,
          targetContainer,
          nativeEvent
        ), true;
      case "dragenter":
        return queuedDrag = accumulateOrCreateContinuousQueuedReplayableEvent(
          queuedDrag,
          blockedOn,
          domEventName,
          eventSystemFlags,
          targetContainer,
          nativeEvent
        ), true;
      case "mouseover":
        return queuedMouse = accumulateOrCreateContinuousQueuedReplayableEvent(
          queuedMouse,
          blockedOn,
          domEventName,
          eventSystemFlags,
          targetContainer,
          nativeEvent
        ), true;
      case "pointerover":
        var pointerId = nativeEvent.pointerId;
        queuedPointers.set(
          pointerId,
          accumulateOrCreateContinuousQueuedReplayableEvent(
            queuedPointers.get(pointerId) || null,
            blockedOn,
            domEventName,
            eventSystemFlags,
            targetContainer,
            nativeEvent
          )
        );
        return true;
      case "gotpointercapture":
        return pointerId = nativeEvent.pointerId, queuedPointerCaptures.set(
          pointerId,
          accumulateOrCreateContinuousQueuedReplayableEvent(
            queuedPointerCaptures.get(pointerId) || null,
            blockedOn,
            domEventName,
            eventSystemFlags,
            targetContainer,
            nativeEvent
          )
        ), true;
    }
    return false;
  }
  function attemptExplicitHydrationTarget(queuedTarget) {
    var targetInst = getClosestInstanceFromNode(queuedTarget.target);
    if (null !== targetInst) {
      var nearestMounted = getNearestMountedFiber(targetInst);
      if (null !== nearestMounted) {
        if (targetInst = nearestMounted.tag, 13 === targetInst) {
          if (targetInst = getSuspenseInstanceFromFiber(nearestMounted), null !== targetInst) {
            queuedTarget.blockedOn = targetInst;
            runWithPriority(queuedTarget.priority, function() {
              attemptHydrationAtCurrentPriority(nearestMounted);
            });
            return;
          }
        } else if (31 === targetInst) {
          if (targetInst = getActivityInstanceFromFiber(nearestMounted), null !== targetInst) {
            queuedTarget.blockedOn = targetInst;
            runWithPriority(queuedTarget.priority, function() {
              attemptHydrationAtCurrentPriority(nearestMounted);
            });
            return;
          }
        } else if (3 === targetInst && nearestMounted.stateNode.current.memoizedState.isDehydrated) {
          queuedTarget.blockedOn = 3 === nearestMounted.tag ? nearestMounted.stateNode.containerInfo : null;
          return;
        }
      }
    }
    queuedTarget.blockedOn = null;
  }
  function attemptReplayContinuousQueuedEvent(queuedEvent) {
    if (null !== queuedEvent.blockedOn) return false;
    for (var targetContainers = queuedEvent.targetContainers; 0 < targetContainers.length; ) {
      var nextBlockedOn = findInstanceBlockingEvent(queuedEvent.nativeEvent);
      if (null === nextBlockedOn) {
        nextBlockedOn = queuedEvent.nativeEvent;
        var nativeEventClone = new nextBlockedOn.constructor(
          nextBlockedOn.type,
          nextBlockedOn
        );
        currentReplayingEvent = nativeEventClone;
        nextBlockedOn.target.dispatchEvent(nativeEventClone);
        currentReplayingEvent = null;
      } else
        return targetContainers = getInstanceFromNode(nextBlockedOn), null !== targetContainers && attemptContinuousHydration(targetContainers), queuedEvent.blockedOn = nextBlockedOn, false;
      targetContainers.shift();
    }
    return true;
  }
  function attemptReplayContinuousQueuedEventInMap(queuedEvent, key, map) {
    attemptReplayContinuousQueuedEvent(queuedEvent) && map.delete(key);
  }
  function replayUnblockedEvents() {
    hasScheduledReplayAttempt = false;
    null !== queuedFocus && attemptReplayContinuousQueuedEvent(queuedFocus) && (queuedFocus = null);
    null !== queuedDrag && attemptReplayContinuousQueuedEvent(queuedDrag) && (queuedDrag = null);
    null !== queuedMouse && attemptReplayContinuousQueuedEvent(queuedMouse) && (queuedMouse = null);
    queuedPointers.forEach(attemptReplayContinuousQueuedEventInMap);
    queuedPointerCaptures.forEach(attemptReplayContinuousQueuedEventInMap);
  }
  function scheduleCallbackIfUnblocked(queuedEvent, unblocked) {
    queuedEvent.blockedOn === unblocked && (queuedEvent.blockedOn = null, hasScheduledReplayAttempt || (hasScheduledReplayAttempt = true, Scheduler.unstable_scheduleCallback(
      Scheduler.unstable_NormalPriority,
      replayUnblockedEvents
    )));
  }
  var lastScheduledReplayQueue = null;
  function scheduleReplayQueueIfNeeded(formReplayingQueue) {
    lastScheduledReplayQueue !== formReplayingQueue && (lastScheduledReplayQueue = formReplayingQueue, Scheduler.unstable_scheduleCallback(
      Scheduler.unstable_NormalPriority,
      function() {
        lastScheduledReplayQueue === formReplayingQueue && (lastScheduledReplayQueue = null);
        for (var i = 0; i < formReplayingQueue.length; i += 3) {
          var form = formReplayingQueue[i], submitterOrAction = formReplayingQueue[i + 1], formData = formReplayingQueue[i + 2];
          if ("function" !== typeof submitterOrAction)
            if (null === findInstanceBlockingTarget(submitterOrAction || form))
              continue;
            else break;
          var formInst = getInstanceFromNode(form);
          null !== formInst && (formReplayingQueue.splice(i, 3), i -= 3, startHostTransition(
            formInst,
            {
              pending: true,
              data: formData,
              method: form.method,
              action: submitterOrAction
            },
            submitterOrAction,
            formData
          ));
        }
      }
    ));
  }
  function retryIfBlockedOn(unblocked) {
    function unblock(queuedEvent) {
      return scheduleCallbackIfUnblocked(queuedEvent, unblocked);
    }
    null !== queuedFocus && scheduleCallbackIfUnblocked(queuedFocus, unblocked);
    null !== queuedDrag && scheduleCallbackIfUnblocked(queuedDrag, unblocked);
    null !== queuedMouse && scheduleCallbackIfUnblocked(queuedMouse, unblocked);
    queuedPointers.forEach(unblock);
    queuedPointerCaptures.forEach(unblock);
    for (var i = 0; i < queuedExplicitHydrationTargets.length; i++) {
      var queuedTarget = queuedExplicitHydrationTargets[i];
      queuedTarget.blockedOn === unblocked && (queuedTarget.blockedOn = null);
    }
    for (; 0 < queuedExplicitHydrationTargets.length && (i = queuedExplicitHydrationTargets[0], null === i.blockedOn); )
      attemptExplicitHydrationTarget(i), null === i.blockedOn && queuedExplicitHydrationTargets.shift();
    i = (unblocked.ownerDocument || unblocked).$$reactFormReplay;
    if (null != i)
      for (queuedTarget = 0; queuedTarget < i.length; queuedTarget += 3) {
        var form = i[queuedTarget], submitterOrAction = i[queuedTarget + 1], formProps = form[internalPropsKey] || null;
        if ("function" === typeof submitterOrAction)
          formProps || scheduleReplayQueueIfNeeded(i);
        else if (formProps) {
          var action = null;
          if (submitterOrAction && submitterOrAction.hasAttribute("formAction"))
            if (form = submitterOrAction, formProps = submitterOrAction[internalPropsKey] || null)
              action = formProps.formAction;
            else {
              if (null !== findInstanceBlockingTarget(form)) continue;
            }
          else action = formProps.action;
          "function" === typeof action ? i[queuedTarget + 1] = action : (i.splice(queuedTarget, 3), queuedTarget -= 3);
          scheduleReplayQueueIfNeeded(i);
        }
      }
  }
  function defaultOnDefaultTransitionIndicator() {
    function handleNavigate(event) {
      event.canIntercept && "react-transition" === event.info && event.intercept({
        handler: function() {
          return new Promise(function(resolve) {
            return pendingResolve = resolve;
          });
        },
        focusReset: "manual",
        scroll: "manual"
      });
    }
    function handleNavigateComplete() {
      null !== pendingResolve && (pendingResolve(), pendingResolve = null);
      isCancelled || setTimeout(startFakeNavigation, 20);
    }
    function startFakeNavigation() {
      if (!isCancelled && !navigation.transition) {
        var currentEntry = navigation.currentEntry;
        currentEntry && null != currentEntry.url && navigation.navigate(currentEntry.url, {
          state: currentEntry.getState(),
          info: "react-transition",
          history: "replace"
        });
      }
    }
    if ("object" === typeof navigation) {
      var isCancelled = false, pendingResolve = null;
      navigation.addEventListener("navigate", handleNavigate);
      navigation.addEventListener("navigatesuccess", handleNavigateComplete);
      navigation.addEventListener("navigateerror", handleNavigateComplete);
      setTimeout(startFakeNavigation, 100);
      return function() {
        isCancelled = true;
        navigation.removeEventListener("navigate", handleNavigate);
        navigation.removeEventListener("navigatesuccess", handleNavigateComplete);
        navigation.removeEventListener("navigateerror", handleNavigateComplete);
        null !== pendingResolve && (pendingResolve(), pendingResolve = null);
      };
    }
  }
  function ReactDOMRoot(internalRoot) {
    this._internalRoot = internalRoot;
  }
  ReactDOMHydrationRoot.prototype.render = ReactDOMRoot.prototype.render = function(children) {
    var root2 = this._internalRoot;
    if (null === root2) throw Error(formatProdErrorMessage(409));
    var current = root2.current, lane = requestUpdateLane();
    updateContainerImpl(current, lane, children, root2, null, null);
  };
  ReactDOMHydrationRoot.prototype.unmount = ReactDOMRoot.prototype.unmount = function() {
    var root2 = this._internalRoot;
    if (null !== root2) {
      this._internalRoot = null;
      var container = root2.containerInfo;
      updateContainerImpl(root2.current, 2, null, root2, null, null);
      flushSyncWork$1();
      container[internalContainerInstanceKey] = null;
    }
  };
  function ReactDOMHydrationRoot(internalRoot) {
    this._internalRoot = internalRoot;
  }
  ReactDOMHydrationRoot.prototype.unstable_scheduleHydration = function(target) {
    if (target) {
      var updatePriority = resolveUpdatePriority();
      target = { blockedOn: null, target, priority: updatePriority };
      for (var i = 0; i < queuedExplicitHydrationTargets.length && 0 !== updatePriority && updatePriority < queuedExplicitHydrationTargets[i].priority; i++) ;
      queuedExplicitHydrationTargets.splice(i, 0, target);
      0 === i && attemptExplicitHydrationTarget(target);
    }
  };
  var isomorphicReactPackageVersion$jscomp$inline_1840 = React2.version;
  if ("19.2.6" !== isomorphicReactPackageVersion$jscomp$inline_1840)
    throw Error(
      formatProdErrorMessage(
        527,
        isomorphicReactPackageVersion$jscomp$inline_1840,
        "19.2.6"
      )
    );
  ReactDOMSharedInternals.findDOMNode = function(componentOrElement) {
    var fiber = componentOrElement._reactInternals;
    if (void 0 === fiber) {
      if ("function" === typeof componentOrElement.render)
        throw Error(formatProdErrorMessage(188));
      componentOrElement = Object.keys(componentOrElement).join(",");
      throw Error(formatProdErrorMessage(268, componentOrElement));
    }
    componentOrElement = findCurrentFiberUsingSlowPath(fiber);
    componentOrElement = null !== componentOrElement ? findCurrentHostFiberImpl(componentOrElement) : null;
    componentOrElement = null === componentOrElement ? null : componentOrElement.stateNode;
    return componentOrElement;
  };
  var internals$jscomp$inline_2347 = {
    bundleType: 0,
    version: "19.2.6",
    rendererPackageName: "react-dom",
    currentDispatcherRef: ReactSharedInternals,
    reconcilerVersion: "19.2.6"
  };
  if ("undefined" !== typeof __REACT_DEVTOOLS_GLOBAL_HOOK__) {
    var hook$jscomp$inline_2348 = __REACT_DEVTOOLS_GLOBAL_HOOK__;
    if (!hook$jscomp$inline_2348.isDisabled && hook$jscomp$inline_2348.supportsFiber)
      try {
        rendererID = hook$jscomp$inline_2348.inject(
          internals$jscomp$inline_2347
        ), injectedHook = hook$jscomp$inline_2348;
      } catch (err) {
      }
  }
  reactDomClient_production.createRoot = function(container, options2) {
    if (!isValidContainer(container)) throw Error(formatProdErrorMessage(299));
    var isStrictMode = false, identifierPrefix = "", onUncaughtError = defaultOnUncaughtError, onCaughtError = defaultOnCaughtError, onRecoverableError = defaultOnRecoverableError;
    null !== options2 && void 0 !== options2 && (true === options2.unstable_strictMode && (isStrictMode = true), void 0 !== options2.identifierPrefix && (identifierPrefix = options2.identifierPrefix), void 0 !== options2.onUncaughtError && (onUncaughtError = options2.onUncaughtError), void 0 !== options2.onCaughtError && (onCaughtError = options2.onCaughtError), void 0 !== options2.onRecoverableError && (onRecoverableError = options2.onRecoverableError));
    options2 = createFiberRoot(
      container,
      1,
      false,
      null,
      null,
      isStrictMode,
      identifierPrefix,
      null,
      onUncaughtError,
      onCaughtError,
      onRecoverableError,
      defaultOnDefaultTransitionIndicator
    );
    container[internalContainerInstanceKey] = options2.current;
    listenToAllSupportedEvents(container);
    return new ReactDOMRoot(options2);
  };
  reactDomClient_production.hydrateRoot = function(container, initialChildren, options2) {
    if (!isValidContainer(container)) throw Error(formatProdErrorMessage(299));
    var isStrictMode = false, identifierPrefix = "", onUncaughtError = defaultOnUncaughtError, onCaughtError = defaultOnCaughtError, onRecoverableError = defaultOnRecoverableError, formState = null;
    null !== options2 && void 0 !== options2 && (true === options2.unstable_strictMode && (isStrictMode = true), void 0 !== options2.identifierPrefix && (identifierPrefix = options2.identifierPrefix), void 0 !== options2.onUncaughtError && (onUncaughtError = options2.onUncaughtError), void 0 !== options2.onCaughtError && (onCaughtError = options2.onCaughtError), void 0 !== options2.onRecoverableError && (onRecoverableError = options2.onRecoverableError), void 0 !== options2.formState && (formState = options2.formState));
    initialChildren = createFiberRoot(
      container,
      1,
      true,
      initialChildren,
      null != options2 ? options2 : null,
      isStrictMode,
      identifierPrefix,
      formState,
      onUncaughtError,
      onCaughtError,
      onRecoverableError,
      defaultOnDefaultTransitionIndicator
    );
    initialChildren.context = getContextForSubtree(null);
    options2 = initialChildren.current;
    isStrictMode = requestUpdateLane();
    isStrictMode = getBumpedLaneForHydrationByLane(isStrictMode);
    identifierPrefix = createUpdate(isStrictMode);
    identifierPrefix.callback = null;
    enqueueUpdate(options2, identifierPrefix, isStrictMode);
    options2 = isStrictMode;
    initialChildren.current.lanes = options2;
    markRootUpdated$1(initialChildren, options2);
    ensureRootIsScheduled(initialChildren);
    container[internalContainerInstanceKey] = initialChildren.current;
    listenToAllSupportedEvents(container);
    return new ReactDOMHydrationRoot(initialChildren);
  };
  reactDomClient_production.version = "19.2.6";
  return reactDomClient_production;
}
var hasRequiredClient;
function requireClient() {
  if (hasRequiredClient) return client.exports;
  hasRequiredClient = 1;
  function checkDCE() {
    if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ === "undefined" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE !== "function") {
      return;
    }
    try {
      __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(checkDCE);
    } catch (err) {
      console.error(err);
    }
  }
  {
    checkDCE();
    client.exports = requireReactDomClient_production();
  }
  return client.exports;
}
var clientExports = requireClient();
const scriptRel = "modulepreload";
const assetsURL = function(dep) {
  return "/" + dep;
};
const seen = {};
const __vitePreload = function preload(baseModule, deps, importerUrl) {
  let promise = Promise.resolve();
  if (deps && deps.length > 0) {
    let allSettled2 = function(promises) {
      return Promise.all(
        promises.map(
          (p) => Promise.resolve(p).then(
            (value) => ({ status: "fulfilled", value }),
            (reason) => ({ status: "rejected", reason })
          )
        )
      );
    };
    document.getElementsByTagName("link");
    const cspNonceMeta = document.querySelector(
      "meta[property=csp-nonce]"
    );
    const cspNonce = (cspNonceMeta == null ? void 0 : cspNonceMeta.nonce) || (cspNonceMeta == null ? void 0 : cspNonceMeta.getAttribute("nonce"));
    promise = allSettled2(
      deps.map((dep) => {
        dep = assetsURL(dep);
        if (dep in seen) return;
        seen[dep] = true;
        const isCss = dep.endsWith(".css");
        const cssSelector = isCss ? '[rel="stylesheet"]' : "";
        if (document.querySelector(`link[href="${dep}"]${cssSelector}`)) {
          return;
        }
        const link = document.createElement("link");
        link.rel = isCss ? "stylesheet" : scriptRel;
        if (!isCss) {
          link.as = "script";
        }
        link.crossOrigin = "";
        link.href = dep;
        if (cspNonce) {
          link.setAttribute("nonce", cspNonce);
        }
        document.head.appendChild(link);
        if (isCss) {
          return new Promise((res, rej) => {
            link.addEventListener("load", res);
            link.addEventListener(
              "error",
              () => rej(new Error(`Unable to preload CSS for ${dep}`))
            );
          });
        }
      })
    );
  }
  function handlePreloadError(err) {
    const e = new Event("vite:preloadError", {
      cancelable: true
    });
    e.payload = err;
    window.dispatchEvent(e);
    if (!e.defaultPrevented) {
      throw err;
    }
  }
  return promise.then((res) => {
    for (const item of res || []) {
      if (item.status !== "rejected") continue;
      handlePreloadError(item.reason);
    }
    return baseModule().catch(handlePreloadError);
  });
};
var reactExports$1 = requireReact$1();
const React = /* @__PURE__ */ getDefaultExportFromCjs(reactExports$1);
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const toKebabCase = (string) => string.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
const toCamelCase = (string) => string.replace(
  /^([A-Z])|[\s-_]+(\w)/g,
  (match, p1, p2) => p2 ? p2.toUpperCase() : p1.toLowerCase()
);
const toPascalCase = (string) => {
  const camelCase = toCamelCase(string);
  return camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
};
const mergeClasses = (...classes) => classes.filter((className, index, array) => {
  return Boolean(className) && className.trim() !== "" && array.indexOf(className) === index;
}).join(" ").trim();
const hasA11yProp = (props) => {
  for (const prop in props) {
    if (prop.startsWith("aria-") || prop === "role" || prop === "title") {
      return true;
    }
  }
};
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
var defaultAttributes = {
  xmlns: "http://www.w3.org/2000/svg",
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round"
};
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Icon = reactExports$1.forwardRef(
  ({
    color = "currentColor",
    size = 24,
    strokeWidth = 2,
    absoluteStrokeWidth,
    className = "",
    children,
    iconNode,
    ...rest
  }, ref) => reactExports$1.createElement(
    "svg",
    {
      ref,
      ...defaultAttributes,
      width: size,
      height: size,
      stroke: color,
      strokeWidth: absoluteStrokeWidth ? Number(strokeWidth) * 24 / Number(size) : strokeWidth,
      className: mergeClasses("lucide", className),
      ...!children && !hasA11yProp(rest) && { "aria-hidden": "true" },
      ...rest
    },
    [
      ...iconNode.map(([tag, attrs]) => reactExports$1.createElement(tag, attrs)),
      ...Array.isArray(children) ? children : [children]
    ]
  )
);
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const createLucideIcon = (iconName, iconNode) => {
  const Component = reactExports$1.forwardRef(
    ({ className, ...props }, ref) => reactExports$1.createElement(Icon, {
      ref,
      iconNode,
      className: mergeClasses(
        `lucide-${toKebabCase(toPascalCase(iconName))}`,
        `lucide-${iconName}`,
        className
      ),
      ...props
    })
  );
  Component.displayName = toPascalCase(iconName);
  return Component;
};
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$z = [
  [
    "path",
    {
      d: "M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2",
      key: "169zse"
    }
  ]
];
const Activity = createLucideIcon("activity", __iconNode$z);
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$y = [
  ["path", { d: "m12 19-7-7 7-7", key: "1l729n" }],
  ["path", { d: "M19 12H5", key: "x3x0zl" }]
];
const ArrowLeft = createLucideIcon("arrow-left", __iconNode$y);
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$x = [["path", { d: "m6 9 6 6 6-6", key: "qrunsl" }]];
const ChevronDown = createLucideIcon("chevron-down", __iconNode$x);
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$w = [["path", { d: "m9 18 6-6-6-6", key: "mthhwq" }]];
const ChevronRight = createLucideIcon("chevron-right", __iconNode$w);
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$v = [["path", { d: "m18 15-6-6-6 6", key: "153udz" }]];
const ChevronUp = createLucideIcon("chevron-up", __iconNode$v);
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$u = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["circle", { cx: "12", cy: "12", r: "1", key: "41hilf" }]
];
const CircleDot = createLucideIcon("circle-dot", __iconNode$u);
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$t = [
  ["path", { d: "M12 6v6l4 2", key: "mmk7yg" }],
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }]
];
const Clock = createLucideIcon("clock", __iconNode$t);
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$s = [
  ["path", { d: "M11 10.27 7 3.34", key: "16pf9h" }],
  ["path", { d: "m11 13.73-4 6.93", key: "794ttg" }],
  ["path", { d: "M12 22v-2", key: "1osdcq" }],
  ["path", { d: "M12 2v2", key: "tus03m" }],
  ["path", { d: "M14 12h8", key: "4f43i9" }],
  ["path", { d: "m17 20.66-1-1.73", key: "eq3orb" }],
  ["path", { d: "m17 3.34-1 1.73", key: "2wel8s" }],
  ["path", { d: "M2 12h2", key: "1t8f8n" }],
  ["path", { d: "m20.66 17-1.73-1", key: "sg0v6f" }],
  ["path", { d: "m20.66 7-1.73 1", key: "1ow05n" }],
  ["path", { d: "m3.34 17 1.73-1", key: "nuk764" }],
  ["path", { d: "m3.34 7 1.73 1", key: "1ulond" }],
  ["circle", { cx: "12", cy: "12", r: "2", key: "1c9p78" }],
  ["circle", { cx: "12", cy: "12", r: "8", key: "46899m" }]
];
const Cog = createLucideIcon("cog", __iconNode$s);
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$r = [
  [
    "path",
    {
      d: "m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z",
      key: "9ktpf1"
    }
  ],
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }]
];
const Compass = createLucideIcon("compass", __iconNode$r);
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$q = [
  ["rect", { width: "14", height: "14", x: "8", y: "8", rx: "2", ry: "2", key: "17jyea" }],
  ["path", { d: "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2", key: "zix9uf" }]
];
const Copy = createLucideIcon("copy", __iconNode$q);
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$p = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["line", { x1: "22", x2: "18", y1: "12", y2: "12", key: "l9bcsi" }],
  ["line", { x1: "6", x2: "2", y1: "12", y2: "12", key: "13hhkx" }],
  ["line", { x1: "12", x2: "12", y1: "6", y2: "2", key: "10w3f3" }],
  ["line", { x1: "12", x2: "12", y1: "22", y2: "18", key: "15g9kq" }]
];
const Crosshair = createLucideIcon("crosshair", __iconNode$p);
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$o = [
  ["ellipse", { cx: "12", cy: "5", rx: "9", ry: "3", key: "msslwz" }],
  ["path", { d: "M3 5V19A9 3 0 0 0 21 19V5", key: "1wlel7" }],
  ["path", { d: "M3 12A9 3 0 0 0 21 12", key: "mv7ke4" }]
];
const Database = createLucideIcon("database", __iconNode$o);
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$n = [
  ["path", { d: "M12 15V3", key: "m9g1x1" }],
  ["path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4", key: "ih7n3h" }],
  ["path", { d: "m7 10 5 5 5-5", key: "brsn70" }]
];
const Download = createLucideIcon("download", __iconNode$n);
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$m = [
  ["path", { d: "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z", key: "1rqfz7" }],
  ["path", { d: "M14 2v4a2 2 0 0 0 2 2h4", key: "tnqrlb" }],
  [
    "path",
    { d: "M10 12a1 1 0 0 0-1 1v1a1 1 0 0 1-1 1 1 1 0 0 1 1 1v1a1 1 0 0 0 1 1", key: "1oajmo" }
  ],
  [
    "path",
    { d: "M14 18a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1 1 1 0 0 1-1-1v-1a1 1 0 0 0-1-1", key: "mpwhp6" }
  ]
];
const FileJson = createLucideIcon("file-json", __iconNode$m);
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$l = [
  ["path", { d: "m12 14 4-4", key: "9kzdfg" }],
  ["path", { d: "M3.34 19a10 10 0 1 1 17.32 0", key: "19p75a" }]
];
const Gauge = createLucideIcon("gauge", __iconNode$l);
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$k = [
  ["rect", { width: "7", height: "9", x: "3", y: "3", rx: "1", key: "10lvy0" }],
  ["rect", { width: "7", height: "5", x: "14", y: "3", rx: "1", key: "16une8" }],
  ["rect", { width: "7", height: "9", x: "14", y: "12", rx: "1", key: "1hutg5" }],
  ["rect", { width: "7", height: "5", x: "3", y: "16", rx: "1", key: "ldoo1y" }]
];
const LayoutDashboard = createLucideIcon("layout-dashboard", __iconNode$k);
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$j = [
  ["rect", { width: "7", height: "18", x: "3", y: "3", rx: "1", key: "2obqm" }],
  ["rect", { width: "7", height: "7", x: "14", y: "3", rx: "1", key: "6d4xhi" }],
  ["rect", { width: "7", height: "7", x: "14", y: "14", rx: "1", key: "nxv5o0" }]
];
const LayoutPanelLeft = createLucideIcon("layout-panel-left", __iconNode$j);
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$i = [
  ["rect", { width: "18", height: "7", x: "3", y: "3", rx: "1", key: "f1a2em" }],
  ["rect", { width: "7", height: "7", x: "3", y: "14", rx: "1", key: "1bb6yr" }],
  ["rect", { width: "7", height: "7", x: "14", y: "14", rx: "1", key: "nxv5o0" }]
];
const LayoutPanelTop = createLucideIcon("layout-panel-top", __iconNode$i);
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$h = [
  ["rect", { width: "20", height: "14", x: "2", y: "3", rx: "2", key: "48i651" }],
  ["line", { x1: "8", x2: "16", y1: "21", y2: "21", key: "1svkeh" }],
  ["line", { x1: "12", x2: "12", y1: "17", y2: "21", key: "vw1qmm" }]
];
const Monitor = createLucideIcon("monitor", __iconNode$h);
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$g = [["path", { d: "m8 3 4 8 5-5 5 15H2L8 3z", key: "otkl63" }]];
const Mountain = createLucideIcon("mountain", __iconNode$g);
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$f = [
  ["polygon", { points: "3 11 22 2 13 21 11 13 3 11", key: "1ltx0t" }]
];
const Navigation = createLucideIcon("navigation", __iconNode$f);
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$e = [
  ["rect", { x: "14", y: "3", width: "5", height: "18", rx: "1", key: "kaeet6" }],
  ["rect", { x: "5", y: "3", width: "5", height: "18", rx: "1", key: "1wsw3u" }]
];
const Pause = createLucideIcon("pause", __iconNode$e);
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$d = [
  [
    "path",
    {
      d: "M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z",
      key: "1v9wt8"
    }
  ]
];
const Plane = createLucideIcon("plane", __iconNode$d);
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$c = [
  [
    "path",
    {
      d: "M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z",
      key: "10ikf1"
    }
  ]
];
const Play = createLucideIcon("play", __iconNode$c);
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$b = [
  ["path", { d: "M12 22v-5", key: "1ega77" }],
  ["path", { d: "M9 8V2", key: "14iosj" }],
  ["path", { d: "M15 8V2", key: "18g5xt" }],
  ["path", { d: "M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8Z", key: "osxo6l" }]
];
const Plug = createLucideIcon("plug", __iconNode$b);
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$a = [
  ["path", { d: "M16.247 7.761a6 6 0 0 1 0 8.478", key: "1fwjs5" }],
  ["path", { d: "M19.075 4.933a10 10 0 0 1 0 14.134", key: "ehdyv1" }],
  ["path", { d: "M4.925 19.067a10 10 0 0 1 0-14.134", key: "1q22gi" }],
  ["path", { d: "M7.753 16.239a6 6 0 0 1 0-8.478", key: "r2q7qm" }],
  ["circle", { cx: "12", cy: "12", r: "2", key: "1c9p78" }]
];
const Radio = createLucideIcon("radio", __iconNode$a);
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$9 = [
  [
    "path",
    {
      d: "M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z",
      key: "1c8476"
    }
  ],
  ["path", { d: "M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7", key: "1ydtos" }],
  ["path", { d: "M7 3v4a1 1 0 0 0 1 1h7", key: "t51u73" }]
];
const Save = createLucideIcon("save", __iconNode$9);
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$8 = [
  [
    "path",
    {
      d: "M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915",
      key: "1i5ecw"
    }
  ],
  ["circle", { cx: "12", cy: "12", r: "3", key: "1v7zrd" }]
];
const Settings = createLucideIcon("settings", __iconNode$8);
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$7 = [
  ["path", { d: "M12 19h8", key: "baeox8" }],
  ["path", { d: "m4 17 6-6-6-6", key: "1yngyt" }]
];
const Terminal = createLucideIcon("terminal", __iconNode$7);
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$6 = [
  ["path", { d: "M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z", key: "17jzev" }]
];
const Thermometer = createLucideIcon("thermometer", __iconNode$6);
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$5 = [
  ["path", { d: "M10 11v6", key: "nco0om" }],
  ["path", { d: "M14 11v6", key: "outv1u" }],
  ["path", { d: "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6", key: "miytrc" }],
  ["path", { d: "M3 6h18", key: "d0wm0j" }],
  ["path", { d: "M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2", key: "e791ji" }]
];
const Trash2 = createLucideIcon("trash-2", __iconNode$5);
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$4 = [
  ["path", { d: "M16 7h6v6", key: "box55l" }],
  ["path", { d: "m22 7-8.5 8.5-5-5L2 17", key: "1t1m79" }]
];
const TrendingUp = createLucideIcon("trending-up", __iconNode$4);
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$3 = [
  ["path", { d: "M12 3v12", key: "1x0j5s" }],
  ["path", { d: "m17 8-5-5-5 5", key: "7q97r8" }],
  ["path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4", key: "ih7n3h" }]
];
const Upload = createLucideIcon("upload", __iconNode$3);
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$2 = [
  ["path", { d: "M12 20h.01", key: "zekei9" }],
  ["path", { d: "M8.5 16.429a5 5 0 0 1 7 0", key: "1bycff" }],
  ["path", { d: "M5 12.859a10 10 0 0 1 5.17-2.69", key: "1dl1wf" }],
  ["path", { d: "M19 12.859a10 10 0 0 0-2.007-1.523", key: "4k23kn" }],
  ["path", { d: "M2 8.82a15 15 0 0 1 4.177-2.643", key: "1grhjp" }],
  ["path", { d: "M22 8.82a15 15 0 0 0-11.288-3.764", key: "z3jwby" }],
  ["path", { d: "m2 2 20 20", key: "1ooewy" }]
];
const WifiOff = createLucideIcon("wifi-off", __iconNode$2);
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [
  ["path", { d: "M12.8 19.6A2 2 0 1 0 14 16H2", key: "148xed" }],
  ["path", { d: "M17.5 8a2.5 2.5 0 1 1 2 4H2", key: "1u4tom" }],
  ["path", { d: "M9.8 4.4A2 2 0 1 1 11 8H2", key: "75valh" }]
];
const Wind = createLucideIcon("wind", __iconNode$1);
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  [
    "path",
    {
      d: "M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z",
      key: "1xq2db"
    }
  ]
];
const Zap = createLucideIcon("zap", __iconNode);
const sampleFrame = {
  "schema": "telemetry-frame.v1",
  "seq": 207132,
  "timeMs": 0,
  "replayTimeMs": 0,
  "receivedAt": "2026-05-18T08:07:17.214Z",
  "source": "tnparser-udp-14443",
  "PitchAngle": 4.286693572998047,
  "RollAngle": 0.17028671503067017,
  "MagneticHeading": -138.70814514160156,
  "CAS": 207.8125,
  "AoA": 4.6,
  "dec_RadioAltFt": 5120,
  "dec_BaroAltFt": 12e3,
  "BaroAltitude": 12e3,
  "Vy": -53,
  "NormalG": -0.00650033401325345,
  "dec_G": null,
  "DME_Distance": 49.296875,
  "HeadingSelect": null,
  "SpeedSelect": 200,
  "StandardAltitude": 2e4,
  "VerticalSpeedSelect": null,
  "FlightDirectorOn": null,
  "FD_PitchCmd": null,
  "FD_RollCmd": null
};
const sampleFrames = Array.from({ length: 300 }).map((_, i) => {
  const t = i / 300 * Math.PI * 2;
  return {
    ...sampleFrame,
    seq: sampleFrame.seq + i,
    timeMs: i * 33,
    replayTimeMs: i * 33,
    PitchAngle: 4.28 + Math.sin(t) * 10,
    RollAngle: Math.sin(t * 2) * 30,
    CAS: 207 + Math.sin(t) * 20,
    AoA: 4.6 + Math.cos(t) * 2,
    dec_BaroAltFt: 12e3 + Math.sin(t) * 500,
    Vy: Math.cos(t) * 3e3,
    dec_RadioAltFt: 5120 + Math.sin(t) * 500
  };
});
const FIELD_CATALOG = [
  // ══════════════════════════════════════════════════════════════════
  //  АВИОНИКА — основные параметры
  // ══════════════════════════════════════════════════════════════════
  {
    key: "RadioAltitude",
    param: "0164",
    comment: "Радиовысота",
    dataType: "Float",
    group: "АВИОНИКА"
  },
  {
    key: "DME_Distance",
    param: "0202",
    comment: "Дальность DME",
    dataType: "Float",
    group: "АВИОНИКА"
  },
  {
    key: "MagneticHeading",
    param: "0320",
    comment: "Магнитный курс",
    dataType: "Float",
    group: "АВИОНИКА"
  },
  {
    key: "RollAngle",
    param: "0325",
    comment: "Угол крена",
    dataType: "Float",
    group: "АВИОНИКА"
  },
  {
    key: "PitchAngle",
    param: "0324",
    comment: "Угол тангажа",
    dataType: "Float",
    group: "АВИОНИКА"
  },
  {
    key: "NormalG",
    param: "0333",
    comment: "Ny — нормальная перегрузка",
    dataType: "Float",
    group: "АВИОНИКА"
  },
  // ══════════════════════════════════════════════════════════════════
  //  ДВИГАТЕЛИ
  // ══════════════════════════════════════════════════════════════════
  {
    key: "Engine_N1_Left",
    param: "0346",
    comment: "Обороты левого МСУ",
    dataType: "Float",
    group: "ДВИГАТЕЛИ"
  },
  {
    key: "Engine_N1_Target_Left",
    param: "0341",
    comment: "Целевые обороты левого МСУ",
    dataType: "Float",
    group: "ДВИГАТЕЛИ"
  },
  {
    key: "Engine_N1_Right",
    param: "0346",
    comment: "Обороты правого МСУ",
    dataType: "Float",
    group: "ДВИГАТЕЛИ"
  },
  {
    key: "Engine_N1_Target_Right",
    param: "0341",
    comment: "Целевые обороты правого МСУ",
    dataType: "Float",
    group: "ДВИГАТЕЛИ"
  },
  // ══════════════════════════════════════════════════════════════════
  //  ТОПЛИВО
  // ══════════════════════════════════════════════════════════════════
  {
    key: "TotalFuel",
    param: "0247",
    comment: "Общее количество топлива",
    dataType: "Float",
    group: "ТОПЛИВО"
  },
  // ══════════════════════════════════════════════════════════════════
  //  Шасси — замки убранного/выпущенного положения
  // ══════════════════════════════════════════════════════════════════
  {
    key: "LG_Uplock",
    param: "0270",
    comment: "ЛООШ на замке убрано (Left Gear Uplocked)",
    dataType: "Float",
    group: "ШАССИ"
  },
  {
    key: "LG_Downlock",
    param: "0270",
    comment: "ЛООШ на замке выпуска (Left Gear Downlocked)",
    dataType: "Float",
    group: "ШАССИ"
  },
  {
    key: "RG_Uplock",
    param: "0271",
    comment: "ПООШ на замке убрано (Right Gear Uplocked)",
    dataType: "Float",
    group: "ШАССИ"
  },
  {
    key: "RG_Downlock",
    param: "0271",
    comment: "ПООШ на замке выпуска (Right Gear Downlocked)",
    dataType: "Float",
    group: "ШАССИ"
  },
  {
    key: "NG_Uplock",
    param: "0270",
    comment: "ПОШ на замке убрано (Nose Gear Uplocked)",
    dataType: "Float",
    group: "ШАССИ"
  },
  {
    key: "NG_Downlock",
    param: "0270",
    comment: "ПОШ на замке выпуска (Nose Gear Downlocked)",
    dataType: "Float",
    group: "ШАССИ"
  },
  // ══════════════════════════════════════════════════════════════════
  //  ВСУ (вспомогательная силовая установка)
  // ══════════════════════════════════════════════════════════════════
  {
    key: "APU_Speed",
    param: "005",
    comment: "Обороты ВСУ",
    dataType: "Float",
    group: "ВСУ"
  },
  {
    key: "APU_OilTemp",
    param: "0157",
    comment: "Температура масла ВСУ",
    dataType: "Float",
    group: "ВСУ"
  },
  {
    key: "APU_EGT",
    param: "024",
    comment: "Температура газа за турбиной ВСУ",
    dataType: "Float",
    group: "ВСУ"
  },
  {
    key: "APU_OilPressure",
    param: "007",
    comment: "Давление масла за фильтром ВСУ",
    dataType: "Float",
    group: "ВСУ"
  },
  // ══════════════════════════════════════════════════════════════════
  //  КСКВ (комплексная система кондиционирования воздуха)
  // ══════════════════════════════════════════════════════════════════
  {
    key: "ECS_TargetTemp_1",
    param: "012",
    comment: "Целевая температура подачи 1 (КСКВ)",
    dataType: "Float",
    group: "КСКВ"
  },
  {
    key: "ECS_TargetTemp_2",
    param: "012",
    comment: "Целевая температура подачи 2 (КСКВ)",
    dataType: "Float",
    group: "КСКВ"
  },
  {
    key: "ECS_TargetTemp_4",
    param: "013",
    comment: "Целевая температура подачи 4 (КСКВ)",
    dataType: "Float",
    group: "КСКВ"
  },
  // ══════════════════════════════════════════════════════════════════
  //  БРУ (блок ручного управления) / Flight Control Unit
  // ══════════════════════════════════════════════════════════════════
  {
    key: "FCU_Roll_Left",
    param: "010",
    comment: "Левая БРУ по крену",
    dataType: "Float",
    group: "БРУ"
  },
  {
    key: "FCU_Pitch_Left",
    param: "006",
    comment: "Левая БРУ по тангажу",
    dataType: "Float",
    group: "БРУ"
  },
  {
    key: "FCU_Roll_Right",
    param: "011",
    comment: "Правая БРУ по крену",
    dataType: "Float",
    group: "БРУ"
  },
  {
    key: "FCU_Pitch_Right",
    param: "007",
    comment: "Правая БРУ по тангажу",
    dataType: "Float",
    group: "БРУ"
  },
  // ══════════════════════════════════════════════════════════════════
  //  АВИОНИКА — расширенные параметры
  // ══════════════════════════════════════════════════════════════════
  {
    key: "StandardAltitude",
    param: "0203",
    comment: "Стандартная высота",
    dataType: "Float",
    group: "АВИОНИКА"
  },
  {
    key: "BaroAltitude",
    param: "0204",
    comment: "Барометрическая высота",
    dataType: "Float",
    group: "АВИОНИКА"
  },
  {
    key: "CAS",
    param: "0206",
    comment: "Вычисленная воздушная скорость (CAS)",
    dataType: "Float",
    group: "АВИОНИКА"
  },
  {
    key: "MachNumber",
    param: "0205",
    comment: "Число Маха",
    dataType: "Float",
    group: "АВИОНИКА"
  },
  {
    key: "AoA",
    param: "0241",
    comment: "AoA #1 — угол атаки",
    dataType: "Float",
    group: "АВИОНИКА"
  },
  {
    key: "Alpha",
    param: "0221",
    comment: "Индикаторный угол атаки",
    dataType: "Float",
    group: "АВИОНИКА"
  },
  {
    key: "Vy",
    param: "0212",
    comment: "Вертикальная скорость барометрическая",
    dataType: "Float",
    group: "АВИОНИКА"
  },
  {
    key: "AutopilotOn",
    param: "0270",
    comment: "Включение автопилота",
    dataType: "Float",
    group: "АВИОНИКА"
  },
  {
    key: "FlightDirectorOn",
    param: "0270",
    comment: "Включение пилотажного директора",
    dataType: "Float",
    group: "АВИОНИКА"
  },
  {
    key: "HeadingHoldOn",
    param: "0274",
    comment: "Включение режима HDG",
    dataType: "Float",
    group: "АВИОНИКА"
  },
  {
    key: "HeadingSelect",
    param: "0100",
    comment: "Заданное значение HDG",
    dataType: "Float",
    group: "АВИОНИКА"
  },
  {
    key: "VerticalSpeedSelect",
    param: "0104",
    comment: "Заданная вертикальная скорость",
    dataType: "Float",
    group: "АВИОНИКА"
  },
  {
    key: "SpeedSelect",
    param: "0103",
    comment: "Заданная скорость",
    dataType: "Float",
    group: "АВИОНИКА"
  },
  {
    key: "FD_RollCmd",
    param: "0141",
    comment: "Положение креновой директорной планки",
    dataType: "Float",
    group: "АВИОНИКА"
  },
  {
    key: "FD_PitchCmd",
    param: "0140",
    comment: "Положение тангажной директорной планки",
    dataType: "Float",
    group: "АВИОНИКА"
  },
  // ══════════════════════════════════════════════════════════════════
  //  КСУ — комплексная система управления (Flight Controls)
  // ══════════════════════════════════════════════════════════════════
  {
    key: "FlapsLever",
    param: "012",
    comment: "Положение ручки FLAPS",
    dataType: "Float",
    group: "КСУ"
  },
  {
    key: "FlapsPosition",
    param: "063",
    comment: "Текущее положение закрылок",
    dataType: "Float",
    group: "КСУ"
  },
  {
    key: "SlatsPosition",
    param: "063",
    comment: "Текущее положение предкрылков",
    dataType: "Float",
    group: "КСУ"
  },
  {
    key: "Spoil_Left_Center",
    param: "056",
    comment: "Положение интерцептора левого центрального",
    dataType: "Float",
    group: "КСУ"
  },
  {
    key: "Spoil_Right_Center",
    param: "057",
    comment: "Положение интерцептора правого центрального",
    dataType: "Float",
    group: "КСУ"
  },
  {
    key: "Spoil_Left_Outer",
    param: "056",
    comment: "Положение интерцептора левого внешнего",
    dataType: "Float",
    group: "КСУ"
  },
  {
    key: "Spoil_Left_Inner",
    param: "056",
    comment: "Положение интерцептора левого внутреннего",
    dataType: "Float",
    group: "КСУ"
  },
  {
    key: "Spoil_Right_Inner",
    param: "057",
    comment: "Положение интерцептора правого внутреннего",
    dataType: "Float",
    group: "КСУ"
  },
  {
    key: "Spoil_Right_Outer",
    param: "057",
    comment: "Положение интерцептора правого внешнего",
    dataType: "Float",
    group: "КСУ"
  },
  {
    key: "Airbrake_Inner_Cmd",
    param: "0154",
    comment: "Команда на выпуск ТЩ внутренний (воздушный тормоз внутр.)",
    dataType: "Float",
    group: "КСУ"
  },
  {
    key: "Airbrake_Outer_Cmd",
    param: "0154",
    comment: "Команда на выпуск ТЩ внешний (воздушный тормоз внеш.)",
    dataType: "Float",
    group: "КСУ"
  },
  {
    key: "StabPosition",
    param: "060",
    comment: "Положение стабилизатора",
    dataType: "Float",
    group: "КСУ"
  },
  {
    key: "Rudder_Upper",
    param: "055",
    comment: "Положение руля направления (верх)",
    dataType: "Float",
    group: "КСУ"
  },
  {
    key: "Rudder_Lower",
    param: "055",
    comment: "Положение руля направления (низ)",
    dataType: "Float",
    group: "КСУ"
  },
  {
    key: "Rudder_Middle",
    param: "055",
    comment: "Положение руля направления (середина)",
    dataType: "Float",
    group: "КСУ"
  },
  {
    key: "RudderTrim",
    param: "042",
    comment: "Триммер по курсу",
    dataType: "Float",
    group: "КСУ"
  },
  {
    key: "Elev_Right_Outer",
    param: "055",
    comment: "Положение правого руля высоты (внешний)",
    dataType: "Float",
    group: "КСУ"
  },
  {
    key: "Elev_Left_Outer",
    param: "055",
    comment: "Положение левого руля высоты (внешний)",
    dataType: "Float",
    group: "КСУ"
  },
  {
    key: "Elev_Left_Inner",
    param: "055",
    comment: "Положение левого руля высоты (внутренний)",
    dataType: "Float",
    group: "КСУ"
  },
  {
    key: "Elev_Right_Inner",
    param: "055",
    comment: "Положение правого руля высоты (внутренний)",
    dataType: "Float",
    group: "КСУ"
  },
  {
    key: "Ail_Right_Inner",
    param: "056",
    comment: "Положение правого элерона (внутренний)",
    dataType: "Float",
    group: "КСУ"
  },
  {
    key: "Ail_Left_Inner",
    param: "056",
    comment: "Положение левого элерона (внутренний)",
    dataType: "Float",
    group: "КСУ"
  },
  {
    key: "Ail_Left_Outer",
    param: "056",
    comment: "Положение левого элерона (внешний)",
    dataType: "Float",
    group: "КСУ"
  },
  {
    key: "Ail_Right_Outer",
    param: "056",
    comment: "Положение правого элерона (внешний)",
    dataType: "Float",
    group: "КСУ"
  },
  {
    key: "AileronTrim",
    param: "042",
    comment: "Триммер по крену",
    dataType: "Float",
    group: "КСУ"
  },
  // ══════════════════════════════════════════════════════════════════
  //  Шасси — обжатие (Weight-On-Wheels)
  // ══════════════════════════════════════════════════════════════════
  {
    key: "NG_WOW",
    param: "0272",
    comment: "Обжатие ПОШ (Nose Gear Weight-On-Wheels)",
    dataType: "Float",
    group: "ШАССИ"
  },
  {
    key: "LG_WOW",
    param: "0272",
    comment: "Обжатие ЛООШ (Left Gear Weight-On-Wheels)",
    dataType: "Float",
    group: "ШАССИ"
  },
  {
    key: "RG_WOW",
    param: "0272",
    comment: "Обжатие ПООШ (Right Gear Weight-On-Wheels)",
    dataType: "Float",
    group: "ШАССИ"
  },
  {
    key: "WOW",
    param: "0272",
    comment: "Обжатие всех опор (Weight-On-Wheels all)",
    dataType: "Float",
    group: "ШАССИ"
  },
  // ══════════════════════════════════════════════════════════════════
  //  Статусные слова MIL-STD-1553
  // ══════════════════════════════════════════════════════════════════
  {
    key: "Status_7",
    param: "",
    comment: "STATUS_7 — статусное слово 1553 (блок 3, линия 1, задача 1, минор 1, offset 48 бит)",
    dataType: "Short",
    group: "STATUS"
  },
  {
    key: "Status_5",
    param: "",
    comment: "STATUS_5 — статусное слово 1553 (блок 3, линия 2, задача 1, минор 1, offset 48 бит)",
    dataType: "Short",
    group: "STATUS"
  },
  {
    key: "Status_6",
    param: "",
    comment: "STATUS_6 — статусное слово 1553 (блок 3, линия 3, задача 1, минор 1, offset 48 бит)",
    dataType: "Short",
    group: "STATUS"
  },
  {
    key: "Status_8",
    param: "",
    comment: "STATUS_8 — статусное слово 1553 (блок 3, линия 4, задача 1, минор 1, offset 48 бит)",
    dataType: "Short",
    group: "STATUS"
  },
  // ══════════════════════════════════════════════════════════════════
  //  Статусы блоков ТН (телеметрический накопитель) по слотам
  // ══════════════════════════════════════════════════════════════════
  {
    key: "Status_TN_0",
    param: "",
    comment: "STATUS_TN_0 — статус телеметрического блока 0",
    dataType: "Short",
    group: "STATUS"
  },
  {
    key: "Status_TN_1",
    param: "",
    comment: "STATUS_TN_1 — статус телеметрического блока 1",
    dataType: "Short",
    group: "STATUS"
  },
  {
    key: "Status_TN_2",
    param: "",
    comment: "STATUS_TN_2 — статус телеметрического блока 2",
    dataType: "Short",
    group: "STATUS"
  },
  {
    key: "Status_TN_3",
    param: "",
    comment: "STATUS_TN_3 — статус телеметрического блока 3",
    dataType: "Short",
    group: "STATUS"
  },
  {
    key: "Status_TN_4",
    param: "",
    comment: "STATUS_TN_4 — статус телеметрического блока 4",
    dataType: "Short",
    group: "STATUS"
  },
  {
    key: "Status_TN_5",
    param: "",
    comment: "STATUS_TN_5 — статус телеметрического блока 5",
    dataType: "Short",
    group: "STATUS"
  },
  {
    key: "Status_TN_6",
    param: "",
    comment: "STATUS_TN_6 — статус телеметрического блока 6",
    dataType: "Short",
    group: "STATUS"
  },
  {
    key: "Status_TN_7",
    param: "",
    comment: "STATUS_TN_7 — статус телеметрического блока 7",
    dataType: "Short",
    group: "STATUS"
  },
  {
    key: "Status_TN_8",
    param: "",
    comment: "STATUS_TN_8 — статус телеметрического блока 8",
    dataType: "Short",
    group: "STATUS"
  },
  {
    key: "Status_TN_9",
    param: "",
    comment: "STATUS_TN_9 — статус телеметрического блока 9",
    dataType: "Short",
    group: "STATUS"
  },
  {
    key: "Status_TN_10",
    param: "",
    comment: "STATUS_TN_10 — статус телеметрического блока 10",
    dataType: "Short",
    group: "STATUS"
  },
  {
    key: "Status_TN_11",
    param: "",
    comment: "STATUS_TN_11 — статус телеметрического блока 11",
    dataType: "Short",
    group: "STATUS"
  },
  {
    key: "Status_TN_12",
    param: "",
    comment: "STATUS_TN_12 — статус телеметрического блока 12",
    dataType: "Short",
    group: "STATUS"
  },
  {
    key: "Status_TN_13",
    param: "",
    comment: "STATUS_TN_13 — статус телеметрического блока 13",
    dataType: "Short",
    group: "STATUS"
  },
  {
    key: "Status_TN_14",
    param: "",
    comment: "STATUS_TN_14 — статус телеметрического блока 14",
    dataType: "Short",
    group: "STATUS"
  },
  {
    key: "Status_TN_15",
    param: "",
    comment: "STATUS_TN_15 — статус телеметрического блока 15",
    dataType: "Short",
    group: "STATUS"
  },
  {
    key: "Status_TN_16",
    param: "",
    comment: "STATUS_TN_16 — статус телеметрического блока 16",
    dataType: "Short",
    group: "STATUS"
  },
  {
    key: "Status_TN_17",
    param: "",
    comment: "STATUS_TN_17 — статус телеметрического блока 17",
    dataType: "Short",
    group: "STATUS"
  },
  {
    key: "Status_TN_18",
    param: "",
    comment: "STATUS_TN_18 — статус телеметрического блока 18",
    dataType: "Short",
    group: "STATUS"
  },
  // ══════════════════════════════════════════════════════════════════
  //  Температуры блоков ТН
  // ══════════════════════════════════════════════════════════════════
  {
    key: "Temp_TN_0",
    param: "",
    comment: "TEMP_TN_0 — температура телеметрического блока 0",
    dataType: "Float",
    group: "TEMP"
  },
  {
    key: "Temp_TN_1",
    param: "",
    comment: "TEMP_TN_1 — температура телеметрического блока 1",
    dataType: "Float",
    group: "TEMP"
  },
  {
    key: "Temp_TN_2",
    param: "",
    comment: "TEMP_TN_2 — температура телеметрического блока 2",
    dataType: "Float",
    group: "TEMP"
  },
  {
    key: "Temp_TN_3",
    param: "",
    comment: "TEMP_TN_3 — температура телеметрического блока 3",
    dataType: "Float",
    group: "TEMP"
  },
  {
    key: "Temp_TN_4",
    param: "",
    comment: "TEMP_TN_4 — температура телеметрического блока 4",
    dataType: "Float",
    group: "TEMP"
  },
  {
    key: "Temp_TN_5",
    param: "",
    comment: "TEMP_TN_5 — температура телеметрического блока 5",
    dataType: "Float",
    group: "TEMP"
  },
  {
    key: "Temp_TN_6",
    param: "",
    comment: "TEMP_TN_6 — температура телеметрического блока 6",
    dataType: "Float",
    group: "TEMP"
  },
  {
    key: "Temp_TN_7",
    param: "",
    comment: "TEMP_TN_7 — температура телеметрического блока 7",
    dataType: "Float",
    group: "TEMP"
  },
  {
    key: "Temp_TN_8",
    param: "",
    comment: "TEMP_TN_8 — температура телеметрического блока 8",
    dataType: "Float",
    group: "TEMP"
  },
  {
    key: "Temp_TN_9",
    param: "",
    comment: "TEMP_TN_9 — температура телеметрического блока 9",
    dataType: "Float",
    group: "TEMP"
  },
  {
    key: "Temp_TN_10",
    param: "",
    comment: "TEMP_TN_10 — температура телеметрического блока 10",
    dataType: "Float",
    group: "TEMP"
  },
  {
    key: "Temp_TN_11",
    param: "",
    comment: "TEMP_TN_11 — температура телеметрического блока 11",
    dataType: "Float",
    group: "TEMP"
  },
  {
    key: "Temp_TN_12",
    param: "",
    comment: "TEMP_TN_12 — температура телеметрического блока 12",
    dataType: "Float",
    group: "TEMP"
  },
  {
    key: "Temp_TN_13",
    param: "",
    comment: "TEMP_TN_13 — температура телеметрического блока 13",
    dataType: "Float",
    group: "TEMP"
  },
  {
    key: "Temp_TN_14",
    param: "",
    comment: "TEMP_TN_14 — температура телеметрического блока 14",
    dataType: "Float",
    group: "TEMP"
  },
  {
    key: "Temp_TN_15",
    param: "",
    comment: "TEMP_TN_15 — температура телеметрического блока 15",
    dataType: "Float",
    group: "TEMP"
  },
  {
    key: "Temp_TN_16",
    param: "",
    comment: "TEMP_TN_16 — температура телеметрического блока 16",
    dataType: "Float",
    group: "TEMP"
  },
  {
    key: "Temp_TN_17",
    param: "",
    comment: "TEMP_TN_17 — температура телеметрического блока 17",
    dataType: "Float",
    group: "TEMP"
  },
  {
    key: "Temp_TN_18",
    param: "",
    comment: "TEMP_TN_18 — температура телеметрического блока 18",
    dataType: "Float",
    group: "TEMP"
  },
  // ══════════════════════════════════════════════════════════════════
  //  Time
  // ══════════════════════════════════════════════════════════════════
  {
    key: "Time",
    param: "0150",
    comment: "Time — время (мс)",
    dataType: "Float",
    group: "АВИОНИКА"
  },
  // ══════════════════════════════════════════════════════════════════
  //  IG — система измерения газов
  // ══════════════════════════════════════════════════════════════════
  {
    key: "IG_RY1_Open",
    param: "0271",
    comment: "IG_RY1_open — реле 1 открыто",
    dataType: "Float",
    group: "IG"
  },
  {
    key: "IG_RY2_Open",
    param: "0272",
    comment: "IG_RY2_open — реле 2 открыто",
    dataType: "Float",
    group: "IG"
  },
  {
    key: "IG_RY3_Open",
    param: "0272",
    comment: "IG_RY3_open — реле 3 открыто",
    dataType: "Float",
    group: "IG"
  },
  {
    key: "IG_RY3_Close",
    param: "0272",
    comment: "IG_RY3_close — реле 3 закрыто",
    dataType: "Float",
    group: "IG"
  },
  {
    key: "IG_K1_Open",
    param: "0271",
    comment: "IG_K1_open — контактор 1 открыт",
    dataType: "Float",
    group: "IG"
  },
  {
    key: "IG_K2_Open",
    param: "0271",
    comment: "IG_K2_open — контактор 2 открыт",
    dataType: "Float",
    group: "IG"
  },
  {
    key: "IG_Block_Fault",
    param: "0271",
    comment: "IG_block_fault — неисправность блока",
    dataType: "Float",
    group: "IG"
  },
  {
    key: "IG_System_Fault",
    param: "0271",
    comment: "IG_system_fault — системная неисправность",
    dataType: "Float",
    group: "IG"
  },
  {
    key: "IG_O2_1",
    param: "046",
    comment: "IG_O2_1 — концентрация кислорода, датчик 1",
    dataType: "Float",
    group: "IG"
  },
  {
    key: "IG_O2_2",
    param: "046",
    comment: "IG_O2_2 — концентрация кислорода, датчик 2",
    dataType: "Float",
    group: "IG"
  },
  {
    key: "IG_T3",
    param: "",
    comment: "IG_T3 — температура, датчик 3",
    dataType: "Float",
    group: "IG"
  },
  {
    key: "IG_T4",
    param: "",
    comment: "IG_T4 — температура, датчик 4",
    dataType: "Float",
    group: "IG"
  },
  {
    key: "IG_T5",
    param: "",
    comment: "IG_T5 — температура, датчик 5",
    dataType: "Float",
    group: "IG"
  },
  // ══════════════════════════════════════════════════════════════════
  //  Статика — параметры статической прочности
  // ══════════════════════════════════════════════════════════════════
  {
    key: "Stat_L",
    param: "",
    comment: "Stat_L — статика левая (блок 3, слот 9, линия 1, задача 1, минор 7, offset 320 бит)",
    dataType: "Short",
    group: "СТАТИКА"
  },
  {
    key: "Stat_R",
    param: "",
    comment: "Stat_R — статика правая (блок 3, слот 9, линия 4, задача 1, минор 5, offset 560 бит)",
    dataType: "Short",
    group: "СТАТИКА"
  },
  {
    key: "Stat_Kil",
    param: "",
    comment: "Stat_Kil — статика киля (raw, блок 1, слот 1, канал 10)",
    dataType: "Int16",
    group: "СТАТИКА"
  },
  {
    key: "Stat_Stab",
    param: "",
    comment: "Stat_Stab — статика стабилизатора (raw, блок 1, слот 1, канал 9)",
    dataType: "Int16",
    group: "СТАТИКА"
  }
];
const RAW_SSE_URL = "/events/raw";
const AVAILABLE_PORTS = [14442, 14443, 14444, 14445];
const COMMENT_MAP = {};
for (const entry of FIELD_CATALOG) {
  const truncated = entry.comment.length > 30 ? entry.comment.slice(0, 30) + "…" : entry.comment;
  COMMENT_MAP[entry.key] = truncated;
}
function RawMonitor({ onBack }) {
  const [connStatus, setConnStatus] = reactExports$1.useState("idle");
  const [lastFrame, setLastFrame] = reactExports$1.useState(null);
  const [status, setStatus] = reactExports$1.useState(null);
  const [error, setError] = reactExports$1.useState(null);
  const [showHex, setShowHex] = reactExports$1.useState(false);
  const [showAllKeys, setShowAllKeys] = reactExports$1.useState(false);
  const [watchPort, setWatchPort] = reactExports$1.useState(14442);
  const [portPending, setPortPending] = reactExports$1.useState(false);
  const eventSourceRef = reactExports$1.useRef(null);
  const connectSSE = reactExports$1.useCallback(() => {
    if (eventSourceRef.current) eventSourceRef.current.close();
    setConnStatus("connecting");
    setError(null);
    console.log("[RAW-MONITOR-UI] Connecting SSE to", RAW_SSE_URL);
    const es = new EventSource(RAW_SSE_URL);
    eventSourceRef.current = es;
    es.addEventListener("open", () => {
      console.log("[RAW-MONITOR-UI] SSE connection opened");
      setConnStatus("waiting");
    });
    es.addEventListener("raw-frame", (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("[RAW-MONITOR-UI] raw-frame received, keys:", Object.keys(data.decoded || {}).length);
        setLastFrame(data);
        setConnStatus("receiving");
        setError(null);
      } catch {
        setError("Failed to parse raw-frame");
      }
    });
    es.addEventListener("status", (event) => {
      var _a;
      try {
        const s = JSON.parse(event.data);
        console.log("[RAW-MONITOR-UI] status received:", JSON.stringify(s));
        setStatus(s);
        if ((_a = s.source) == null ? void 0 : _a.udpPort) {
          setWatchPort(s.source.udpPort);
          setPortPending(false);
        }
        if (s.active) {
          const fresh = s.lastPacketAgeMs !== null && s.lastPacketAgeMs < 3e3;
          setConnStatus(fresh ? "receiving" : "waiting");
        }
      } catch {
      }
    });
    es.addEventListener("error", () => {
      console.error("[RAW-MONITOR-UI] SSE error, readyState:", es.readyState);
      setConnStatus("error");
      setError("SSE connection lost. Retrying...");
    });
  }, []);
  const disconnectSSE = reactExports$1.useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setConnStatus("idle");
  }, []);
  const changePort = reactExports$1.useCallback(async (port) => {
    setPortPending(true);
    setWatchPort(port);
    try {
      const res = await fetch("/api/raw/port", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ port })
      });
      if (!res.ok) {
        setPortPending(false);
        setError(`Failed to switch port: ${res.status}`);
      }
    } catch (e) {
      setPortPending(false);
      setError(`Port switch failed: ${e instanceof Error ? e.message : String(e)}`);
    }
  }, []);
  reactExports$1.useEffect(() => {
    connectSSE();
    return () => {
      disconnectSSE();
    };
  }, [connectSSE, disconnectSSE]);
  const statusColor = {
    idle: "bg-white/20",
    connecting: "bg-yellow-500",
    waiting: "bg-yellow-500",
    receiving: "bg-green-500",
    error: "bg-red-500"
  }[connStatus];
  const statusLabel = {
    idle: "idle",
    connecting: "connecting...",
    waiting: "waiting for data",
    receiving: "receiving",
    error: "error"
  }[connStatus];
  const decodedEntries = (lastFrame == null ? void 0 : lastFrame.decoded) ? Object.entries(lastFrame.decoded) : [];
  const displayEntries = showAllKeys ? decodedEntries : decodedEntries.slice(0, 20);
  const packetAge = (status == null ? void 0 : status.lastPacketAgeMs) !== null && (status == null ? void 0 : status.lastPacketAgeMs) !== void 0 ? `${status.lastPacketAgeMs}ms ago` : "—";
  const copyHex = () => {
    if (lastFrame == null ? void 0 : lastFrame.hex) navigator.clipboard.writeText(lastFrame.hex);
  };
  return /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "min-h-screen bg-[#0a0a0f] flex flex-col p-4", children: /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "w-full max-w-5xl mx-auto flex flex-col gap-6", children: [
    /* @__PURE__ */ jsxRuntimeExports$1.jsxs("header", { className: "flex items-center justify-between bg-black/40 p-4 rounded-xl border border-white/10 shadow-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports$1.jsx(
          "button",
          {
            onClick: onBack,
            className: "p-2 hover:bg-white/10 rounded-lg transition text-white/60 hover:text-white",
            title: "Back to Hub",
            children: /* @__PURE__ */ jsxRuntimeExports$1.jsx(ArrowLeft, { className: "w-5 h-5" })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "p-2 bg-emerald-500/20 text-emerald-400 rounded-lg", children: /* @__PURE__ */ jsxRuntimeExports$1.jsx(Monitor, { className: "w-6 h-6" }) }),
        /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("h1", { className: "text-white font-medium text-lg tracking-tight", children: "Raw Data Monitor" }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("p", { className: "text-white/50 text-sm", children: "Live parser output inspector" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10", children: [
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("span", { className: `w-2 h-2 rounded-full ${statusColor}` }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("span", { className: "text-white/60 text-sm", children: statusLabel })
        ] }),
        status && /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "flex items-center gap-4 text-white/40 text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports$1.jsxs("span", { children: [
            "packets: ",
            status.receivedPackets
          ] }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsxs("span", { children: [
            "frames: ",
            status.receivedFrames
          ] }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsxs("span", { children: [
            "age: ",
            packetAge
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "flex items-center gap-4 bg-black/30 p-4 rounded-xl border border-white/5", children: [
      /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "text-sm text-white/60", children: "Current Decoder Output" }),
      /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports$1.jsx(Plug, { className: "w-4 h-4 text-white/40" }),
        /* @__PURE__ */ jsxRuntimeExports$1.jsx(
          "select",
          {
            value: watchPort,
            onChange: (e) => changePort(Number(e.target.value)),
            disabled: portPending,
            className: "bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-sm text-white font-mono\n                         focus:outline-none focus:border-emerald-400/50 disabled:opacity-50\n                         appearance-none cursor-pointer hover:bg-white/15 transition",
            children: AVAILABLE_PORTS.map((p) => /* @__PURE__ */ jsxRuntimeExports$1.jsxs("option", { value: p, className: "bg-[#1a1a2e] text-white", children: [
              "UDP :",
              p
            ] }, p))
          }
        ),
        portPending && /* @__PURE__ */ jsxRuntimeExports$1.jsx("span", { className: "text-yellow-400 text-xs animate-pulse", children: "switching..." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "flex items-center gap-1.5 text-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports$1.jsx("span", { className: `w-1.5 h-1.5 rounded-full ${(status == null ? void 0 : status.active) ? "bg-green-500" : "bg-red-500"}` }),
        /* @__PURE__ */ jsxRuntimeExports$1.jsx("span", { className: "text-white/40", children: (status == null ? void 0 : status.active) ? `${status.receivedPackets} pkts` : "no data" })
      ] }),
      error && /* @__PURE__ */ jsxRuntimeExports$1.jsx("span", { className: "text-red-400 text-sm font-medium truncate max-w-[400px]", children: error })
    ] }),
    lastFrame ? /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "flex flex-col gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "bg-black/30 rounded-xl border border-white/5 overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "flex items-center justify-between px-4 py-3 border-b border-white/5", children: [
          /* @__PURE__ */ jsxRuntimeExports$1.jsxs("h2", { className: "text-white/80 text-sm font-semibold flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports$1.jsx(Radio, { className: "w-4 h-4 text-emerald-400" }),
            "Decoded Parameters",
            /* @__PURE__ */ jsxRuntimeExports$1.jsxs("span", { className: "text-white/30 font-normal", children: [
              "(",
              decodedEntries.length,
              " fields)"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsxs("span", { className: "text-white/30 text-xs", children: [
            "last: ",
            lastFrame.receivedAt ?? "—"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "max-h-[500px] overflow-y-auto", children: /* @__PURE__ */ jsxRuntimeExports$1.jsxs("table", { className: "w-full text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("thead", { className: "sticky top-0 bg-black/60", children: /* @__PURE__ */ jsxRuntimeExports$1.jsxs("tr", { className: "text-white/40 text-xs uppercase tracking-wider", children: [
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("th", { className: "text-left px-4 py-2 font-medium", children: "Parameter" }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("th", { className: "text-left px-3 py-2 font-medium", children: "Comment" }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("th", { className: "text-right px-4 py-2 font-medium", children: "Value" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("tbody", { className: "divide-y divide-white/5", children: displayEntries.map(([key, value]) => /* @__PURE__ */ jsxRuntimeExports$1.jsxs(
            "tr",
            {
              className: "hover:bg-white/[0.02] transition-colors",
              children: [
                /* @__PURE__ */ jsxRuntimeExports$1.jsx("td", { className: "px-4 py-2 text-white/70 font-mono text-xs", children: key }),
                /* @__PURE__ */ jsxRuntimeExports$1.jsx("td", { className: "px-3 py-2 text-white/30 text-xs italic max-w-[220px] truncate", title: COMMENT_MAP[key], children: COMMENT_MAP[key] || "" }),
                /* @__PURE__ */ jsxRuntimeExports$1.jsx("td", { className: "px-4 py-2 text-right text-emerald-400 font-mono text-xs tabular-nums", children: Number.isFinite(value) ? value.toFixed(4) : String(value) })
              ]
            },
            key
          )) })
        ] }) }),
        decodedEntries.length > 20 && /* @__PURE__ */ jsxRuntimeExports$1.jsx(
          "button",
          {
            onClick: () => setShowAllKeys(!showAllKeys),
            className: "w-full px-4 py-2 text-white/40 hover:text-white/70 text-xs flex items-center justify-center gap-1 border-t border-white/5 hover:bg-white/[0.02] transition",
            children: showAllKeys ? /* @__PURE__ */ jsxRuntimeExports$1.jsxs(jsxRuntimeExports$1.Fragment, { children: [
              "Show less ",
              /* @__PURE__ */ jsxRuntimeExports$1.jsx(ChevronUp, { className: "w-3 h-3" })
            ] }) : /* @__PURE__ */ jsxRuntimeExports$1.jsxs(jsxRuntimeExports$1.Fragment, { children: [
              "Show all ",
              decodedEntries.length,
              " fields ",
              /* @__PURE__ */ jsxRuntimeExports$1.jsx(ChevronDown, { className: "w-3 h-3" })
            ] })
          }
        )
      ] }),
      lastFrame.hex && /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "bg-black/30 rounded-xl border border-white/5 overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports$1.jsxs(
          "button",
          {
            onClick: () => setShowHex(!showHex),
            className: "w-full flex items-center justify-between px-4 py-3 hover:bg-white/[0.02] transition",
            children: [
              /* @__PURE__ */ jsxRuntimeExports$1.jsxs("span", { className: "text-white/80 text-sm font-semibold flex items-center gap-2", children: [
                showHex ? /* @__PURE__ */ jsxRuntimeExports$1.jsx(ChevronDown, { className: "w-4 h-4 text-white/40" }) : /* @__PURE__ */ jsxRuntimeExports$1.jsx(ChevronRight, { className: "w-4 h-4 text-white/40" }),
                "Raw Hex",
                /* @__PURE__ */ jsxRuntimeExports$1.jsx("span", { className: "text-white/30 font-normal text-xs", children: "(first 512 bytes)" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports$1.jsx(
                "button",
                {
                  onClick: (e) => {
                    e.stopPropagation();
                    copyHex();
                  },
                  className: "p-1.5 hover:bg-white/10 rounded transition text-white/40 hover:text-white/80",
                  title: "Copy hex",
                  children: /* @__PURE__ */ jsxRuntimeExports$1.jsx(Copy, { className: "w-3.5 h-3.5" })
                }
              )
            ]
          }
        ),
        showHex && /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "px-4 pb-4", children: /* @__PURE__ */ jsxRuntimeExports$1.jsx("pre", { className: "text-xs font-mono text-amber-400/70 bg-black/50 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap break-all max-h-[200px] overflow-y-auto select-all", children: lastFrame.hex }) })
      ] })
    ] }) : /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "flex flex-col items-center justify-center py-24 text-white/20 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports$1.jsx(WifiOff, { className: "w-12 h-12" }),
      /* @__PURE__ */ jsxRuntimeExports$1.jsx("p", { className: "text-sm", children: "Waiting for decoder stream..." })
    ] })
  ] }) });
}
const UdpSourceDialog = ({ open, onClose }) => {
  const [host, setHost] = reactExports$1.useState("0.0.0.0");
  const [port, setPort] = reactExports$1.useState("14443");
  const [busy, setBusy] = reactExports$1.useState(false);
  const [error, setError] = reactExports$1.useState(null);
  const [status, setStatus] = reactExports$1.useState(null);
  reactExports$1.useEffect(() => {
    if (!open) return;
    setError(null);
    void (async () => {
      try {
        const res = await fetch("/api/source/status");
        if (!res.ok) return;
        const data = await res.json();
        setStatus(data);
        setHost(data.udpHost);
        setPort(String(data.udpPort));
      } catch {
      }
    })();
  }, [open]);
  reactExports$1.useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);
  if (!open) return null;
  const apply = async () => {
    const portNum = Number(port);
    if (!Number.isFinite(portNum) || portNum < 1 || portNum > 65535) {
      setError("Invalid UDP port (1-65535)");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/source/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ host: host.trim() || "0.0.0.0", port: portNum })
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        setError(e.error || "Failed to update source");
        return;
      }
      const next = await res.json();
      setStatus(next);
      onClose();
    } catch {
      setError("Failed to update source");
    } finally {
      setBusy(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports$1.jsx(
    "div",
    {
      className: "fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4",
      onMouseDown: (e) => {
        if (e.target === e.currentTarget) onClose();
      },
      children: /* @__PURE__ */ jsxRuntimeExports$1.jsxs(
        "div",
        {
          className: "w-full max-w-md bg-[#161719] border border-[#2d2e30] rounded-lg shadow-2xl p-5",
          role: "dialog",
          "aria-modal": "true",
          "aria-labelledby": "udp-dialog-title",
          children: [
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("h2", { id: "udp-dialog-title", className: "text-sm font-bold text-white mb-4", children: "UDP Source" }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "space-y-4", children: [
              /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports$1.jsx("label", { className: "block text-[11px] text-gray-400 mb-1.5 uppercase tracking-wide", children: "Host" }),
                /* @__PURE__ */ jsxRuntimeExports$1.jsx(
                  "input",
                  {
                    value: host,
                    onChange: (e) => setHost(e.target.value),
                    className: "w-full px-3 py-2 bg-[#0a0a0f] border border-[#2d2e30] rounded-md text-white font-mono text-sm focus:outline-none focus:border-blue-500/50",
                    autoFocus: true
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports$1.jsx("label", { className: "block text-[11px] text-gray-400 mb-1.5 uppercase tracking-wide", children: "Port" }),
                /* @__PURE__ */ jsxRuntimeExports$1.jsx(
                  "input",
                  {
                    value: port,
                    onChange: (e) => setPort(e.target.value),
                    className: "w-full px-3 py-2 bg-[#0a0a0f] border border-[#2d2e30] rounded-md text-white font-mono text-sm focus:outline-none focus:border-blue-500/50"
                  }
                )
              ] }),
              status && /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "text-[10px] text-gray-500 font-mono", children: [
                "active: ",
                status.active ? "yes" : "no",
                " | udp://",
                status.udpHost,
                ":",
                status.udpPort
              ] }),
              error && /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "text-red-400 text-xs", children: error })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "flex justify-end gap-2 mt-6", children: [
              /* @__PURE__ */ jsxRuntimeExports$1.jsx(
                "button",
                {
                  type: "button",
                  onClick: onClose,
                  className: "px-3 py-1.5 text-xs text-gray-400 hover:text-white hover:bg-[#252628] rounded-md transition-colors",
                  children: "Cancel"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports$1.jsx(
                "button",
                {
                  type: "button",
                  onClick: () => void apply(),
                  disabled: busy,
                  className: "px-3 py-1.5 text-xs bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white rounded-md transition-colors",
                  children: busy ? "Applying..." : "Apply"
                }
              )
            ] })
          ]
        }
      )
    }
  );
};
var reactDomExports = requireReactDom();
const UI_SETTINGS = {
  tooltip: {
    fontSizePx: 18
  }
};
const TooltipContext = reactExports$1.createContext(null);
const formatTelemetryTooltip = (description, frameVariables) => {
  if (!(frameVariables == null ? void 0 : frameVariables.length)) return description;
  return `${description}

Переменные фрейма:
${frameVariables.join("\n")}`;
};
const InstrumentTooltipProvider = ({ children }) => {
  const containerRef = reactExports$1.useRef(null);
  const [tooltip, setTooltip] = reactExports$1.useState(null);
  const getPosition = reactExports$1.useCallback((event) => {
    return {
      x: event.clientX + 14,
      y: event.clientY + 14
    };
  }, []);
  const value = reactExports$1.useMemo(() => ({
    showTooltip: (text, event) => setTooltip({ text, ...getPosition(event) }),
    moveTooltip: (event) => {
      setTooltip((current) => current ? { ...current, ...getPosition(event) } : current);
    },
    hideTooltip: () => setTooltip(null)
  }), [getPosition]);
  return /* @__PURE__ */ jsxRuntimeExports$1.jsx(TooltipContext.Provider, { value, children: /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { ref: containerRef, className: "relative w-full h-full", children: [
    children,
    tooltip && reactDomExports.createPortal(
      /* @__PURE__ */ jsxRuntimeExports$1.jsx(
        "div",
        {
          className: "fixed max-w-[min(560px,calc(100vw-16px))] whitespace-pre-wrap rounded-md border border-emerald-400/40 bg-black/90 px-3 py-2 text-left font-mono leading-tight text-white shadow-2xl pointer-events-none z-[9999]",
          style: {
            left: tooltip.x,
            top: tooltip.y,
            fontSize: UI_SETTINGS.tooltip.fontSizePx,
            transform: [
              tooltip.x > window.innerWidth * 0.65 ? "translateX(-100%)" : "",
              tooltip.y > window.innerHeight * 0.65 ? "translateY(-100%)" : ""
            ].filter(Boolean).join(" ") || void 0
          },
          children: tooltip.text
        }
      ),
      document.body
    )
  ] }) });
};
const SvgTooltipGroup = ({
  description,
  frameVariables,
  children,
  className,
  transform,
  clipPath
}) => {
  const tooltip = reactExports$1.useContext(TooltipContext);
  const text = formatTelemetryTooltip(description, frameVariables);
  return /* @__PURE__ */ jsxRuntimeExports$1.jsx(
    "g",
    {
      className,
      transform,
      clipPath,
      onMouseEnter: (event) => tooltip == null ? void 0 : tooltip.showTooltip(text, event),
      onMouseMove: (event) => tooltip == null ? void 0 : tooltip.moveTooltip(event),
      onMouseLeave: () => tooltip == null ? void 0 : tooltip.hideTooltip(),
      children
    }
  );
};
const SplitContainer = ({ direction, ratio, onRatioChange, children }) => {
  const containerRef = reactExports$1.useRef(null);
  const handlePointerDown = (e) => {
    e.preventDefault();
    const container = containerRef.current;
    if (!container) return;
    const startRect = container.getBoundingClientRect();
    const isVertical2 = direction === "vertical";
    const onPointerMove = (ev) => {
      let nextRatio = ratio;
      if (isVertical2) {
        const offset = ev.clientX - startRect.left;
        nextRatio = offset / startRect.width;
      } else {
        const offset = ev.clientY - startRect.top;
        nextRatio = offset / startRect.height;
      }
      nextRatio = Math.max(0.05, Math.min(nextRatio, 0.95));
      onRatioChange(nextRatio);
    };
    const onPointerUp = () => {
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerup", onPointerUp);
    };
    document.addEventListener("pointermove", onPointerMove);
    document.addEventListener("pointerup", onPointerUp);
  };
  const isVertical = direction === "vertical";
  return /* @__PURE__ */ jsxRuntimeExports$1.jsxs(
    "div",
    {
      ref: containerRef,
      className: `w-full h-full flex ${isVertical ? "flex-row" : "flex-col"} overflow-hidden relative`,
      children: [
        /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { style: { flex: `${ratio * 100} 1 0%` }, className: "overflow-hidden min-w-0 min-h-0", children: children[0] }),
        /* @__PURE__ */ jsxRuntimeExports$1.jsx(
          "div",
          {
            className: `group flex items-center justify-center z-10 flex-shrink-0 transition-all bg-[#0a0a0f]
          ${isVertical ? "w-2 h-full cursor-col-resize hover:bg-[#1e1f21]" : "h-2 w-full cursor-row-resize hover:bg-[#1e1f21]"}
        `,
            onPointerDown: handlePointerDown,
            children: /* @__PURE__ */ jsxRuntimeExports$1.jsx(
              "div",
              {
                className: `bg-[#2d2e30] group-hover:bg-blue-500 transition-colors ${isVertical ? "w-[1px] h-full" : "h-[1px] w-full"}`
              }
            )
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports$1.jsx(
          "div",
          {
            style: { flex: `${(1 - ratio) * 100} 1 0%` },
            className: "overflow-hidden min-w-0 min-h-0",
            children: children[1]
          }
        )
      ]
    }
  );
};
const PanelMenuContext = reactExports$1.createContext(null);
const DEFAULT_MENU = {
  items: []
};
const PanelMenuProvider = ({ menu, actions, children }) => {
  const runAction = reactExports$1.useCallback(
    (action) => {
      const handler = actions[action];
      if (handler) {
        handler();
        return;
      }
      console.warn(`Unknown panel menu action: ${action}`);
    },
    [actions]
  );
  const value = reactExports$1.useMemo(
    () => {
      var _a;
      return {
        items: ((_a = menu == null ? void 0 : menu.items) == null ? void 0 : _a.length) ? menu.items : DEFAULT_MENU.items,
        runAction
      };
    },
    [menu, runAction]
  );
  return /* @__PURE__ */ jsxRuntimeExports$1.jsx(PanelMenuContext.Provider, { value, children });
};
const usePanelMenu = () => {
  const ctx = reactExports$1.useContext(PanelMenuContext);
  if (!ctx) {
    throw new Error("usePanelMenu must be used within PanelMenuProvider");
  }
  return ctx;
};
const PanelCommandMenu = () => {
  const { items, runAction } = usePanelMenu();
  const [open, setOpen] = reactExports$1.useState(false);
  const rootRef = reactExports$1.useRef(null);
  reactExports$1.useEffect(() => {
    if (!open) return;
    const onPointerDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const onKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("mousedown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);
  if (!items.length) return null;
  return /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { ref: rootRef, className: "relative", children: [
    /* @__PURE__ */ jsxRuntimeExports$1.jsx(
      "button",
      {
        type: "button",
        className: "p-1 hover:bg-[#252628] rounded-sm text-gray-400 hover:text-white transition-colors ml-1",
        title: "Panel commands",
        "aria-haspopup": "menu",
        "aria-expanded": open,
        onClick: (e) => {
          e.stopPropagation();
          setOpen((prev) => !prev);
        },
        children: /* @__PURE__ */ jsxRuntimeExports$1.jsx("span", { className: "block w-[14px] text-center text-[14px] leading-none font-bold tracking-widest", children: "..." })
      }
    ),
    open && /* @__PURE__ */ jsxRuntimeExports$1.jsx(
      "div",
      {
        role: "menu",
        className: "absolute top-full right-0 mt-1 min-w-[220px] py-1 bg-[#292a2d] border border-[#3c4043] rounded-lg shadow-xl z-50",
        onClick: (e) => e.stopPropagation(),
        children: items.map(
          (item, index) => item.type === "separator" ? /* @__PURE__ */ jsxRuntimeExports$1.jsx(
            "div",
            {
              role: "separator",
              className: "my-1 border-t border-[#3c4043]"
            },
            `sep-${index}`
          ) : /* @__PURE__ */ jsxRuntimeExports$1.jsx(
            "button",
            {
              type: "button",
              role: "menuitem",
              className: "w-full px-4 py-2 text-left text-[13px] text-[#e8eaed] hover:bg-[#3c4043] transition-colors",
              onClick: () => {
                setOpen(false);
                runAction(item.action);
              },
              children: item.label
            },
            `${item.action}-${index}`
          )
        )
      }
    )
  ] });
};
const GHOST_SIZE = 64;
function createGhost(widgetId) {
  const ghost = document.createElement("div");
  ghost.style.cssText = [
    "position:fixed",
    "pointer-events:none",
    "z-index:99999",
    `width:${GHOST_SIZE}px`,
    `height:${GHOST_SIZE}px`,
    "background:rgba(37,38,40,0.95)",
    "border:2px solid #3b82f6",
    "border-radius:8px",
    "display:flex",
    "flex-direction:column",
    "align-items:center",
    "justify-content:center",
    "gap:4px",
    "box-shadow:0 8px 32px rgba(59,130,246,0.3)",
    "transform:translate(-50%,-50%) scale(0.9)",
    "transition:transform 0.1s",
    "opacity:0.92"
  ].join(";");
  const label = document.createElement("span");
  label.textContent = widgetId;
  label.style.cssText = "font-size:8px;color:#60a5fa;text-transform:uppercase;font-weight:bold;letter-spacing:1px;";
  ghost.appendChild(label);
  return ghost;
}
function destroyGhost() {
  if (window.__touchDragState) {
    window.__touchDragState.ghost.remove();
    window.__touchDragState = void 0;
  }
}
function findDropZoneOrWidget(x, y) {
  const elements = document.elementsFromPoint(x, y);
  for (const el of elements) {
    if (el instanceof HTMLElement && el.dataset.dropWidget !== void 0) {
      return el;
    }
  }
  for (const el of elements) {
    if (el instanceof HTMLElement && el.dataset.dropZone === "true") {
      return el;
    }
  }
  return null;
}
function useSidebarTouchDrag() {
  const onTouchStart = (e, widgetId) => {
    if (window.__touchDragState) destroyGhost();
    const touch = e.touches[0];
    if (!touch) return;
    const ghost = createGhost(widgetId);
    ghost.style.left = `${touch.clientX}px`;
    ghost.style.top = `${touch.clientY}px`;
    document.body.appendChild(ghost);
    window.__touchDragState = { widgetId, ghost };
    const handleTouchMove = (ev) => {
      ev.preventDefault();
      const t = ev.touches[0];
      if (!t || !window.__touchDragState) return;
      window.__touchDragState.ghost.style.left = `${t.clientX}px`;
      window.__touchDragState.ghost.style.top = `${t.clientY}px`;
      const zone = findDropZoneOrWidget(t.clientX, t.clientY);
      document.querySelectorAll('[data-drop-zone="true"]').forEach((z) => {
        if (z instanceof HTMLElement) {
          z.style.outline = z === zone ? "2px solid #3b82f6" : "";
          z.style.outlineOffset = z === zone ? "-2px" : "";
        }
      });
    };
    const handleTouchEnd = (ev) => {
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
      document.removeEventListener("touchcancel", handleTouchEnd);
      document.querySelectorAll('[data-drop-zone="true"]').forEach((z) => {
        if (z instanceof HTMLElement) {
          z.style.outline = "";
          z.style.outlineOffset = "";
        }
      });
      if (!window.__touchDragState) return;
      const changedTouch = ev.changedTouches[0];
      if (!changedTouch) {
        destroyGhost();
        return;
      }
      const zone = findDropZoneOrWidget(changedTouch.clientX, changedTouch.clientY);
      if (zone) {
        const dropEvent = new CustomEvent("touchdrop", {
          bubbles: true,
          cancelable: true,
          detail: { widgetId: window.__touchDragState.widgetId }
        });
        zone.dispatchEvent(dropEvent);
      }
      destroyGhost();
    };
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleTouchEnd);
    document.addEventListener("touchcancel", handleTouchEnd);
  };
  return { onTouchStart };
}
function usePanelCanvasTouchDrop(ref, onDrop) {
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handleTouchDrop = (e) => {
      const detail = e.detail;
      if (detail == null ? void 0 : detail.widgetId) {
        onDrop(detail.widgetId);
      }
    };
    el.addEventListener("touchdrop", handleTouchDrop);
    return () => {
      el.removeEventListener("touchdrop", handleTouchDrop);
    };
  }, [ref, onDrop]);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handleDrop = (e) => {
      var _a, _b;
      e.preventDefault();
      e.stopPropagation();
      const widgetId = ((_a = e.dataTransfer) == null ? void 0 : _a.getData("panelkit/widgetId")) || ((_b = e.dataTransfer) == null ? void 0 : _b.getData("instrumentId"));
      if (widgetId) {
        onDrop(widgetId);
      }
    };
    const handleDragOver = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer) e.dataTransfer.dropEffect = "copy";
    };
    el.addEventListener("drop", handleDrop);
    el.addEventListener("dragover", handleDragOver);
    return () => {
      el.removeEventListener("drop", handleDrop);
      el.removeEventListener("dragover", handleDragOver);
    };
  }, [ref, onDrop]);
}
const newId = () => Math.random().toString(36).substring(2, 9);
const PanelCanvas = ({
  node,
  onChange,
  onRemoveNode,
  isRoot,
  data,
  renderWidget
}) => {
  const canvasRef = reactExports$1.useRef(null);
  const clearRef = reactExports$1.useRef(() => {
  });
  clearRef.current = () => onChange({ ...node, type: "empty", widgetId: void 0 });
  usePanelCanvasTouchDrop(canvasRef, (widgetId) => {
    if (node.type === "empty" || node.type === "widget" && !node.widgetId) {
      onChange({ ...node, type: "widget", widgetId });
    } else if (node.type === "widget" && node.widgetId) {
      onChange({ ...node, widgetId });
    }
    if (window.__panelMoveSource) {
      const moveSource = window.__panelMoveSource;
      window.__panelMoveSource = void 0;
      setTimeout(() => moveSource.clearSource(), 0);
    }
  });
  const handleDragStart = (e) => {
    e.dataTransfer.setData("panelkit/widgetId", node.widgetId);
    e.dataTransfer.setData("instrumentId", node.widgetId);
    e.dataTransfer.effectAllowed = "copyMove";
    window.__panelMoveSource = {
      widgetId: node.widgetId,
      clearSource: () => clearRef.current()
    };
  };
  const handleDragEnd = () => {
    window.__panelMoveSource = void 0;
  };
  if (node.type === "split" && node.children) {
    return /* @__PURE__ */ jsxRuntimeExports$1.jsxs(
      SplitContainer,
      {
        direction: node.splitDirection,
        ratio: node.splitRatio ?? 0.5,
        onRatioChange: (nextRatio) => onChange({ ...node, splitRatio: nextRatio }),
        children: [
          /* @__PURE__ */ jsxRuntimeExports$1.jsx(
            PanelCanvas,
            {
              node: node.children[0],
              onChange: (child) => onChange({ ...node, children: [child, node.children[1]] }),
              onRemoveNode: () => onChange(node.children[1]),
              data,
              renderWidget
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx(
            PanelCanvas,
            {
              node: node.children[1],
              onChange: (child) => onChange({ ...node, children: [node.children[0], child] }),
              onRemoveNode: () => onChange(node.children[0]),
              data,
              renderWidget
            }
          )
        ]
      }
    );
  }
  const handleSplit = (direction) => {
    onChange({
      id: node.id,
      type: "split",
      splitDirection: direction,
      splitRatio: 0.5,
      children: [
        { id: newId(), type: node.type, widgetId: node.widgetId },
        { id: newId(), type: "empty" }
      ]
    });
  };
  const isWidget = node.type === "widget" && !!node.widgetId;
  const isDraggable = isWidget && node.widgetId !== "aircraft-3d";
  return /* @__PURE__ */ jsxRuntimeExports$1.jsxs(
    "div",
    {
      ref: canvasRef,
      "data-drop-zone": "true",
      "data-drop-widget": isWidget ? "" : void 0,
      draggable: isDraggable,
      onDragStart: isDraggable ? handleDragStart : void 0,
      onDragEnd: isDraggable ? handleDragEnd : void 0,
      className: `w-full h-full relative group flex flex-col items-center justify-center
        ${node.type === "empty" ? "border-2 border-dashed border-blue-500/20 bg-blue-500/5 hover:border-blue-500/40 cursor-pointer" : "bg-[#161719] border border-[#2d2e30]"}
        ${isDraggable ? "cursor-grab active:cursor-grabbing" : ""}`,
      children: [
        /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "absolute top-1 right-1 hidden group-hover:flex space-x-1 z-20 bg-[#161719] rounded-sm p-1 shadow-lg border border-[#2d2e30]", children: [
          /* @__PURE__ */ jsxRuntimeExports$1.jsx(
            "button",
            {
              className: "p-1 hover:bg-[#252628] rounded-sm text-gray-400 hover:text-white transition-colors",
              title: "Split Vertically (Left/Right)",
              onClick: (e) => {
                e.stopPropagation();
                handleSplit("vertical");
              },
              children: /* @__PURE__ */ jsxRuntimeExports$1.jsx(LayoutPanelLeft, { size: 14 })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx(
            "button",
            {
              className: "p-1 hover:bg-[#252628] rounded-sm text-gray-400 hover:text-white transition-colors",
              title: "Split Horizontally (Top/Bottom)",
              onClick: (e) => {
                e.stopPropagation();
                handleSplit("horizontal");
              },
              children: /* @__PURE__ */ jsxRuntimeExports$1.jsx(LayoutPanelTop, { size: 14 })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx(PanelCommandMenu, {}),
          !isRoot && /* @__PURE__ */ jsxRuntimeExports$1.jsx(
            "button",
            {
              className: "p-1 hover:bg-red-900/50 rounded-sm text-red-500 hover:text-red-400 transition-colors ml-1",
              title: "Remove Panel",
              onClick: (e) => {
                e.stopPropagation();
                onRemoveNode();
              },
              children: /* @__PURE__ */ jsxRuntimeExports$1.jsxs(
                "svg",
                {
                  xmlns: "http://www.w3.org/2000/svg",
                  width: "14",
                  height: "14",
                  viewBox: "0 0 24 24",
                  fill: "none",
                  stroke: "currentColor",
                  strokeWidth: "2",
                  strokeLinecap: "round",
                  strokeLinejoin: "round",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports$1.jsx("path", { d: "M18 6 6 18" }),
                    /* @__PURE__ */ jsxRuntimeExports$1.jsx("path", { d: "m6 6 12 12" })
                  ]
                }
              )
            }
          )
        ] }),
        isWidget ? /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "w-full h-full", children: renderWidget(
          node,
          () => onChange({ ...node, type: "empty", widgetId: void 0 }),
          data
        ) }) : /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "flex flex-col items-center justify-center w-full h-full text-gray-500 pointer-events-none gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "flex gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "w-6 h-6 border border-gray-600 flex items-center justify-center text-xs", children: "+H" }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "w-6 h-6 border border-gray-600 flex items-center justify-center text-xs", children: "+V" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("span", { className: "text-[9px] uppercase tracking-tighter hover:text-blue-400", children: "Drop Widget or Split" })
        ] })
      ]
    }
  );
};
const Sidebar = ({ items, getIcon }) => {
  const { onTouchStart } = useSidebarTouchDrag();
  const handleDragStart = (e, id) => {
    e.dataTransfer.setData("panelkit/widgetId", id);
    e.dataTransfer.setData("instrumentId", id);
    e.dataTransfer.effectAllowed = "copy";
  };
  return /* @__PURE__ */ jsxRuntimeExports$1.jsxs("aside", { className: "w-56 bg-[#161719] border-l border-[#2d2e30] flex flex-col z-20", children: [
    /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "p-3 border-b border-[#2d2e30]", children: /* @__PURE__ */ jsxRuntimeExports$1.jsx("h2", { className: "text-[10px] font-bold text-gray-400 uppercase tracking-widest", children: "Library" }) }),
    /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "flex-1 p-2 grid grid-cols-2 gap-2 content-start overflow-y-auto", children: items.map((item) => {
      const Icon2 = getIcon(item.iconName);
      return /* @__PURE__ */ jsxRuntimeExports$1.jsxs(
        "div",
        {
          draggable: true,
          onDragStart: (e) => handleDragStart(e, item.id),
          onTouchStart: (e) => onTouchStart(e, item.id),
          className: "aspect-square bg-[#252628] border border-[#2d2e30] flex flex-col items-center justify-center gap-1 cursor-grab active:cursor-grabbing hover:bg-[#2d2e30] transition-colors group select-none touch-none",
          children: [
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "text-gray-400 group-hover:text-blue-400 transition-colors flex items-center justify-center h-8", children: /* @__PURE__ */ jsxRuntimeExports$1.jsx(Icon2, { size: 20, className: "stroke-2" }) }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("span", { className: "text-[8px] uppercase text-gray-400 group-hover:text-gray-200 transition-colors text-center w-full truncate px-1", children: item.name })
          ]
        },
        item.id
      );
    }) }),
    /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "mt-auto border-t border-[#2d2e30] p-3 bg-[#0a0a0f]", children: [
      /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "text-[9px] text-gray-500 leading-tight uppercase", children: [
        "Nodes: ",
        /* @__PURE__ */ jsxRuntimeExports$1.jsxs("span", { className: "text-blue-400 text-xs font-mono", children: [
          items.length,
          " Elements"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "mt-3 flex gap-2 items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "flex-1 h-1 bg-[#2d2e30]", children: /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "w-[45%] h-full bg-blue-500" }) }),
        /* @__PURE__ */ jsxRuntimeExports$1.jsx("span", { className: "text-[8px] text-gray-600", children: "SYS_RDY" })
      ] })
    ] })
  ] });
};
const PANELKIT_ICONS = {
  Gauge,
  Activity,
  Navigation,
  Compass,
  Zap,
  Crosshair,
  Thermometer,
  Wind,
  Clock,
  Mountain,
  TrendingUp,
  Cog,
  Plane,
  CircleDot
};
const getPanelKitIcon = (iconName) => {
  return PANELKIT_ICONS[iconName] ?? Gauge;
};
const registry = /* @__PURE__ */ new Map();
const registerPanelKitWidget = (widget) => {
  registry.set(widget.id, widget);
};
const getRegisteredPanelKitWidget = (id) => registry.get(id);
const getAllRegisteredPanelKitWidgets = () => Array.from(registry.values());
const isPanelKitMenuConfig = (value) => {
  if (!value || typeof value !== "object") return false;
  const items = value.items;
  if (!Array.isArray(items)) return false;
  return items.every((item) => {
    if (!item || typeof item !== "object") return false;
    if (item.type === "separator") return true;
    if (item.type === "item") {
      return typeof item.label === "string" && typeof item.action === "string";
    }
    return false;
  });
};
const AviationWidget = ({ widgetId, frame, onRemove, readOnly = false }) => {
  const registered = getRegisteredPanelKitWidget(widgetId);
  if (!registered) {
    return /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "w-full h-full flex flex-col items-center justify-center text-red-500 relative group bg-[#161719]", children: [
      !readOnly && /* @__PURE__ */ jsxRuntimeExports$1.jsx(
        "button",
        {
          onClick: (e) => {
            e.stopPropagation();
            onRemove();
          },
          className: "absolute top-1 right-1 opacity-0 group-hover:opacity-100 bg-red-900/80 hover:bg-red-800 text-white rounded-sm p-1 flex items-center justify-center transition-all z-20",
          title: "Remove Widget",
          children: /* @__PURE__ */ jsxRuntimeExports$1.jsxs(
            "svg",
            {
              xmlns: "http://www.w3.org/2000/svg",
              width: "12",
              height: "12",
              viewBox: "0 0 24 24",
              fill: "none",
              stroke: "currentColor",
              strokeWidth: "2",
              strokeLinecap: "round",
              strokeLinejoin: "round",
              children: [
                /* @__PURE__ */ jsxRuntimeExports$1.jsx("path", { d: "M18 6 6 18" }),
                /* @__PURE__ */ jsxRuntimeExports$1.jsx("path", { d: "m6 6 12 12" })
              ]
            }
          )
        }
      ),
      "Unknown Widget"
    ] });
  }
  const Icon2 = getPanelKitIcon(registered.iconName);
  const WidgetComponent = registered.Component;
  const showLive = !!frame && !!WidgetComponent;
  return /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "w-full h-full relative group min-h-[100px] overflow-hidden bg-[#161719] flex flex-col items-center justify-center text-center", children: [
    !readOnly && /* @__PURE__ */ jsxRuntimeExports$1.jsx(
      "button",
      {
        onClick: (e) => {
          e.stopPropagation();
          onRemove();
        },
        className: "absolute top-1 right-1 opacity-0 group-hover:opacity-100 bg-red-900/80 hover:bg-red-800 text-white rounded-sm p-1 flex items-center justify-center transition-all z-30",
        title: "Remove Widget",
        children: /* @__PURE__ */ jsxRuntimeExports$1.jsxs(
          "svg",
          {
            xmlns: "http://www.w3.org/2000/svg",
            width: "12",
            height: "12",
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            strokeWidth: "2",
            strokeLinecap: "round",
            strokeLinejoin: "round",
            children: [
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("path", { d: "M18 6 6 18" }),
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("path", { d: "m6 6 12 12" })
            ]
          }
        )
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "absolute top-2 left-2 text-[9px] font-mono bg-black/60 px-1 text-gray-400 border border-[#2d2e30] z-20 pointer-events-none", children: [
      "WIDGET_",
      registered.id.toUpperCase()
    ] }),
    showLive ? /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "absolute inset-0 w-full h-full", children: /* @__PURE__ */ jsxRuntimeExports$1.jsx(InstrumentTooltipProvider, { children: /* @__PURE__ */ jsxRuntimeExports$1.jsx(WidgetComponent, { frame }) }) }) : /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "w-full h-full flex flex-col items-center justify-center p-2", children: [
      /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "text-white mb-2 relative z-10", children: /* @__PURE__ */ jsxRuntimeExports$1.jsx(
        Icon2,
        {
          size: 48,
          className: "stroke-1 text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]"
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "text-[10px] text-gray-500 uppercase font-mono tracking-wider mt-1 z-10", children: registered.name }),
      /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "absolute inset-0 flex items-center justify-center pointer-events-none opacity-10", children: [
        /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "w-48 h-[1px] bg-white" }),
        /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "h-48 w-[1px] bg-white absolute" })
      ] })
    ] })
  ] });
};
const CURRENT_CONFIG_API$1 = "/api/panel/config/current";
const PANEL_MENU_API = "/api/panel/menu";
const CURRENT_CONFIG_FILE_NAME = "panel-config-current.json";
const createEmptyRoot = () => ({ id: "root", type: "empty" });
const normalizePanelNode = (value) => {
  if (!value || typeof value !== "object") return null;
  const node = value;
  if (typeof node.id !== "string" || typeof node.type !== "string") return null;
  if (node.type === "empty") {
    return { id: node.id, type: "empty" };
  }
  if (node.type === "instrument" || node.type === "widget") {
    const widgetId = typeof node.widgetId === "string" ? node.widgetId : typeof node.instrumentId === "string" ? node.instrumentId : void 0;
    return {
      id: node.id,
      type: widgetId ? "widget" : "empty",
      widgetId
    };
  }
  if (node.type === "split") {
    if (!Array.isArray(node.children) || node.children.length !== 2) return null;
    const first = normalizePanelNode(node.children[0]);
    const second = normalizePanelNode(node.children[1]);
    if (!first || !second) return null;
    return {
      id: node.id,
      type: "split",
      splitDirection: node.splitDirection === "horizontal" ? "horizontal" : "vertical",
      splitRatio: typeof node.splitRatio === "number" ? node.splitRatio : 0.5,
      children: [first, second]
    };
  }
  return null;
};
const toLegacyPanelNode = (node) => {
  if (node.type === "split" && node.children) {
    return {
      id: node.id,
      type: "split",
      splitDirection: node.splitDirection ?? "vertical",
      splitRatio: node.splitRatio ?? 0.5,
      children: [toLegacyPanelNode(node.children[0]), toLegacyPanelNode(node.children[1])]
    };
  }
  if (node.type === "widget") {
    return {
      id: node.id,
      type: "instrument",
      instrumentId: node.widgetId
    };
  }
  return { id: node.id, type: "empty" };
};
const TelemetryContext = reactExports$1.createContext({ frame: null });
const TelemetryProvider = ({ frame, children }) => /* @__PURE__ */ jsxRuntimeExports$1.jsx(TelemetryContext.Provider, { value: { frame }, children });
const useTelemetry = () => reactExports$1.useContext(TelemetryContext);
function AttitudeIndicator({ frame }) {
  const cx = 400, cy = 300;
  const finiteNumber2 = (value) => typeof value === "number" && Number.isFinite(value) ? value : null;
  const pitch = frame.PitchAngle ?? 0;
  const roll = frame.RollAngle ?? 0;
  const valid = Number.isFinite(pitch) && Number.isFinite(roll);
  if (!valid) return null;
  const pitchScale = 6;
  const yTranslate = pitch * pitchScale;
  const radioAlt = finiteNumber2(frame.RadioAltitude) ?? finiteNumber2(frame.dec_RadioAltFt) ?? 0;
  const fdPitch = frame.FD_PitchCmd ?? null;
  const fdRoll = frame.FD_RollCmd ?? null;
  const SKY = "#316499";
  const GND = "#603c15";
  const renderPitchLadder = () => {
    const ticks = [];
    for (let p = -90; p <= 90; p += 5) {
      if (p === 0) continue;
      const y = -p * pitchScale;
      const isMajor = p % 10 === 0;
      if (isMajor) {
        ticks.push(
          /* @__PURE__ */ jsxRuntimeExports$1.jsxs("g", { transform: `translate(0, ${y})`, children: [
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: "-35", y1: "0", x2: "-20", y2: "0", stroke: "white", strokeWidth: "2" }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: "20", y1: "0", x2: "35", y2: "0", stroke: "white", strokeWidth: "2" }),
            p === 10 || p === 20 || p === -10 || p === -20 ? /* @__PURE__ */ jsxRuntimeExports$1.jsxs(jsxRuntimeExports$1.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: "-35", y1: "0", x2: "-35", y2: p > 0 ? 8 : -8, stroke: "white", strokeWidth: "2" }),
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: "35", y1: "0", x2: "35", y2: p > 0 ? 8 : -8, stroke: "white", strokeWidth: "2" })
            ] }) : null,
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "-42", y: "6", fill: "white", fontSize: "18", textAnchor: "end", fontFamily: "sans-serif", children: Math.abs(p) }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "42", y: "6", fill: "white", fontSize: "18", textAnchor: "start", fontFamily: "sans-serif", children: Math.abs(p) })
          ] }, p)
        );
      } else {
        ticks.push(/* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: "-10", y1: -p * pitchScale, x2: "10", y2: -p * pitchScale, stroke: "white", strokeWidth: "2" }, p));
      }
    }
    return ticks;
  };
  const renderRollScaleTicks = () => {
    return [-60, -45, -30, -20, -10, 10, 20, 30, 45, 60].map((angle) => {
      let tick;
      if (Math.abs(angle) === 10 || Math.abs(angle) === 20) {
        tick = /* @__PURE__ */ jsxRuntimeExports$1.jsx("polygon", { points: "0,-160 -5,-150 5,-150", fill: "none", stroke: "white", strokeWidth: "2" });
      } else if (Math.abs(angle) === 30 || Math.abs(angle) === 60) {
        tick = /* @__PURE__ */ jsxRuntimeExports$1.jsx("polygon", { points: "0,-160 -8,-142 8,-142", fill: "none", stroke: "white", strokeWidth: "2" });
      } else if (Math.abs(angle) === 45) {
        tick = /* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: "0", y1: "-160", x2: "0", y2: "-145", stroke: "white", strokeWidth: "2" });
      }
      return /* @__PURE__ */ jsxRuntimeExports$1.jsx("g", { transform: `rotate(${angle})`, children: tick }, angle);
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports$1.jsxs("g", { transform: `translate(${cx}, ${cy})`, children: [
    /* @__PURE__ */ jsxRuntimeExports$1.jsx("defs", { children: /* @__PURE__ */ jsxRuntimeExports$1.jsx("clipPath", { id: "att-clip", children: /* @__PURE__ */ jsxRuntimeExports$1.jsx("circle", { cx: "0", cy: "0", r: "160" }) }) }),
    /* @__PURE__ */ jsxRuntimeExports$1.jsx("g", { clipPath: "url(#att-clip)", children: /* @__PURE__ */ jsxRuntimeExports$1.jsxs(
      SvgTooltipGroup,
      {
        transform: `rotate(${-roll}) translate(0, ${yTranslate})`,
        description: "Авиагоризонт — положение самолёта относительно горизонта. Синий = небо, коричневый = земля.",
        frameVariables: ["PitchAngle", "RollAngle"],
        children: [
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("rect", { x: "-250", y: "-300", width: "500", height: "600", fill: SKY }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("rect", { x: "-250", y: "0", width: "500", height: "300", fill: GND }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: "-250", y1: "0", x2: "250", y2: "0", stroke: "white", strokeWidth: "2" }),
          renderPitchLadder()
        ]
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports$1.jsxs(
      SvgTooltipGroup,
      {
        description: "Шкала крена — угол наклона на левое/правое крыло в градусах.",
        frameVariables: ["RollAngle"],
        children: [
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("path", { d: `M ${-160 * Math.sin(60 * Math.PI / 180)} ${-160 * Math.cos(60 * Math.PI / 180)} A 160 160 0 0 1 ${160 * Math.sin(60 * Math.PI / 180)} ${-160 * Math.cos(60 * Math.PI / 180)}`, fill: "none", stroke: "white", strokeWidth: "2" }),
          renderRollScaleTicks()
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports$1.jsx(SvgTooltipGroup, { description: "Жёлтый неподвижный маркер нулевого крена на шкале авиагоризонта.", children: /* @__PURE__ */ jsxRuntimeExports$1.jsx("polygon", { points: "0,-160 -10,-140 10,-140", fill: "none", stroke: "#FFEA00", strokeWidth: "3" }) }),
    /* @__PURE__ */ jsxRuntimeExports$1.jsx(
      SvgTooltipGroup,
      {
        transform: `rotate(${-roll})`,
        description: "Жёлтый указатель текущего крена. Красный крест — индикатор бокового скольжения.",
        frameVariables: ["RollAngle"],
        children: /* @__PURE__ */ jsxRuntimeExports$1.jsxs("g", { transform: "translate(0, -140)", children: [
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("polygon", { points: "0,0 -12,18 12,18", fill: "none", stroke: "#FFEA00", strokeWidth: "3" }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: "-25", y1: "18", x2: "25", y2: "18", stroke: "#FFEA00", strokeWidth: "3" }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("path", { d: "M-10,-5 L10,12 M-10,12 L10,-5", stroke: "red", strokeWidth: "3", opacity: "0.8" })
        ] })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports$1.jsx("path", { d: "M -160 0 L -175 -8 L -175 8 Z", fill: "none", stroke: "white", strokeWidth: "2" }),
    /* @__PURE__ */ jsxRuntimeExports$1.jsx("path", { d: "M 160 0 L 175 -8 L 175 8 Z", fill: "none", stroke: "white", strokeWidth: "2" }),
    /* @__PURE__ */ jsxRuntimeExports$1.jsxs(
      SvgTooltipGroup,
      {
        description: "Flight Director — команды автопилота: вертикальная линия = крен, горизонтальная линия = тангаж.",
        frameVariables: ["FD_PitchCmd", "FD_RollCmd"],
        children: [
          fdRoll !== null && /* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: "-100", y1: "0", x2: "100", y2: "0", stroke: "#00FF00", strokeWidth: "1.5" }),
          fdPitch !== null && /* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: "0", y1: "-100", x2: "0", y2: "100", stroke: "#00FF00", strokeWidth: "1.5" })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports$1.jsxs(SvgTooltipGroup, { description: "Символ самолёта — неподвижная точка отсчёта пространственного положения ЛА.", children: [
      /* @__PURE__ */ jsxRuntimeExports$1.jsx("path", { d: "M -130 0 L -40 0 L -40 18 L -25 18 L -25 4 L -130 4 Z", fill: "black", stroke: "#FFEA00", strokeWidth: "2" }),
      /* @__PURE__ */ jsxRuntimeExports$1.jsx("path", { d: "M 130 0 L 40 0 L 40 18 L 25 18 L 25 4 L 130 4 Z", fill: "black", stroke: "#FFEA00", strokeWidth: "2" }),
      /* @__PURE__ */ jsxRuntimeExports$1.jsx("rect", { x: "-5", y: "-5", width: "10", height: "10", fill: "black", stroke: "#FFEA00", strokeWidth: "2" })
    ] }),
    Number.isFinite(radioAlt) && /* @__PURE__ */ jsxRuntimeExports$1.jsxs(
      SvgTooltipGroup,
      {
        transform: "translate(0, 160)",
        description: "Радиовысотомер (Radio Altimeter) — высота над поверхностью земли в футах.",
        frameVariables: ["RadioAltitude", "dec_RadioAltFt"],
        children: [
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("rect", { x: "-40", y: "-18", width: "80", height: "30", fill: "black" }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "0", y: "5", fill: "#00FF00", fontSize: "24", fontWeight: "bold", textAnchor: "middle", fontFamily: "sans-serif", children: Math.round(radioAlt) })
        ]
      }
    )
  ] });
}
function AirspeedTape({ frame }) {
  const TAPE_COLOR = "#818181";
  const speed = frame.CAS ?? 207.8;
  const valid = Number.isFinite(frame.CAS);
  const selectedSpeed = frame.SpeedSelect ?? null;
  const pxPerKnot = 4.5;
  const renderTicks = () => {
    const ticks = [];
    const minS = Math.floor(speed / 10) * 10 - 50;
    const maxS = Math.floor(speed / 10) * 10 + 50;
    for (let s = minS; s <= maxS; s += 10) {
      if (s < 0) continue;
      const y = (speed - s) * pxPerKnot;
      ticks.push(
        /* @__PURE__ */ jsxRuntimeExports$1.jsxs("g", { transform: `translate(0, ${y})`, children: [
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: "205", y1: "0", x2: "195", y2: "0", stroke: "white", strokeWidth: "2" }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "187", y: "7", fill: "white", fontSize: "22", textAnchor: "end", fontFamily: "sans-serif", children: s }),
          s + 5 <= maxS && /* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: "205", y1: -5 * pxPerKnot, x2: "200", y2: -5 * pxPerKnot, stroke: "white", strokeWidth: "2" })
        ] }, s)
      );
    }
    return ticks;
  };
  return /* @__PURE__ */ jsxRuntimeExports$1.jsxs("g", { children: [
    /* @__PURE__ */ jsxRuntimeExports$1.jsxs(
      SvgTooltipGroup,
      {
        description: "Лента приборной скорости — CAS (Calibrated Airspeed), узлы.",
        frameVariables: ["CAS"],
        children: [
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("rect", { x: "150", y: "60", width: "55", height: "460", fill: TAPE_COLOR }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("clipPath", { id: "air-clip", children: /* @__PURE__ */ jsxRuntimeExports$1.jsx("rect", { x: "150", y: "60", width: "55", height: "460" }) }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("g", { clipPath: "url(#air-clip)", children: /* @__PURE__ */ jsxRuntimeExports$1.jsx("g", { transform: "translate(0, 300)", children: valid && renderTicks() }) })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports$1.jsx(
      SvgTooltipGroup,
      {
        description: "Заданная скорость автопилота (Selected Speed), узлы.",
        frameVariables: ["SpeedSelect"],
        children: /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "177", y: "45", fill: "#00FFFF", fontSize: "22", textAnchor: "middle", fontFamily: "sans-serif", children: selectedSpeed !== null ? Math.round(selectedSpeed).toString().padStart(3, "0") : "000" })
      }
    ),
    valid && /* @__PURE__ */ jsxRuntimeExports$1.jsxs(
      SvgTooltipGroup,
      {
        transform: "translate(150, 300)",
        description: "Текущая приборная скорость (CAS). Жёлтая линия — тренд изменения скорости.",
        frameVariables: ["CAS"],
        children: [
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("path", { d: "M 0 0 L 15 -25 L 90 -25 L 90 25 L 15 25 Z", fill: "black", stroke: "white", strokeWidth: "1", transform: "translate(-85, 0)" }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "-40", y: "8", fill: "white", fontSize: "28", fontWeight: "bold", textAnchor: "middle", fontFamily: "sans-serif", children: Math.round(speed) }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: "-10", y1: "0", x2: "85", y2: "0", stroke: "#FFEA00", strokeWidth: "3" })
        ]
      }
    )
  ] });
}
function AltitudeTape({ frame }) {
  const TAPE_COLOR = "#818181";
  const finiteNumber2 = (value) => typeof value === "number" && Number.isFinite(value) ? value : null;
  const baroAltFt = finiteNumber2(frame.BaroAltitude) ?? finiteNumber2(frame.dec_BaroAltFt);
  const radioAltFt = finiteNumber2(frame.RadioAltitude) ?? finiteNumber2(frame.dec_RadioAltFt);
  const selectedAltFt = finiteNumber2(frame.StandardAltitude);
  const displayAlt = baroAltFt ?? radioAltFt ?? 12e3;
  const metricAlt = displayAlt * 0.3048;
  const pxPerFt = 0.55;
  const renderTicks = () => {
    const ticks = [];
    const minA = Math.floor(displayAlt / 100) * 100 - 400;
    const maxA = Math.floor(displayAlt / 100) * 100 + 400;
    for (let a = minA; a <= maxA; a += 100) {
      if (a < -1e3) continue;
      const y = (displayAlt - a) * pxPerFt;
      let val100 = Math.floor(a / 100);
      ticks.push(
        /* @__PURE__ */ jsxRuntimeExports$1.jsxs("g", { transform: `translate(0, ${y})`, children: [
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: "600", y1: "0", x2: "610", y2: "0", stroke: "white", strokeWidth: "2" }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "645", y: "7", fill: "white", fontSize: "22", textAnchor: "end", fontFamily: "sans-serif", children: val100 }),
          a + 50 <= maxA && /* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: "600", y1: -50 * pxPerFt, x2: "605", y2: -50 * pxPerFt, stroke: "white", strokeWidth: "2" })
        ] }, a)
      );
    }
    return ticks;
  };
  return /* @__PURE__ */ jsxRuntimeExports$1.jsxs("g", { children: [
    /* @__PURE__ */ jsxRuntimeExports$1.jsxs(
      SvgTooltipGroup,
      {
        description: "Лента барометрической высоты — сотни футов.",
        frameVariables: ["BaroAltitude", "dec_BaroAltFt", "RadioAltitude", "dec_RadioAltFt"],
        children: [
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("rect", { x: "600", y: "60", width: "55", height: "460", fill: TAPE_COLOR }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("clipPath", { id: "alt-clip", children: /* @__PURE__ */ jsxRuntimeExports$1.jsx("rect", { x: "600", y: "60", width: "55", height: "460" }) }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("g", { clipPath: "url(#alt-clip)", children: /* @__PURE__ */ jsxRuntimeExports$1.jsx("g", { transform: "translate(0, 300)", children: renderTicks() }) })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports$1.jsx(
      SvgTooltipGroup,
      {
        description: "Заданная высота автопилота (Selected Altitude), футы.",
        frameVariables: ["StandardAltitude"],
        children: /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "627", y: "45", fill: "#00FFFF", fontSize: "22", textAnchor: "middle", fontFamily: "sans-serif", children: selectedAltFt !== null ? Math.round(selectedAltFt) : "0200" })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports$1.jsx(SvgTooltipGroup, { description: "Нижняя часть цифрового окна высоты — последние две цифры футов.", children: /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "627", y: "550", fill: "#00FFFF", fontSize: "22", textAnchor: "middle", fontFamily: "sans-serif", children: "000" }) }),
    /* @__PURE__ */ jsxRuntimeExports$1.jsxs(
      SvgTooltipGroup,
      {
        transform: "translate(560, 300)",
        description: "Текущая барометрическая высота. Зелёный текст — высота в метрах.",
        frameVariables: ["BaroAltitude", "dec_BaroAltFt"],
        children: [
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("path", { d: "M0,0 L15,-35 L100,-35 L100,35 L15,35 Z", fill: "black", stroke: "#FFEA00", strokeWidth: "2" }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: "15", y1: "-12", x2: "100", y2: "-12", stroke: "#FFEA00", strokeWidth: "1" }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsxs("text", { x: "95", y: "-16", fill: "#00FF00", fontSize: "18", textAnchor: "end", fontFamily: "sans-serif", children: [
            Math.round(metricAlt),
            " M"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "50", y: "24", fill: "#00FF00", fontSize: "34", fontWeight: "bold", textAnchor: "end", fontFamily: "sans-serif", children: Math.floor(displayAlt / 100) }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "52", y: "14", fill: "#00FF00", fontSize: "22", textAnchor: "start", fontFamily: "sans-serif", children: "00" }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "52", y: "-4", fill: "#00FF00", fontSize: "14", fillOpacity: "0.8", textAnchor: "start", fontFamily: "sans-serif", children: "20" }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "52", y: "32", fill: "#00FF00", fontSize: "14", fillOpacity: "0.8", textAnchor: "start", fontFamily: "sans-serif", children: "80" }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: "-25", y1: "0", x2: "0", y2: "0", stroke: "white", strokeWidth: "2" })
        ]
      }
    )
  ] });
}
function VerticalSpeed({ frame }) {
  const TAPE_COLOR = "#818181";
  const vs = frame.Vy ?? 0;
  const getVsY = (val) => {
    const abs = Math.abs(val);
    const sign = Math.sign(val);
    let y = 0;
    if (abs <= 1) y = abs / 1 * 45;
    else if (abs <= 3) y = 45 + (abs - 1) / 2 * 45;
    else y = 90 + (abs - 3) / 3 * 55;
    return y * -sign;
  };
  return /* @__PURE__ */ jsxRuntimeExports$1.jsxs("g", { children: [
    /* @__PURE__ */ jsxRuntimeExports$1.jsx(
      SvgTooltipGroup,
      {
        description: "Вариометр — вертикальная скорость (набор высоты / снижение), м/с. Зелёная линия — текущее значение.",
        frameVariables: ["Vy"],
        children: /* @__PURE__ */ jsxRuntimeExports$1.jsx("path", { d: "M 680 160 L 730 160 L 730 440 L 680 440 L 660 390 L 660 210 Z", fill: TAPE_COLOR })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports$1.jsxs("g", { transform: "translate(0, 300)", children: [
      /* @__PURE__ */ jsxRuntimeExports$1.jsx(
        SvgTooltipGroup,
        {
          description: "Шкала вариометра — деления вертикальной скорости в м/с.",
          frameVariables: ["Vy"],
          children: [6, 3, 1, 0, -1, -3, -6].map((v) => {
            const y = getVsY(v);
            const isZero = v === 0;
            return /* @__PURE__ */ jsxRuntimeExports$1.jsxs("g", { transform: `translate(0, ${y})`, children: [
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: "660", y1: "0", x2: isZero ? "675" : "670", y2: "0", stroke: "white", strokeWidth: "2" }),
              !isZero && /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "680", y: "7", fill: "white", fontSize: "20", textAnchor: "start", fontFamily: "sans-serif", children: Math.abs(v) })
            ] }, v);
          })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports$1.jsx(
        SvgTooltipGroup,
        {
          description: "Зелёная линия — текущая вертикальная скорость.",
          frameVariables: ["Vy"],
          children: /* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: "640", y1: getVsY(vs / 1e3), x2: "720", y2: getVsY(vs / 1e3), stroke: "#00FF00", strokeWidth: "3" })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports$1.jsxs(
        SvgTooltipGroup,
        {
          description: "Нулевая вертикальная скорость — горизонтальный полёт.",
          frameVariables: ["Vy"],
          children: [
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("path", { d: "M 670 -12 L 660 -12 L 660 12 L 670 12", fill: "none", stroke: "#00FFFF", strokeWidth: "2" }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("rect", { x: "663", y: "-5", width: "4", height: "10", fill: "#00FFFF" })
          ]
        }
      )
    ] })
  ] });
}
function AoATape({ frame }) {
  const TAPE_COLOR = "#818181";
  const aoa = frame.AoA ?? 4.6;
  const g = frame.dec_G ?? null;
  const getAoAY = (v) => {
    return (aoa - v) * 16.5;
  };
  return /* @__PURE__ */ jsxRuntimeExports$1.jsxs("g", { children: [
    /* @__PURE__ */ jsxRuntimeExports$1.jsx(
      SvgTooltipGroup,
      {
        description: "Шкала угла атаки (AoA — Angle of Attack), градусы.",
        frameVariables: ["AoA"],
        children: /* @__PURE__ */ jsxRuntimeExports$1.jsx("path", { d: "M 120 160 L 120 440 L 90 440 L 70 390 L 70 210 L 90 160 Z", fill: TAPE_COLOR })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports$1.jsx(
      SvgTooltipGroup,
      {
        description: "Текущий угол атаки — угол между крылом и набегающим потоком, градусы.",
        frameVariables: ["AoA"],
        children: /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "100", y: "145", fill: "#00FF00", fontSize: "20", textAnchor: "middle", fontFamily: "sans-serif", children: aoa.toFixed(1) })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports$1.jsxs("g", { transform: "translate(0, 300)", children: [
      /* @__PURE__ */ jsxRuntimeExports$1.jsx("clipPath", { id: "aoa-clip", children: /* @__PURE__ */ jsxRuntimeExports$1.jsx("path", { d: "M 120 -140 L 120 140 L 90 140 L 70 90 L 70 -90 L 90 -140 Z" }) }),
      /* @__PURE__ */ jsxRuntimeExports$1.jsx(
        SvgTooltipGroup,
        {
          clipPath: "url(#aoa-clip)",
          description: "Деления шкалы AoA в градусах.",
          frameVariables: ["AoA"],
          children: [20, 15, 10, 5, 0, -5].map((v) => /* @__PURE__ */ jsxRuntimeExports$1.jsxs("g", { transform: `translate(0, ${getAoAY(v)})`, children: [
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: "110", y1: "0", x2: "120", y2: "0", stroke: "white", strokeWidth: "2" }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "105", y: "7", fill: "white", fontSize: "20", textAnchor: "end", fontFamily: "sans-serif", children: v })
          ] }, v))
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports$1.jsx(
      SvgTooltipGroup,
      {
        description: "Зелёный указатель текущего AoA на шкале.",
        frameVariables: ["AoA"],
        children: /* @__PURE__ */ jsxRuntimeExports$1.jsx("path", { d: `M 60 300 L 120 300`, stroke: "#00FF00", strokeWidth: "3" })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports$1.jsxs(
      SvgTooltipGroup,
      {
        description: "Перегрузка G — текущая вертикальная перегрузка.",
        frameVariables: ["dec_G"],
        children: [
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "65", y: "495", fill: "white", fontSize: "24", fontFamily: "sans-serif", children: "G" }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "115", y: "495", fill: g !== null ? "white" : "#FF9800", fontSize: "24", textAnchor: "end", fontFamily: "sans-serif", fontWeight: "bold", children: g !== null ? g.toFixed(1) : "- -" })
        ]
      }
    )
  ] });
}
function PFD({ frame }) {
  return /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "w-full h-full relative bg-black font-sans overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports$1.jsxs(
    "svg",
    {
      className: "w-full h-full absolute inset-0",
      viewBox: "0 0 800 600",
      preserveAspectRatio: "xMidYMid meet",
      children: [
        /* @__PURE__ */ jsxRuntimeExports$1.jsx(AttitudeIndicator, { frame }),
        /* @__PURE__ */ jsxRuntimeExports$1.jsx(AirspeedTape, { frame }),
        /* @__PURE__ */ jsxRuntimeExports$1.jsx(AoATape, { frame }),
        /* @__PURE__ */ jsxRuntimeExports$1.jsx(AltitudeTape, { frame }),
        /* @__PURE__ */ jsxRuntimeExports$1.jsx(VerticalSpeed, { frame })
      ]
    }
  ) });
}
const PFDInstrument = ({ frame }) => /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "w-full h-full bg-[#0a0a0f] flex items-center justify-center overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports$1.jsx(PFD, { frame }) });
registerPanelKitWidget({
  id: "pfd",
  name: "Flight Display",
  iconName: "Activity",
  Component: PFDInstrument,
  tooltip: "Flight Display — основной пилотажный индикатор: авиагоризонт, скорость, высота, вариометр, AoA, G и команды Flight Director.",
  frameVariables: [
    "PitchAngle",
    "RollAngle",
    "RadioAltitude",
    "dec_RadioAltFt",
    "FD_PitchCmd",
    "FD_RollCmd",
    "CAS",
    "SpeedSelect",
    "AoA",
    "dec_G",
    "BaroAltitude",
    "dec_BaroAltFt",
    "StandardAltitude",
    "Vy"
  ]
});
const AttitudeInstrument = ({ frame }) => /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "w-full h-full bg-[#0a0a0f] flex items-center justify-center overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports$1.jsx("svg", { viewBox: "200 100 400 420", className: "w-full h-full", preserveAspectRatio: "xMidYMid meet", children: /* @__PURE__ */ jsxRuntimeExports$1.jsx(AttitudeIndicator, { frame }) }) });
registerPanelKitWidget({
  id: "attitude",
  name: "Attitude Indicator",
  iconName: "Crosshair",
  Component: AttitudeInstrument,
  tooltip: "Attitude Indicator — положение самолёта относительно горизонта: тангаж, крен, радиовысота и команды Flight Director.",
  frameVariables: [
    "PitchAngle",
    "RollAngle",
    "RadioAltitude",
    "dec_RadioAltFt",
    "FD_PitchCmd",
    "FD_RollCmd"
  ]
});
const AirspeedInstrument = ({ frame }) => /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "w-full h-full bg-[#0a0a0f] flex items-center justify-center overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports$1.jsx("svg", { viewBox: "60 30 180 540", className: "w-full h-full", preserveAspectRatio: "xMidYMid meet", children: /* @__PURE__ */ jsxRuntimeExports$1.jsx(AirspeedTape, { frame }) }) });
registerPanelKitWidget({
  id: "airspeed",
  name: "Airspeed",
  iconName: "Gauge",
  Component: AirspeedInstrument,
  tooltip: "Airspeed — лента приборной скорости CAS и заданная скорость автопилота.",
  frameVariables: [
    "CAS",
    "SpeedSelect"
  ]
});
const AltitudeInstrument = ({ frame }) => /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "w-full h-full bg-[#0a0a0f] flex items-center justify-center overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports$1.jsx("svg", { viewBox: "525 30 145 540", className: "w-full h-full", preserveAspectRatio: "xMidYMid meet", children: /* @__PURE__ */ jsxRuntimeExports$1.jsx(AltitudeTape, { frame }) }) });
registerPanelKitWidget({
  id: "altitude",
  name: "Altitude",
  iconName: "Mountain",
  Component: AltitudeInstrument,
  tooltip: "Altitude — лента высоты: барометрическая высота, fallback на радиовысоту, метрическая индикация и заданная высота.",
  frameVariables: [
    "BaroAltitude",
    "dec_BaroAltFt",
    "RadioAltitude",
    "dec_RadioAltFt",
    "StandardAltitude"
  ]
});
const VerticalSpeedInstrument = ({ frame }) => /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "w-full h-full bg-[#0a0a0f] flex items-center justify-center overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports$1.jsx("svg", { viewBox: "630 145 115 320", className: "w-full h-full", preserveAspectRatio: "xMidYMid meet", children: /* @__PURE__ */ jsxRuntimeExports$1.jsx(VerticalSpeed, { frame }) }) });
registerPanelKitWidget({
  id: "vertical-speed",
  name: "Vertical Speed",
  iconName: "TrendingUp",
  Component: VerticalSpeedInstrument,
  tooltip: "Vertical Speed — вариометр, показывает вертикальную скорость набора или снижения.",
  frameVariables: [
    "Vy"
  ]
});
const AoAInstrument = ({ frame }) => /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "w-full h-full bg-[#0a0a0f] flex items-center justify-center overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports$1.jsx("svg", { viewBox: "45 125 95 385", className: "w-full h-full", preserveAspectRatio: "xMidYMid meet", children: /* @__PURE__ */ jsxRuntimeExports$1.jsx(AoATape, { frame }) }) });
registerPanelKitWidget({
  id: "aoa",
  name: "Angle of Attack",
  iconName: "Wind",
  Component: AoAInstrument,
  tooltip: "Angle of Attack — угол атаки и текущая вертикальная перегрузка G.",
  frameVariables: [
    "AoA",
    "dec_G"
  ]
});
const finiteNumber$4 = (value) => typeof value === "number" && Number.isFinite(value) ? value : null;
const NavDisplayInstrument = ({ frame }) => {
  let heading = finiteNumber$4(frame.MagneticHeading) ?? 0;
  heading = heading % 360;
  if (heading < 0) heading += 360;
  const selectedHeading = finiteNumber$4(frame.HeadingSelect) ?? 220;
  const dme = finiteNumber$4(frame.DME_Distance);
  const renderCompassRose = () => {
    const elements = [];
    for (let i = 0; i < 360; i += 5) {
      const isMajor = i % 10 === 0;
      const length = isMajor ? 14 : 7;
      elements.push(
        /* @__PURE__ */ jsxRuntimeExports$1.jsx(
          "line",
          {
            x1: "0",
            y1: -140,
            x2: "0",
            y2: -140 - length,
            stroke: "white",
            strokeWidth: isMajor ? 2 : 1.5,
            transform: `rotate(${i})`
          },
          `tick-${i}`
        )
      );
      if (i % 30 === 0) {
        let label = (i / 10).toString();
        if (i === 0) label = "N";
        if (i === 90) label = "E";
        if (i === 180) label = "S";
        if (i === 270) label = "W";
        elements.push(
          /* @__PURE__ */ jsxRuntimeExports$1.jsx(
            "text",
            {
              x: "0",
              y: "-110",
              fill: "white",
              fontSize: "22",
              fontWeight: "bold",
              textAnchor: "middle",
              fontFamily: "sans-serif",
              transform: `rotate(${i})`,
              children: label
            },
            `label-${i}`
          )
        );
      }
      if (i % 90 === 45) {
        elements.push(
          /* @__PURE__ */ jsxRuntimeExports$1.jsx(
            "polygon",
            {
              points: "0,-138 -6,-124 6,-124",
              fill: "none",
              stroke: "white",
              strokeWidth: "2",
              transform: `rotate(${i})`
            },
            `tri-${i}`
          )
        );
      }
    }
    return elements;
  };
  return /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "w-full h-full relative bg-[#050505] font-sans flex items-center justify-center select-none overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports$1.jsxs(
    "svg",
    {
      viewBox: "0 0 600 400",
      className: "w-full h-full",
      preserveAspectRatio: "xMidYMid meet",
      children: [
        /* @__PURE__ */ jsxRuntimeExports$1.jsx(
          SvgTooltipGroup,
          {
            description: "Заданный курс автопилота, градусы.",
            frameVariables: ["HeadingSelect"],
            children: /* @__PURE__ */ jsxRuntimeExports$1.jsxs("text", { x: "30", y: "50", fill: "white", fontSize: "22", fontFamily: "sans-serif", children: [
              "HDG",
              " ",
              /* @__PURE__ */ jsxRuntimeExports$1.jsxs("tspan", { fill: "#00FFFF", children: [
                Math.round(selectedHeading).toString().padStart(3, "0"),
                " °"
              ] })
            ] })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports$1.jsx(
          SvgTooltipGroup,
          {
            transform: "translate(480, 80)",
            description: "NAV-блок: курсовые/радионавигационные данные и DME-дистанция.",
            frameVariables: ["DME_Distance"],
            children: /* @__PURE__ */ jsxRuntimeExports$1.jsxs("g", { fill: "white", fontSize: "20", fontFamily: "sans-serif", children: [
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "10", y: "0", fill: "#00FFFF", textAnchor: "end", letterSpacing: "4", children: "---" }),
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "30", y: "0", children: "A" }),
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "10", y: "30", fill: "#00FFFF", textAnchor: "end", letterSpacing: "4", children: "---" }),
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "30", y: "30", children: "°" }),
              /* @__PURE__ */ jsxRuntimeExports$1.jsx(
                "text",
                {
                  x: "10",
                  y: "60",
                  fill: "#FFA500",
                  textAnchor: "end",
                  letterSpacing: dme === null ? "4" : "0",
                  children: dme !== null && dme !== void 0 ? dme.toFixed(1) : "---"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "30", y: "60", children: "NM" })
            ] })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports$1.jsxs("g", { transform: "translate(300, 200)", children: [
          /* @__PURE__ */ jsxRuntimeExports$1.jsxs(
            SvgTooltipGroup,
            {
              transform: `rotate(${-heading})`,
              description: "Компасная роза — текущий магнитный курс разворачивает шкалу относительно самолёта.",
              frameVariables: ["MagneticHeading"],
              children: [
                renderCompassRose(),
                /* @__PURE__ */ jsxRuntimeExports$1.jsx("g", { transform: `rotate(${selectedHeading}) translate(0, -154)`, children: /* @__PURE__ */ jsxRuntimeExports$1.jsx(
                  "path",
                  {
                    d: "M -12 0 L -12 -8 L 12 -8 L 12 0 L 6 0 L 6 -4 L -6 -4 L -6 0 Z",
                    fill: "#00FFFF"
                  }
                ) })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx(SvgTooltipGroup, { description: "Жёлтый индекс самолёта — неподвижная отметка текущего направления.", children: /* @__PURE__ */ jsxRuntimeExports$1.jsx(
            "polygon",
            {
              points: "0,-156 -10,-174 10,-174",
              fill: "none",
              stroke: "#FFEA00",
              strokeWidth: "2"
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: "-160", y1: "0", x2: "-180", y2: "0", stroke: "white", strokeWidth: "2" }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: "160", y1: "0", x2: "180", y2: "0", stroke: "white", strokeWidth: "2" }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: "0", y1: "160", x2: "0", y2: "180", stroke: "white", strokeWidth: "2" }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx(SvgTooltipGroup, { description: "Символ самолёта в центре навигационного дисплея.", children: /* @__PURE__ */ jsxRuntimeExports$1.jsxs("g", { stroke: "#FFEA00", strokeWidth: "4", fill: "none", strokeLinecap: "square", children: [
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: "0", y1: "-30", x2: "0", y2: "25" }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: "-25", y1: "-5", x2: "25", y2: "-5" }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: "-12", y1: "20", x2: "12", y2: "20" })
          ] }) })
        ] })
      ]
    }
  ) });
};
registerPanelKitWidget({
  id: "nav-display",
  name: "Nav Display",
  iconName: "Compass",
  Component: NavDisplayInstrument,
  tooltip: "Nav Display — компасная роза, текущий магнитный курс, заданный курс и DME-дистанция.",
  frameVariables: [
    "MagneticHeading",
    "HeadingSelect",
    "DME_Distance"
  ]
});
const finiteNumber$3 = (value) => typeof value === "number" && Number.isFinite(value) ? value : null;
function polarToCartesian$2(centerX, centerY, radius, angleInDegrees) {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians)
  };
}
function describeArc(x, y, radius, startAngle, endAngle) {
  const start = polarToCartesian$2(x, y, radius, endAngle);
  const end = polarToCartesian$2(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
}
const arcs = [
  // left side (ny)
  { r: 160, start: 185, end: 220, color: "#FF0000" },
  { r: 160, start: 220, end: 240, color: "#FFA500" },
  { r: 160, start: 240, end: 330, color: "#FFFFFF" },
  { r: 160, start: 330, end: 345, color: "#FFA500" },
  { r: 160, start: 345, end: 355, color: "#FF0000" },
  // right side (alpha)
  { r: 160, start: 4, end: 50, color: "#FF0000" },
  { r: 160, start: 50, end: 70, color: "#FFA500" },
  { r: 160, start: 70, end: 140, color: "#FFFFFF" },
  { r: 160, start: 140, end: 155, color: "#FFA500" },
  { r: 160, start: 155, end: 175, color: "#FF0000" },
  // cyan bracket
  { r: 170, start: 65, end: 130, color: "#00FFFF" }
];
function LoadsGauge({ frame }) {
  const normalG = finiteNumber$3(frame.NormalG);
  const ny = normalG !== null ? normalG + 1 : 1;
  const alpha = finiteNumber$3(frame.AoA) ?? 4.7;
  const angleNy = 240 + ny * 30;
  const angleAlpha = 120 - alpha * (30 / 9);
  return /* @__PURE__ */ jsxRuntimeExports$1.jsxs("svg", { viewBox: "0 0 400 400", className: "w-full h-full", preserveAspectRatio: "xMidYMid meet", children: [
    /* @__PURE__ */ jsxRuntimeExports$1.jsxs(
      SvgTooltipGroup,
      {
        description: "Шкала перегрузки Ny и угла атаки Alpha.",
        frameVariables: ["NormalG", "AoA"],
        children: [
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("circle", { cx: "200", cy: "200", r: "195", fill: "black" }),
          arcs.map((a, i) => /* @__PURE__ */ jsxRuntimeExports$1.jsx("path", { d: describeArc(200, 200, a.r, a.start, a.end), fill: "none", stroke: a.color, strokeWidth: "6" }, i)),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: polarToCartesian$2(200, 200, 170, 65).x, y1: polarToCartesian$2(200, 200, 170, 65).y, x2: polarToCartesian$2(200, 200, 160, 65).x, y2: polarToCartesian$2(200, 200, 160, 65).y, stroke: "#00FFFF", strokeWidth: "2" }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: polarToCartesian$2(200, 200, 170, 130).x, y1: polarToCartesian$2(200, 200, 170, 130).y, x2: polarToCartesian$2(200, 200, 160, 130).x, y2: polarToCartesian$2(200, 200, 160, 130).y, stroke: "#00FFFF", strokeWidth: "2" }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: polarToCartesian$2(200, 200, 120, 240).x, y: polarToCartesian$2(200, 200, 120, 240).y + 8, fill: "white", fontSize: "24", textAnchor: "middle", fontFamily: "sans-serif", children: "0" }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: polarToCartesian$2(200, 200, 120, 330).x, y: polarToCartesian$2(200, 200, 120, 330).y + 8, fill: "white", fontSize: "24", textAnchor: "middle", fontFamily: "sans-serif", children: "3" }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: polarToCartesian$2(200, 200, 110, 120).x, y: polarToCartesian$2(200, 200, 110, 120).y + 8, fill: "white", fontSize: "24", textAnchor: "middle", fontFamily: "sans-serif", children: "0" }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: polarToCartesian$2(200, 200, 110, 90).x, y: polarToCartesian$2(200, 200, 110, 90).y + 8, fill: "white", fontSize: "24", textAnchor: "middle", fontFamily: "sans-serif", children: "9" }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: polarToCartesian$2(200, 200, 110, 70).x, y: polarToCartesian$2(200, 200, 110, 70).y + 8, fill: "white", fontSize: "24", textAnchor: "middle", fontFamily: "sans-serif", children: "15" }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "50", y: "209", fill: "#00FFFF", fontSize: "26", fontFamily: "sans-serif", textAnchor: "middle", children: "1" }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("path", { d: "M 40 185 L 25 185 L 25 215 L 40 215", fill: "none", stroke: "#00FFFF", strokeWidth: "2" }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "170", y: "145", fill: "white", fontSize: "26", textAnchor: "middle", fontFamily: "serif", children: "ny" }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "230", y: "145", fill: "white", fontSize: "28", textAnchor: "middle", fontFamily: "serif", children: "α" })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports$1.jsxs(
      SvgTooltipGroup,
      {
        transform: "translate(90, 240)",
        description: "Цифровое значение Ny: нормальная перегрузка, смещенная к приборной шкале.",
        frameVariables: ["NormalG"],
        children: [
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("rect", { x: "0", y: "0", width: "80", height: "40", rx: "8", ry: "8", fill: "none", stroke: "#555", strokeWidth: "2" }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "40", y: "28", fill: "white", fontSize: "28", textAnchor: "middle", fontFamily: "monospace", children: ny.toFixed(1) })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports$1.jsxs(
      SvgTooltipGroup,
      {
        transform: "translate(230, 240)",
        description: "Цифровое значение угла атаки Alpha.",
        frameVariables: ["AoA"],
        children: [
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("rect", { x: "0", y: "0", width: "80", height: "40", rx: "8", ry: "8", fill: "none", stroke: "#555", strokeWidth: "2" }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "40", y: "28", fill: "white", fontSize: "28", textAnchor: "middle", fontFamily: "monospace", children: alpha.toFixed(1) })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports$1.jsxs("g", { transform: "translate(150, 310)", children: [
      /* @__PURE__ */ jsxRuntimeExports$1.jsx("rect", { x: "0", y: "0", width: "100", height: "35", rx: "10", ry: "10", fill: "none", stroke: "#555", strokeWidth: "2" }),
      /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "50", y: "25", fill: "#aaa", fontSize: "22", textAnchor: "middle", fontFamily: "sans-serif", children: "RESET" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports$1.jsxs(
      SvgTooltipGroup,
      {
        transform: `translate(200, 200) rotate(${angleNy - 270})`,
        description: "Зелёная стрелка Ny — текущая нормальная перегрузка.",
        frameVariables: ["NormalG"],
        children: [
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("path", { d: "M -2 -8 A 8 8 0 0 0 -2 8 Z", fill: "#00FF00" }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: "-2", y1: "0", x2: "-140", y2: "0", stroke: "#00FF00", strokeWidth: "3" })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports$1.jsxs(
      SvgTooltipGroup,
      {
        transform: `translate(200, 200) rotate(${angleAlpha - 90})`,
        description: "Зелёная стрелка Alpha — текущий угол атаки.",
        frameVariables: ["AoA"],
        children: [
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("path", { d: "M 2 -8 A 8 8 0 0 1 2 8 Z", fill: "#00FF00" }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: "2", y1: "0", x2: "140", y2: "0", stroke: "#00FF00", strokeWidth: "3" })
        ]
      }
    )
  ] });
}
function ControlGrid({ frame }) {
  const roll = finiteNumber$3(frame.RollAngle) ?? 0;
  const pitch = finiteNumber$3(frame.PitchAngle) ?? 0;
  const xVal = Math.max(-1, Math.min(1, roll / 45));
  const yVal = Math.max(-1, Math.min(1, pitch / 20));
  const px = 200 + xVal * 150;
  const py = 200 - yVal * 150;
  return /* @__PURE__ */ jsxRuntimeExports$1.jsx("svg", { viewBox: "0 0 400 400", className: "w-full h-full", preserveAspectRatio: "xMidYMid meet", children: /* @__PURE__ */ jsxRuntimeExports$1.jsxs(
    SvgTooltipGroup,
    {
      description: "Индикатор управления: по горизонтали крен, по вертикали тангаж, нормировано к диапазону -1..+1.",
      frameVariables: ["RollAngle", "PitchAngle"],
      children: [
        /* @__PURE__ */ jsxRuntimeExports$1.jsx("rect", { x: "50", y: "50", width: "300", height: "300", fill: "black", stroke: "white", strokeWidth: "2" }),
        [125, 200, 275].map((v) => /* @__PURE__ */ jsxRuntimeExports$1.jsxs(React.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: "50", y1: v, x2: "350", y2: v, stroke: "#444", strokeWidth: "1", strokeDasharray: "4 4" }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: v, y1: "50", x2: v, y2: "350", stroke: "#444", strokeWidth: "1", strokeDasharray: "4 4" })
        ] }, v)),
        /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "50", y: "40", fill: "white", fontSize: "18", textAnchor: "middle", fontFamily: "monospace", children: "-1" }),
        /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "125", y: "40", fill: "white", fontSize: "18", textAnchor: "middle", fontFamily: "monospace", children: "-0.5" }),
        /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "200", y: "40", fill: "white", fontSize: "18", textAnchor: "middle", fontFamily: "monospace", children: "0" }),
        /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "275", y: "40", fill: "white", fontSize: "18", textAnchor: "middle", fontFamily: "monospace", children: "+0.5" }),
        /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "350", y: "40", fill: "white", fontSize: "18", textAnchor: "middle", fontFamily: "monospace", children: "+1" }),
        /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "40", y: "55", fill: "white", fontSize: "18", textAnchor: "end", fontFamily: "monospace", children: "+1" }),
        /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "40", y: "130", fill: "white", fontSize: "18", textAnchor: "end", fontFamily: "monospace", children: "0.5" }),
        /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "40", y: "205", fill: "white", fontSize: "18", textAnchor: "end", fontFamily: "monospace", children: "0" }),
        /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "40", y: "280", fill: "white", fontSize: "18", textAnchor: "end", fontFamily: "monospace", children: "0.5" }),
        /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "40", y: "355", fill: "white", fontSize: "18", textAnchor: "end", fontFamily: "monospace", children: "-1" }),
        /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "50", y: "380", fill: "#FF00FF", fontSize: "24", textAnchor: "middle", fontWeight: "bold", children: "L" }),
        /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "350", y: "380", fill: "#00FF00", fontSize: "24", textAnchor: "middle", fontWeight: "bold", children: "R" }),
        /* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: px, y1: "50", x2: px, y2: "350", stroke: "#00FF00", strokeWidth: "2", strokeDasharray: "2 2" }),
        /* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: "50", y1: py, x2: "350", y2: py, stroke: "#00FF00", strokeWidth: "2", strokeDasharray: "2 2" }),
        /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: px, y: 368, fill: "#00FF00", fontSize: "16", textAnchor: "middle", fontFamily: "monospace", children: xVal < 0 && xVal > -0.1 ? "-0.0" : xVal.toFixed(1) }),
        /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: 358, y: py + 5, fill: "#00FF00", fontSize: "16", textAnchor: "start", fontFamily: "monospace", children: yVal > 0 && yVal < 0.1 ? "-0.0" : yVal.toFixed(1) }),
        /* @__PURE__ */ jsxRuntimeExports$1.jsx("circle", { cx: px, cy: py, r: "6", fill: "#00FF00" })
      ]
    }
  ) });
}
const AuxPanelInstrument = ({ frame }) => {
  return /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "w-full h-full relative bg-[#050505] font-sans flex flex-row items-center justify-center select-none overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports$1.jsx(ControlGrid, { frame }),
    /* @__PURE__ */ jsxRuntimeExports$1.jsx(LoadsGauge, { frame })
  ] });
};
registerPanelKitWidget({
  id: "aux-panel",
  name: "Aux Panel",
  iconName: "Gauge",
  Component: AuxPanelInstrument,
  tooltip: "Aux Panel — вспомогательная панель с индикатором управления по тангажу/крену и шкалой перегрузки/AoA.",
  frameVariables: [
    "RollAngle",
    "PitchAngle",
    "NormalG",
    "AoA"
  ]
});
const finiteNumber$2 = (value) => typeof value === "number" && Number.isFinite(value) ? value : null;
function polarToCartesian$1(centerX, centerY, radius, angleInDegrees) {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians)
  };
}
function EngineDial({ cx, cy, label, value, frameVariable, maxVal = 100, tickInterval = 20 }) {
  const angleRange = 300;
  const startAngle = -150;
  const endAngle = 150;
  const radiusOuter = 95;
  const radiusInner = 80;
  const ticks = [];
  for (let i = 0; i <= maxVal; i += tickInterval / 2) {
    const isMajor = i % tickInterval === 0;
    const a = startAngle + i / maxVal * angleRange;
    const p1 = polarToCartesian$1(cx, cy, radiusOuter, a);
    const p2 = polarToCartesian$1(cx, cy, isMajor ? radiusInner - 5 : radiusInner + 5, a);
    ticks.push(
      /* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y, stroke: "white", strokeWidth: isMajor ? 3 : 1.5 }, `tick-${label}-${i}`)
    );
    if (isMajor) {
      const pText = polarToCartesian$1(cx, cy, radiusInner - 20, a);
      ticks.push(
        /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: pText.x, y: pText.y + 6, fill: "white", fontSize: "18", fontWeight: "bold", textAnchor: "middle", fontFamily: "sans-serif", children: i / 10 }, `text-${label}-${i}`)
      );
    }
  }
  const safeValue = value !== null ? Math.max(0, Math.min(value, 110)) : 0;
  const needleAngle = startAngle + safeValue / maxVal * angleRange;
  const pNeedleOuter = polarToCartesian$1(cx, cy, radiusInner - 5, needleAngle);
  const pNeedleInner = polarToCartesian$1(cx, cy, -15, needleAngle);
  return /* @__PURE__ */ jsxRuntimeExports$1.jsxs(
    SvgTooltipGroup,
    {
      description: `${label.toUpperCase()} — обороты двигателя, проценты.`,
      frameVariables: [frameVariable],
      children: [
        /* @__PURE__ */ jsxRuntimeExports$1.jsx(
          "path",
          {
            d: `M ${polarToCartesian$1(cx, cy, radiusOuter, startAngle).x} ${polarToCartesian$1(cx, cy, radiusOuter, startAngle).y} A ${radiusOuter} ${radiusOuter} 0 1 1 ${polarToCartesian$1(cx, cy, radiusOuter, endAngle).x} ${polarToCartesian$1(cx, cy, radiusOuter, endAngle).y}`,
            fill: "none",
            stroke: "white",
            strokeWidth: "2"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports$1.jsx(
          "path",
          {
            d: `M ${polarToCartesian$1(cx, cy, radiusOuter, endAngle).x} ${polarToCartesian$1(cx, cy, radiusOuter, endAngle).y} A ${radiusOuter} ${radiusOuter} 0 0 1 ${polarToCartesian$1(cx, cy, radiusOuter, endAngle + 15).x} ${polarToCartesian$1(cx, cy, radiusOuter, endAngle + 15).y}`,
            fill: "none",
            stroke: "#FF0000",
            strokeWidth: "4"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports$1.jsx(
          "line",
          {
            x1: polarToCartesian$1(cx, cy, radiusOuter, endAngle + 15).x,
            y1: polarToCartesian$1(cx, cy, radiusOuter, endAngle + 15).y,
            x2: polarToCartesian$1(cx, cy, radiusInner, endAngle + 15).x,
            y2: polarToCartesian$1(cx, cy, radiusInner, endAngle + 15).y,
            stroke: "#FF0000",
            strokeWidth: "4"
          }
        ),
        ticks,
        /* @__PURE__ */ jsxRuntimeExports$1.jsxs("text", { x: cx, y: cy - 20, fill: "white", fontSize: "24", fontFamily: "sans-serif", textAnchor: "middle", children: [
          "n",
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("tspan", { fontSize: "18", dy: "4", children: label.replace("n", "") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: cx, y: cy + 10, fill: "white", fontSize: "18", fontFamily: "sans-serif", textAnchor: "middle", children: "%" }),
        value !== null && /* @__PURE__ */ jsxRuntimeExports$1.jsxs(jsxRuntimeExports$1.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: pNeedleInner.x, y1: pNeedleInner.y, x2: pNeedleOuter.x, y2: pNeedleOuter.y, stroke: "#00FF00", strokeWidth: "3" }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("circle", { cx, cy, r: "6", fill: "#00FF00" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports$1.jsx("circle", { cx, cy, r: "3", fill: "black" }),
        /* @__PURE__ */ jsxRuntimeExports$1.jsxs("g", { transform: `translate(${cx - 35}, ${cy + radiusOuter - 15})`, children: [
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("rect", { x: "0", y: "0", width: "70", height: "35", rx: "5", ry: "5", fill: "black", stroke: "#666", strokeWidth: "2" }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "35", y: "24", fill: "white", fontSize: "20", fontFamily: "monospace", textAnchor: "middle", children: value !== null ? value.toFixed(1) : "---" })
        ] })
      ]
    }
  );
}
const EngineDisplayInstrument = ({ frame }) => {
  const engine = {
    n1: finiteNumber$2(frame.Engine_N1_Left),
    n2: finiteNumber$2(frame.Engine_N1_Right),
    fuelFlow: finiteNumber$2(frame.TotalFuel),
    egt: finiteNumber$2(frame.APU_EGT),
    oilPress: finiteNumber$2(frame.APU_OilPressure),
    oilTemp: finiteNumber$2(frame.APU_OilTemp),
    vibration: null
  };
  const rows = [
    { label: "FF", labelSub: "", value: engine.fuelFlow, unit: "T/h", fixed: 2 },
    { label: "t", labelSub: "г", value: engine.egt, unit: "x 100 °C", fixed: 1 },
    { label: "P", labelSub: "м", value: engine.oilPress, unit: "КГ/СМ²", fixed: 1 },
    { label: "T", labelSub: "м", value: engine.oilTemp, unit: "°C", fixed: 0 },
    { label: "Вибр", labelSub: "", value: engine.vibration, unit: "%", fixed: 1 }
  ];
  return /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "w-full h-full relative bg-[#050505] font-sans flex flex-col items-center justify-center select-none overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports$1.jsxs("svg", { viewBox: "0 0 600 460", className: "w-full h-full", preserveAspectRatio: "xMidYMid meet", children: [
    /* @__PURE__ */ jsxRuntimeExports$1.jsx(EngineDial, { cx: 180, cy: 130, label: "n1", value: engine.n1 ?? 0, frameVariable: "Engine_N1_Left" }),
    /* @__PURE__ */ jsxRuntimeExports$1.jsx(EngineDial, { cx: 420, cy: 130, label: "n2", value: engine.n2 ?? 0, frameVariable: "Engine_N1_Right" }),
    /* @__PURE__ */ jsxRuntimeExports$1.jsx("g", { transform: "translate(0, 20)", children: rows.map((r, i) => {
      const y = 260 + i * 36;
      const frameVariables = [
        ["TotalFuel"],
        ["APU_EGT"],
        ["APU_OilPressure"],
        ["APU_OilTemp"],
        []
      ][i];
      return /* @__PURE__ */ jsxRuntimeExports$1.jsxs(
        SvgTooltipGroup,
        {
          description: `${r.label}${r.labelSub} — ${r.unit}`,
          frameVariables,
          children: [
            /* @__PURE__ */ jsxRuntimeExports$1.jsxs("text", { x: "270", y, fill: "white", fontSize: "20", fontFamily: "sans-serif", textAnchor: "end", children: [
              r.label,
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("tspan", { fontSize: "15", dy: "5", children: r.labelSub })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsxs("g", { transform: `translate(285, ${y - 20})`, children: [
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("rect", { width: "60", height: "26", rx: "4", fill: "black", stroke: "#666", strokeWidth: "2" }),
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "30", y: "19", fill: "white", fontSize: "18", fontFamily: "monospace", textAnchor: "middle", children: r.value !== null && r.value !== void 0 ? r.value.toFixed(r.fixed) : "---" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "355", y, fill: "white", fontSize: "16", fontFamily: "sans-serif", textAnchor: "start", children: /* @__PURE__ */ jsxRuntimeExports$1.jsx("tspan", { dy: r.labelSub ? "-5" : "0", children: r.unit }) })
          ]
        },
        i
      );
    }) })
  ] }) });
};
registerPanelKitWidget({
  id: "engine-display",
  name: "Engine Display",
  iconName: "Cog",
  Component: EngineDisplayInstrument,
  tooltip: "Engine Display — параметры двигателей и APU: N1/N2, топливо, EGT, давление и температура масла.",
  frameVariables: [
    "Engine_N1_Left",
    "Engine_N1_Right",
    "TotalFuel",
    "APU_EGT",
    "APU_OilPressure",
    "APU_OilTemp"
  ]
});
const finiteNumber$1 = (value) => typeof value === "number" && Number.isFinite(value) ? value : null;
const ConfigDisplayInstrument = ({ frame }) => {
  const flaps = finiteNumber$1(frame.FlapsPosition) ?? 0;
  const slats = finiteNumber$1(frame.SlatsPosition) ?? 0;
  const s = {
    flapL: flaps,
    flapR: flaps,
    slatL: slats,
    slatR: slats,
    phiST: finiteNumber$1(frame.StabPosition) ?? -1.8,
    deltaPB: finiteNumber$1(frame.Airbrake_Inner_Cmd) ?? -0.1,
    deltaEPL: finiteNumber$1(frame.Elev_Left_Inner) ?? finiteNumber$1(frame.Elev_Left_Outer),
    deltaEPR: finiteNumber$1(frame.Elev_Right_Inner) ?? finiteNumber$1(frame.Elev_Right_Outer)
  };
  const formatWithComma = (val) => {
    if (val === null) return "--,-";
    return val.toFixed(1).replace(".", ",");
  };
  const formatWithDot = (val) => {
    if (val === null) return "--.-";
    return val.toFixed(1);
  };
  return /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "w-full h-full relative bg-[#050505] font-sans flex flex-col items-center justify-center select-none overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports$1.jsxs("svg", { viewBox: "0 0 800 600", className: "w-full h-full", preserveAspectRatio: "xMidYMid meet", children: [
    /* @__PURE__ */ jsxRuntimeExports$1.jsxs(
      SvgTooltipGroup,
      {
        transform: "translate(0, -30)",
        description: "Вид спереди: текущие положения стабилизатора, интерцептора, рулей высоты, закрылков и предкрылков.",
        frameVariables: [
          "StabPosition",
          "Airbrake_Inner_Cmd",
          "Elev_Left_Inner",
          "Elev_Left_Outer",
          "Elev_Right_Inner",
          "Elev_Right_Outer",
          "FlapsPosition",
          "SlatsPosition"
        ],
        children: [
          /* @__PURE__ */ jsxRuntimeExports$1.jsxs("g", { stroke: "#999", strokeWidth: "1.5", fill: "none", children: [
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("path", { d: "M 370 240 Q 200 240 100 170 Q 150 250 370 255" }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("path", { d: "M 430 240 Q 600 240 700 170 Q 650 250 430 255" }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("path", { d: "M 100 170 Q 100 150 110 140" }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("path", { d: "M 700 170 Q 700 150 690 140" }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("circle", { cx: "310", cy: "270", r: "18" }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("circle", { cx: "310", cy: "270", r: "10" }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("path", { d: "M 310 252 L 310 248 L 330 248 L 330 252" }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("circle", { cx: "490", cy: "270", r: "18" }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("circle", { cx: "490", cy: "270", r: "10" }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("path", { d: "M 490 252 L 490 248 L 470 248 L 470 252" }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("circle", { cx: "400", cy: "240", r: "35" }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("path", { d: "M 380 215 Q 400 190 420 215", strokeWidth: "1" }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("circle", { cx: "400", cy: "240", r: "5", strokeWidth: "1" }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("circle", { cx: "400", cy: "240", r: "2" }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("path", { d: "M 395 205 L 395 60 Q 400 55 405 60 L 405 205" }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("path", { d: "M 395 180 L 320 185 L 320 190 L 395 195" }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("path", { d: "M 405 180 L 480 185 L 480 190 L 405 195" }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("rect", { x: "396", y: "275", width: "8", height: "25" }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("rect", { x: "388", y: "300", width: "10", height: "20", rx: "3" }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("rect", { x: "402", y: "300", width: "10", height: "20", rx: "3" }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("rect", { x: "348", y: "280", width: "6", height: "30" }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("rect", { x: "335", y: "300", width: "12", height: "24", rx: "3" }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("rect", { x: "355", y: "300", width: "12", height: "24", rx: "3" }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("rect", { x: "446", y: "280", width: "6", height: "30" }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("rect", { x: "433", y: "300", width: "12", height: "24", rx: "3" }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("rect", { x: "453", y: "300", width: "12", height: "24", rx: "3" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsxs("g", { fill: "#FFA500", children: [
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("rect", { x: "325", y: "330", width: "45", height: "10" }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("rect", { x: "375", y: "330", width: "50", height: "10" }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("rect", { x: "430", y: "330", width: "45", height: "10" }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("rect", { x: "325", y: "345", width: "150", height: "10" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsxs("g", { fontSize: "20", fontFamily: "sans-serif", textAnchor: "middle", children: [
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "320", y: "100", fill: "white", children: "ϕST" }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "320", y: "125", fill: "#00FF00", children: formatWithComma(s.phiST) }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "480", y: "100", fill: "white", children: "δPB" }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "480", y: "125", fill: "#00FF00", children: formatWithComma(s.deltaPB) }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "140", y: "130", fill: "#444", children: "δЭП-L" }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "140", y: "155", fill: s.deltaEPL === null ? "#155015" : "#00FF00", children: formatWithComma(s.deltaEPL) }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "660", y: "130", fill: "#444", children: "δЭП-R" }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "660", y: "155", fill: s.deltaEPR === null ? "#155015" : "#00FF00", children: formatWithComma(s.deltaEPR) }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "210", y: "160", fill: "white", children: "FlapL" }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "210", y: "185", fill: "#00FF00", children: formatWithComma(s.flapL) }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "590", y: "160", fill: "white", children: "FlapR" }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "590", y: "185", fill: "#00FF00", children: formatWithComma(s.flapR) }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "210", y: "270", fill: "white", children: "SlatL" }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "210", y: "295", fill: "#00FF00", children: formatWithComma(s.slatL) }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "590", y: "270", fill: "white", children: "SlatR" }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "590", y: "295", fill: "#00FF00", children: formatWithComma(s.slatR) })
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports$1.jsxs(
      SvgTooltipGroup,
      {
        transform: "translate(0, 100)",
        description: "Вид сверху: положения закрылков и предкрылков слева/справа.",
        frameVariables: ["FlapsPosition", "SlatsPosition"],
        children: [
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("polygon", { points: "360,300 60,420 360,420", fill: "none", stroke: "white", strokeWidth: "2" }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("polygon", { points: "85,408 340,305 340,314 95,417", fill: "#00FF00", fillOpacity: "0.2", stroke: "#00FF00", strokeWidth: "3" }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("polygon", { points: "120,413 340,413 340,418 120,418", fill: "#00FF00", fillOpacity: "0.2", stroke: "#00FF00", strokeWidth: "3", transform: "translate(0, -10)" }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("polygon", { points: "440,300 740,420 440,420", fill: "none", stroke: "white", strokeWidth: "2" }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("polygon", { points: "715,408 460,305 460,314 705,417", fill: "#00FF00", fillOpacity: "0.2", stroke: "#00FF00", strokeWidth: "3" }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("polygon", { points: "680,413 460,413 460,418 680,418", fill: "#00FF00", fillOpacity: "0.2", stroke: "#00FF00", strokeWidth: "3", transform: "translate(0, -10)" }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsxs("g", { fontSize: "22", fontFamily: "monospace", children: [
            /* @__PURE__ */ jsxRuntimeExports$1.jsxs("text", { x: "40", y: "340", fill: "white", children: [
              "SLAT",
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("tspan", { fontSize: "18", children: "L" }),
              " : ",
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("tspan", { fill: "#00FF00", children: formatWithDot(s.slatL) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsxs("text", { x: "170", y: "470", fill: "white", children: [
              "FLAP",
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("tspan", { fontSize: "18", children: "L" }),
              " : ",
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("tspan", { fill: "#00FF00", children: formatWithDot(s.flapL) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsxs("text", { x: "610", y: "340", fill: "white", children: [
              "SLAT",
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("tspan", { fontSize: "18", children: "R" }),
              " : ",
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("tspan", { fill: "#00FF00", children: formatWithDot(s.slatR) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsxs("text", { x: "480", y: "470", fill: "white", children: [
              "FLAP",
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("tspan", { fontSize: "18", children: "R" }),
              " : ",
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("tspan", { fill: "#00FF00", children: formatWithDot(s.flapR) })
            ] })
          ] })
        ]
      }
    )
  ] }) });
};
registerPanelKitWidget({
  id: "config-display",
  name: "Config Display",
  iconName: "Plane",
  Component: ConfigDisplayInstrument,
  tooltip: "Config Display — конфигурация самолёта: закрылки, предкрылки, стабилизатор, интерцептор и рули высоты.",
  frameVariables: [
    "FlapsPosition",
    "SlatsPosition",
    "StabPosition",
    "Airbrake_Inner_Cmd",
    "Elev_Left_Inner",
    "Elev_Left_Outer",
    "Elev_Right_Inner",
    "Elev_Right_Outer"
  ]
});
function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians)
  };
}
const finiteNumber = (value) => typeof value === "number" && Number.isFinite(value) ? value : null;
const PFD2Instrument = ({ frame }) => {
  const pitch = finiteNumber(frame.PitchAngle) ?? 0;
  const roll = finiteNumber(frame.RollAngle) ?? 0;
  const pxPerDegPitch = 8;
  const pitchOffset = pitch * pxPerDegPitch;
  const slipOffset = roll ? -(roll / 45) * 15 : 0;
  const fdPitchOffset = Math.sin(Date.now() / 1500) * 15;
  const fdRollAngle = Math.cos(Date.now() / 2e3) * 10;
  return /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "w-full h-full relative bg-[#050505] font-sans flex flex-col items-center justify-center select-none overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports$1.jsxs(
    "svg",
    {
      viewBox: "-300 -300 600 600",
      className: "w-full h-full",
      preserveAspectRatio: "xMidYMid meet",
      children: [
        /* @__PURE__ */ jsxRuntimeExports$1.jsx("defs", { children: /* @__PURE__ */ jsxRuntimeExports$1.jsx("clipPath", { id: "adi-mask2", children: /* @__PURE__ */ jsxRuntimeExports$1.jsx("path", { d: "M -160,-220 L 160,-220 A 240 240 0 0 1 240,0 A 240 240 0 0 1 160,220 L -160,220 A 240 240 0 0 1 -240,0 A 240 240 0 0 1 -160,-220 Z" }) }) }),
        /* @__PURE__ */ jsxRuntimeExports$1.jsxs("g", { clipPath: "url(#adi-mask2)", children: [
          /* @__PURE__ */ jsxRuntimeExports$1.jsxs(
            SvgTooltipGroup,
            {
              transform: `translate(0, ${pitchOffset})`,
              description: "Подвижный фон авиагоризонта и шкала тангажа.",
              frameVariables: ["PitchAngle"],
              children: [
                /* @__PURE__ */ jsxRuntimeExports$1.jsx("rect", { x: "-400", y: "-800", width: "800", height: "800", fill: "#145A96" }),
                /* @__PURE__ */ jsxRuntimeExports$1.jsx("rect", { x: "-400", y: "0", width: "800", height: "800", fill: "#914920" }),
                /* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: "-400", y1: "0", x2: "400", y2: "0", stroke: "white", strokeWidth: "3" }),
                /* @__PURE__ */ jsxRuntimeExports$1.jsxs("g", { stroke: "white", strokeWidth: "2", textAnchor: "middle", fill: "white", fontFamily: "sans-serif", fontSize: "22", children: [
                  /* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: "-30", y1: -10 * pxPerDegPitch, x2: "30", y2: -10 * pxPerDegPitch }),
                  /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "0", y: -10 * pxPerDegPitch + 8, stroke: "#145A96", strokeWidth: "5", strokeLinejoin: "round", children: "10" }),
                  /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "0", y: -10 * pxPerDegPitch + 8, stroke: "none", children: "10" }),
                  /* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: "-40", y1: -20 * pxPerDegPitch, x2: "40", y2: -20 * pxPerDegPitch }),
                  /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "0", y: -20 * pxPerDegPitch + 8, stroke: "#145A96", strokeWidth: "5", strokeLinejoin: "round", children: "20" }),
                  /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "0", y: -20 * pxPerDegPitch + 8, stroke: "none", children: "20" }),
                  /* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: "-60", y1: -23 * pxPerDegPitch, x2: "-20", y2: -23 * pxPerDegPitch, stroke: "#DE3121", strokeWidth: "3" }),
                  /* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: "20", y1: -23 * pxPerDegPitch, x2: "60", y2: -23 * pxPerDegPitch, stroke: "#DE3121", strokeWidth: "3" }),
                  /* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: "-30", y1: 10 * pxPerDegPitch, x2: "30", y2: 10 * pxPerDegPitch }),
                  /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "0", y: 10 * pxPerDegPitch + 8, stroke: "#914920", strokeWidth: "5", strokeLinejoin: "round", children: "10" }),
                  /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "0", y: 10 * pxPerDegPitch + 8, stroke: "none", children: "10" }),
                  /* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: "-40", y1: 20 * pxPerDegPitch, x2: "40", y2: 20 * pxPerDegPitch }),
                  /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "0", y: 20 * pxPerDegPitch + 8, stroke: "#914920", strokeWidth: "5", strokeLinejoin: "round", children: "20" }),
                  /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "0", y: 20 * pxPerDegPitch + 8, stroke: "none", children: "20" }),
                  /* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: "-60", y1: 23 * pxPerDegPitch, x2: "-20", y2: 23 * pxPerDegPitch, stroke: "#DE3121", strokeWidth: "3" }),
                  /* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: "20", y1: 23 * pxPerDegPitch, x2: "60", y2: 23 * pxPerDegPitch, stroke: "#DE3121", strokeWidth: "3" }),
                  /* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: "-15", y1: -5 * pxPerDegPitch, x2: "15", y2: -5 * pxPerDegPitch }),
                  /* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: "-15", y1: 5 * pxPerDegPitch, x2: "15", y2: 5 * pxPerDegPitch }),
                  /* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: "-15", y1: -15 * pxPerDegPitch, x2: "15", y2: -15 * pxPerDegPitch }),
                  /* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: "-15", y1: 15 * pxPerDegPitch, x2: "15", y2: 15 * pxPerDegPitch })
                ] })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx(
            SvgTooltipGroup,
            {
              description: "Неподвижные боковые маркеры горизонта.",
              children: /* @__PURE__ */ jsxRuntimeExports$1.jsxs("g", { stroke: "white", strokeWidth: "2", children: [
                /* @__PURE__ */ jsxRuntimeExports$1.jsx("path", { d: "M -235,0 L -205,0 L -215,-7 Z", fill: "none" }),
                /* @__PURE__ */ jsxRuntimeExports$1.jsx("path", { d: "M 235,0 L 205,0 L 215,-7 Z", fill: "none" }),
                /* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: "-205", y1: "0", x2: "-180", y2: "0", strokeDasharray: "5 5" }),
                /* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: "205", y1: "0", x2: "180", y2: "0", strokeDasharray: "5 5" })
              ] })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports$1.jsxs(
            SvgTooltipGroup,
            {
              description: "Шкала крена, градусы.",
              frameVariables: ["RollAngle"],
              children: [
                [-60, -45, -30, -15, 0, 15, 30, 45, 60].map((a) => {
                  const isMajor = Math.abs(a) === 30 || Math.abs(a) === 60 || a === 0;
                  const p1 = polarToCartesian(0, 0, 180, 180 + a);
                  const p2 = polarToCartesian(0, 0, isMajor ? 198 : 190, 180 + a);
                  const textP = polarToCartesian(0, 0, 160, 180 + a);
                  const elements = [];
                  elements.push(/* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y, stroke: "white", strokeWidth: "2" }, `tick-${a}`));
                  if (Math.abs(a) === 15 || Math.abs(a) === 60) {
                    elements.push(/* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: textP.x, y: textP.y + 6, fill: "white", fontSize: "16", textAnchor: "middle", fontFamily: "sans-serif", children: Math.abs(a) }, `txt-${a}`));
                  }
                  if (Math.abs(a) === 45) {
                    const textP45 = polarToCartesian(0, 0, 165, 180 + a);
                    elements.push(/* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: textP45.x, y: textP45.y + 6, fill: "white", fontSize: "16", textAnchor: "middle", fontFamily: "sans-serif", children: Math.abs(a) }, `txt-${a}`));
                  }
                  return elements;
                }),
                /* @__PURE__ */ jsxRuntimeExports$1.jsx("path", { d: "M -106 148 C -120 135, -140 110, -155 70", fill: "none", stroke: "#D32F2F", strokeWidth: "2" }),
                /* @__PURE__ */ jsxRuntimeExports$1.jsx("path", { d: "M 106 148 C 120 135, 140 110, 155 70", fill: "none", stroke: "#D32F2F", strokeWidth: "2" }),
                /* @__PURE__ */ jsxRuntimeExports$1.jsx("path", { d: "M -135 60 L -140 50 L -130 50", fill: "none", stroke: "#D32F2F", strokeWidth: "2" }),
                /* @__PURE__ */ jsxRuntimeExports$1.jsx("path", { d: "M 135 60 L 140 50 L 130 50", fill: "none", stroke: "#D32F2F", strokeWidth: "2" })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("rect", { x: "-190", y: "75", width: "100", height: "34", fill: "#E87C24", opacity: "0.9" }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "-140", y: "98", fill: "#111", fontSize: "18", fontFamily: "sans-serif", textAnchor: "middle", children: "ПЗ ИНС" }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("rect", { x: "90", y: "75", width: "100", height: "34", fill: "#E87C24", opacity: "0.9" }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("text", { x: "140", y: "98", fill: "#111", fontSize: "18", fontFamily: "sans-serif", textAnchor: "middle", children: "ПЗ СБКВ" }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx(
            SvgTooltipGroup,
            {
              transform: `rotate(${roll})`,
              description: "Оранжевый символ самолёта — текущий крен относительно шкалы.",
              frameVariables: ["RollAngle"],
              children: /* @__PURE__ */ jsxRuntimeExports$1.jsxs("g", { stroke: "#E87C24", strokeWidth: "4", fill: "none", strokeLinecap: "square", children: [
                /* @__PURE__ */ jsxRuntimeExports$1.jsx("circle", { cx: "0", cy: "0", r: "22" }),
                /* @__PURE__ */ jsxRuntimeExports$1.jsx("circle", { cx: "0", cy: "0", r: "3", fill: "#E87C24" }),
                /* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: "-22", y1: "0", x2: "-80", y2: "0" }),
                /* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: "-80", y1: "0", x2: "-100", y2: "20" }),
                /* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: "22", y1: "0", x2: "80", y2: "0" }),
                /* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: "80", y1: "0", x2: "100", y2: "20" }),
                /* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: "0", y1: "22", x2: "0", y2: "182", stroke: "#E87C24", strokeWidth: "3" })
              ] })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports$1.jsxs(
            SvgTooltipGroup,
            {
              transform: "translate(0, 205)",
              description: "Индикатор бокового скольжения. Сейчас смещение вычисляется из крена как визуальная имитация.",
              frameVariables: ["RollAngle"],
              children: [
                /* @__PURE__ */ jsxRuntimeExports$1.jsx("rect", { x: "-40", y: "-12", width: "80", height: "24", rx: "12", fill: "white", stroke: "#333", strokeWidth: "1" }),
                /* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: "-12", y1: "-12", x2: "-12", y2: "12", stroke: "black", strokeWidth: "3" }),
                /* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: "12", y1: "-12", x2: "12", y2: "12", stroke: "black", strokeWidth: "3" }),
                /* @__PURE__ */ jsxRuntimeExports$1.jsx("circle", { cx: slipOffset, cy: "0", r: "10", fill: "black" })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports$1.jsxs(
            SvgTooltipGroup,
            {
              transform: `translate(0, ${pitchOffset - 20 + fdPitchOffset})`,
              description: "Flight Director — демонстрационные командные планки, анимированы для визуальной активности.",
              frameVariables: ["PitchAngle"],
              children: [
                /* @__PURE__ */ jsxRuntimeExports$1.jsxs("g", { stroke: "#C6E33B", strokeWidth: "5", fill: "none", strokeLinecap: "square", children: [
                  /* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: "-90", y1: "-10", x2: "90", y2: "-10" }),
                  /* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: "-80", y1: "-10", x2: "-80", y2: "10" }),
                  /* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: "80", y1: "-10", x2: "80", y2: "10" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: "30", y1: "-80", x2: "-30", y2: "50", stroke: "#C6E33B", strokeWidth: "5", transform: `rotate(${fdRollAngle})` })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports$1.jsx(
          SvgTooltipGroup,
          {
            transform: "translate(260, 0)",
            description: "Шкала глиссады и указатель отклонения.",
            children: /* @__PURE__ */ jsxRuntimeExports$1.jsxs("g", { fill: "white", children: [
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("circle", { cx: "0", cy: "-60", r: "3" }),
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("circle", { cx: "0", cy: "-30", r: "3" }),
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: "-10", y1: "0", x2: "10", y2: "0", stroke: "white", strokeWidth: "3" }),
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("circle", { cx: "0", cy: "30", r: "3" }),
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("circle", { cx: "0", cy: "60", r: "3" }),
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("path", { d: "M -5 10 L -25 10 L -25 25 L -5 25 L 5 17.5 Z", fill: "#C6E33B", stroke: "#000", strokeWidth: "1" })
            ] })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports$1.jsx(
          SvgTooltipGroup,
          {
            transform: "translate(-260, 0)",
            description: "Шкала localizer и указатель бокового отклонения.",
            children: /* @__PURE__ */ jsxRuntimeExports$1.jsxs("g", { fill: "white", children: [
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("circle", { cx: "0", cy: "-60", r: "3" }),
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("circle", { cx: "0", cy: "-30", r: "3" }),
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("line", { x1: "-12", y1: "0", x2: "12", y2: "0", stroke: "white", strokeWidth: "5" }),
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("circle", { cx: "0", cy: "0", r: "12", fill: "none", stroke: "white", strokeWidth: "2" }),
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("circle", { cx: "0", cy: "30", r: "3" }),
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("circle", { cx: "0", cy: "60", r: "3" }),
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("path", { d: "M 0 -13 L 0 5 M -15 5 L 15 5", stroke: "white", strokeWidth: "3", fill: "none", transform: "translate(0, 15)" })
            ] })
          }
        )
      ]
    }
  ) });
};
registerPanelKitWidget({
  id: "pfd2",
  name: "PFD-2 (ADI)",
  iconName: "CircleDot",
  Component: PFD2Instrument,
  tooltip: "PFD-2 (ADI) — альтернативный авиагоризонт с тангажом, креном, шкалой крена и индикатором скольжения.",
  frameVariables: [
    "PitchAngle",
    "RollAngle"
  ]
});
const finite = (v) => typeof v === "number" && Number.isFinite(v) ? v : 0;
const fmt = (v, d = 1) => typeof v === "number" && Number.isFinite(v) ? v.toFixed(d) : "—";
const LoadingFallback = () => /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "w-full h-full bg-[#0a0a14] flex items-center justify-center select-none", children: /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "text-white/20 text-sm font-mono", children: "Loading 3D engine…" }) });
let RealScene = null;
{
  RealScene = reactExports$1.lazy(() => __vitePreload(() => import("./RealAircraft3DScene-Bk4tAklT.js"), true ? [] : void 0).then((m) => ({ default: m.RealAircraft3DScene })));
}
const Aircraft3DStub = reactExports$1.memo(({ frame }) => {
  const pitch = finite(frame == null ? void 0 : frame.PitchAngle);
  const roll = finite(frame == null ? void 0 : frame.RollAngle);
  const heading = finite(frame == null ? void 0 : frame.Heading1);
  const alt = frame == null ? void 0 : frame.RAltitude;
  const cas = finite(frame == null ? void 0 : frame.CAS);
  const vy = finite(frame == null ? void 0 : frame.Vy);
  return /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "w-full h-full relative bg-[#0a0a14] overflow-hidden select-none flex flex-col items-center justify-center", children: [
    /* @__PURE__ */ jsxRuntimeExports$1.jsx(
      "div",
      {
        className: "absolute inset-0 opacity-[0.025]",
        style: {
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px"
        }
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "relative z-10 mb-6", children: /* @__PURE__ */ jsxRuntimeExports$1.jsx("svg", { width: "100", height: "64", viewBox: "0 0 100 64", className: "text-cyan-500/30", fill: "currentColor", children: /* @__PURE__ */ jsxRuntimeExports$1.jsx("path", { d: "M50 4 L57 32 L90 34 L94 30 L90 34 L94 38 L90 34 L57 36 L50 60 L43 36 L10 34 L6 30 L10 34 L6 38 L10 34 L43 32 Z" }) }) }),
    /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "text-white/15 text-xl font-mono tracking-[0.3em] uppercase mb-4 z-10", children: "3D Aircraft" }),
    /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "text-white/8 text-xs font-mono tracking-wider mb-10 z-10", children: "Flight Visualization · Coming Soon" }),
    /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "absolute top-4 left-4 text-[11px] font-mono text-white/40 leading-tight z-10", children: [
      /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { children: [
        "PITCH ",
        /* @__PURE__ */ jsxRuntimeExports$1.jsxs("span", { className: "text-cyan-400/50", children: [
          fmt(pitch),
          "°"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { children: [
        "ROLL",
        "  ",
        /* @__PURE__ */ jsxRuntimeExports$1.jsxs("span", { className: "text-cyan-400/50", children: [
          fmt(roll),
          "°"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "absolute top-4 right-4 text-[11px] font-mono text-white/40 leading-tight text-right z-10", children: [
      /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { children: [
        "HDG ",
        /* @__PURE__ */ jsxRuntimeExports$1.jsxs("span", { className: "text-cyan-400/50", children: [
          Math.round(heading).toString().padStart(3, "0"),
          "°"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { children: [
        "ALT ",
        /* @__PURE__ */ jsxRuntimeExports$1.jsxs("span", { className: "text-orange-400/50", children: [
          fmt(alt, 0),
          " м"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "absolute bottom-4 left-4 text-[11px] font-mono text-white/40 leading-tight z-10", children: [
      /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { children: [
        "CAS ",
        /* @__PURE__ */ jsxRuntimeExports$1.jsx("span", { className: "text-green-400/50", children: fmt(cas, 0) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { children: [
        "Vy",
        "  ",
        /* @__PURE__ */ jsxRuntimeExports$1.jsx("span", { className: "text-green-400/50", children: fmt(vy) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "absolute top-4 left-1/2 -translate-x-1/2 flex gap-1 z-10", children: ["🔵", "🟢", "🟡", "🔴"].map((icon, i) => /* @__PURE__ */ jsxRuntimeExports$1.jsx("span", { className: "px-2 py-0.5 text-[13px] rounded bg-white/[0.03] text-white/15 leading-none", children: icon }, i)) }),
    /* @__PURE__ */ jsxRuntimeExports$1.jsx("span", { className: "absolute bottom-4 right-4 px-2 py-0.5 text-[11px] rounded bg-white/[0.03] text-white/15 z-10 font-mono", children: "✈ Primitive" }),
    /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] font-mono text-white/12 z-10", children: [
      "v",
      APP_VERSION
    ] })
  ] });
}, (prev, next) => {
  const pf = prev.frame;
  const nf = next.frame;
  if (!pf || !nf) return false;
  return pf.PitchAngle === nf.PitchAngle && pf.RollAngle === nf.RollAngle && pf.Heading1 === nf.Heading1 && pf.CAS === nf.CAS && pf.Vy === nf.Vy && pf.RAltitude === nf.RAltitude;
});
const Aircraft3DInstrument$1 = reactExports$1.memo(({ frame }) => {
  if (RealScene) {
    return /* @__PURE__ */ jsxRuntimeExports$1.jsx(reactExports$1.Suspense, { fallback: /* @__PURE__ */ jsxRuntimeExports$1.jsx(LoadingFallback, {}), children: /* @__PURE__ */ jsxRuntimeExports$1.jsx(RealScene, { frame }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports$1.jsx(Aircraft3DStub, { frame });
});
registerPanelKitWidget({
  id: "aircraft-3d",
  name: "3D Aircraft",
  iconName: "Plane",
  Component: Aircraft3DInstrument$1,
  tooltip: "3D Aircraft — визуализация пространственного положения. Pitch, Roll, Heading, скорость, высота.",
  frameVariables: ["PitchAngle", "RollAngle", "Heading1", "CAS", "Vy", "RAltitude"]
});
const Aircraft3DInstrument$2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Aircraft3DInstrument$1
}, Symbol.toStringTag, { value: "Module" }));
const MAX_POINTS = 300;
const TIME_WINDOW_SEC = 30;
function formatValue(v) {
  const abs = Math.abs(v);
  if (abs >= 1e4) return v.toFixed(0);
  if (abs >= 1e3) return v.toFixed(1);
  if (abs >= 100) return v.toFixed(1);
  if (abs >= 10) return v.toFixed(2);
  if (abs >= 1) return v.toFixed(2);
  return v.toFixed(3);
}
const GraphRenderer = ({
  frame,
  fieldKey,
  label,
  unit = "",
  lineColor = "#00ff88"
}) => {
  const canvasRef = reactExports$1.useRef(null);
  const containerRef = reactExports$1.useRef(null);
  const bufferRef = reactExports$1.useRef([]);
  const sizeRef = reactExports$1.useRef({ w: 0, h: 0 });
  reactExports$1.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const dpr = window.devicePixelRatio || 1;
        const w = Math.floor(entry.contentRect.width * dpr);
        const h = Math.floor(entry.contentRect.height * dpr);
        sizeRef.current = { w, h };
        const canvas = canvasRef.current;
        if (canvas) {
          canvas.width = w;
          canvas.height = h;
          canvas.style.width = entry.contentRect.width + "px";
          canvas.style.height = entry.contentRect.height + "px";
        }
      }
      draw();
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const draw = reactExports$1.useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { w, h } = sizeRef.current;
    if (w === 0 || h === 0) return;
    const buf = bufferRef.current;
    ctx.fillStyle = "#0a0a0f";
    ctx.fillRect(0, 0, w, h);
    if (buf.length < 2) {
      ctx.fillStyle = "#555";
      ctx.font = `${Math.max(10, h / 20)}px monospace`;
      ctx.textAlign = "center";
      ctx.fillText("Waiting for data...", w / 2, h / 2);
      return;
    }
    const margin = { top: 26, right: 14, bottom: 20, left: 50 };
    const pw = w - margin.left - margin.right;
    const ph = h - margin.top - margin.bottom;
    const vals = buf.map((p) => p.v);
    let yMin = Math.min(...vals);
    let yMax = Math.max(...vals);
    if (yMax === yMin) {
      yMin -= 1;
      yMax += 1;
    }
    const pad = (yMax - yMin) * 0.1;
    yMin -= pad;
    yMax += pad;
    const tMin = buf[0].t;
    const tMax = buf[buf.length - 1].t;
    const tRange = tMax - tMin || 1;
    const gridLines = 4;
    const yFontSize = Math.max(9, h / 48);
    ctx.strokeStyle = "#1a1a2e";
    ctx.lineWidth = 1;
    for (let i = 0; i <= gridLines; i++) {
      const y = margin.top + ph * i / gridLines;
      ctx.beginPath();
      ctx.moveTo(margin.left, y);
      ctx.lineTo(w - margin.right, y);
      ctx.stroke();
      const labelVal = yMax - (yMax - yMin) * i / gridLines;
      ctx.fillStyle = "#777";
      ctx.font = `${yFontSize}px monospace`;
      ctx.textAlign = "right";
      ctx.fillText(formatValue(labelVal), margin.left - 5, y + yFontSize / 3);
    }
    const xFontSize = Math.max(9, h / 52);
    ctx.fillStyle = "#555";
    ctx.font = `${xFontSize}px monospace`;
    ctx.textAlign = "center";
    for (let i = 0; i <= 3; i++) {
      const relSec = tRange * (1 - i / 3);
      const x = margin.left + pw * (i / 3);
      ctx.fillText(`-${relSec.toFixed(0)}s`, x, h - 4);
    }
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 1.5;
    ctx.lineJoin = "round";
    ctx.beginPath();
    for (let i = 0; i < buf.length; i++) {
      const x = margin.left + (buf[i].t - tMin) / tRange * pw;
      const y = margin.top + ph - (buf[i].v - yMin) / (yMax - yMin) * ph;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.globalAlpha = 0.07;
    ctx.fillStyle = lineColor;
    ctx.lineTo(margin.left + pw, margin.top + ph);
    ctx.lineTo(margin.left, margin.top + ph);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#aaa";
    ctx.font = `bold ${Math.max(11, h / 32)}px monospace`;
    ctx.textAlign = "left";
    ctx.fillText(label, margin.left, 16);
    const cv = buf[buf.length - 1].v;
    ctx.fillStyle = lineColor;
    ctx.font = `bold ${Math.max(12, h / 28)}px monospace`;
    ctx.textAlign = "right";
    ctx.fillText(`${formatValue(cv)}${unit}`, w - margin.right, 16);
  }, [lineColor, label, unit]);
  const value = frame[fieldKey];
  const t0 = frame._t0_ms;
  reactExports$1.useEffect(() => {
    if (typeof value !== "number" || !Number.isFinite(value)) return;
    const buf = bufferRef.current;
    const now = t0 ? t0 / 1e3 : Date.now() / 1e3;
    const last = buf.length > 0 ? buf[buf.length - 1] : null;
    if (last && last.t === now && last.v === value) return;
    buf.push({ t: now, v: value });
    const cutoff = now - TIME_WINDOW_SEC;
    while (buf.length > 1 && buf[0].t < cutoff) buf.shift();
    while (buf.length > MAX_POINTS) buf.shift();
    draw();
  }, [value, t0, draw]);
  return /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { ref: containerRef, className: "w-full h-full", children: /* @__PURE__ */ jsxRuntimeExports$1.jsx("canvas", { ref: canvasRef, className: "w-full h-full block" }) });
};
function createGraphWidget(config) {
  const {
    id,
    name,
    fieldKey,
    label,
    unit = "",
    lineColor = "#00ff88",
    iconName = "TrendingUp",
    tooltip
  } = config;
  const Component = ({ frame }) => /* @__PURE__ */ jsxRuntimeExports$1.jsx(
    GraphRenderer,
    {
      frame,
      fieldKey,
      label,
      unit,
      lineColor
    }
  );
  registerPanelKitWidget({
    id,
    name,
    iconName,
    Component,
    tooltip: tooltip ?? `Graph: ${label} (${fieldKey})`,
    frameVariables: [fieldKey]
  });
  return Component;
}
createGraphWidget({
  id: "graph-cas",
  name: "Graph: Airspeed",
  fieldKey: "CAS",
  label: "CAS",
  unit: " kt",
  lineColor: "#00e676",
  tooltip: "График приборной скорости (CAS)"
});
createGraphWidget({
  id: "graph-alt",
  name: "Graph: Altitude",
  fieldKey: "BaroAltitude",
  label: "Altitude",
  unit: " ft",
  lineColor: "#4fc3f7",
  tooltip: "График барометрической высоты"
});
createGraphWidget({
  id: "graph-roll",
  name: "Graph: Roll",
  fieldKey: "RollAngle",
  label: "Roll",
  unit: "°",
  lineColor: "#ff8a65",
  tooltip: "График угла крена"
});
createGraphWidget({
  id: "graph-pitch",
  name: "Graph: Pitch",
  fieldKey: "PitchAngle",
  label: "Pitch",
  unit: "°",
  lineColor: "#ffd54f",
  tooltip: "График угла тангажа"
});
createGraphWidget({
  id: "graph-vs",
  name: "Graph: Vert Speed",
  fieldKey: "Vy",
  label: "Vy",
  unit: " fpm",
  lineColor: "#ce93d8",
  tooltip: "График вертикальной скорости"
});
createGraphWidget({
  id: "graph-hdg",
  name: "Graph: Heading",
  fieldKey: "MagneticHeading",
  label: "Heading",
  unit: "°",
  lineColor: "#81d4fa",
  tooltip: "График магнитного курса"
});
createGraphWidget({
  id: "graph-aoa",
  name: "Graph: AoA",
  fieldKey: "AoA",
  label: "AoA",
  unit: "°",
  lineColor: "#ef5350",
  tooltip: "График угла атаки"
});
createGraphWidget({
  id: "graph-n1",
  name: "Graph: N1 Left",
  fieldKey: "Engine_N1_Left",
  label: "N1 Left",
  unit: "%",
  lineColor: "#a5d6a7",
  tooltip: "График оборотов N1 левого двигателя"
});
createGraphWidget({
  id: "graph-g",
  name: "Graph: G-Load",
  fieldKey: "NormalG",
  label: "G-Load",
  unit: " g",
  lineColor: "#ffcc80",
  tooltip: "График нормальной перегрузки (Ny)"
});
createGraphWidget({
  id: "graph-ra",
  name: "Graph: Radio Alt",
  fieldKey: "RadioAltitude",
  label: "Radio Alt",
  unit: " ft",
  lineColor: "#80cbc4",
  tooltip: "График радиовысоты"
});
const CURRENT_PROFILE_ID = "current";
const PANELS_API = "/api/panels";
const CURRENT_CONFIG_API = "/api/panel/config/current";
async function getProfiles$1() {
  try {
    const [panelsRes, currentRes] = await Promise.all([
      fetch(PANELS_API, { cache: "no-store" }),
      fetch(CURRENT_CONFIG_API, { cache: "no-store" })
    ]);
    const profiles = [];
    if (currentRes.ok) {
      profiles.push({ id: CURRENT_PROFILE_ID, name: "Current" });
    }
    if (panelsRes.ok) {
      const list = await panelsRes.json();
      for (const p of list) {
        profiles.push({ id: p.name, name: p.name, updatedAt: p.updatedAt });
      }
    }
    return profiles;
  } catch {
    return [{ id: CURRENT_PROFILE_ID, name: "Current" }];
  }
}
async function saveProfile(name, treeJson) {
  try {
    const data = JSON.parse(treeJson);
    const res = await fetch(`${PANELS_API}/${encodeURIComponent(name)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data })
    });
    return res.ok;
  } catch {
    return false;
  }
}
async function saveCurrentProfile(treeJson) {
  try {
    const data = JSON.parse(treeJson);
    const res = await fetch(CURRENT_CONFIG_API, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    return res.ok;
  } catch {
    return false;
  }
}
async function loadProfile$1(name) {
  try {
    if (name === CURRENT_PROFILE_ID) {
      const res2 = await fetch(CURRENT_CONFIG_API, { cache: "no-store" });
      if (!res2.ok) return null;
      const data = await res2.json();
      return JSON.stringify(data);
    }
    const res = await fetch(`${PANELS_API}/${encodeURIComponent(name)}`, { cache: "no-store" });
    if (!res.ok) return null;
    const json = await res.json();
    return JSON.stringify(json.data);
  } catch {
    return null;
  }
}
async function deleteProfile(name) {
  if (name === CURRENT_PROFILE_ID) return false;
  try {
    const res = await fetch(`${PANELS_API}/${encodeURIComponent(name)}`, {
      method: "DELETE"
    });
    return res.ok;
  } catch {
    return false;
  }
}
const PanelBuilder = ({ onBack }) => {
  const { frame } = useTelemetry();
  const [rootNode, setRootNode] = reactExports$1.useState(createEmptyRoot);
  const [configStatus, setConfigStatus] = reactExports$1.useState("Loading current config...");
  const [panelMenu, setPanelMenu] = reactExports$1.useState(null);
  const [udpDialogOpen, setUdpDialogOpen] = reactExports$1.useState(false);
  const hasHydrated = reactExports$1.useRef(false);
  const lastSavedJson = reactExports$1.useRef(null);
  const [profiles, setProfiles] = reactExports$1.useState([]);
  const [selectedProfileId, setSelectedProfileId] = reactExports$1.useState(CURRENT_PROFILE_ID);
  const [profilesLoading, setProfilesLoading] = reactExports$1.useState(true);
  const currentTreeJson = reactExports$1.useCallback(() => {
    return JSON.stringify(toLegacyPanelNode(rootNode), null, 2);
  }, [rootNode]);
  const refreshProfiles = reactExports$1.useCallback(async () => {
    try {
      const list = await getProfiles$1();
      setProfiles(list);
      return list;
    } catch {
      return [];
    }
  }, []);
  const saveToProfile = reactExports$1.useCallback(async (profileId) => {
    const json = currentTreeJson();
    const name = profileId === CURRENT_PROFILE_ID ? "Current" : profileId;
    const ok = profileId === CURRENT_PROFILE_ID ? await saveCurrentProfile(json) : await saveProfile(profileId, json);
    if (ok) {
      lastSavedJson.current = json;
      setConfigStatus(`Saved to "${name}"`);
    } else {
      setConfigStatus(`Failed to save "${name}"`);
    }
  }, [currentTreeJson]);
  const loadFromProfile = reactExports$1.useCallback(async (profileId) => {
    const json = await loadProfile$1(profileId);
    if (!json) {
      setConfigStatus(`Failed to load profile`);
      return;
    }
    try {
      const parsed = JSON.parse(json);
      const normalized = normalizePanelNode(parsed);
      if (normalized) {
        lastSavedJson.current = json;
        setRootNode(normalized);
        setSelectedProfileId(profileId);
        const name = profileId === CURRENT_PROFILE_ID ? "Current" : profileId;
        setConfigStatus(`Loaded "${name}"`);
      } else {
        setConfigStatus(`Invalid profile data`);
      }
    } catch {
      setConfigStatus(`Failed to parse profile`);
    }
  }, []);
  const handleSaveAs = reactExports$1.useCallback(async () => {
    const name = prompt("Profile name:");
    if (!name || !name.trim()) return;
    const ok = await saveProfile(name.trim(), currentTreeJson());
    if (ok) {
      await refreshProfiles();
      setSelectedProfileId(name.trim());
      setConfigStatus(`Saved as "${name.trim()}"`);
    } else {
      setConfigStatus(`Failed to save "${name.trim()}"`);
    }
  }, [currentTreeJson, refreshProfiles]);
  const handleDeleteProfile = reactExports$1.useCallback(async () => {
    if (selectedProfileId === CURRENT_PROFILE_ID) return;
    const name = selectedProfileId;
    if (!confirm(`Delete profile "${name}"?`)) return;
    const ok = await deleteProfile(name);
    if (ok) {
      await refreshProfiles();
      setSelectedProfileId(CURRENT_PROFILE_ID);
      await loadFromProfile(CURRENT_PROFILE_ID);
      setConfigStatus(`Deleted "${name}", switched to Current`);
    } else {
      setConfigStatus(`Failed to delete "${name}"`);
    }
  }, [selectedProfileId, refreshProfiles, loadFromProfile]);
  reactExports$1.useEffect(() => {
    let cancelled = false;
    const init = async () => {
      await refreshProfiles();
      if (cancelled) return;
      const pending = window.__pendingPanelLoad;
      if (pending) {
        window.__pendingPanelLoad = null;
        const normalized = normalizePanelNode(pending);
        if (normalized) {
          lastSavedJson.current = JSON.stringify(toLegacyPanelNode(normalized), null, 2);
          setRootNode(normalized);
          setConfigStatus(`Loaded from profile`);
        } else {
          setConfigStatus(`Invalid profile panel config`);
        }
        if (!cancelled) {
          hasHydrated.current = true;
          setProfilesLoading(false);
        }
        return;
      }
      try {
        const res = await fetch(CURRENT_CONFIG_API$1, { cache: "no-store" });
        if (cancelled) return;
        if (res.ok) {
          const parsed = await res.json();
          const normalized = normalizePanelNode(parsed);
          if (normalized) {
            lastSavedJson.current = JSON.stringify(toLegacyPanelNode(normalized), null, 2);
            setRootNode(normalized);
            setConfigStatus(`Loaded from ${CURRENT_CONFIG_FILE_NAME}`);
          } else {
            setConfigStatus(`Invalid ${CURRENT_CONFIG_FILE_NAME}; empty panel`);
          }
        } else if (res.status === 404) {
          setConfigStatus(`No ${CURRENT_CONFIG_FILE_NAME}; empty panel`);
        } else {
          setConfigStatus(`Cannot read ${CURRENT_CONFIG_FILE_NAME}; empty panel`);
        }
      } catch {
        if (!cancelled) setConfigStatus(`Cannot read ${CURRENT_CONFIG_FILE_NAME}; empty panel`);
      } finally {
        if (!cancelled) {
          hasHydrated.current = true;
          setProfilesLoading(false);
        }
      }
    };
    void init();
    return () => {
      cancelled = true;
    };
  }, [CURRENT_CONFIG_API$1, refreshProfiles]);
  reactExports$1.useEffect(() => {
    let cancelled = false;
    const loadPanelMenu = async () => {
      try {
        const response = await fetch(PANEL_MENU_API, { cache: "no-store" });
        if (cancelled) return;
        if (!response.ok) return;
        const parsed = await response.json();
        if (isPanelKitMenuConfig(parsed)) {
          setPanelMenu(parsed);
        }
      } catch {
      }
    };
    void loadPanelMenu();
    return () => {
      cancelled = true;
    };
  }, []);
  reactExports$1.useEffect(() => {
    if (!hasHydrated.current) return;
    const json = currentTreeJson();
    if (json === lastSavedJson.current) return;
    window.__panelBuilderRootNode = toLegacyPanelNode(rootNode);
    const timeoutId = window.setTimeout(() => {
      lastSavedJson.current = json;
      void saveCurrentProfile(json);
    }, 300);
    return () => window.clearTimeout(timeoutId);
  }, [rootNode, currentTreeJson]);
  const saveCurrentConfig = reactExports$1.useCallback(async (node) => {
    const json = JSON.stringify(toLegacyPanelNode(node), null, 2);
    setConfigStatus(`Saving ${CURRENT_CONFIG_FILE_NAME}...`);
    try {
      const response = await fetch(CURRENT_CONFIG_API$1, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: json
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      lastSavedJson.current = json;
      setConfigStatus(`Saved to ${CURRENT_CONFIG_FILE_NAME}`);
      return true;
    } catch (error) {
      console.warn("Failed to save current panel config", error);
      setConfigStatus(`Autosave unavailable: ${CURRENT_CONFIG_FILE_NAME}`);
      return false;
    }
  }, []);
  const handleSaveFile = async () => {
    const json = JSON.stringify(toLegacyPanelNode(rootNode), null, 2);
    const fsWindow = window;
    if (fsWindow.showSaveFilePicker) {
      try {
        const handle = await fsWindow.showSaveFilePicker({
          suggestedName: CURRENT_CONFIG_FILE_NAME,
          types: [{ description: "JSON Files", accept: { "application/json": [".json"] } }]
        });
        const writable = await handle.createWritable();
        await writable.write(json);
        await writable.close();
        await saveCurrentConfig(rootNode);
        setConfigStatus(`Exported to ${handle.name}; current updated`);
        return;
      } catch (err) {
        if (err instanceof DOMException && (err.name === "AbortError" || err.name === "SecurityError")) {
          return;
        }
      }
    }
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = CURRENT_CONFIG_FILE_NAME;
    a.click();
    URL.revokeObjectURL(url);
    await saveCurrentConfig(rootNode);
    setConfigStatus(`Downloaded ${CURRENT_CONFIG_FILE_NAME}; current updated`);
  };
  const handleBack = async () => {
    await saveCurrentConfig(rootNode);
    onBack();
  };
  const handleLoadFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      var _a;
      try {
        const json = (_a = e.target) == null ? void 0 : _a.result;
        const parsed = JSON.parse(json);
        const normalized = normalizePanelNode(parsed);
        if (normalized) {
          setRootNode(normalized);
          setConfigStatus(`Imported; will autosave to ${CURRENT_CONFIG_FILE_NAME}`);
        } else {
          alert("Invalid configuration file structure.");
        }
      } catch {
        alert("Failed to parse the configuration file.");
      }
    };
    reader.readAsText(file);
  };
  const onFileChange = (e) => {
    var _a;
    const file = (_a = e.target.files) == null ? void 0 : _a[0];
    if (file) handleLoadFile(file);
    if (e.target) e.target.value = "";
  };
  const triggerLoadFile = reactExports$1.useCallback(() => {
    var _a;
    (_a = document.getElementById("panel-builder-load")) == null ? void 0 : _a.click();
  }, []);
  const menuActions = reactExports$1.useMemo(
    () => ({
      openUdpDialog: () => setUdpDialogOpen(true),
      saveConfig: () => void handleSaveFile(),
      loadConfig: triggerLoadFile,
      saveCurrentConfig: () => void saveCurrentConfig(rootNode)
    }),
    [rootNode, saveCurrentConfig, triggerLoadFile]
  );
  const availableWidgets = reactExports$1.useMemo(
    () => getAllRegisteredPanelKitWidgets().map((widget) => ({
      id: widget.id,
      name: widget.name,
      iconName: widget.iconName
    })),
    []
  );
  return /* @__PURE__ */ jsxRuntimeExports$1.jsx(PanelMenuProvider, { menu: panelMenu, actions: menuActions, children: /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "flex flex-col h-screen w-screen bg-[#0a0a0f] text-[#d1d5db] font-sans overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports$1.jsxs("header", { className: "h-12 border-b border-[#2d2e30] bg-[#161719] flex items-center justify-between px-4 shrink-0", children: [
      /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports$1.jsx(
          "button",
          {
            onClick: () => void handleBack(),
            className: "p-1.5 hover:bg-[#252628] rounded-md text-gray-400 hover:text-white transition-colors",
            title: "Back to Hub",
            children: /* @__PURE__ */ jsxRuntimeExports$1.jsx(ArrowLeft, { className: "w-5 h-5" })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "h-4 w-[1px] bg-[#2d2e30]" }),
        /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "w-2 h-2 bg-amber-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.5)]" }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("span", { className: "text-sm font-bold tracking-wide text-white", children: "Panel Builder" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "h-4 w-[1px] bg-[#2d2e30]" }),
        /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports$1.jsx(
            "select",
            {
              className: "bg-[#252628] border border-[#2d2e30] text-[11px] text-white rounded px-2 py-1 max-w-[160px] cursor-pointer outline-none focus:border-blue-500",
              value: selectedProfileId,
              onChange: async (e) => {
                const newId2 = e.target.value;
                if (newId2 !== selectedProfileId) {
                  await saveToProfile(selectedProfileId);
                  await loadFromProfile(newId2);
                }
              },
              disabled: profilesLoading,
              children: profiles.map((p) => /* @__PURE__ */ jsxRuntimeExports$1.jsx("option", { value: p.id, children: p.id === CURRENT_PROFILE_ID ? `⚡ ${p.name}` : p.name }, p.id))
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx(
            "button",
            {
              onClick: () => void saveToProfile(selectedProfileId),
              className: "p-1 hover:bg-[#252628] rounded text-gray-400 hover:text-emerald-400 transition-colors",
              title: "Save to profile",
              children: /* @__PURE__ */ jsxRuntimeExports$1.jsx(Save, { className: "w-3.5 h-3.5" })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx(
            "button",
            {
              onClick: () => void handleSaveAs(),
              className: "p-1 hover:bg-[#252628] rounded text-gray-400 hover:text-blue-400 transition-colors",
              title: "Save as new profile",
              children: /* @__PURE__ */ jsxRuntimeExports$1.jsx(Copy, { className: "w-3.5 h-3.5" })
            }
          ),
          selectedProfileId !== CURRENT_PROFILE_ID && /* @__PURE__ */ jsxRuntimeExports$1.jsx(
            "button",
            {
              onClick: () => void handleDeleteProfile(),
              className: "p-1 hover:bg-[#252628] rounded text-gray-400 hover:text-red-400 transition-colors",
              title: "Delete profile",
              children: /* @__PURE__ */ jsxRuntimeExports$1.jsx(Trash2, { className: "w-3.5 h-3.5" })
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports$1.jsxs(
          "button",
          {
            onClick: () => {
              var _a;
              return (_a = document.getElementById("panel-builder-load")) == null ? void 0 : _a.click();
            },
            className: "px-3 py-1.5 bg-[#252628] hover:bg-[#2d2e30] border border-[#2d2e30] text-[10px] font-bold uppercase transition-colors flex items-center gap-2 text-white rounded-md",
            title: "Load layout from JSON file",
            children: [
              /* @__PURE__ */ jsxRuntimeExports$1.jsx(Upload, { className: "w-3.5 h-3.5" }),
              "Load"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports$1.jsx(
          "input",
          {
            type: "file",
            id: "panel-builder-load",
            className: "hidden",
            accept: ".json,application/json",
            onChange: onFileChange
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports$1.jsxs(
          "button",
          {
            onClick: handleSaveFile,
            className: "px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold uppercase transition-colors flex items-center gap-2 rounded-md",
            title: "Save layout to JSON file",
            children: [
              /* @__PURE__ */ jsxRuntimeExports$1.jsx(Download, { className: "w-3.5 h-3.5" }),
              "Save"
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "flex flex-1 overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports$1.jsx("main", { className: "flex-1 bg-[#0a0a0f] p-4 flex gap-2 relative", children: /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "w-full h-full border-2 border-dashed border-[#2d2e30] flex relative", children: /* @__PURE__ */ jsxRuntimeExports$1.jsx(
        PanelCanvas,
        {
          node: rootNode,
          onChange: setRootNode,
          onRemoveNode: () => setRootNode(createEmptyRoot()),
          isRoot: true,
          data: frame,
          renderWidget: (node, clearWidget) => /* @__PURE__ */ jsxRuntimeExports$1.jsx(
            AviationWidget,
            {
              widgetId: node.widgetId,
              frame,
              onRemove: clearWidget
            }
          )
        }
      ) }) }),
      /* @__PURE__ */ jsxRuntimeExports$1.jsx(Sidebar, { items: availableWidgets, getIcon: getPanelKitIcon })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports$1.jsxs("footer", { className: "h-6 bg-[#161719] border-t border-[#2d2e30] flex items-center px-4 justify-between text-[10px] shrink-0", children: [
      /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "flex gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports$1.jsx("span", { className: "text-emerald-500", children: "READY" }),
        /* @__PURE__ */ jsxRuntimeExports$1.jsx("span", { className: "text-gray-500", children: "|" }),
        /* @__PURE__ */ jsxRuntimeExports$1.jsx("span", { className: "text-gray-400", children: "NODE_RENDERER: ACTIVE" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "text-gray-500 font-mono", children: configStatus })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports$1.jsx(UdpSourceDialog, { open: udpDialogOpen, onClose: () => setUdpDialogOpen(false) })
  ] }) });
};
const renderNode = (node, frame) => {
  if (node.type === "split" && node.children) {
    const isVertical = node.splitDirection === "vertical";
    const ratio = node.splitRatio ?? 0.5;
    return /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: `w-full h-full flex ${isVertical ? "flex-row" : "flex-col"} overflow-hidden relative`, children: [
      /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { style: { flex: `${ratio * 100} 1 0%` }, className: "overflow-hidden min-w-0 min-h-0", children: renderNode(node.children[0], frame) }),
      /* @__PURE__ */ jsxRuntimeExports$1.jsx(
        "div",
        {
          className: `flex-shrink-0 bg-[#0a0a0f] ${isVertical ? "w-2 h-full" : "h-2 w-full"}`,
          children: /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: `bg-[#2d2e30] ${isVertical ? "w-[1px] h-full mx-auto" : "h-[1px] w-full my-auto"}` })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { style: { flex: `${(1 - ratio) * 100} 1 0%` }, className: "overflow-hidden min-w-0 min-h-0", children: renderNode(node.children[1], frame) })
    ] });
  }
  if (node.type === "widget" && node.widgetId) {
    return /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "w-full h-full bg-[#161719] border border-[#2d2e30]", children: /* @__PURE__ */ jsxRuntimeExports$1.jsx(AviationWidget, { widgetId: node.widgetId, frame, readOnly: true, onRemove: () => void 0 }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "w-full h-full bg-[#161719] border border-[#2d2e30] flex items-center justify-center text-gray-600 text-[10px] uppercase tracking-wider", children: "Empty panel" });
};
const PanelDisplay = ({ frame }) => {
  const [rootNode, setRootNode] = reactExports$1.useState(null);
  const [status, setStatus] = reactExports$1.useState(`Loading ${CURRENT_CONFIG_FILE_NAME}...`);
  reactExports$1.useEffect(() => {
    let cancelled = false;
    const loadConfig = async () => {
      try {
        const response = await fetch(CURRENT_CONFIG_API$1, { cache: "no-store" });
        if (cancelled) return;
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const parsed = await response.json();
        const normalized = normalizePanelNode(parsed);
        if (!normalized) {
          throw new Error("Invalid panel config");
        }
        setRootNode(normalized);
        setStatus("");
      } catch (error) {
        console.warn("Failed to load panel config for display", error);
        if (!cancelled) {
          setRootNode(null);
          setStatus(`Cannot load ${CURRENT_CONFIG_FILE_NAME}`);
        }
      }
    };
    void loadConfig();
    return () => {
      cancelled = true;
    };
  }, []);
  if (!rootNode) {
    return /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "w-full h-full bg-black flex items-center justify-center text-white/50 text-sm", children: status });
  }
  return /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "w-full h-full bg-[#0a0a0f] overflow-hidden", children: renderNode(rootNode, frame) });
};
const telemetryRef = { current: null };
const aircraftControlsRef = {
  current: { active: false, pitch: 0, roll: 0, yaw: 0, throttle: 0, modelYaw: 0, _wasActive: false, telemetryLocked: false, onTelemetryUpdate: null }
};
const PROFILES_API = "/api/profiles";
async function getProfiles() {
  try {
    const res = await fetch(PROFILES_API, { cache: "no-store" });
    if (!res.ok) return [];
    const list = await res.json();
    return list;
  } catch {
    return [];
  }
}
async function loadProfile(id) {
  try {
    const res = await fetch(`${PROFILES_API}/${encodeURIComponent(id)}`, { cache: "no-store" });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
const MAX_SAMPLES$1 = 5e3;
function percentile$1(sorted, p) {
  if (sorted.length === 0) return 0;
  const idx = Math.ceil(p / 100 * sorted.length) - 1;
  return sorted[Math.max(0, Math.min(idx, sorted.length - 1))];
}
const samples = [];
let sampleCount = 0;
function addSample(s) {
  if (samples.length < MAX_SAMPLES$1) {
    samples.push(s);
  } else {
    samples[sampleCount % MAX_SAMPLES$1] = s;
  }
  sampleCount++;
}
function getStats() {
  if (samples.length === 0) {
    return { count: 0, p50: 0, p95: 0, p99: 0, max: 0, over100: 0, over100Pct: 0, processingP99: 0 };
  }
  const displaySorted = samples.map((s) => s.display_ms).sort((a, b) => a - b);
  const procSorted = samples.map((s) => s.processing_ms).sort((a, b) => a - b);
  const over100 = displaySorted.filter((v) => v > 100).length;
  return {
    count: samples.length,
    p50: percentile$1(displaySorted, 50),
    p95: percentile$1(displaySorted, 95),
    p99: percentile$1(displaySorted, 99),
    max: displaySorted[displaySorted.length - 1],
    over100,
    over100Pct: samples.length > 0 ? over100 / samples.length * 100 : 0,
    processingP99: percentile$1(procSorted, 99)
  };
}
function exportCsv() {
  const header = "frame_id,t_recv_ms,t_decoded_ms,t_paint_ms,processing_ms,display_ms";
  const rows = samples.map(
    (s) => `${s.frame_id},${s.t_recv_ms},${s.t_decoded_ms},${s.t_paint_ms},${s.processing_ms},${s.display_ms}`
  );
  return [header, ...rows].join("\n");
}
const LatencyOverlay = reactExports$1.memo(() => {
  const [stats, setStats] = reactExports$1.useState(() => getStats());
  reactExports$1.useEffect(() => {
    const t = setInterval(() => setStats(getStats()), 500);
    return () => clearInterval(t);
  }, []);
  const handleExport = reactExports$1.useCallback(() => {
    const csv = exportCsv();
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `latency_${(/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);
  const handleReset = reactExports$1.useCallback(() => {
    samples.length = 0;
    sampleCount = 0;
    setStats(getStats());
  }, []);
  const fmt2 = (v) => v.toFixed(1);
  return /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { style: {
    position: "fixed",
    bottom: 8,
    left: 8,
    zIndex: 9999,
    background: "rgba(0,0,0,0.75)",
    backdropFilter: "blur(4px)",
    borderRadius: 6,
    padding: "6px 10px",
    fontFamily: "'Courier New', monospace",
    fontSize: 10,
    color: "#a0aec0",
    lineHeight: 1.5,
    border: "1px solid rgba(255,255,255,0.1)"
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { style: { fontWeight: 700, color: "#e2e8f0", marginBottom: 2 }, children: "⏱ Latency" }),
    /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { children: [
      "N: ",
      /* @__PURE__ */ jsxRuntimeExports$1.jsx("span", { style: { color: "#e2e8f0" }, children: stats.count })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { children: [
      "P50: ",
      /* @__PURE__ */ jsxRuntimeExports$1.jsx("span", { style: { color: "#48bb78" }, children: fmt2(stats.p50) }),
      " ",
      "P95: ",
      /* @__PURE__ */ jsxRuntimeExports$1.jsx("span", { style: { color: "#ecc94b" }, children: fmt2(stats.p95) }),
      " ",
      "P99: ",
      /* @__PURE__ */ jsxRuntimeExports$1.jsx("span", { style: { color: "#fc8181" }, children: fmt2(stats.p99) }),
      " ",
      "MAX: ",
      /* @__PURE__ */ jsxRuntimeExports$1.jsx("span", { style: { color: "#f56565" }, children: fmt2(stats.max) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { children: [
      ">100ms: ",
      /* @__PURE__ */ jsxRuntimeExports$1.jsxs("span", { style: { color: stats.over100 > 0 ? "#f56565" : "#48bb78" }, children: [
        stats.over100,
        " (",
        fmt2(stats.over100Pct),
        "%)"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { style: { display: "flex", gap: 4, marginTop: 4 }, children: [
      /* @__PURE__ */ jsxRuntimeExports$1.jsx(
        "button",
        {
          onClick: handleExport,
          style: {
            background: "rgba(59,130,246,0.3)",
            border: "1px solid #3b82f6",
            color: "#93c5fd",
            borderRadius: 3,
            padding: "1px 6px",
            fontSize: 9,
            cursor: "pointer",
            fontFamily: "inherit"
          },
          children: "CSV"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports$1.jsx(
        "button",
        {
          onClick: handleReset,
          style: {
            background: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.2)",
            color: "#a0aec0",
            borderRadius: 3,
            padding: "1px 6px",
            fontSize: 9,
            cursor: "pointer",
            fontFamily: "inherit"
          },
          children: "Reset"
        }
      )
    ] })
  ] });
});
LatencyOverlay.displayName = "LatencyOverlay";
var jsxRuntime = { exports: {} };
var reactJsxRuntime_production = {};
/**
 * @license React
 * react-jsx-runtime.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var hasRequiredReactJsxRuntime_production;
function requireReactJsxRuntime_production() {
  if (hasRequiredReactJsxRuntime_production) return reactJsxRuntime_production;
  hasRequiredReactJsxRuntime_production = 1;
  var REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element"), REACT_FRAGMENT_TYPE = Symbol.for("react.fragment");
  function jsxProd(type, config, maybeKey) {
    var key = null;
    void 0 !== maybeKey && (key = "" + maybeKey);
    void 0 !== config.key && (key = "" + config.key);
    if ("key" in config) {
      maybeKey = {};
      for (var propName in config)
        "key" !== propName && (maybeKey[propName] = config[propName]);
    } else maybeKey = config;
    config = maybeKey.ref;
    return {
      $$typeof: REACT_ELEMENT_TYPE,
      type,
      key,
      ref: void 0 !== config ? config : null,
      props: maybeKey
    };
  }
  reactJsxRuntime_production.Fragment = REACT_FRAGMENT_TYPE;
  reactJsxRuntime_production.jsx = jsxProd;
  reactJsxRuntime_production.jsxs = jsxProd;
  return reactJsxRuntime_production;
}
var hasRequiredJsxRuntime;
function requireJsxRuntime() {
  if (hasRequiredJsxRuntime) return jsxRuntime.exports;
  hasRequiredJsxRuntime = 1;
  {
    jsxRuntime.exports = requireReactJsxRuntime_production();
  }
  return jsxRuntime.exports;
}
var jsxRuntimeExports = requireJsxRuntime();
var react = { exports: {} };
var react_production = {};
/**
 * @license React
 * react.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var hasRequiredReact_production;
function requireReact_production() {
  if (hasRequiredReact_production) return react_production;
  hasRequiredReact_production = 1;
  var REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element"), REACT_PORTAL_TYPE = Symbol.for("react.portal"), REACT_FRAGMENT_TYPE = Symbol.for("react.fragment"), REACT_STRICT_MODE_TYPE = Symbol.for("react.strict_mode"), REACT_PROFILER_TYPE = Symbol.for("react.profiler"), REACT_CONSUMER_TYPE = Symbol.for("react.consumer"), REACT_CONTEXT_TYPE = Symbol.for("react.context"), REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref"), REACT_SUSPENSE_TYPE = Symbol.for("react.suspense"), REACT_MEMO_TYPE = Symbol.for("react.memo"), REACT_LAZY_TYPE = Symbol.for("react.lazy"), REACT_ACTIVITY_TYPE = Symbol.for("react.activity"), MAYBE_ITERATOR_SYMBOL = Symbol.iterator;
  function getIteratorFn(maybeIterable) {
    if (null === maybeIterable || "object" !== typeof maybeIterable) return null;
    maybeIterable = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable["@@iterator"];
    return "function" === typeof maybeIterable ? maybeIterable : null;
  }
  var ReactNoopUpdateQueue = {
    isMounted: function() {
      return false;
    },
    enqueueForceUpdate: function() {
    },
    enqueueReplaceState: function() {
    },
    enqueueSetState: function() {
    }
  }, assign = Object.assign, emptyObject = {};
  function Component(props, context, updater) {
    this.props = props;
    this.context = context;
    this.refs = emptyObject;
    this.updater = updater || ReactNoopUpdateQueue;
  }
  Component.prototype.isReactComponent = {};
  Component.prototype.setState = function(partialState, callback) {
    if ("object" !== typeof partialState && "function" !== typeof partialState && null != partialState)
      throw Error(
        "takes an object of state variables to update or a function which returns an object of state variables."
      );
    this.updater.enqueueSetState(this, partialState, callback, "setState");
  };
  Component.prototype.forceUpdate = function(callback) {
    this.updater.enqueueForceUpdate(this, callback, "forceUpdate");
  };
  function ComponentDummy() {
  }
  ComponentDummy.prototype = Component.prototype;
  function PureComponent(props, context, updater) {
    this.props = props;
    this.context = context;
    this.refs = emptyObject;
    this.updater = updater || ReactNoopUpdateQueue;
  }
  var pureComponentPrototype = PureComponent.prototype = new ComponentDummy();
  pureComponentPrototype.constructor = PureComponent;
  assign(pureComponentPrototype, Component.prototype);
  pureComponentPrototype.isPureReactComponent = true;
  var isArrayImpl = Array.isArray;
  function noop() {
  }
  var ReactSharedInternals = { H: null, A: null, T: null, S: null }, hasOwnProperty = Object.prototype.hasOwnProperty;
  function ReactElement(type, key, props) {
    var refProp = props.ref;
    return {
      $$typeof: REACT_ELEMENT_TYPE,
      type,
      key,
      ref: void 0 !== refProp ? refProp : null,
      props
    };
  }
  function cloneAndReplaceKey(oldElement, newKey) {
    return ReactElement(oldElement.type, newKey, oldElement.props);
  }
  function isValidElement(object) {
    return "object" === typeof object && null !== object && object.$$typeof === REACT_ELEMENT_TYPE;
  }
  function escape(key) {
    var escaperLookup = { "=": "=0", ":": "=2" };
    return "$" + key.replace(/[=:]/g, function(match) {
      return escaperLookup[match];
    });
  }
  var userProvidedKeyEscapeRegex = /\/+/g;
  function getElementKey(element, index) {
    return "object" === typeof element && null !== element && null != element.key ? escape("" + element.key) : index.toString(36);
  }
  function resolveThenable(thenable) {
    switch (thenable.status) {
      case "fulfilled":
        return thenable.value;
      case "rejected":
        throw thenable.reason;
      default:
        switch ("string" === typeof thenable.status ? thenable.then(noop, noop) : (thenable.status = "pending", thenable.then(
          function(fulfilledValue) {
            "pending" === thenable.status && (thenable.status = "fulfilled", thenable.value = fulfilledValue);
          },
          function(error) {
            "pending" === thenable.status && (thenable.status = "rejected", thenable.reason = error);
          }
        )), thenable.status) {
          case "fulfilled":
            return thenable.value;
          case "rejected":
            throw thenable.reason;
        }
    }
    throw thenable;
  }
  function mapIntoArray(children, array, escapedPrefix, nameSoFar, callback) {
    var type = typeof children;
    if ("undefined" === type || "boolean" === type) children = null;
    var invokeCallback = false;
    if (null === children) invokeCallback = true;
    else
      switch (type) {
        case "bigint":
        case "string":
        case "number":
          invokeCallback = true;
          break;
        case "object":
          switch (children.$$typeof) {
            case REACT_ELEMENT_TYPE:
            case REACT_PORTAL_TYPE:
              invokeCallback = true;
              break;
            case REACT_LAZY_TYPE:
              return invokeCallback = children._init, mapIntoArray(
                invokeCallback(children._payload),
                array,
                escapedPrefix,
                nameSoFar,
                callback
              );
          }
      }
    if (invokeCallback)
      return callback = callback(children), invokeCallback = "" === nameSoFar ? "." + getElementKey(children, 0) : nameSoFar, isArrayImpl(callback) ? (escapedPrefix = "", null != invokeCallback && (escapedPrefix = invokeCallback.replace(userProvidedKeyEscapeRegex, "$&/") + "/"), mapIntoArray(callback, array, escapedPrefix, "", function(c) {
        return c;
      })) : null != callback && (isValidElement(callback) && (callback = cloneAndReplaceKey(
        callback,
        escapedPrefix + (null == callback.key || children && children.key === callback.key ? "" : ("" + callback.key).replace(
          userProvidedKeyEscapeRegex,
          "$&/"
        ) + "/") + invokeCallback
      )), array.push(callback)), 1;
    invokeCallback = 0;
    var nextNamePrefix = "" === nameSoFar ? "." : nameSoFar + ":";
    if (isArrayImpl(children))
      for (var i = 0; i < children.length; i++)
        nameSoFar = children[i], type = nextNamePrefix + getElementKey(nameSoFar, i), invokeCallback += mapIntoArray(
          nameSoFar,
          array,
          escapedPrefix,
          type,
          callback
        );
    else if (i = getIteratorFn(children), "function" === typeof i)
      for (children = i.call(children), i = 0; !(nameSoFar = children.next()).done; )
        nameSoFar = nameSoFar.value, type = nextNamePrefix + getElementKey(nameSoFar, i++), invokeCallback += mapIntoArray(
          nameSoFar,
          array,
          escapedPrefix,
          type,
          callback
        );
    else if ("object" === type) {
      if ("function" === typeof children.then)
        return mapIntoArray(
          resolveThenable(children),
          array,
          escapedPrefix,
          nameSoFar,
          callback
        );
      array = String(children);
      throw Error(
        "Objects are not valid as a React child (found: " + ("[object Object]" === array ? "object with keys {" + Object.keys(children).join(", ") + "}" : array) + "). If you meant to render a collection of children, use an array instead."
      );
    }
    return invokeCallback;
  }
  function mapChildren(children, func, context) {
    if (null == children) return children;
    var result = [], count = 0;
    mapIntoArray(children, result, "", "", function(child) {
      return func.call(context, child, count++);
    });
    return result;
  }
  function lazyInitializer(payload) {
    if (-1 === payload._status) {
      var ctor = payload._result;
      ctor = ctor();
      ctor.then(
        function(moduleObject) {
          if (0 === payload._status || -1 === payload._status)
            payload._status = 1, payload._result = moduleObject;
        },
        function(error) {
          if (0 === payload._status || -1 === payload._status)
            payload._status = 2, payload._result = error;
        }
      );
      -1 === payload._status && (payload._status = 0, payload._result = ctor);
    }
    if (1 === payload._status) return payload._result.default;
    throw payload._result;
  }
  var reportGlobalError = "function" === typeof reportError ? reportError : function(error) {
    if ("object" === typeof window && "function" === typeof window.ErrorEvent) {
      var event = new window.ErrorEvent("error", {
        bubbles: true,
        cancelable: true,
        message: "object" === typeof error && null !== error && "string" === typeof error.message ? String(error.message) : String(error),
        error
      });
      if (!window.dispatchEvent(event)) return;
    } else if ("object" === typeof process && "function" === typeof process.emit) {
      process.emit("uncaughtException", error);
      return;
    }
    console.error(error);
  }, Children = {
    map: mapChildren,
    forEach: function(children, forEachFunc, forEachContext) {
      mapChildren(
        children,
        function() {
          forEachFunc.apply(this, arguments);
        },
        forEachContext
      );
    },
    count: function(children) {
      var n = 0;
      mapChildren(children, function() {
        n++;
      });
      return n;
    },
    toArray: function(children) {
      return mapChildren(children, function(child) {
        return child;
      }) || [];
    },
    only: function(children) {
      if (!isValidElement(children))
        throw Error(
          "React.Children.only expected to receive a single React element child."
        );
      return children;
    }
  };
  react_production.Activity = REACT_ACTIVITY_TYPE;
  react_production.Children = Children;
  react_production.Component = Component;
  react_production.Fragment = REACT_FRAGMENT_TYPE;
  react_production.Profiler = REACT_PROFILER_TYPE;
  react_production.PureComponent = PureComponent;
  react_production.StrictMode = REACT_STRICT_MODE_TYPE;
  react_production.Suspense = REACT_SUSPENSE_TYPE;
  react_production.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = ReactSharedInternals;
  react_production.__COMPILER_RUNTIME = {
    __proto__: null,
    c: function(size) {
      return ReactSharedInternals.H.useMemoCache(size);
    }
  };
  react_production.cache = function(fn) {
    return function() {
      return fn.apply(null, arguments);
    };
  };
  react_production.cacheSignal = function() {
    return null;
  };
  react_production.cloneElement = function(element, config, children) {
    if (null === element || void 0 === element)
      throw Error(
        "The argument must be a React element, but you passed " + element + "."
      );
    var props = assign({}, element.props), key = element.key;
    if (null != config)
      for (propName in void 0 !== config.key && (key = "" + config.key), config)
        !hasOwnProperty.call(config, propName) || "key" === propName || "__self" === propName || "__source" === propName || "ref" === propName && void 0 === config.ref || (props[propName] = config[propName]);
    var propName = arguments.length - 2;
    if (1 === propName) props.children = children;
    else if (1 < propName) {
      for (var childArray = Array(propName), i = 0; i < propName; i++)
        childArray[i] = arguments[i + 2];
      props.children = childArray;
    }
    return ReactElement(element.type, key, props);
  };
  react_production.createContext = function(defaultValue) {
    defaultValue = {
      $$typeof: REACT_CONTEXT_TYPE,
      _currentValue: defaultValue,
      _currentValue2: defaultValue,
      _threadCount: 0,
      Provider: null,
      Consumer: null
    };
    defaultValue.Provider = defaultValue;
    defaultValue.Consumer = {
      $$typeof: REACT_CONSUMER_TYPE,
      _context: defaultValue
    };
    return defaultValue;
  };
  react_production.createElement = function(type, config, children) {
    var propName, props = {}, key = null;
    if (null != config)
      for (propName in void 0 !== config.key && (key = "" + config.key), config)
        hasOwnProperty.call(config, propName) && "key" !== propName && "__self" !== propName && "__source" !== propName && (props[propName] = config[propName]);
    var childrenLength = arguments.length - 2;
    if (1 === childrenLength) props.children = children;
    else if (1 < childrenLength) {
      for (var childArray = Array(childrenLength), i = 0; i < childrenLength; i++)
        childArray[i] = arguments[i + 2];
      props.children = childArray;
    }
    if (type && type.defaultProps)
      for (propName in childrenLength = type.defaultProps, childrenLength)
        void 0 === props[propName] && (props[propName] = childrenLength[propName]);
    return ReactElement(type, key, props);
  };
  react_production.createRef = function() {
    return { current: null };
  };
  react_production.forwardRef = function(render) {
    return { $$typeof: REACT_FORWARD_REF_TYPE, render };
  };
  react_production.isValidElement = isValidElement;
  react_production.lazy = function(ctor) {
    return {
      $$typeof: REACT_LAZY_TYPE,
      _payload: { _status: -1, _result: ctor },
      _init: lazyInitializer
    };
  };
  react_production.memo = function(type, compare) {
    return {
      $$typeof: REACT_MEMO_TYPE,
      type,
      compare: void 0 === compare ? null : compare
    };
  };
  react_production.startTransition = function(scope) {
    var prevTransition = ReactSharedInternals.T, currentTransition = {};
    ReactSharedInternals.T = currentTransition;
    try {
      var returnValue = scope(), onStartTransitionFinish = ReactSharedInternals.S;
      null !== onStartTransitionFinish && onStartTransitionFinish(currentTransition, returnValue);
      "object" === typeof returnValue && null !== returnValue && "function" === typeof returnValue.then && returnValue.then(noop, reportGlobalError);
    } catch (error) {
      reportGlobalError(error);
    } finally {
      null !== prevTransition && null !== currentTransition.types && (prevTransition.types = currentTransition.types), ReactSharedInternals.T = prevTransition;
    }
  };
  react_production.unstable_useCacheRefresh = function() {
    return ReactSharedInternals.H.useCacheRefresh();
  };
  react_production.use = function(usable) {
    return ReactSharedInternals.H.use(usable);
  };
  react_production.useActionState = function(action, initialState, permalink) {
    return ReactSharedInternals.H.useActionState(action, initialState, permalink);
  };
  react_production.useCallback = function(callback, deps) {
    return ReactSharedInternals.H.useCallback(callback, deps);
  };
  react_production.useContext = function(Context) {
    return ReactSharedInternals.H.useContext(Context);
  };
  react_production.useDebugValue = function() {
  };
  react_production.useDeferredValue = function(value, initialValue) {
    return ReactSharedInternals.H.useDeferredValue(value, initialValue);
  };
  react_production.useEffect = function(create, deps) {
    return ReactSharedInternals.H.useEffect(create, deps);
  };
  react_production.useEffectEvent = function(callback) {
    return ReactSharedInternals.H.useEffectEvent(callback);
  };
  react_production.useId = function() {
    return ReactSharedInternals.H.useId();
  };
  react_production.useImperativeHandle = function(ref, create, deps) {
    return ReactSharedInternals.H.useImperativeHandle(ref, create, deps);
  };
  react_production.useInsertionEffect = function(create, deps) {
    return ReactSharedInternals.H.useInsertionEffect(create, deps);
  };
  react_production.useLayoutEffect = function(create, deps) {
    return ReactSharedInternals.H.useLayoutEffect(create, deps);
  };
  react_production.useMemo = function(create, deps) {
    return ReactSharedInternals.H.useMemo(create, deps);
  };
  react_production.useOptimistic = function(passthrough, reducer) {
    return ReactSharedInternals.H.useOptimistic(passthrough, reducer);
  };
  react_production.useReducer = function(reducer, initialArg, init) {
    return ReactSharedInternals.H.useReducer(reducer, initialArg, init);
  };
  react_production.useRef = function(initialValue) {
    return ReactSharedInternals.H.useRef(initialValue);
  };
  react_production.useState = function(initialState) {
    return ReactSharedInternals.H.useState(initialState);
  };
  react_production.useSyncExternalStore = function(subscribe, getSnapshot, getServerSnapshot) {
    return ReactSharedInternals.H.useSyncExternalStore(
      subscribe,
      getSnapshot,
      getServerSnapshot
    );
  };
  react_production.useTransition = function() {
    return ReactSharedInternals.H.useTransition();
  };
  react_production.version = "19.2.7";
  return react_production;
}
var hasRequiredReact;
function requireReact() {
  if (hasRequiredReact) return react.exports;
  hasRequiredReact = 1;
  {
    react.exports = requireReact_production();
  }
  return react.exports;
}
var reactExports = requireReact();
const MIN_WINDOW = 5;
const MAX_WINDOW = 600;
const DEFAULT_WINDOW = 60;
function createViewState() {
  return {
    timeWindowSec: DEFAULT_WINDOW,
    cursorTimeSec: -1,
    viewStartSec: 0,
    viewEndSec: DEFAULT_WINDOW
  };
}
function computeViewRange(sessionTimeSec, timeWindowSec) {
  if (sessionTimeSec > timeWindowSec) {
    return {
      viewStartSec: sessionTimeSec - timeWindowSec,
      viewEndSec: sessionTimeSec
    };
  }
  return {
    viewStartSec: 0,
    viewEndSec: Math.max(timeWindowSec, sessionTimeSec)
  };
}
function updateViewRange(state, sessionTimeSec) {
  const range = computeViewRange(sessionTimeSec, state.timeWindowSec);
  state.viewStartSec = range.viewStartSec;
  state.viewEndSec = range.viewEndSec;
}
function applyZoom(state, sessionTimeSec, factor) {
  state.timeWindowSec = Math.max(
    MIN_WINDOW,
    Math.min(MAX_WINDOW, state.timeWindowSec * factor)
  );
  updateViewRange(state, sessionTimeSec);
}
const PALETTE = [
  { r: 0, g: 200, b: 255 },
  // #00C8FF
  { r: 255, g: 180, b: 0 },
  // #FFB400
  { r: 80, g: 220, b: 120 },
  // #50DC78
  { r: 255, g: 90, b: 90 },
  // #FF5A5A
  { r: 180, g: 140, b: 255 },
  // #B48CFF
  { r: 255, g: 120, b: 200 },
  // #FF78C8
  { r: 200, g: 200, b: 80 },
  // #C8C850
  { r: 120, g: 180, b: 255 }
  // #78B4FF
];
function paletteColor(index) {
  const c = PALETTE[index % PALETTE.length];
  return `rgb(${c.r},${c.g},${c.b})`;
}
const THEME = {
  widgetBg: "#0B0F14",
  plotBg: "#151A22",
  border: "#283241",
  cursor: "#00DCFF",
  textDim: "#788CA0",
  text: "#B4C8DC"
};
const STACKED_LAYOUT = {
  leftMargin: 50,
  rightMargin: 10,
  minStripHeight: 8,
  maxSeries: 20
};
const OVERLAY_LAYOUT = {
  plotLeft: 56,
  plotRight: 12,
  plotTop: 12,
  plotBottom: 36,
  legendLineHeight: 16,
  maxSeries: 24
};
function getPlotMargins(mode) {
  if (mode === "stacked") {
    return { left: STACKED_LAYOUT.leftMargin, right: STACKED_LAYOUT.rightMargin };
  }
  return { left: OVERLAY_LAYOUT.plotLeft, right: OVERLAY_LAYOUT.plotRight };
}
function uniformStride(samples2, maxPoints) {
  const cap = Math.max(2, maxPoints);
  const len = samples2.length;
  if (len <= cap) {
    return samples2.map((s) => ({ x: s.timeSec, y: s.value }));
  }
  const step = len / cap;
  const result = [];
  for (let i = 0; i < cap; i++) {
    const idx = Math.min(len - 1, Math.floor(i * step));
    result.push({ x: samples2[idx].timeSec, y: samples2[idx].value });
  }
  return result;
}
function minMaxBuckets(samples2, maxPoints) {
  const len = samples2.length;
  const bucketCount = Math.max(1, Math.floor(maxPoints / 2));
  const bucketSize = Math.ceil(len / bucketCount);
  const result = [];
  for (let b = 0; b < bucketCount; b++) {
    const start = b * bucketSize;
    const end = Math.min(start + bucketSize, len);
    if (start >= end) break;
    let minIdx = start;
    let maxIdx = start;
    for (let i = start + 1; i < end; i++) {
      if (samples2[i].value < samples2[minIdx].value) minIdx = i;
      if (samples2[i].value > samples2[maxIdx].value) maxIdx = i;
    }
    const first = Math.min(minIdx, maxIdx);
    const second = Math.max(minIdx, maxIdx);
    result.push({ x: samples2[first].timeSec, y: samples2[first].value });
    if (first !== second) {
      result.push({ x: samples2[second].timeSec, y: samples2[second].value });
    }
  }
  return result;
}
function toDisplayPoints(samples2, _tMin, _tMax, maxPoints) {
  const cap = Math.max(2, maxPoints);
  if (samples2.length <= cap) {
    return uniformStride(samples2, cap);
  }
  return minMaxBuckets(samples2, cap);
}
function computeStripLayout(paramKeys, viewWidth, viewHeight) {
  const count = Math.min(paramKeys.length, STACKED_LAYOUT.maxSeries);
  if (count === 0) return [];
  const plotWidth = Math.max(10, viewWidth - STACKED_LAYOUT.leftMargin - STACKED_LAYOUT.rightMargin);
  const rawStripHeight = viewHeight / count;
  const stripHeight = Math.max(STACKED_LAYOUT.minStripHeight, rawStripHeight);
  const strips = [];
  for (let i = 0; i < count; i++) {
    strips.push({
      key: paramKeys[i],
      x: STACKED_LAYOUT.leftMargin,
      y: i * stripHeight,
      w: plotWidth,
      h: stripHeight - 1
    });
  }
  return strips;
}
function drawStrip(ctx, strip, points, label, colorIndex, viewStartSec, viewEndSec) {
  const { x, y, w, h } = strip;
  const dt = Math.max(1e-3, viewEndSec - viewStartSec);
  ctx.fillStyle = THEME.plotBg;
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = THEME.border;
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, w, h);
  if (points.length < 2) {
    ctx.fillStyle = THEME.textDim;
    ctx.font = "11px monospace";
    ctx.textAlign = "center";
    ctx.fillText(label, x + w / 2, y + h / 2 + 4);
    return;
  }
  let yMin = Infinity;
  let yMax = -Infinity;
  for (const p of points) {
    if (p.y < yMin) yMin = p.y;
    if (p.y > yMax) yMax = p.y;
  }
  if (Math.abs(yMax - yMin) < 1e-12) {
    yMin -= 1;
    yMax += 1;
  }
  const yRange = Math.max(1e-3, yMax - yMin);
  const innerH = Math.max(1, h - 10);
  const color = paletteColor(colorIndex);
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  for (let i = 0; i < points.length; i++) {
    const px = x + (points[i].x - viewStartSec) / dt * w;
    const py = y + h - 5 - (points[i].y - yMin) / yRange * innerH;
    if (i === 0) {
      ctx.moveTo(px, py);
    } else {
      ctx.lineTo(px, py);
    }
  }
  ctx.stroke();
  ctx.fillStyle = THEME.text;
  ctx.font = "11px monospace";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText(label, x + 6, y + 2);
  if (h >= 30) {
    ctx.fillStyle = THEME.textDim;
    ctx.font = "9px monospace";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    const maxLabel = yMax.toFixed(yRange < 10 ? 1 : 0);
    const minLabel = yMin.toFixed(yRange < 10 ? 1 : 0);
    ctx.fillText(maxLabel, x + w - 4, y + 8);
    ctx.fillText(minLabel, x + w - 4, y + h - 8);
  }
}
function renderStackedCached(ctx, strips, cachedPoints, keys, viewStartSec, viewEndSec) {
  for (let i = 0; i < strips.length; i++) {
    const strip = strips[i];
    const points = cachedPoints[i] ?? [];
    drawStrip(ctx, strip, points, keys[i] ?? strip.key, i, viewStartSec, viewEndSec);
  }
}
function renderStackedCursor(ctx, cursorX, viewWidth, viewHeight) {
  if (cursorX < STACKED_LAYOUT.leftMargin || cursorX > viewWidth - STACKED_LAYOUT.rightMargin) return;
  ctx.save();
  ctx.strokeStyle = THEME.cursor;
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(cursorX, 0);
  ctx.lineTo(cursorX, viewHeight);
  ctx.stroke();
  ctx.restore();
}
function computeOverlayLayout(paramCount, viewWidth, viewHeight) {
  const legendHeight = Math.min(
    viewHeight / 3,
    Math.min(paramCount, OVERLAY_LAYOUT.maxSeries) * OVERLAY_LAYOUT.legendLineHeight + 8
  );
  const plotLeft = OVERLAY_LAYOUT.plotLeft;
  const plotTop = OVERLAY_LAYOUT.plotTop;
  const plotWidth = Math.max(10, viewWidth - OVERLAY_LAYOUT.plotLeft - OVERLAY_LAYOUT.plotRight);
  const plotHeight = Math.max(10, viewHeight - OVERLAY_LAYOUT.plotTop - OVERLAY_LAYOUT.plotBottom - legendHeight);
  return { plotLeft, plotTop, plotWidth, plotHeight, legendHeight };
}
function computeOverlaySeries(snapshots, paramKeys, viewStartSec, viewEndSec, plotWidth) {
  let yMin = Infinity;
  let yMax = -Infinity;
  const seriesList = [];
  let colorIndex = 0;
  const snapshotMap = new Map(snapshots.map((s) => [s.key, s.samples]));
  const maxPoints = Math.max(64, plotWidth);
  for (const key of paramKeys.slice(0, OVERLAY_LAYOUT.maxSeries)) {
    const samples2 = snapshotMap.get(key);
    if (!samples2 || samples2.length < 2) continue;
    const points = toDisplayPoints(samples2, viewStartSec, viewEndSec, maxPoints);
    if (points.length < 2) continue;
    const color = paletteColor(colorIndex++);
    for (const p of points) {
      if (p.y < yMin) yMin = p.y;
      if (p.y > yMax) yMax = p.y;
    }
    seriesList.push({ key, color, path: points });
  }
  if (yMin > yMax) {
    yMin = -1;
    yMax = 1;
  }
  if (Math.abs(yMax - yMin) < 1e-12) {
    yMin -= 1;
    yMax += 1;
  }
  return { seriesList, yMin, yMax };
}
function seriesToPixelPath(points, viewStartSec, viewEndSec, plotLeft, plotWidth, plotBottom, plotHeight, yMin, yMax) {
  const dt = Math.max(1e-3, viewEndSec - viewStartSec);
  const yRange = Math.max(1e-3, yMax - yMin);
  const innerH = plotHeight - 4;
  return points.map((p) => ({
    x: plotLeft + (p.x - viewStartSec) / dt * plotWidth,
    y: plotBottom - (p.y - yMin) / yRange * innerH - 2
  }));
}
function renderOverlay(ctx, paramKeys, snapshots, viewStartSec, viewEndSec, viewWidth, viewHeight) {
  const layout = computeOverlayLayout(paramKeys.length, viewWidth, viewHeight);
  const { plotLeft, plotTop, plotWidth, plotHeight } = layout;
  const plotBottom = plotTop + plotHeight;
  ctx.fillStyle = THEME.widgetBg;
  ctx.fillRect(0, 0, viewWidth, viewHeight);
  ctx.fillStyle = THEME.plotBg;
  ctx.beginPath();
  const r = 4;
  ctx.roundRect(plotLeft, plotTop, plotWidth, plotHeight, r);
  ctx.fill();
  ctx.strokeStyle = THEME.border;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(plotLeft, plotTop, plotWidth, plotHeight, r);
  ctx.stroke();
  const { seriesList, yMin, yMax } = computeOverlaySeries(
    snapshots,
    paramKeys,
    viewStartSec,
    viewEndSec,
    plotWidth
  );
  if (seriesList.length > 0) {
    const yRange = yMax - yMin || 1;
    const tickCount = 4;
    ctx.fillStyle = THEME.textDim;
    ctx.font = "9px monospace";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    for (let i = 0; i <= tickCount; i++) {
      const val = yMin + yRange * i / tickCount;
      const tickY = plotBottom - (val - yMin) / yRange * (plotHeight - 4) - 2;
      ctx.fillText(val.toFixed(yRange < 10 ? 1 : 0), plotLeft - 6, tickY);
      ctx.strokeStyle = THEME.border;
      ctx.globalAlpha = 0.3;
      ctx.beginPath();
      ctx.moveTo(plotLeft + 1, tickY);
      ctx.lineTo(plotLeft + plotWidth, tickY);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }
  if (seriesList.length === 0) {
    ctx.fillStyle = THEME.textDim;
    ctx.font = "13px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Ожидание данных…", plotLeft + plotWidth / 2, plotTop + plotHeight / 2);
    return;
  }
  for (const entry of seriesList) {
    const pixelPath = seriesToPixelPath(
      entry.path,
      viewStartSec,
      viewEndSec,
      plotLeft,
      plotWidth,
      plotBottom,
      plotHeight,
      yMin,
      yMax
    );
    ctx.beginPath();
    ctx.strokeStyle = entry.color;
    ctx.lineWidth = 2;
    for (let i = 0; i < pixelPath.length; i++) {
      if (i === 0) {
        ctx.moveTo(pixelPath[i].x, pixelPath[i].y);
      } else {
        ctx.lineTo(pixelPath[i].x, pixelPath[i].y);
      }
    }
    ctx.stroke();
  }
  const labelY = plotBottom + 14;
  ctx.fillStyle = THEME.textDim;
  ctx.font = "11px monospace";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText(viewStartSec.toFixed(1) + "s", plotLeft, labelY);
  ctx.textAlign = "right";
  ctx.fillText(viewEndSec.toFixed(1) + "s", plotLeft + plotWidth, labelY);
  const legendY = plotBottom + OVERLAY_LAYOUT.plotBottom;
  for (let i = 0; i < seriesList.length; i++) {
    const entry = seriesList[i];
    const ly = legendY + i * OVERLAY_LAYOUT.legendLineHeight;
    ctx.fillStyle = entry.color;
    ctx.fillRect(plotLeft + 4, ly + 6, 14, 3);
    const label = entry.key.length > 28 ? entry.key.substring(0, 25) + "…" : entry.key;
    ctx.fillStyle = THEME.text;
    ctx.font = "11px monospace";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(label, plotLeft + 22, ly + 2);
  }
}
function renderOverlayCached(ctx, paramKeys, cachedSeries, cachedYMin, cachedYMax, viewStartSec, viewEndSec, viewWidth, viewHeight) {
  const layout = computeOverlayLayout(paramKeys.length, viewWidth, viewHeight);
  const { plotLeft, plotTop, plotWidth, plotHeight } = layout;
  const plotBottom = plotTop + plotHeight;
  ctx.fillStyle = THEME.widgetBg;
  ctx.fillRect(0, 0, viewWidth, viewHeight);
  ctx.fillStyle = THEME.plotBg;
  ctx.beginPath();
  const r = 4;
  ctx.roundRect(plotLeft, plotTop, plotWidth, plotHeight, r);
  ctx.fill();
  ctx.strokeStyle = THEME.border;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(plotLeft, plotTop, plotWidth, plotHeight, r);
  ctx.stroke();
  const yRange = cachedYMax - cachedYMin || 1;
  const tickCount = 4;
  ctx.fillStyle = THEME.textDim;
  ctx.font = "9px monospace";
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  for (let i = 0; i <= tickCount; i++) {
    const val = cachedYMin + yRange * i / tickCount;
    const tickY = plotBottom - (val - cachedYMin) / yRange * (plotHeight - 4) - 2;
    ctx.fillText(val.toFixed(yRange < 10 ? 1 : 0), plotLeft - 6, tickY);
    ctx.strokeStyle = THEME.border;
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    ctx.moveTo(plotLeft + 1, tickY);
    ctx.lineTo(plotLeft + plotWidth, tickY);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
  const dt = Math.max(1e-3, viewEndSec - viewStartSec);
  const yr = Math.max(1e-3, cachedYMax - cachedYMin);
  const innerH = plotHeight - 4;
  for (const entry of cachedSeries) {
    ctx.beginPath();
    ctx.strokeStyle = entry.color;
    ctx.lineWidth = 2;
    for (let i = 0; i < entry.path.length; i++) {
      const px = plotLeft + (entry.path[i].x - viewStartSec) / dt * plotWidth;
      const py = plotBottom - (entry.path[i].y - cachedYMin) / yr * innerH - 2;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
  }
  const labelY = plotBottom + 14;
  ctx.fillStyle = THEME.textDim;
  ctx.font = "11px monospace";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText(viewStartSec.toFixed(1) + "s", plotLeft, labelY);
  ctx.textAlign = "right";
  ctx.fillText(viewEndSec.toFixed(1) + "s", plotLeft + plotWidth, labelY);
  const legendY = plotBottom + OVERLAY_LAYOUT.plotBottom;
  for (let i = 0; i < cachedSeries.length; i++) {
    const entry = cachedSeries[i];
    const ly = legendY + i * OVERLAY_LAYOUT.legendLineHeight;
    ctx.fillStyle = entry.color;
    ctx.fillRect(plotLeft + 4, ly + 6, 14, 3);
    const label = entry.key.length > 28 ? entry.key.substring(0, 25) + "…" : entry.key;
    ctx.fillStyle = THEME.text;
    ctx.font = "11px monospace";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(label, plotLeft + 22, ly + 2);
  }
}
function renderOverlayCursor(ctx, cursorX, plotLeft, plotWidth, plotTop, plotHeight) {
  if (cursorX < plotLeft || cursorX > plotLeft + plotWidth) return;
  ctx.save();
  ctx.strokeStyle = THEME.cursor;
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(cursorX, plotTop);
  ctx.lineTo(cursorX, plotTop + plotHeight);
  ctx.stroke();
  ctx.restore();
}
const MAX_SAMPLES = 1e3;
const displaySamples = [];
let sampleHead = 0;
function addChartSample(displayMs) {
  if (displaySamples.length < MAX_SAMPLES) {
    displaySamples.push(displayMs);
  } else {
    displaySamples[sampleHead % MAX_SAMPLES] = displayMs;
  }
  sampleHead++;
}
function percentile(sorted, p) {
  if (sorted.length === 0) return 0;
  const idx = Math.ceil(p / 100 * sorted.length) - 1;
  return sorted[Math.max(0, Math.min(idx, sorted.length - 1))];
}
function getChartStats() {
  if (displaySamples.length === 0) {
    return { count: 0, p50: 0, p95: 0, p99: 0, max: 0 };
  }
  const sorted = [...displaySamples].sort((a, b) => a - b);
  return {
    count: displaySamples.length,
    p50: percentile(sorted, 50),
    p95: percentile(sorted, 95),
    p99: percentile(sorted, 99),
    max: sorted[sorted.length - 1]
  };
}
function resetChartLatency() {
  displaySamples.length = 0;
  sampleHead = 0;
}
const ChartsPanel = ({
  dataSource,
  paramKeys,
  mode = "stacked",
  cursorTimeSecRef,
  onCursorChange,
  lastT0MsRef
}) => {
  const containerRef = reactExports.useRef(null);
  const canvasRef = reactExports.useRef(null);
  const backBufferRef = reactExports.useRef(null);
  const viewStateRef = reactExports.useRef(createViewState());
  const lastRevisionRef = reactExports.useRef(-1);
  const cursorXRef = reactExports.useRef(null);
  const cursorDirtyRef = reactExports.useRef(false);
  const cachedOverlayRef = reactExports.useRef(null);
  const cachedStackedRef = reactExports.useRef(null);
  const [size, setSize] = reactExports.useState({ width: 0, height: 0 });
  reactExports.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        const w = Math.floor(width * devicePixelRatio);
        const h = Math.floor(height * devicePixelRatio);
        setSize({ width: w, height: h });
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  reactExports.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = size.width;
    canvas.height = size.height;
    canvas.style.width = size.width / devicePixelRatio + "px";
    canvas.style.height = size.height / devicePixelRatio + "px";
    if (backBufferRef.current) {
      backBufferRef.current.width = size.width;
      backBufferRef.current.height = size.height;
    }
    lastRevisionRef.current = -1;
    cachedOverlayRef.current = null;
    cachedStackedRef.current = null;
  }, [size]);
  const render = reactExports.useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || size.width === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = size.width;
    const h = size.height;
    const state = viewStateRef.current;
    updateViewRange(state, dataSource.getSessionTimeSec());
    const curRevision = dataSource.getRevision();
    const dataChanged = curRevision !== lastRevisionRef.current;
    const cursorDirty = cursorDirtyRef.current;
    const cx = cursorXRef.current;
    if (dataChanged) {
      lastRevisionRef.current = curRevision;
      if (mode === "stacked") {
        const strips = computeStripLayout(paramKeys, w, h);
        const snapshots = dataSource.chartSnapshots(
          paramKeys.slice(0, 20),
          state.viewStartSec,
          state.viewEndSec
        );
        const snapshotMap = new Map(snapshots.map((s) => [s.key, s.samples]));
        const displayPoints = strips.map((strip) => {
          const samples2 = snapshotMap.get(strip.key) ?? [];
          return toDisplayPoints(samples2, state.viewStartSec, state.viewEndSec, Math.max(32, strip.w));
        });
        cachedStackedRef.current = { strips, displayPoints };
        if (backBufferRef.current) backBufferRef.current = null;
        renderStackedCached(ctx, strips, displayPoints, paramKeys, state.viewStartSec, state.viewEndSec);
      } else {
        const snapshots = dataSource.chartSnapshots(
          paramKeys.slice(0, 24),
          state.viewStartSec,
          state.viewEndSec
        );
        const result = computeOverlaySeries(snapshots, paramKeys, state.viewStartSec, state.viewEndSec, w);
        cachedOverlayRef.current = { seriesList: result.seriesList, yMin: result.yMin, yMax: result.yMax };
        renderOverlay(ctx, paramKeys, snapshots, state.viewStartSec, state.viewEndSec, w, h);
      }
      if (lastT0MsRef && lastT0MsRef.current > 0) {
        const tPaint = performance.timeOrigin + performance.now();
        addChartSample(tPaint - lastT0MsRef.current);
      }
    } else if (mode === "stacked" && cachedStackedRef.current) {
      const cs = cachedStackedRef.current;
      renderStackedCached(ctx, cs.strips, cs.displayPoints, paramKeys, state.viewStartSec, state.viewEndSec);
    } else if (mode === "overlay" && cachedOverlayRef.current) {
      const c = cachedOverlayRef.current;
      renderOverlayCached(
        ctx,
        paramKeys,
        c.seriesList,
        c.yMin,
        c.yMax,
        state.viewStartSec,
        state.viewEndSec,
        w,
        h
      );
    }
    if (cx !== null && (dataChanged || cursorDirty)) {
      if (mode === "stacked") {
        if (!dataChanged && cachedStackedRef.current) {
          const cs = cachedStackedRef.current;
          renderStackedCached(ctx, cs.strips, cs.displayPoints, paramKeys, state.viewStartSec, state.viewEndSec);
        }
        renderStackedCursor(ctx, cx, w, h);
      } else {
        if (!dataChanged && cachedOverlayRef.current) {
          const c = cachedOverlayRef.current;
          renderOverlayCached(
            ctx,
            paramKeys,
            c.seriesList,
            c.yMin,
            c.yMax,
            state.viewStartSec,
            state.viewEndSec,
            w,
            h
          );
        }
        const layout = computeOverlayLayout(Math.min(paramKeys.length, 24), w, h);
        renderOverlayCursor(ctx, cx, layout.plotLeft, layout.plotWidth, layout.plotTop, layout.plotHeight);
      }
      cursorDirtyRef.current = false;
    }
  }, [dataSource, paramKeys, mode, size]);
  reactExports.useEffect(() => {
    let rafId;
    let wasHidden = false;
    const loop = () => {
      if (document.visibilityState === "hidden") {
        wasHidden = true;
        rafId = requestAnimationFrame(loop);
        return;
      }
      if (wasHidden) {
        lastRevisionRef.current = -1;
        wasHidden = false;
      }
      render();
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [render]);
  const handleMouseMove = reactExports.useCallback((e) => {
    if (mode === "overlay") {
      const px = e.nativeEvent.offsetX * devicePixelRatio;
      cursorXRef.current = px;
      cursorDirtyRef.current = true;
      if (onCursorChange) {
        const dt = Math.max(1e-3, viewStateRef.current.viewEndSec - viewStateRef.current.viewStartSec);
        const viewW = size.width;
        const m = getPlotMargins("overlay");
        const ratio = (px - m.left) / (viewW - m.left - m.right);
        const timeSec = viewStateRef.current.viewStartSec + ratio * dt;
        onCursorChange(timeSec);
      }
    }
  }, [mode, onCursorChange, size]);
  const handleMouseDown = reactExports.useCallback((e) => {
    if (mode === "stacked") {
      const px = e.nativeEvent.offsetX * devicePixelRatio;
      if (cursorXRef.current !== null && Math.abs(cursorXRef.current - px) < 5) {
        cursorXRef.current = null;
      } else {
        cursorXRef.current = px;
      }
      cursorDirtyRef.current = true;
      if (cursorTimeSecRef && cursorXRef.current !== null && onCursorChange) {
        const dt = Math.max(1e-3, viewStateRef.current.viewEndSec - viewStateRef.current.viewStartSec);
        const viewW = size.width;
        const m = getPlotMargins("stacked");
        const ratio = (px - m.left) / (viewW - m.left - m.right);
        const timeSec = viewStateRef.current.viewStartSec + ratio * dt;
        onCursorChange(timeSec);
      } else if (cursorTimeSecRef && cursorXRef.current === null && onCursorChange) {
        onCursorChange(-1);
      }
    }
  }, [mode, onCursorChange, size, cursorTimeSecRef]);
  const handleMouseUp = reactExports.useCallback(() => {
  }, [mode]);
  const handleWheel = reactExports.useCallback((e) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 0.9 : 1.1;
    applyZoom(viewStateRef.current, dataSource.getSessionTimeSec(), factor);
    lastRevisionRef.current = -1;
    render();
  }, [dataSource, render]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref: containerRef, className: "w-full h-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
    "canvas",
    {
      ref: canvasRef,
      style: { display: "block", cursor: mode === "overlay" ? "none" : "crosshair" },
      onMouseMove: handleMouseMove,
      onMouseDown: handleMouseDown,
      onMouseUp: handleMouseUp,
      onWheel: handleWheel
    }
  ) });
};
const RING_CAPACITY = 3e3;
const EPS = 1e-9;
class RingBuffer {
  constructor() {
    this.head = 0;
    this.count = 0;
    this.buf = new Array(RING_CAPACITY);
  }
  /** Push a point. Overwrites oldest if full. */
  push(timeSec, value, valid) {
    this.buf[this.head] = { timeSec, value, valid };
    this.head = (this.head + 1) % RING_CAPACITY;
    if (this.count < RING_CAPACITY) {
      this.count++;
    }
  }
  /** Return points in [tMin, tMax] in chronological order (old → new). */
  samplesInWindow(tMin, tMax) {
    if (this.count === 0) return [];
    const result = [];
    const len = this.count;
    const startIdx = this.head;
    for (let i = 0; i < len; i++) {
      const idx = (startIdx - 1 - i + RING_CAPACITY) % RING_CAPACITY;
      const pt = this.buf[idx];
      if (!pt) continue;
      if (!pt.valid) continue;
      if (pt.timeSec > tMax + EPS) continue;
      if (pt.timeSec < tMin - EPS) break;
      result.push(pt);
    }
    result.reverse();
    return result;
  }
  /** Number of valid points stored */
  size() {
    return this.count;
  }
}
class DataHub {
  constructor(maxTrackedKeys = 50) {
    this.buffers = /* @__PURE__ */ new Map();
    this.paramIndex = /* @__PURE__ */ new Map();
    this.paramDisplayName = /* @__PURE__ */ new Map();
    this.activeKeys = [];
    this.revision = 0;
    this.sessionStartMs = 0;
    this.sessionTimeSec = 0;
    this.initialized = false;
    this.maxTrackedKeys = maxTrackedKeys;
  }
  /** Configure active parameters from an ordered list of ParamInfo */
  configure(params) {
    const keys = params.map((p) => p.key);
    this.activeKeys = keys.slice(0, this.maxTrackedKeys);
    for (const p of params) {
      if (!this.activeKeys.includes(p.key)) continue;
      this.paramIndex.set(p.key, p.index);
      this.paramDisplayName.set(p.key, p.displayName);
      if (!this.buffers.has(p.key)) {
        this.buffers.set(p.key, new RingBuffer());
      }
    }
  }
  /** Get currently active keys */
  getActiveKeys() {
    return [...this.activeKeys];
  }
  /** Get display name for a key */
  getDisplayName(key) {
    return this.paramDisplayName.get(key) ?? key;
  }
  /** Ingest a decoded frame */
  ingestFrame(values, epochMs) {
    if (!this.initialized) {
      this.sessionStartMs = epochMs;
      this.initialized = true;
    }
    this.sessionTimeSec = (epochMs - this.sessionStartMs) / 1e3;
    for (const key of this.activeKeys) {
      const idx = this.paramIndex.get(key);
      if (idx === void 0) continue;
      const value = idx < values.length ? values[idx] : 0;
      const valid = idx < values.length && Number.isFinite(value);
      const buf = this.buffers.get(key);
      if (buf) {
        buf.push(this.sessionTimeSec, value, valid);
      }
    }
    this.revision++;
  }
  /** Get samples for keys in time window */
  chartSnapshots(keys, tMin, tMax) {
    return keys.map((key) => {
      const buf = this.buffers.get(key);
      const samples2 = buf ? buf.samplesInWindow(tMin, tMax) : [];
      return { key, samples: samples2 };
    });
  }
  /** Current revision number */
  getRevision() {
    return this.revision;
  }
  /** Current session time in seconds */
  getSessionTimeSec() {
    return this.sessionTimeSec;
  }
  /** Session start epoch ms */
  getSessionStartMs() {
    return this.sessionStartMs;
  }
  /** Release all buffers and reset state */
  destroy() {
    this.buffers.clear();
    this.paramIndex.clear();
    this.paramDisplayName.clear();
    this.activeKeys = [];
    this.revision = 0;
    this.sessionTimeSec = 0;
    this.sessionStartMs = 0;
    this.initialized = false;
  }
}
class PFDTelemetryHub {
  constructor(params, frameToValues) {
    this.hub = new DataHub(50);
    this.hub.configure(params);
    this.frameToValues = frameToValues;
  }
  /** Ingest a telemetry frame */
  ingest(frame, epochMs) {
    const values = this.frameToValues(frame);
    this.hub.ingestFrame(values, epochMs);
  }
  getActiveKeys() {
    return this.hub.getActiveKeys();
  }
  getDisplayName(key) {
    return this.hub.getDisplayName(key);
  }
  getRevision() {
    return this.hub.getRevision();
  }
  getSessionTimeSec() {
    return this.hub.getSessionTimeSec();
  }
  chartSnapshots(keys, tMin, tMax) {
    return this.hub.chartSnapshots(keys, tMin, tMax);
  }
  destroy() {
    this.hub.destroy();
  }
}
function paramsFromCatalog(catalog) {
  return catalog.map((entry, idx) => ({
    key: entry.key,
    displayName: entry.comment,
    index: idx
  }));
}
function frameToValuesFromCatalog(catalog, frame) {
  return catalog.map((entry) => {
    const val = frame[entry.key];
    return typeof val === "number" && Number.isFinite(val) ? val : 0;
  });
}
const ChartsView = ({ frame, epochMs, catalog, initialMode = "stacked" }) => {
  const hubRef = reactExports.useRef(null);
  const lastT0MsRef = reactExports.useRef(0);
  const [keys, setKeys] = reactExports.useState([]);
  const [mode, setMode] = reactExports.useState(initialMode);
  const cursorTimeSecRef = reactExports.useRef(-1);
  const [cursorTimeLabel, setCursorTimeLabel] = reactExports.useState(null);
  const [latStats, setLatStats] = reactExports.useState(() => getChartStats());
  reactExports.useEffect(() => {
    const params = paramsFromCatalog(catalog);
    const converter = (f) => frameToValuesFromCatalog(catalog, f);
    const hub = new PFDTelemetryHub(params, converter);
    hubRef.current = hub;
    setKeys(hub.getActiveKeys());
    return () => {
      hub.destroy();
    };
  }, [catalog]);
  reactExports.useEffect(() => {
    if (!hubRef.current) return;
    hubRef.current.ingest(frame, epochMs);
    const t0 = frame._t0_ms;
    if (typeof t0 === "number" && t0 > 0) {
      lastT0MsRef.current = t0;
    }
  }, [frame, epochMs]);
  reactExports.useEffect(() => {
    const t = setInterval(() => setLatStats(getChartStats()), 500);
    return () => clearInterval(t);
  }, []);
  const handleCursorChange = reactExports.useCallback((timeSec) => {
    cursorTimeSecRef.current = timeSec;
    if (timeSec >= 0) {
      setCursorTimeLabel(timeSec.toFixed(1) + "s");
    } else {
      setCursorTimeLabel(null);
    }
  }, []);
  const fmt2 = (v) => v.toFixed(1);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full h-full flex flex-col bg-[#0B0F14]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "shrink-0 flex items-center gap-3 px-4 py-2 bg-black/60 border-b border-white/10", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => setMode("stacked"),
          className: `px-3 py-1 rounded text-xs font-medium transition ${mode === "stacked" ? "bg-blue-600 text-white" : "bg-white/5 text-white/60 hover:bg-white/10"}`,
          children: "Stacked"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => setMode("overlay"),
          className: `px-3 py-1 rounded text-xs font-medium transition ${mode === "overlay" ? "bg-blue-600 text-white" : "bg-white/5 text-white/60 hover:bg-white/10"}`,
          children: "Overlay"
        }
      ),
      latStats.count > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] font-mono text-white/50 ml-2 flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-white/30", children: "⏱" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "P50:" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[#48bb78]", children: fmt2(latStats.p50) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "P95:" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[#ecc94b]", children: fmt2(latStats.p95) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "P99:" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[#fc8181]", children: fmt2(latStats.p99) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "MAX:" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[#f56565]", children: fmt2(latStats.max) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-white/20", children: "ms" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => {
              resetChartLatency();
              setLatStats(getChartStats());
            },
            className: "text-white/20 hover:text-white/50 text-[9px] ml-1",
            title: "Reset",
            children: "↺"
          }
        )
      ] }),
      cursorTimeLabel && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-auto text-[#00DCFF] text-xs font-mono", children: [
        "cursor: ",
        cursorTimeLabel
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 min-h-0", children: hubRef.current ? /* @__PURE__ */ jsxRuntimeExports.jsx(
      ChartsPanel,
      {
        dataSource: hubRef.current,
        paramKeys: keys,
        mode,
        cursorTimeSecRef,
        onCursorChange: handleCursorChange,
        lastT0MsRef
      }
    ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center h-full text-white/30 text-sm", children: "Initializing charts…" }) })
  ] });
};
const Aircraft3DInstrument = React.lazy(() => __vitePreload(() => import("./LazyAircraft3DInstrument-D7AjlERe.js"), true ? [] : void 0));
const LIVE_PFD_URL = "/events/pfd";
function App() {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i;
  const [currentView, setCurrentView] = reactExports$1.useState("hub");
  const [frame, setFrame] = reactExports$1.useState(sampleFrames[0]);
  const [error, setError] = reactExports$1.useState(null);
  const [isPlaying, setIsPlaying] = reactExports$1.useState(true);
  const [frameIndex, setFrameIndex] = reactExports$1.useState(0);
  const [activeTab, setActiveTab] = reactExports$1.useState("pfd");
  const [dataMode, setDataMode] = reactExports$1.useState("sample");
  const [connStatus, setConnStatus] = reactExports$1.useState("disconnected");
  const [liveSeq, setLiveSeq] = reactExports$1.useState(null);
  const [sourceStatus, setSourceStatus] = reactExports$1.useState(null);
  const [settingsHost, setSettingsHost] = reactExports$1.useState("0.0.0.0");
  const [settingsPort, setSettingsPort] = reactExports$1.useState("14443");
  const [settingsSimAltitudeFt, setSettingsSimAltitudeFt] = reactExports$1.useState("10000");
  const [settingsSimCasKt, setSettingsSimCasKt] = reactExports$1.useState("250");
  const [settingsSimThrottlePct, setSettingsSimThrottlePct] = reactExports$1.useState("60");
  const [settingsSimPitchDeg, setSettingsSimPitchDeg] = reactExports$1.useState("3");
  const [settingsBusy, setSettingsBusy] = reactExports$1.useState(false);
  const [backendMode, setBackendMode] = reactExports$1.useState("udp");
  const [isRecording, setIsRecording] = reactExports$1.useState(false);
  const [recordingFrames, setRecordingFrames] = reactExports$1.useState(0);
  const [recordings, setRecordings] = reactExports$1.useState([]);
  const [replayFrames, setReplayFrames] = reactExports$1.useState([]);
  const [replayIndex, setReplayIndex] = reactExports$1.useState(0);
  const [simulatorProfiles, setSimulatorProfiles] = reactExports$1.useState([]);
  const [selectedSimulatorProfileId, setSelectedSimulatorProfileId] = reactExports$1.useState("trim_hold_60s");
  const [simulatorInitialPresets, setSimulatorInitialPresets] = reactExports$1.useState([]);
  const [selectedSimulatorPresetId, setSelectedSimulatorPresetId] = reactExports$1.useState("cruise_10000_250");
  const [profileRunBusy, setProfileRunBusy] = reactExports$1.useState(false);
  const [profileRunResult, setProfileRunResult] = reactExports$1.useState(null);
  const [activeProfileReplay, setActiveProfileReplay] = reactExports$1.useState(null);
  const [profiles, setProfiles] = reactExports$1.useState([]);
  const [selectedProfileId, setSelectedProfileId] = reactExports$1.useState("default");
  const [profilesLoading, setProfilesLoading] = reactExports$1.useState(true);
  const frameRef = reactExports$1.useRef(frameIndex);
  const eventSourceRef = reactExports$1.useRef(null);
  const pressedKeys = reactExports$1.useRef(/* @__PURE__ */ new Set());
  const telemetryCallbackRef = reactExports$1.useRef(setFrame);
  telemetryCallbackRef.current = setFrame;
  reactExports$1.useEffect(() => {
    console.log("[App] wiring onTelemetryUpdate");
    window.__appControlsRef = aircraftControlsRef;
    aircraftControlsRef.current.onTelemetryUpdate = (f) => {
      telemetryCallbackRef.current(f);
    };
    return () => {
      console.log("[App] cleanup onTelemetryUpdate");
      aircraftControlsRef.current.onTelemetryUpdate = null;
    };
  }, []);
  reactExports$1.useEffect(() => {
    if (dataMode !== "sample") return;
    let animationId;
    let lastTime = 0;
    const tick = (time) => {
      if (!lastTime) lastTime = time;
      const dt = time - lastTime;
      if (dt > 33) {
        frameRef.current = (frameRef.current + 1) % sampleFrames.length;
        setFrameIndex(frameRef.current);
        const f = sampleFrames[frameRef.current];
        if (!aircraftControlsRef.current.telemetryLocked) {
          telemetryRef.current = f;
        }
        setFrame(f);
        lastTime = time;
      }
      if (isPlaying) animationId = requestAnimationFrame(tick);
    };
    if (isPlaying) animationId = requestAnimationFrame(tick);
    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [isPlaying, dataMode]);
  const connectLive = reactExports$1.useCallback(() => {
    if (eventSourceRef.current) eventSourceRef.current.close();
    setConnStatus("connecting");
    const es = new EventSource(LIVE_PFD_URL);
    eventSourceRef.current = es;
    es.addEventListener("open", () => {
      setConnStatus("waiting");
      setError(null);
    });
    es.addEventListener("pfd-frame", (event) => {
      try {
        const data = JSON.parse(event.data);
        const browserRecvMs = performance.timeOrigin + performance.now();
        telemetryRef.current = data;
        setFrame(data);
        setLiveSeq(data.seq ?? null);
        setConnStatus("receiving");
        setError(null);
        if (document.visibilityState === "hidden") return;
        const t0 = typeof data._t0_ms === "number" ? data._t0_ms : 0;
        const tDecode = typeof data._t_decode_ms === "number" ? data._t_decode_ms : 0;
        const frameId = typeof data._frame_id === "number" ? data._frame_id : 0;
        requestAnimationFrame(() => {
          const tPaintMs = performance.timeOrigin + performance.now();
          addSample({
            frame_id: frameId,
            t_recv_ms: t0,
            t_decoded_ms: tDecode,
            t_paint_ms: tPaintMs,
            processing_ms: tDecode - t0,
            display_ms: tPaintMs - t0
          });
        });
      } catch {
        setError("Failed to parse pfd-frame");
      }
    });
    es.addEventListener("status", (event) => {
      try {
        const status = JSON.parse(event.data);
        const fresh = status.lastPacketAgeMs !== null && status.lastPacketAgeMs < 3e3 || status.simulatorActive;
        setConnStatus(fresh ? "receiving" : "waiting");
        if (status.simulatorMode) {
          setBackendMode(status.simulatorMode);
        }
      } catch {
      }
    });
    es.addEventListener("error", () => {
      setConnStatus("disconnected");
      setError("SSE connection lost. Retrying...");
    });
  }, []);
  const disconnectLive = reactExports$1.useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setConnStatus("disconnected");
    setLiveSeq(null);
  }, []);
  const loadSourceStatus = reactExports$1.useCallback(async () => {
    try {
      const res = await fetch("/api/source/status");
      if (!res.ok) return;
      const data = await res.json();
      setSourceStatus(data);
    } catch {
    }
  }, []);
  const loadSimulatorConfig = reactExports$1.useCallback(async () => {
    try {
      const res = await fetch("/api/simulator/config");
      if (!res.ok) return;
      const data = await res.json();
      setSettingsSimAltitudeFt(String(Math.round(data.altitudeFt)));
      setSettingsSimCasKt(String(Math.round(data.casKt)));
      setSettingsSimThrottlePct(String(Math.round(data.throttle * 100)));
      setSettingsSimPitchDeg(String(data.pitchDeg));
    } catch {
    }
  }, []);
  const loadSimulatorProfiles = reactExports$1.useCallback(async () => {
    try {
      const res = await fetch("/api/simulator/profiles");
      if (!res.ok) return;
      const data = await res.json();
      setSimulatorProfiles(data);
      if (data.length > 0 && !data.some((profile) => profile.id === selectedSimulatorProfileId)) {
        setSelectedSimulatorProfileId(data[0].id);
      }
    } catch {
    }
  }, [selectedSimulatorProfileId]);
  const loadSimulatorInitialPresets = reactExports$1.useCallback(async () => {
    try {
      const res = await fetch("/api/simulator/profile-presets");
      if (!res.ok) return;
      const data = await res.json();
      setSimulatorInitialPresets(data);
      if (data.length > 0 && !data.some((preset) => preset.id === selectedSimulatorPresetId)) {
        setSelectedSimulatorPresetId(data[0].id);
      }
    } catch {
    }
  }, [selectedSimulatorPresetId]);
  reactExports$1.useEffect(() => {
    if (dataMode === "live") {
      setIsPlaying(false);
      connectLive();
    } else disconnectLive();
    return () => {
      disconnectLive();
    };
  }, [dataMode, connectLive, disconnectLive]);
  reactExports$1.useEffect(() => {
    loadSourceStatus();
    loadSimulatorConfig();
    loadSimulatorProfiles();
    loadSimulatorInitialPresets();
    const id = window.setInterval(loadSourceStatus, 1500);
    return () => window.clearInterval(id);
  }, [loadSourceStatus, loadSimulatorConfig, loadSimulatorProfiles, loadSimulatorInitialPresets]);
  reactExports$1.useEffect(() => {
    if (!sourceStatus) return;
    if (currentView !== "settings") {
      setSettingsHost(sourceStatus.udpHost);
      setSettingsPort(String(sourceStatus.udpPort));
    }
  }, [sourceStatus, currentView]);
  reactExports$1.useEffect(() => {
    if (currentView === "settings") {
      void loadSimulatorConfig();
    }
  }, [currentView, loadSimulatorConfig]);
  reactExports$1.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await getProfiles();
        if (cancelled) return;
        setProfiles(list);
      } catch {
      } finally {
        if (!cancelled) setProfilesLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);
  const handleProfileChange = reactExports$1.useCallback(async (profileId) => {
    if (profileId === selectedProfileId) return;
    try {
      const rootNode = window.__panelBuilderRootNode;
      if (rootNode) {
        const json = JSON.stringify(rootNode, null, 2);
        await saveCurrentProfile(json);
      }
    } catch {
    }
    const profile = await loadProfile(profileId);
    if (!profile) return;
    if (profile.panelConfigName) {
      const panelJson = await loadProfile$1(profile.panelConfigName);
      if (panelJson) {
        window.__pendingPanelLoad = JSON.parse(panelJson);
      }
    }
    setSelectedProfileId(profileId);
  }, [selectedProfileId]);
  const loadRecordings = reactExports$1.useCallback(async () => {
    try {
      const res = await fetch("/api/recordings");
      if (res.ok) {
        const data = await res.json();
        setRecordings(data);
      }
    } catch {
    }
  }, []);
  const checkCaptureStatus = reactExports$1.useCallback(async () => {
    try {
      const res = await fetch("/api/capture/status");
      if (res.ok) {
        const data = await res.json();
        setIsRecording(data.active);
        setRecordingFrames(data.frames);
      }
    } catch {
    }
  }, []);
  reactExports$1.useEffect(() => {
    if (dataMode !== "live") return;
    loadRecordings();
    checkCaptureStatus();
    const id = setInterval(() => {
      loadRecordings();
      checkCaptureStatus();
    }, 2e3);
    return () => clearInterval(id);
  }, [dataMode, loadRecordings, checkCaptureStatus]);
  reactExports$1.useEffect(() => {
    const handleKeyDown = (e) => {
      var _a2, _b2;
      if (((_a2 = document.activeElement) == null ? void 0 : _a2.tagName) === "INPUT" || ((_b2 = document.activeElement) == null ? void 0 : _b2.tagName) === "TEXTAREA") {
        return;
      }
      pressedKeys.current.add(e.key.toLowerCase());
      if (["arrowup", "arrowdown", "arrowleft", "arrowright", " ", "spacebar"].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
    };
    const handleKeyUp = (e) => {
      pressedKeys.current.delete(e.key.toLowerCase());
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);
  reactExports$1.useEffect(() => {
    if (dataMode !== "live" || backendMode !== "simulator") return;
    let currentRoll = 0;
    let currentPitch = 0;
    let currentRudder = 0;
    let currentThrottle = 0.6;
    fetch("/api/simulator/status").then((res) => res.json()).then((data) => {
      if (data == null ? void 0 : data.controls) {
        currentRoll = data.controls.roll;
        currentPitch = data.controls.pitch;
        currentRudder = data.controls.rudder;
        currentThrottle = data.controls.throttle;
      }
    }).catch(() => {
    });
    const interval = setInterval(() => {
      const keys = pressedKeys.current;
      let targetRoll = 0;
      let targetPitch = 0;
      let targetRudder = 0;
      if (keys.has("a") || keys.has("arrowleft")) targetRoll = -1;
      else if (keys.has("d") || keys.has("arrowright")) targetRoll = 1;
      if (keys.has("w") || keys.has("arrowup")) targetPitch = -1;
      else if (keys.has("s") || keys.has("arrowdown")) targetPitch = 1;
      if (keys.has("q")) targetRudder = -1;
      else if (keys.has("e")) targetRudder = 1;
      currentRoll += (targetRoll - currentRoll) * 0.35;
      currentPitch += (targetPitch - currentPitch) * 0.35;
      currentRudder += (targetRudder - currentRudder) * 0.35;
      if (keys.has("shift")) {
        currentThrottle = Math.min(1, currentThrottle + 0.015);
      }
      if (keys.has("control")) {
        currentThrottle = Math.max(0, currentThrottle - 0.015);
      }
      if (keys.has(" ") || keys.has("r")) {
        resetSimulation();
      }
      fetch("/api/simulator/control", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roll: currentRoll,
          pitch: currentPitch,
          rudder: currentRudder,
          throttle: currentThrottle,
          pilot: {
            keys: Array.from(keys),
            rollCmdRaw: targetRoll,
            pitchCmdRaw: targetPitch,
            rudderCmdRaw: targetRudder,
            throttleCmdRaw: currentThrottle
          }
        })
      }).catch(() => {
      });
    }, 50);
    return () => clearInterval(interval);
  }, [dataMode, backendMode]);
  reactExports$1.useEffect(() => {
    if (dataMode !== "replay" || replayFrames.length === 0 || !isPlaying) return;
    const interval = setInterval(() => {
      setReplayIndex((prevIndex) => {
        const nextIndex = prevIndex + 1;
        if (nextIndex >= replayFrames.length) {
          setIsPlaying(false);
          return prevIndex;
        }
        const f = replayFrames[nextIndex];
        telemetryRef.current = f;
        setFrame(f);
        return nextIndex;
      });
    }, 40);
    return () => clearInterval(interval);
  }, [dataMode, replayFrames, isPlaying]);
  const setBackendSimulatorMode = async (mode) => {
    try {
      const res = await fetch("/api/simulator/mode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode })
      });
      if (res.ok) {
        setBackendMode(mode);
        setError(null);
      }
    } catch {
      setError("Failed to switch backend mode");
    }
  };
  const resetSimulation = async () => {
    try {
      await fetch("/api/simulator/reset", { method: "POST" });
    } catch {
    }
  };
  const runSimulatorProfile = async () => {
    try {
      setProfileRunBusy(true);
      setProfileRunResult(null);
      const res = await fetch("/api/simulator/profile/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId: selectedSimulatorProfileId,
          presetId: selectedSimulatorPresetId
        })
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to run simulator profile");
      }
      setProfileRunResult(data);
      setError(null);
      await loadRecordings();
      if (data.telemetryRecordingId) {
        setActiveTab("pfd");
        setActiveProfileReplay({
          profileId: selectedSimulatorProfileId,
          presetId: selectedSimulatorPresetId,
          recordingId: data.telemetryRecordingId,
          frames: data.frames ?? 0
        });
        await startReplay(data.telemetryRecordingId);
      }
    } catch (e) {
      const message = (e == null ? void 0 : e.message) || "Failed to run simulator profile";
      setProfileRunResult({ ok: false, error: message });
      setError(message);
    } finally {
      setProfileRunBusy(false);
    }
  };
  const handleStartCapture = async () => {
    try {
      const source = (sourceStatus == null ? void 0 : sourceStatus.source) || "unknown";
      const res = await fetch("/api/capture/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source, duration: "capture" })
      });
      if (res.ok) {
        const data = await res.json();
        setIsRecording(data.active);
        setRecordingFrames(data.frames);
      }
    } catch {
    }
  };
  const handleStopCapture = async () => {
    try {
      const res = await fetch("/api/capture/stop", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setIsRecording(data.active);
        await loadRecordings();
      }
    } catch {
    }
  };
  const startReplay = async (recordingId) => {
    try {
      setError("Loading recording...");
      const res = await fetch(`/api/recordings/${recordingId}/range?limit=50000`);
      if (!res.ok) throw new Error("Failed to load recording frames");
      const frames = await res.json();
      if (!Array.isArray(frames) || frames.length === 0) {
        throw new Error("Recording is empty");
      }
      setReplayFrames(frames);
      setReplayIndex(0);
      telemetryRef.current = frames[0];
      setFrame(frames[0]);
      setDataMode("replay");
      setIsPlaying(true);
      setError(null);
    } catch (e) {
      setError(e.message || "Failed to start replay");
    }
  };
  const handleFileUpload = (event) => {
    var _a2;
    const file = (_a2 = event.target.files) == null ? void 0 : _a2[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      var _a3;
      try {
        const text = (_a3 = e.target) == null ? void 0 : _a3.result;
        const json = JSON.parse(text);
        telemetryRef.current = json;
        setFrame(json);
        setIsPlaying(false);
        setError(null);
      } catch {
        setError("Failed to parse JSON file.");
      }
    };
    reader.readAsText(file);
  };
  const openViewer = () => {
    window.location.href = "/viewer/";
  };
  const saveSourceSettings = async () => {
    const port = Number(settingsPort);
    if (!Number.isFinite(port) || port < 1 || port > 65535) {
      setError("Invalid UDP port (1-65535)");
      return;
    }
    const altitudeFt = Number(settingsSimAltitudeFt);
    const casKt = Number(settingsSimCasKt);
    const throttlePct = Number(settingsSimThrottlePct);
    const pitchDeg = Number(settingsSimPitchDeg);
    if (!Number.isFinite(altitudeFt) || altitudeFt < 0 || altitudeFt > 6e4) {
      setError("Invalid simulator altitude (0-60000 ft)");
      return;
    }
    if (!Number.isFinite(casKt) || casKt < 60 || casKt > 500) {
      setError("Invalid simulator CAS (60-500 kt)");
      return;
    }
    if (!Number.isFinite(throttlePct) || throttlePct < 0 || throttlePct > 100) {
      setError("Invalid simulator throttle (0-100%)");
      return;
    }
    if (!Number.isFinite(pitchDeg) || pitchDeg < -10 || pitchDeg > 15) {
      setError("Invalid simulator pitch (-10..15 deg)");
      return;
    }
    setSettingsBusy(true);
    try {
      const [sourceRes, simulatorRes] = await Promise.all([
        fetch("/api/source/config", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ host: settingsHost.trim() || "0.0.0.0", port })
        }),
        fetch("/api/simulator/config", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            altitudeFt,
            casKt,
            throttle: throttlePct / 100,
            pitchDeg
          })
        })
      ]);
      if (!sourceRes.ok) {
        const e = await sourceRes.json().catch(() => ({}));
        setError(e.error || "Failed to update source");
      } else if (!simulatorRes.ok) {
        const e = await simulatorRes.json().catch(() => ({}));
        setError(e.error || "Failed to update simulator");
      } else {
        const simulatorData = await simulatorRes.json().catch(() => null);
        const config = simulatorData == null ? void 0 : simulatorData.initialConfig;
        if (config) {
          setSettingsSimAltitudeFt(String(Math.round(config.altitudeFt)));
          setSettingsSimCasKt(String(Math.round(config.casKt)));
          setSettingsSimThrottlePct(String(Math.round(config.throttle * 100)));
          setSettingsSimPitchDeg(String(config.pitchDeg));
        }
        setError(null);
        await loadSourceStatus();
      }
    } catch {
      setError("Failed to update settings");
    } finally {
      setSettingsBusy(false);
    }
  };
  const connStatusColor = { disconnected: "bg-red-500", connecting: "bg-yellow-500", waiting: "bg-yellow-500", receiving: "bg-green-500" }[connStatus];
  const connStatusLabel = { disconnected: "disconnected", connecting: "connecting...", waiting: `waiting UDP (${(sourceStatus == null ? void 0 : sourceStatus.udpPort) ?? "?"})`, receiving: `UDP (${(sourceStatus == null ? void 0 : sourceStatus.udpPort) ?? "?"})` }[connStatus];
  if (currentView === "hub") {
    return /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "min-h-screen bg-[#0a0a0f] flex flex-col items-center p-8 pt-16", children: /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "w-full max-w-3xl mx-auto flex flex-col gap-8", children: [
      /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports$1.jsxs("h1", { className: "text-5xl font-bold text-white tracking-tight mb-3", children: [
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("span", { className: "text-blue-400", children: "Pilot" }),
          " ",
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("span", { className: "text-purple-400", children: "3D" }),
          " ",
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("span", { className: "text-green-400", children: "PFD" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports$1.jsx("p", { className: "text-white/40 text-lg", children: "Flight Display · Live Telemetry · Diagnostic Viewer" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "grid grid-cols-3 gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports$1.jsxs(
          "button",
          {
            onClick: () => setCurrentView("pfd"),
            className: "group relative bg-gradient-to-br from-blue-900/40 to-purple-900/40 border border-blue-500/20 rounded-2xl p-8 text-left hover:border-blue-400/50 hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-blue-500/10",
            children: [
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "absolute top-4 right-4 w-2 h-2 rounded-full bg-blue-400 group-hover:animate-pulse" }),
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "p-3 bg-blue-500/20 rounded-xl w-fit mb-5", children: /* @__PURE__ */ jsxRuntimeExports$1.jsx(LayoutDashboard, { className: "w-8 h-8 text-blue-400" }) }),
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("h2", { className: "text-2xl font-bold text-white mb-2", children: "Flight Display" }),
              /* @__PURE__ */ jsxRuntimeExports$1.jsxs("p", { className: "text-white/50 text-sm leading-relaxed", children: [
                "Attitude indicator, airspeed tape, altitude tape,",
                /* @__PURE__ */ jsxRuntimeExports$1.jsx("br", {}),
                "AoA, vertical speed. Sample & Live UDP modes."
              ] }),
              /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "flex items-center gap-2 mt-4 text-blue-400 text-sm font-medium", children: [
                /* @__PURE__ */ jsxRuntimeExports$1.jsx(Play, { className: "w-4 h-4" }),
                " Open PFD →"
              ] })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports$1.jsxs(
          "button",
          {
            onClick: () => setCurrentView("aircraft3d"),
            className: "group relative bg-gradient-to-br from-sky-900/40 to-indigo-900/40 border border-sky-500/20 rounded-2xl p-8 text-left hover:border-sky-400/50 hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-sky-500/10",
            children: [
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "absolute top-4 right-4 w-2 h-2 rounded-full bg-sky-400 group-hover:animate-pulse" }),
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "p-3 bg-sky-500/20 rounded-xl w-fit mb-5", children: /* @__PURE__ */ jsxRuntimeExports$1.jsx(Plane, { className: "w-8 h-8 text-sky-400" }) }),
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("h2", { className: "text-2xl font-bold text-white mb-2", children: "3D Aircraft" }),
              /* @__PURE__ */ jsxRuntimeExports$1.jsxs("p", { className: "text-white/50 text-sm leading-relaxed", children: [
                "Flight visualization:",
                /* @__PURE__ */ jsxRuntimeExports$1.jsx("br", {}),
                "pitch, roll, heading, speed, altitude."
              ] }),
              /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "flex items-center gap-2 mt-4 text-sky-400 text-sm font-medium", children: [
                /* @__PURE__ */ jsxRuntimeExports$1.jsx(Zap, { className: "w-4 h-4" }),
                " Open 3D →"
              ] })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports$1.jsxs(
          "button",
          {
            onClick: () => setCurrentView("rawMonitor"),
            className: "group relative bg-gradient-to-br from-emerald-900/40 to-teal-900/40 border border-emerald-500/20 rounded-2xl p-8 text-left hover:border-emerald-400/50 hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-emerald-500/10",
            children: [
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "absolute top-4 right-4 w-2 h-2 rounded-full bg-emerald-400 group-hover:animate-pulse" }),
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "p-3 bg-emerald-500/20 rounded-xl w-fit mb-5", children: /* @__PURE__ */ jsxRuntimeExports$1.jsx(Terminal, { className: "w-8 h-8 text-emerald-400" }) }),
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("h2", { className: "text-2xl font-bold text-white mb-2", children: "Raw Data Monitor" }),
              /* @__PURE__ */ jsxRuntimeExports$1.jsxs("p", { className: "text-white/50 text-sm leading-relaxed", children: [
                "Live parser output inspector,",
                /* @__PURE__ */ jsxRuntimeExports$1.jsx("br", {}),
                "decoded parameters, raw hex view."
              ] }),
              /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "flex items-center gap-2 mt-4 text-emerald-400 text-sm font-medium", children: [
                /* @__PURE__ */ jsxRuntimeExports$1.jsx(Zap, { className: "w-4 h-4" }),
                " Open Monitor →"
              ] })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports$1.jsxs(
          "button",
          {
            onClick: () => setCurrentView("panelBuilder"),
            className: "group relative bg-gradient-to-br from-amber-900/40 to-orange-900/40 border border-amber-500/20 rounded-2xl p-8 text-left hover:border-amber-400/50 hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-amber-500/10",
            children: [
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "absolute top-4 right-4 w-2 h-2 rounded-full bg-amber-400 group-hover:animate-pulse" }),
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "p-3 bg-amber-500/20 rounded-xl w-fit mb-5", children: /* @__PURE__ */ jsxRuntimeExports$1.jsx(LayoutDashboard, { className: "w-8 h-8 text-amber-400" }) }),
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("h2", { className: "text-2xl font-bold text-white mb-2", children: "Panel Builder" }),
              /* @__PURE__ */ jsxRuntimeExports$1.jsxs("p", { className: "text-white/50 text-sm leading-relaxed", children: [
                "Design custom instrument layouts,",
                /* @__PURE__ */ jsxRuntimeExports$1.jsx("br", {}),
                "drag-and-drop cockpit composition."
              ] }),
              /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "flex items-center gap-2 mt-4 text-amber-400 text-sm font-medium", children: [
                /* @__PURE__ */ jsxRuntimeExports$1.jsx(Zap, { className: "w-4 h-4" }),
                " Open Builder →"
              ] })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports$1.jsxs(
          "button",
          {
            onClick: openViewer,
            className: "group relative bg-gradient-to-br from-cyan-900/40 to-teal-900/40 border border-cyan-500/20 rounded-2xl p-8 text-left hover:border-cyan-400/50 hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-cyan-500/10",
            children: [
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "absolute top-4 right-4 w-2 h-2 rounded-full bg-cyan-400 group-hover:animate-pulse" }),
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "p-3 bg-cyan-500/20 rounded-xl w-fit mb-5", children: /* @__PURE__ */ jsxRuntimeExports$1.jsx(Monitor, { className: "w-8 h-8 text-cyan-400" }) }),
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("h2", { className: "text-2xl font-bold text-white mb-2", children: "Diagnostic Viewer" }),
              /* @__PURE__ */ jsxRuntimeExports$1.jsxs("p", { className: "text-white/50 text-sm leading-relaxed", children: [
                "Live telemetry stream, capture control,",
                /* @__PURE__ */ jsxRuntimeExports$1.jsx("br", {}),
                "recording replay, raw frame inspector."
              ] }),
              /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "flex items-center gap-2 mt-4 text-cyan-400 text-sm font-medium", children: [
                /* @__PURE__ */ jsxRuntimeExports$1.jsx(Zap, { className: "w-4 h-4" }),
                " Open Viewer →"
              ] })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports$1.jsxs(
          "button",
          {
            onClick: () => setCurrentView("settings"),
            className: "group relative bg-gradient-to-br from-violet-900/40 to-fuchsia-900/40 border border-violet-500/20 rounded-2xl p-8 text-left hover:border-violet-400/50 hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-violet-500/10",
            children: [
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "absolute top-4 right-4 w-2 h-2 rounded-full bg-violet-400 group-hover:animate-pulse" }),
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "p-3 bg-violet-500/20 rounded-xl w-fit mb-5", children: /* @__PURE__ */ jsxRuntimeExports$1.jsx(Settings, { className: "w-8 h-8 text-violet-400" }) }),
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("h2", { className: "text-2xl font-bold text-white mb-2", children: "Global Source Settings" }),
              /* @__PURE__ */ jsxRuntimeExports$1.jsxs("p", { className: "text-white/50 text-sm leading-relaxed", children: [
                "Runtime decoder source config,",
                /* @__PURE__ */ jsxRuntimeExports$1.jsx("br", {}),
                "one UDP host/port for all pages."
              ] }),
              /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "flex items-center gap-2 mt-4 text-violet-400 text-sm font-medium", children: [
                /* @__PURE__ */ jsxRuntimeExports$1.jsx(Zap, { className: "w-4 h-4" }),
                " Open Settings →"
              ] })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports$1.jsxs(
          "button",
          {
            onClick: () => setCurrentView("charts"),
            className: "group relative bg-gradient-to-br from-teal-900/40 to-cyan-900/40 border border-teal-500/20 rounded-2xl p-8 text-left hover:border-teal-400/50 hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-teal-500/10",
            children: [
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "absolute top-4 right-4 w-2 h-2 rounded-full bg-teal-400 group-hover:animate-pulse" }),
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "p-3 bg-teal-500/20 rounded-xl w-fit mb-5", children: /* @__PURE__ */ jsxRuntimeExports$1.jsx(Activity, { className: "w-8 h-8 text-teal-400" }) }),
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("h2", { className: "text-2xl font-bold text-white mb-2", children: "Realtime Charts" }),
              /* @__PURE__ */ jsxRuntimeExports$1.jsxs("p", { className: "text-white/50 text-sm leading-relaxed", children: [
                "Stacked & Overlay telemetry plots,",
                /* @__PURE__ */ jsxRuntimeExports$1.jsx("br", {}),
                "realtime decimated line charts."
              ] }),
              /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "flex items-center gap-2 mt-4 text-teal-400 text-sm font-medium", children: [
                /* @__PURE__ */ jsxRuntimeExports$1.jsx(Zap, { className: "w-4 h-4" }),
                " Open Charts →"
              ] })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "flex items-center justify-center gap-6 text-white/30 text-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports$1.jsxs("span", { className: "flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports$1.jsx(Gauge, { className: "w-3.5 h-3.5" }),
          " UDP (",
          (sourceStatus == null ? void 0 : sourceStatus.udpPort) ?? "...",
          ")"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports$1.jsx("span", { children: (sourceStatus == null ? void 0 : sourceStatus.schema) ?? "telemetry-frame.v1" }),
        /* @__PURE__ */ jsxRuntimeExports$1.jsx("span", { children: (sourceStatus == null ? void 0 : sourceStatus.active) ? "active" : "inactive" }),
        /* @__PURE__ */ jsxRuntimeExports$1.jsxs("span", { className: "text-white/25", children: [
          "v",
          APP_VERSION
        ] })
      ] })
    ] }) });
  }
  if (currentView === "aircraft3d") {
    return /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "h-screen w-screen bg-[#121212] flex flex-col overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "shrink-0 flex items-center gap-3 bg-black/60 px-4 py-2 border-b border-white/10", children: [
        /* @__PURE__ */ jsxRuntimeExports$1.jsx(
          "button",
          {
            onClick: () => setCurrentView("hub"),
            className: "p-1.5 hover:bg-white/10 rounded-lg transition text-white/60 hover:text-white",
            title: "Back to Hub",
            children: /* @__PURE__ */ jsxRuntimeExports$1.jsx(ArrowLeft, { className: "w-5 h-5" })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "p-1.5 bg-sky-500/20 text-sky-400 rounded-lg", children: /* @__PURE__ */ jsxRuntimeExports$1.jsx(Plane, { className: "w-5 h-5" }) }),
        /* @__PURE__ */ jsxRuntimeExports$1.jsx("h1", { className: "text-white font-medium text-base tracking-tight", children: "3D Aircraft" }),
        /* @__PURE__ */ jsxRuntimeExports$1.jsx("span", { className: "text-white/30 text-xs ml-auto", children: "Pitch / Roll / Heading · telemetry-frame.v1" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "flex-1 min-h-0", children: /* @__PURE__ */ jsxRuntimeExports$1.jsx(reactExports$1.Suspense, { fallback: /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "flex items-center justify-center h-full text-white/30", children: "Loading 3D..." }), children: /* @__PURE__ */ jsxRuntimeExports$1.jsx(Aircraft3DInstrument, { frame }) }) })
    ] });
  }
  if (currentView === "rawMonitor") {
    return /* @__PURE__ */ jsxRuntimeExports$1.jsx(RawMonitor, { onBack: () => setCurrentView("hub") });
  }
  if (currentView === "charts") {
    const epochMs = performance.timeOrigin + performance.now();
    return /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "h-screen w-screen bg-[#0a0a0f] flex flex-col", children: [
      /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "shrink-0 flex items-center gap-3 bg-black/60 px-4 py-2 border-b border-white/10", children: [
        /* @__PURE__ */ jsxRuntimeExports$1.jsx(
          "button",
          {
            onClick: () => setCurrentView("hub"),
            className: "p-1.5 hover:bg-white/10 rounded-lg transition text-white/60 hover:text-white",
            title: "Back to Hub",
            children: /* @__PURE__ */ jsxRuntimeExports$1.jsx(ArrowLeft, { className: "w-5 h-5" })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "p-1.5 bg-teal-500/20 text-teal-400 rounded-lg", children: /* @__PURE__ */ jsxRuntimeExports$1.jsx(Activity, { className: "w-5 h-5" }) }),
        /* @__PURE__ */ jsxRuntimeExports$1.jsx("h1", { className: "text-white font-medium text-base tracking-tight", children: "Realtime Charts" }),
        /* @__PURE__ */ jsxRuntimeExports$1.jsx("span", { className: "text-white/30 text-xs ml-auto", children: "stacked / overlay · telemetry-frame.v1" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "flex-1 min-h-0", children: /* @__PURE__ */ jsxRuntimeExports$1.jsx(
        ChartsView,
        {
          frame,
          epochMs,
          catalog: FIELD_CATALOG
        }
      ) })
    ] });
  }
  if (currentView === "panelBuilder") {
    return /* @__PURE__ */ jsxRuntimeExports$1.jsx(TelemetryProvider, { frame, children: /* @__PURE__ */ jsxRuntimeExports$1.jsx(PanelBuilder, { onBack: () => setCurrentView("hub") }) });
  }
  if (currentView === "settings") {
    return /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "min-h-screen bg-[#0a0a0f] flex items-start justify-center p-6 pt-16", children: /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "w-full max-w-3xl bg-black/40 border border-white/10 rounded-2xl p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "flex items-center justify-between mb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports$1.jsx(
            "button",
            {
              onClick: () => setCurrentView("hub"),
              className: "p-2 hover:bg-white/10 rounded-lg transition text-white/60 hover:text-white",
              title: "Back to Hub",
              children: /* @__PURE__ */ jsxRuntimeExports$1.jsx(ArrowLeft, { className: "w-5 h-5" })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("h1", { className: "text-white text-xl font-semibold", children: "Global Source Settings" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports$1.jsx("span", { className: "text-xs text-white/40 font-mono", children: (sourceStatus == null ? void 0 : sourceStatus.source) ?? "tnparser-udp-..." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "space-y-5", children: [
        /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("label", { className: "block text-sm text-white/60 mb-2", children: "UDP host" }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx(
            "input",
            {
              value: settingsHost,
              onChange: (e) => setSettingsHost(e.target.value),
              className: "w-full px-3 py-2 bg-black/60 border border-white/15 rounded-lg text-white font-mono"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("label", { className: "block text-sm text-white/60 mb-2", children: "UDP port" }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx(
            "input",
            {
              value: settingsPort,
              onChange: (e) => setSettingsPort(e.target.value),
              className: "w-full px-3 py-2 bg-black/60 border border-white/15 rounded-lg text-white font-mono"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "rounded-xl border border-white/10 bg-white/[0.03] p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "text-sm font-medium text-white mb-3", children: "Simulator initial state" }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("label", { className: "block text-sm text-white/60 mb-2", children: "Start altitude, ft" }),
              /* @__PURE__ */ jsxRuntimeExports$1.jsx(
                "input",
                {
                  type: "number",
                  min: 0,
                  max: 6e4,
                  value: settingsSimAltitudeFt,
                  onChange: (e) => setSettingsSimAltitudeFt(e.target.value),
                  className: "w-full px-3 py-2 bg-black/60 border border-white/15 rounded-lg text-white font-mono"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("label", { className: "block text-sm text-white/60 mb-2", children: "Start CAS, kt" }),
              /* @__PURE__ */ jsxRuntimeExports$1.jsx(
                "input",
                {
                  type: "number",
                  min: 60,
                  max: 500,
                  value: settingsSimCasKt,
                  onChange: (e) => setSettingsSimCasKt(e.target.value),
                  className: "w-full px-3 py-2 bg-black/60 border border-white/15 rounded-lg text-white font-mono"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("label", { className: "block text-sm text-white/60 mb-2", children: "Start throttle, %" }),
              /* @__PURE__ */ jsxRuntimeExports$1.jsx(
                "input",
                {
                  type: "number",
                  min: 0,
                  max: 100,
                  value: settingsSimThrottlePct,
                  onChange: (e) => setSettingsSimThrottlePct(e.target.value),
                  className: "w-full px-3 py-2 bg-black/60 border border-white/15 rounded-lg text-white font-mono"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("label", { className: "block text-sm text-white/60 mb-2", children: "Start pitch, deg" }),
              /* @__PURE__ */ jsxRuntimeExports$1.jsx(
                "input",
                {
                  type: "number",
                  min: -10,
                  max: 15,
                  step: 0.1,
                  value: settingsSimPitchDeg,
                  onChange: (e) => setSettingsSimPitchDeg(e.target.value),
                  className: "w-full px-3 py-2 bg-black/60 border border-white/15 rounded-lg text-white font-mono"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "text-xs text-white/35 mt-3", children: "Applies on simulator start/reset. Active simulation keeps current state until reset." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "rounded-xl border border-white/10 bg-white/[0.03] p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "text-sm font-medium text-white mb-3", children: "UI settings" }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "flex items-center justify-between gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "text-sm text-white/70", children: "Instrument tooltip font size" }),
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "text-xs text-white/35", children: "Common value from UI_SETTINGS.tooltip.fontSizePx" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "font-mono text-lg text-emerald-300", children: [
              UI_SETTINGS.tooltip.fontSizePx,
              "px"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "flex items-center justify-between pt-2", children: [
          /* @__PURE__ */ jsxRuntimeExports$1.jsxs("span", { className: "text-white/40 text-sm", children: [
            "active: ",
            (sourceStatus == null ? void 0 : sourceStatus.active) ? "yes" : "no",
            " | schema: ",
            (sourceStatus == null ? void 0 : sourceStatus.schema) ?? "telemetry-frame.v1"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx(
            "button",
            {
              onClick: saveSourceSettings,
              disabled: settingsBusy,
              className: "px-4 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium",
              children: settingsBusy ? "Applying..." : "Apply"
            }
          )
        ] }),
        error && /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "text-red-400 text-sm", children: error })
      ] })
    ] }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "h-screen w-screen bg-[#121212] flex flex-col overflow-hidden p-3", children: /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "w-full h-full flex flex-col gap-3 min-h-0", children: [
    /* @__PURE__ */ jsxRuntimeExports$1.jsxs("header", { className: "shrink-0 flex items-center justify-between bg-black/40 p-4 rounded-xl border border-white/10 shadow-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports$1.jsx(
          "button",
          {
            onClick: () => setCurrentView("hub"),
            className: "p-2 hover:bg-white/10 rounded-lg transition text-white/60 hover:text-white",
            title: "Back to Hub",
            children: /* @__PURE__ */ jsxRuntimeExports$1.jsx(ArrowLeft, { className: "w-5 h-5" })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "p-2 bg-blue-500/20 text-blue-400 rounded-lg", children: /* @__PURE__ */ jsxRuntimeExports$1.jsx(FileJson, { className: "w-6 h-6" }) }),
        /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("h1", { className: "text-white font-medium text-lg tracking-tight", children: "Flight Display" }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("p", { className: "text-white/50 text-sm", children: "saved PanelBuilder layout · telemetry-frame.v1" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "h-4 w-[1px] bg-white/10" }),
        /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "flex items-center gap-1", children: /* @__PURE__ */ jsxRuntimeExports$1.jsx(
          "select",
          {
            className: "bg-white/10 border border-white/10 text-xs text-white rounded px-2 py-1.5 max-w-[160px] cursor-pointer outline-none focus:border-blue-500",
            value: selectedProfileId,
            onChange: (e) => void handleProfileChange(e.target.value),
            disabled: profilesLoading,
            children: profilesLoading ? /* @__PURE__ */ jsxRuntimeExports$1.jsx("option", { value: "", children: "Loading..." }) : profiles.length === 0 ? /* @__PURE__ */ jsxRuntimeExports$1.jsx("option", { value: "", children: "No profiles" }) : profiles.map((p) => /* @__PURE__ */ jsxRuntimeExports$1.jsxs("option", { value: p.id, children: [
              p.name,
              p.panelConfigName ? ` (${p.panelConfigName})` : ""
            ] }, p.id))
          }
        ) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "flex bg-white/5 rounded-lg p-1 border border-white/10", children: [
          /* @__PURE__ */ jsxRuntimeExports$1.jsxs(
            "button",
            {
              onClick: () => {
                setDataMode("sample");
                setActiveProfileReplay(null);
              },
              className: `px-3 py-1.5 rounded-md text-sm font-medium transition flex items-center gap-2 ${dataMode === "sample" ? "bg-purple-500/20 text-purple-400" : "text-white/60 hover:text-white"}`,
              children: [
                /* @__PURE__ */ jsxRuntimeExports$1.jsx(Play, { className: "w-4 h-4" }),
                " Sample"
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports$1.jsxs(
            "button",
            {
              onClick: () => {
                setDataMode("live");
                setActiveProfileReplay(null);
              },
              className: `px-3 py-1.5 rounded-md text-sm font-medium transition flex items-center gap-2 ${dataMode === "live" ? "bg-green-500/20 text-green-400" : "text-white/60 hover:text-white"}`,
              children: [
                /* @__PURE__ */ jsxRuntimeExports$1.jsx(Radio, { className: "w-4 h-4" }),
                " Live"
              ]
            }
          ),
          dataMode === "replay" && /* @__PURE__ */ jsxRuntimeExports$1.jsxs("span", { className: "px-3 py-1.5 rounded-md text-sm font-medium bg-blue-500/20 text-blue-400 flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports$1.jsx(FileJson, { className: "w-4 h-4" }),
            " Replay Mode"
          ] })
        ] }),
        dataMode === "live" && /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10", children: [
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("span", { className: `w-2 h-2 rounded-full ${connStatusColor}` }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("span", { className: "text-white/60 text-sm", children: backendMode === "simulator" ? "Simulating" : connStatusLabel }),
          liveSeq !== null && /* @__PURE__ */ jsxRuntimeExports$1.jsxs("span", { className: "text-white/30 text-xs", children: [
            "#",
            liveSeq
          ] })
        ] }),
        dataMode === "replay" && activeProfileReplay && /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "flex items-center gap-2 px-3 py-1.5 bg-purple-500/10 rounded-lg border border-purple-500/20", children: [
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("span", { className: `w-2 h-2 rounded-full ${isPlaying ? "bg-purple-400 animate-pulse" : "bg-white/35"}` }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsxs("span", { className: "text-purple-200 text-sm", children: [
            "Profile ",
            isPlaying ? "running" : "paused"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsxs("span", { className: "text-purple-200/50 text-xs font-mono", children: [
            replayIndex + 1,
            "/",
            replayFrames.length || activeProfileReplay.frames
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "flex bg-white/5 rounded-lg p-1 border border-white/10", children: [
          /* @__PURE__ */ jsxRuntimeExports$1.jsxs(
            "button",
            {
              onClick: () => setActiveTab("pfd"),
              className: `px-3 py-1.5 rounded-md text-sm font-medium transition flex items-center gap-2 ${activeTab === "pfd" ? "bg-blue-500/20 text-blue-400" : "text-white/60 hover:text-white"}`,
              children: [
                /* @__PURE__ */ jsxRuntimeExports$1.jsx(Activity, { className: "w-4 h-4" }),
                " Display"
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports$1.jsxs(
            "button",
            {
              onClick: () => setActiveTab("data"),
              className: `px-3 py-1.5 rounded-md text-sm font-medium transition flex items-center gap-2 ${activeTab === "data" ? "bg-blue-500/20 text-blue-400" : "text-white/60 hover:text-white"}`,
              children: [
                /* @__PURE__ */ jsxRuntimeExports$1.jsx(Database, { className: "w-4 h-4" }),
                " Data"
              ]
            }
          )
        ] }),
        (dataMode === "sample" || dataMode === "replay") && /* @__PURE__ */ jsxRuntimeExports$1.jsx(
          "button",
          {
            onClick: () => setIsPlaying(!isPlaying),
            className: "flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/15 transition text-white text-sm font-medium rounded-lg border border-white/10",
            children: isPlaying ? /* @__PURE__ */ jsxRuntimeExports$1.jsx(Pause, { className: "w-4 h-4" }) : /* @__PURE__ */ jsxRuntimeExports$1.jsx(Play, { className: "w-4 h-4" })
          }
        ),
        error && /* @__PURE__ */ jsxRuntimeExports$1.jsx("span", { className: "text-red-400 text-sm font-medium max-w-[200px] truncate", children: error }),
        /* @__PURE__ */ jsxRuntimeExports$1.jsxs("label", { className: "cursor-pointer flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/15 transition text-white text-sm font-medium rounded-lg border border-white/10", children: [
          /* @__PURE__ */ jsxRuntimeExports$1.jsx(Upload, { className: "w-4 h-4" }),
          " Upload JSON",
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("input", { type: "file", accept: ".json", className: "hidden", onChange: handleFileUpload })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "flex flex-1 min-h-0 gap-4 w-full", children: [
      /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "flex flex-1 min-w-0 min-h-0 flex-col", children: [
        /* @__PURE__ */ jsxRuntimeExports$1.jsx("main", { className: "w-full flex-1 min-h-0 bg-black rounded-2xl overflow-hidden shadow-2xl relative border-4 border-gray-900 select-none flex", children: activeTab === "pfd" ? /* @__PURE__ */ jsxRuntimeExports$1.jsx(PanelDisplay, { frame }) : /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "w-full h-full p-6 overflow-auto text-sm font-mono text-green-400 bg-black/90", children: /* @__PURE__ */ jsxRuntimeExports$1.jsx("pre", { children: JSON.stringify(frame, null, 2) }) }) }),
        dataMode === "replay" && replayFrames.length > 0 && /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "mt-4 bg-black/45 border border-white/10 rounded-xl p-4 flex flex-col gap-2 shadow-lg backdrop-blur-md", children: [
          /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "flex justify-between items-center text-xs text-white/50", children: [
            /* @__PURE__ */ jsxRuntimeExports$1.jsxs("span", { className: "font-mono", children: [
              "Time: ",
              (frame.timeMs / 1e3).toFixed(1),
              "s"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsxs("span", { className: "font-mono", children: [
              "Total: ",
              ((((_a = replayFrames[replayFrames.length - 1]) == null ? void 0 : _a.timeMs) ?? 0) / 1e3).toFixed(1),
              "s"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx(
            "input",
            {
              type: "range",
              min: 0,
              max: replayFrames.length - 1,
              value: replayIndex,
              onChange: (e) => {
                const idx = Number(e.target.value);
                setReplayIndex(idx);
                setFrame(replayFrames[idx]);
              },
              className: "w-full accent-blue-500 bg-zinc-750 h-1.5 rounded-lg appearance-none cursor-pointer"
            }
          )
        ] })
      ] }),
      (dataMode === "live" || dataMode === "replay") && /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "w-80 shrink-0 overflow-y-auto bg-black/40 border border-white/10 rounded-2xl p-5 flex flex-col gap-4 text-white shadow-lg backdrop-blur-md", children: [
        /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "flex flex-col gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("h3", { className: "text-md font-bold tracking-tight", children: "Backend Source Mode" }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "flex bg-white/5 rounded-lg p-1 border border-white/10 w-full mt-1", children: [
            /* @__PURE__ */ jsxRuntimeExports$1.jsx(
              "button",
              {
                onClick: () => setBackendSimulatorMode("udp"),
                className: `flex-1 py-1 rounded-md text-xs font-semibold transition text-center ${backendMode === "udp" ? "bg-blue-600/90 text-white shadow-sm shadow-black/40 cursor-pointer" : "text-white/60 hover:text-white cursor-pointer"}`,
                children: "UDP Stream"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports$1.jsx(
              "button",
              {
                onClick: () => setBackendSimulatorMode("simulator"),
                className: `flex-1 py-1 rounded-md text-xs font-semibold transition text-center ${backendMode === "simulator" ? "bg-purple-600/90 text-white shadow-sm shadow-black/40 cursor-pointer" : "text-white/60 hover:text-white cursor-pointer"}`,
                children: "Simulator"
              }
            )
          ] })
        ] }),
        backendMode === "simulator" && /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "flex flex-col gap-4 border-t border-white/5 pt-3 animate-fadeIn", children: [
          /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "flex flex-col items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("span", { className: "text-[10px] text-white/40 uppercase tracking-wider font-semibold", children: "Stick Control" }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "w-32 h-32 bg-zinc-950/80 border border-zinc-800 rounded-xl relative overflow-hidden flex items-center justify-center shadow-inner", children: [
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "absolute w-full h-[1px] bg-zinc-900" }),
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "absolute h-full w-[1px] bg-zinc-900" }),
              /* @__PURE__ */ jsxRuntimeExports$1.jsx(
                "div",
                {
                  className: "w-3.5 h-3.5 bg-red-500 rounded-full absolute transition-all duration-75 shadow-lg shadow-red-500/50",
                  style: {
                    left: `calc(50% + ${(frame.FCU_Roll_Left ?? 0) * 42}% - 7px)`,
                    top: `calc(50% + ${(frame.FCU_Pitch_Left ?? 0) * -42}% - 7px)`
                  }
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsxs("span", { className: "text-[10px] text-white/30 text-center font-mono", children: [
              "Roll: ",
              ((frame.FCU_Roll_Left ?? 0) * 100).toFixed(0),
              "% | Pitch: ",
              ((frame.FCU_Pitch_Left ?? 0) * 100).toFixed(0),
              "%"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "flex flex-col gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "flex justify-between text-[10px] text-white/50 font-mono font-semibold", children: [
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("span", { children: "Throttle (Shift/Ctrl)" }),
              /* @__PURE__ */ jsxRuntimeExports$1.jsxs("span", { children: [
                Math.round(frame.Engine_N1_Target_Left ?? 60),
                "%"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "w-full bg-zinc-900 h-2 rounded-full overflow-hidden border border-white/5", children: /* @__PURE__ */ jsxRuntimeExports$1.jsx(
              "div",
              {
                className: "bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full transition-all duration-75",
                style: { width: `${Math.max(0, Math.min(100, frame.Engine_N1_Target_Left ?? 60))}%` }
              }
            ) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "bg-white/[0.02] border border-white/5 rounded-xl p-3 text-[11px] text-white/50 flex flex-col gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "font-semibold text-white/70 mb-0.5", children: "Control Bindings:" }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("span", { children: "Pitch (Elevator):" }),
              " ",
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("kbd", { className: "bg-zinc-800 text-white/80 px-1 rounded font-semibold", children: "W / S" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("span", { children: "Roll (Aileron):" }),
              " ",
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("kbd", { className: "bg-zinc-800 text-white/80 px-1 rounded font-semibold", children: "A / D" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("span", { children: "Yaw (Rudder):" }),
              " ",
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("kbd", { className: "bg-zinc-800 text-white/80 px-1 rounded font-semibold", children: "Q / E" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("span", { children: "Thrust:" }),
              " ",
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("kbd", { className: "bg-zinc-800 text-white/80 px-1 rounded font-semibold", children: "Shift / Ctrl" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("span", { children: "Reset Simulation:" }),
              " ",
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("kbd", { className: "bg-zinc-800 text-white/80 px-1 rounded font-semibold", children: "Space / R" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsx(
              "button",
              {
                onClick: resetSimulation,
                className: "mt-2 w-full py-1.5 bg-zinc-850 hover:bg-zinc-800 text-white rounded-lg text-xs font-semibold transition border border-white/5 cursor-pointer",
                children: "Reset Plane"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "border-t border-white/10 pt-3.5 flex flex-col gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("span", { className: "text-xs font-bold uppercase tracking-wider text-white/60", children: "Scripted Profiles" }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsxs("span", { className: "text-[10px] text-white/35 font-mono", children: [
              simulatorProfiles.length,
              " tests"
            ] })
          ] }),
          activeProfileReplay && dataMode === "replay" && /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "rounded-xl border border-purple-500/20 bg-purple-500/10 p-3 flex flex-col gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "flex items-center justify-between text-[11px]", children: [
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("span", { className: "text-purple-200 font-semibold", children: "Profile Replay" }),
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("span", { className: "text-purple-200/60 font-mono", children: isPlaying ? "RUNNING" : replayIndex >= replayFrames.length - 1 ? "FINISHED" : "PAUSED" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "text-[10px] text-purple-100/60 font-mono truncate", title: activeProfileReplay.recordingId, children: [
              activeProfileReplay.profileId,
              " / ",
              activeProfileReplay.presetId
            ] }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "w-full h-1.5 rounded-full overflow-hidden bg-black/40 border border-white/5", children: /* @__PURE__ */ jsxRuntimeExports$1.jsx(
              "div",
              {
                className: "h-full bg-purple-400 transition-all duration-75",
                style: {
                  width: `${Math.min(100, Math.max(0, (replayIndex + 1) / Math.max(1, replayFrames.length || activeProfileReplay.frames) * 100))}%`
                }
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "flex justify-between text-[10px] text-purple-100/50 font-mono", children: [
              /* @__PURE__ */ jsxRuntimeExports$1.jsxs("span", { children: [
                "Frame ",
                replayIndex + 1
              ] }),
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("span", { children: replayFrames.length || activeProfileReplay.frames })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "text-[10px] text-purple-100/45 leading-snug", children: "`trim_hold_60s` специально почти неподвижен: это проверка удержания CAS/ALT/G." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx(
            "select",
            {
              value: selectedSimulatorProfileId,
              onChange: (e) => {
                setSelectedSimulatorProfileId(e.target.value);
                setProfileRunResult(null);
              },
              className: "w-full px-2.5 py-2 bg-zinc-950 border border-white/10 rounded-lg text-white text-xs font-mono outline-none focus:border-purple-500/60",
              children: simulatorProfiles.length === 0 ? /* @__PURE__ */ jsxRuntimeExports$1.jsx("option", { value: "trim_hold_60s", children: "trim_hold_60s" }) : simulatorProfiles.map((profile) => /* @__PURE__ */ jsxRuntimeExports$1.jsxs("option", { value: profile.id, children: [
                profile.id,
                " (",
                Math.round(profile.durationMs / 1e3),
                "s)"
              ] }, profile.id))
            }
          ),
          ((_b = simulatorProfiles.find((profile) => profile.id === selectedSimulatorProfileId)) == null ? void 0 : _b.description) && /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "text-[11px] text-white/45 leading-snug", children: (_c = simulatorProfiles.find((profile) => profile.id === selectedSimulatorProfileId)) == null ? void 0 : _c.description }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "flex flex-col gap-2 pt-1", children: [
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "text-[10px] text-white/40 uppercase tracking-wider font-bold", children: "Initial Conditions" }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsx(
              "select",
              {
                value: selectedSimulatorPresetId,
                onChange: (e) => {
                  setSelectedSimulatorPresetId(e.target.value);
                  setProfileRunResult(null);
                },
                className: "w-full px-2.5 py-2 bg-zinc-950 border border-white/10 rounded-lg text-white text-xs font-mono outline-none focus:border-purple-500/60",
                children: simulatorInitialPresets.length === 0 ? /* @__PURE__ */ jsxRuntimeExports$1.jsx("option", { value: "cruise_10000_250", children: "Cruise 250 kt / 10000 ft" }) : simulatorInitialPresets.map((preset) => /* @__PURE__ */ jsxRuntimeExports$1.jsx("option", { value: preset.id, children: preset.name }, preset.id))
              }
            ),
            simulatorInitialPresets.find((preset) => preset.id === selectedSimulatorPresetId) && /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "rounded-lg bg-white/[0.025] border border-white/5 p-2 text-[10px] font-mono text-white/50 grid grid-cols-2 gap-x-3 gap-y-1", children: [
              /* @__PURE__ */ jsxRuntimeExports$1.jsxs("span", { children: [
                "ALT ",
                (_d = simulatorInitialPresets.find((preset) => preset.id === selectedSimulatorPresetId)) == null ? void 0 : _d.config.altitudeFt,
                " ft"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports$1.jsxs("span", { children: [
                "CAS ",
                (_e = simulatorInitialPresets.find((preset) => preset.id === selectedSimulatorPresetId)) == null ? void 0 : _e.config.casKt,
                " kt"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports$1.jsxs("span", { children: [
                "THR ",
                Math.round((((_f = simulatorInitialPresets.find((preset) => preset.id === selectedSimulatorPresetId)) == null ? void 0 : _f.config.throttle) ?? 0) * 100),
                "%"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports$1.jsxs("span", { children: [
                "PITCH ",
                (_g = simulatorInitialPresets.find((preset) => preset.id === selectedSimulatorPresetId)) == null ? void 0 : _g.config.pitchDeg,
                " deg"
              ] })
            ] }),
            ((_h = simulatorInitialPresets.find((preset) => preset.id === selectedSimulatorPresetId)) == null ? void 0 : _h.description) && /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "text-[11px] text-white/35 leading-snug", children: (_i = simulatorInitialPresets.find((preset) => preset.id === selectedSimulatorPresetId)) == null ? void 0 : _i.description })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx(
            "button",
            {
              onClick: runSimulatorProfile,
              disabled: profileRunBusy,
              className: "w-full py-2 bg-purple-600/15 border border-purple-500/25 hover:bg-purple-600/25 disabled:opacity-50 disabled:hover:bg-purple-600/15 text-purple-300 rounded-lg text-xs font-semibold transition cursor-pointer disabled:cursor-not-allowed",
              children: profileRunBusy ? "Running profile..." : "Run Profile"
            }
          ),
          profileRunResult && /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: `rounded-lg border p-2 text-[10px] leading-snug font-mono ${profileRunResult.ok ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-300" : "border-red-500/20 bg-red-500/5 text-red-300"}`, children: profileRunResult.ok ? /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "flex flex-col gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { children: [
              "OK: ",
              profileRunResult.frames,
              " frames"
            ] }),
            profileRunResult.telemetryRecordingId && /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { children: [
              "REPLAY: ",
              profileRunResult.telemetryRecordingId
            ] }),
            profileRunResult.initialConfig && /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { children: [
              "INIT: ",
              profileRunResult.initialConfig.altitudeFt,
              "ft / ",
              profileRunResult.initialConfig.casKt,
              "kt / THR ",
              Math.round(profileRunResult.initialConfig.throttle * 100),
              "% / P ",
              profileRunResult.initialConfig.pitchDeg,
              "deg"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "truncate", title: profileRunResult.telemetryPath, children: [
              "TEL: ",
              profileRunResult.telemetryPath
            ] }),
            /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "truncate", title: profileRunResult.blackboxPath, children: [
              "BB: ",
              profileRunResult.blackboxPath
            ] })
          ] }) : /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { children: profileRunResult.error }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "border-t border-white/10 pt-3.5 flex flex-col gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports$1.jsx("span", { className: "text-xs font-bold uppercase tracking-wider text-white/60", children: "Flight Recording" }),
            isRecording && /* @__PURE__ */ jsxRuntimeExports$1.jsxs("span", { className: "flex items-center gap-1 text-[11px] text-red-400 font-semibold", children: [
              /* @__PURE__ */ jsxRuntimeExports$1.jsx("span", { className: "w-2 h-2 rounded-full bg-red-500 animate-ping" }),
              "REC (",
              recordingFrames,
              " f)"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "flex gap-2", children: !isRecording ? /* @__PURE__ */ jsxRuntimeExports$1.jsx(
            "button",
            {
              onClick: handleStartCapture,
              className: "flex-1 py-2 bg-red-600/10 border border-red-500/20 hover:bg-red-600/20 text-red-400 rounded-lg text-xs font-semibold transition text-center cursor-pointer",
              children: "Start Recording"
            }
          ) : /* @__PURE__ */ jsxRuntimeExports$1.jsx(
            "button",
            {
              onClick: handleStopCapture,
              className: "flex-1 py-2 bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-white rounded-lg text-xs font-semibold transition text-center cursor-pointer",
              children: "Stop Recording"
            }
          ) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "border-t border-white/10 pt-3.5 flex flex-col gap-2 min-h-0", children: [
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("span", { className: "text-[10px] text-white/40 uppercase tracking-wider font-bold", children: "Recent Recordings" }),
          /* @__PURE__ */ jsxRuntimeExports$1.jsx("div", { className: "flex flex-col gap-1.5 overflow-y-auto max-h-48 pr-0.5 scrollbar-thin scrollbar-thumb-zinc-800", children: recordings.length === 0 ? /* @__PURE__ */ jsxRuntimeExports$1.jsx("span", { className: "text-xs text-white/30 italic py-1", children: "No recordings yet" }) : recordings.slice(0, 5).map((rec) => /* @__PURE__ */ jsxRuntimeExports$1.jsxs(
            "button",
            {
              onClick: () => startReplay(rec.id),
              className: "text-left p-2 rounded bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition flex items-center justify-between text-xs group w-full cursor-pointer",
              children: [
                /* @__PURE__ */ jsxRuntimeExports$1.jsxs("div", { className: "truncate flex flex-col gap-0.5 max-w-[80%]", children: [
                  /* @__PURE__ */ jsxRuntimeExports$1.jsx("span", { className: "font-semibold text-white/80 group-hover:text-blue-400 transition truncate", children: rec.id }),
                  /* @__PURE__ */ jsxRuntimeExports$1.jsxs("span", { className: "text-[10px] text-white/40 font-mono", children: [
                    (rec.bytes / 1024).toFixed(1),
                    " KB"
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports$1.jsx(Play, { className: "w-3.5 h-3.5 text-white/40 group-hover:text-blue-400 transition flex-shrink-0" })
              ]
            },
            rec.id
          )) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports$1.jsx(LatencyOverlay, {})
  ] }) });
}
clientExports.createRoot(document.getElementById("root")).render(
  /* @__PURE__ */ jsxRuntimeExports$1.jsx(App, {})
);
requestAnimationFrame(() => {
  if (window.__bootStatus) {
    window.__bootStatus("app", "done", "App loaded");
  }
  if (window.__bootBridgeReady) {
    window.__bootBridgeReady();
  }
});
export {
  APP_VERSION as A,
  React as R,
  __vitePreload as _,
  Aircraft3DInstrument$2 as a,
  aircraftControlsRef as b,
  requireReact$1 as c,
  requireScheduler as d,
  getDefaultExportFromCjs as g,
  jsxRuntimeExports$1 as j,
  reactExports$1 as r,
  telemetryRef as t
};
