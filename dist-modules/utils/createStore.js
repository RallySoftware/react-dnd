"use strict";

var EventEmitter = require("events").EventEmitter,
    assign = require("object-assign"),
    CHANGE_EVENT = "change";

function createStore(spec) {
  var store = assign({
    emitChange: function emitChange() {
      this.emit(CHANGE_EVENT);
    },

    addChangeListener: function addChangeListener(callback) {
      this.on(CHANGE_EVENT, callback);
    },

    removeChangeListener: function removeChangeListener(callback) {
      this.removeListener(CHANGE_EVENT, callback);
    }
  }, spec, EventEmitter.prototype);

  store.setMaxListeners(0);

  return store;
}

module.exports = createStore;