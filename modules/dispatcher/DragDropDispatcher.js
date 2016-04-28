'use strict';

var Dispatcher = require('flux').Dispatcher,
    assign = require('object-assign');

var DragDropDispatcher = assign(new Dispatcher(), {
  handleAction(action) {
    this.dispatch({
      action: action
    });
  }
});

module.exports = DragDropDispatcher;
