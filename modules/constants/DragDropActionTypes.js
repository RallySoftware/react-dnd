'use strict';

var keyMirror = require('fbjs/lib/keyMirror');

var DragDropActionTypes = keyMirror({
  DRAG_START: null,
  DRAG_END: null,
  DRAG: null,
  DROP: null
});

module.exports = DragDropActionTypes;
