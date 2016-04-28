"use strict";

var invariant = require("fbjs/lib/invariant"),
    noop = require("lodash/utility/noop");

var DefaultDragSource = {
  canDrag: function canDrag() {
    return true;
  },

  beginDrag: function beginDrag() {
    invariant(false, "Drag source must contain a method called beginDrag. See https://github.com/gaearon/react-dnd#drag-source-api");
  },

  endDrag: noop
};

module.exports = DefaultDragSource;