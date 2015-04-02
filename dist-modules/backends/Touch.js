"use strict";

var DragDropActionCreators = require("../actions/DragDropActionCreators"),
    DragOperationStore = require("../stores/DragOperationStore"),
    find = require("lodash/collection/find"),
    includes = require("lodash/collection/includes"),
    getElementRect = require("../utils/getElementRect");

var _currentComponent,
    _currentDragTarget,
    _currentDropTarget,
    _dropTargets = [];

function getDragItemTypes() {
  return [DragOperationStore.getDraggedItemType()];
}

function findDropTarget(coordinates) {
  return find(_dropTargets, function (target) {
    var rect = getElementRect(target.getDOMNode());

    if (!rect) {
      return false;
    }

    return coordinates.x >= rect.left && coordinates.x <= rect.left + rect.width && coordinates.y >= rect.top && coordinates.y <= rect.top + rect.height;
  });
}

function handleTouchMove(e) {
  var targetTouches = e.targetTouches;
  if (!targetTouches.length) {
    return;
  }

  var coordinates = getClientOffset(targetTouches[0]);

  DragDropActionCreators.drag(coordinates);

  var activeTarget = findDropTarget(coordinates);

  if (!_currentDropTarget && !activeTarget) {
    return;
  }

  var dragItemTypes = getDragItemTypes();
  if (activeTarget === _currentDropTarget) {
    _currentDropTarget.handleDragOver(dragItemTypes, e);
    return;
  }

  if (_currentDropTarget) {
    _currentDropTarget.handleDragLeave(dragItemTypes, e);
  }

  if (activeTarget) {
    activeTarget.handleDragEnter(dragItemTypes, e);
  }

  _currentDropTarget = activeTarget;
}

function handleTouchEnd(e) {
  if (_currentDropTarget) {
    _currentDropTarget.handleDrop(getDragItemTypes(), e);
  }

  var type = DragOperationStore.getDraggedItemType();
  _currentComponent.handleDragEnd(type, null);
}

function getClientOffset(e) {
  return {
    x: e.clientX,
    y: e.clientY
  };
}

var Touch = {
  setup: function setup() {},

  teardown: function teardown() {},

  beginDrag: function beginDrag(component, e, containerNode, dragPreview, dragAnchors, dragStartOffset, effectsAllowed) {
    _currentComponent = component;
    _currentDragTarget = component.getDOMNode();

    _currentDragTarget.addEventListener("touchmove", handleTouchMove);
    _currentDragTarget.addEventListener("touchend", handleTouchEnd);
  },

  endDrag: function endDrag() {
    _currentDragTarget.removeEventListener("touchmove", handleTouchMove);
    _currentDragTarget.removeEventListener("touchend", handleTouchEnd);

    _currentComponent = null;
    _currentDragTarget = null;
  },
  // Should this be used in the beginDrop????
  // beginDrag(component, e, containerNode, dragPreview, dragAnchors, dragStartOffset, effectsAllowed) {
  //   e.preventDefault();
  //   e.stopPropagation();
  //   _currentComponent = component;
  //   window.addEventListener('mousemove', handleTopMouseMove);
  //   window.addEventListener('mouseup', handleTopMouseUp);
  // },
  //
  // endDrag() {
  //   _currentComponent = null;
  //   window.removeEventListener('mousemove', handleTopMouseMove);
  //   window.removeEventListener('mouseup', handleTopMouseUp);
  // },

  dragOver: function dragOver(e, dropEffect) {},

  getDragSourceProps: function getDragSourceProps(component, type) {
    // TODO: optimize bind when we figure this out
    return {
      onTouchStart: component.handleDragStart.bind(component, type)
    };
  },

  getDropTargetProps: function getDropTargetProps(component, types) {
    if (!includes(_dropTargets, function (target) {
      return target._rootNodeID === component._rootNodeID;
    })) {
      _dropTargets.push(component);
    }

    return {};
  },

  getOffsetFromClient: function getOffsetFromClient(component, e) {
    e.preventDefault();
    return getClientOffset(e.targetTouches[0]);
  }
};

module.exports = Touch;