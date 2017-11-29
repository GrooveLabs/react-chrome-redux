'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
// Message type used for dispatch events
// from the Proxy Stores to background
var DISPATCH_TYPE = exports.DISPATCH_TYPE = 'chromex.dispatch';

// Message type for state update events from
// background to Proxy Stores
var STATE_TYPE = exports.STATE_TYPE = 'chromex.state';

// Message type for state patch events from
// background to Proxy Stores
var PATCH_STATE_TYPE = exports.PATCH_STATE_TYPE = 'chromex.patch_state';

// The `change` value for updated or inserted fields resulting from shallow diff
var DIFF_STATUS_UPDATED = exports.DIFF_STATUS_UPDATED = 'updated';

// The `change` value for removed fields resulting from shallow diff
var DIFF_STATUS_REMOVED = exports.DIFF_STATUS_REMOVED = 'removed';