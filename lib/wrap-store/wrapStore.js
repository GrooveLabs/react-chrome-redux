'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _constants = require('../constants');

var _shallowDiff = require('./shallowDiff');

var _shallowDiff2 = _interopRequireDefault(_shallowDiff);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Responder for promisified results
 * @param  {object} dispatchResult The result from `store.dispatch()`
 * @param  {function} send         The function used to respond to original message
 * @return {undefined}
 */
var promiseResponder = function promiseResponder(dispatchResult, send) {
  Promise.resolve(dispatchResult).then(function (res) {
    send({
      error: null,
      value: res
    });
  }).catch(function (err) {
    console.error('error dispatching result:', err);
    send({
      error: err.message,
      value: null
    });
  });
};

exports.default = function (store, _ref) {
  var portName = _ref.portName,
      dispatchResponder = _ref.dispatchResponder;

  if (!portName) {
    throw new Error('portName is required in options');
  }

  // set dispatch responder as promise responder
  if (!dispatchResponder) {
    dispatchResponder = promiseResponder;
  }

  /**
   * Respond to dispatches from UI components
   */
  var dispatchResponse = function dispatchResponse(request, sender, sendResponse) {
    if (request.type === _constants.DISPATCH_TYPE && request.portName === portName) {
      var action = Object.assign({}, request.payload, {
        _sender: sender
      });

      var dispatchResult = null;

      try {
        dispatchResult = store.dispatch(action);
      } catch (e) {
        dispatchResult = Promise.reject(e.message);
        console.error(e);
      }

      dispatchResponder(dispatchResult, sendResponse);
      return true;
    }
  };

  /**
  * Setup for state updates
  */
  var connectState = function connectState(port) {
    if (port.name !== portName) {
      return;
    }

    var prevState = store.getState();

    var patchState = function patchState() {
      var state = store.getState();
      var diff = (0, _shallowDiff2.default)(prevState, state);

      if (diff.length) {
        prevState = state;

        port.postMessage({
          type: _constants.PATCH_STATE_TYPE,
          payload: diff
        });
      }
    };

    // Send patched state down connected port on every redux store state change
    var unsubscribe = store.subscribe(patchState);

    // when the port disconnects, unsubscribe the sendState listener
    port.onDisconnect.addListener(unsubscribe);

    // Send store's initial state through port
    port.postMessage({
      type: _constants.STATE_TYPE,
      payload: prevState
    });
  };

  /**
   * Setup action handler
   */
  chrome.runtime.onMessage.addListener(dispatchResponse);

  /**
   * Setup external action handler
   */
  if (chrome.runtime.onMessageExternal) {
    chrome.runtime.onMessageExternal.addListener(dispatchResponse);
  } else {
    console.warn('runtime.onMessageExternal is not supported');
  }

  /**
   * Setup extended connection
   */
  chrome.runtime.onConnect.addListener(connectState);

  /**
   * Setup extended external connection
   */
  if (chrome.runtime.onConnectExternal) {
    chrome.runtime.onConnectExternal.addListener(connectState);
  } else {
    console.warn('runtime.onConnectExternal is not supported');
  }
};